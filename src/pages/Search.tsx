import { useState, FormEvent } from 'react';
import { fypApi, Drama, PROVIDERS } from '../services/api';
import { Link } from 'react-router-dom';
import { Play, Search as SearchIcon, Compass, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-20 md:pt-28 pb-24 px-4 md:px-12 max-w-7xl mx-auto"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-8 md:mb-12"
      >
        <h1 className="text-3xl md:text-5xl font-black mb-6 flex items-center gap-3 tracking-tight">
          <Compass className="w-8 h-8 md:w-10 md:h-10 text-rose-500" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Explore</span>
        </h1>
        
        <form onSubmit={handleSearch} className="max-w-4xl flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-zinc-500 group-focus-within:text-rose-500 transition-colors" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-orange-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
            <input
              type="text"
              className="relative block w-full pl-12 pr-4 py-4 md:py-5 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500 transition-all shadow-inner text-lg md:text-xl"
              placeholder="Search for drama series..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          <div className="relative w-full sm:w-56 group">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="appearance-none relative block w-full pl-5 pr-10 py-4 md:py-5 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500 transition-all shadow-inner cursor-pointer font-medium"
            >
              {PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <ChevronDown className="h-5 w-5 text-zinc-500 group-focus-within:text-rose-500 transition-colors" />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-8 py-4 md:py-5 bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.6)] disabled:shadow-none active:scale-[0.98] md:text-lg"
          >
            Search
          </button>
        </form>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]"></div>
        </div>
      ) : results.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-6 lg:gap-8"
        >
          {results.map((drama, i) => (
            <motion.div variants={itemVariants} key={`${drama.id || drama.videoFakeId || 'drama'}-${i}`}>
              <Link 
                to={`/play/${drama.id || drama.videoFakeId}?provider=${drama.provider || provider}`}
                className="group relative flex flex-col gap-3 h-full"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.3)]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 transition-opacity group-hover:opacity-80" />
                  <img 
                    src={drama.cover} 
                    alt={drama.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {drama.provider && (
                    <div className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-rose-400 uppercase tracking-widest backdrop-saturate-150 border border-rose-500/30">
                      {PROVIDERS.find(p => p.id === drama.provider)?.name || drama.provider}
                    </div>
                  )}

                  <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-rose-600/90 backdrop-blur text-white rounded-full p-4 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl border border-rose-400/50">
                      <Play className="fill-current w-6 h-6 ml-1" />
                    </div>
                  </div>
                </div>
                <div className="px-1 mt-1">
                  <h3 className="font-semibold text-xs md:text-sm lg:text-base leading-snug line-clamp-2 text-zinc-200 group-hover:text-rose-400 transition-colors duration-300">
                    {drama.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : hasSearched ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-32 text-center text-zinc-500 bg-zinc-900/30 rounded-3xl border border-white/5"
        >
          <SearchIcon className="w-12 h-12 mb-4 mx-auto opacity-20" />
          <p className="text-lg">No results found for "<span className="text-zinc-300">{query}</span>".</p>
          <p className="text-sm mt-2">Try a different keyword or provider.</p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-32 text-center text-zinc-600 flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 shadow-inner">
             <SearchIcon className="w-10 h-10 opacity-30 text-zinc-400" />
          </div>
          <p className="text-lg font-medium text-zinc-500">Discover new dramas</p>
          <p className="text-sm mt-2 max-w-sm">Enter a title, select a provider, and hit Search to explore thousands of series.</p>
        </motion.div>
      )}
    </motion.main>
  );
}
