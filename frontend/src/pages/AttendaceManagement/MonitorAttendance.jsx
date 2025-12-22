import { useEffect, useMemo, useState } from "react";
import AttendancePopup  from "../../components/hrstaff/attendanceManagement/AttendancePopup";
import SummaryCard from "../../components/hrstaff/attendanceManagement/SummaryCard"
import {
  getAttendanceSummary,
  getAttendanceByDate
} from "../../api/monitorAttendanceApi";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";


export default function MonitorAttendance() {

const user = useSelector(selectUser);
const token = user?.token;

//   👉 මේක තෝරාගත් දිනය save කරලා තියෙන්නේ.
// 👉 ඔයාට date picker එකෙන් date වෙනුවෙනුත් change කරන්න පුළුවන්.

    const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);

  const [summary, setSummary] = useState({
        PRESENT: 0,
        ABSENT: 0,
        LATE: 0,
        HALF_DAY: 0,
        ON_LEAVE: 0,
        WORK_FROM_HOME: 0
});



   // Search bar text
  const [search, setSearch] = useState("");

  //when data loading display loading message
  const [loading, setLoading] = useState(false);

   /**
   * weekData structure:
   * {
   *   1: { employeeId:1, name:"John", dept:"IT", days:{ "2025-11-10":{...}, "2025-11-11": {...} } },
   *   2: { employeeId:2, ... }
   * }
   */
  const [weekData, setWeekData] = useState({}); 

  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState(null);


  // Get full week dates (Sun → Sat) of selectedDate
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  useEffect(() => {
  loadWeekAttendance();     // Load 7-day grid
  loadTodaySummary();       // Load summary cards (Present, Late, Leave, Absent)
}, [selectedDate]);

    async function loadTodaySummary() {
  try {
    const data = await getAttendanceSummary(selectedDate, token);
    console.log("SUMMARY API DATA:", data); // 👈 ADD THIS
    setSummary(data);
  } catch (err) {
    console.error(err);
  }
}


   /* ---------------------------------------------------------
        Load Attendance for full week
     - Calls backend 7 times: one for each day
     - Combines all results into a weekly structure per employee
  --------------------------------------------------------- */

  async function loadWeekAttendance() {
    setLoading(true);
    const map = {};

    // It loops through each date and creates an empty array for that date inside the object.
    weekDates.forEach(d => (map[d] = []));

//     {
//   date: "2025-11-10",
//   data: [list of employees for that day]
// }

// If backend sends nothing → you put empty array [].

    try {
      // fetch all 7 days
      const fetches = weekDates.map(async (d) => ({
  date: d,
  data: await getAttendanceByDate(d, token)
}));


      const results = await Promise.all(fetches);

      //Promise.all(fetches) runs all 7 API calls together (not one by one)
      //await pauses code until all 7 calls are finished

      // reorganize by employee
      const empMap = {};

//   Loops through 7 days
//  Loops through all employees in each day
//  Groups employees together
//  Adds each day's attendance under the correct date


// this date = that date
// data =  employee attendance list of that date
      results.forEach(({ date, data }) => {
        data.forEach(row => {
          const id = row.employeeId;
          if (!empMap[id]) {
            empMap[id] = {
              employeeId: id,
              name: row.name,
              dept: row.dept,
              days: {}
            };
          }
          empMap[id].days[date] = row; //add result of that day to employee days object 
        });
      });

      // Fill missing days with null
      Object.values(empMap).forEach(emp => {
        weekDates.forEach(d => {
          if (!emp.days[d]) emp.days[d] = null;
        });
      });

      setWeekData(empMap);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  const employees = Object.values(weekData).filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleCellClick(record, date) {
  const popup = {
    date,
    checkIn: record.checkIn || "N/A",
    checkOut: record.checkOut || "N/A",
    worked: record.workingMinutes
      ? formatHours(record.workingMinutes)
      : "0h 0m",
    status: record.status,
    lateMinutes: record.lateMinutes ?? 0
  };

  setPopupData(popup);
  setShowPopup(true);
}


  return (
    <div className="flex flex-col gap-6 p-6 h-screen overflow-hidden">

      {/* SUMMARY CARDS */}
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
  <SummaryCard title="Present Today" value={summary.PRESENT} statusKey="PRESENT" />
  <SummaryCard title="Absent" value={summary.ABSENT} statusKey="ABSENT" />
  <SummaryCard title="Late Entry" value={summary.LATE} statusKey="LATE" />
  <SummaryCard title="Half Day" value={summary.HALF_DAY} statusKey="HALF_DAY" />
  <SummaryCard title="On Leave" value={summary.ON_LEAVE} statusKey="ON_LEAVE" />
  <SummaryCard title="WFH" value={summary.WORK_FROM_HOME} statusKey="WORK_FROM_HOME" />
</div>

      {/* SEARCH + FILTERS */}
      <div className="flex justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-[#9B9B9B] rounded-lg p-2 text-sm w-1/3"
        />

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-[#9B9B9B] rounded-lg p-2 text-sm"
        />
      </div>

      {/* SCROLLABLE TABLE */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        
        {/* FIXED HEADER */}
        <div className="bg-[#F1FDF9] border-b border-gray-200">
          <div className="grid grid-cols-[250px_repeat(7,1fr)]">
            <div className="p-3 font-medium">Employee</div>
            {weekDates.map(date => (
              <div key={date} className="p-3">
                <div className="text-sm font-medium">{dayName(date)}</div>
                {/* <div className="text-xs text-[#9B9B9B]">{dateNumber(date)}</div> */}
              </div>
            ))}
          </div>
        </div>

        {/* BODY (scrollable only) */}
        <div className="max-h-[500px] overflow-y-auto">


          {loading && (
            <div className="p-6 text-center text-sm text-[#9B9B9B]">Loading...</div>
          )}

          {!loading && employees.length === 0 && (
            <div className="p-6 text-center text-sm text-[#9B9B9B]">No data</div>
          )}

          {!loading && employees.map(emp => (
            <div
              key={emp.employeeId}
              className="grid grid-cols-[250px_repeat(7,1fr)] border-b border-gray-100 p-3"
            >
              {/* Employee Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#02C39A] text-white rounded-full flex items-center justify-center">
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{emp.name}</div>
                  <div className="text-xs text-[#9B9B9B]">{emp.dept}</div>
                </div>
              </div>

              {/* 7 day cells */}
             {weekDates.map(date => (
                <div key={date} className="p-2">
                    <DayCell
                    dayRecord={emp.days[date]}
                    date={date}
                    isToday={date === today}  // ← REAL TODAY ONLY
                    onClick={handleCellClick}
                    />
                </div>
                ))}
            </div>
          ))}
        </div>
      </div>

       {/* ==== POPUP CARD HERE ==== */}
      {showPopup && (
        <AttendancePopup
          data={popupData}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}


 {/* 
             If TODAY → show:
            ✔ date
            ✔ status badge (Present / Absent / Leave)

            If worked that day
            ✔ date
            ✔ working hours box ("8h 20m")

             If absent/leave
            ✔ date
            ✔ status badge */}

{/* --- DayCell Rules --- */}
function DayCell({ dayRecord, date, isToday, onClick }) {
  const dateLabel = dateNumber(date);

  return (
    <div
      onClick={() => dayRecord && onClick(dayRecord, date)}
      className="cursor-pointer"
    >
      {/* NO DATA (empty cell) */}
      {!dayRecord && (
        <div className="flex flex-col">
          <span className="text-xs text-[#9B9B9B]">{dateLabel}</span>
          <span className="text-xs text-[#9B9B9B]">-</span>
        </div>
      )}

      {/* IF RECORD EXISTS */}
      {dayRecord && (() => {
       const status = dayRecord.status?.toUpperCase();
      const worked = status === "PRESENT" || status === "LATE";


        if (isToday) {
          return (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#9B9B9B]">{dateLabel}</span>
              <StatusBadge status={status} />
            </div>
          );
        }

        if (worked) {
          return (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#9B9B9B]">{dateLabel}</span>
              <div className="bg-[#E6F9F2] text-[#02C39A] px-3 py-1 rounded-md text-sm">
                {formatHours(dayRecord.workingMinutes)}
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#9B9B9B]">{dateLabel}</span>
            <StatusBadge status={status} />
          </div>
        );
      })()}

    </div>
  );
}


/* --- Status Colors --- */
function StatusBadge({ status }) {
  const base = "px-3 py-1 rounded-md text-sm font-medium inline-block";

  switch (status) {
  case "PRESENT":
    // Soft Mint / Emerald
    return <span className={`${base} bg-[#ECFDF5] text-[#059669]`}>Present</span>;
  
  case "LEAVE":
  case "ONLEAVE":
    // Soft Indigo / Lavender
    return <span className={`${base} bg-[#EEF2FF] text-[#4F46E5]`}>Leave</span>;
  
  case "ABSENT":
    // Soft Rose / Pink
    return <span className={`${base} bg-[#FFF1F2] text-[#E11D48]`}>Absent</span>;
  
  case "LATE":
    // Soft Amber / Gold
    return <span className={`${base} bg-[#FFFBEB] text-[#D97706]`}>Late</span>;
  
  case "WORK_FROM_HOME":
    // Soft Sky Blue
    return <span className={`${base} bg-[#F0F9FF] text-[#0284C7]`}>WFH</span>;
  
  default:
    // Soft Slate Gray
    return <span className={`${base} bg-[#F8FAFC] text-[#475569]`}>{status}</span>;
}
}

/* --- Utility Functions --- */
function getWeekDates(iso) {
  const date = new Date(iso);
  const day = date.getDay();
  const sunday = new Date(iso);
  sunday.setDate(date.getDate() - day);

  return [...Array(7).keys()].map(i => {
    let d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

//convert iso date to day name
function dayName(iso) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short" });
}

//get date number from iso date "2025-11-10" → 10
function dateNumber(iso) {
  return new Date(iso).getDate();
}

//convert minutes to "Xh Ym" format
function formatHours(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}
