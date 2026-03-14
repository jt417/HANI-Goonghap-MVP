import React from 'react';
import { STEM_ELEMENT, BRANCH_ELEMENT, ELEMENT_COLORS, ELEMENT_HANJA, getTenGod, TEN_GOD_INFO } from '../../lib/saju';
import ElementChart from './ElementChart';

function PillarCell({ label, stem, branch, stemKr, branchKr, dayMaster, isDay }) {
  const stemEl = STEM_ELEMENT[stem];
  const branchEl = BRANCH_ELEMENT[branch];
  const stemColor = ELEMENT_COLORS[stemEl] || {};
  const branchColor = ELEMENT_COLORS[branchEl] || {};

  const stemTenGod = isDay ? '일원' : getTenGod(dayMaster, stem);
  const stemTgInfo = isDay ? null : TEN_GOD_INFO[stemTenGod];

  return (
    <div className="text-center">
      <div className="mb-1 text-[10px] font-medium text-slate-400">{label}</div>
      {/* 천간 */}
      <div className={`rounded-t-lg border ${stemColor.border || ''} ${stemColor.bg || ''} px-2 py-2`}>
        <div className={`text-lg font-bold ${stemColor.text || ''}`}>{stem}</div>
        <div className="text-[10px] text-slate-500">{stemKr} · {ELEMENT_HANJA[stemEl]}</div>
      </div>
      {/* 십신 */}
      <div className={`border-x px-2 py-1 ${isDay ? 'border-violet-300 bg-violet-50' : 'border-slate-200 bg-slate-50'}`}>
        <div className={`text-[10px] font-bold ${isDay ? 'text-violet-700' : 'text-slate-600'}`}>
          {isDay ? '● 일원' : stemTenGod}
        </div>
      </div>
      {/* 지지 */}
      <div className={`border ${branchColor.border || ''} ${branchColor.bg || ''} px-2 py-2`}>
        <div className={`text-lg font-bold ${branchColor.text || ''}`}>{branch}</div>
        <div className="text-[10px] text-slate-500">{branchKr} · {ELEMENT_HANJA[branchEl]}</div>
      </div>
      {/* 지지 십신 */}
      <div className="rounded-b-lg border-x border-b border-slate-200 bg-slate-50 px-2 py-1">
        <div className="text-[10px] font-medium text-slate-500">
          {isDay ? '—' : getTenGod(dayMaster, BRANCH_ELEMENT[branch] === STEM_ELEMENT[dayMaster] ? dayMaster : findStemForElement(BRANCH_ELEMENT[branch], branch, dayMaster))}
        </div>
      </div>
    </div>
  );
}

// 지지의 본기 천간을 찾아서 십신 계산
function findStemForElement(element, branch, dayMaster) {
  const stemMap = { '목': ['甲','乙'], '화': ['丙','丁'], '토': ['戊','己'], '금': ['庚','辛'], '수': ['壬','癸'] };
  const stems = stemMap[element] || [];
  // 양지는 양간, 음지는 음간
  const branchIdx = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].indexOf(branch);
  const isYang = branchIdx % 2 === 0;
  return stems[isYang ? 0 : 1] || stems[0] || dayMaster;
}

export default function SajuProfileCard({ member, compact = false }) {
  const saju = member?.saju;
  if (!saju?.pillars) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-400">
        사주 데이터가 없습니다. 생년월일시를 등록하세요.
      </div>
    );
  }

  const { pillars, dayMaster, elements, strength, strengthLabel, structure, yongshin, heesin, gisin } = saju;

  return (
    <div className={`rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center justify-between">
        <div className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-indigo-900`}>사주 원국표</div>
        <div className="flex gap-1.5">
          {strength && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              strength.includes('신강') ? 'bg-red-100 text-red-700 border border-red-200' :
              strength.includes('신약') ? 'bg-blue-100 text-blue-700 border border-blue-200' :
              'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {strengthLabel || strength}
            </span>
          )}
          {structure && (
            <span className="rounded-full border border-violet-200 bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
              {structure}
            </span>
          )}
        </div>
      </div>

      {/* 원국표 4주 */}
      <div className={`${compact ? 'mt-2' : 'mt-3'} grid grid-cols-4 gap-1.5`}>
        <PillarCell label="시주" {...pillars.hour} dayMaster={dayMaster} isDay={false} />
        <PillarCell label="일주" {...pillars.day} dayMaster={dayMaster} isDay={true} />
        <PillarCell label="월주" {...pillars.month} dayMaster={dayMaster} isDay={false} />
        <PillarCell label="년주" {...pillars.year} dayMaster={dayMaster} isDay={false} />
      </div>

      {/* 오행 분포 */}
      <div className={compact ? 'mt-2' : 'mt-3'}>
        <div className="mb-1.5 text-[10px] font-bold text-indigo-700">오행 분포</div>
        <ElementChart elements={elements} compact={compact} />
      </div>

      {/* 용신/기신 */}
      {(yongshin?.length > 0 || gisin?.length > 0) && (
        <div className={`${compact ? 'mt-2' : 'mt-3'} flex flex-wrap gap-2`}>
          {yongshin?.map((el) => (
            <span key={`y-${el}`} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ELEMENT_COLORS[el]?.bg} ${ELEMENT_COLORS[el]?.text} border ${ELEMENT_COLORS[el]?.border}`}>
              용신 {ELEMENT_HANJA[el]}
            </span>
          ))}
          {heesin?.map((el) => (
            <span key={`h-${el}`} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ELEMENT_COLORS[el]?.bg} ${ELEMENT_COLORS[el]?.text} border ${ELEMENT_COLORS[el]?.border}`}>
              희신 {ELEMENT_HANJA[el]}
            </span>
          ))}
          {gisin?.map((el) => (
            <span key={`g-${el}`} className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
              기신 {ELEMENT_HANJA[el]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
