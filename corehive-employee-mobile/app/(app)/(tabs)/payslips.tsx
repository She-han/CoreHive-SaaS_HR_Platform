import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import { AppScreen } from "@/src/components/ui/AppScreen";
import { AppCard } from "@/src/components/ui/AppCard";
import { AppButton } from "@/src/components/ui/AppButton";
import { appTheme } from "@/src/theme/palette";
import { employeeApi } from "@/src/services/api/employee";
import { storage } from "@/src/services/storage";
import type { Payslip } from "@/src/types/models";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Constants.expoConfig?.extra?.apiBaseUrl ||
  "http://localhost:8080/api";

export default function PayslipsTab() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selected, setSelected] = useState<Payslip | null>(null);

  useEffect(() => {
    employeeApi.getEmployeePayslips().then((items) => {
      const sorted = [...items].sort((a, b) => (b.year - a.year) || (b.month - a.month));
      setPayslips(sorted);
      setSelected(sorted[0] || null);
    }).catch(() => Alert.alert("Error", "Failed to load payslips"));
  }, []);

  const summary = useMemo(() => selected ? {
    basic: selected.basicSalary || 0,
    allowances: selected.totalAllowances || 0,
    deductions: selected.totalDeductions || 0,
    net: selected.netSalary || 0
  } : { basic: 0, allowances: 0, deductions: 0, net: 0 }, [selected]);

  const downloadPdf = async (item: Payslip) => {
    try {
      const token = await storage.getToken();
      if (!token) {
        Alert.alert("Session", "Please login again.");
        return;
      }

      const name = `payslip-${item.year}-${item.month}.pdf`;
      const uri = `${FileSystem.cacheDirectory}${name}`;
      const download = await FileSystem.downloadAsync(
        `${API_BASE_URL}/employee/payslips/${item.id}/pdf`,
        uri,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!download?.uri) {
        throw new Error("Download failed");
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(download.uri);
      } else {
        Alert.alert("Saved", `File saved to ${download.uri}`);
      }
    } catch {
      Alert.alert("Error", "Failed to download payslip PDF");
    }
  };

  return (
    <AppScreen>
      <Text style={styles.title}>Payslips</Text>

      <AppCard>
        <Text style={styles.section}>Latest Salary Summary</Text>
        <Text style={styles.period}>{selected ? `${months[selected.month - 1]} ${selected.year}` : "No payslip"}</Text>
        <View style={styles.summaryGrid}>
          <Metric label="Basic" value={summary.basic} />
          <Metric label="Allowances" value={summary.allowances} />
          <Metric label="Deductions" value={summary.deductions} />
          <Metric label="Net" value={summary.net} highlight />
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.section}>Approved Payslips</Text>
        {payslips.map((p) => (
          <View key={p.id} style={styles.payslipRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{months[p.month - 1]} {p.year}</Text>
              <Text style={styles.rowSub}>Net: LKR {Number(p.netSalary || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.actionRow}>
              <AppButton title="View" variant="ghost" onPress={() => setSelected(p)} />
              <AppButton title="PDF" variant="secondary" onPress={() => downloadPdf(p)} />
            </View>
          </View>
        ))}
      </AppCard>
    </AppScreen>
  );
}

function Metric({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <View style={[styles.metric, highlight && { borderColor: appTheme.colors.primary, backgroundColor: "#ECFDF5" }] }>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, highlight && { color: appTheme.colors.primary }]}>LKR {value.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800", color: appTheme.colors.navy },
  section: { fontSize: 17, fontWeight: "700", color: appTheme.colors.text, marginBottom: 10 },
  period: { color: appTheme.colors.mutedText, marginBottom: 12 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: {
    width: "48%",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: appTheme.colors.background
  },
  metricLabel: { color: appTheme.colors.mutedText, fontSize: 12 },
  metricValue: { color: appTheme.colors.text, fontWeight: "800", marginTop: 4 },
  payslipRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    paddingVertical: 10,
    gap: 8
  },
  rowTitle: { color: appTheme.colors.text, fontWeight: "700" },
  rowSub: { color: appTheme.colors.mutedText, marginTop: 2, fontSize: 12 },
  actionRow: { flexDirection: "row", gap: 6 }
});
