package com.corehive.backend.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.Map;

public class QrCodeUtil {
    /**
     * Generate QR as byte[] (PNG)
     */
    public static byte[] generateQrImage(String text, int width, int height) {
        try {
            // ----------------------------------------
            // Step 1: Define QR encoding configuration
            // ----------------------------------------

            // Hints control how QR code is generated
            Map<EncodeHintType, Object> hints = new HashMap<>();

            // High error correction level
            // QR can still be scanned even if partially damaged
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);

            // Reduce white border around QR
            hints.put(EncodeHintType.MARGIN, 6);

            // ----------------------------------------
            // Step 2: Encode text into QR BitMatrix
            // ----------------------------------------

            // MultiFormatWriter supports QR, BARCODE, etc.
            BitMatrix matrix = new MultiFormatWriter()
                    .encode(
                            text, //JWT token to encode
                            BarcodeFormat.QR_CODE, //QR format
                            width, //Image width
                            height, //image height
                            hints //configuration hints
                    );

            // ----------------------------------------
            // Step 3: Convert QR matrix to PNG image
            // ----------------------------------------

            // ByteArrayOutputStream stores image in memory
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            // Convert BitMatrix into PNG image and write to stream
            MatrixToImageWriter.writeToStream(matrix, "PNG", outputStream);

            // ----------------------------------------
            // Step 4: Return QR image as byte[]
            // ----------------------------------------
            return outputStream.toByteArray();

        } catch (Exception e) {
            // Any failure during QR generation is wrapped
            // into a runtime exception for global handling
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }
}
