import { FileSpreadsheet } from "lucide-react";
import { downloadEmployeeDetailsExcel } from "../../../api/HrReportsApi";

export default function EmployeeDetailsReport() {
  const handleDownload = async () => {
    try {
      const blob = await downloadEmployeeDetailsExcel();

      const url = window.URL.createObjectURL(
        new Blob([blob], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        })
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        "employee-master-report.xlsx"
      );

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 flex flex-col items-center text-center space-y-6">
        <div className="p-4 bg-[#F1FDF9] rounded-full">
          <FileSpreadsheet size={40} className="text-[#02C39A]" />
        </div>

        <h2 className="text-2xl font-black text-[#0C397A]">
          Employee Master Report
        </h2>

        <p className="text-[#9B9B9B] max-w-md">
          Download a complete Excel sheet containing employee details,
          departments, salary information, and employment status for
          your organization.
        </p>

        <button
          onClick={handleDownload}
          className="bg-[#02C39A] hover:bg-[#1ED292] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
        >
          Download Excel
        </button>
      </div>
    </div>
  );
}
