// src/services/budget.ts
import { Platform } from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { execSql } from "../db";

function requireUserUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Utilizador não autenticado.");
  return uid;
}

function budgetDocRef(uid: string, monthKey: string) {
  // Coleção: users/{uid}/budgets/{YYYY-MM}
  return doc(db, "users", uid, "budgets", monthKey);
}

// --------- WEB (Firestore) ---------

async function webGetBudget(monthKey: string): Promise<number | null> {
  const uid = requireUserUid();
  const ref = budgetDocRef(uid, monthKey);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  const v = Number(data?.amount);
  return Number.isFinite(v) ? v : null;
}

async function webSetBudget(monthKey: string, amount: number): Promise<void> {
  const uid = requireUserUid();
  const ref = budgetDocRef(uid, monthKey);
  await setDoc(
    ref,
    { amount, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

// --------- MOBILE (SQLite + sync Firestore) ---------

async function mobileGetLocalBudget(monthKey: string): Promise<number | null> {
  const res = await execSql<{ rows: { _array: any[] } }>(
    "SELECT amount FROM budgets WHERE month_key = ? LIMIT 1;",
    [monthKey]
  );
  const row = res.rows._array?.[0];
  if (!row) return null;
  const v = Number(row.amount);
  return Number.isFinite(v) ? v : null;
}

async function mobileUpsertLocalBudget(monthKey: string, amount: number) {
  const id = `budget_${monthKey}`;
  await execSql(
    `INSERT OR REPLACE INTO budgets (id, month_key, amount, updated_at)
     VALUES (?, ?, ?, ?);`,
    [id, monthKey, amount, new Date().toISOString()]
  );
}

async function mobileSyncPullFromFirestore(monthKey: string) {
  const remote = await webGetBudget(monthKey);
  if (remote == null) return;
  await mobileUpsertLocalBudget(monthKey, remote);
}

async function mobileSyncPushToFirestore(monthKey: string, amount: number) {
  await webSetBudget(monthKey, amount);
}

// --------- API pública ---------

export async function getBudget(monthKey: string): Promise<number | null> {
  if (Platform.OS === "web") {
    return webGetBudget(monthKey);
  }

  // Mobile: primeiro tenta local, depois faz pull (para atualizar)
  const local = await mobileGetLocalBudget(monthKey);
  try {
    await mobileSyncPullFromFirestore(monthKey);
    const afterPull = await mobileGetLocalBudget(monthKey);
    return afterPull ?? local;
  } catch {
    // Se falhar sync, devolve o que houver localmente
    return local;
  }
}

export async function setBudget(monthKey: string, amount: number): Promise<void> {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Orçamento inválido.");
  }

  if (Platform.OS === "web") {
    await webSetBudget(monthKey, amount);
    return;
  }

  // Mobile: guarda local e tenta push (best-effort)
  await mobileUpsertLocalBudget(monthKey, amount);
  try {
    await mobileSyncPushToFirestore(monthKey, amount);
  } catch {
    // Mantém local; o sync pode ser refeito mais tarde (se quiseres, depois faço fila de pending ops)
  }
}
