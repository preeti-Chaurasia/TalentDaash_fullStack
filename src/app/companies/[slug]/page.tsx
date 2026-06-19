import React from 'react';
import { db } from '@/lib/db'; 
import { formatCompensation } from '@/lib/config';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
}


export async function generateMetadata({ params }: CompanyPageProps) {
  const { slug } = await params;
  const data = await db.company.findUnique({ where: { slug }, include: { salaries: true } });
  if (!data) return { title: 'Company Not Found | TalentDash' };
  return { title: `${data.name} Salaries & Culture Dashboard | TalentDash` };
}

export default async function CompanyDetailPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  
 
  const data = await db.company.findUnique({
    where: { slug: slug },
    include: { salaries: true }
  });

  if (!data) {
    notFound();
  }

  
  const company = data;
  const salaries = data.salaries;
  const totalSalariesCount = salaries.length;
  
  
  const median_total_compensation = salaries.length > 0 
    ? salaries.sort((a,b) => Number(a.total_compensation) - Number(b.total_compensation))[Math.floor(salaries.length/2)].total_compensation 
    : 0;

  const level_distribution = salaries.reduce((acc: any, s: any) => {
    acc[s.level] = (acc[s.level] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-[#F7F7F7] min-h-screen text-[#222222] font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Breadcrumb Navigation segment */}
        <div className="text-xs text-[#717171]">
          <Link href="/salaries" className="hover:underline">Salaries</Link> · <span className="font-medium text-[#222222]">{company.name}</span>
        </div>

        {/* Company Professional Identity Header Component */}
        <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#222222] tracking-tight">{company.name}</h1>
              <span className="bg-[#F2F2F2] text-[#484848] text-xs font-semibold px-2.5 py-1 rounded-md">{company.industry}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs text-[#717171]">
              <div>HQ: <span className="text-[#484848] font-medium">{company.headquarters}</span></div>
              <div>Headcount: <span className="text-[#484848] font-medium">{company.headcount_range || '—'}</span></div>
              <div>Founded: <span className="text-[#484848] font-medium">{company.founded_year || '—'}</span></div>
            </div>
          </div>

          <Link
            href={`/compare?c1=${company.slug}`}
            className="w-full md:w-auto text-center px-5 py-2.5 bg-[#FF5A5F] hover:bg-opacity-90 text-white font-semibold text-sm rounded-lg transition shadow-sm"
          >
            Compare Company
          </Link>
        </div>

        {/* Analytic Cards Grid Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#EBEBEB] rounded-xl p-5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-[#717171] uppercase tracking-wider">Median Total Comp</span>
            <div className="text-3xl font-bold text-[#0369A1] tracking-tight">
              {formatCompensation(median_total_compensation, 'INR')}
            </div>
          </div>

          <div className="bg-white border border-[#EBEBEB] rounded-xl p-5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-[#717171] uppercase tracking-wider">Data Ingestion Depth</span>
            <div className="text-3xl font-bold text-[#222222] tracking-tight">{totalSalariesCount} Rows</div>
          </div>

          <div className="bg-white border border-[#EBEBEB] rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-[#717171] uppercase tracking-wider mb-2">Level Spread Share</span>
            <div className="w-full h-4 bg-[#F2F2F2] rounded-full overflow-hidden flex">
              {Object.entries(level_distribution).map(([lvl, count]: any, idx) => {
                const pct = (count / totalSalariesCount) * 100;
                const colors = ['bg-slate-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-teal-500'];
                return <div key={lvl} style={{ width: `${pct}%` }} className={`${colors[idx % 5]} h-full`} />;
              })}
            </div>
          </div>
        </div>

        {/* Table Listing Block */}
        <div className="bg-white border border-[#EBEBEB] rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#EBEBEB] bg-[#F7F7F7]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#717171]">Compensation Entry Ledger</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F7F7] border-b border-[#EBEBEB] text-[#717171] text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4">Role</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4">Total Comp</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#EBEBEB]">
                {salaries.map((s: any) => (
                  <tr key={s.id} className="hover:bg-[#F2F2F2]">
                    <td className="p-4 font-semibold">{s.role}</td>
                    <td className="p-4"><span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-800">{s.level}</span></td>
                    <td className="p-4 text-[#717171]">{s.location}</td>
                    <td className="p-4 text-[#484848]">{s.experience_years} yrs</td>
                    <td className="p-4 text-[#0369A1] font-bold">{formatCompensation(s.total_compensation, 'INR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}