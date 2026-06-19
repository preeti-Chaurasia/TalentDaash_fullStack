import Link from 'next/link';
import { db } from '@/lib/db';
import { Metadata } from 'next';

//export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tech Companies | TalentDash',
  description: 'Browse top technology companies and explore their authenticated compensation structures.',
};

export default async function CompaniesListPage() {
  // Database se saari companies alphabetical order me fetch karo
  const companies = await db.company.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="bg-[#F7F7F7] min-h-screen text-[#222222] font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Companies Directory</h1>
          <p className="text-sm text-[#484848]">Explore compensation analytics and culture metrics across top technology organizations.</p>
        </div>

        {/* Premium Grid Layout matching the Mockups */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div 
              key={company.id} 
              className="bg-white border border-[#EBEBEB] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-bold text-[#222222] mb-1">{company.name}</h2>
                <p className="text-sm text-[#717171]">{company.industry}</p>
                <div className="mt-3 text-xs font-medium text-[#484848] bg-[#F2F2F2] inline-block px-2.5 py-1 rounded-md">
                  HQ: {company.headquarters || 'Global'}
                </div>
              </div>
              
              <div className="mt-6 border-t border-[#EBEBEB] pt-4">
                <Link
                  href={`/companies/${company.slug}`}
                  className="text-sm font-semibold text-[#FF5A5F] hover:text-opacity-80 flex items-center gap-1 transition-colors"
                >
                  View Salary Analytics <span className="text-lg">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}