import React from "react";

export default function SalaryEditModal({
  selected,
  onClose,
  onChangeField,
  onSave,
}) {
  if (!selected) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[95%] max-w-[550px] max-h-[90vh] rounded-2xl shadow-2xl border border-[#E9F7F3] overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="px-6 py-4 border-b bg-[#0C397A] text-white">
          <h2 className="text-xl font-semibold">
            {selected.firstName} {selected.lastName}
          </h2>
          <p className="text-sm opacity-80">{selected.designation}</p>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="px-6 py-4 overflow-y-auto">

          {/* BASIC SALARY */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-[#333]">Basic Salary</label>
            <input
              type="number"
              className="w-full mt-1 border p-2 rounded-lg focus:ring-2 focus:ring-[#02C39A] outline-none"
              value={selected.basicSalary}
              onChange={(e) => onChangeField("basicSalary", e.target.value)}
            />
          </div>

          {/* ALLOWANCES */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#333] mb-3 flex items-center gap-2">
              Allowances
              <span className="flex-1 h-[1px] bg-gray-300"></span>
            </h3>

            {[
              ["Transport", "transport"],
              ["Food", "food"],
              ["Medical", "medical"],
              ["Housing", "housing"],
            ].map(([label, field]) => (
              <div className="mb-4" key={field}>
                <label className="text-xs font-medium text-[#666]">{label}</label>
                <input
                  type="number"
                  className="w-full border mt-1 p-2 rounded-lg focus:ring-2 focus:ring-[#02C39A] outline-none"
                  value={selected[field]}
                  onChange={(e) => onChangeField(field, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* DEDUCTIONS */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#333] mb-3 flex items-center gap-2">
              Deductions
              <span className="flex-1 h-[1px] bg-gray-300"></span>
            </h3>

            {[
              ["EPF (Employee)", "epfEmployee"],
              ["Late Penalty", "latePenalty"],
              ["Loan", "loan"],
              ["Tax", "tax"],
            ].map(([label, field]) => (
              <div className="mb-4" key={field}>
                <label className="text-xs font-medium text-[#666]">{label}</label>
                <input
                  type="number"
                  className="w-full border mt-1 p-2 rounded-lg focus:ring-2 focus:ring-[#02C39A] outline-none"
                  value={selected[field]}
                  onChange={(e) => onChangeField(field, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="px-6 py-4 border-t bg-[#F1FDF9] flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition font-medium"
            onClick={onClose}
          >
            Close
          </button>

          <button
            className="px-5 py-2 rounded-lg bg-[#02C39A] text-white font-semibold hover:bg-[#1ED292] transition"
            onClick={onSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
