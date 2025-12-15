// src/screens/MealDetail.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Utensils,
  CalendarDays,
  Flame,
  Soup,
  Sandwich,
  Tag as TagIcon,
  ArrowLeft,
  Pencil,
  Trash2,
  Save,
} from "lucide-react-native";

import { useMeals, MealType } from "../context/MealsContext";

// Converte texto para número (aceita vírgula). Se inválido, devolve undefined.
function parseOptionalNumber(input: string): number | undefined {
  const s = (input ?? "").trim();
  if (!s) return undefined;

  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

type MealDetailProps = {
  navigation: any;
  route: { params: { id: string } };
};

export default function MealDetailScreen({ navigation, route }: MealDetailProps) {
  const { id } = route.params;

  const { meals, updateMeal, deleteMeal } = useMeals();
  const meal = useMemo(() => meals.find((m) => m.id === id), [meals, id]);

  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [tag, setTag] = useState("");
  const [calories, setCalories] = useState("");

  // Se a refeição desaparecer (ex.: apagada noutro ecrã), recua com segurança.
  useEffect(() => {
    if (!meal) navigation.goBack();
  }, [meal, navigation]);

  // Sempre que o meal mudar (ou ao entrar), hidrata os estados locais.
  useEffect(() => {
    if (!meal) return;
    setTitle(meal.title ?? "");
    setNotes(meal.notes ?? "");
    setTag(meal.tag ?? "");
    setCalories(
      typeof meal.calories === "number" && Number.isFinite(meal.calories)
        ? String(meal.calories)
        : ""
    );
  }, [meal]);

  if (!meal) return null;

  const kcalText =
    meal.calories != null && Number.isFinite(meal.calories)
      ? `${meal.calories} kcal`
      : "—";

  function renderTypeIcon(t: MealType) {
    switch (t) {
      case "Pequeno-almoço":
        return <Soup color="#FACC15" size={18} />;
      case "Almoço":
        return <Flame color="#F97316" size={18} />;
      case "Jantar":
        return <Utensils color="#60A5FA" size={18} />;
      case "Snack":
      default:
        return <Sandwich color="#A855F7" size={18} />;
    }
  }

  async function onSave() {
    if (!title.trim()) {
      Alert.alert("Erro", "O título não pode estar vazio.");
      return;
    }

    try {
      const kcal = parseOptionalNumber(calories);

      await updateMeal(meal.id, {
        title: title.trim(),
        notes: notes.trim(),
        tag: (tag.trim() || "Sem tag") as any,
        calories: kcal,
      });

      setEditing(false);
      navigation.goBack();
    } catch (e) {
      console.error("Erro ao guardar refeição:", e);
      Alert.alert("Erro", "Não foi possível guardar as alterações.");
    }
  }

  function onDelete() {
    Alert.alert(
      "Apagar refeição",
      "Tens a certeza que queres eliminar esta refeição? Esta ação é irreversível.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMeal(meal.id);
              navigation.goBack();
            } catch (e) {
              console.error("Erro ao apagar refeição:", e);
              Alert.alert("Erro", "Não foi possível apagar a refeição.");
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#1F2937", "#020617"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.9}
              style={styles.backButton}
            >
              <ArrowLeft color="#E5E7EB" size={20} />
            </TouchableOpacity>

            <View style={styles.headerChipRight}>
              <View style={styles.headerChipDot} />
              <Text style={styles.headerChipText}>
                {editing ? "A editar" : "Refeição planeada"}
              </Text>
            </View>
          </View>

          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerKicker}>Detalhes da refeição</Text>

            {editing ? (
              <TextInput
                value={title}
                onChangeText={setTitle}
                style={styles.inputHeader}
                placeholder="Título"
                placeholderTextColor="#6B7280"
              />
            ) : (
              <Text style={styles.headerTitle}>{meal.title}</Text>
            )}

            <Text style={styles.headerSubtitle}>
              {meal.type} em {meal.day}. Controle absoluto do que enfias no prato.
            </Text>
          </View>

          <View style={styles.headerInfoRow}>
            <View style={styles.headerInfoItem}>
              <Text style={styles.headerInfoLabel}>Energia</Text>

              {editing ? (
                <TextInput
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  style={styles.inputSmall}
                  placeholder="kcal"
                  placeholderTextColor="#6B7280"
                />
              ) : (
                <Text style={[styles.headerInfoValue, { color: "#FBBF24" }]}>
                  {kcalText}
                </Text>
              )}

              <Text style={styles.headerInfoHint}>
                Valor aproximado para esta refeição.
              </Text>
            </View>

            <View style={styles.headerInfoItem}>
              <Text style={styles.headerInfoLabel}>Dia & tipo</Text>
              <View style={styles.pillRow}>
                <View style={styles.pill}>
                  <CalendarDays color="#38BDF8" size={14} />
                  <Text style={styles.pillText}>{meal.day}</Text>
                </View>
                <View style={styles.pill}>
                  {renderTypeIcon(meal.type)}
                  <Text style={styles.pillText}>{meal.type}</Text>
                </View>
              </View>
              <Text style={styles.headerInfoHint}>
                Usa isto para distribuir macros ao longo da semana.
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Identidade da refeição</Text>

            {!editing && meal.tag ? (
              <View style={styles.tagBadge}>
                <TagIcon color="#22C55E" size={14} />
                <Text style={styles.tagBadgeText}>{meal.tag}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Categoria / Tag</Text>
                {editing ? (
                  <TextInput
                    value={tag}
                    onChangeText={setTag}
                    style={styles.input}
                    placeholder="Tag"
                    placeholderTextColor="#6B7280"
                  />
                ) : (
                  <Text style={styles.value}>{meal.tag || "Sem tag definida."}</Text>
                )}
              </View>

              <View style={styles.badgeSoft}>
                {renderTypeIcon(meal.type)}
                <Text style={styles.badgeSoftText}>{meal.type}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.label}>Dia da semana</Text>
                <Text style={styles.value}>{meal.day}</Text>
              </View>
              <View>
                <Text style={styles.label}>Calorias estimadas</Text>
                <Text style={[styles.value, { color: "#FBBF24" }]}>{kcalText}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas & preparação</Text>
          <Text style={styles.sectionSubtitle}>
            Onde deixas truques, quantidades e avisos ao teu eu do futuro.
          </Text>

          <View style={[styles.card, { marginTop: 10 }]}>
            {editing ? (
              <TextInput
                value={notes}
                onChangeText={setNotes}
                style={[styles.input, { height: 140 }]}
                multiline
                textAlignVertical="top"
                placeholder="Notas..."
                placeholderTextColor="#6B7280"
              />
            ) : (
              <Text style={styles.notesText}>
                {meal.notes && meal.notes.trim().length > 0
                  ? meal.notes
                  : "Ainda não escreveste nada sobre esta refeição."}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        {!editing ? (
          <>
            <TouchableOpacity
              style={[styles.btn, styles.btnEdit]}
              onPress={() => setEditing(true)}
            >
              <Pencil color="#38BDF8" size={20} />
              <Text style={styles.btnText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnDelete]}
              onPress={onDelete}
            >
              <Trash2 color="#F87171" size={20} />
              <Text style={[styles.btnText, { color: "#FCA5A5" }]}>Apagar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={onSave}>
            <Save color="#ECFDF5" size={20} />
            <Text style={[styles.btnText, { color: "#ECFDF5" }]}>Guardar</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020617" },
  scrollContent: { paddingBottom: 110 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.6)",
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.4)",
  },
  headerChipRight: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.12)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.7)",
  },
  headerChipDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },
  headerChipText: { color: "#BBF7D0", fontSize: 11, fontWeight: "600" },

  headerTitleBlock: { marginTop: 16 },
  headerKicker: {
    fontSize: 11,
    color: "#9CA3AF",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F9FAFB",
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#CBD5E1",
    marginTop: 4,
    lineHeight: 20,
  },

  headerInfoRow: { marginTop: 16, flexDirection: "row", gap: 12 },
  headerInfoItem: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.95)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.7)",
  },
  headerInfoLabel: { fontSize: 11, color: "#9CA3AF" },
  headerInfoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F9FAFB",
    marginTop: 4,
  },
  headerInfoHint: { fontSize: 11, color: "#6B7280", marginTop: 4 },

  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.35)",
  },
  pillText: { fontSize: 11, color: "#E5E7EB", fontWeight: "600" },

  section: { paddingHorizontal: 18, marginTop: 20 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#E5E7EB" },
  sectionSubtitle: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },

  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.7)",
    backgroundColor: "rgba(22,163,74,0.18)",
  },
  tagBadgeText: {
    marginLeft: 6,
    fontSize: 11,
    color: "#BBF7D0",
    fontWeight: "600",
  },

  card: {
    marginTop: 10,
    backgroundColor: "#020617",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 11, color: "#9CA3AF" },
  value: { fontSize: 14, color: "#E5E7EB", marginTop: 2, fontWeight: "600" },

  badgeSoft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(30,64,175,0.25)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.7)",
  },
  badgeSoftText: { fontSize: 11, color: "#E0F2FE", fontWeight: "600" },

  divider: {
    height: 1,
    backgroundColor: "rgba(15,23,42,0.9)",
    marginVertical: 10,
  },
  notesText: { fontSize: 13, color: "#CBD5E1", lineHeight: 20 },

  input: {
    marginTop: 6,
    backgroundColor: "#0F172A",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#E2E8F0",
  },
  inputHeader: {
    marginTop: 6,
    backgroundColor: "rgba(15,23,42,0.95)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  inputSmall: {
    marginTop: 6,
    backgroundColor: "#0F172A",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#E2E8F0",
  },

  actionBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "rgba(2,6,23,0.9)",
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  btnText: { fontWeight: "700", color: "#F9FAFB" },
  btnEdit: {
    flex: 0,
    paddingHorizontal: 24,
    backgroundColor: "rgba(56,189,248,0.12)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.4)",
  },
  btnDelete: {
    backgroundColor: "rgba(248,113,113,0.12)",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.4)",
  },
  btnSave: { backgroundColor: "#22C55E" },
});
