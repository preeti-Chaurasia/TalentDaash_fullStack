import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Level, Currency, Source } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, level, location, currency, experience_years, base_salary, bonus, stock, company_name } = body;

    // 1. Core Validations
    if (!company_name || !role || !level || !location || !currency || experience_years === undefined || base_salary === undefined) {
      return NextResponse.json({ error: true, message: 'All required fields must be provided.' }, { status: 400 });
    }

    if (!Object.values(Level).includes(level as Level)) {
      return NextResponse.json({ error: true, field: 'level', message: `Level must be one of: ${Object.values(Level).join(', ')}` }, { status: 400 });
    }

    if (!Object.values(Currency).includes(currency as Currency)) {
      return NextResponse.json({ error: true, field: 'currency', message: 'Invalid currency specified.' }, { status: 400 });
    }

    const exp = Number(experience_years);
    if (isNaN(exp) || exp <= 0 || exp > 50) {
      return NextResponse.json({ error: true, field: 'experience_years', message: 'Experience must be between 1 and 50.' }, { status: 400 });
    }

    const base = BigInt(base_salary);
    if (base <= BigInt(0)) {
      return NextResponse.json({ error: true, field: 'base_salary', message: 'Base salary must be greater than 0.' }, { status: 400 });
    }

    const calculatedBonus = bonus ? BigInt(bonus) : BigInt(0);
    const calculatedStock = stock ? BigInt(stock) : BigInt(0);
    
    // Server-side strict computed condition rule
    const totalCompensation = base + calculatedBonus + calculatedStock;

    // 2. Normalization Process
    const trimmed = company_name.trim();
    const normalizedName = trimmed.toLowerCase();
    const slug = normalizedName.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

    // Find or create company
    const company = await db.company.upsert({
      where: { normalized_name: normalizedName },
      update: {},
      create: {
        name: trimmed,
        slug: slug,
        normalized_name: normalizedName,
        industry: 'Tech',
        headquarters: 'Unknown',
      },
    });

    // 3. Duplicate Prevention Mechanism (48 Hours rule with 10% bounds)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const existingSimilar = await db.salary.findFirst({
      where: {
        company_id: company.id,
        role: role,
        level: level as Level,
        location: location,
        submitted_at: { gte: fortyEightHoursAgo },
      },
    });

    if (existingSimilar) {
      const diff = Math.abs(Number(existingSimilar.base_salary) - Number(base));
      const threshold = Number(existingSimilar.base_salary) * 0.1;
      if (diff <= threshold) {
        return NextResponse.json({ error: true, message: 'Conflict: A similar salary record was already submitted within the last 48 hours.' }, { status: 409 });
      }
    }

    // 4. Save to Database
    const savedRecord = await db.salary.create({
      data: {
        company_id: company.id,
        role,
        level: level as Level,
        location,
        currency: currency as Currency,
        experience_years: exp,
        base_salary: base,
        bonus: calculatedBonus,
        stock: calculatedStock,
        total_compensation: totalCompensation,
        source: Source.CONTRIBUTOR,
        confidence_score: 1.0,
        is_verified: true,
      },
    });

    // Handle BigInt serialization
    const responseData = {
      ...savedRecord,
      base_salary: savedRecord.base_salary.toString(),
      bonus: savedRecord.bonus.toString(),
      stock: savedRecord.stock.toString(),
      total_compensation: savedRecord.total_compensation.toString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: true, message: error.message }, { status: 500 });
  }
}