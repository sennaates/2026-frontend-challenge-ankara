// src/services/api.js

const API_KEY = '5593acd695caab1a3805c3af8532df09';
const BASE_URL = 'https://api.jotform.com';

export const FORM_IDS = {
  checkins: '261065067494966',
  messages: '261065765723966',
  sightings: '261065244786967',
  personalNotes: '261065509008958',
  anonymousTips: '261065875889981'
};

// GPS coordinates for known Ankara locations
export const LOCATION_COORDS = {
  'CerModern':         [39.93159, 32.84967],
  'Kızılay':           [39.91987, 32.85427],
  'Ulus':              [39.94039, 32.85563],
  'Çankaya':           [39.90435, 32.85928],
  'Tunalı Hilmi':      [39.90804, 32.85928],
  'Gençlik Parkı':     [39.93571, 32.86027],
  'Atakule':           [39.88778, 32.86372],
  'Dikmen':            [39.88497, 32.86111],
  'Bahçelievler':      [39.91823, 32.82948],
  'Beştepe':           [39.92951, 32.81234],
  'Kavaklıdere':       [39.90601, 32.86248],
  'Ayrancı':           [39.90100, 32.85400],
};

/**
 * Normalise a location string to find a coordinate match.
 * Tries an exact key match first, then a substring scan.
 */
export function resolveCoords(locationString) {
  if (!locationString) return null;
  const loc = locationString.trim();

  // 1. Exact match
  if (LOCATION_COORDS[loc]) return LOCATION_COORDS[loc];

  // 2. Substring match (case-insensitive)
  const lower = loc.toLowerCase();
  for (const [key, coords] of Object.entries(LOCATION_COORDS)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return coords;
    }
  }
  return null;
}

export async function getSubmissions(formName) {
  const formId = FORM_IDS[formName];
  if (!formId) return [];

  try {
    const response = await fetch(`${BASE_URL}/form/${formId}/submissions?apiKey=${API_KEY}`);
    if (!response.ok) throw new Error(`API Hatası! ${response.status}`);
    const data = await response.json();
    return data.content || [];
  } catch (error) {
    console.error(`[PodoTrace] Hata:`, error);
    return [];
  }
}