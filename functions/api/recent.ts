import { parseCSV, csvResponse } from './_csvParser';

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const csvUrl = `${url.origin}/data/recent.csv`;

  const res = await fetch(csvUrl);
  if (!res.ok) return new Response('CSV not found', { status: 404 });

  const text = await res.text();
  const rows = parseCSV(text);

  // Normalize multi-line column headers to their first line
  const normalized = rows.map(row => {
    const out: Record<string, any> = {};
    for (const [key, val] of Object.entries(row)) {
      out[key.split('\n')[0].trim()] = val;
    }
    return out;
  });

  return csvResponse(normalized);
};
