import { create } from "zustand";
import { persist } from "zustand/middleware";
import { orderNumber, uid } from "../format";
import { persistStorage, STORAGE_KEYS } from "../storage";
import type { Order, OrderStatus } from "../types";

export type NewOrder = Omit<Order, "id" | "seq" | "number" | "createdAt" | "status">;

interface OrdersState {
  orders: Order[];
  nextSeq: number;
  create: (input: NewOrder, status?: OrderStatus) => Order;
  addMany: (orders: Order[]) => void;
  setStatus: (id: string, status: OrderStatus) => void;
  remove: (ids: string[]) => void;
  removeDemo: () => void;
  clear: () => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      nextSeq: 1,
      create: (input, status = "naujas") => {
        const seq = get().nextSeq;
        const createdAt = Date.now();
        const order: Order = { ...input, id: uid(), seq, number: orderNumber(seq, createdAt), createdAt, status };
        set((s) => ({ orders: [order, ...s.orders], nextSeq: seq + 1 }));
        return order;
      },
      addMany: (orders) =>
        set((s) => ({
          orders: [...orders, ...s.orders].sort((a, b) => b.createdAt - a.createdAt),
          nextSeq: Math.max(s.nextSeq, ...orders.map((o) => o.seq + 1)),
        })),
      setStatus: (id, status) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),
      remove: (ids) => set((s) => ({ orders: s.orders.filter((o) => !ids.includes(o.id)) })),
      removeDemo: () => set((s) => ({ orders: s.orders.filter((o) => !o.demo) })),
      clear: () => set({ orders: [] }),
    }),
    {
      name: STORAGE_KEYS.orders,
      version: 1,
      storage: persistStorage,
      skipHydration: true,
      partialize: (s) => ({ orders: s.orders, nextSeq: s.nextSeq }),
      merge: (persisted, current) => {
        const p = persisted as Partial<Pick<OrdersState, "orders" | "nextSeq">> | undefined;
        return {
          ...current,
          orders: Array.isArray(p?.orders) ? p!.orders : [],
          nextSeq: typeof p?.nextSeq === "number" && p.nextSeq > 0 ? p.nextSeq : 1,
        };
      },
    },
  ),
);
