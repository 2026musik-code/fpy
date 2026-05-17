import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Play, Trash2 } from 'lucide-react';
import { historyStore, HistoryItem } from '../lib/history';
import { fypApi } from '../services/api';
import { motion } from 'motion/react';

export function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(historyStore.get());
  }, []);

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your history?')) {
      historyStore.clear();
      setHistory([]);
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
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
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
        className="flex items-center justify-between mb-8 md:mb-12 bg-zinc-900/50 p-6 rounded-3xl border border-white/5 shadow-inner"
      >
        <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
          <Clock className="w-8 h-8 md:w-10 md:h-10 text-rose-500" />
          History
        </h1>
        
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all bg-zinc-950 px-5 py-3 rounded-2xl border border-zinc-800 hover:border-red-500/50 hover:bg-red-500/10 group shadow-md"
          >
            <Trash2 className="w-4 h-4 group-hover:text-red-500 transition-colors" />
            <span className="text-sm font-bold tracking-wide uppercase">Clear</span>
          </button>
        )}
      </motion.div>

      {history.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-6 lg:gap-8"
        >
          {history.map((drama, i) => (
            <motion.div variants={itemVariants} key={`${drama.id}_${i}`}>
              <Link 
                to={`/play/${drama.id}?provider=${drama.provider || fypApi.getProvider()}`}
                className="group relative flex flex-col gap-3 h-full"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.3)]">
                  {drama.cover ? (
                    <img 
                      src={drama.cover} 
                      alt={drama.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex justify-center items-center font-black text-6xl text-zinc-800 tracking-tighter">
                      {drama.title?.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center backdrop-blur-md shadow-2xl border border-rose-400/50 scale-75 group-hover:scale-100 transition-all duration-300">
                      <Play className="w-6 h-6 ml-1 fill-current" />
                    </div>
                  </div>
                  
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-rose-400 border border-rose-500/30 uppercase tracking-widest">
                    {drama.provider || 'FYP'}
                  </div>
                  
                  {drama.episodesCount && (
                    <div className="absolute bottom-3 left-3 bg-zinc-900/80 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-md border border-white/10 uppercase">
                      EP {drama.episodesCount}
                    </div>
                  )}
                </div>
                <div className="px-1 mt-1">
                  <h3 className="font-semibold text-xs md:text-sm lg:text-base leading-snug group-hover:text-rose-400 transition-colors duration-300 line-clamp-2 text-zinc-200">
                    {drama.title}
                  </h3>
                  <p className="text-[10px] md:text-[11px] font-medium text-zinc-500 mt-1 uppercase tracking-widest">
                    {new Date(drama.lastWatchedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="py-32 text-center flex flex-col items-center bg-zinc-900/30 rounded-3xl border border-white/5"
        >
          <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 shadow-inner">
             <Clock className="w-10 h-10 opacity-30 text-zinc-400" />
          </div>
          <p className="text-xl font-medium text-zinc-300 tracking-tight">Vault is Empty</p>
          <p className="text-zinc-500 mt-2 text-sm">You haven't watched any dramas yet.</p>
          <Link to="/search" className="mt-8 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-rose-500/25">
            Discover Series
          </Link>
        </motion.div>
      )}
    </motion.main>
  );
}
