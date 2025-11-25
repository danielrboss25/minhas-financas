// src/context/MovimentosContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

export type Movimento = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: string; // sem símbolo €, tratamos na UI
  type: "income" | "expense";
};

type MovimentosContextType = {
  movimentos: Movimento[];
  addMovimento: (data: Omit<Movimento, "id">) => void;
  updateMovimento: (id: string, data: Partial<Omit<Movimento, "id">>) => void;
  deleteMovimento: (id: string) => void;
};

const MovimentosContext = createContext<MovimentosContextType | undefined>(
  undefined
);

const seed: Movimento[] = [
  {
    id: "1",
    title: "Freelance",
    category: "Trabalho",
    date: "10/11",
    amount: "150,00",
    type: "income",
  },
  {
    id: "2",
    title: "Subscrições",
    category: "Serviços",
    date: "07/11",
    amount: "30,00",
    type: "expense",
  },
  {
    id: "3",
    title: "Restaurantes",
    category: "Restaurantes",
    date: "05/11",
    amount: "80,00",
    type: "expense",
  },
  {
    id: "4",
    title: "Transportes",
    category: "Transportes",
    date: "04/11",
    amount: "45,00",
    type: "expense",
  },
  {
    id: "5",
    title: "Supermercado",
    category: "Supermercado",
    date: "03/11",
    amount: "120,00",
    type: "expense",
  },
  {
    id: "6",
    title: "Salário",
    category: "Salário",
    date: "01/11",
    amount: "1200,00",
    type: "income",
  },
];

export function MovimentosProvider({ children }: { children: ReactNode }) {
  const [movimentos, setMovimentos] = useState<Movimento[]>(seed);

  function addMovimento(data: Omit<Movimento, "id">) {
    const id = Date.now().toString();
    setMovimentos((prev) => [{ id, ...data }, ...prev]);
  }

  function updateMovimento(
    id: string,
    data: Partial<Omit<Movimento, "id">>
  ) {
    setMovimentos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data } : m))
    );
  }

  function deleteMovimento(id: string) {
    setMovimentos((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <MovimentosContext.Provider
      value={{ movimentos, addMovimento, updateMovimento, deleteMovimento }}
    >
      {children}
    </MovimentosContext.Provider>
  );
}

export function useMovimentos() {
  const ctx = useContext(MovimentosContext);
  if (!ctx) {
    throw new Error(
      "useMovimentos só pode ser usado dentro de MovimentosProvider"
    );
  }
  return ctx;
}
