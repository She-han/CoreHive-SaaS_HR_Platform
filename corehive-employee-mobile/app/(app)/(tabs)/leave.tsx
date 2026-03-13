import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/src/components/ui/AppScreen";
import { AppCard } from "@/src/components/ui/AppCard";
import { AppInput } from "@/src/components/ui/AppInput";
import { AppButton } from "@/src/components/ui/AppButton";
import { appTheme } from "@/src/theme/palette";
import { employeeApi } from "@/src/services/api/employee";
import type { EmployeeProfile, LeaveBalance, LeaveHistoryItem, LeaveType } from "@/src/types/models";

export default function LeaveTab() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [history, setHistory] = useState<LeaveHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const fetchAll = async () => {
    const p = await employeeApi.getCurrentProfile();
    setProfile(p);
    const [t, b, h] = await Promise.all([
      employeeApi.getLeaveTypes(),
      employeeApi.getLeaveBalances(),
      employeeApi.getLeaveRequests(p.id)
    ]);
    setTypes(t);
    setBalances(b);
    setHistory(h);
  };

  useEffect(() => {
    fetchAll().catch(() => Alert.alert("Error", "Failed to load leave data"));
  }, []);

  const requestedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return 0;
    return Math.floor((e.getTime() - s.getTime()) / 86400000) + 1;
  }, [startDate, endDate]);

  const submit = async () => {
    if (!profile?.id || !leaveTypeId || !startDate || !endDate || !reason.trim()) {
      Alert.alert("Validation", "Please fill all required fields.");
      return;
    }

    const selected = balances.find((b) => String(b.id) === leaveTypeId);
    if (selected && requestedDays > selected.balance) {
      Alert.alert("Insufficient Balance", `Requested ${requestedDays} days, available ${selected.balance}.`);
      return;
    }

    try {
      setLoading(true);
      await employeeApi.submitLeaveRequest({
        employeeId: profile.id,
        leaveTypeId: Number(leaveTypeId),
        startDate,
        endDate,
        reason: reason.trim()
      });
      Alert.alert("Success", "Leave request submitted.");
      setLeaveTypeId("");
      setStartDate("");
      setEndDate("");
      setReason("");
      await fetchAll();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to submit leave request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <Text style={styles.title}>Leave Request Portal</Text>

      <AppCard>
        <Text style={styles.section}>Leave Balances</Text>
        <View style={styles.balanceGrid}>
          {balances.map((b) => (
            <View key={b.id} style={styles.balanceCard}>
              <Text style={styles.balanceName}>{b.name}</Text>
              <Text style={styles.balanceValue}>Balance: {b.balance}</Text>
              <Text style={styles.balanceMeta}>Assigned {b.assigned} | Used {b.used}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.section}>Apply Leave</Text>
        <AppInput
          label="Leave Type ID"
          value={leaveTypeId}
          onChangeText={setLeaveTypeId}
          placeholder={types.length ? `e.g. ${types[0].id} (${types[0].name})` : "Type ID"}
          keyboardType="number-pad"
        />
        <AppInput label="Start Date (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} />
        <AppInput label="End Date (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} />
        <AppInput label="Reason" value={reason} onChangeText={setReason} multiline numberOfLines={3} />
        {!!requestedDays && <Text style={styles.requestDays}>Requested Days: {requestedDays}</Text>}
        <AppButton title="Submit Leave Request" loading={loading} onPress={submit} />
      </AppCard>

      <AppCard>
        <Text style={styles.section}>History</Text>
        <FlatList
          data={history}
          keyExtractor={(_, idx) => String(idx)}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <View style={styles.historyRow}>
              <View>
                <Text style={styles.historyType}>{item.leaveTypeName}</Text>
                <Text style={styles.historyDate}>{item.startDate} - {item.endDate}</Text>
              </View>
              <Text style={styles.badge}>{item.status}</Text>
            </View>
          )}
        />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800", color: appTheme.colors.navy },
  section: { fontSize: 17, fontWeight: "700", color: appTheme.colors.text, marginBottom: 12 },
  balanceGrid: { gap: 10 },
  balanceCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.background
  },
  balanceName: { fontWeight: "700", color: appTheme.colors.text },
  balanceValue: { color: appTheme.colors.primary, fontWeight: "700", marginTop: 2 },
  balanceMeta: { color: appTheme.colors.mutedText, fontSize: 12, marginTop: 2 },
  requestDays: { color: appTheme.colors.secondary, fontWeight: "600", marginBottom: 8 },
  historyRow: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: appTheme.colors.background,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  historyType: { color: appTheme.colors.text, fontWeight: "700" },
  historyDate: { color: appTheme.colors.mutedText, fontSize: 12, marginTop: 2 },
  badge: {
    color: appTheme.colors.secondary,
    fontWeight: "700",
    fontSize: 12
  }
});
