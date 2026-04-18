import { useEffect, useState, useMemo } from 'react';
import { getSubmissions, FORM_IDS, resolveCoords } from './services/api';
import MapView  from './components/MapView';
import Timeline from './components/Timeline';

// ─── Name normaliser (Kağan / Kagan / Kağan A. all match) ────────────────────
const normalizeName = (name) => {
  if (!name) return '';
  return name.toLowerCase().trim()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .split(' ')[0];
};

// ─── Raw → clean submission ───────────────────────────────────────────────────
const cleanData = (rawSubmissions, type) => {
  if (!rawSubmissions) return [];
  return rawSubmissions.map(sub => {
    const ans      = sub.answers;
    const person   = ans?.['3']?.answer || ans?.['2']?.answer || 'Unknown';
    const location = ans?.['5']?.answer || ans?.['1']?.answer || 'Belirtilmemiş';
    return {
      id:               sub.id,
      type,
      person,
      normalizedPerson: normalizeName(person),
      location,
      content:          ans?.['7']?.answer || ans?.['4']?.answer || ans?.['2']?.answer || 'Detay yok',
      date:             ans?.['4']?.answer || sub.created_at,
      coords:           resolveCoords(location), // null if unknown location
    };
  });
};

export default function App() {
  const [allClues,        setAllClues]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [searchTerm,      setSearchTerm]      = useState('');
  const [selectedPerson,  setSelectedPerson]  = useState(null);
  const [selectedLocation,setSelectedLocation]= useState(null); // map ↔ timeline sync

  // ─── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let combined = [];
        for (const key of Object.keys(FORM_IDS)) {
          const raw = await getSubmissions(key);
          combined  = [...combined, ...cleanData(raw, key)];
        }
        combined.sort((a, b) => b.date.localeCompare(a.date));
        setAllClues(combined);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ─── Suspects list ────────────────────────────────────────────────────────
  const suspects = useMemo(() => {
    const names = allClues.map(c => c.normalizedPerson).filter(n => n && n !== 'podo' && n !== 'unknown');
    return [...new Set(names)];
  }, [allClues]);

  // ─── Filtered clues (search + person + location) ─────────────────────────
  const filteredClues = useMemo(() => {
    return allClues.filter(clue => {
      const matchesSearch   = !searchTerm || (
        clue.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clue.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesPerson   = !selectedPerson   || clue.normalizedPerson === selectedPerson;
      const matchesLocation = !selectedLocation || clue.location === selectedLocation;
      return matchesSearch && matchesPerson && matchesLocation;
    });
  }, [allClues, searchTerm, selectedPerson, selectedLocation]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleMarkerClick = (location) => {
    setSelectedLocation(prev => prev === location ? null : location);
  };

  // ─── Loading splash ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-amber-500 font-mono gap-3">
        <span className="text-4xl animate-pulse">🕵️</span>
        <p className="text-sm tracking-widest uppercase animate-pulse">İstihbarat Bağlantıları Kuruluyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="shrink-0 px-5 py-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/95 backdrop-blur sticky top-0 z-[2000]">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🕵️</span>
          <div>
            <h1 className="text-xl font-black text-amber-500 tracking-tighter uppercase leading-none">
              PodoTrace <span className="text-slate-500">/ Ankara</span>
            </h1>
            <p className="text-slate-500 font-mono text-[10px] mt-0.5">
              Vaka Durumu:{' '}
              <span className="text-red-500 animate-pulse">KRİTİK</span>
              {selectedLocation && (
                <span className="text-amber-400 ml-3">
                  🗺 Filtre: <strong>{selectedLocation}</strong>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <input
            type="text"
            placeholder="İsim veya lokasyon ara..."
            className="bg-slate-900 border border-slate-700 rounded-full px-5 py-2 text-sm focus:outline-none focus:border-amber-500 w-full md:w-56 transition"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          {/* Clear location filter */}
          {selectedLocation && (
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-2 rounded-full hover:bg-amber-500/20 transition font-bold"
            >
              ✕ Filtre Kaldır
            </button>
          )}

          {/* Record count */}
          <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
            {filteredClues.length} / {allClues.length} kayıt
          </span>
        </div>
      </header>

      {/* ── Body: suspects sidebar + dual panel ─────────────────────────────── */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* Suspects sidebar */}
        <aside className="shrink-0 lg:w-48 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 bg-slate-950">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Şüpheli Listesi</h2>
          <div className="flex lg:flex-col flex-wrap gap-2">
            <button
              onClick={() => setSelectedPerson(null)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition text-left ${
                !selectedPerson ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              HEPSİ
            </button>
            {suspects.map(name => (
              <button
                key={name}
                onClick={() => setSelectedPerson(prev => prev === name ? null : name)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase transition text-left ${
                  selectedPerson === name
                    ? 'bg-amber-500 text-black'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </aside>

        {/* ── Dual panel: Map + Timeline ─────────────────────────────────── */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden gap-0">

          {/* Map panel */}
          <section className="relative border-b lg:border-b-0 lg:border-r border-slate-800 p-4 flex flex-col gap-3 min-h-[400px] lg:min-h-0">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <span>🗺 İstihbarat Haritası — Ankara</span>
              <span>{Object.keys(
                filteredClues.filter(c => c.coords)
                  .reduce((acc, c) => { acc[c.location] = 1; return acc; }, {})
              ).length} lokasyon</span>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden" style={{ minHeight: 350 }}>
              <MapView
                clues={filteredClues}
                selectedLocation={selectedLocation}
                onMarkerClick={handleMarkerClick}
              />
            </div>
          </section>

          {/* Timeline panel */}
          <section className="flex flex-col gap-3 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 68px)' }}>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
              <span>⏱ Kronolojik Olay Akışı</span>
              <span>{filteredClues.length} kayıt</span>
            </div>
            <Timeline
              clues={filteredClues}
              selectedLocation={selectedLocation}
              onLocationClick={handleMarkerClick}
            />
          </section>

        </main>
      </div>
    </div>
  );
}