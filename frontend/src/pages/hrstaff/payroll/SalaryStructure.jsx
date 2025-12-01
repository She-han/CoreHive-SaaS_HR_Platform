import { useEffect, useState } from "react";
import axios from "axios";
import SalaryEditModal from "../../../components/payroll/SalaryEditModal";
import formatAmount from "../../../components/FormatAmount";  

const BASE = "http://localhost:8080/api";

export default function SalaryStructure() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  // Load employees with salary breakdown
  const loadEmployees = async () => {
    try {
      const res = await axios.get(`${BASE}/employees`);
      const baseEmployees = res.data;

      const detailed = await Promise.all(
        baseEmployees.map(async (emp) => {
          const breakdown = await axios.get(
            `${BASE}/employees/${emp.id}/salary-breakdown`
          );

          const mapAllow = {};
          breakdown.data.allowances.forEach((a) => {
            mapAllow[a.type] = Number(a.amount);
          });

          const mapDed = {};
          breakdown.data.deductions.forEach((d) => {
            mapDed[d.type] = Number(d.amount);
          });

          const basic = Number(breakdown.data.basicSalary) || 0;

          const totalAllowances =
            (mapAllow.transport || 0) +
            (mapAllow.food || 0) +
            (mapAllow.medical || 0) +
            (mapAllow.housing || 0);

          const totalDeductions =
            (mapDed.epfEmployee || 0) +
            (mapDed.latePenalty || 0) +
            (mapDed.loan || 0) +
            (mapDed.tax || 0);

          return {
            ...emp,
            basicSalary: basic,
            transport: mapAllow.transport || 0,
            food: mapAllow.food || 0,
            medical: mapAllow.medical || 0,
            housing: mapAllow.housing || 0,
            epfEmployee: mapDed.epfEmployee || 0,
            latePenalty: mapDed.latePenalty || 0,
            loan: mapDed.loan || 0,
            tax: mapDed.tax || 0,
            totalAllowances,
            totalDeductions,
            netSalary: basic + totalAllowances - totalDeductions,
          };
        })
      );

      setEmployees(detailed);
    } catch (err) {
      console.error(err);
      alert("Failed to load salary information.");
    }
  };

  // Update model fields
  const updateField = (field, value) => {
    setSelected((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  // Save updated fields
  const saveChanges = async () => {
    try {
      await axios.patch(`${BASE}/employees/${selected.id}/salary-breakdown`, {
        basicSalary: selected.basicSalary,
        allowances: [
          { type: "transport", amount: selected.transport },
          { type: "food", amount: selected.food },
          { type: "medical", amount: selected.medical },
          { type: "housing", amount: selected.housing },
        ],
        deductions: [
          { type: "epfEmployee", amount: selected.epfEmployee },
          { type: "latePenalty", amount: selected.latePenalty },
          { type: "loan", amount: selected.loan },
          { type: "tax", amount: selected.tax },
        ],
      });

      alert("Salary updated!");
      setSelected(null);
      loadEmployees();
    } catch (err) {
      console.error(err);
      alert("Update failed.");
    }
  };

  return (
    <div className="w-full h-screen bg-white shadow-md flex flex-col p-8">

      {/* Page Header */}
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-[#333333]">Salary Structure</h1>
        <p className="text-[#9B9B9B] font-medium">Employee salary overview</p>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto border border-[#9B9B9B] rounded-lg shadow-sm bg-white">
        <table className="w-full text-left">
          <thead className="bg-[#0C397A] text-white sticky top-0">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Designation</th>
              <th className="p-3">Basic (Rs.)</th>
              <th className="p-3">Allowances (Rs.)</th>
              <th className="p-3">Deductions (Rs.)</th>
              <th className="p-3">Net Salary (Rs.)</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((e) => (
              <tr
                key={e.id}
                className="border-b hover:bg-[#F1FDF9] cursor-pointer transition"
                onClick={() => setSelected(e)}
              >
                <td className="p-3 text-[#333333]">{e.employeeCode}</td>
                <td className="p-3 text-[#333333]">
                  {e.firstName} {e.lastName}
                </td>
                <td className="p-3 text-[#333333]">{e.designation}</td>
                <td className="p-3 text-[#333333]">{formatAmount(e.basicSalary)}</td>

                <td className="p-3 font-semibold text-[#02C39A]">
                  {formatAmount(e.totalAllowances)}
                </td>

                <td className="p-3 font-semibold text-[#333333]">
                  {formatAmount(e.totalDeductions)}
                </td>

                <td className="p-3 font-bold text-[#05668D]">
                  {formatAmount(e.netSalary)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Salary Edit Modal */}
      <SalaryEditModal
        selected={selected}
        onClose={() => setSelected(null)}
        onChangeField={updateField}
        onSave={saveChanges}
      />
    </div>
  );
}
