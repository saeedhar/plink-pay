import React from 'react';
import { applyScenarioPatch, resetScenario, type Scenario } from './mockBridge';

type Item = { label: string; patch: Partial<Scenario> };

export function DevScenarioBar({ items, title }: { items: Item[]; title: string }) {
  if (import.meta.env.VITE_USE_MOCKS !== 'true') return null;
  
  return (
    <div className="fixed z-50 bottom-3 left-3 right-3 mx-auto max-w-screen-sm rounded-xl border px-3 py-2 bg-white/90 shadow">
      <div className="text-xs font-semibold mb-1">{title}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <button
            key={it.label}
            onClick={() => applyScenarioPatch(it.patch)}
            className="text-xs rounded-md border px-2 py-1 hover:bg-gray-50 active:scale-[.99]"
            type="button"
          >
            {it.label}
          </button>
        ))}
        <button
          onClick={() => resetScenario()}
          className="ml-auto text-xs rounded-md border px-2 py-1 hover:bg-gray-50"
          type="button"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
