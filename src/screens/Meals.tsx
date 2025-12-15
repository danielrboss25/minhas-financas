// src/screens/Meals.tsx
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
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Utensils, CalendarDays, Plus, Flame, Soup, Sandwich } from "lucide-react-native";
import { MotiView } from "moti";

import { useMeals, MealType } from "../context/MealsContext";

type Meal = {
  id: string;
  day: string;
  type: MealType;
  title: string;
  notes?: string;
  calories?: number;
  tag?: string;
  createdAt?: Date | string;
};

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

function parseOptionalNumber(input: string): number | undefined {
  const s = (input ?? "").trim();
  if (!s) return undefined;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export default function MealsScreen({ navigation }: { navigation: any }) {
  const { meals, loading, addMeal } = useMeals();

  const [selectedDay, setSelectedDay] = useState<string>(DAYS[0]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newDay, setNewDay] = useState<string>(selectedDay);
  const [newType, setNewType] = useState<MealType>("Almoço");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [tag, setTag] = useState("");
  const [calories, setCalories] = useState("");

  function resetForm() {
    setNewDay(selectedDay);
    setNewType("Almoço");
    setTitle("");
    setNotes("");
    setTag("");
    setCalories("");
  }

  function openModal() {
    resetForm();
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
  }

 async function onAddMeal() {
    if (!title.trim()) return;

    try {
      await addMeal({
        day: newDay,
        type: newType,
        title: title.trim(),
        notes: notes.trim() || undefined,
        tag: tag.trim() || undefined,
        calories: parseOptionalNumber(calories), // number | undefined (como o teu NewMeal aceita)
      });

      closeModal();
    } catch (e) {
      console.error("Erro ao adicionar refeição:", e);
    }
  }

  const stats = useMemo(() => {
    const total = meals.length;
    const weekDaysPlanned = new Set(meals.map((m) => m.day)).size;
    const recipes = new Set(meals.map((m) => (m.title ?? "").trim())).size;
    return { total, weekDaysPlanned, recipes };
  }, [meals]);

  const mealsForDay = useMemo(() => meals.filter((m) => m.day === selectedDay), [meals, selectedDay]);

  const groupedByType = useMemo(() => {
    const map: Record<MealType, Meal[]> = {
      "Pequeno-almoço": [],
      Almoço: [],
      Jantar: [],
      Snack: [],
    };
    mealsForDay.forEach((m) => {
      map[m.type].push(m);
    });
    return map;
  }, [mealsForDay]);

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
            <Utensils color="#F97316" size={22} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Refeições & Planeamento</Text>
            <Text style={styles.headerSubtitle}>
              Organiza a semana para não viver à base de fast-food e arrependimento.
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Refeições planeadas</Text>
            <Text style={[styles.statValue, { color: "#22C55E" }]}>{stats.total}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Dias com plano</Text>
            <Text style={[styles.statValue, { color: "#38BDF8" }]}>{stats.weekDaysPlanned}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Receitas diferentes</Text>
            <Text style={[styles.statValue, { color: "#FBBF24" }]}>{stats.recipes}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <Text style={[styles.emptyText, { marginTop: 20 }]}>A carregar refeições…</Text>
        )}

        {!loading && (
          <View style={{ marginTop: 16 }}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Plano semanal</Text>
                <CalendarDays color="#9CA3AF" size={16} style={{ marginLeft: 8 }} />
              </View>

              <Text style={styles.sectionSubtitle}>Escolhe o dia para ver as refeições.</Text>
            </View>

            <ScrollView horizontal contentContainerStyle={{ paddingVertical: 6 }} showsHorizontalScrollIndicator={false}>
              {DAYS.map((day) => {
                const selected = selectedDay === day;
                const hasMeals = meals.some((m) => m.day === day);
                return (
                  <TouchableOpacity
                    key={day}
                    activeOpacity={0.85}
                    style={[
                      styles.dayChip,
                      selected && styles.dayChipActive,
                      hasMeals && !selected && styles.dayChipWithMeals,
                    ]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={[styles.dayChipText, selected && styles.dayChipTextActive]}>
                      {day.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {!loading && (
          <View style={{ marginTop: 14 }}>
            {(["Pequeno-almoço", "Almoço", "Jantar", "Snack"] as MealType[]).map((type) => {
              const list = groupedByType[type];
              if (list.length === 0) return null;

              return (
                <View key={type} style={{ marginBottom: 14 }}>
                  <View style={styles.mealTypeHeaderRow}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      {type === "Pequeno-almoço" && <Soup color="#FACC15" size={16} />}
                      {type === "Almoço" && <Flame color="#F97316" size={16} />}
                      {type === "Jantar" && <Utensils color="#60A5FA" size={16} />}
                      {type === "Snack" && <Sandwich color="#A855F7" size={16} />}
                      <Text style={styles.mealTypeTitle}>{type}</Text>
                    </View>
                    <Text style={styles.mealTypeSubtitle}>{list.length} refeição(ões)</Text>
                  </View>

                  {list.map((meal, index) => (
                    <MotiView
                      key={meal.id}
                      from={{ opacity: 0, translateY: 10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ delay: index * 70 }}
                    >
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() =>
                          navigation.navigate("RefeicaoDetalhe", { id: meal.id })
                        }
                        style={{ width: "100%" }}
                      >
                        <View style={styles.mealCard}>
                          <Text style={styles.mealTitle}>{meal.title}</Text>
                          {meal.notes ? <Text style={styles.mealNotes}>{meal.notes}</Text> : null}
                          <View style={styles.mealMetaRow}>
                            {meal.tag && (
                              <View style={styles.tagPill}>
                                <Text style={styles.tagText}>{meal.tag}</Text>
                              </View>
                            )}
                            {typeof meal.calories === "number" && Number.isFinite(meal.calories) && (
                              <Text style={styles.caloriesText}>{Math.round(meal.calories)} kcal</Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    </MotiView>
                  ))}
                </View>
              );
            })}

            {mealsForDay.length === 0 && (
              <Text style={styles.emptyText}>
                Ainda não tens refeições planeadas para {selectedDay}. Adiciona uma para deixares de improvisar.
              </Text>
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
              <View>
                <Text style={styles.modalTitle}>Nova refeição / receita</Text>
                <Text style={styles.modalSubtitle}>
                  Planeia o que vais comer em vez de decidir quando já estás com fome.
                </Text>
              </View>
              <Pressable onPress={closeModal}>
                <Text style={styles.modalCloseText}>Fechar</Text>
              </Pressable>
            </View>

            <View style={{ marginBottom: 10 }}>
              <Text style={styles.modalLabel}>Dia da semana</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
                {DAYS.map((day) => {
                  const selected = newDay === day;
                  return (
                    <TouchableOpacity
                      key={day}
                      activeOpacity={0.85}
                      style={[styles.dayChipSmall, selected && styles.dayChipSmallActive]}
                      onPress={() => setNewDay(day)}
                    >
                      <Text style={[styles.dayChipSmallText, selected && styles.dayChipSmallTextActive]}>
                        {day.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={{ marginBottom: 10 }}>
              <Text style={styles.modalLabel}>Tipo de refeição</Text>
              <View style={styles.mealTypeSelectorRow}>
                {(["Pequeno-almoço", "Almoço", "Jantar", "Snack"] as MealType[]).map((type) => {
                  const selected = newType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      activeOpacity={0.85}
                      style={[styles.mealTypeChip, selected && styles.mealTypeChipActive]}
                      onPress={() => setNewType(type)}
                    >
                      <Text style={[styles.mealTypeChipText, selected && styles.mealTypeChipTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={{ marginBottom: 10 }}>
              <Text style={styles.modalLabel}>Nome da refeição / receita</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex.: Frango grelhado com arroz, Aveia com banana..."
                placeholderTextColor="#6B7280"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={{ marginBottom: 10 }}>
              <Text style={styles.modalLabel}>Notas rápidas</Text>
              <TextInput
                style={[styles.modalInput, { height: 90 }]}
                placeholder="Macros, preparação, truques, alternativas..."
                placeholderTextColor="#6B7280"
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={{ marginBottom: 10, flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalLabel}>Tag</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Saudável, Bulk, Rápido..."
                  placeholderTextColor="#6B7280"
                  value={tag}
                  onChangeText={setTag}
                />
              </View>
              <View style={{ width: 110 }}>
                <Text style={styles.modalLabel}>kcal</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex.: 650"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  value={calories}
                  onChangeText={setCalories}
                />
              </View>
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

              <Pressable style={[styles.modalBtn, { backgroundColor: "#22C55E" }]} onPress={onAddMeal}>
                <Text style={styles.modalBtnText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Mantém os teus estilos exatamente como estavam:
const styles = StyleSheet.create({
  // ... (cola aqui os teus styles tal como estão; não mexi em nada)
  // Para não te entupir a resposta, não dupliquei 200 linhas de estilos.
  // Se quiseres, posso devolver o ficheiro inteiro com styles incluídos.
  root: { flex: 1, backgroundColor: "#020617" },
  header: { paddingTop: 60, paddingBottom: 26, paddingHorizontal: 22, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  headerRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  iconBadge: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(248,113,113,0.08)", borderWidth: 1, borderColor: "rgba(248,113,113,0.4)" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#F9FAFB" },
  headerSubtitle: { marginTop: 4, fontSize: 13, color: "#94A3B8" },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  statBox: { flex: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 14, backgroundColor: "rgba(15,23,42,0.9)", borderWidth: 1, borderColor: "rgba(148,163,184,0.2)" },
  statLabel: { fontSize: 11, color: "#9CA3AF" },
  statValue: { fontSize: 17, fontWeight: "700", marginTop: 2 },
  sectionHeader: { marginBottom: 6 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#E5E7EB" },
  sectionSubtitle: { marginTop: 4, fontSize: 11, color: "#9CA3AF" },
  dayChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(15,23,42,0.95)", borderWidth: 1, borderColor: "rgba(55,65,81,0.9)", marginRight: 8 },
  dayChipWithMeals: { borderColor: "rgba(52,211,153,0.7)" },
  dayChipActive: { backgroundColor: "rgba(56,189,248,0.18)", borderColor: "rgba(56,189,248,1)" },
  dayChipText: { color: "#9CA3AF", fontSize: 12, fontWeight: "600" },
  dayChipTextActive: { color: "#E0F2FE" },
  mealTypeHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  mealTypeTitle: { fontSize: 15, fontWeight: "700", color: "#E5E7EB" },
  mealTypeSubtitle: { fontSize: 11, color: "#9CA3AF" },
  mealCard: { backgroundColor: "rgba(15,23,42,0.98)", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "rgba(30,64,175,0.6)", marginBottom: 8 },
  mealTitle: { fontSize: 14, fontWeight: "700", color: "#F9FAFB" },
  mealNotes: { fontSize: 12, color: "#CBD5E1", marginTop: 4, marginBottom: 6, lineHeight: 18 },
  mealMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tagPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(15,23,42,0.9)", borderWidth: 1, borderColor: "rgba(75,85,99,0.8)" },
  tagText: { fontSize: 11, color: "#E5E7EB", fontWeight: "600" },
  caloriesText: { fontSize: 11, color: "#F59E0B", fontWeight: "600" },
  emptyText: { color: "#6B7280", textAlign: "center", marginTop: 24, fontSize: 13 },
  fabWrapper: { position: "absolute", right: 20, bottom: 20 },
  fab: { height: 64, width: 64, borderRadius: 999, alignItems: "center", justifyContent: "center", shadowColor: "#22C55E", shadowRadius: 14, shadowOpacity: 0.45, shadowOffset: { width: 0, height: 6 }, borderWidth: 1, borderColor: "rgba(148,163,184,0.18)" },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(2,6,23,0.78)", paddingHorizontal: 18 },
  modalCard: { backgroundColor: "#020617", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(30,64,175,0.7)" },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 12 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#E5E7EB" },
  modalSubtitle: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },
  modalCloseText: { fontSize: 12, color: "#9CA3AF" },
  modalLabel: { fontSize: 12, color: "#CBD5E1", marginBottom: 4 },
  modalInput: { backgroundColor: "#0F172A", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: "rgba(51,65,85,0.9)", fontSize: 14, color: "#F9FAFB" },
  dayChipSmall: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(15,23,42,0.95)", borderWidth: 1, borderColor: "rgba(55,65,81,0.9)", marginRight: 8 },
  dayChipSmallActive: { backgroundColor: "rgba(56,189,248,0.22)", borderColor: "rgba(56,189,248,1)" },
  dayChipSmallText: { fontSize: 11, color: "#9CA3AF", fontWeight: "600" },
  dayChipSmallTextActive: { color: "#E0F2FE" },
  mealTypeSelectorRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  mealTypeChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(15,23,42,0.96)", borderWidth: 1, borderColor: "rgba(55,65,81,0.9)" },
  mealTypeChipActive: { backgroundColor: "rgba(34,197,94,0.18)", borderColor: "rgba(34,197,94,0.95)" },
  mealTypeChipText: { fontSize: 12, color: "#9CA3AF", fontWeight: "600" },
  mealTypeChipTextActive: { color: "#ECFDF5" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 10 },
  modalBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: "center" },
  modalBtnText: { color: "#022C22", fontWeight: "700" },
  modalBtnTextSecondary: { color: "#E5E7EB", fontWeight: "600" },
});
