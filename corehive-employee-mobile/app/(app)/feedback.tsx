import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/src/components/ui/AppScreen";
import { AppCard } from "@/src/components/ui/AppCard";
import { AppInput } from "@/src/components/ui/AppInput";
import { AppButton } from "@/src/components/ui/AppButton";
import { appTheme } from "@/src/theme/palette";
import { employeeApi } from "@/src/services/api/employee";
import type { FeedbackItem } from "@/src/types/models";

export default function FeedbackScreen() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState("");
  const [rating, setRating] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const data = await employeeApi.getOwnFeedbacks();
    setFeedbacks(data);
  };

  useEffect(() => {
    load().catch(() => Alert.alert("Error", "Failed to load feedback history."));
  }, []);

  const submit = async () => {
    if (!feedbackType || !rating || !message.trim()) {
      Alert.alert("Validation", "Please complete all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      await employeeApi.submitFeedback({
        feedbackType,
        rating: Number(rating),
        message: message.trim()
      });
      Alert.alert("Success", "Feedback submitted successfully.");
      setFeedbackType("");
      setRating("");
      setMessage("");
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppScreen>
      <Text style={styles.title}>Feedback</Text>
      <AppCard>
        <Text style={styles.section}>Submit Feedback</Text>
        <AppInput label="Feedback Type" value={feedbackType} onChangeText={setFeedbackType} placeholder="COMPLAINT / APPRECIATION / MANAGEMENT..." />
        <AppInput label="Rating (1-5)" value={rating} onChangeText={setRating} keyboardType="number-pad" />
        <AppInput label="Message" value={message} onChangeText={setMessage} multiline numberOfLines={4} />
        <AppButton title="Submit Feedback" loading={submitting} onPress={submit} />
      </AppCard>

      <AppCard>
        <Text style={styles.section}>My Feedback History</Text>
        <FlatList
          data={feedbacks}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemType}>{item.feedbackType}</Text>
                <Text style={styles.itemDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.itemMessage}>{item.message}</Text>
              <Text style={styles.itemMeta}>Rating: {item.rating}/5 {item.markedAsRead ? "• Read" : ""}</Text>
              {!!item.reply && (
                <View style={styles.replyBox}>
                  <Text style={styles.replyLabel}>Admin Reply</Text>
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
  item: { borderWidth: 1, borderColor: appTheme.colors.border, borderRadius: 10, padding: 12, backgroundColor: appTheme.colors.background },
  itemHeader: { flexDirection: "row", justifyContent: "space-between" },
  itemType: { color: appTheme.colors.secondary, fontWeight: "700" },
  itemDate: { color: appTheme.colors.mutedText, fontSize: 12 },
  itemMessage: { color: appTheme.colors.text, marginTop: 8 },
  itemMeta: { color: appTheme.colors.mutedText, marginTop: 8, fontSize: 12 },
  replyBox: { marginTop: 10, padding: 10, borderLeftWidth: 4, borderLeftColor: appTheme.colors.primary, backgroundColor: "#ECFDF5" },
  replyLabel: { color: appTheme.colors.navy, fontWeight: "700", marginBottom: 4 },
  replyText: { color: appTheme.colors.text }
});
