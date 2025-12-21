import React, { useEffect, useState } from "react";
import { getCheckInList, manualCheckIn } from "../../api/manualAttendanceService";

const CheckInTab = ({ token }) => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);



  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await getCheckInList(token);
      setEmployees(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCheckIn = async (employeeId) => {
    try {
      await manualCheckIn(employeeId, token);
      alert("Check-in successful");
      fetchEmployees(); // refresh list
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Manual Check-In</h2>
      <input
        type="text"
        placeholder="Search employee..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? <p>Loading...</p> : (
        <table border="1" cellPadding="5" style={{ marginTop: "10px", width: "100%" }}>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Employee Code</th>
              <th>Status</th>
              <th>Check-in Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.employeeId}>
                <td>{emp.employeeName}</td>
                <td>{emp.employeeCode}</td>
                <td>{emp.status}</td>
                <td>{emp.checkInTime ? new Date(emp.checkInTime).toLocaleTimeString() : "-"}</td>
                <td>
                  {emp.status === "NOT_CHECKED_IN" ? (
                    <button onClick={() => handleCheckIn(emp.employeeId)}>Check In</button>
                  ) : (
                    <span>Checked In</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CheckInTab;
