import { useState, FormEvent } from 'react';
import { fypApi, Drama, PROVIDERS } from '../services/api';
import { Link } from 'react-router-dom';
import { Play, Search as SearchIcon, Compass, ChevronDown } from 'lucide-react';

export function Search() {
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState(fypApi.getProvider() || PROVIDERS[0].id);
  const [results, setResults] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    if (!query.trim()) {
      return;
    }
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const data = await fypApi.search(query.trim(), provider);
      setResults(data);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-4 md:pt-24 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3">
          <Compass className="w-8 h-8 text-rose-500" />
          Explore & Search
        </h1>
        
        <form onSubmit={handleSearch} className="max-w-3xl flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all shadow-inner"
              placeholder="Search for drama series..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          <div className="relative w-full sm:w-48">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="appearance-none block w-full pl-4 pr-10 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all shadow-inner cursor-pointer"
            >
              {PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <ChevronDown className="h-5 w-5 text-zinc-400" />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-8 py-4 bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-medium rounded-2xl transition-all shadow-lg shadow-rose-900/20 active:scale-[0.98]"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {results.map((drama, i) => (
            <Link 
              key={`${drama.id || drama.videoFakeId || 'drama'}-${i}`}
              to={`/play/${drama.id || drama.videoFakeId}?provider=${drama.provider || provider}`}
              className="group relative flex flex-col gap-3"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-900 border border-white/5 transition-transform duration-300 group-hover:-translate-y-1">
                <img 
                  src={drama.cover} 
                  alt={drama.title}
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-60"
                  loading="lazy"
                />
                
                {drama.provider && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-rose-500 uppercase tracking-wider backdrop-saturate-150 border border-rose-500/30">
                    {PROVIDERS.find(p => p.id === drama.provider)?.name || drama.provider}
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-rose-500 text-white rounded-full p-4 shadow-xl">
                    <Play className="fill-current w-5 h-5" />
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 md:text-base group-hover:text-rose-400">
                {drama.title}
              </h3>
            </Link>
          ))}
        </div>
      ) : hasSearched ? (
        <div className="py-20 text-center text-zinc-500">
          <p>No results found for "{query}". Try a different keyword or provider.</p>
        </div>
      ) : (
        <div className="py-20 text-center text-zinc-600 flex flex-col items-center">
          <SearchIcon className="w-12 h-12 mb-4 opacity-20" />
          <p>Enter a title, select a provider, and click Search to discover new dramas.</p>
        </div>
      )}
    </main>
  );
}
