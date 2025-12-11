import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  // Platform não é estritamente necessário se não for usado no styles ou na lógica, mas pode ser mantido.
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Pencil, Trash2, Save, ArrowLeft } from "lucide-react-native";
import { execSql } from "../db"; // Aqui é a função que vai interagir com o SQLite

type Idea = {
  id: string;
  title: string;
  description?: string;
  tag?: string;
  createdAt: string;
};

export default function IdeaDetail({ route, navigation }: any) {
  const { idea }: { idea: Idea } = route.params;

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(idea.title);
  const [description, setDescription] = useState(idea.description ?? "");
  const [tag, setTag] = useState(idea.tag ?? "");

  async function saveChanges() {
    // Validação básica
    if (!title || title.trim() === "") {
      Alert.alert("Erro", "O título não pode estar vazio.");
      return;
    }

    try {
      // 1. Gravar na Base de Dados
      await execSql(
        `UPDATE ideas SET title = ?, description = ?, tag = ? WHERE id = ?`,
        [title, description, tag, idea.id]
      );

      // 2. Mudar para o modo de visualização (importante)
      setEditing(false);

      // 3. Navegar de volta ou sinalizar a atualização (sem Alert de sucesso!)
      // O parâmetro refresh: true é uma boa prática para forçar a lista a recarregar.
      navigation.navigate("Ideias", { refresh: true });

      // *** REMOVIDO: Alert.alert("Guardado", "As alterações foram guardadas."); ***
    } catch (e) {
      console.error("Erro ao guardar ideia:", e);
      // Mantém Alert SOMENTE em caso de erro real na base de dados
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    }
  }

  function deleteIdea() {
    Alert.alert(
      "Apagar ideia",
      "Tens a certeza que queres eliminar esta ideia? Esta ação é irreversível.", // Texto ligeiramente melhorado
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Apagar da Base de Dados
              await execSql(`DELETE FROM ideas WHERE id = ?;`, [idea.id]);

              // 2. Voltar para a ecrã anterior (lista de ideias)
              navigation.goBack();

              // *** REMOVIDO: Alert.alert("Eliminado", "A ideia foi apagada com sucesso."); ***
            } catch (e) {
              console.error("Erro ao apagar:", e);
              // Mantém Alert SOMENTE em caso de erro real na base de dados
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
        {/* TÍTULO */}
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
            <Text style={styles.cardValue}>{title}</Text>
          )}
        </View>

        {/* DESCRIÇÃO */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Descrição</Text>
          {editing ? (
            <TextInput
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, { height: 140 }]}
              placeholder="Descrição, notas, contexto..."
              placeholderTextColor="#6B7280"
            />
          ) : (
            <Text style={styles.cardValue}>
              {description || "Sem descrição"}
            </Text>
          )}
        </View>

        {/* TAG */}
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
            <Text style={styles.cardTag}>{tag || "Sem tag"}</Text>
          )}
        </View>

        {/* DATA */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Criada em</Text>
          <Text style={styles.cardValue}>
            {new Date(idea.createdAt).toLocaleString("pt-PT")}
          </Text>
        </View>
      </ScrollView>

      {/* ACTION BAR */}
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
              onPress={deleteIdea}
            >
              <Trash2 color="#F87171" size={20} />
              <Text style={[styles.btnText, { color: "#FCA5A5" }]}>Apagar</Text>
            </TouchableOpacity>
          </>
        ) : (
          // O modo de edição agora tem um botão 'Guardar'
          <TouchableOpacity
            style={[styles.btn, styles.btnSave]}
            onPress={saveChanges}
          >
            <Save color="#ECFDF5" size={20} />
            <Text style={[styles.btnText, { color: "#ECFDF5" }]}>Guardar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContent: {
    paddingBottom: 100, // Aumentar para dar espaço ao actionBar
    padding: 18,
  },
  header: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 18,
    borderBottomRightRadius: 22,
    borderBottomLeftRadius: 22,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  card: {
    backgroundColor: "rgba(15,23,42,0.95)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.5)",
  },
  cardLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 6,
  },
  cardValue: {
    color: "#F9FAFB",
    fontSize: 15,
    fontWeight: "600",
  },
  cardTag: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "600",
  },
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
  btnText: {
    fontWeight: "700",
    color: "#F9FAFB",
  },
  btnEdit: {
    flex: 0, // Tirar o flex 1 para o botão Guardar assumir o espaço total
    paddingHorizontal: 24, // Ajustar o padding para parecer melhor com o botão Apagar
    backgroundColor: "rgba(56,189,248,0.12)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.4)",
  },
  btnDelete: {
    backgroundColor: "rgba(248,113,113,0.12)",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.4)",
  },
  btnSave: {
    backgroundColor: "#22C55E", // Cor verde para o botão de salvar
  },
});
