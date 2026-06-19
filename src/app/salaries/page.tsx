import React from 'react';
import SalaryTableClient from '@/components/features/SalaryTableClient';
import { db } from '@/lib/db';
import { Metadata } from 'next';

//export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;

  const roleTitle = params.role || 'Software Engineer';
  const companyTitle = params.company
    ? `at ${params.company}`
    : 'India';

  return {
    title: `${roleTitle} Salaries ${companyTitle} — L3 to L5 | TalentDash`,
    description: `Explore structured, real-time authenticated compensation data for ${roleTitle} role types.`,
  };
}

export default async function SalariesPage({
  searchParams,
}: PageProps) {
  const resolvedParams = await searchParams;

  const company = resolvedParams.company || '';
  const role = resolvedParams.role || '';
  const location = resolvedParams.location || '';
  const levelParam = resolvedParams.level || '';

  // Pagination
  const page = Number(resolvedParams.page || 1);
  const limit = 25;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (company.trim()) {
    whereClause.company = {
      name: {
        contains: company.trim(),
        mode: 'insensitive',
      },
    };
  }

  if (role.trim()) {
    whereClause.role = {
      contains: role.trim(),
      mode: 'insensitive',
    };
  }

  if (location.trim()) {
    whereClause.location = {
      contains: location.trim(),
      mode: 'insensitive',
    };
  }

  if (levelParam.trim()) {
    const arr = levelParam.split(',').filter(Boolean);

    if (arr.length > 0) {
      whereClause.level = {
        in: arr,
      };
    }
  }

  // Total records count after filters
  const total = await db.salary.count({
    where: whereClause,
  });

  // Paginated records
const sort = resolvedParams.sort || 'total_comp_desc';

const orderBy =
  sort === 'total_comp_asc'
    ? { total_compensation: 'asc' as const }
    : { total_compensation: 'desc' as const };

const records = await db.salary.findMany({
  where: whereClause,
  include: {
    company: {
      select: {
        name: true,
        slug: true,
      },
    },
  },
  orderBy,
  skip,
  take: limit,
});

  const serializedData = records.map((r) => ({
    ...r,
    base_salary: r.base_salary.toString(),
    bonus: r.bonus.toString(),
    stock: r.stock.toString(),
    total_compensation: r.total_compensation.toString(),
    confidence_score: r.confidence_score
      ? r.confidence_score.toString()
      : '0',
    submitted_at: r.submitted_at
      ? r.submitted_at.toISOString()
      : new Date().toISOString(),
  }));

  const initialData = {
    data: serializedData,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  return <SalaryTableClient initialData={initialData} />;
}