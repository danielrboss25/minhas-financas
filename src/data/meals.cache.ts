import { Platform } from "react-native";
import { execSql } from "../db";
import type { Meal } from "../context/MealsContext";

function rowToMeal(r: any): Meal {
  return {
    id: String(r.id),
    day: r.day ?? "",
    type: r.type ?? "Snack",
    title: r.title ?? "",
    notes: r.notes ?? "",
    calories: typeof r.calories === "number" ? r.calories : (r.calories ? Number(r.calories) : undefined),
    tag: r.tag ?? "Sem tag",
    created_at: r.created_at ?? new Date().toISOString(),
  };
}

async function init() {
  if (Platform.OS === "web") return;

  // A tabela já existe no teu db.ts, isto é só “cinto de segurança”
  await execSql(`
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY NOT NULL,
      day TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      notes TEXT,
      calories REAL,
      tag TEXT,
      created_at TEXT
    );
  `);
}

export const SQLiteMealsRepo = {
  async getAll(): Promise<Meal[]> {
    if (Platform.OS === "web") return [];
    await init();

    const res = await execSql<{ rows: { _array: any[] } }>(
      `SELECT * FROM meals ORDER BY datetime(created_at) DESC;`
    );

    return (res.rows?._array ?? []).map(rowToMeal);
  },

 async insert(userId: string, meal: Meal): Promise<void> {
  if (Platform.OS === "web") return;
  await init();

  await execSql(
    `INSERT OR REPLACE INTO meals
      (id, user_id, day, type, title, notes, calories, tag, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      meal.id,
      userId,
      meal.day,
      meal.type,
      meal.title ?? "",
      meal.notes ?? "",
      typeof meal.calories === "number" ? meal.calories : null,
      meal.tag ?? "Sem tag",
      meal.created_at,
    ]
  );
},


  async update(id: string, fields: Partial<Meal>): Promise<void> {
    if (Platform.OS === "web") return;
    await init();

    const keys = Object.keys(fields).filter((k) => k !== "id" && k !== "created_at");
    if (keys.length === 0) return;

    const sets = keys.map((k) => `${k} = ?`).join(", ");
    const values = keys.map((k) => (fields as any)[k]);

    await execSql(
      `UPDATE meals SET ${sets} WHERE id = ?;`,
      [...values, id]
    );
  },

  async remove(id: string): Promise<void> {
    if (Platform.OS === "web") return;
    await init();
    await execSql(`DELETE FROM meals WHERE id = ?;`, [id]);
  },

async syncFromRemote(userId: string, remote: Meal[]): Promise<void> {
  const safe: Meal[] = Array.isArray(remote)
    ? (remote.filter(
        (m: any) =>
          m &&
          typeof m === "object" &&
          typeof m.id === "string" &&
          m.id.trim().length > 0
      ) as Meal[])
    : [];

  if (Platform.OS === "web") return;
  await init();

  // se tens user_id na tabela, faz delete só do user:
  // await execSql(`DELETE FROM meals WHERE user_id = ?;`, [userId]);

  // se ainda NÃO tens user_id, então isto apaga tudo:
  await execSql(`DELETE FROM meals;`);

  for (const m of safe) {
    await this.insert(userId, m); // ✅ AQUI está a diferença crítica
  }
}};
