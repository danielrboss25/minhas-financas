// src/services/tasks.ts
import { Platform } from "react-native";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { execSql } from "../db";

export type Priority = "alta" | "media" | "baixa";
export type Bucket = "hoje" | "semana" | "mais_tarde";

export type Task = {
  id: string;
  title: string;
  notes?: string;
  bucket: Bucket;
  priority: Priority;
  done: boolean;
  dueLabel?: string;
  createdAt?: string; // ISO no mobile; string no web (para simplificar)
};

function requireUid() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Utilizador não autenticado.");
  return uid;
}

/* -------------------- WEB (Firestore) -------------------- */

async function listTasksWeb(): Promise<Task[]> {
  const uid = requireUid();
  const col = collection(db, "users", uid, "tasks");
  const q = query(col, orderBy("done", "asc"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      title: data.title ?? "",
      notes: data.notes ?? undefined,
      bucket: (data.bucket as Bucket) ?? "hoje",
      priority: (data.priority as Priority) ?? "media",
      done: !!data.done,
      dueLabel: data.dueLabel ?? undefined,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? undefined,
    };
  });
}

async function upsertTaskWeb(task: Task): Promise<void> {
  const uid = requireUid();
  const ref = doc(db, "users", uid, "tasks", task.id);

  await setDoc(
    ref,
    {
      title: task.title,
      notes: task.notes ?? null,
      bucket: task.bucket,
      priority: task.priority,
      done: task.done,
      dueLabel: task.dueLabel ?? null,
      createdAt: task.createdAt ? new Date(task.createdAt) : serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

async function setDoneWeb(id: string, done: boolean): Promise<void> {
  const uid = requireUid();
  const ref = doc(db, "users", uid, "tasks", id);
  await updateDoc(ref, { done, updatedAt: serverTimestamp() });
}

async function deleteTaskWeb(id: string): Promise<void> {
  const uid = requireUid();
  await deleteDoc(doc(db, "users", uid, "tasks", id));
}

/* -------------------- MOBILE (SQLite) -------------------- */

async function listTasksMobile(): Promise<Task[]> {
  const res: any = await execSql(
    "SELECT * FROM tasks ORDER BY done ASC, datetime(created_at) DESC",
    []
  );
  const rows = res?.rows?._array ?? [];

  return rows.map((r: any) => ({
    id: String(r.id),
    title: r.title,
    notes: r.notes ?? undefined,
    bucket: (r.bucket as Bucket) ?? "hoje",
    priority: (r.priority as Priority) ?? "media",
    done: r.done === 1 || r.done === true,
    dueLabel: r.due_label ?? undefined,
    createdAt: r.created_at ?? undefined,
  }));
}

async function upsertTaskMobile(task: Task): Promise<void> {
  const createdAt = task.createdAt ?? new Date().toISOString();
  await execSql(
    `INSERT INTO tasks (id, title, notes, bucket, priority, done, due_label, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       notes = excluded.notes,
       bucket = excluded.bucket,
       priority = excluded.priority,
       done = excluded.done,
       due_label = excluded.due_label`,
    [
      task.id,
      task.title,
      task.notes ?? null,
      task.bucket,
      task.priority,
      task.done ? 1 : 0,
      task.dueLabel ?? null,
      createdAt,
    ]
  );
}

async function setDoneMobile(id: string, done: boolean): Promise<void> {
  await execSql("UPDATE tasks SET done = ? WHERE id = ?", [done ? 1 : 0, id]);
}

async function deleteTaskMobile(id: string): Promise<void> {
  await execSql("DELETE FROM tasks WHERE id = ?", [id]);
}

/* -------------------- API unificada -------------------- */

export async function listTasks(): Promise<Task[]> {
  return Platform.OS === "web" ? listTasksWeb() : listTasksMobile();
}

export async function upsertTask(task: Task): Promise<void> {
  return Platform.OS === "web" ? upsertTaskWeb(task) : upsertTaskMobile(task);
}

export async function setTaskDone(id: string, done: boolean): Promise<void> {
  return Platform.OS === "web" ? setDoneWeb(id, done) : setDoneMobile(id, done);
}

export async function removeTask(id: string): Promise<void> {
  return Platform.OS === "web" ? deleteTaskWeb(id) : deleteTaskMobile(id);
}
