import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPDF = (data, fileName = "Activity_Log") => {
  const doc = new jsPDF();

  // PDF Header Setup
  doc.setFontSize(18);
  doc.text("System Activity Audit Log", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, 30);

  // Table Structure
  const tableColumn = ["Timestamp", "User", "Action", "Resource", "Severity", "IP"];
  const tableRows = data.map(log => [
    new Date(log.timestamp).toLocaleString(),
    log.userEmail,
    log.action,
    log.resource,
    log.severity,
    log.ip
  ]);

  // Generate Table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [2, 195, 154] },
    styles: { fontSize: 8 },
  });

  doc.save(`${fileName}_${new Date().getTime()}.pdf`);
};