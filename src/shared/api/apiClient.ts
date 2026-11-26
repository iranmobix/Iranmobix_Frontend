const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export async function apiFetch<T>(url: string): Promise<T> {
  const fullUrl = `${BASE_URL}${url}`;

  const res = await fetch(fullUrl);

  if (!res.ok) {
    const errorText = await res.text();

    throw new Error(errorText || "API request failed");
  }

  const data = await res.json();

  return data;
}