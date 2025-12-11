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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  Wallet,
  CheckSquare,
  Utensils,
  Lightbulb,
  ArrowRight,
  Flame,
  Sparkles,
  Activity,
} from "lucide-react-native";
import { MotiView } from "moti";

type HomeScreenProps = {
  navigation: any;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();

  // mocks para já; depois ligas a dados reais
  const saldoEstimado = 850;
  const tarefasHoje = 3;
  const refeicoesPlaneadas = 2;
  const ideiasFixadas = 1;

  return (
    <SafeAreaView
      style={styles.root}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* =================== HERO / LINHA DO MESTRE =================== */}
        <MotiView
          from={{ opacity: 0, translateY: 16, scale: 0.96 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: "timing", duration: 350 }}
          style={styles.heroWrapper}
        >
          {/* outline com ligeiro brilho em gradiente */}
          <LinearGradient
            colors={["#22C55E33", "#38BDF833", "#020617"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroOutline}
          >
            <LinearGradient
              colors={["#020617", "#020617"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroEyebrow}>PAINEL DO MESTRE</Text>
                  <Text style={styles.heroTitle}>Linha de comando diária</Text>
                  <Text style={styles.heroSubtitle}>
                    Hoje é para tratar de dinheiro, tarefas e comida como gente
                    grande. Depois logo vês séries.
                  </Text>
                </View>

                {/* Modo perigoso com badge compacto e pulso */}
                <MotiView
                  from={{ scale: 1, opacity: 0.9 }}
                  animate={{ scale: 1.06, opacity: 1 }}
                  transition={{
                    type: "timing",
                    duration: 1400,
                    loop: true,
                    repeatReverse: true,
                  }}
                >
                  <View style={styles.modeChip}>
                    <View style={styles.modePulseOuter}>
                      <View style={styles.modeDot} />
                    </View>
                    <View>
                      <Text style={styles.modeLabel}>Modo</Text>
                      <Text style={styles.modeValue}>Perigoso</Text>
                    </View>
                  </View>
                </MotiView>
              </View>

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Equilíbrio</Text>
                  <Text style={[styles.heroStatValue, { color: "#22C55E" }]}>
                    {saldoEstimado.toFixed(0)} € livres
                  </Text>
                  <Text style={styles.heroStatHint}>
                    Depois das despesas normais deste mês.
                  </Text>
                </View>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Carga de hoje</Text>
                  <Text style={[styles.heroStatValue, { color: "#38BDF8" }]}>
                    {tarefasHoje} tarefas-chave
                  </Text>
                  <Text style={styles.heroStatHint}>
                    Se fizeres estas, o resto é lucro psicológico.
                  </Text>
                </View>
              </View>

              <View style={styles.heroChipsRow}>
                <View style={styles.heroChip}>
                  <Activity color="#22C55E" size={14} />
                  <Text style={styles.heroChipText}>Dia útil em andamento</Text>
                </View>
                <View style={styles.heroChip}>
                  <Flame color="#F97316" size={14} />
                  <Text style={styles.heroChipText}>
                    {refeicoesPlaneadas} refeições planeadas
                  </Text>
                </View>
                <View style={styles.heroChip}>
                  <Sparkles color="#FACC15" size={14} />
                  <Text style={styles.heroChipText}>
                    {ideiasFixadas} ideia fixada
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </LinearGradient>
        </MotiView>

        {/* =================== RADAR DO DIA (CARROSSEL) =================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Radar do dia</Text>
              <Text style={styles.sectionSubtitle}>
                O que merece atenção antes de te distraíres.
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {/* Card Finanças */}
            <MotiView
              from={{ opacity: 0, translateY: 12, scale: 0.95 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "timing", duration: 320 }}
            >
              <TouchableOpacity
                style={[styles.radarCard, { marginRight: 10 }]}
                activeOpacity={0.9}
                onPress={() => navigation.navigate("FinancasStack")}
              >
                <View style={styles.radarIconCircle}>
                  <Wallet color="#22C55E" size={20} />
                </View>
                <Text style={styles.radarLabel}>Finanças</Text>
                <Text style={styles.radarValue}>
                  {saldoEstimado.toFixed(0)} € estimados
                </Text>
                <Text style={styles.radarHint}>
                  Revê movimentos e orçamento antes de inventar compras.
                </Text>
              </TouchableOpacity>
            </MotiView>

            {/* Card Tarefas */}
            <MotiView
              from={{ opacity: 0, translateY: 12, scale: 0.95 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "timing", duration: 340 }}
            >
              <TouchableOpacity
                style={[styles.radarCard, { marginRight: 10 }]}
                activeOpacity={0.9}
                onPress={() => navigation.navigate("Tarefas")}
              >
                <View style={styles.radarIconCircle}>
                  <CheckSquare color="#38BDF8" size={20} />
                </View>
                <Text style={styles.radarLabel}>Tarefas</Text>
                <Text style={styles.radarValue}>{tarefasHoje} pendentes</Text>
                <Text style={styles.radarHint}>
                  Começa pelas que mexem com dinheiro ou faculdade.
                </Text>
              </TouchableOpacity>
            </MotiView>

            {/* Card Refeições */}
            <MotiView
              from={{ opacity: 0, translateY: 12, scale: 0.95 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "timing", duration: 360 }}
            >
              <TouchableOpacity
                style={[styles.radarCard, { marginRight: 10 }]}
                activeOpacity={0.9}
                onPress={() => navigation.navigate("Refeicoes")}
              >
                <View style={styles.radarIconCircle}>
                  <Utensils color="#F97316" size={20} />
                </View>
                <Text style={styles.radarLabel}>Refeições</Text>
                <Text style={styles.radarValue}>
                  {refeicoesPlaneadas} planeadas
                </Text>
                <Text style={styles.radarHint}>
                  Garante almoço e jantar decentes para aguentar o treino.
                </Text>
              </TouchableOpacity>
            </MotiView>

            {/* Card Ideias */}
            <MotiView
              from={{ opacity: 0, translateY: 12, scale: 0.95 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "timing", duration: 380 }}
            >
              <TouchableOpacity
                style={styles.radarCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate("Ideias")}
              >
                <View style={styles.radarIconCircle}>
                  <Lightbulb color="#FACC15" size={20} />
                </View>
                <Text style={styles.radarLabel}>Ideias</Text>
                <Text style={styles.radarValue}>
                  {ideiasFixadas} foco ativo
                </Text>
                <Text style={styles.radarHint}>
                  Reabre a última ideia boa antes que o cérebro a apague.
                </Text>
              </TouchableOpacity>
            </MotiView>
          </ScrollView>
        </View>

        {/* =================== MÓDULOS PRINCIPAIS =================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Módulos principais</Text>
              <Text style={styles.sectionSubtitle}>
                Entra no cockpit certo em dois toques.
              </Text>
            </View>
          </View>

          <View style={styles.modulesGrid}>
            {/* Finanças */}
            <MotiView
              from={{ opacity: 0, translateY: 10, scale: 0.96 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "timing", duration: 320 }}
              style={styles.moduleCard}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={0.9}
                onPress={() => navigation.navigate("FinancasStack")}
              >
                <View style={styles.moduleIconRow}>
                  <View style={styles.moduleIconBadge}>
                    <Wallet color="#22C55E" size={22} />
                  </View>
                  <Text style={styles.moduleTag}>Essencial</Text>
                </View>
                <Text style={styles.moduleTitle}>Finanças</Text>
                <Text style={styles.moduleText}>
                  Orçamento, movimentos e noção real de quanto podes
                  estragar-te.
                </Text>
                <View style={styles.moduleFooterRow}>
                  <Text style={styles.moduleFooterText}>
                    Abrir resumo deste mês
                  </Text>
                  <ArrowRight color="#9CA3AF" size={18} />
                </View>
              </TouchableOpacity>
            </MotiView>

            {/* Tarefas */}
            <MotiView
              from={{ opacity: 0, translateY: 10, scale: 0.96 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "timing", duration: 340 }}
              style={styles.moduleCard}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={0.9}
                onPress={() => navigation.navigate("Tarefas")}
              >
                <View style={styles.moduleIconRow}>
                  <View style={styles.moduleIconBadge}>
                    <CheckSquare color="#38BDF8" size={22} />
                  </View>
                </View>
                <Text style={styles.moduleTitle}>Tarefas</Text>
                <Text style={styles.moduleText}>
                  Lista limpa, cabeça limpa. Ou pelo menos com menos ruído.
                </Text>
                <Text style={styles.moduleSmallHint}>
                  {tarefasHoje} para terminar hoje.
                </Text>
              </TouchableOpacity>
            </MotiView>

            {/* Refeições */}
            <MotiView
              from={{ opacity: 0, translateY: 10, scale: 0.96 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "timing", duration: 360 }}
              style={styles.moduleCard}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={0.9}
                onPress={() => navigation.navigate("Refeicoes")}
              >
                <View style={styles.moduleIconRow}>
                  <View style={styles.moduleIconBadge}>
                    <Utensils color="#F97316" size={22} />
                  </View>
                </View>
                <Text style={styles.moduleTitle}>Refeições</Text>
                <Text style={styles.moduleText}>
                  Planeia a semana para não viver à base de fast-food e culpa.
                </Text>
                <Text style={styles.moduleSmallHint}>
                  {refeicoesPlaneadas} refeições alinhadas.
                </Text>
              </TouchableOpacity>
            </MotiView>

            {/* Ideias */}
            <MotiView
              from={{ opacity: 0, translateY: 10, scale: 0.96 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "timing", duration: 380 }}
              style={styles.moduleCard}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={0.9}
                onPress={() => navigation.navigate("Ideias")}
              >
                <View style={styles.moduleIconRow}>
                  <View style={styles.moduleIconBadge}>
                    <Lightbulb color="#FACC15" size={22} />
                  </View>
                </View>
                <Text style={styles.moduleTitle}>Ideias & Notas</Text>
                <Text style={styles.moduleText}>
                  Guarda conceitos rápidos, planos doidos e notas de estudo.
                </Text>
                <Text style={styles.moduleSmallHint}>
                  {ideiasFixadas} ideia fixada para retomar.
                </Text>
              </TouchableOpacity>
            </MotiView>
          </View>
        </View>

        {/* =================== TIMELINE DE HOJE =================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Timeline de hoje</Text>
              <Text style={styles.sectionSubtitle}>
                Passos sugeridos para não andares aos tiros no escuro.
              </Text>
            </View>
          </View>

          <View style={styles.timelineCard}>
            <Text style={styles.timelineLabel}>Passo 1 · Finanças</Text>
            <Text style={styles.timelineTitle}>
              Confirmar saldo e movimentos do mês
            </Text>
            <Text style={styles.timelineHint}>
              Abre a vista de movimentos, marca o que já está pago e vê se ainda
              podes combinar jantar fora sem vender a câmara.
            </Text>
          </View>

          <View style={styles.timelineCard}>
            <Text style={styles.timelineLabel}>Passo 2 · Tarefas</Text>
            <Text style={styles.timelineTitle}>
              Escolher 3 tarefas que vão mesmo acontecer
            </Text>
            <Text style={styles.timelineHint}>
              Vai às Tarefas, marca só o essencial para hoje e esquece o resto
              por agora.
            </Text>
          </View>

          <View style={styles.timelineCard}>
            <Text style={styles.timelineLabel}>
              Passo 3 · Refeições & Ideias
            </Text>
            <Text style={styles.timelineTitle}>
              Garantir comida decente e 1 ideia criativa
            </Text>
            <Text style={styles.timelineHint}>
              Confirma o plano de refeições e abre Ideias para registar qualquer
              coisa que o cérebro ainda não matou.
            </Text>
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
    paddingHorizontal: 18,
    paddingBottom: 90,
  },

  /* HERO */
  heroWrapper: {
    marginBottom: 18,
  },
  heroOutline: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#111827",
  },
  heroCard: {
    borderRadius: 24,
    padding: 18,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },
  heroEyebrow: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#6B7280",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
    lineHeight: 19,
  },

  // novo modo perigoso
  modeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(22,163,74,0.16)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.9)",
  },
  modePulseOuter: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.6)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  modeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#22C55E",
  },
  modeLabel: {
    fontSize: 10,
    color: "#BBF7D0",
  },
  modeValue: {
    fontSize: 12,
    color: "#BBF7D0",
    fontWeight: "700",
  },

  heroStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  heroStat: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "rgba(15,23,42,0.96)",
    borderWidth: 1,
    borderColor: "rgba(31,41,55,0.9)",
  },
  heroStatLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  heroStatValue: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 4,
    color: "#F9FAFB",
  },
  heroStatHint: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  heroChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  heroChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.98)",
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.9)",
  },
  heroChipText: {
    fontSize: 11,
    color: "#E5E7EB",
  },

  /* SECÇÕES */
  section: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  /* RADAR DO DIA */
  radarCard: {
    width: 210,
    backgroundColor: "#020617",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111827",
    padding: 14,
  },
  radarIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.95)",
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.7)",
    marginBottom: 10,
  },
  radarLabel: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  radarValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E5E7EB",
    marginTop: 2,
  },
  radarHint: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 6,
    lineHeight: 16,
  },

  /* MÓDULOS PRINCIPAIS */
  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  moduleCard: {
    flexBasis: "48%",
    backgroundColor: "#020617",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111827",
    padding: 14,
  },
  moduleIconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  moduleIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.95)",
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.7)",
  },
  moduleTag: {
    fontSize: 11,
    color: "#4ADE80",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.7)",
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E5E7EB",
    marginBottom: 4,
  },
  moduleText: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 18,
  },
  moduleSmallHint: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 6,
  },
  moduleFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  moduleFooterText: {
    fontSize: 12,
    color: "#E5E7EB",
  },

  /* TIMELINE */
  timelineCard: {
    backgroundColor: "#020617",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111827",
    padding: 14,
    marginBottom: 10,
  },
  timelineLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E5E7EB",
    marginBottom: 4,
  },
  timelineHint: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
});
