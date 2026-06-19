import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. Fetch Company along with all structural Salary metrics
    const company = await db.company.findUnique({
      where: { slug },
      include: {
        salaries: {
          orderBy: { total_compensation: 'desc' },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: true, message: 'Company not found' }, { status: 404 });
    }

    const salariesCount = company.salaries.length;
    let medianTotalCompensation = '0';

    // 2. Statistical True Median Calculation
    if (salariesCount > 0) {
      const sortedValues = company.salaries.map((s) => Number(s.total_compensation));
      const mid = Math.floor(salariesCount / 2);
      
      if (salariesCount % 2 !== 0) {
        medianTotalCompensation = sortedValues[mid].toString();
      } else {
        medianTotalCompensation = Math.round((sortedValues[mid - 1] + sortedValues[mid]) / 2).toString();
      }
    }

    // 3. Level Distribution Mapping Matrix
    const levelDistribution: Record<string, number> = {};
    company.salaries.forEach((s) => {
      levelDistribution[s.level] = (levelDistribution[s.level] || 0) + 1;
    });

    // 4. Sanitize and Format BigInt Arrays securely
    const sanitizedSalaries = company.salaries.map((r) => ({
      ...r,
      base_salary: r.base_salary.toString(),
      bonus: r.bonus.toString(),
      stock: r.stock.toString(),
      total_compensation: r.total_compensation.toString(),
    }));

    return NextResponse.json(
      {
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          industry: company.industry,
          headquarters: company.headquarters,
          founded_year: company.founded_year,
          headcount_range: company.headcount_range,
        },
        median_total_compensation: medianTotalCompensation,
        level_distribution: levelDistribution,
        salaries: sanitizedSalaries,
      },
      {
        headers: {
          'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: true, message: error.message }, { status: 500 });
  }
}