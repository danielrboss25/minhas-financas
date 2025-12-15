// src/data/movimentos.firestore.ts
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import type { Movimento, NewMovimento } from "../context/MovimentosContext";
import { dateStringToEpochMs, normalizeAmount } from "../utils/movimentos";

/* -----------------------------
   Mapper Firestore -> Movimento
------------------------------ */
function toMovimento(id: string, data: any): Movimento {
  const date = String(data?.date ?? "");
  const created_at = String(data?.created_at ?? new Date().toISOString());

  const dateTs =
    typeof data?.dateTs === "number"
      ? data.dateTs
      : dateStringToEpochMs(date);

  const amount =
    typeof data?.amount === "number" ? data.amount : Number(data?.amount) || 0;

  return {
    id,
    type: data?.type === "income" ? "income" : "expense",
    description: String(data?.description ?? ""),
    title: data?.title ? String(data.title) : String(data?.description ?? ""),
    category: String(data?.category ?? "Sem categoria"),
    date,
    dateTs,
    amount,
    created_at,
  };
}

/* =========================================================
   API FUNCIONAL
   ========================================================= */

export async function listMovimentos(uid: string): Promise<Movimento[]> {
  const col = collection(db, "users", uid, "movimentos");
  const q = query(col, orderBy("dateTs", "desc"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toMovimento(d.id, d.data()));
}

export async function addMovimento(uid: string, m: NewMovimento) {
  const col = collection(db, "users", uid, "movimentos");

  const amount = normalizeAmount(m.amount);
  const dateTs = dateStringToEpochMs(m.date);
  const created_at = new Date().toISOString();

  await addDoc(col, {
    type: m.type,
    description: m.description?.trim() ?? "",
    title: (m.title ?? m.description ?? "").trim(),
    category: (m.category ?? "Sem categoria").trim() || "Sem categoria",
    date: m.date,
    dateTs,
    amount,
    created_at,
    createdAt: serverTimestamp(),
  });
}

export async function updateMovimento(
  uid: string,
  id: string,
  fields: Partial<Movimento>
) {
  const ref = doc(db, "users", uid, "movimentos", id);

  const updates: Record<string, any> = { ...fields };
  delete updates.id;

  // mantém coerência se mexerem na date
  if (typeof updates.date === "string") {
    updates.dateTs = dateStringToEpochMs(updates.date);
  }

  // não faz sentido editar created_at
  delete updates.created_at;

  await updateDoc(ref, updates);
}

export async function deleteMovimento(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "movimentos", id));
}

/* =========================================================
   REPO (usado pelo MovimentosContext)
   ========================================================= */

export const FirestoreMovimentosRepo = {
  colRef(uid: string) {
    return collection(db, "users", uid, "movimentos");
  },

  listen(
    uid: string,
    onData: (list: Movimento[]) => void,
    onError?: (err: any) => void
  ) {
    const q = query(
      this.colRef(uid),
      orderBy("dateTs", "desc"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      q,
      (snap) => onData(snap.docs.map((d) => toMovimento(d.id, d.data()))),
      (err) => onError?.(err)
    );
  },

  async getAll(uid: string) {
    return listMovimentos(uid);
  },

  async insertWithId(uid: string, id: string, mov: Movimento) {
    const ref = doc(db, "users", uid, "movimentos", id);

    await setDoc(ref, {
      type: mov.type,
      description: mov.description ?? "",
      title: mov.title ?? mov.description ?? "",
      category: (mov.category ?? "Sem categoria").trim() || "Sem categoria",
      date: mov.date ?? "",
      dateTs: typeof mov.dateTs === "number" ? mov.dateTs : dateStringToEpochMs(mov.date ?? ""),
      amount: typeof mov.amount === "number" ? mov.amount : Number(mov.amount) || 0,
      created_at: mov.created_at ?? new Date().toISOString(),
      createdAt: serverTimestamp(),
    });
  },

  async insert(uid: string, m: NewMovimento) {
    return addMovimento(uid, m);
  },

  async update(uid: string, id: string, fields: Partial<Movimento>) {
    return updateMovimento(uid, id, fields);
  },

  async remove(uid: string, id: string) {
    return deleteMovimento(uid, id);
  },
};
