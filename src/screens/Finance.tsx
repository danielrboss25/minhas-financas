// src/screens/Finance.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import uuid from "react-native-uuid";
import { q, initDB, FinanceRecord } from "../db";

// nomes dos meses só para display
const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// monthIndex: 0–11
function getMonthKey(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export default function FinanceScreen() {
  // ------------------ ESTADO DOS FILTROS ------------------
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0–11

  const monthKey = getMonthKey(selectedYear, selectedMonth);

  // ------------------ ESTADO DOS DADOS --------------------
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [total, setTotal] = useState(0);

  // ------------------ ESTADO DO MODAL ---------------------
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // ------------------ FUNÇÕES DE FILTRO -------------------

  function changeMonth(delta: number) {
    setSelectedMonth((current) => {
      let month = current + delta;
      let year = selectedYear;

      if (month < 0) {
        month = 11;
        year -= 1;
      } else if (month > 11) {
        month = 0;
        year += 1;
      }

      setSelectedYear(year);
      return month;
    });
  }

  function changeYear(delta: number) {
    setSelectedYear((y) => y + delta);
  }

  // ------------------ DB / CARREGAMENTO -------------------

  async function loadData() {
    const list = await q.listMonth(monthKey);
    setRecords(list);
    setTotal(await q.sumOfMonth(monthKey));
  }

  useEffect(() => {
    (async () => {
      await initDB();
      await loadData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sempre que o mês/ano muda, recarrega
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  // ------------------ INSERIR REGISTO ---------------------

 async function saveRecord() {
  try {
    if (!category.trim() || !amount.trim()) {
      alert("Preenche a categoria e o valor antes de guardar.");
      return;
    }

    const numericAmount = Number(amount.replace(",", "."));
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      alert("O valor tem de ser um número maior que zero.");
      return;
    }

    const rec: Omit<FinanceRecord, "created_at"> = {
      id: uuid.v4().toString(),
      date: new Date().toISOString().substring(0, 10),
      type,
      category: category.trim(),
      amount: numericAmount,
      note: note.trim() || undefined,
      month_key: monthKey,
    };

    await q.insert(rec);

    // limpar estado
    setCategory("");
    setAmount("");
    setNote("");
    setModalVisible(false);

    // recarregar lista e totais
    await loadData();
  } catch (e) {
    console.error("Erro ao guardar registo:", e);
    alert("Ocorreu um erro ao guardar a despesa. Verifica a consola.");
  }
}


  // ------------------ RENDER ------------------------------

  return (
    <View style={styles.container}>
      {/* HEADER + FILTROS */}
      <Text style={styles.title}>Finanças</Text>

      <View style={styles.filtersRow}>
        {/* MÊS */}
        <View style={styles.filterBlock}>
          <Text style={styles.filterLabel}>Mês</Text>
          <View style={styles.filterControls}>
            <TouchableOpacity
              style={styles.chipBtn}
              onPress={() => changeMonth(-1)}
            >
              <Text style={styles.chipText}>{"<"}</Text>
            </TouchableOpacity>

            <Text style={styles.filterValue}>
              {MONTH_NAMES[selectedMonth]}
            </Text>

            <TouchableOpacity
              style={styles.chipBtn}
              onPress={() => changeMonth(1)}
            >
              <Text style={styles.chipText}>{">"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ANO */}
        <View style={styles.filterBlock}>
          <Text style={styles.filterLabel}>Ano</Text>
          <View style={styles.filterControls}>
            <TouchableOpacity
              style={styles.chipBtn}
              onPress={() => changeYear(-1)}
            >
              <Text style={styles.chipText}>{"<"}</Text>
            </TouchableOpacity>

            <Text style={styles.filterValue}>{selectedYear}</Text>

            <TouchableOpacity
              style={styles.chipBtn}
              onPress={() => changeYear(1)}
            >
              <Text style={styles.chipText}>{">"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Text style={styles.total}>
        Total em{" "}
        <Text style={styles.totalValue}>
          {MONTH_NAMES[selectedMonth]} {selectedYear}: {total.toFixed(2)} €
        </Text>
      </Text>

      {/* LISTA */}
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 10 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.itemCategory}>{item.category}</Text>
              {item.note ? (
                <Text style={styles.itemNote}>{item.note}</Text>
              ) : null}
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={[
                  styles.itemAmount,
                  item.type === "expense" ? styles.expense : styles.income,
                ]}
              >
                {item.type === "expense" ? "-" : "+"}
                {item.amount} €
              </Text>
              <Text style={styles.itemDate}>{item.date}</Text>
            </View>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View  style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Novo Registo</Text>

            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  type === "expense" && styles.typeBtnActiveRed,
                ]}
                onPress={() => setType("expense")}
              >
                <Text style={styles.typeBtnText}>Despesa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  type === "income" && styles.typeBtnActiveGreen,
                ]}
                onPress={() => setType("income")}
              >
                <Text style={styles.typeBtnText}>Entrada</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Categoria"
              placeholderTextColor="#888"
              style={styles.input}
              value={category}
              onChangeText={setCategory}
            />
            <TextInput
              placeholder="Valor (€)"
              placeholderTextColor="#888"
              keyboardType="numeric"
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
            />
            <TextInput
              placeholder="Nota (opcional)"
              placeholderTextColor="#888"
              style={styles.input}
              value={note}
              onChangeText={setNote}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveRecord}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ------------------ ESTILOS ------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    padding: 20,
    paddingTop: 40,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },

  filtersRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 16,
  },

  filterBlock: {
    flex: 1,
  },

  filterLabel: {
    color: "#888",
    fontSize: 12,
    marginBottom: 4,
  },

  filterControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "space-between",
  },

  filterValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  chipBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
  },

  chipText: {
    color: "#ddd",
    fontSize: 16,
  },

  total: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 16,
  },

  totalValue: {
    color: "#fff",
    fontWeight: "600",
  },

  item: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  itemCategory: {
    color: "#fff",
    fontSize: 16,
  },

  itemNote: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },

  itemAmount: {
    fontSize: 16,
    fontWeight: "600",
  },

  itemDate: {
    color: "#777",
    fontSize: 11,
    marginTop: 4,
  },

  expense: { color: "#ef4444" },
  income: { color: "#22c55e" },

  fab: {
    position: "absolute",
    right: 26,
    bottom: 40,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  fabText: {
    color: "#fff",
    fontSize: 34,
    marginTop: -2,
    fontWeight: "600",
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 14,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "#333",
    alignItems: "center",
  },

  typeBtnText: {
    color: "#fff",
    fontSize: 16,
  },

  typeBtnActiveRed: {
    backgroundColor: "#ef4444",
  },

  typeBtnActiveGreen: {
    backgroundColor: "#22c55e",
  },

  input: {
    backgroundColor: "#2a2a2a",
    padding: 12,
    color: "#fff",
    borderRadius: 8,
    marginBottom: 12,
  },

  saveButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  saveButtonText: {
    color: "#0b1120",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    paddingVertical: 10,
    marginTop: 12,
  },

  cancelButtonText: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
  },
});
