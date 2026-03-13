import React, { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppScreen } from "@/src/components/ui/AppScreen";
import { AppCard } from "@/src/components/ui/AppCard";
import { AppButton } from "@/src/components/ui/AppButton";
import { appTheme } from "@/src/theme/palette";
import { employeeApi } from "@/src/services/api/employee";
import type { Survey } from "@/src/types/models";

type AnswerMap = Record<number, { questionId: number; answerText: string | null; selectedOption: string | null }>;

export default function SurveysScreen() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responded, setResponded] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const data = await employeeApi.getActiveSurveys();
    setSurveys(data || []);
    const set = new Set<number>();
    for (const s of data || []) {
      try {
        const done = await employeeApi.hasResponded(s.id);
        if (done) set.add(s.id);
      } catch {
        // no-op
      }
    }
    setResponded(set);
  };

  useEffect(() => {
    load().catch(() => Alert.alert("Error", "Failed to load surveys."));
  }, []);

  const openSurvey = async (surveyId: number) => {
    const details = await employeeApi.getSurveyDetails(surveyId);
    setCurrent(details);
    setAnswers({});
  };

  const setAnswer = (questionId: number, value: string, type: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answerText: type === "TEXT" ? value : null,
        selectedOption: type === "TEXT" ? null : value
      }
    }));
  };

  const submit = async () => {
    if (!current) return;
    const allAnswered = (current.questions || []).every((q) => !!answers[q.id]);
    if (!allAnswered) {
      Alert.alert("Incomplete", "Please answer all questions.");
      return;
    }
    try {
      setSubmitting(true);
      await employeeApi.submitSurveyResponse(current.id, Object.values(answers));
      Alert.alert("Success", "Survey submitted successfully.");
      setCurrent(null);
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to submit survey.");
    } finally {
      setSubmitting(false);
    }
  };

  const parseOptions = (raw?: string) => {
    if (!raw) return [] as string[];
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  };

  return (
    <AppScreen>
      <Text style={styles.title}>Surveys</Text>
      {(surveys || []).map((s) => {
        const expired = s.endDate ? new Date(s.endDate) < new Date() : false;
        const done = responded.has(s.id);
        return (
          <AppCard key={s.id}>
            <Text style={styles.cardTitle}>{s.title}</Text>
            <Text style={styles.description}>{s.description || "No description"}</Text>
            <Text style={styles.meta}>Deadline: {s.endDate ? new Date(s.endDate).toLocaleDateString() : "No deadline"}</Text>
            {!done && !expired ? (
              <AppButton title="Take Survey" onPress={() => openSurvey(s.id)} />
            ) : (
              <AppButton title={done ? "Already Submitted" : "Survey Expired"} variant="ghost" disabled />
            )}
          </AppCard>
        );
      })}

      <Modal visible={!!current} animationType="slide" onRequestClose={() => setCurrent(null)}>
        <View style={styles.modalRoot}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.title}>{current?.title}</Text>
            <Text style={styles.description}>{current?.description}</Text>

            {(current?.questions || []).map((q, idx) => (
              <View key={q.id} style={styles.questionCard}>
                <Text style={styles.qTitle}>{idx + 1}. {q.questionText}</Text>
                {q.questionType === "TEXT" && (
                  <TextInput
                    value={answers[q.id]?.answerText || ""}
                    onChangeText={(value) => setAnswer(q.id, value, q.questionType)}
                    placeholder="Type your answer"
                    multiline
                    style={styles.input}
                  />
                )}
                {q.questionType === "RATING" && (
                  <View style={styles.ratingRow}>
                    {["1", "2", "3", "4", "5"].map((r) => (
                      <Pressable
                        key={r}
                        onPress={() => setAnswer(q.id, r, q.questionType)}
                        style={[styles.rateBtn, answers[q.id]?.selectedOption === r && styles.rateBtnActive]}
                      >
                        <Text style={[styles.rateText, answers[q.id]?.selectedOption === r && styles.rateTextActive]}>{r}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
                {q.questionType === "MCQ" && (
                  <View style={{ gap: 8 }}>
                    {parseOptions(q.options).map((o) => (
                      <Pressable
                        key={o}
                        onPress={() => setAnswer(q.id, o, q.questionType)}
                        style={[styles.option, answers[q.id]?.selectedOption === o && styles.optionActive]}
                      >
                        <Text>{o}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <View style={{ flex: 1 }}><AppButton title="Cancel" variant="ghost" onPress={() => setCurrent(null)} /></View>
            <View style={{ flex: 1 }}><AppButton title="Submit" loading={submitting} onPress={submit} /></View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800", color: appTheme.colors.navy },
  cardTitle: { color: appTheme.colors.text, fontWeight: "700", fontSize: 17 },
  description: { color: appTheme.colors.mutedText, marginTop: 8 },
  meta: { color: appTheme.colors.secondary, marginTop: 8, marginBottom: 12, fontSize: 12 },
  modalRoot: { flex: 1, backgroundColor: appTheme.colors.background },
  modalContent: { padding: 16, gap: 12, paddingBottom: 120 },
  questionCard: { backgroundColor: appTheme.colors.card, borderWidth: 1, borderColor: appTheme.colors.border, borderRadius: 12, padding: 12, gap: 8 },
  qTitle: { color: appTheme.colors.text, fontWeight: "700" },
  input: { borderWidth: 1, borderColor: appTheme.colors.border, borderRadius: 10, padding: 10, minHeight: 80, backgroundColor: appTheme.colors.white },
  ratingRow: { flexDirection: "row", gap: 8 },
  rateBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: appTheme.colors.border, alignItems: "center" },
  rateBtnActive: { backgroundColor: appTheme.colors.primary, borderColor: appTheme.colors.primary },
  rateText: { color: appTheme.colors.text, fontWeight: "700" },
  rateTextActive: { color: appTheme.colors.white },
  option: { borderWidth: 1, borderColor: appTheme.colors.border, borderRadius: 10, padding: 10, backgroundColor: appTheme.colors.white },
  optionActive: { borderColor: appTheme.colors.primary, backgroundColor: "#ECFDF5" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, gap: 10, flexDirection: "row", backgroundColor: appTheme.colors.card, borderTopWidth: 1, borderTopColor: appTheme.colors.border }
});
