import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import { useAuth } from "./AuthContext";

// Se ainda não tens repos, por agora fica SQLite-only.
// Depois adicionamos FirestoreRepo e sincronização como fizeste em Movimentos.
import { execSql } from "../db";

export type Idea = {
  id: string;
  title: string;
  content: string;       // unifica "body/description" num só campo
  tag: string;
  fixed: boolean;
  created_at: string;    // ISO
};

export type NewIdea = {
  title?: string;
  content?: string;
  tag?: string;
};

type IdeasContextValue = {
  ideas: Idea[];
  loading: boolean;

  loadIdeas: () => Promise<void>;
  addIdea: (i: NewIdea) => Promise<void>;
  updateIdea: (id: string, fields: Partial<Idea>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  toggleFixed: (id: string) => Promise<void>;
};

const IdeasContext = createContext<IdeasContextValue | undefined>(undefined);

/* -----------------------------
   SQLite schema (único e coerente)
----------------------------- */
async function initIdeasTable() {
  if (Platform.OS === "web") return;

  await execSql(`
    CREATE TABLE IF NOT EXISTS ideas (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      tag TEXT,
      fixed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  await execSql(`CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas(created_at);`);
  await execSql(`CREATE INDEX IF NOT EXISTS idx_ideas_fixed ON ideas(fixed);`);
  await execSql(`CREATE INDEX IF NOT EXISTS idx_ideas_tag ON ideas(tag);`);
}

function mapRowToIdea(row: any): Idea {
  return {
    id: String(row.id),
    title: row.title ?? "",
    content: row.content ?? "",
    tag: row.tag ?? "Sem tag",
    fixed: row.fixed === 1,
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

export const IdeasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function loadIdeas() {
    if (Platform.OS === "web") {
      // se quiseres, depois ligamos ao Firestore para web
      setIdeas([]);
      setLoading(false);
      return;
    }

    if (!user?.uid) {
      setIdeas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await initIdeasTable();

      const res = await execSql<{ rows: { _array: any[] } }>(
        `SELECT * FROM ideas ORDER BY datetime(created_at) DESC;`
      );

      setIdeas((res.rows?._array ?? []).map(mapRowToIdea));
    } catch (e) {
      console.error("Erro a carregar ideias:", e);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    loadIdeas();
  }, [authLoading, user?.uid]);

  async function addIdea(i: NewIdea) {
    if (Platform.OS === "web") return;
    if (!user?.uid) return;

    const now = new Date().toISOString();
    const idea: Idea = {
      id: Date.now().toString(),
      title: (i.title ?? "").trim() || "Ideia sem título",
      content: (i.content ?? "").trim(),
      tag: (i.tag ?? "").trim() || "Sem tag",
      fixed: false,
      created_at: now,
    };

    // Optimistic UI
    setIdeas((prev) => [idea, ...prev]);

    try {
      await initIdeasTable();
      await execSql(
        `INSERT OR REPLACE INTO ideas (id, title, content, tag, fixed, created_at)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [idea.id, idea.title, idea.content, idea.tag, 0, idea.created_at]
      );
    } catch (e) {
      console.error("Erro a inserir ideia:", e);
      // rollback
      setIdeas((prev) => prev.filter((x) => x.id !== idea.id));
      throw e;
    }
  }

  async function updateIdea(id: string, fields: Partial<Idea>) {
    if (Platform.OS === "web") return;
    if (!user?.uid) return;

    const allowed: Partial<Idea> = { ...fields };
    delete (allowed as any).id;
    delete (allowed as any).created_at;

    const keys = Object.keys(allowed);
    if (keys.length === 0) return;

    // Optimistic UI
    setIdeas((prev) => prev.map((x) => (x.id === id ? { ...x, ...allowed } : x)));

    try {
      await initIdeasTable();

      const sets = keys.map((k) => `${k} = ?`).join(", ");
      const values = keys.map((k) => {
        const v = (allowed as any)[k];
        if (k === "fixed") return v ? 1 : 0;
        return v;
      });

      await execSql(`UPDATE ideas SET ${sets} WHERE id = ?;`, [...values, id]);
    } catch (e) {
      console.error("Erro a actualizar ideia:", e);
      // o loadIdeas corrige o estado, se quiseres forçar:
      await loadIdeas();
      throw e;
    }
  }

  async function deleteIdea(id: string) {
    if (Platform.OS === "web") return;
    if (!user?.uid) return;

    // Optimistic UI
    setIdeas((prev) => prev.filter((x) => x.id !== id));

    try {
      await initIdeasTable();
      await execSql(`DELETE FROM ideas WHERE id = ?;`, [id]);
    } catch (e) {
      console.error("Erro a apagar ideia:", e);
      await loadIdeas();
      throw e;
    }
  }

  async function toggleFixed(id: string) {
    const current = ideas.find((x) => x.id === id);
    if (!current) return;
    await updateIdea(id, { fixed: !current.fixed });
  }

  const value = useMemo(
    () => ({
      ideas,
      loading,
      loadIdeas,
      addIdea,
      updateIdea,
      deleteIdea,
      toggleFixed,
    }),
    [ideas, loading]
  );

  return <IdeasContext.Provider value={value}>{children}</IdeasContext.Provider>;
};

export function useIdeas() {
  const ctx = useContext(IdeasContext);
  if (!ctx) throw new Error("useIdeas tem de ser usado dentro de IdeasProvider");
  return ctx;
}
