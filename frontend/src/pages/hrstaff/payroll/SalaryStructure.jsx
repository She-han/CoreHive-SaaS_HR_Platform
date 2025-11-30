import { useEffect, useState } from "react";
import axios from "axios";
import SalaryEditModal from "../../../components/payroll/SalaryEditModal";

const BASE = "http://localhost:8080/api";

export default function SalaryStructure() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null); // selected employee

  useEffect(() => {
    loadEmployees();
  }, []);

  // -----------------------------------------------------
  // LOAD EMPLOYEES + SALARY BREAKDOWN
  // -----------------------------------------------------
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

  // -----------------------------------------------------
  // UPDATE LOCAL FIELDS FOR THE SELECTED EMPLOYEE
  // -----------------------------------------------------
  const updateField = (field, value) => {
    setSelected((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  // -----------------------------------------------------
  // SAVE CHANGES
  // -----------------------------------------------------
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
    <div className="p-10 bg-[#F1FDF9] h-screen flex flex-col relative">

      {/* PAGE TITLE */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#333333]">Salary Structure</h1>
        <p className="text-[#9B9B9B] text-sm">Overview of employee salaries</p>
      </div>

      {/* TABLE VIEW */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-lg p-6 border border-[#E9F7F3]">
        <table className="w-full text-left">
          <thead className="bg-[#0C397A] text-white">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Designation</th>
              <th className="p-3">Basic</th>
              <th className="p-3">Allowances</th>
              <th className="p-3">Deductions</th>
              <th className="p-3">Net Salary</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((e) => (
              <tr
                key={e.id}
                className="border-b hover:bg-[#F1FDF9] cursor-pointer"
                onClick={() => setSelected(e)}
              >
                <td className="p-3">{e.employeeCode}</td>
                <td className="p-3">
                  {e.firstName} {e.lastName}
                </td>
                <td className="p-3">{e.designation}</td>
                <td className="p-3">{e.basicSalary}</td>
                <td className="p-3 text-[#02C39A]">{e.totalAllowances}</td>
                <td className="p-3 text-red-500">{e.totalDeductions}</td>
                <td className="p-3 font-bold">{e.netSalary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP MODAL COMPONENT */}
      <SalaryEditModal
        selected={selected}
        onClose={() => setSelected(null)}
        onChangeField={updateField}
        onSave={saveChanges}
      />
    </div>
  );
}
