import { useEffect, useState } from 'react';
import { fypApi, Drama, PROVIDERS } from '../services/api';
import { Link } from 'react-router-dom';
import { Play, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

export function Home() {
  const [trending, setTrending] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProvider, setActiveProvider] = useState(fypApi.getProvider());

  useEffect(() => {
    const fetchRank = async () => {
      setLoading(true);
      try {
        const data = await fypApi.getRank();
        setTrending(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRank();

    const handleProviderChange = () => {
      setActiveProvider(fypApi.getProvider());
      fetchRank();
    };

    window.addEventListener('provider-changed', handleProviderChange);
    return () => window.removeEventListener('provider-changed', handleProviderChange);
  }, [activeProvider]);

  const handleSelectProvider = (id: string) => {
    fypApi.setProvider(id);
  };

  return (
    <main className="pb-24 pt-[52px] md:pt-[60px] min-h-screen max-w-[1400px] mx-auto relative">
      {/* Provider Selector */}
      <section className="sticky top-[52px] md:top-[60px] z-40 bg-zinc-950/95 backdrop-blur-xl px-0 md:px-12 pt-1 pb-1 md:pb-2 border-b border-white/5 md:border-transparent mb-0">
        <div className="flex items-center gap-3 md:gap-4 overflow-x-auto pb-5 snap-x hide-scrollbar px-4 md:px-0 pt-2">
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => handleSelectProvider(p.id)}
              className={cn(
                "flex-shrink-0 flex items-center justify-center p-1 rounded-2xl border-2 transition-all cursor-pointer bg-zinc-900 group relative",
                activeProvider === p.id 
                  ? "border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] bg-zinc-800"
                  : "border-transparent hover:border-zinc-700"
              )}
              title={p.name}
            >
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center p-1">
                <img 
                  src={p.icon || `https://www.google.com/s2/favicons?domain=${p.url}&sz=128`} 
                  alt={p.name} 
                  className="w-7 h-7 md:w-8 md:h-8 object-contain group-hover:scale-110 transition-transform"
                />
              </div>
              <span className={cn(
                "absolute -bottom-5 text-[10px] font-bold whitespace-nowrap transition-all duration-300",
                activeProvider === p.id ? "opacity-100 translate-y-0 text-rose-500" : "opacity-0 -translate-y-1 text-zinc-400 pointer-events-none"
              )}>
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Trending Grid Section */}
      <section className="px-4 md:px-12 pb-6 md:pb-8 pt-0">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {trending.map((drama, i) => (
            <Link 
              key={`${drama.id || drama.videoFakeId || 'drama'}-${i}`}
              to={`/play/${drama.id || drama.videoFakeId}`}
              className="group relative flex flex-col gap-3"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-900 border border-white/5 shadow-lg transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-rose-500/20">
                <img 
                  src={drama.cover} 
                  alt={drama.title}
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-60"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider backdrop-saturate-150">
                  {drama.episodesCount || "Ongoing"} Eps
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-rose-500 text-white rounded-full p-4 transform scale-75 group-hover:scale-100 transition-all shadow-xl">
                    <Play className="fill-current w-6 h-6" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm md:text-base leading-tight line-clamp-2 group-hover:text-rose-400 transition-colors">
                  {drama.title}
                </h3>
              </div>
            </Link>
          ))}
          </div>
        )}
      </section>
    </main>
  );
}
