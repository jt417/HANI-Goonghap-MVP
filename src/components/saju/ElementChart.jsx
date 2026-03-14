import React from 'react';
import { ELEMENT_COLORS, ELEMENT_HANJA } from '../../lib/saju';

const ELEMENTS_ORDER = ['목', '화', '토', '금', '수'];

export default function ElementChart({ elements, compact = false }) {
  if (!elements) return null;
  const max = Math.max(...ELEMENTS_ORDER.map((e) => elements[e] || 0), 1);

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      {ELEMENTS_ORDER.map((el) => {
        const val = elements[el] || 0;
        const c = ELEMENT_COLORS[el];
        const status = val >= 30 ? '발달' : val >= 20 ? '적정' : val < 10 ? '극부족' : '부족';
        return (
          <div key={el} className="flex items-center gap-2">
            <div className={`flex w-10 items-center justify-center rounded ${c.bg} ${c.text} text-xs font-bold ${compact ? 'py-0.5' : 'py-1'}`}>
              {ELEMENT_HANJA[el]}
            </div>
            <div className="flex-1">
              <div className={`rounded-full bg-slate-100 ${compact ? 'h-2' : 'h-3'}`}>
                <div
                  className={`${c.bar} rounded-full ${compact ? 'h-2' : 'h-3'} transition-all`}
                  style={{ width: `${(val / max) * 100}%` }}
                />
              </div>
            </div>
            <div className={`w-14 text-right ${compact ? 'text-[10px]' : 'text-xs'} font-medium text-slate-600`}>
              {val}%
              {!compact && <span className={`ml-1 ${val >= 25 ? 'text-emerald-600' : val < 12 ? 'text-rose-500' : 'text-slate-400'}`}>
                {status}
              </span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
