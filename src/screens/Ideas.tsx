// src/screens/Ideas.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Lightbulb,
  Sparkles,
  Pin,
  PinOff,
  Tag as TagIcon,
  Plus,
  NotebookPen,
} from "lucide-react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";

import { useIdeas } from "../context/IdeasContext";

export default function IdeasScreen() {
  const navigation = useNavigation<any>();

  const { ideas, addIdea, toggleFixed, loadIdeas, loading } = useIdeas();

  const [filterTag, setFilterTag] = useState<string>("Todas");

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    loadIdeas();
  }, []);

  function resetForm() {
    setTitle("");
    setContent("");
    setTag("");
  }

  function openModal() {
    resetForm();
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
  }

  async function onAddIdea() {
    if (!title.trim() && !content.trim()) return;

    await addIdea({
      title: title.trim() || "Ideia sem título",
      content: content.trim(),
      tag: tag.trim() || "Sem tag",
    });

    closeModal();
  }

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    ideas.forEach((i) => {
      const t = (i.tag ?? "").trim();
      if (t) set.add(t);
    });
    return Array.from(set);
  }, [ideas]);

  const fixedIdeas = useMemo(() => ideas.filter((i) => i.fixed), [ideas]);

  const filteredIdeas = useMemo(() => {
    const source = ideas.filter((i) => !i.fixed);
    if (filterTag === "Todas") return source;
    return source.filter((i) => (i.tag ?? "").trim() === filterTag);
  }, [ideas, filterTag]);

  const stats = useMemo(() => {
    const total = ideas.length;
    const fixed = fixedIdeas.length;

    const today = ideas.filter((i) => {
      const d = new Date(i.created_at);
      const now = new Date();
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length;

    return { total, fixed, today };
  }, [ideas, fixedIdeas]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#1F2937", "#020617"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Lightbulb color="#FACC15" size={22} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Ideias & Notas</Text>
            <Text style={styles.headerSubtitle}>
              Captura conceitos antes de eles desaparecerem.
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={[styles.statValue, { color: "#38BDF8" }]}>
              {stats.total}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Fixadas</Text>
            <Text style={[styles.statValue, { color: "#22C55E" }]}>
              {stats.fixed}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Hoje</Text>
            <Text style={[styles.statValue, { color: "#FBBF24" }]}>
              {stats.today}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <Text style={[styles.emptyText, { marginTop: 20 }]}>
            A carregar ideias…
          </Text>
        )}

        {!loading && fixedIdeas.length > 0 && (
          <View style={{ marginTop: 16, marginBottom: 12 }}>
            <View style={styles.sectionHeaderColumn}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Sparkles color="#E5E7EB" size={16} />
                <Text style={styles.sectionTitle}>Fixadas</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Ideias que não queres perder de vista.
              </Text>
            </View>

            {fixedIdeas.map((idea, index) => (
              <MotiView
                key={idea.id}
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 350 + index * 60 }}
                style={{ marginBottom: 10 }}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate("IdeaDetail", { id: idea.id })}
                  style={{ width: "100%" }}
                >
                  <View style={styles.pinnedCard}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.ideaTitle} numberOfLines={1}>
                        {idea.title}
                      </Text>
                      <TouchableOpacity
                        onPress={() => toggleFixed(idea.id)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <PinOff color="#F97373" size={18} />
                      </TouchableOpacity>
                    </View>

                    {idea.content ? (
                      <Text style={styles.ideaBody} numberOfLines={3}>
                        {idea.content}
                      </Text>
                    ) : null}

                    <View style={styles.tagRow}>
                      <View style={styles.tagPill}>
                        <TagIcon color="#38BDF8" size={13} />
                        <Text style={styles.tagText}>{idea.tag}</Text>
                      </View>
                      <Text style={styles.dateText}>Guardada</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        )}

        {!loading && (
          <View style={{ marginTop: fixedIdeas.length > 0 ? 4 : 18, marginBottom: 10 }}>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.sectionTitle}>Todas as ideias</Text>
              <Text style={[styles.sectionSubtitle, { marginTop: 2 }]}>
                Filtra por tema para manter a cabeça arrumada.
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.filterChip, filterTag === "Todas" && styles.filterChipActive]}
                onPress={() => setFilterTag("Todas")}
              >
                <Text style={[styles.filterChipText, filterTag === "Todas" && styles.filterChipTextActive]}>
                  Todas
                </Text>
              </TouchableOpacity>

              {availableTags.map((t) => {
                const selected = filterTag === t;
                return (
                  <TouchableOpacity
                    key={t}
                    activeOpacity={0.85}
                    style={[styles.filterChip, selected && styles.filterChipActive]}
                    onPress={() => setFilterTag(t)}
                  >
                    <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {!loading && (
          <View style={{ marginBottom: 16 }}>
            {filteredIdeas.length === 0 ? (
              <Text style={styles.emptyText}>
                Nenhuma ideia com esse filtro. Experimenta outro ou cria uma nova.
              </Text>
            ) : (
              filteredIdeas.map((idea, index) => (
                <MotiView
                  key={idea.id}
                  from={{ opacity: 0, translateY: 8 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "timing", duration: 280 + index * 40 }}
                  style={{ marginBottom: 12 }}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate("IdeaDetail", { id: idea.id })}
                    style={{ width: "100%" }}
                  >
                    <View style={styles.card}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.ideaTitle} numberOfLines={1}>
                          {idea.title}
                        </Text>
                        <TouchableOpacity
                          onPress={() => toggleFixed(idea.id)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Pin color={idea.fixed ? "#22C55E" : "#64748B"} size={18} />
                        </TouchableOpacity>
                      </View>

                      {idea.content ? (
                        <Text style={styles.ideaBody} numberOfLines={3}>
                          {idea.content}
                        </Text>
                      ) : null}

                      <View style={styles.tagRow}>
                        <View style={styles.tagPillSecondary}>
                          <TagIcon color="#9CA3AF" size={12} />
                          <Text style={styles.tagTextSecondary}>{idea.tag}</Text>
                        </View>
                        <Text style={styles.dateTextSecondary}>Nota rápida</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </MotiView>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.fabWrapper}>
        <TouchableOpacity activeOpacity={0.9} onPress={openModal}>
          <LinearGradient
            colors={["#22C55E", "#3B82F6", "#38BDF8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Plus color="#F9FAFB" size={28} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <NotebookPen color="#F9FAFB" size={20} />
                <Text style={styles.modalTitle}>Nova ideia</Text>
              </View>
              <Pressable onPress={closeModal}>
                <Text style={styles.modalCloseText}>Fechar</Text>
              </Pressable>
            </View>

            <View style={{ marginBottom: 10 }}>
              <Text style={styles.modalLabel}>Título</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex.: Sistema de estudo, projeto de app, conceito de foto..."
                placeholderTextColor="#6B7280"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={{ marginBottom: 10 }}>
              <Text style={styles.modalLabel}>Detalhes</Text>
              <TextInput
                style={[styles.modalInput, { height: 110 }]}
                placeholder="Escreve os pontos principais para não te esqueceres."
                placeholderTextColor="#6B7280"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.modalLabel}>Tag / Tema</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Fotografia, Estudo, Negócio..."
                placeholderTextColor="#6B7280"
                value={tag}
                onChangeText={setTag}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.modalBtn,
                  { backgroundColor: "transparent", borderWidth: 1, borderColor: "#334155" },
                ]}
                onPress={closeModal}
              >
                <Text style={styles.modalBtnTextSecondary}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: "#22C55E" }]} onPress={onAddIdea}>
                <Text style={styles.modalBtnText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* styles (mantive os teus) */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020617" },
  header: {
    paddingTop: 60,
    paddingBottom: 26,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250,204,21,0.09)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.35)",
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#F9FAFB" },
  headerSubtitle: { marginTop: 4, fontSize: 14, color: "#94A3B8" },
  statsRow: { flexDirection: "row", marginTop: 14, gap: 12 },
  statBox: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(15,23,42,0.85)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  statLabel: { fontSize: 11, color: "#9CA3AF" },
  statValue: { fontSize: 17, fontWeight: "700", marginTop: 2 },

  sectionHeaderColumn: { marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#E5E7EB" },
  sectionSubtitle: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },

  pinnedCard: {
    backgroundColor: "rgba(15,23,42,1)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
  },
  card: {
    backgroundColor: "rgba(15,23,42,0.96)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.45)",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  ideaTitle: { fontSize: 15, fontWeight: "700", color: "#F9FAFB", flex: 1, marginRight: 8 },
  ideaBody: { fontSize: 13, color: "#CBD5E1", marginTop: 4, marginBottom: 8, lineHeight: 20 },

  tagRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.95)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.5)",
  },
  tagPillSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "rgba(75,85,99,0.7)",
  },
  tagText: { fontSize: 11, color: "#E0F2FE", fontWeight: "600" },
  tagTextSecondary: { fontSize: 11, color: "#E5E7EB" },
  dateText: { fontSize: 11, color: "#9CA3AF" },
  dateTextSecondary: { fontSize: 11, color: "#6B7280" },

  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.9)",
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: "rgba(56,189,248,0.18)", borderColor: "rgba(56,189,248,0.9)" },
  filterChipText: { fontSize: 12, color: "#94A3B8", fontWeight: "600" },
  filterChipTextActive: { color: "#E0F2FE" },

  emptyText: { color: "#6B7280", textAlign: "center", marginTop: 18, fontSize: 13 },

  fabWrapper: { position: "absolute", right: 20, bottom: 20 },
  fab: {
    height: 64,
    width: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowRadius: 14,
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },

  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(2,6,23,0.78)", paddingHorizontal: 18 },
  modalCard: { backgroundColor: "#020617", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(30,64,175,0.7)" },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#E5E7EB" },
  modalCloseText: { fontSize: 12, color: "#9CA3AF" },
  modalLabel: { fontSize: 12, color: "#CBD5E1", marginBottom: 4 },
  modalInput: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.9)",
    fontSize: 14,
    color: "#F9FAFB",
  },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 6 },
  modalBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: "center" },
  modalBtnText: { color: "#022C22", fontWeight: "700" },
  modalBtnTextSecondary: { color: "#E5E7EB", fontWeight: "600" },
});
