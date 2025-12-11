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
  Platform,
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

import { execSql } from "../db";

type Idea = {
  id: string;
  title: string;
  body: string;
  tag: string;
  pinned: boolean;
  createdAt: Date;
};

const DEFAULT_IDEAS: Idea[] = [
  {
    id: "1",
    title: "Sessão de fotografia noturna",
    body: "Carros com néon, chuva no chão, reflexos fortes. Usar 35mm e 14mm para planos diferentes.",
    tag: "Fotografia",
    pinned: true,
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Template para estudar cadeiras",
    body: "Criar modelo de revisão: resumo teórico + 5 exercícios tipo exame + 1 pergunta conceptual difícil.",
    tag: "Estudo",
    pinned: false,
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Sistema de rotinas diárias",
    body: "Dividir o dia em blocos: deep work, treino, tarefas rápidas, planeamento. Tudo trackado na app.",
    tag: "Rotina",
    pinned: false,
    createdAt: new Date(),
  },
];

export default function IdeasScreen() {
  const navigation = useNavigation<any>();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterTag, setFilterTag] = useState<string>("Todas");

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("");

  // ---------- HELPERS SQLITE ----------

  function mapRowToIdea(row: any): Idea {
    return {
      id: String(row.id),
      title: row.title ?? "",
      body: row.body ?? "",
      tag: row.tag ?? "",
      pinned: row.pinned === 1,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    };
  }

  async function ensureTableExists() {
    if (Platform.OS === "web") return;

    await execSql(
      `
      CREATE TABLE IF NOT EXISTS ideas (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        tag TEXT,
        pinned INTEGER,
        created_at TEXT
      );
    `
    );
  }

  async function loadIdeasFromDb() {
    if (Platform.OS === "web") {
      setIdeas(DEFAULT_IDEAS);
      setLoading(false);
      return;
    }

    try {
      await ensureTableExists();

      const res = await execSql<{ rows: { _array: any[] } }>(
        "SELECT * FROM ideas ORDER BY datetime(created_at) DESC;"
      );
      let rows = res.rows._array;

      if (!rows || rows.length === 0) {
        for (const idea of DEFAULT_IDEAS) {
          await execSql(
            `INSERT OR REPLACE INTO ideas (id, title, body, tag, pinned, created_at)
             VALUES (?, ?, ?, ?, ?, ?);`,
            [
              idea.id,
              idea.title,
              idea.body,
              idea.tag,
              idea.pinned ? 1 : 0,
              idea.createdAt.toISOString(),
            ]
          );
        }

        const res2 = await execSql<{ rows: { _array: any[] } }>(
          "SELECT * FROM ideas ORDER BY datetime(created_at) DESC;"
        );
        rows = res2.rows._array;
      }

      const mapped = rows.map(mapRowToIdea);
      setIdeas(mapped);
    } catch (e) {
      console.error("Erro a carregar ideias de SQLite:", e);
      setIdeas(DEFAULT_IDEAS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIdeasFromDb();
  }, []);

  // ---------- FORM / MODAL ----------

  function resetForm() {
    setTitle("");
    setBody("");
    setTag("");
  }

  function openModal() {
    resetForm();
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
  }

  async function addIdea() {
    if (!title.trim() && !body.trim()) return;

    const now = new Date();
    const newIdea: Idea = {
      id: Date.now().toString(),
      title: title.trim() || "Ideia sem título",
      body: body.trim(),
      tag: tag.trim() || "Sem tag",
      pinned: false,
      createdAt: now,
    };

    setIdeas((prev) => [newIdea, ...prev]);

    if (Platform.OS !== "web") {
      try {
        await execSql(
          `INSERT OR REPLACE INTO ideas (id, title, body, tag, pinned, created_at)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [
            newIdea.id,
            newIdea.title,
            newIdea.body,
            newIdea.tag,
            0,
            now.toISOString(),
          ]
        );
      } catch (e) {
        console.error("Erro a guardar ideia em SQLite:", e);
      }
    }

    closeModal();
  }

  function togglePinned(id: string) {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id ? { ...idea, pinned: !idea.pinned } : idea
      )
    );

    if (Platform.OS !== "web") {
      const current = ideas.find((i) => i.id === id);
      if (!current) return;

      const newPinned = !current.pinned;
      execSql("UPDATE ideas SET pinned = ? WHERE id = ?;", [
        newPinned ? 1 : 0,
        id,
      ]).catch((e) => {
        console.error("Erro a atualizar pinned em SQLite:", e);
      });
    }
  }

  // ---------- DERIVADOS ----------

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    ideas.forEach((i) => {
      if (i.tag && i.tag.trim()) set.add(i.tag.trim());
    });
    return Array.from(set);
  }, [ideas]);

  const pinnedIdeas = useMemo(() => ideas.filter((i) => i.pinned), [ideas]);

  const filteredIdeas = useMemo(() => {
    const source = ideas.filter((i) => !i.pinned);
    if (filterTag === "Todas") return source;
    return source.filter((i) => i.tag.trim() === filterTag);
  }, [ideas, filterTag]);

  const stats = useMemo(() => {
    const total = ideas.length;
    const pinned = ideas.filter((i) => i.pinned).length;
    const today = ideas.filter((i) => {
      const d = i.createdAt;
      const now = new Date();
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length;
    return { total, pinned, today };
  }, [ideas]);

  // ---------- UI ----------

  return (
    <View style={styles.root}>
      {/* Header */}
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
              {stats.pinned}
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

        {/* Secção de ideias fixadas */}
        {!loading && pinnedIdeas.length > 0 && (
          <View style={{ marginTop: 16, marginBottom: 12 }}>
            <View style={styles.sectionHeaderColumn}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Sparkles color="#E5E7EB" size={16} />
                <Text style={styles.sectionTitle}>Fixadas</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Ideias que não queres perder de vista.
              </Text>
            </View>

            {pinnedIdeas.map((idea, index) => (
              <MotiView
                key={idea.id}
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 350 + index * 60 }}
                style={{ marginBottom: 10 }}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate("IdeaDetail", { idea })}
                  style={{ width: "100%" }}
                >
                  <View style={styles.pinnedCard}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.ideaTitle} numberOfLines={1}>
                        {idea.title}
                      </Text>
                      <TouchableOpacity
                        onPress={() => togglePinned(idea.id)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <PinOff color="#F97373" size={18} />
                      </TouchableOpacity>
                    </View>

                    {idea.body ? (
                      <Text style={styles.ideaBody} numberOfLines={3}>
                        {idea.body}
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

        {/* Filtros por tag */}
        {!loading && (
          <View
            style={{
              marginTop: pinnedIdeas.length > 0 ? 4 : 18,
              marginBottom: 10,
            }}
          >
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.sectionTitle}>Todas as ideias</Text>
              <Text style={[styles.sectionSubtitle, { marginTop: 2 }]}>
                Filtra por tema para manter a cabeça arrumada.
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4 }}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.filterChip,
                  filterTag === "Todas" && styles.filterChipActive,
                ]}
                onPress={() => setFilterTag("Todas")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterTag === "Todas" && styles.filterChipTextActive,
                  ]}
                >
                  Todas
                </Text>
              </TouchableOpacity>

              {availableTags.map((t) => {
                const selected = filterTag === t;
                return (
                  <TouchableOpacity
                    key={t}
                    activeOpacity={0.85}
                    style={[
                      styles.filterChip,
                      selected && styles.filterChipActive,
                    ]}
                    onPress={() => setFilterTag(t)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selected && styles.filterChipTextActive,
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Lista de ideias normais */}
        {!loading && (
          <View style={{ marginBottom: 16 }}>
            {filteredIdeas.length === 0 ? (
              <Text style={styles.emptyText}>
                Nenhuma ideia com esse filtro. Experimenta outro ou cria uma
                nova.
              </Text>
            ) : (
              filteredIdeas.map((idea, index) => (
                <MotiView
                  key={idea.id}
                  from={{ opacity: 0, translateY: 8 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: "timing",
                    duration: 280 + index * 40,
                  }}
                  style={{ marginBottom: 12 }}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate("IdeaDetail", { idea })}
                    style={{ width: "100%" }}
                  >
                    <View style={styles.card}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.ideaTitle} numberOfLines={1}>
                          {idea.title}
                        </Text>
                        <TouchableOpacity
                          onPress={() => togglePinned(idea.id)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Pin
                            color={idea.pinned ? "#22C55E" : "#64748B"}
                            size={18}
                          />
                        </TouchableOpacity>
                      </View>

                      {idea.body ? (
                        <Text style={styles.ideaBody} numberOfLines={3}>
                          {idea.body}
                        </Text>
                      ) : null}

                      <View style={styles.tagRow}>
                        <View style={styles.tagPillSecondary}>
                          <TagIcon color="#9CA3AF" size={12} />
                          <Text style={styles.tagTextSecondary}>
                            {idea.tag}
                          </Text>
                        </View>
                        <Text style={styles.dateTextSecondary}>
                          Nota rápida
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </MotiView>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
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

      {/* Modal nova ideia */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
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
                value={body}
                onChangeText={setBody}
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
                  {
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderColor: "#334155",
                  },
                ]}
                onPress={closeModal}
              >
                <Text style={styles.modalBtnTextSecondary}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: "#22C55E" }]}
                onPress={addIdea}
              >
                <Text style={styles.modalBtnText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* styles iguais aos que já tinhas */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 26,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#94A3B8",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 12,
  },
  statBox: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(15,23,42,0.85)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 2,
  },
  sectionHeaderColumn: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E5E7EB",
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
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
  ideaTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F9FAFB",
    flex: 1,
    marginRight: 8,
  },
  ideaBody: {
    fontSize: 13,
    color: "#CBD5E1",
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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
  tagText: {
    fontSize: 11,
    color: "#E0F2FE",
    fontWeight: "600",
  },
  tagTextSecondary: {
    fontSize: 11,
    color: "#E5E7EB",
  },
  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  dateTextSecondary: {
    fontSize: 11,
    color: "#6B7280",
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.9)",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "rgba(56,189,248,0.18)",
    borderColor: "rgba(56,189,248,0.9)",
  },
  filterChipText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#E0F2FE",
  },
  emptyText: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 18,
    fontSize: 13,
  },
  fabWrapper: {
    position: "absolute",
    right: 20,
    bottom: 20,
  },
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(2,6,23,0.78)",
    paddingHorizontal: 18,
  },
  modalCard: {
    backgroundColor: "#020617",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.7)",
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E5E7EB",
  },
  modalCloseText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  modalLabel: {
    fontSize: 12,
    color: "#CBD5E1",
    marginBottom: 4,
  },
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
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  modalBtnText: {
    color: "#022C22",
    fontWeight: "700",
  },
  modalBtnTextSecondary: {
    color: "#E5E7EB",
    fontWeight: "600",
  },
});
