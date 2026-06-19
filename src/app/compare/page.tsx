'use client';

import React, { useState, useEffect } from 'react';
import { formatCompensation } from '@/lib/config';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://talent-daash-full-stack-zbnn.vercel.app';
export default function CompareOffersPage() {
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [s1, setS1] = useState<string>('');
  const [s2, setS2] = useState<string>('');
  const [compData, setCompData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  
useEffect(() => {
  async function loadOptions() {
    try {
    
      const res = await fetch('/api/salaries?limit=100');
      const payload = await res.json();
      if (payload?.data) setAllRecords(payload.data);
    } catch (error) {
      console.error("Error loading options:", error);
    }
  }
  loadOptions();
}, []);

  
  useEffect(() => {
    if (!s1 || !s2 || s1 === s2) {
      setCompData(null);
      return;
    }

  
async function fetchComparisonMetrics() {
  setLoading(true);
  try {
    const res = await fetch(`/api/compare?s1=${s1}&s2=${s2}`);
    if (res.ok) {
      const payload = await res.json();
      setCompData(payload);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}

    fetchComparisonMetrics();
  }, [s1, s2]);

  const renderDeltaRow = (label: string, v1: number, v2: number, isCurrency = true) => {
    const diff = v1 - v2;
    const isPositive = diff >= 0;
    const formattedDiff = isCurrency ? formatCompensation(Math.abs(diff), 'INR') : Math.abs(diff);

    return (
      <tr className="border-b border-[#EBEBEB] text-sm">
        <td className="p-4 font-medium text-[#717171] uppercase tracking-wider text-xs">{label}</td>
        <td className="p-4 font-medium text-[#222222]">{isCurrency ? formatCompensation(v1, 'INR') : `${v1} yrs`}</td>
        <td className="p-4 font-medium text-[#222222]">{isCurrency ? formatCompensation(v2, 'INR') : `${v2} yrs`}</td>
        <td className={`p-4 font-bold ${isPositive ? 'text-[#008A05]' : 'text-[#D93025]'}`}>
          {diff === 0 ? '—' : `${isPositive ? '+' : '-'}${formattedDiff}`}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-[#F7F7F7] min-h-screen text-[#222222] font-sans p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Offer Comparison Matrix</h1>
          <p className="text-sm text-[#484848]">Side-by-side programmatic variance computations on active candidate offers.</p>
        </div>

        {/* Dropdowns Configuration Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 border border-[#EBEBEB] rounded-xl shadow-sm">
          <div>
            <label className="block text-xs font-bold text-[#717171] uppercase mb-1.5">Select Profile Offer A</label>
            <select
              value={s1}
              onChange={(e) => setS1(e.target.value)}
              className="w-full text-sm border border-[#EBEBEB] p-2.5 rounded-lg focus:outline-none focus:border-[#FF5A5F]"
            >
              <option value="">— Primary Vector Record —</option>
              {allRecords.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.company?.name} · {r.role} ({r.level}) · {formatCompensation(r.total_compensation, 'INR')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#717171] uppercase mb-1.5">Select Profile Offer B</label>
            <select
              value={s2}
              onChange={(e) => setS2(e.target.value)}
              className="w-full text-sm border border-[#EBEBEB] p-2.5 rounded-lg focus:outline-none focus:border-[#FF5A5F]"
            >
              <option value="">— Target Vector Record —</option>
              {allRecords.filter((r) => r.id !== s1).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.company?.name} · {r.role} ({r.level}) · {formatCompensation(r.total_compensation, 'INR')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Validation Handling Alerts */}
        {s1 && s2 && s1 === s2 && (
          <div className="text-sm text-[#D93025] bg-red-50 p-4 rounded-lg border border-red-200 font-semibold">
            Error: Please select two entirely different unique profiles to evaluate target deltas.
          </div>
        )}

{/* Empty State */}
{!loading && !compData && (!s1 || !s2) && (
  <div className="bg-white border border-dashed border-[#D9D9D9] rounded-xl p-10 text-center shadow-sm">
    <div className="max-w-md mx-auto">
      <div className="text-5xl mb-4">⚡</div>

      <h2 className="text-lg font-semibold text-[#222222] mb-2">
        Select Two Offers to Compare
      </h2>

      <p className="text-sm text-[#717171] leading-relaxed">
        Choose a primary offer and a target offer from the dropdowns above to
        generate a detailed side-by-side compensation analysis, experience
        comparison, and variance breakdown.
      </p>

      <div className="mt-6 flex justify-center gap-3 text-xs">
        <span className="bg-[#F7F7F7] px-3 py-1.5 rounded-full border border-[#EBEBEB]">
          Salary Comparison
        </span>
        <span className="bg-[#F7F7F7] px-3 py-1.5 rounded-full border border-[#EBEBEB]">
          Bonus Analysis
        </span>
        <span className="bg-[#F7F7F7] px-3 py-1.5 rounded-full border border-[#EBEBEB]">
          Delta Metrics
        </span>
      </div>
    </div>
  </div>
)}


        {/* Core Side-by-Side Analytical Matrix Board */}
        {loading && <div className="text-center p-12 text-[#717171] text-sm font-medium">Computing live database arrays delta...</div>}

        {!loading && compData && (
          <div className="bg-white border border-[#EBEBEB] rounded-xl shadow-sm overflow-hidden animate-fadeIn">
            
            {/* Headers Identity Cards block */}
            <div className="grid grid-cols-4 bg-[#F7F7F7] border-b border-[#EBEBEB] p-4 text-sm font-bold text-[#222222]">
              <div className="col-span-1 text-xs uppercase tracking-wider text-[#717171]">Dimension Metric</div>
              <div className="flex items-center gap-2">
                <span>{compData.record1.company?.name}</span>
                {Number(compData.record1.total_compensation) > Number(compData.record2.total_compensation) && (
                  <span className="bg-[#0369A1] text-white text-[10px] font-bold px-2 py-0.5 rounded">HIGHER TC</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>{compData.record2.company?.name}</span>
                {Number(compData.record2.total_compensation) > Number(compData.record1.total_compensation) && (
                  <span className="bg-[#0369A1] text-white text-[10px] font-bold px-2 py-0.5 rounded">HIGHER TC</span>
                )}
              </div>
              <div className="text-[#717171]">Calculated Delta</div>
            </div>

            {/* Matrix Comparison Injected Rows */}
            <table className="w-full text-left border-collapse">
              <tbody>
                <tr className="border-b border-[#EBEBEB] text-sm">
                  <td className="p-4 font-medium text-[#717171] uppercase tracking-wider text-xs">Role Title</td>
                  <td className="p-4 text-[#222222] font-semibold">{compData.record1.role}</td>
                  <td className="p-4 text-[#222222] font-semibold">{compData.record2.role}</td>
                  <td className="p-4 text-[#717171]">—</td>
                </tr>
                <tr className="border-b border-[#EBEBEB] text-sm">
                  <td className="p-4 font-medium text-[#717171] uppercase tracking-wider text-xs">Tier Level</td>
                  <td className="p-4"><span className="bg-slate-100 text-slate-800 text-xs font-bold px-2 py-0.5 rounded">{compData.record1.level}</span></td>
                  <td className="p-4"><span className="bg-slate-100 text-slate-800 text-xs font-bold px-2 py-0.5 rounded">{compData.record2.level}</span></td>
                  <td className="p-4 text-[#717171]">—</td>
                </tr>
                <tr className="border-b border-[#EBEBEB] text-sm">
                  <td className="p-4 font-medium text-[#717171] uppercase tracking-wider text-xs">Geographic Slot</td>
                  <td className="p-4 text-[#484848]">{compData.record1.location}</td>
                  <td className="p-4 text-[#484848]">{compData.record2.location}</td>
                  <td className="p-4 text-[#717171]">—</td>
                </tr>
                {renderDeltaRow('Total Experience', compData.record1.experience_years, compData.record2.experience_years, false)}
                {renderDeltaRow('Base Net Salary', Number(compData.record1.base_salary), Number(compData.record2.base_salary))}
                {renderDeltaRow('Performance Bonus', Number(compData.record1.bonus), Number(compData.record2.bonus))}
                {renderDeltaRow('Stock Equity Value', Number(compData.record1.stock), Number(compData.record2.stock))}
                {renderDeltaRow('Total Compensation', Number(compData.record1.total_compensation), Number(compData.record2.total_compensation))}
              </tbody>
            </table>

          </div>
        )}

      </div>
    </div>
  );
}