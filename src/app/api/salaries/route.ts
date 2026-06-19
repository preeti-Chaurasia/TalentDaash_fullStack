import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Level } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const company = searchParams.get('company') || '';
    const role = searchParams.get('role') || '';
    const location = searchParams.get('location') || '';
    const levelParam = searchParams.get('level') || '';
    const sort = searchParams.get('sort') || 'total_comp_desc';
    
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25')));
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
      const parsedLevels = levelParam
        .split(',')
        .map((l) => l.trim())
        .filter((l) => Object.values(Level).includes(l as Level));

      if (parsedLevels.length > 0) {
        whereClause.level = {
          in: parsedLevels,
        };
      }
    }

    const orderBy: any = {};
    if (sort === 'total_comp_asc') {
      orderBy.total_compensation = 'asc';
    } else {
      orderBy.total_compensation = 'desc';
    }

    // FIXED: Removed Prisma.$transaction to prevent pool timeout locks (P2028)
    // Using simple parallel Promise resolution which is much lighter on Serverless DBs
    const [records, total] = await Promise.all([
      db.salary.findMany({
        where: whereClause,
        include: {
          company: {
            select: { name: true, slug: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.salary.count({ where: whereClause }),
    ]);

    // Format BigInt values into clean strings safely
    const sanitizedRecords = records.map((r) => ({
      ...r,
      base_salary: r.base_salary.toString(),
      bonus: r.bonus.toString(),
      stock: r.stock.toString(),
      total_compensation: r.total_compensation.toString(),
    }));

    const response = NextResponse.json({
      data: sanitizedRecords,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return response;

  } catch (error) {
    console.error("Backend runtime pipeline mapping failed:", error);
    return NextResponse.json({ error: "Internal crash mapping serializations" }, { status: 500 });
  }
}