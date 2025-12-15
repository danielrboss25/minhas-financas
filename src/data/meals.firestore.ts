import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Meal } from "../context/MealsContext";

function toMeal(id: string, data: any): Meal {
  return {
    id,
    day: data?.day ?? "",
    type: data?.type ?? "Snack",
    title: data?.title ?? "",
    notes: data?.notes ?? "",
    calories: typeof data?.calories === "number" ? data.calories : undefined,
    tag: data?.tag ?? "Sem tag",
    created_at: data?.created_at ?? new Date().toISOString(),
  };
}

export async function listMeals(uid: string): Promise<Meal[]> {
  const col = collection(db, "users", uid, "meals");
  const q = query(col, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toMeal(d.id, d.data()));
}

export const FirestoreMealsRepo = {
  colRef(uid: string) {
    return collection(db, "users", uid, "meals");
  },

  listen(uid: string, onData: (list: Meal[]) => void, onError?: (err: any) => void) {
    const q = query(this.colRef(uid), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => onData(snap.docs.map((d) => toMeal(d.id, d.data()))),
      (err) => onError?.(err)
    );
  },

  async getAll(uid: string) {
    return listMeals(uid);
  },

  async insertWithId(uid: string, id: string, meal: Meal) {
    const ref = doc(db, "users", uid, "meals", id);

    await setDoc(ref, {
      day: meal.day,
      type: meal.type,
      title: meal.title ?? "",
      notes: meal.notes ?? "",
      calories: typeof meal.calories === "number" ? meal.calories : null,
      tag: meal.tag ?? "Sem tag",
      created_at: meal.created_at,
      createdAt: serverTimestamp(),
    });
  },

  async update(uid: string, id: string, fields: Partial<Meal>) {
    const ref = doc(db, "users", uid, "meals", id);

    const updates: Record<string, any> = { ...fields };
    delete updates.id;
    delete updates.created_at; // não editar

    if ("calories" in updates && updates.calories === undefined) {
      updates.calories = null;
    }

    await updateDoc(ref, updates);
  },

  async remove(uid: string, id: string) {
    await deleteDoc(doc(db, "users", uid, "meals", id));
  },
};
