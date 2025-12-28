package com.corehive.backend.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Slf4j
public class AzureBlobStorageService {

    @Value("${azure.storage.connection-string:}")
    private String connectionString;

    @Value("${azure.storage.container.business-documents:business-documents}")
    private String businessDocsContainer;

    @Value("${azure.storage.account-name:corehivestorage}")
    private String accountName;

    @Value("${storage.mode:local}")
    private String storageMode;

    private BlobServiceClient blobServiceClient;
    private BlobContainerClient containerClient;

    private boolean azureEnabled = false;

    @PostConstruct
    public void init() {
        if ("azure".equalsIgnoreCase(storageMode) && connectionString != null && !connectionString.isEmpty()) {
            try {
                blobServiceClient = new BlobServiceClientBuilder()
                        .connectionString(connectionString)
                        .buildClient();

                containerClient = blobServiceClient.getBlobContainerClient(businessDocsContainer);

                // Create container if not exists
                if (!containerClient.exists()) {
                    containerClient.create();
                    log.info("Created Azure container: {}", businessDocsContainer);
                }

                azureEnabled = true;
                log.info("✅ Azure Blob Storage initialized for business documents");
            } catch (Exception e) {
                log.error("❌ Failed to initialize Azure Blob Storage: {}", e.getMessage());
                azureEnabled = false;
            }
        } else {
            log.info("📁 Using local file storage (storage.mode=local or Azure not configured)");
        }
    }

    public boolean isAzureEnabled() {
        return azureEnabled;
    }

    /**
     * Upload business registration document to Azure Blob Storage
     * @return Full blob URL with SAS token for download
     */
    public String uploadBusinessDocument(MultipartFile file, String organizationUuid) throws IOException {
        if (!azureEnabled) {
            throw new IllegalStateException("Azure Blob Storage is not enabled");
        }

        // Generate unique blob name
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String blobName = String.format("business-registrations/%s/%s%s",
                organizationUuid,
                UUID.randomUUID().toString(),
                extension);

        log.info("Uploading to Azure Blob: {}", blobName);

        BlobClient blobClient = containerClient.getBlobClient(blobName);

        // Set content type based on file type
        BlobHttpHeaders headers = new BlobHttpHeaders()
                .setContentType(file.getContentType());

        // Upload file
        blobClient.upload(new ByteArrayInputStream(file.getBytes()), file.getSize(), true);
        blobClient.setHttpHeaders(headers);

        // Generate blob URL (without SAS - we'll generate SAS when needed for download)
        String blobUrl = blobClient.getBlobUrl();

        log.info("✅ Business document uploaded to Azure: {}", blobUrl);

        return blobUrl;
    }

    /**
     * Generate SAS URL for downloading (valid for specified hours)
     */
    public String generateDownloadUrl(String blobUrl, int validHours) {
        if (!azureEnabled) {
            return blobUrl; // Return as-is for local storage
        }

        try {
            // Extract blob name from URL
            String blobName = extractBlobNameFromUrl(blobUrl);
            BlobClient blobClient = containerClient.getBlobClient(blobName);

            // Generate SAS token
            BlobSasPermission permission = new BlobSasPermission().setReadPermission(true);
            OffsetDateTime expiryTime = OffsetDateTime.now().plusHours(validHours);

            BlobServiceSasSignatureValues sasValues = new BlobServiceSasSignatureValues(expiryTime, permission);

            String sasToken = blobClient.generateSas(sasValues);

            return blobUrl + "?" + sasToken;
        } catch (Exception e) {
            log.error("Failed to generate SAS URL: {}", e.getMessage());
            return blobUrl;
        }
    }

    /**
     * Delete blob from Azure
     */
    public boolean deleteBlob(String blobUrl) {
        if (!azureEnabled) {
            return false;
        }

        try {
            String blobName = extractBlobNameFromUrl(blobUrl);
            BlobClient blobClient = containerClient.getBlobClient(blobName);
            blobClient.delete();
            log.info("✅ Blob deleted: {}", blobName);
            return true;
        } catch (Exception e) {
            log.error("Failed to delete blob: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if blob exists
     */
    public boolean blobExists(String blobUrl) {
        if (!azureEnabled) {
            return false;
        }

        try {
            String blobName = extractBlobNameFromUrl(blobUrl);
            BlobClient blobClient = containerClient.getBlobClient(blobName);
            return blobClient.exists();
        } catch (Exception e) {
            return false;
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private String extractBlobNameFromUrl(String blobUrl) {
        // URL format: https://account.blob.core.windows.net/container/blob/path
        // Extract everything after container name
        String containerPath = String.format("https://%s.blob.core.windows.net/%s/",
                accountName, businessDocsContainer);

        if (blobUrl.startsWith(containerPath)) {
            return blobUrl.substring(containerPath.length()).split("\\?")[0]; // Remove SAS if present
        }

        // Fallback: just return the last part
        return blobUrl.substring(blobUrl.lastIndexOf("/") + 1).split("\\?")[0];
    }
}