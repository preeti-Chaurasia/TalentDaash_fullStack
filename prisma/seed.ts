import { PrismaClient, Level, Currency, Source } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });



function normalizeCompany(name: string) {
  const trimmed = name.trim();
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') 
    .replace(/\s+/g, '-'); 
  return {
    name: trimmed,
    slug: slug,
    normalized_name: trimmed.toLowerCase(),
  };
}

async function main() {
  console.log('Clearing old data...');
  await prisma.salary.deleteMany({});
  await prisma.company.deleteMany({});

  const sampleCompanies = [
    { name: 'Google India', industry: 'Tech', headquarters: 'Mountain View, CA', headcount_range: '10,000+', founded_year: 1998 },
    { name: 'Amazon', industry: 'E-commerce/Tech', headquarters: 'Seattle, WA', headcount_range: '10,000+', founded_year: 1994 },
    { name: 'Meta', industry: 'Social Media', headquarters: 'Menlo Park, CA', headcount_range: '10,000+', founded_year: 2004 },
    { name: 'Microsoft', industry: 'Tech', headquarters: 'Redmond, WA', headcount_range: '10,000+', founded_year: 175 },
    { name: 'Flipkart', industry: 'E-commerce', headquarters: 'Bengaluru, India', headcount_range: '5,000-10,000', founded_year: 2007 },
    { name: 'Meesho', industry: 'E-commerce', headquarters: 'Bengaluru, India', headcount_range: '1,000-5,000', founded_year: 2015 },
    { name: 'NVIDIA', industry: 'Semiconductors', headquarters: 'Santa Clara, CA', headcount_range: '10,000+', founded_year: 1993 },
    { name: 'TCS', industry: 'IT Services', headquarters: 'Mumbai, India', headcount_range: '10,000+', founded_year: 1968 },
    { name: 'Infosys', industry: 'IT Services', headquarters: 'Bengaluru, India', headcount_range: '10,000+', founded_year: 1981 },
    { name: 'Wipro', industry: 'IT Services', headquarters: 'Bengaluru, India', headcount_range: '10,000+', founded_year: 1945 },
    { name: 'Razorpay', industry: 'Fintech', headquarters: 'Bengaluru, India', headcount_range: '1,000-5,000', founded_year: 2014 },
    { name: 'Zepto', industry: 'Quick Commerce', headquarters: 'Mumbai, India', headcount_range: '1,000-5,000', founded_year: 2021 }
  ];

  console.log('Seeding companies...');
  const companyMap: Record<string, string> = {};

  for (const c of sampleCompanies) {
    const norm = normalizeCompany(c.name);
    
    const createdCompany = await prisma.company.upsert({
      where: { normalized_name: norm.normalized_name },
      update: {},
      create: {
        name: norm.name,
        slug: norm.slug,
        normalized_name: norm.normalized_name,
        industry: c.industry,
        headquarters: c.headquarters,
        founded_year: c.founded_year,
        headcount_range: c.headcount_range,
      },
    });
    companyMap[norm.normalized_name] = createdCompany.id;
  }


  const salariesData = [
    // Google India Records
    { compName: 'google india', role: 'Software Engineer', level: Level.L3, loc: 'Bengaluru', curr: Currency.INR, exp: 2, base: 1800000, bonus: 200000, stock: 400000 },
    { compName: 'google india', role: 'Software Engineer', level: Level.L4, loc: 'Bengaluru', curr: Currency.INR, exp: 5, base: 3200000, bonus: 400000, stock: 800000 },
    { compName: 'google india', role: 'Software Engineer', level: Level.L5, loc: 'Hyderabad', curr: Currency.INR, exp: 8, base: 4500000, bonus: 600000, stock: 1500000 },
    
    { compName: 'google india', role: 'Staff Engineer', level: Level.L6, loc: 'Bengaluru', curr: Currency.INR, exp: 12, base: 6500000, bonus: 1000000, stock: 3000000 },
    { compName: 'google india', role: 'Principal Engineer', level: Level.PRINCIPAL, loc: 'Bengaluru', curr: Currency.INR, exp: 16, base: 9500000, bonus: 2000000, stock: 5000000 }, // High equity edge case

    // Amazon Records
    { compName: 'amazon', role: 'Software Engineer', level: Level.SDE_I, loc: 'Bengaluru', curr: Currency.INR, exp: 1, base: 1600000, bonus: 350000, stock: 150000 },
    { compName: 'amazon', role: 'Software Engineer', level: Level.SDE_II, loc: 'Hyderabad', curr: Currency.INR, exp: 4, base: 2800000, bonus: 500000, stock: 400000 },
    { compName: 'amazon', role: 'Software Engineer', level: Level.SDE_III, loc: 'Bengaluru', curr: Currency.INR, exp: 9, base: 4200000, bonus: 600000, stock: 900000 },
    { compName: 'amazon', role: 'Product Manager', level: Level.IC4, loc: 'Pune', curr: Currency.INR, exp: 6, base: 3000000, bonus: 400000, stock: 300000 },
    { compName: 'amazon', role: 'Data Analyst', level: Level.L4, loc: 'Bengaluru', curr: Currency.INR, exp: 3, base: 1400000, bonus: 150000, stock: 0 }, // Edge case: zero stock

    // TCS Records
    { compName: 'tcs', role: 'System Engineer', level: Level.L3, loc: 'Mumbai', curr: Currency.INR, exp: 2, base: 450000, bonus: 20000, stock: 0 }, // Edge case: zero stock/bonus
    { compName: 'tcs', role: 'SDE-II equivalents', level: Level.SDE_II, loc: 'Pune', curr: Currency.INR, exp: 5, base: 850000, bonus: 50000, stock: 0 },

    
{ compName: 'microsoft', role: 'Software Engineer', level: Level.L5, loc: 'Bengaluru', curr: Currency.INR, exp: 4, base: 2200000, bonus: 300000, stock: 700000 },
{ compName: 'microsoft', role: 'Senior SDE', level: Level.L6, loc: 'Hyderabad', curr: Currency.INR, exp: 7, base: 3500000, bonus: 500000, stock: 1200000 },

{ compName: 'meta', role: 'Software Engineer', level: Level.L5, loc: 'Bengaluru', curr: Currency.INR, exp: 5, base: 3800000, bonus: 600000, stock: 2000000 },
{ compName: 'meta', role: 'Senior Engineer', level: Level.IC5, loc: 'Bengaluru', curr: Currency.INR, exp: 8, base: 5500000, bonus: 1000000, stock: 3500000 },

{ compName: 'nvidia', role: 'Hardware Engineer', level: Level.L3, loc: 'Bengaluru', curr: Currency.INR, exp: 3, base: 2000000, bonus: 300000, stock: 800000 },
{ compName: 'nvidia', role: 'Senior SDE', level: Level.IC4, loc: 'Bengaluru', curr: Currency.INR, exp: 6, base: 3200000, bonus: 500000, stock: 1500000 },

{ compName: 'flipkart', role: 'Software Engineer', level: Level.SDE_II, loc: 'Bengaluru', curr: Currency.INR, exp: 4, base: 2400000, bonus: 300000, stock: 400000 },
{ compName: 'flipkart', role: 'SDE III', level: Level.SDE_III, loc: 'Bengaluru', curr: Currency.INR, exp: 7, base: 3600000, bonus: 400000, stock: 700000 },

{ compName: 'meesho', role: 'Software Engineer', level: Level.SDE_I, loc: 'Bengaluru', curr: Currency.INR, exp: 2, base: 1400000, bonus: 100000, stock: 200000 },
{ compName: 'meesho', role: 'Software Engineer', level: Level.SDE_II, loc: 'Bengaluru', curr: Currency.INR, exp: 5, base: 2200000, bonus: 200000, stock: 400000 },

{ compName: 'infosys', role: 'Systems Engineer', level: Level.L3, loc: 'Pune', curr: Currency.INR, exp: 2, base: 400000, bonus: 30000, stock: 0 },
{ compName: 'wipro', role: 'Software Engineer', level: Level.L3, loc: 'Chennai', curr: Currency.INR, exp: 3, base: 450000, bonus: 40000, stock: 0 },

{ compName: 'razorpay', role: 'Software Engineer', level: Level.SDE_I, loc: 'Bengaluru', curr: Currency.INR, exp: 2, base: 1800000, bonus: 200000, stock: 300000 },
{ compName: 'zepto', role: 'Software Engineer', level: Level.SDE_II, loc: 'Mumbai', curr: Currency.INR, exp: 3, base: 2000000, bonus: 200000, stock: 300000 },

  ];

 
  console.log('Generating 60+ expanded records...');
  let totalRecordsCreated = 0;

  for (let i = 0; i < 6; i++) {
    for (const s of salariesData) {
      const companyId = companyMap[s.compName.toLowerCase()];
      if (!companyId) continue;

      const extraExp = i;
      const calculatedBase = BigInt(s.base) + BigInt(i * 50000);
      const calculatedBonus = BigInt(s.bonus);
      const calculatedStock = BigInt(s.stock);
      const calculatedTotal = calculatedBase + calculatedBonus + calculatedStock;

      await prisma.salary.create({
        data: {
          company_id: companyId,
          role: s.role,
          level: s.level,
          location: s.loc,
          currency: s.curr,
          experience_years: s.exp + extraExp <= 50 ? s.exp + extraExp : 50,
          base_salary: calculatedBase,
          bonus: calculatedBonus,
          stock: calculatedStock,
          total_compensation: calculatedTotal, // Recomputed server-side constraint rule
          source: Source.SCRAPED,
          confidence_score: 0.85,
          is_verified: true,
        },
      });
      totalRecordsCreated++;
    }
  }

  console.log(`Successfully seeded ${totalRecordsCreated} salary records!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });