// src/data/ideas.firestore.ts
import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Idea } from "./ideas.cache";

function toIdea(id: string, data: any): Idea {
  const createdAtTs =
    typeof data?.createdAtTs === "number"
      ? data.createdAtTs
      : (data?.createdAt?.toMillis?.() ?? Date.now());

  return {
    id,
    title: String(data?.title ?? ""),
    content: String(data?.content ?? ""),
    tag: String(data?.tag ?? ""),
    fixed: Boolean(data?.fixed ?? false),
    createdAt: String(data?.created_at ?? new Date().toISOString()),
    createdAtTs,
  };
}

export const FirestoreIdeasRepo = {
  colRef(uid: string) {
    return collection(db, "users", uid, "ideas");
  },

  listen(uid: string, onData: (list: Idea[]) => void, onError?: (e: any) => void) {
    const q = query(
      this.colRef(uid),
      orderBy("fixed", "desc"),
      orderBy("createdAtTs", "desc")
    );

    return onSnapshot(
      q,
      (snap) => onData(snap.docs.map((d) => toIdea(d.id, d.data()))),
      (err) => onError?.(err)
    );
  },

  async getAll(uid: string): Promise<Idea[]> {
    const q = query(
      this.colRef(uid),
      orderBy("fixed", "desc"),
      orderBy("createdAtTs", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toIdea(d.id, d.data()));
  },

  async insertWithId(uid: string, id: string, idea: Idea): Promise<void> {
    const ref = doc(db, "users", uid, "ideas", id);

    await setDoc(ref, {
      title: idea.title ?? "",
      content: idea.content ?? "",
      tag: idea.tag ?? "",
      fixed: !!idea.fixed,
      created_at: idea.createdAt ?? new Date().toISOString(),
      createdAtTs: typeof idea.createdAtTs === "number" ? idea.createdAtTs : Date.now(),
      createdAt: serverTimestamp(), // útil para auditoria, mas não usamos para ordenar
    });
  },

  async update(uid: string, id: string, fields: Partial<Idea>): Promise<void> {
    const ref = doc(db, "users", uid, "ideas", id);

    const updates: Record<string, any> = { ...fields };
    delete updates.id;

    if ("fixed" in updates) updates.fixed = !!updates.fixed;

    await updateDoc(ref, updates);
  },

  async remove(uid: string, id: string): Promise<void> {
    await deleteDoc(doc(db, "users", uid, "ideas", id));
  },
};
