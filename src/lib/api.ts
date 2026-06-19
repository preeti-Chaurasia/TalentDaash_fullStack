const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; 
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; 
};
const BASE_URL = getBaseUrl();

export async function fetchSalaries(searchParamsString: string) {
  
  const res = await fetch(`/api/salaries?${searchParamsString}`, {
    next: { revalidate: 300 }
  });
  if (!res.ok) return { data: [], meta: { total: 0, page: 1, limit: 25, totalPages: 0 } };
  return res.json();
}

