// src/screens/IdeaDetail.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Pencil, Trash2, Save, ArrowLeft } from "lucide-react-native";

import { useIdeas } from "../context/IdeasContext";

export default function IdeaDetail({ route, navigation }: any) {
  const { id }: { id: string } = route.params;

  const { ideas, updateIdea, deleteIdea } = useIdeas();

  const idea = useMemo(() => ideas.find((x) => x.id === id), [ideas, id]);

  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState(idea?.title ?? "");
  const [content, setContent] = useState(idea?.content ?? "");
  const [tag, setTag] = useState(idea?.tag ?? "");

  // Se a ideia já não existir (apagada noutro lado), volta atrás.
  if (!idea) {
    // evita loop de render: faz goBack numa microtask
    queueMicrotask(() => navigation.goBack());
    return null;
  }

  async function saveChanges() {
    if (!title.trim()) {
      Alert.alert("Erro", "O título não pode estar vazio.");
      return;
    }

    try {
      await updateIdea(idea.id, {
        title: title.trim(),
        content: content.trim(),
        tag: tag.trim() || "Sem tag",
      });

      setEditing(false);
      navigation.goBack();
    } catch (e) {
      console.error("Erro ao guardar ideia:", e);
      Alert.alert("Erro", "Não foi possível guardar as alterações.");
    }
  }

  function onDelete() {
    Alert.alert(
      "Apagar ideia",
      "Tens a certeza que queres eliminar esta ideia? Esta ação é irreversível.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteIdea(idea.id);
              navigation.goBack();
            } catch (e) {
              console.error("Erro ao apagar:", e);
              Alert.alert("Erro", "Não foi possível apagar a ideia.");
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#1F2937", "#020617"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color="#F9FAFB" size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editing ? "Editar Ideia" : "Detalhe da Ideia"}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Título</Text>
          {editing ? (
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              placeholder="Título da ideia"
              placeholderTextColor="#6B7280"
            />
          ) : (
            <Text style={styles.cardValue}>{idea.title}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Conteúdo</Text>
          {editing ? (
            <TextInput
              multiline
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
              style={[styles.input, { height: 140 }]}
              placeholder="Descrição, notas, contexto..."
              placeholderTextColor="#6B7280"
            />
          ) : (
            <Text style={styles.cardValue}>
              {idea.content || "Sem conteúdo"}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Tag</Text>
          {editing ? (
            <TextInput
              value={tag}
              onChangeText={setTag}
              style={styles.input}
              placeholder="Ex.: Negócio, Fitness, Música..."
              placeholderTextColor="#6B7280"
            />
          ) : (
            <Text style={styles.cardTag}>{idea.tag || "Sem tag"}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Criada em</Text>
          <Text style={styles.cardValue}>
            {new Date(idea.created_at).toLocaleString("pt-PT")}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        {!editing ? (
          <>
            <TouchableOpacity
              style={[styles.btn, styles.btnEdit]}
              onPress={() => {
                setTitle(idea.title);
                setContent(idea.content);
                setTag(idea.tag);
                setEditing(true);
              }}
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
          <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={saveChanges}>
            <Save color="#ECFDF5" size={20} />
            <Text style={[styles.btnText, { color: "#ECFDF5" }]}>Guardar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020617" },
  scrollContent: { paddingBottom: 100, padding: 18 },
  header: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 18,
    borderBottomRightRadius: 22,
    borderBottomLeftRadius: 22,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#F9FAFB" },

  card: {
    backgroundColor: "rgba(15,23,42,0.95)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.5)",
  },
  cardLabel: { color: "#9CA3AF", fontSize: 12, marginBottom: 6 },
  cardValue: { color: "#F9FAFB", fontSize: 15, fontWeight: "600" },
  cardTag: { color: "#38BDF8", fontSize: 14, fontWeight: "600" },

  input: {
    backgroundColor: "#0F172A",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 10,
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
