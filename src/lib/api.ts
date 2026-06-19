const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function fetchSalaries(searchParamsString: string) {
  const res = await fetch(`${BASE_URL}/api/salaries?${searchParamsString}`, {
    next: { revalidate: 300 } // ISR trigger constraint rule caching
  });
  if (!res.ok) return { data: [], meta: { total: 0, page: 1, limit: 25, totalPages: 0 } };
  return res.json();
}

export async function fetchCompanyDetails(slug: string) {
  const res = await fetch(`${BASE_URL}/api/companies/${slug}`, {
    next: { revalidate: 7200 } // ISR Cache 2 Hours Rule
  });
  if (!res.ok) return null;
  return res.json();
}