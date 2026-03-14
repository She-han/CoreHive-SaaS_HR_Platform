import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/src/components/ui/AppScreen";
import { AppCard } from "@/src/components/ui/AppCard";
import { AppInput } from "@/src/components/ui/AppInput";
import { AppButton } from "@/src/components/ui/AppButton";
import { appTheme } from "@/src/theme/palette";
import { employeeApi } from "@/src/services/api/employee";
import type { SupportTicket } from "@/src/types/models";

const tabs = ["SUPPORT_REQUEST", "BUG_REPORT", "SYSTEM_FEEDBACK"] as const;

export default function SupportScreen() {
  const [activeType, setActiveType] = useState<typeof tabs[number]>("SUPPORT_REQUEST");
  const [priority, setPriority] = useState("MEDIUM");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [saving, setSaving] = useState(false);

  const loadTickets = async () => {
    const list = await employeeApi.getMySupportTickets();
    setTickets(list || []);
  };

  useEffect(() => {
    loadTickets().catch(() => Alert.alert("Error", "Failed to load support tickets."));
  }, []);

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return tickets.filter((t) => {
      const d = new Date(t.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [tickets]);

  const submit = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert("Validation", "Subject and description are required.");
      return;
    }

    if (thisMonthCount >= 3) {
      Alert.alert("Limit Reached", "You can submit only 3 tickets per month.");
      return;
    }

    try {
      setSaving(true);
      await employeeApi.createSupportTicket({
        ticketType: activeType,
        priority: priority as any,
        subject: subject.trim(),
        description: description.trim()
      });
      Alert.alert("Success", "Ticket submitted successfully.");
      setSubject("");
      setDescription("");
      await loadTickets();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to submit ticket.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppScreen>
      <Text style={styles.title}>Support & Bug Report</Text>

      <AppCard>
        <Text style={styles.section}>Submit Ticket ({thisMonthCount}/3 this month)</Text>

        <View style={styles.tabRow}>
          {tabs.map((t) => (
            <AppButton
              key={t}
              title={t.replace("_", " ")}
              variant={activeType === t ? "secondary" : "ghost"}
              onPress={() => setActiveType(t)}
            />
          ))}
        </View>

        <AppInput label="Priority (LOW/MEDIUM/HIGH/CRITICAL)" value={priority} onChangeText={setPriority} />
        <AppInput label="Subject" value={subject} onChangeText={setSubject} />
        <AppInput label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={4} />
        <AppButton title="Submit Ticket" loading={saving} onPress={submit} />
      </AppCard>

      <AppCard>
        <Text style={styles.section}>My Tickets</Text>
        <FlatList
          data={tickets}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <View style={styles.ticketRow}>
              <Text style={styles.ticketSubject}>{item.subject}</Text>
              <Text style={styles.ticketMeta}>{item.ticketType} • {item.priority} • {item.status}</Text>
              <Text style={styles.ticketDesc}>{item.description}</Text>
              {!!item.reply && (
                <View style={styles.reply}>
                  <Text style={styles.replyLabel}>Reply</Text>
                  <Text style={styles.replyText}>{item.reply}</Text>
                </View>
              )}
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
  tabRow: { gap: 8, marginBottom: 8 },
  ticketRow: { borderWidth: 1, borderColor: appTheme.colors.border, borderRadius: 10, padding: 12, backgroundColor: appTheme.colors.background },
  ticketSubject: { color: appTheme.colors.text, fontWeight: "700" },
  ticketMeta: { color: appTheme.colors.secondary, marginTop: 4, fontSize: 12 },
  ticketDesc: { color: appTheme.colors.text, marginTop: 8 },
  reply: { marginTop: 10, padding: 10, borderLeftWidth: 4, borderLeftColor: appTheme.colors.primary, backgroundColor: "#ECFDF5" },
  replyLabel: { color: appTheme.colors.navy, fontWeight: "700", marginBottom: 4 },
  replyText: { color: appTheme.colors.text }
});
