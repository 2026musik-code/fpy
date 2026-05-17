import { useEffect, useState } from 'react';
import { fypApi, Drama, PROVIDERS } from '../services/api';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

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
      exit={{ opacity: 0 }}
      className="pb-24 pt-[56px] md:pt-[64px] min-h-screen max-w-[1400px] mx-auto relative"
    >
      {/* Provider Selector */}
      <section className="sticky top-[56px] md:top-[64px] z-40 bg-zinc-950/95 backdrop-blur-xl px-0 md:px-12 pt-0 pb-1 md:pb-2 border-b border-white/5 md:border-transparent mb-0">
        <motion.div 
          className="flex items-center gap-3 md:gap-4 overflow-x-auto pb-5 pt-1 snap-x hide-scrollbar px-4 md:px-0"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } }
          }}
        >
          {PROVIDERS.map(p => (
            <motion.button
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                show: { opacity: 1, scale: 1 }
              }}
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
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Trending Grid Section */}
      <section className="px-4 md:px-12 pb-6 md:pb-8 pt-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-6 lg:gap-8"
          >
            {trending.map((drama, i) => (
            <motion.div variants={itemVariants} key={`${drama.id || drama.videoFakeId || 'drama'}-${i}`}>
              <Link 
                to={`/play/${drama.id || drama.videoFakeId}`}
                className="group relative flex flex-col gap-3 h-full"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.3)]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 transition-opacity group-hover:opacity-80" />
                  <img 
                    src={drama.cover} 
                    alt={drama.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="absolute top-3 left-3 z-20 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-widest backdrop-saturate-150 border border-white/10">
                    {drama.episodesCount || "Ongoing"} Eps
                  </div>

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
        )}
      </section>
    </motion.main>
  );
}
