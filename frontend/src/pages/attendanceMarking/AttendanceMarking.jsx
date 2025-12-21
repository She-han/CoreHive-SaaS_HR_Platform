import React, { useState } from "react";
import CheckInTab from "../manualAttendanceMarking/CheckInTab";
import CheckOutTab from "../manualAttendanceMarking/CheckOutTab";

const AttendanceMarking = () => {
  const [activeTab, setActiveTab] = useState("checkin");
  const token = localStorage.getItem("token"); // assuming token stored in localStorage

  return (
    <div style={{ padding: "20px" }}>
      <h1>Attendance System</h1>
      <div>
        <button onClick={() => setActiveTab("checkin")}>Check-In</button>
        <button onClick={() => setActiveTab("checkout")}>Check-Out</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {activeTab === "checkin" ? <CheckInTab token={token} /> : <CheckOutTab token={token} />}
      </div>
    </div>
  );
};

export default AttendanceMarking