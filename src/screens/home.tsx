import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Wallet, CheckSquare, Utensils, Lightbulb } from 'lucide-react-native';
import StatCard from '../components/Statcard';
import { colors, radius, space } from '../theme/theme';

function Shortcut({
  title, subtitle, icon, onPress,
}: { title: string; subtitle?: string; icon: React.ReactNode; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.tile,
      { borderColor: pressed ? colors.primary2 : colors.border }
    ]}>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.tileTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.tileSub}>{subtitle}</Text>}
      </View>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Cabeçalho com gradiente escuro subtil */}
      <LinearGradient
        colors={['#0B0F14', '#0B0F14', '#0d1218']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.brand}>Mobile HQ</Text>
        <Text style={styles.subtitle}>Painel pessoal rápido</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }}>
        {/* Estatísticas em “glass” usando o teu StatCard */}
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <StatCard title="Orçamento" value="1 000,00 €" color={colors.primary} />
          <StatCard title="Esta semana" value="3 tarefas" color={colors.primary2} />
        </View>

        {/* Atalhos grandes */}
        <View style={{ gap: space.md }}>
          <Shortcut
            title="Finanças" subtitle="Saldo e despesas"
            icon={<Wallet color={colors.text} size={22} />}
            onPress={() => nav.navigate('Finanças')}
          />
          <Shortcut
            title="Tarefas" subtitle="Hoje e próximas"
            icon={<CheckSquare color={colors.text} size={22} />}
            onPress={() => nav.navigate('Tarefas')}
          />
          <Shortcut
            title="Refeições" subtitle="Plano semanal"
            icon={<Utensils color={colors.text} size={22} />}
            onPress={() => nav.navigate('Refeições')}
          />
          <Shortcut
            title="Ideias" subtitle="Notas & rascunhos"
            icon={<Lightbulb color={colors.text} size={22} />}
            onPress={() => nav.navigate('Ideias')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg } as ViewStyle,
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.md,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  } as ViewStyle,
  brand: { color: colors.text, fontWeight: '800', fontSize: 18 } as TextStyle,
  subtitle: { color: colors.sub, fontSize: 13, marginTop: 4 } as TextStyle,

  tile: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  } as ViewStyle,
  iconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  } as ViewStyle,
  tileTitle: { color: colors.text, fontWeight: '800', fontSize: 16 } as TextStyle,
  tileSub: { color: colors.sub, fontSize: 12, marginTop: 2 } as TextStyle,
  chev: { color: colors.sub, fontSize: 22, fontWeight: '900' } as TextStyle,
});
