import React, { useEffect, useState } from "react";
import { getPendingCheckouts, manualCheckOut } from "../../api/manualAttendanceService";

const CheckOutTab = ({ token }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await getPendingCheckouts(token);
      setEmployees(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleCheckOut = async (employeeId) => {
    try {
      await manualCheckOut(employeeId, token);
      alert("Check-out successful");
      fetchPending(); // refresh list
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2>Manual Check-Out</h2>
      {loading ? <p>Loading...</p> : (
        <table border="1" cellPadding="5" style={{ marginTop: "10px", width: "100%" }}>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Employee Code</th>
              <th>Check-in Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.employeeId}>
                <td>{emp.employeeName}</td>
                <td>{emp.employeeCode}</td>
                <td>{emp.checkInTime ? new Date(emp.checkInTime).toLocaleTimeString() : "-"}</td>
                <td>
                  <button onClick={() => handleCheckOut(emp.employeeId)}>Check Out</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CheckOutTab;
