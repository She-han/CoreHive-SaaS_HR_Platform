import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/src/components/ui/AppScreen";
import { AppCard } from "@/src/components/ui/AppCard";
import { AppButton } from "@/src/components/ui/AppButton";
import { appTheme } from "@/src/theme/palette";
import { employeeApi } from "@/src/services/api/employee";
import type { AttendanceHistoryItem, AttendanceToday } from "@/src/types/models";

export default function AttendanceTab() {
  const [today, setToday] = useState<AttendanceToday | null>(null);
  const [history, setHistory] = useState<AttendanceHistoryItem[]>([]);
  const [monthDate, setMonthDate] = useState(new Date());

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const loadData = useCallback(async (targetDate: Date) => {
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth();
    const start = formatDate(new Date(y, m, 1));
    const end = formatDate(new Date(y, m + 1, 0));

    const [t, h] = await Promise.all([
      employeeApi.getTodayAttendance(),
      employeeApi.getAttendanceHistory(start, end)
    ]);
    setToday(t);
    setHistory(h);
  }, []);

  useEffect(() => {
    loadData(monthDate).catch(() => undefined);
  }, [monthDate, loadData]);

  const summary = useMemo(() => {
    const s = { present: 0, absent: 0, leave: 0, late: 0, halfDay: 0 };
    history.forEach((h) => {
      if (h.status === "PRESENT") s.present += 1;
      else if (h.status === "ABSENT") s.absent += 1;
      else if (h.status === "ON_LEAVE") s.leave += 1;
      else if (h.status === "LATE") s.late += 1;
      else if (h.status === "HALF_DAY") s.halfDay += 1;
    });
    return s;
  }, [history]);

  const monthLabel = monthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  return (
    <AppScreen>
      <Text style={styles.title}>Attendance Dashboard</Text>

      <AppCard>
        <Text style={styles.section}>Today</Text>
        <View style={styles.row}><Text style={styles.label}>Status</Text><Text style={styles.value}>{today?.status || "ABSENT"}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Check In</Text><Text style={styles.value}>{today?.checkInTime || "--"}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Check Out</Text><Text style={styles.value}>{today?.checkOutTime || "--"}</Text></View>
      </AppCard>

      <AppCard>
        <Text style={styles.section}>{monthLabel} Summary</Text>
        <View style={styles.summaryGrid}>
          <Badge label="Present" value={summary.present} />
          <Badge label="Absent" value={summary.absent} />
          <Badge label="Leave" value={summary.leave} />
          <Badge label="Late" value={summary.late} />
        </View>
        <View style={styles.monthNav}>
          <AppButton title="Prev" variant="ghost" onPress={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))} />
          <AppButton title="Current" variant="secondary" onPress={() => setMonthDate(new Date())} />
          <AppButton title="Next" variant="ghost" onPress={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))} />
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.section}>History ({history.length})</Text>
        {history.slice(0, 20).map((h, idx) => (
          <View key={`${h.date}-${idx}`} style={styles.historyRow}>
            <View>
              <Text style={styles.historyDate}>{h.date}</Text>
              <Text style={styles.historyTime}>{h.checkIn || "--"} to {h.checkOut || "--"}</Text>
            </View>
            <Text style={styles.status}>{h.status}</Text>
          </View>
        ))}
      </AppCard>
    </AppScreen>
  );
}

function Badge({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.badgeBox}>
      <Text style={styles.badgeLabel}>{label}</Text>
      <Text style={styles.badgeValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800", color: appTheme.colors.navy },
  section: { fontSize: 17, fontWeight: "700", color: appTheme.colors.text, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: appTheme.colors.mutedText },
  value: { color: appTheme.colors.text, fontWeight: "700" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeBox: {
    width: "48%",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: appTheme.colors.background
  },
  badgeLabel: { color: appTheme.colors.mutedText, fontSize: 12 },
  badgeValue: { color: appTheme.colors.secondary, fontWeight: "800", fontSize: 18, marginTop: 4 },
  monthNav: { flexDirection: "row", gap: 8, marginTop: 14 },
  historyRow: {
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  historyDate: { color: appTheme.colors.text, fontWeight: "600" },
  historyTime: { color: appTheme.colors.mutedText, fontSize: 12, marginTop: 2 },
  status: { color: appTheme.colors.primary, fontWeight: "700", fontSize: 12 }
});
