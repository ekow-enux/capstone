export interface RankDefinition {
  code: string; // initials, e.g., CFO, DCFO, ACFO, DO I, etc.
  full: string; // full title
  corps: 'Senior/Officer' | 'Junior/Firefighter';
}

export const RANKS: RankDefinition[] = [
  // Senior / Officer Corps
  { code: 'CFO', full: 'Chief Fire Officer', corps: 'Senior/Officer' },
  { code: 'DCFO', full: 'Deputy Chief Fire Officer', corps: 'Senior/Officer' },
  { code: 'ACFO', full: 'Assistant Chief Fire Officer', corps: 'Senior/Officer' },
  { code: 'DO I', full: 'Divisional Officer Grade One', corps: 'Senior/Officer' },
  { code: 'DO II', full: 'Divisional Officer Grade Two', corps: 'Senior/Officer' },
  { code: 'DO III', full: 'Divisional Officer Grade Three', corps: 'Senior/Officer' },
  { code: 'ADO I', full: 'Assistant Divisional Officer Grade One', corps: 'Senior/Officer' },
  { code: 'ADO II', full: 'Assistant Divisional Officer Grade Two', corps: 'Senior/Officer' },
  { code: 'CO', full: 'Cadet Officer', corps: 'Senior/Officer' },

  // Junior / Firefighter Corps
  { code: 'STN/O I', full: 'Station Officer Grade One', corps: 'Junior/Firefighter' },
  { code: 'GO I', full: 'Group Officer Grade One', corps: 'Junior/Firefighter' },
  { code: 'STN/O II', full: 'Station Officer Grade Two', corps: 'Junior/Firefighter' },
  { code: 'GO II', full: 'Group Officer Grade Two', corps: 'Junior/Firefighter' },
  { code: 'ASO', full: 'Assistant Station Officer', corps: 'Junior/Firefighter' },
  { code: 'DGO', full: 'Deputy Group Officer', corps: 'Junior/Firefighter' },
  { code: 'SUB/O', full: 'Subordinate Officer', corps: 'Junior/Firefighter' },
  { code: 'AGO', full: 'Assistant Group Officer', corps: 'Junior/Firefighter' },
  { code: 'LFM/LFW', full: 'Leading Fireman / Leading Firewoman', corps: 'Junior/Firefighter' },
  { code: 'SFM/SFW', full: 'Senior Fireman / Senior Firewoman', corps: 'Junior/Firefighter' },
  { code: 'FM/FW', full: 'Fireman / Firewoman', corps: 'Junior/Firefighter' },
  { code: 'RFM/RFW', full: 'Recruit Fireman / Recruit Firewoman', corps: 'Junior/Firefighter' },
];

// Build map including aliases for split codes (e.g., LFM and LFW both map to same full title)
const codeToFull = new Map<string, string>();
for (const r of RANKS) {
  codeToFull.set(r.code.toUpperCase(), r.full);
  if (r.code.includes('/')) {
    const parts = r.code.split('/').map(p => p.trim().toUpperCase());
    for (const p of parts) {
      codeToFull.set(p, r.full);
    }
  }
}

export function formatRank(code: string): string {
  // Normalize spacing for codes like "DO I"
  const normalized = code.trim().toUpperCase();
  const full = codeToFull.get(normalized);
  return full ? `${normalized} — ${full}` : normalized;
}

export function getCorps(code: string): 'Senior/Officer' | 'Junior/Firefighter' | 'Senior/Officer' | 'Junior/Firefighter' {
  const normalized = code.trim().toUpperCase();
  // Find first matching definition by code or split aliases
  for (const r of RANKS) {
    if (r.code.toUpperCase() === normalized) return r.corps;
    if (r.code.includes('/')) {
      const parts = r.code.split('/').map(p => p.trim().toUpperCase());
      if (parts.includes(normalized)) return r.corps;
    }
  }
  // Default to Junior if unknown (safer UI grouping)
  return 'Junior/Firefighter';
}

// Helpers to resolve inputs that might be codes or full titles, with common aliases
const FULL_TO_CODE_ALIASES: Record<string, string> = {
  // Station/Group Officer variants
  'STATION OFFICER I': 'STN/O I',
  'STATION OFFICER GRADE ONE': 'STN/O I',
  'GROUP OFFICER I': 'GO I',
  'GROUP OFFICER GRADE ONE': 'GO I',
  'STATION OFFICER II': 'STN/O II',
  'STATION OFFICER GRADE TWO': 'STN/O II',
  'GROUP OFFICER II': 'GO II',
  'GROUP OFFICER GRADE TWO': 'GO II',

  // Common firefighter ranks (gender-agnostic base; gender will refine below)
  'LEADING FIREMAN': 'LFM',
  'LEADING FIREWOMAN': 'LFW',
  'SENIOR FIREMAN': 'SFM',
  'SENIOR FIREWOMAN': 'SFW',
  'FIREMAN': 'FM',
  'FIREWOMAN': 'FW',
  'RECRUIT FIREMAN': 'RFM',
  'RECRUIT FIREWOMAN': 'RFW',

  // Other officer variants
  'ASSISTANT STATION OFFICER': 'ASO',
  'DEPUTY GROUP OFFICER': 'DGO',
  'SUBORDINATE OFFICER': 'SUB/O',
  'ASSISTANT GROUP OFFICER': 'AGO',

  // Senior/Officer that might appear in inputs
  'DIVISIONAL OFFICER I': 'DO I',
  'DIVISIONAL OFFICER GRADE ONE': 'DO I',
  'DIVISIONAL OFFICER II': 'DO II',
  'DIVISIONAL OFFICER GRADE TWO': 'DO II',
  'DIVISIONAL OFFICER III': 'DO III',
  'DIVISIONAL OFFICER GRADE THREE': 'DO III',
  'ASSISTANT CHIEF FIRE OFFICER': 'ACFO',
  'DEPUTY CHIEF FIRE OFFICER': 'DCFO',
  'CHIEF FIRE OFFICER': 'CFO',
  'CADET OFFICER': 'CO',
};

export function resolveRankCode(input: string, gender?: 'Male' | 'Female'): string {
  if (!input) return input;
  const trimmed = input.trim();
  const upper = trimmed.toUpperCase();
  // If already a known code
  if (codeToFull.has(upper)) return upper;
  // Try alias map
  let base = FULL_TO_CODE_ALIASES[upper];
  if (!base) return trimmed; // fall back to original
  // Handle gendered pairs
  if (['LFM', 'LFW', 'SFM', 'SFW', 'FM', 'FW', 'RFM', 'RFW'].includes(base)) {
    if (gender === 'Female') {
      if (base === 'LFM') base = 'LFW';
      if (base === 'SFM') base = 'SFW';
      if (base === 'FM') base = 'FW';
      if (base === 'RFM') base = 'RFW';
    } else {
      if (base === 'LFW') base = 'LFM';
      if (base === 'SFW') base = 'SFM';
      if (base === 'FW') base = 'FM';
      if (base === 'RFW') base = 'RFM';
    }
  }
  return base;
}

