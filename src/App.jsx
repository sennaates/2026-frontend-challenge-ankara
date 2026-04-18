import { useEffect, useState, useMemo, useCallback } from 'react';
import { getSubmissions, FORM_IDS, resolveCoords } from './services/api';
import { ToastProvider, useToast } from './components/ui/Toast';
import MapView       from './components/MapView';
import Timeline      from './components/Timeline';
import Button        from './components/ui/Button';
import SearchInput   from './components/ui/SearchInput';
import StatusBadge   from './components/ui/StatusBadge';
import SkeletonLoader from './components/ui/SkeletonLoader';
import ErrorState    from './components/ui/ErrorState';

// ─── Name normaliser ──────────────────────────────────────────────────────────
const NAME_MAP = {
  'k.': 'KAĞAN', 'k.yılmaz': 'KAĞAN', 'kagan': 'KAĞAN', 'kağan': 'KAĞAN', 'kagan a.': 'KAĞAN', 'kağan a.': 'KAĞAN',
  'asli': 'ASLI', 'aslı': 'ASLI',
  'fatih': 'FATİH',
  'cem': 'CEM',
  'eray': 'ERAY',
  'can': 'CAN',
  'gulsah': 'GÜLŞAH', 'gülşah': 'GÜLŞAH',
  'hami': 'HAMİ'
};

const INVALID_NAMES = [
  'event', 'unknown', 'belirtilmemiş',
  'ankara', 'cermodern', 'atakule', 'hamamonu', 'hamamönü', 'segmenler', 'seğmenler',
  'kızılay', 'kizilay', 'ulus', 'çankaya', 'cankaya'
];

const normalizeName = (name) => {
  if (!name) return null;
  const firstWord = name.toLowerCase().trim().split(' ')[0];
  
  if (INVALID_NAMES.includes(firstWord) || /^\d/.test(firstWord)) return null;
  if (NAME_MAP[firstWord]) return NAME_MAP[firstWord];
  
  return firstWord.toLocaleUpperCase('tr-TR');
};

// ─── Raw → clean submission ───────────────────────────────────────────────────
// Detect raw GPS pair "39.xxx,32.xxx" — not useful as display text
const isCoordString = (s) => /^\d{2}\.\d+,\d{2}\.\d+$/.test((s || '').trim());
// Detect date strings like "18-04-2026 20:22"
const isDateString  = (s) => /^\d{2}-\d{2}-\d{4}/.test((s || '').trim());

const cleanData = (rawSubmissions, type) => {
  if (!rawSubmissions?.length) return [];
  return rawSubmissions.map(sub => {
    const ans = sub.answers;

    // Try multiple answer slots for each field, skip GPS/date-looking values
    const candidatePerson = [ans?.['3']?.answer, ans?.['2']?.answer]
      .find(v => v && !isDateString(v) && !isCoordString(v)) ?? 'Bilinmiyor';

    const candidateLocation = [ans?.['5']?.answer, ans?.['1']?.answer]
      .find(v => v && !isDateString(v) && !isCoordString(v)) ?? 'Belirtilmemiş';

    const candidateContent = [ans?.['7']?.answer, ans?.['6']?.answer, ans?.['4']?.answer, ans?.['2']?.answer]
      .find(v => v && !isCoordString(v) && !isDateString(v)) ?? 'Detay yok';

    const candidateDate = [ans?.['4']?.answer, ans?.['3']?.answer]
      .find(v => v && isDateString(v)) ?? sub.created_at ?? '';

    return {
      id:               sub.id,
      type,
      person:           candidatePerson,
      normalizedPerson: normalizeName(candidatePerson),
      location:         candidateLocation,
      content:          candidateContent,
      date:             candidateDate,
      coords:           resolveCoords(candidateLocation),
    };
  });
};


// ─── Inner app (needs Toast context) ─────────────────────────────────────────
function PodoApp() {
  const { addToast } = useToast();

  const [allClues,         setAllClues]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [searchTerm,       setSearchTerm]       = useState('');
  const [selectedPerson,   setSelectedPerson]   = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let combined = [];
      for (const key of Object.keys(FORM_IDS)) {
        const raw  = await getSubmissions(key);
        combined   = [...combined, ...cleanData(raw, key)];
      }
      combined.sort((a, b) => b.date.localeCompare(a.date));
      setAllClues(combined);
      const geoCount = combined.filter(c => c.coords).length;
      addToast(`${combined.length} kayıt yüklendi • ${geoCount} GPS etiketli`, 'success');
    } catch (err) {
      console.error(err);
      setError('İstihbarat akışı alınamadı. Sunucu bağlantısını kontrol edin.');
      addToast('Bağlantı hatası — veriler yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Suspects list ───────────────────────────────────────────────────────────
  const suspects = useMemo(() => {
    const names = allClues
      .map(c => c.normalizedPerson)
      .filter(n => n && n !== 'PODO'); // Podo analiz edilecek ama listede gizlenecek
    return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'tr'));
  }, [allClues]);

  // ─── Connection Analytics ────────────────────────────────────────────────────
  const getConnectionScore = useCallback((name) => {
    return allClues.filter(c => c.normalizedPerson === name).length;
  }, [allClues]);

  const focusedProfile = useMemo(() => {
    if (!selectedPerson) return null;
    const suspectClues = allClues.filter(c => c.normalizedPerson === selectedPerson);
    const podoClues = allClues.filter(c => c.normalizedPerson === 'PODO');

    // Aliases
    const aliases = [...new Set(suspectClues.map(c => c.person))];

    // Podo Connections
    const suspectLocDates = new Set(suspectClues.map(c => `${c.date}-${c.location}`));
    let sharedSightings = 0;
    for (const pc of podoClues) {
      if (suspectLocDates.has(`${pc.date}-${pc.location}`)) { sharedSightings++; }
    }
    const msgs = suspectClues.filter(c => c.type === 'messages').length;
    const tips = suspectClues.filter(c => c.type === 'anonymoustips').length;
    const score = suspectClues.length;

    return {
      aliases: aliases.length > 0 ? aliases.join(', ') : selectedPerson,
      score,
      suspicionLevel: score >= 5 ? 'Yüksek' : 'Orta',
      connPodo: { shared: sharedSightings, msgs, tips }
    };
  }, [allClues, selectedPerson]);

  // ─── Filtered clues ──────────────────────────────────────────────────────────
  const filteredClues = useMemo(() => allClues.filter(clue => {
    const q = searchTerm.toLowerCase();
    const matchesSearch   = !searchTerm || clue.person.toLowerCase().includes(q) || clue.location.toLowerCase().includes(q);
    const matchesPerson   = !selectedPerson   || clue.normalizedPerson === selectedPerson;
    const matchesLocation = !selectedLocation || clue.location === selectedLocation;
    return matchesSearch && matchesPerson && matchesLocation;
  }), [allClues, searchTerm, selectedPerson, selectedLocation]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleMarkerClick = useCallback((location) => {
    setSelectedLocation(prev => {
      const next = prev === location ? null : location;
      if (next) addToast(`Filtre: ${location}`, 'info', 2000);
      return next;
    });
  }, [addToast]);

  const clearFilters = useCallback(() => {
    setSelectedLocation(null);
    setSelectedPerson(null);
    setSearchTerm('');
    addToast('Tüm filtreler sıfırlandı', 'info', 2000);
  }, [addToast]);

  const geoLocationCount = useMemo(() => {
    const locs = new Set(filteredClues.filter(c => c.coords).map(c => c.location));
    return locs.size;
  }, [filteredClues]);

  const anyFilter = selectedPerson || selectedLocation || searchTerm;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header
        className="shrink-0 w-full px-4 py-3 border-b border-slate-800 bg-slate-950/95 backdrop-blur sticky top-0 z-[2000]"
        role="banner"
      >
        {!selectedPerson ? (
          /* Normal Header */
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl select-none shrink-0" aria-hidden="true">🕵️</span>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-black text-amber-500 tracking-tighter uppercase leading-none truncate">
                  PodoTrace <span className="text-slate-600 font-light">/</span>{' '}
                  <span className="text-slate-400 font-semibold">Ankara</span>
                </h1>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                  <StatusBadge type="live" label="Vaka Durumu: KRİTİK" dot />
                  {selectedLocation && (
                    <span className="text-amber-400 truncate">
                      🗺 <strong>{selectedLocation}</strong>
                    </span>
                  )}
                </p>
              </div>
            </div>
            <span
              className="text-[10px] font-mono text-slate-500 whitespace-nowrap shrink-0"
              aria-live="polite"
              aria-atomic="true"
            >
              {filteredClues.length}&nbsp;/&nbsp;{allClues.length}
            </span>
          </div>
        ) : (
          /* Focus Mode Header */
          <div className="w-full flex justify-between items-start md:items-center gap-4 flex-col md:flex-row">
            <div className="flex items-center gap-3">
              <span className="text-4xl neon-drop" aria-hidden="true">🎯</span>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-tighter uppercase leading-none mb-1">
                  {selectedPerson} <span className="text-slate-500 font-normal text-lg">— {focusedProfile.score} Bulgu</span>
                </h1>
                <div className="flex items-center gap-2 text-[10px] font-mono whitespace-nowrap flex-wrap">
                  <span className={`px-2 py-0.5 rounded ${focusedProfile.suspicionLevel === 'Yüksek' ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-amber-900/50 text-amber-400 border border-amber-800'}`}>
                    Şüphe: {focusedProfile.suspicionLevel}
                  </span>
                  <span className="text-slate-500 border border-slate-800 bg-slate-900 px-2 py-0.5 rounded truncate max-w-[200px] md:max-w-md">
                    Alias: {focusedProfile.aliases}
                  </span>
                </div>
              </div>
            </div>

            {/* Podo Connections Tree */}
            <div className="text-[10px] font-mono bg-slate-900/80 border border-slate-800 rounded p-2 text-slate-400 w-full md:w-auto">
              <div><span className="text-indigo-400">PODO BAĞLANTISI</span></div>
              <div className="flex flex-col ml-1 border-l border-slate-800 pl-2 mt-1 gap-0.5">
                <div>├─ {focusedProfile.connPodo.shared} ortak sighting</div>
                <div>├─ {focusedProfile.connPodo.msgs} mesaj alışverişi</div>
                <div>└─ {focusedProfile.connPodo.tips} anonim ihbar</div>
              </div>
            </div>
          </div>
        )}

        {/* Row 2: search + reset */}
        <div
          role="search"
          aria-label="Kayıt filtreleri"
          className="flex items-center gap-2 mt-2 w-full"
        >
          <SearchInput
            id="global-search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="İsim veya lokasyon ara..."
            aria-label="İsim veya lokasyon ile ara"
            className="flex-1"
          />
          {anyFilter && (
            <Button
              variant="danger"
              aria-label="Tüm filtreleri sıfırla"
              onClick={clearFilters}
            >
              ✕ Sıfırla
            </Button>
          )}
        </div>
      </header>

      {/* ── Suspects strip: mobile/tablet horizontal scroll ─────────────── */}
      <nav
        aria-label="Şüpheli filtreleri"
        className="lg:hidden w-full border-b border-slate-800 bg-slate-950 px-4 py-2"
      >
        <ul className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="list">
          <li className="shrink-0">
            <Button
              variant={!selectedPerson ? 'primary' : 'ghost'}
              aria-label="Tüm şüphelileri göster"
              aria-pressed={!selectedPerson}
              onClick={() => setSelectedPerson(null)}
            >
              Hepsi
            </Button>
          </li>
          {suspects.map(name => {
            const isSelected = selectedPerson === name;
            return (
              <li key={name} className="shrink-0">
                <Button
                  variant={isSelected ? 'primary' : 'ghost'}
                  aria-label={`${name} şüphelisini filtrele`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedPerson(prev => prev === name ? null : name)}
                  className={`flex items-center gap-2 transition-all ${isSelected ? 'ring-2 ring-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] bg-slate-800' : ''}`}
                >
                  {name}
                  <span className="text-[10px] bg-slate-900 px-1.5 rounded-full ring-1 ring-slate-700/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
                    {getConnectionScore(name)}
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Suspects sidebar: desktop only ───────────────────────────── */}
        <aside
          aria-label="Şüpheli listesi"
          className="hidden lg:flex shrink-0 w-44 xl:w-52 flex-col border-r border-slate-800 bg-slate-950 p-3 overflow-y-auto"
        >
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 shrink-0">
            Şüpheli Listesi
          </h2>
          <ul className="flex flex-col gap-1.5" role="list">
            <li>
              <Button
                variant={!selectedPerson ? 'primary' : 'ghost'}
                aria-label="Tüm şüphelileri göster"
                aria-pressed={!selectedPerson}
                onClick={() => setSelectedPerson(null)}
                className="w-full justify-start"
              >
                Hepsi
              </Button>
            </li>
            {suspects.map(name => {
              const isSelected = selectedPerson === name;
              return (
                <li key={name}>
                  <Button
                    variant={isSelected ? 'primary' : 'ghost'}
                    aria-label={`${name} şüphelisini filtrele`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedPerson(prev => prev === name ? null : name)}
                    className={`w-full justify-start flex items-center justify-between transition-all ${isSelected ? 'ring-2 ring-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] bg-slate-800' : ''}`}
                  >
                    <span>{name}</span>
                    <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded-md ring-1 ring-slate-700/50 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)] inline-block"></span>
                      {getConnectionScore(name)}
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── Dual panel: Map + Timeline ──────────────────────────────── */}
        <main
          id="main-content"
          className="flex-1 flex flex-col lg:grid lg:grid-cols-2 min-w-0 overflow-hidden"
        >
          {/* Map panel */}
          <section
            aria-label="İstihbarat haritası"
            className="border-b lg:border-b-0 lg:border-r border-slate-800 p-3 sm:p-4 flex flex-col gap-2"
            style={{ height: 'clamp(320px, 42vh, 520px)' }}
          >
            <div
              className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest shrink-0"
              aria-hidden="true"
            >
              <span>🗺 İstihbarat Haritası — Ankara</span>
              <span>{geoLocationCount} lokasyon</span>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden min-h-0">
              <MapView
                clues={filteredClues}
                selectedLocation={selectedLocation}
                onMarkerClick={handleMarkerClick}
              />
            </div>
          </section>

          {/* Timeline panel */}
          <section
            aria-label="Kronolojik olay akışı"
            className="timeline-scroll flex flex-col gap-3 p-3 sm:p-4 overflow-y-auto flex-1 min-h-0"
          >
            <div
              className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest shrink-0"
              aria-hidden="true"
            >
              <span>⏱ Kronolojik Olay Akışı</span>
              <span aria-live="polite" aria-atomic="true">{filteredClues.length} kayıt</span>
            </div>

            {loading ? (
              <SkeletonLoader count={6} />
            ) : error ? (
              <ErrorState
                title="Bağlantı Hatası"
                description={error}
                onRetry={fetchData}
              />
            ) : (
              <Timeline
                clues={filteredClues}
                selectedLocation={selectedLocation}
                onLocationClick={handleMarkerClick}
                onClearFilter={() => setSelectedLocation(null)}
              />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

// ─── Root: wrap with ToastProvider ───────────────────────────────────────────
export default function App() {
  return (
    <ToastProvider>
      <PodoApp />
    </ToastProvider>
  );
}