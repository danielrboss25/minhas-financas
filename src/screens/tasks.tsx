import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Flag,
  X,
  Calendar,
  Edit3,
} from "lucide-react-native";

type Priority = "alta" | "media" | "baixa";
type Bucket = "hoje" | "semana" | "mais_tarde" | "todas";

type Task = {
  id: string;
  title: string;
  notes?: string;
  bucket: Bucket;
  priority: Priority;
  done: boolean;
  dueLabel?: string;
};

const BUCKET_LABELS: Record<Bucket, string> = {
  hoje: "Hoje",
  semana: "Esta semana",
  mais_tarde: "Mais tarde",
  todas: "Todas",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Rever plano de treino",
      notes: "Ajustar cargas de perna e ombro",
      bucket: "hoje",
      priority: "alta",
      done: false,
      dueLabel: "Hoje",
    },
    {
      id: "2",
      title: "Organizar notas da faculdade",
      notes: "Infraestrutura + BD + IA",
      bucket: "semana",
      priority: "media",
      done: false,
      dueLabel: "Esta semana",
    },
    {
      id: "3",
      title: "Bloquear sessão de fotografia",
      notes: "Definir data e local",
      bucket: "mais_tarde",
      priority: "baixa",
      done: true,
      dueLabel: "Quando der",
    },
  ]);

  const [activeBucket, setActiveBucket] = useState<Bucket>("hoje");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // estado do formulário
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [formBucket, setFormBucket] = useState<Bucket>("hoje");
  const [priority, setPriority] = useState<Priority>("media");

  function resetForm() {
    setTitle("");
    setNotes("");
    setFormBucket("hoje");
    setPriority("media");
    setEditingTask(null);
  }

  function openNewTaskModal() {
    resetForm();
    setShowModal(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setTitle(task.title);
    setNotes(task.notes ?? "");
    setFormBucket(task.bucket);
    setPriority(task.priority);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    resetForm();
  }

  function toggleTaskDone(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function handleSubmit() {
    if (!title.trim()) {
      return;
    }

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: title.trim(),
                notes: notes.trim() || undefined,
                bucket: formBucket,
                priority,
              }
            : t
        )
      );
    } else {
      const id = Date.now().toString();
      const newTask: Task = {
        id,
        title: title.trim(),
        notes: notes.trim() || undefined,
        bucket: formBucket,
        priority,
        done: false,
        dueLabel:
          formBucket === "hoje"
            ? "Hoje"
            : formBucket === "semana"
            ? "Esta semana"
            : formBucket === "mais_tarde"
            ? "Quando der"
            : undefined,
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    closeModal();
  }

  const filteredTasks = useMemo(() => {
    let list = tasks.slice();

    if (activeBucket !== "todas") {
      list = list.filter((t) => t.bucket === activeBucket);
    }

    // incompletas primeiro
    list.sort((a, b) => {
      if (a.done === b.done) return 0;
      return a.done ? 1 : -1;
    });

    return list;
  }, [tasks, activeBucket]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const active = total - done;
    const today = tasks.filter((t) => t.bucket === "hoje").length;
    const focus = tasks.filter((t) => !t.done && t.priority === "alta").length;

    return {
      total,
      done,
      active,
      today,
      focus,
      completion: total ? Math.round((done / total) * 100) : 0,
    };
  }, [tasks]);

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Tarefas</Text>
            <Text style={styles.subtitle}>
              Organiza o dia como quem trata de negócios.
            </Text>
          </View>
        </View>

        {/* Card de overview */}
        <LinearGradient
          colors={["#1F2937", "#020617"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overviewCard}
        >
          <View style={styles.overviewRow}>
            <View style={styles.overviewBox}>
              <Text style={styles.overviewLabel}>Ativas</Text>
              <Text style={[styles.overviewValue, { color: "#38BDF8" }]}>
                {stats.active}
              </Text>
            </View>
            <View style={styles.overviewBox}>
              <Text style={styles.overviewLabel}>Concluídas</Text>
              <Text style={[styles.overviewValue, { color: "#22C55E" }]}>
                {stats.done}
              </Text>
            </View>
            <View style={styles.overviewBox}>
              <Text style={styles.overviewLabel}>Hoje</Text>
              <Text style={[styles.overviewValue, { color: "#FBBF24" }]}>
                {stats.today}
              </Text>
            </View>
          </View>

          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressTitle}>Progresso geral</Text>
            <Text style={styles.progressPercent}>
              {stats.completion}% concluído
            </Text>
          </View>

          <View style={styles.progressBar}>
            <LinearGradient
              colors={["#22C55E", "#3B82F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressFill,
                { width: `${stats.completion}%` },
              ]}
            />
          </View>

          <Text style={styles.focusText}>
            {stats.focus > 0
              ? `${stats.focus} tarefa(s) de prioridade alta à espera de ti.`
              : "Nenhuma tarefa de prioridade alta pendente. Respira."}
          </Text>
        </LinearGradient>

        {/* Filtros de bucket */}
        <View style={styles.bucketRow}>
          {(
            [
              "hoje",
              "semana",
              "mais_tarde",
              "todas",
            ] as Bucket[]
          ).map((b) => {
            const selected = b === activeBucket;
            return (
              <TouchableOpacity
                key={b}
                activeOpacity={0.85}
                style={[
                  styles.bucketChip,
                  selected && styles.bucketChipActive,
                ]}
                onPress={() => setActiveBucket(b)}
              >
                <Text
                  style={[
                    styles.bucketChipText,
                    selected && styles.bucketChipTextActive,
                  ]}
                >
                  {BUCKET_LABELS[b]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Lista de tarefas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lista</Text>
            <Text style={styles.sectionSubtitle}>
              Toca para concluir ou editar.
            </Text>
          </View>

          <View style={styles.card}>
            {filteredTasks.length === 0 && (
              <Text style={styles.emptyText}>
                Nenhuma tarefa aqui. Cria uma nova e faz inveja aos outros.
              </Text>
            )}

            {filteredTasks.map((task) => {
              const priorityColor =
                task.priority === "alta"
                  ? "#F97373"
                  : task.priority === "media"
                  ? "#FBBF24"
                  : "#22C55E";

              return (
                <View key={task.id} style={styles.taskRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => toggleTaskDone(task.id)}
                    style={styles.taskLeft}
                  >
                    <View style={styles.checkboxWrapper}>
                      {task.done ? (
                        <CheckSquare color="#22C55E" size={22} />
                      ) : (
                        <Square color="#64748B" size={22} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.taskTitle,
                          task.done && styles.taskTitleDone,
                        ]}
                        numberOfLines={1}
                      >
                        {task.title}
                      </Text>
                      <View style={styles.taskMetaRow}>
                        <View style={styles.metaPill}>
                          <Flag color={priorityColor} size={12} />
                          <Text style={styles.metaPillText}>
                            {PRIORITY_LABELS[task.priority]}
                          </Text>
                        </View>
                        {task.dueLabel && (
                          <View style={styles.metaPill}>
                            <Calendar color="#94A3B8" size={12} />
                            <Text style={styles.metaPillText}>
                              {task.dueLabel}
                            </Text>
                          </View>
                        )}
                      </View>
                      {task.notes && (
                        <Text
                          style={styles.taskNotes}
                          numberOfLines={1}
                        >
                          {task.notes}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  <View style={styles.taskActions}>
                    <TouchableOpacity
                      onPress={() => openEditTask(task)}
                      style={styles.iconButton}
                      activeOpacity={0.8}
                    >
                      <Edit3 color="#E5E7EB" size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteTask(task.id)}
                      style={[styles.iconButton, { marginTop: 4 }]}
                      activeOpacity={0.8}
                    >
                      <Trash2 color="#F97373" size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* FAB para nova tarefa */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity activeOpacity={0.9} onPress={openNewTaskModal}>
          <LinearGradient
            colors={["#38BDF8", "#6366F1", "#22C55E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Plus color="#F9FAFB" size={28} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Modal de criação/edição */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ width: "100%" }}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>
                  {editingTask ? "Editar tarefa" : "Nova tarefa"}
                </Text>
                <TouchableOpacity
                  onPress={closeModal}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X color="#9CA3AF" size={20} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Título</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex.: Estudar BD, enviar email, etc."
                  placeholderTextColor="#6B7280"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Notas</Text>
                <TextInput
                  style={[styles.modalInput, { height: 80 }]}
                  placeholder="Detalhes, contexto, o que não queres esquecer."
                  placeholderTextColor="#6B7280"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />
              </View>

              <View style={styles.modalRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Quando</Text>
                  <View style={styles.bucketSelectorRow}>
                    {(
                      ["hoje", "semana", "mais_tarde"] as Bucket[]
                    ).map((b) => {
                      const selected = b === formBucket;
                      return (
                        <TouchableOpacity
                          key={b}
                          onPress={() => setFormBucket(b)}
                          style={[
                            styles.smallChip,
                            selected && styles.smallChipActive,
                          ]}
                          activeOpacity={0.85}
                        >
                          <Text
                            style={[
                              styles.smallChipText,
                              selected && styles.smallChipTextActive,
                            ]}
                          >
                            {BUCKET_LABELS[b]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Prioridade</Text>
                  <View style={styles.bucketSelectorRow}>
                    {(
                      ["alta", "media", "baixa"] as Priority[]
                    ).map((p) => {
                      const selected = p === priority;
                      const color =
                        p === "alta"
                          ? "#F97373"
                          : p === "media"
                          ? "#FBBF24"
                          : "#22C55E";
                      return (
                        <TouchableOpacity
                          key={p}
                          onPress={() => setPriority(p)}
                          style={[
                            styles.smallChip,
                            selected && {
                              backgroundColor: `${color}33`,
                              borderColor: color,
                            },
                          ]}
                          activeOpacity={0.85}
                        >
                          <Text
                            style={[
                              styles.smallChipText,
                              selected && { color },
                            ]}
                          >
                            {PRIORITY_LABELS[p]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  style={styles.modalBtnCancel}
                  onPress={closeModal}
                >
                  <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={styles.modalBtnConfirm}
                  onPress={handleSubmit}
                >
                  <Text style={styles.modalBtnConfirmText}>
                    {editingTask ? "Guardar" : "Adicionar"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  overviewCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#111827",
    marginBottom: 16,
  },
  overviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  overviewBox: {
    flex: 1,
  },
  overviewLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  progressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 4,
    marginBottom: 6,
  },
  progressTitle: {
    fontSize: 13,
    color: "#CBD5E1",
    fontWeight: "600",
  },
  progressPercent: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  progressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#020617",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#0F172A",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  focusText: {
    marginTop: 10,
    fontSize: 12,
    color: "#E5E7EB",
  },
  bucketRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  bucketChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.4)",
  },
  bucketChipActive: {
    backgroundColor: "rgba(56,189,248,0.18)",
    borderColor: "rgba(56,189,248,0.9)",
  },
  bucketChipText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  bucketChipTextActive: {
    color: "#E0F2FE",
  },
  section: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  emptyText: {
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 14,
    fontSize: 13,
  },
  taskRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15,23,42,0.7)",
  },
  taskLeft: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  checkboxWrapper: {
    paddingTop: 2,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E5E7EB",
  },
  taskTitleDone: {
    textDecorationLine: "line-through",
    color: "#6B7280",
  },
  taskMetaRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.9)",
  },
  metaPillText: {
    fontSize: 11,
    color: "#CBD5E1",
  },
  taskNotes: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 3,
  },
  taskActions: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginLeft: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.45)",
  },
  fabWrapper: {
    position: "absolute",
    right: 20,
    bottom: 20,
    zIndex: 40,
  },
  fab: {
    elevation: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    shadowOpacity: 0.18,
    shadowColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    height: 64,
    width: 64,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.75)",
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#020617",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: "#111827",
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E5E7EB",
  },
  modalField: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 13,
    color: "#CBD5E1",
    marginBottom: 4,
  },
  modalInput: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1F2937",
    backgroundColor: "#020617",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#F9FAFB",
  },
  modalRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  bucketSelectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  smallChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.45)",
    backgroundColor: "rgba(15,23,42,0.9)",
  },
  smallChipActive: {
    backgroundColor: "rgba(56,189,248,0.2)",
    borderColor: "rgba(56,189,248,0.9)",
  },
  smallChipText: {
    fontSize: 11,
    color: "#CBD5E1",
    fontWeight: "600",
  },
  smallChipTextActive: {
    color: "#E0F2FE",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.35)",
    backgroundColor: "transparent",
  },
  modalBtnCancelText: {
    textAlign: "center",
    color: "#E5E7EB",
    fontWeight: "500",
  },
  modalBtnConfirm: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    marginLeft: 8,
    backgroundColor: "#22C55E",
  },
  modalBtnConfirmText: {
    textAlign: "center",
    color: "#022C22",
    fontWeight: "700",
  },
});
