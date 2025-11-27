// src/screens/home.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Importando useSafeAreaInsets
import {
  Wallet,
  CheckSquare,
  Utensils,
  Lightbulb,
  ArrowRight,
} from "lucide-react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context"; // Importando SafeAreaProvider e SafeAreaView

type HomeScreenProps = {
  navigation: any;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets(); // Usando o SafeAreaInsets para definir o espaço correto

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.root, { paddingTop: insets.top }]}>
        {/* Agora a Safe Area é respeitada */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header com gradiente perigoso */}
          <LinearGradient
            colors={["#111827", "#1F2937", "#0F172A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <Text style={styles.headerTitle}>Bem-vindo de volta</Text>
            <Text style={styles.headerSubtitle}>
              A tua central de comando para dinheiro, tarefas e ideias.
            </Text>

            <View style={styles.headerRow}>
              <View style={styles.headerPill}>
                <View style={styles.headerDot} />
                <Text style={styles.headerPillText}>Modo perigoso ativo</Text>
              </View>

              <View style={styles.headerMiniStats}>
                <View style={styles.headerMiniStat}>
                  <Text style={styles.headerMiniLabel}>Este mês</Text>
                  <Text style={styles.headerMiniValue}>1 000 €</Text>
                </View>
                <View style={styles.headerMiniStat}>
                  <Text style={styles.headerMiniLabel}>Tarefas</Text>
                  <Text style={styles.headerMiniValue}>3 hoje</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Secção de atalhos principais */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Atalhos rápidos</Text>
              <Text style={styles.sectionSubtitle}>
                Vai directo ao que interessa
              </Text>
            </View>

            <View style={styles.grid}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.gridItem}
                onPress={() => navigation.navigate("Finanças")}
              >
                <View style={styles.gridIconWrapper}>
                  <Wallet color="#22C55E" size={22} />
                </View>
                <Text style={styles.gridTitle}>Finanças</Text>
                <Text style={styles.gridText} numberOfLines={2}>
                  Vê o orçamento, movimentos e categorias.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.gridItem}
                onPress={() => navigation.navigate("Tarefas")}
              >
                <View style={styles.gridIconWrapper}>
                  <CheckSquare color="#38BDF8" size={22} />
                </View>
                <Text style={styles.gridTitle}>Tarefas</Text>
                <Text style={styles.gridText} numberOfLines={2}>
                  Lista limpa, cabeça limpa. Ou quase.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.gridItem}
                onPress={() => navigation.navigate("Refeições")}
              >
                <View style={styles.gridIconWrapper}>
                  <Utensils color="#F97316" size={22} />
                </View>
                <Text style={styles.gridTitle}>Refeições</Text>
                <Text style={styles.gridText} numberOfLines={2}>
                  Planeia o que comes sem passar fome nem a conta.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.gridItem}
                onPress={() => navigation.navigate("Ideias")}
              >
                <View style={styles.gridIconWrapper}>
                  <Lightbulb color="#FACC15" size={22} />
                </View>
                <Text style={styles.gridTitle}>Ideias</Text>
                <Text style={styles.gridText} numberOfLines={2}>
                  Guarda as ideias antes que o cérebro faça logout.
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Secção de resumo financeiro rápido */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Resumo rápido</Text>
              <Text style={styles.sectionSubtitle}>
                Só o essencial para hoje
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.miniCard}>
                <Text style={styles.miniLabel}>Saldo estimado</Text>
                <Text style={[styles.miniValue, { color: "#22C55E" }]}>
                  850,00 €
                </Text>
                <Text style={styles.miniHint}>
                  Depois das despesas previstas
                </Text>
              </View>

              <View style={styles.miniCard}>
                <Text style={styles.miniLabel}>Despesas previstas</Text>
                <Text style={[styles.miniValue, { color: "#F97373" }]}>
                  320,00 €
                </Text>
                <Text style={styles.miniHint}>
                  Supermercado, contas e afins
                </Text>
              </View>
            </View>
          </View>

          {/* “Continuar de onde ficaste” */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continuar</Text>
              <Text style={styles.sectionSubtitle}>O que andavas a mexer</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.continueCard}
              onPress={() => navigation.navigate("Finanças")}
            >
              <View>
                <Text style={styles.continueLabel}>Finanças</Text>
                <Text style={styles.continueTitle}>
                  Rever movimentos e orçamento deste mês
                </Text>
                <Text style={styles.continueHint}>Último acesso há pouco</Text>
              </View>
              <ArrowRight color="#9CA3AF" size={20} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
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

  headerCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#111827",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#CBD5E1",
    marginTop: 6,
    lineHeight: 20,
  },
  headerRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(22,163,74,0.18)",
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },
  headerPillText: {
    fontSize: 12,
    color: "#BBF7D0",
    fontWeight: "600",
  },
  headerMiniStats: {
    flexDirection: "row",
    gap: 12,
  },
  headerMiniStat: {
    alignItems: "flex-end",
  },
  headerMiniLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  headerMiniValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E5E7EB",
    marginTop: 2,
  },

  section: {
    marginBottom: 22,
  },
  sectionHeader: {
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
    marginTop: 2,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    flexBasis: "48%",
    backgroundColor: "#020617",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111827",
    padding: 14,
  },
  gridIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E5E7EB",
    marginBottom: 4,
  },
  gridText: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  row: {
    flexDirection: "row", // Define a direção dos itens como linha (horizontal)
    justifyContent: "space-between", // Espaça igualmente os itens
    alignItems: "center", // Alinha os itens verticalmente ao centro
    marginBottom: 22, // Espaço inferior
  },

  miniCard: {
    flex: 1,
    backgroundColor: "#020617",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111827",
    padding: 14,
  },
  miniLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  miniValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
    marginTop: 4,
  },
  miniHint: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },

  continueCard: {
    backgroundColor: "#020617",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111827",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  continueLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  continueTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E5E7EB",
    marginTop: 2,
  },
  continueHint: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
});
