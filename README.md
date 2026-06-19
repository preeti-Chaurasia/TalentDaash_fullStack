# TalentDash: Compensation Intelligence Engine

TalentDash is a high-performance compensation analytics platform designed to provide structured, authenticated salary data for tech professionals.

## 🚀 Live Demo
talent-daash-full-stack-zbnn.vercel.app

## 🏗 Architecture Overview
TalentDash is built using **Next.js 15 App Router** with **Server Components** for maximum performance.
- **Frontend:** Server-side rendered components for SEO and speed.
- **Backend:** PostgreSQL (Neon) managed via Prisma ORM.
- **Pipeline:** Automated normalization layer that standardizes company names and validates compensation data before storage.
- **Performance:** Optimized LCP by leveraging RSC (React Server Components) and database-level indexing.

<img width="3000" height="2500" alt="image" src="https://github.com/user-attachments/assets/6c41d48d-8ca9-42b7-a0c1-dbf906fbbca3" />


## ⚡ How to Run Locally
1. **Clone the repo:** `git clone https://github.com/preeti-Chaurasia/TalentDaash_fullStack.git`
2. **Install dependencies:** `npm install`
3. **Setup environment:** Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="your_postgresql_connection_string_here"
Initialize Database:
npx prisma db push --force-reset
npx prisma db seed
Start: npm run dev

Open http://localhost:3000

#Rejected Records & Reasons

Record: { company: "Unknown", role: "Intern", base: "abc" } → Rejected: Invalid base_salary (NaN).
Record: { company: "Google", role: "SDE", base: 1000000000 } → Rejected: Compensation Outlier (Validation threshold exceeded).
