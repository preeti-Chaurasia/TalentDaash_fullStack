'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCompensation } from '@/lib/config';
import Link from 'next/link'; // Navigation Engine Instance Added

interface SalaryTableClientProps {
  initialData: any;
}

export default function SalaryTableClient({ initialData }: SalaryTableClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Controlled UI States matching deep url constraints
  const [company, setCompany] = useState(searchParams.get('company') || '');
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [currency, setCurrency] = useState<'INR' | 'USD'>((searchParams.get('currency') as any) || 'INR');
  const [selectedLevels, setSelectedLevels] = useState<string[]>(
    searchParams.get('level')?.split(',').filter(Boolean) || []
  );

  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || 'total_comp_desc';

  // Debounce search mechanism for structural inputs rule (300ms constraint)
 useEffect(() => {
  const timer = setTimeout(() => {
    updateUrlParams({ page: 1 });
  }, 300);

  return () => clearTimeout(timer);
}, [company, role, location]);

  const updateUrlParams = (newParams: Record<string, any> = {}) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    current.set('company', company);
    current.set('role', role);
    current.set('location', location);
    current.set('currency', currency);
    
    if (selectedLevels.length > 0) {
      current.set('level', selectedLevels.join(','));
    } else {
      current.delete('level');
    }

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        current.delete(key);
      } else {
        current.set(key, String(val));
      }
    });
   
    if (current.get('page') === '1') {
  current.delete('page');
}

    startTransition(() => {
      router.push(`/salaries?${current.toString()}`);
    });
  };

const toggleLevel = (lvl: string) => {
  const updated = selectedLevels.includes(lvl)
    ? selectedLevels.filter((l) => l !== lvl)
    : [...selectedLevels, lvl];

  setSelectedLevels(updated);

  setTimeout(() => {
    updateUrlParams({ page: 1 });
  }, 0);
};

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
  };

  const handleSortChange = () => {
  const nextSort =
    sort === 'total_comp_desc'
      ? 'total_comp_asc'
      : 'total_comp_desc';

  updateUrlParams({
    sort: nextSort,
    page: 1,
  });
};
  const clearAllFilters = () => {
    setCompany('');
    setRole('');
    setLocation('');
    setSelectedLevels([]);
    setCurrency('INR');
    startTransition(() => {
      router.push('/salaries');
    });
  };

  const getLevelBadgeClass = (lvl: string) => {
    if (!lvl) return "";
    const base = "px-2 py-1 text-xs font-semibold rounded-md uppercase tracking-wider ";
    const upperLvl = lvl.toUpperCase();
    
    if (['L3', 'SDE_I', 'SDE I'].includes(upperLvl)) return base + "bg-slate-100 text-slate-800";
    if (['L4', 'SDE_II', 'SDE II'].includes(upperLvl)) return base + "bg-blue-100 text-blue-800";
    if (['L5', 'SDE_III', 'SDE III'].includes(upperLvl)) return base + "bg-indigo-100 text-indigo-800";
    if (['L6', 'STAFF'].includes(upperLvl)) return base + "bg-purple-100 text-purple-800";
    if (['PRINCIPAL'].includes(upperLvl)) return base + "bg-gray-500 text-white"; 
    
    return base + "bg-gray-100 text-gray-800";
  };

  const { data: records, meta } = initialData;

  return (
    <div className="bg-[#F7F7F7] min-h-screen text-[#222222] font-sans antialiased p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Segment Architecture Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#EBEBEB] pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#222222] mb-1">Compensation Intelligence Engine</h1>
            <p className="text-sm text-[#484848]">Structured · Comparable · Real-time Decision Metrics</p>
          </div>
          
          {/* Strict Currency Toggle Component Switch */}
          
<div className="mt-4 md:mt-0 flex items-center bg-white border border-[#EBEBEB] rounded-lg p-1 shadow-sm">
  <button
    onClick={() => { setCurrency('INR'); updateUrlParams({ currency: 'INR' }); }}
    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${currency === 'INR' ? 'bg-[#FF5A5F] text-white' : 'text-[#484848] hover:bg-[#F2F2F2]'}`}
  >
    INR (₹)
  </button>
  <button
    onClick={() => { setCurrency('USD'); updateUrlParams({ currency: 'USD' }); }}
    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${currency === 'USD' ? 'bg-[#FF5A5F] text-white' : 'text-[#484848] hover:bg-[#F2F2F2]'}`}
  >
    USD ($)
  </button>
</div>
        </div>

        {/* Dynamic Interactive Analytical Filter Box */}
        <div className="bg-white border border-[#EBEBEB] rounded-xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#717171] uppercase tracking-wider mb-1.5">Company Search</label>
              <input
                type="text"
                placeholder="e.g., Google, Amazon"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#FF5A5F] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#717171] uppercase tracking-wider mb-1.5">Role Designation</label>
              <input
                type="text"
                placeholder="e.g., Software Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#FF5A5F] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#717171] uppercase tracking-wider mb-1.5">Geographic Location</label>
              <input
                type="text"
                placeholder="e.g., Bengaluru, Mumbai"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#FF5A5F] transition"
              />
            </div>
          </div>

          {/* Level Checkbox Matrix */}
          <div className="border-t border-[#EBEBEB] pt-3">
            <span className="block text-xs font-semibold text-[#717171] uppercase tracking-wider mb-2">Standardized Levels Multi-Select</span>
            <div className="flex flex-wrap gap-3">
              {['L3', 'L4', 'L5', 'L6', 'SDE_I', 'SDE_II', 'SDE_III', 'STAFF', 'PRINCIPAL'].map((lvl) => (
                <label key={lvl} className="flex items-center space-x-2 text-xs text-[#484848] cursor-pointer bg-[#F7F7F7] px-3 py-1.5 rounded-md hover:bg-[#F2F2F2] transition">
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(lvl)}
                    onChange={() => toggleLevel(lvl)}
                    className="accent-[#FF5A5F] h-3.5 w-3.5"
                  />
                  <span>{lvl.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>


<div className="flex justify-end pt-2">
  <button
    onClick={clearAllFilters}
    className="px-4 py-2 text-sm font-medium border border-[#EBEBEB] rounded-lg bg-white hover:bg-[#F2F2F2] transition"
  >
    Clear All Filters
  </button>
</div>

        {/* Core Structural Table Segment */}
        <div className="bg-white border border-[#EBEBEB] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F7F7] border-b border-[#EBEBEB] text-[#717171] text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4">Company</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4">Base Salary</th>
                  <th className="p-4">Stock Value</th>
                  <th
  className="p-4 cursor-pointer hover:bg-[#F2F2F2]"
  onClick={handleSortChange}
>
  Total Comp {sort === 'total_comp_desc' ? '▼' : '▲'}
</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#EBEBEB]">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-[#717171]">
                      <div className="space-y-2">
                        <p className="text-base font-medium">No records found matching your analytical filters.</p>
                        <button onClick={clearAllFilters} className="text-xs text-[#FF5A5F] underline font-semibold">Clear All Filters</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((r: any) => {
                    const convertedBase = currency === 'USD' ? Number(r.base_salary) * 0.012 : Number(r.base_salary);
                    const convertedStock = currency === 'USD' ? Number(r.stock) * 0.012 : Number(r.stock);
                    const convertedTotal = currency === 'USD' ? Number(r.total_compensation) * 0.012 : Number(r.total_compensation);

                    return (
                      <tr key={r.id} className="hover:bg-[#F2F2F2] transition-colors group">
                        <td className="p-4 font-bold">
                          {r.company ? (
                            <Link 
                              href={`/companies/${r.company.slug}`} 
                              className="text-[#0369A1] hover:underline"
                            >
                              {r.company.name}
                            </Link>
                          ) : (
                            <span className="text-[#717171]">Unknown</span>
                          )}
                        </td>
                        <td className="p-4 text-[#484848] font-medium">{r.role}</td>
                        <td className="p-4"><span className={getLevelBadgeClass(r.level)}>{r.level}</span></td>
                        <td className="p-4 text-[#717171]">{r.location}</td>
                        <td className="p-4 text-[#484848] font-medium">{r.experience_years} yrs</td>
                        <td className="p-4 font-mono text-xs">{formatCompensation(convertedBase, currency)}</td>
                        <td className="p-4 font-mono text-xs">{formatCompensation(convertedStock, currency)}</td>
                        <td className="p-4 text-[#0369A1] font-bold text-base group-hover:scale-[1.01] transition-transform">
                          {formatCompensation(convertedTotal, currency)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer block */}
{meta.totalPages > 1 && (
  <div className="border-t border-[#EBEBEB] p-4 bg-[#F7F7F7] flex flex-col md:flex-row justify-between items-center gap-4">

    <span className="text-xs text-[#717171]">
      Showing {((page - 1) * meta.limit) + 1}–
      {Math.min(page * meta.limit, meta.total)} of {meta.total} records
    </span>

    <div className="flex flex-wrap justify-center items-center gap-2">

      <button
        disabled={page <= 1 || isPending}
        onClick={() => handlePageChange(page - 1)}
        className="px-3 py-2 border border-[#EBEBEB] rounded-lg bg-white text-sm hover:bg-[#F2F2F2] disabled:opacity-40"
      >
        Previous
      </button>

      {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
        .slice(
          Math.max(0, page - 3),
          Math.min(meta.totalPages, page + 2)
        )
        .map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
              page === pageNumber
                ? 'bg-[#FF5A5F] text-white'
                : 'bg-white border border-[#EBEBEB] hover:bg-[#F2F2F2]'
            }`}
          >
            {pageNumber}
          </button>
        ))}

      <button
        disabled={page >= meta.totalPages || isPending}
        onClick={() => handlePageChange(page + 1)}
        className="px-3 py-2 border border-[#EBEBEB] rounded-lg bg-white text-sm hover:bg-[#F2F2F2] disabled:opacity-40"
      >
        Next
      </button>

    </div>
  </div>
)}
        </div>

      </div>
    </div>
  );
}