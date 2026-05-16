import { parseCSV, csvResponse } from './_csvParser';

function parseSongName(raw: string): { name: string; extra: string | undefined } {
  const newline = raw.indexOf('\n');
  if (newline === -1) return { name: raw.trim(), extra: undefined };
  const name = raw.substring(0, newline).trim();
  const extra = raw.substring(newline).trim().replace(/^\n+/, '') || undefined;
  return { name, extra };
}

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const url = new URL(context.request.url);
    const csvUrl = `${url.origin}/data/unreleased.csv`;

    const res = await fetch(csvUrl);
    if (!res.ok) return new Response('CSV not found', { status: 404 });

    const text = await res.text();
    const rows = parseCSV(text);

    // Find column keys dynamically — the CSV header may embed discord/notice text after a newline
    const firstRowKeys = Object.keys(rows[0] ?? {});
    const NAME_KEY = firstRowKeys.find(k => k === 'Name' || k.startsWith('Name\n')) ?? 'Name';
    const NOTES_KEY = firstRowKeys.find(k => k.startsWith('Notes')) ?? 'Notes';

    const eras: Record<string, any> = {};

    // Eras whose song rows use a different name than the header row's Name field.
    const ERA_ALIAS_MAP: Record<string, string> = {
      'THC: The High Chronical$': 'The High Chronical$',
      'Donda': 'Ye - DONDA',
    };

    // Eras that have no header row in the CSV — include them anyway.
    const HEADERLESS_ERAS = new Set<string>(['TMB Collab']);

    // First pass: collect real era names from header rows.
    // Header rows have newlines in the Era field (file counts).
    // Stats rows also have newlines but their Name field starts with a digit — skip those.
    const validEraNames = new Set<string>(HEADERLESS_ERAS);
    for (const row of rows) {
      const eraField = row['Era'] ?? '';
      if (!eraField.includes('\n')) continue;
      const { name: eraName } = parseSongName(row[NAME_KEY] ?? '');
      if (eraName && !/^\d+\s/.test(eraName)) validEraNames.add(eraName);
    }

    // Second pass: build eras and songs, ignoring anything outside known eras.
    for (const row of rows) {
      const eraField = row['Era'] ?? '';
      const nameField = row[NAME_KEY] ?? '';

      if (eraField.includes('\n')) {
        // Era header row
        const { name: rawName, extra } = parseSongName(nameField);
        if (!rawName || !validEraNames.has(rawName)) continue;

        eras[rawName] = {
          name: rawName,
          extra: extra ?? undefined,
          timeline: row[NOTES_KEY]?.trim() || undefined,
          fileInfo: eraField.split('\n').map((l: string) => l.trim()).filter(Boolean),
          data: { 'Unreleased Tracks': [] },
        };
      } else if (eraField) {
        // Regular song row — resolve aliases before lookup
        const resolved = ERA_ALIAS_MAP[eraField.trim()] ?? eraField.trim();
        if (!validEraNames.has(resolved)) continue;
        const eraName = resolved;
        if (!eras[eraName]) {
          eras[eraName] = { name: eraName, data: { 'Unreleased Tracks': [] } };
        }

        const { name, extra } = parseSongName(nameField);
        const links = (row['Link(s)'] ?? '').split('\n').map((l: string) => l.trim()).filter(Boolean);

        eras[eraName].data['Unreleased Tracks'].push({
          name,
          extra: extra ?? undefined,
          description: row[NOTES_KEY] ?? '',
          track_length: row['Track Length'] ?? '',
          file_date: row['File Date'] ?? '',
          leak_date: row['Leak Date'] ?? '',
          available_length: row['Available Length'] ?? '',
          quality: row['Quality'] ?? '',
          url: links[0] ?? '',
          urls: links,
        });
      }
    }

    // ERA_ORDER is empty — all eras append in CSV order.
    const ERA_ORDER: string[] = [];

    const orderedEras: Record<string, any> = {};
    for (const name of ERA_ORDER) {
      if (eras[name]) orderedEras[name] = eras[name];
    }
    for (const name of Object.keys(eras)) {
      if (!orderedEras[name]) orderedEras[name] = eras[name];
    }

    const trackerData = {
      name: 'VAMP Gold',
      tabs: ['eras'],
      current_tab: 'eras',
      eras: orderedEras,
    };

    return csvResponse(trackerData);
  } catch (err) {
    return new Response('Failed to build tracker data', { status: 500 });
  }
};
