import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const s1 = searchParams.get('s1');
    const s2 = searchParams.get('s2');

    if (!s1 || !s2) {
      return NextResponse.json({ error: true, message: 'Both s1 and s2 parameters are required.' }, { status: 400 });
    }

    if (s1 === s2) {
      return NextResponse.json({ error: true, message: 'Comparison records IDs must be completely unique.' }, { status: 400 });
    }

    // Parallel processing with Next transactions pattern
    const [record1, record2] = await Promise.all([
      db.salary.findUnique({ where: { id: s1 }, include: { company: true } }),
      db.salary.findUnique({ where: { id: s2 }, include: { company: true } }),
    ]);

    if (!record1 || !record2) {
      return NextResponse.json({ error: true, message: 'One or both structural salary data points not found.' }, { status: 404 });
    }

    // Delta metrics computation sequence
    const delta = {
      base_delta: (Number(record1.base_salary) - Number(record2.base_salary)).toString(),
      bonus_delta: (Number(record1.bonus) - Number(record2.bonus)).toString(),
      stock_delta: (Number(record1.stock) - Number(record2.stock)).toString(),
      tc_delta: (Number(record1.total_compensation) - Number(record2.total_compensation)).toString(),
      experience_delta: record1.experience_years - record2.experience_years,
    };

    const formatRecord = (r: any) => ({
      ...r,
      base_salary: r.base_salary.toString(),
      bonus: r.bonus.toString(),
      stock: r.stock.toString(),
      total_compensation: r.total_compensation.toString(),
    });

    return NextResponse.json({
      record1: formatRecord(record1),
      record2: formatRecord(record2),
      delta,
    });
  } catch (error: any) {
    return NextResponse.json({ error: true, message: error.message }, { status: 500 });
  }
}