import { createContext, useContext, useEffect, useState } from 'react';

const PlanContext = createContext(null);
const KEY = 'visit_plan';

// REQ-4.7: plan lives for the browser session (sessionStorage), no tourist account needed.
function load() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function PlanProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const snapshot = (p) => ({
    id: p.id, name: p.name, location: p.location, visitDuration: p.visitDuration,
    distanceKm: p.distanceKm, photo: p.photos?.[0]?.url || null, categories: p.categories,
    open24h: p.open24h, openingHours: p.openingHours,
  });

  const value = {
    items,
    has: (id) => items.some((i) => i.id === id),
    add: (p) => setItems((s) => (s.some((i) => i.id === p.id) ? s : [...s, snapshot(p)])),
    remove: (id) => setItems((s) => s.filter((i) => i.id !== id)),
    move: (from, to) =>
      setItems((s) => {
        if (to < 0 || to >= s.length) return s;
        const next = [...s];
        const [x] = next.splice(from, 1);
        next.splice(to, 0, x);
        return next;
      }),
    clear: () => setItems([]),
  };
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export const usePlan = () => useContext(PlanContext);
