// src/screens/MealDetail.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
} from "lucide-react-native";

type MealType = "Pequeno-almoço" | "Almoço" | "Jantar" | "Snack";

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

type MealDetailProps = {
  navigation: any;
  route: { params: { meal: Meal } };
};

export default function MealDetailScreen({
  navigation,
  route,
}: MealDetailProps) {
  const { meal } = route.params;

  function renderTypeIcon() {
    switch (meal.type) {
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

  const kcalText =
    typeof meal.calories === "number" && Number.isFinite(meal.calories)
      ? `${Math.round(meal.calories)} kcal`
      : "Sem registo";

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com gradiente perigoso */}
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
              <Text style={styles.headerChipText}>Refeição planeada</Text>
            </View>
          </View>

          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerKicker}>Detalhes da refeição</Text>
            <Text style={styles.headerTitle}>{meal.title}</Text>
            <Text style={styles.headerSubtitle}>
              {meal.type} em {meal.day}. Controle absoluto do que enfias no
              prato.
            </Text>
          </View>

          <View style={styles.headerInfoRow}>
            <View style={styles.headerInfoItem}>
              <Text style={styles.headerInfoLabel}>Energia</Text>
              <Text style={[styles.headerInfoValue, { color: "#FBBF24" }]}>
                {kcalText}
              </Text>
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
                  {renderTypeIcon()}
                  <Text style={styles.pillText}>{meal.type}</Text>
                </View>
              </View>
              <Text style={styles.headerInfoHint}>
                Usa isto para distribuir macros ao longo da semana.
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Cartão de tag / “identidade” da refeição */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Identidade da refeição</Text>
            {meal.tag ? (
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
                <Text style={styles.value}>
                  {meal.tag || "Sem tag definida. Podias esforçar-te mais."}
                </Text>
              </View>
              <View style={styles.badgeSoft}>
                {renderTypeIcon()}
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
                <Text style={[styles.value, { color: "#FBBF24" }]}>
                  {kcalText}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notas & preparação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas & preparação</Text>
          <Text style={styles.sectionSubtitle}>
            Onde deixas truques, quantidades e avisos ao teu eu do futuro.
          </Text>

          <View style={[styles.card, { marginTop: 10 }]}>
            <Text style={styles.notesText}>
              {meal.notes && meal.notes.trim().length > 0
                ? meal.notes
                : "Ainda não escreveste nada sobre esta refeição. No dia em que estragares isto à pressa, lembra-te de quem teve culpa."}
            </Text>
          </View>
        </View>

        {/* Secção de resumo rápido / “análise de dano” */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo rápido</Text>
          <Text style={styles.sectionSubtitle}>
            Tradução desta refeição em linguagem de sobrevivência.
          </Text>

          <View style={[styles.card, { marginTop: 10 }]}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryDotGood} />
              <Text style={styles.summaryText}>
                {meal.type === "Pequeno-almoço"
                  ? "Bom para arrancar o dia sem viver à base de café e remorsos."
                  : meal.type === "Almoço"
                  ? "Almoço decente mantém-te funcional para o resto do dia, não em coma."
                  : meal.type === "Jantar"
                  ? "Jantar alinhado evita ir dormir com o estômago a trabalhar horas extra."
                  : "Snack pensado é snack que não assassina o orçamento de calorias."}
              </Text>
            </View>

            {typeof meal.calories === "number" && (
              <View style={styles.summaryRow}>
                <View style={styles.summaryDotWarn} />
                <Text style={styles.summaryText}>
                  Mantém esta refeição dentro do plano diário de calorias. Se o
                  valor começar a subir demais, sabes bem onde está o problema.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContent: {
    paddingBottom: 32,
  },
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
  headerChipText: {
    color: "#BBF7D0",
    fontSize: 11,
    fontWeight: "600",
  },
  headerTitleBlock: {
    marginTop: 16,
  },
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
  headerInfoRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  headerInfoItem: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.95)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.7)",
  },
  headerInfoLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  headerInfoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F9FAFB",
    marginTop: 4,
  },
  headerInfoHint: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
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
  pillText: {
    fontSize: 11,
    color: "#E5E7EB",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 18,
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E5E7EB",
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
  },
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
  label: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  value: {
    fontSize: 14,
    color: "#E5E7EB",
    marginTop: 2,
    fontWeight: "600",
  },
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
  badgeSoftText: {
    fontSize: 11,
    color: "#E0F2FE",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(15,23,42,0.9)",
    marginVertical: 10,
  },
  notesText: {
    fontSize: 13,
    color: "#CBD5E1",
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  summaryDotGood: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 5,
    backgroundColor: "#22C55E",
  },
  summaryDotWarn: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 5,
    backgroundColor: "#F97316",
  },
  summaryText: {
    flex: 1,
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 18,
  },
});
