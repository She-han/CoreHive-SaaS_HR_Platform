package com.corehive.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class HrReportPdfService {

    /**
     * Generate Headcount PDF
     */
    public byte[] generateHeadcountPdf(
            Map<String, Object> report,
            String organizationName
    ) {

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream(); //PDF content is written into RAM, not disk

            // Clean A4 layout with balanced margins
            Document document = new Document(PageSize.A4, 48, 48, 60, 60);
            PdfWriter writer = PdfWriter.getInstance(document, out); //connect document and the output

            // Footer (Confidential | Page X)
            writer.setPageEvent(new PdfFooter());

            document.open();

        /* =========================
           FONTS
           ========================= */
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Font metaFont = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.DARK_GRAY);
            Font sectionFont = new Font(Font.HELVETICA, 13, Font.BOLD);
            Font tableHeaderFont = new Font(Font.HELVETICA, 10, Font.BOLD);
            Font tableBodyFont = new Font(Font.HELVETICA, 10);

        /* =========================
           HEADER
           ========================= */
            Paragraph title = new Paragraph("HEADCOUNT REPORT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(8);
            document.add(title);

            Paragraph meta = new Paragraph(
                    "Organization: " + organizationName + "\n" +
                            "Generated on: " + LocalDate.now(),
                    metaFont
            );
            meta.setSpacingAfter(12);
            document.add(meta);

            document.add(new LineSeparator());
            document.add(Chunk.NEWLINE);

        /* =========================
           TOTAL EMPLOYEES
           ========================= */
            Paragraph total = new Paragraph(
                    "Total Employees: " + report.get("totalEmployees"),
                    sectionFont
            );
            total.setSpacingAfter(15);
            document.add(total);

        /* =========================
           DEPARTMENT TABLE
           ========================= */
            document.add(new Paragraph("Employees by Department", sectionFont));
            document.add(Chunk.NEWLINE);

            PdfPTable deptTable = createTable(tableHeaderFont, tableBodyFont);
            List<Object[]> byDepartment =
                    (List<Object[]>) report.get("byDepartment");

            for (Object[] row : byDepartment) {
                deptTable.addCell(createBodyCell(row[0].toString(), tableBodyFont));
                deptTable.addCell(createBodyCell(row[1].toString(), tableBodyFont));
            }

            document.add(deptTable);
            document.add(Chunk.NEWLINE);

        /* =========================
           DESIGNATION TABLE
           ========================= */
            document.add(new Paragraph("Employees by Designation", sectionFont));
            document.add(Chunk.NEWLINE);

            PdfPTable desigTable = createTable(tableHeaderFont, tableBodyFont);
            List<Object[]> byDesignation =
                    (List<Object[]>) report.get("byDesignation");

            for (Object[] row : byDesignation) {
                desigTable.addCell(createBodyCell(row[0].toString(), tableBodyFont));
                desigTable.addCell(createBodyCell(row[1].toString(), tableBodyFont));
            }

            document.add(desigTable);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Headcount PDF", e);
        }
    }


    /**
     * Generate Monthly HR Report PDF
     */
    public byte[] generateMonthlyPdf(Map<String, Object> report) {

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            document.add(new Paragraph("Monthly HR Report"));
            document.add(new Paragraph("New Hires: " + report.get("newHires")));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(2);
            table.addCell("Attendance Status");
            table.addCell("Count");

            List<Object[]> attendance =
                    (List<Object[]>) report.get("attendance");

            for (Object[] row : attendance) {
                table.addCell(row[0].toString());
                table.addCell(row[1].toString());
            }

            document.add(table);
            document.close();

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Monthly PDF generation failed", e);
        }
    }

    /**
     * Generate Annual Growth PDF
     */
    public byte[] generateAnnualPdf(Map<Integer, Long> report) {

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            document.add(new Paragraph("Annual Employee Growth Report"));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(2);
            table.addCell("Month");
            table.addCell("New Employees");

            report.forEach((month, count) -> {
                table.addCell(month.toString());
                table.addCell(count.toString());
            });

            document.add(table);
            document.close();

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Annual PDF generation failed", e);
        }
    }

    //Table Header Helper
    private PdfPTable createTable(Font headerFont, Font bodyFont) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingBefore(6);
        table.setSpacingAfter(12);
        table.setWidths(new float[]{3, 1});

        PdfPCell h1 = new PdfPCell(new Phrase("Category", headerFont));
        PdfPCell h2 = new PdfPCell(new Phrase("Count", headerFont));

        h1.setBackgroundColor(Color.LIGHT_GRAY);
        h2.setBackgroundColor(Color.LIGHT_GRAY);
        h1.setPadding(6);
        h2.setPadding(6);

        table.addCell(h1);
        table.addCell(h2);

        return table;
    }


    //Footer (Confidential | Page X)
    class PdfFooter extends PdfPageEventHelper {

        Font footerFont = new Font(Font.HELVETICA, 8, Font.ITALIC);

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            Phrase footer = new Phrase(
                    "Confidential | Page " + writer.getPageNumber(),
                    footerFont
            );

            ColumnText.showTextAligned(
                    cb,
                    Element.ALIGN_CENTER,
                    footer,
                    (document.right() - document.left()) / 2 + document.leftMargin(),
                    document.bottom() - 10,
                    0
            );
        }
    }

    //Helper Body Cell
    private PdfPCell createBodyCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(6);
        cell.setBorderColor(Color.GRAY);
        return cell;
    }



}
