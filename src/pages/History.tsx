import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Play, Trash2 } from 'lucide-react';
import { historyStore, HistoryItem } from '../lib/history';
import { fypApi } from '../services/api';

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

  return (
    <main className="min-h-screen pt-4 md:pt-24 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight flex items-center gap-4">
          <Clock className="w-8 h-8 text-rose-500" />
          History
        </h1>
        
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 text-zinc-400 hover:text-rose-500 transition-colors bg-zinc-900 px-4 py-2 rounded-xl"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Clear</span>
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {history.map((drama, i) => (
            <Link 
              key={`${drama.id}_${i}`}
              to={`/play/${drama.id}?provider=${drama.provider || fypApi.getProvider()}`}
              className="group relative flex flex-col gap-3"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-900 border border-white/5 transition-transform duration-300 group-hover:-translate-y-1">
                {drama.cover ? (
                  <img 
                    src={drama.cover} 
                    alt={drama.title} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex justify-center items-center font-bold text-4xl text-zinc-800">
                    {drama.title?.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-rose-500/90 text-white flex items-center justify-center backdrop-blur-sm shadow-lg shadow-rose-500/30 scale-90 group-hover:scale-100 transition-all duration-300">
                    <Play className="w-5 h-5 ml-1 fill-current" />
                  </div>
                </div>
                
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-medium text-zinc-300 border border-white/10 uppercase tracking-wider">
                  {drama.provider || 'FYP'}
                </div>
                
                {drama.episodesCount && (
                  <div className="absolute bottom-2 left-2 bg-rose-600 px-2 py-1 rounded-md text-[10px] font-bold text-white shadow-md">
                    EP {drama.episodesCount}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm md:text-base leading-tight group-hover:text-rose-400 transition-colors line-clamp-2">
                  {drama.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  {new Date(drama.lastWatchedAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-zinc-600 flex flex-col items-center">
          <Clock className="w-16 h-16 mb-4 opacity-50" />
          <p>You haven't watched any dramas yet.</p>
          <Link to="/search" className="mt-6 text-rose-500 hover:text-rose-400 font-medium">
            Explore Dramas
          </Link>
        </div>
      )}
    </main>
  );
}
