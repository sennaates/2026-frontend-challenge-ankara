import { useEffect, useState, useMemo } from 'react';
import { getSubmissions, FORM_IDS } from './services/api';

function App() {
  const [allClues, setAllClues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);

  // İsim Normalizasyonu (Kağan, Kagan, Kağan A. eşleşsin diye)
  const normalizeName = (name) => {
    if (!name) return "";
    return name.toLowerCase()
      .trim()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .split(' ')[0]; // Sadece ilk ismi al (Kağan A. -> kagan)
  };

  const cleanData = (rawSubmissions, type) => {
    if (!rawSubmissions) return [];
    return rawSubmissions.map(sub => {
      const ans = sub.answers;
      const person = ans?.['3']?.answer || ans?.['2']?.answer || "Unknown";
      return {
        id: sub.id,
        type: type,
        person: person,
        normalizedPerson: normalizeName(person),
        location: ans?.['5']?.answer || ans?.['1']?.answer || "Belirtilmemiş",
        content: ans?.['7']?.answer || ans?.['4']?.answer || ans?.['2']?.answer || "Detay yok",
        date: ans?.['4']?.answer || sub.created_at,
      };
    });
  };

  useEffect(() => {
    const fetchEverything = async () => {
      setLoading(true);
      try {
        let combinedData = [];
        for (const key of Object.keys(FORM_IDS)) {
          const raw = await getSubmissions(key);
          combinedData = [...combinedData, ...cleanData(raw, key)];
        }
        // Kronolojik sıralama (Zaman Çizelgesi Mantığı)
        combinedData.sort((a, b) => b.date.localeCompare(a.date));
        setAllClues(combinedData);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchEverything();
  }, []);

  // Filtreleme Mantığı
  const filteredClues = useMemo(() => {
    return allClues.filter(clue => {
      const matchesSearch = clue.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clue.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPerson = selectedPerson ? clue.normalizedPerson === selectedPerson : true;
      return matchesSearch && matchesPerson;
    });
  }, [allClues, searchTerm, selectedPerson]);

  // Benzersiz Şüpheliler Listesi (Record Linking için)
  const suspects = useMemo(() => {
    const names = allClues.map(c => c.normalizedPerson).filter(n => n && n !== 'podo' && n !== 'unknown');
    return [...new Set(names)];
  }, [allClues]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-amber-500 font-mono animate-pulse">🕵️ İstihbarat Bağlantıları Kuruluyor...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-amber-500 tracking-tighter uppercase">PodoTrace / Ankara</h1>
          <p className="text-slate-500 font-mono text-xs">Vaka Durumu: <span className="text-red-500 animate-pulse">Kritik</span></p>
        </div>
        <input
          type="text"
          placeholder="İsim veya lokasyon ara..."
          className="bg-slate-900 border border-slate-700 rounded-full px-6 py-2 text-sm focus:outline-none focus:border-amber-500 w-full md:w-64"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Şüpheliler Paneli */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Şüpheli Listesi</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedPerson(null)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${!selectedPerson ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}
              >HEPSİ</button>
              {suspects.map(name => (
                <button
                  key={name}
                  onClick={() => setSelectedPerson(name)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition ${selectedPerson === name ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Zaman Çizelgesi */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono uppercase tracking-widest">
            <span>Kronolojik Olay Akışı</span>
            <span>{filteredClues.length} Kayıt Listeleniyor</span>
          </div>

          {filteredClues.map((clue, idx) => (
            <div key={idx} className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-800">
              <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${clue.type === 'sightings' ? 'bg-red-500/10 text-red-500' :
                      clue.type === 'messages' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-700 text-slate-300'
                    }`}>
                    {clue.type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{clue.date}</span>
                </div>
                <h3 className="text-slate-100 font-bold mb-1">{clue.location}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-3">"{clue.content}"</p>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-slate-800 text-amber-500 px-2 py-1 rounded-md font-bold">KİŞİ: {clue.person}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;