import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function MonitorAttendance() {
  const [selectedDate, setSelectedDate] = useState("2025-11-10");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [weekData, setWeekData] = useState({}); // { empId: { name, dept, days:{ '2025-11-09':{...}, ... } } }

  // Get full week dates (Sun → Sat)
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  useEffect(() => {
    loadWeekAttendance();
  }, [selectedDate]);

  async function loadWeekAttendance() {
    setLoading(true);
    const map = {};

    // create structure
    weekDates.forEach(d => (map[d] = []));

    try {
      // fetch all 7 days
      const fetches = weekDates.map(d =>
        axios.get(`http://localhost:8080/api/attendance?date=${d}`)
          .then(res => ({ date: d, data: res.data.data || [] }))
      );

      const results = await Promise.all(fetches);

      // reorganize by employee
      const empMap = {};

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
          empMap[id].days[date] = row;
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

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Present Today" value="40" color="#02C39A" />
        <SummaryCard title="Late Entry" value="26" color="#05668D" />
        <SummaryCard title="On Leave" value="4" color="#1ED292" />
        <SummaryCard title="Absent" value="1" color="#0C397A" />
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
                    isToday={date === selectedDate}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --- DayCell Rules --- */
function DayCell({ dayRecord, date, isToday }) {
  const dateLabel = dateNumber(date);

  if (!dayRecord) {
    return (
      <div className="flex flex-col">
        <span className="text-xs text-[#9B9B9B]">{dateLabel}</span>
        <span className="text-xs text-[#9B9B9B]">-</span>
      </div>
    );
  }

  const status = dayRecord.status?.toUpperCase() || "ABSENT";
  const worked = dayRecord.workingMinutes > 0;

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
}

/* --- Status Colors --- */
function StatusBadge({ status }) {
  const base = "px-3 py-1 rounded-md text-sm font-medium inline-block";

  switch (status) {
    case "PRESENT":
      return <span className={`${base} bg-[#E6F9F2] text-[#02C39A]`}>Present</span>;
    case "LEAVE":
      return <span className={`${base} bg-purple-100 text-purple-600`}>Leave</span>;
    case "ABSENT":
      return <span className={`${base} bg-red-100 text-red-600`}>Absent</span>;
    case "HOLIDAY":
      return <span className={`${base} bg-gray-100 text-[#9B9B9B]`}>Holiday</span>;
    default:
      return <span className={`${base} bg-gray-200 text-[#333]`}>{status}</span>;
  }
}

/* --- Small Summary card --- */
function SummaryCard({ title, value, color }) {
  return (
    <div className="p-4 rounded-lg shadow text-white" style={{ backgroundColor: color }}>
      <p className="text-md font-medium">{title}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
  );
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

function dayName(iso) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short" });
}
function dateNumber(iso) {
  return new Date(iso).getDate();
}
function formatHours(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}
