import { createContext, useContext, useMemo, useState } from "react";
import { branches } from "../data/mockData";

const STORAGE_KEY = "condohub.activeBranchId";

const BranchContext = createContext(null);

export function BranchProvider({ children }) {
  const [activeBranchId, setActiveBranchId] = useState(() => {
    if (typeof window === "undefined") return "ALL";
    return window.localStorage.getItem(STORAGE_KEY) || "ALL";
  });

  const setBranch = (id) => {
    setActiveBranchId(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
  };

  const activeBranch = useMemo(
    () => branches.find((b) => b.id === activeBranchId) || null,
    [activeBranchId]
  );

  const value = useMemo(
    () => ({
      activeBranchId,
      activeBranch,
      setBranch,
      branches,
      isAll: activeBranchId === "ALL",
    }),
    [activeBranchId, activeBranch]
  );

  return (
    <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
  );
}

export function useActiveBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) {
    throw new Error("useActiveBranch must be used inside <BranchProvider>");
  }
  return ctx;
}

// Lọc helper: nếu là "ALL" thì trả về list gốc, ngược lại filter theo branchId
export function filterByBranch(list, activeBranchId) {
  if (activeBranchId === "ALL" || !list) return list || [];
  return list.filter((item) => item.branchId === activeBranchId);
}
