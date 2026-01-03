package com.corehive.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@Service
public class HrReportPdfService {

    /**
     * Generate Headcount PDF
     */
    public byte[] generateHeadcountPdf(Map<String, Object> report) {

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);

            document.open();

            // ===== Title =====
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            document.add(new Paragraph("Headcount Report", titleFont));
            document.add(new Paragraph(" "));

            // ===== Total Employees =====
            document.add(new Paragraph(
                    "Total Employees: " + report.get("totalEmployees")
            ));
            document.add(new Paragraph(" "));

            // ===== Department Table =====
            document.add(new Paragraph("By Department"));
            PdfPTable deptTable = new PdfPTable(2);
            deptTable.addCell("Department");
            deptTable.addCell("Count");

            List<Object[]> byDepartment =
                    (List<Object[]>) report.get("byDepartment");

            for (Object[] row : byDepartment) {
                deptTable.addCell(row[0].toString());
                deptTable.addCell(row[1].toString());
            }

            document.add(deptTable);
            document.close();

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed", e);
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
}
