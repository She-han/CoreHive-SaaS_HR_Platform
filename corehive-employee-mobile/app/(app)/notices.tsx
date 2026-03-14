import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/src/components/ui/AppScreen";
import { AppCard } from "@/src/components/ui/AppCard";
import { appTheme } from "@/src/theme/palette";
import { employeeApi } from "@/src/services/api/employee";
import type { NoticeItem } from "@/src/types/models";

const PAGE_SIZE = 10;

export default function NoticesScreen() {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [notices, setNotices] = useState<NoticeItem[]>([]);

  useEffect(() => {
    employeeApi.getNotices(page, PAGE_SIZE).then((resp) => {
      const today = new Date();
      const active = (resp?.content || []).filter((n) => {
        const publish = new Date(n.publishAt);
        const expire = n.expireAt ? new Date(n.expireAt) : null;
        return n.status === "PUBLISHED" && publish <= today && (!expire || expire >= today);
      });
      setNotices(active);
      setTotalPages(resp?.totalPages || 0);
    });
  }, [page]);

  return (
    <AppScreen>
      <Text style={styles.title}>Notices & Announcements</Text>

      {notices.length === 0 ? (
        <AppCard>
          <Text style={styles.empty}>No active notices available.</Text>
        </AppCard>
      ) : (
        notices.map((notice) => (
          <AppCard key={notice.id}>
            <View style={styles.header}>
              <Text style={styles.noticeTitle}>{notice.title}</Text>
              {!!notice.priority && <Text style={styles.priority}>{notice.priority}</Text>}
            </View>
            <Text style={styles.content}>{notice.content}</Text>
            <Text style={styles.meta}>Published: {new Date(notice.publishAt).toLocaleDateString()}</Text>
            {!!notice.expireAt && <Text style={styles.meta}>Expires: {new Date(notice.expireAt).toLocaleDateString()}</Text>}
          </AppCard>
        ))
      )}

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <Pressable style={[styles.pageBtn, page === 0 && styles.disabled]} disabled={page === 0} onPress={() => setPage((p) => p - 1)}>
            <Text style={styles.pageText}>Previous</Text>
          </Pressable>
          <Text style={styles.pageTextMuted}>Page {page + 1} of {totalPages}</Text>
          <Pressable style={[styles.pageBtn, page >= totalPages - 1 && styles.disabled]} disabled={page >= totalPages - 1} onPress={() => setPage((p) => p + 1)}>
            <Text style={styles.pageText}>Next</Text>
          </Pressable>
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800", color: appTheme.colors.navy },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  noticeTitle: { flex: 1, color: appTheme.colors.text, fontWeight: "700", fontSize: 16 },
  priority: { color: appTheme.colors.secondary, fontWeight: "700", fontSize: 12 },
  content: { color: appTheme.colors.text, marginTop: 10, lineHeight: 20 },
  meta: { color: appTheme.colors.mutedText, fontSize: 12, marginTop: 6 },
  empty: { color: appTheme.colors.mutedText, textAlign: "center" },
  pagination: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pageBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.card },
  pageText: { color: appTheme.colors.text, fontWeight: "600" },
  pageTextMuted: { color: appTheme.colors.mutedText },
  disabled: { opacity: 0.5 }
});
