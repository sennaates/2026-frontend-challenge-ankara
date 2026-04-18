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
import AppLogo       from './assets/logo.png';

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

// ─── Title case converter for display ────────────────────────────────────────
const toTitleCase = (name) => {
  if (!name) return '';
  const titleCaseMap = {
    'KAĞAN': 'Kağan',
    'ASLI': 'Aslı',
    'FATİH': 'Fatih',
    'CEM': 'Cem',
    'ERAY': 'Eray',
    'CAN': 'Can',
    'GÜLŞAH': 'Gülşah',
    'HAMİ': 'Hami'
  };
  return titleCaseMap[name] || name;
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

  // ─── Top 3 suspects by score ─────────────────────────────────────────────────
  const top3Suspects = useMemo(() => {
    const scores = suspects.map(name => ({
      name,
      score: getConnectionScore(name)
    }));
    return scores.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [suspects, getConnectionScore]);

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
    <div className="w-full h-screen bg-page text-primary font-sans flex flex-col overflow-hidden">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header
        className="shrink-0 w-full px-4 py-3 border-b border-border bg-page/95 backdrop-blur sticky top-0 z-[2000]"
        role="banner"
        style={{ minHeight: '88px' }}
      >
        {!selectedPerson ? (
          /* Normal Header */
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={AppLogo} alt="PodoTrace Logo" className="h-16 w-auto object-contain select-none shrink-0" style={{ mixBlendMode: 'multiply', filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))' }} />
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-black text-brand tracking-tighter uppercase leading-none truncate">
                  PodoTrace <span className="text-secondary font-light">/</span>{' '}
                  <span className="text-secondary font-semibold">Ankara</span>
                </h1>
                <p className="text-[10px] font-mono text-secondary mt-0.5 flex items-center gap-2 flex-wrap">
                  <StatusBadge type="live" label="Vaka Durumu: KRİTİK" dot />
                  {selectedLocation && (
                    <span className="text-brand truncate">
                      🗺 <strong>{selectedLocation}</strong>
                    </span>
                  )}
                </p>
              </div>
            </div>
            <span
              className="text-[10px] font-mono text-secondary whitespace-nowrap shrink-0"
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
              <img src={AppLogo} alt="Focus Logo" className="h-20 w-auto object-contain shrink-0 neon-pulse" style={{ mixBlendMode: 'multiply', filter: 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))' }} />
              <div>
                <h1 className="text-xl md:text-2xl font-black text-primary tracking-tighter uppercase leading-none mb-1">
                  {selectedPerson} <span className="text-secondary font-normal text-lg">— {focusedProfile.score} Bulgu</span>
                </h1>
                <div className="flex items-center gap-2 text-[10px] font-mono whitespace-nowrap flex-wrap">
                  <span className={`px-2 py-0.5 rounded ${focusedProfile.suspicionLevel === 'Yüksek' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-orange-100 text-brand border border-orange-200'}`}>
                    Şüphe: {focusedProfile.suspicionLevel}
                  </span>
                  <span className="text-secondary border border-border bg-card px-2 py-0.5 rounded truncate max-w-[200px] md:max-w-md">
                    Alias: {focusedProfile.aliases}
                  </span>
                </div>
              </div>
            </div>

            {/* Podo Connections Tree */}
            <div className="text-[10px] font-mono bg-card border border-border rounded p-2 text-secondary w-full md:w-auto shadow-sm">
              <div><span className="text-primary font-bold">PODO BAĞLANTISI</span></div>
              <div className="flex flex-col ml-1 border-l border-border pl-2 mt-1 gap-0.5">
                <div>├─ {focusedProfile.connPodo.shared} ortak sighting</div>
                <div>├─ {focusedProfile.connPodo.msgs} mesaj alışverişi</div>
                <div>└─ {focusedProfile.connPodo.tips} anonim ihbar</div>
              </div>
            </div>
          </div>
        )}

      </header>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Suspects sidebar: desktop only ───────────────────────────── */}
        <aside
          aria-label="Şüpheli listesi"
          className="hidden lg:flex w-64 border-r border-border bg-sidebar flex-col"
          style={{ height: 'calc(100vh - 88px)' }}
        >
          <div className="p-3 border-b border-border shrink-0">
            <h2 className="text-xs font-black text-secondary tracking-widest uppercase">Şüpheli Listesi</h2>
          </div>
          <ul className="flex-1 flex flex-col p-2 gap-1.5 overflow-y-auto" role="list">
            <li className="flex-1 min-h-0">
              <Button
                variant={!selectedPerson ? 'primary' : 'ghost'}
                aria-label="Tüm şüphelileri göster"
                aria-pressed={!selectedPerson}
                onClick={() => setSelectedPerson(null)}
                className="w-full h-full flex flex-col items-center justify-center gap-1.5"
              >
                <span className="text-sm font-bold">Hepsi</span>
                <span className="text-[10px] bg-page px-1.5 py-0.5 rounded-md ring-1 ring-border flex items-center gap-1 font-mono text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_5px_rgba(255,97,0,0.5)] inline-block"></span>
                  {allClues.filter(c => c.normalizedPerson).length}
                </span>
              </Button>
            </li>
            {suspects.map(name => {
              const isSelected = selectedPerson === name;
              return (
                <li key={name} className="flex-1 min-h-0">
                  <Button
                    variant={isSelected ? 'primary' : 'ghost'}
                    aria-label={`${name} şüphelisini filtrele`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedPerson(prev => prev === name ? null : name)}
                    className={`w-full h-full flex flex-col items-center justify-center gap-1.5 transition-all ${isSelected ? 'ring-2 ring-brand bg-card shadow-sm' : ''}`}
                  >
                    <span className="text-sm font-bold">{toTitleCase(name)}</span>
                    <span className="text-[10px] bg-page px-1.5 py-0.5 rounded-md ring-1 ring-border flex items-center gap-1 font-mono text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_5px_rgba(255,97,0,0.5)] inline-block"></span>
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
          {/* Map panel with Top 3 */}
          <section
            aria-label="İstihbarat haritası"
            className="border-b lg:border-b-0 lg:border-r border-border flex flex-col bg-page"
            style={{ height: 'calc(100vh - 88px)' }}
          >
            <div
              className="flex items-center justify-between text-[10px] font-mono text-secondary uppercase tracking-widest shrink-0 px-3 pt-3"
              aria-hidden="true"
            >
              <span>🗺 İstihbarat Haritası — Ankara</span>
              <span>{geoLocationCount} lokasyon</span>
            </div>
            <div className="relative flex-1 mx-3 mt-2 rounded-xl overflow-hidden">
              <MapView
                clues={filteredClues}
                selectedLocation={selectedLocation}
                onMarkerClick={handleMarkerClick}
              />
            </div>

            {/* Top 3 Suspects Panel */}
            <div className="shrink-0 flex flex-col gap-1.5 px-3 pb-3 pt-2">
              <h3 className="text-[11px] font-black text-secondary uppercase tracking-widest">
                En Şüpheli 3 Kişi
              </h3>
              <div className="flex gap-2">
                {top3Suspects.map((suspect, idx) => {
                  const maxScore = Math.max(...top3Suspects.map(s => s.score), 10);
                  const percentage = (suspect.score / maxScore) * 100;
                  let badgeColor = '#44BB44';
                  if (suspect.score >= 6) badgeColor = '#FF4444';
                  else if (suspect.score >= 3) badgeColor = '#FFB347';

                  return (
                    <div
                      key={suspect.name}
                      className="flex-1 bg-[#1e1e3a] rounded-lg p-2.5 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-white/40">
                          {idx + 1}
                        </span>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: badgeColor, color: '#fff' }}
                        >
                          {suspect.score}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white">
                        {toTitleCase(suspect.name)}
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: badgeColor
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Timeline panel */}
          <section
            aria-label="Kronolojik olay akışı"
            className="flex flex-col gap-2 p-3 bg-page overflow-hidden"
            style={{ height: 'calc(100vh - 88px)' }}
          >
            <div
              className="flex items-center justify-between text-[10px] font-mono text-secondary uppercase tracking-widest shrink-0"
              aria-hidden="true"
            >
              <span>⏱ Kronolojik Olay Akışı</span>
              <span aria-live="polite" aria-atomic="true">{filteredClues.length} kayıt</span>
            </div>

            {/* Search bar */}
            <div
              role="search"
              aria-label="Kayıt filtreleri"
              className="flex items-center gap-2 shrink-0"
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

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto min-h-0">
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
            </div>
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