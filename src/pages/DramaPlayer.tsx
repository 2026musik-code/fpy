import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { fypApi, Episode } from '../services/api';
import { ArrowLeft, Play, ChevronUp, ChevronDown, List, X, Download, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { historyStore } from '../lib/history';
import Hls from 'hls.js';

export function DramaPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const providerParam = searchParams.get('provider');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    
    // Switch provider temporarily or globally if specified
    if (providerParam && fypApi.getProvider() !== providerParam) {
      fypApi.setProvider(providerParam);
    }

    fypApi.getEpisodes(id).then(data => {
      if (!data || data.length === 0) {
        setEpisodes([]);
        setLoading(false);
        return;
      }
      setEpisodes(data.sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0)));
      setLoading(false);
      
      if (data.length > 0) {
        // Find best cover and title
        const dbEntry = data.find(it => it.cover) || data[0];
        historyStore.add({
          id,
          title: dbEntry.title || `Drama ${id}`,
          cover: dbEntry.cover || '',
          provider: providerParam || fypApi.getProvider(),
          episodesCount: data.length
        });
      }
    }).catch(err => {
      console.error(err);
      setEpisodes([]);
      setLoading(false);
    });
  }, [id]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollPositions = Array.from(containerRef.current.children).map(child => {
      const rect = (child as HTMLElement).getBoundingClientRect();
      // Center of screen
      return Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
    });
    const minDiff = Math.min(...scrollPositions);
    const index = scrollPositions.indexOf(minDiff);
    if (index !== -1 && index !== activeIdx) {
      setActiveIdx(index);
    }
  }, [activeIdx]);

  const scrollToIdx = (idx: number) => {
    if (!containerRef.current) return;
    const child = containerRef.current.children[idx] as HTMLElement;
    if (child) {
      child.scrollIntoView({ behavior: 'smooth' });
      setActiveIdx(idx);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-black h-screen w-full items-center justify-center text-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black flex overflow-hidden relative">
      {/* Mobile/Floating header */}
      <div className="absolute top-0 z-50 w-full p-4 flex items-center justify-between pointer-events-none bg-gradient-to-b from-black/80 to-transparent pt-safe">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-black/40 backdrop-blur-md rounded-full pointer-events-auto hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="text-white font-medium text-sm text-shadow-md">
          {episodes[activeIdx]?.title || 'FYPshort'}
        </div>
        <button 
          onClick={() => setShowDrawer(true)} 
          className="p-2 bg-black/40 backdrop-blur-md rounded-full pointer-events-auto hover:bg-white/20 transition-colors flex items-center justify-center"
        >
          <List className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main Scroller */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 h-full w-full overflow-y-auto snap-y snap-mandatory hide-scrollbar relative"
        style={{ scrollBehavior: 'smooth' }}
      >
        {episodes.map((ep, idx) => (
          <VideoItem 
            key={ep.id || idx}
            episode={ep} 
            isActive={idx === activeIdx} 
            isAdjacent={Math.abs(idx - activeIdx) <= 1}
            onEnded={() => {
              if (idx < episodes.length - 1) {
                scrollToIdx(idx + 1);
              }
            }}
          />
        ))}
        {episodes.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-500 gap-4">
            <p>Episode tidak tersedia untuk drama ini di sumber yang dipilih.</p>
            <p className="text-sm">Video dari provider freereels terkadang mengalami error server asal (Upstream error).</p>
            <button 
              onClick={() => navigate('/')} 
              className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
            >
              Cari Drama Lain
            </button>
          </div>
        )}
      </div>

      {/* Scroll controls (Desktop only hint) */}
      <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-4 pointer-events-auto">
        <button 
          onClick={() => scrollToIdx(Math.max(0, activeIdx - 1))}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition disabled:opacity-30"
          disabled={activeIdx === 0}
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button 
          onClick={() => scrollToIdx(Math.min(episodes.length - 1, activeIdx + 1))}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition disabled:opacity-30"
          disabled={activeIdx === episodes.length - 1}
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Drawer Overlay */}
      <div className={cn(
        "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300",
        showDrawer ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )} onClick={() => setShowDrawer(false)} />

      {/* Bottom Drawer for Episodes */}
      <div className={cn(
        "fixed bottom-0 left-0 w-full md:w-[400px] md:left-auto md:right-0 h-[70vh] md:h-screen bg-zinc-950 z-50 rounded-t-3xl md:rounded-t-none md:border-l border-white/10 transition-transform duration-300 flex flex-col",
        showDrawer ? "translate-y-0" : "translate-y-full md:translate-x-full md:translate-y-0"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-lg font-bold">Episodes <span className="text-zinc-500 font-normal">({episodes.length})</span></h3>
          <button onClick={() => setShowDrawer(false)} className="p-2 hover:bg-white/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar grid grid-cols-5 md:grid-cols-4 gap-2 content-start">
          {episodes.map((ep, idx) => (
            <button
              key={ep.id || idx}
              onClick={() => {
                scrollToIdx(idx);
                setShowDrawer(false);
              }}
              className={cn(
                "aspect-square rounded-xl flex items-center justify-center font-semibold text-sm transition-all border",
                activeIdx === idx 
                  ? "bg-rose-500/20 text-rose-500 border-rose-500/50" 
                  : "bg-white/5 text-zinc-400 border-transparent hover:bg-white/10 hover:text-white"
              )}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function VideoItem({ episode, isActive, isAdjacent, onEnded }: { key?: string | number; episode: Episode, isActive: boolean, isAdjacent: boolean, onEnded?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [isBuffering, setIsBuffering] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | undefined>(episode.url);
  const [originalUrl, setOriginalUrl] = useState<string | undefined>();
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [limitData, setLimitData] = useState<any>(null); // For popup data
  const [activeSubId, setActiveSubId] = useState<number>(-1);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const formatTime = (time: number) => {
    if (isNaN(time) || !time) return "00:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  // Initialize streamUrl
  useEffect(() => {
    if (isAdjacent && !streamUrl && !limitData) {
      const fetchUrl = async () => {
        const id = episode.videoFakeId || episode.id || episode.fakeId;
        if (id) {
          const streamData = await fypApi.getStream(id);
          if (streamData && streamData.limitReached) {
             setLimitData(streamData.data);
          } else if (streamData && streamData.url) {
            setStreamUrl(streamData.url);
            setOriginalUrl(streamData.originalUrl);
            setSubtitles(streamData.subtitles || []);
            
            // Set default subtitle
            const subs = streamData.subtitles || [];
            if (subs.length > 0) {
              let idx = subs.findIndex((s: any) => s.label === "Indonesia" || s.lang === "id-ID" || s.label?.toLowerCase() === "indonesian");
              setActiveSubId(idx !== -1 ? idx : 0);
            }
          } else if (typeof streamData === 'string') {
            setStreamUrl(streamData);
          }
        }
      };
      fetchUrl();
    }
  }, [isAdjacent, streamUrl, episode, limitData]);

  const playVideo = useCallback(() => {
    if (isActiveRef.current && videoRef.current && videoRef.current.readyState >= 2) {
      const playPromise = videoRef.current.play();
      playPromiseRef.current = playPromise;
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name !== 'AbortError') {
            console.error('Playback error:', error);
          }
        });
      }
    }
  }, []);

  const pauseVideo = useCallback(() => {
    if (videoRef.current) {
      const pauseIt = () => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      };
      
      if (playPromiseRef.current !== undefined && playPromiseRef.current !== null) {
        playPromiseRef.current.then(pauseIt).catch(pauseIt);
      } else {
        pauseIt();
      }
    }
  }, []);

  // Hls.js initialization
  useEffect(() => {
    if (!isAdjacent || !streamUrl || !videoRef.current) return;

    let hls: Hls | null = null;
    const video = videoRef.current;

    if (streamUrl.includes('.m3u8') || streamUrl.includes('.m3u')) {
      if (Hls.isSupported()) {
        hls = new Hls({
          startPosition: -1,
          maxBufferLength: 30, // reduce buffer size for faster start / less fetching initially
          maxMaxBufferLength: 60,
          lowLatencyMode: true // attempt faster start
        });
        
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('fatal network error encountered, try to recover');
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('fatal media error encountered, try to recover');
                hls?.recoverMediaError();
                break;
              default:
                hls?.destroy();
                break;
            }
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      }
    } else {
      video.src = streamUrl;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [isAdjacent, streamUrl, playVideo]);

  useEffect(() => {
    if (isActive) {
      playVideo();
      setIsPlaying(true);
      setShowControls(true);
      resetTimer(true);
    } else {
      pauseVideo();
      if (videoRef.current) videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setShowControls(false);
      clearTimeout(timerRef.current);
    }
  }, [isActive, playVideo, pauseVideo]);
  
  const handleCanPlay = () => {
    playVideo();
  };

  const resetTimer = (playing: boolean) => {
    clearTimeout(timerRef.current);
    if (playing) {
      timerRef.current = setTimeout(() => setShowControls(false), 3000);
    } else {
      setShowControls(true);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.controls-area')) return;
    
    if (videoRef.current) {
      if (isPlaying) {
        pauseVideo();
        setIsPlaying(false);
        resetTimer(false);
      } else {
        playVideo();
        setIsPlaying(true);
        setShowControls(true);
        resetTimer(true);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setProgress(val);
    }
    resetTimer(isPlaying);
  };

  // Handle text tracks update when activeSubId changes
  useEffect(() => {
    if (videoRef.current && videoRef.current.textTracks) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        // Find if this track corresponds to our subtitle index
        // Browsers might have extra tracks (e.g. from HLS), we map by order or just turn them all off except the selected one
        if (i < subtitles.length) {
          tracks[i].mode = i === activeSubId ? 'showing' : 'hidden';
        } else {
          tracks[i].mode = 'hidden';
        }
      }
    }
  }, [activeSubId, showControls, streamUrl, subtitles.length]);

  return (
    <div className="h-full w-full flex-shrink-0 snap-start snap-always relative bg-black group" onClick={togglePlay}>
      {/* Cover image or placeholder if outside render distance */}
      {!isAdjacent && episode.cover && (
        <img src={episode.cover} className="w-full h-full object-cover opacity-50" alt="" referrerPolicy="no-referrer" />
      )}
      
      {isAdjacent && (
        <video
          ref={videoRef}
          crossOrigin="anonymous"
          poster={episode.cover}
          playsInline
          referrerPolicy="no-referrer"
          onEnded={onEnded}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onCanPlay={handleCanPlay}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onPause={() => setIsBuffering(false)}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isActive ? "opacity-100" : "opacity-0"
          )}
        >
          {subtitles.map((sub, i) => (
             <track 
               key={i} 
               kind="subtitles" 
               src={sub.url} 
               srcLang={sub.lang || "id"} 
               label={sub.label || sub.lang || "Indonesia"} 
               default={i === activeSubId}
             />
          ))}
        </video>
      )}
      
      {/* Play/Pause Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-10">
        {!isPlaying && isActive && streamUrl && !isBuffering && (
          <div className="w-20 h-20 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center animate-pulse">
            <Play className="w-10 h-10 text-white fill-current ml-2" />
          </div>
        )}
        {(!streamUrl || isBuffering) && isActive && (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-500"></div>
        )}
      </div>

      {/* Bottom Info Gradient Area */}
      <div className={cn(
        "absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none transition-opacity duration-300 z-0",
        showControls ? "opacity-100" : "opacity-0"
      )} />

      {/* Thick Controls (Title + Slider) */}
      <div className={cn(
        "absolute left-0 bottom-0 w-full px-4 pb-4 pt-12 md:pb-6 pointer-events-none flex flex-col gap-2 transition-opacity duration-300 z-20 controls-area",
        showControls ? "opacity-100 pointer-events-auto" : "opacity-0"
      )}>
        <div className="flex items-start justify-between w-full">
          <h2 className="text-white font-bold text-lg md:text-xl drop-shadow-lg line-clamp-1 pr-4 text-shadow-md">
            {episode.title || `Episode ${episode.sort || episode.id}`}
          </h2>
          <div className="flex items-center gap-2 relative">
            {subtitles.length > 0 && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSubMenu(!showSubMenu);
                  }}
                  className={cn(
                    "p-2 rounded-full backdrop-blur-md transition z-30 flex-shrink-0 cursor-pointer",
                    showSubMenu ? "bg-rose-500 text-white" : "bg-white/20 hover:bg-white/30 text-white"
                  )}
                  title="Subtitles"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                
                {/* Subtitle Menu */}
                {showSubMenu && (
                  <div 
                    className="absolute bottom-full right-0 mb-3 bg-zinc-900 border border-white/10 rounded-xl p-2 min-w-[150px] max-h-[40vh] overflow-y-auto shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 custom-scrollbar"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 pb-2 pt-1 border-b border-white/5 mb-1">
                      Subtitles
                    </div>
                    <button
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2",
                        activeSubId === -1 ? "bg-rose-500/20 text-rose-500 font-medium" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                      )}
                      onClick={() => {
                        setActiveSubId(-1);
                        setShowSubMenu(false);
                      }}
                    >
                      Mati (Off)
                    </button>
                    {subtitles.map((sub, i) => (
                      <button
                        key={i}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2",
                          activeSubId === i ? "bg-rose-500/20 text-rose-500 font-medium" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                        )}
                        onClick={() => {
                          setActiveSubId(i);
                          setShowSubMenu(false);
                        }}
                      >
                        {sub.label || sub.lang || `Subtitle ${i + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {originalUrl && (
              <a 
                href={originalUrl} 
                target="_blank" 
                rel="noreferrer"
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition z-30 flex-shrink-0"
                title="Download / Open source video"
                onClick={e => e.stopPropagation()}
              >
                <Download className="w-5 h-5 text-white" />
              </a>
            )}
          </div>
        </div>
        
        {/* Progress Bar & Durasi */}
        <div className="w-full flex items-center gap-3 mt-1">
          <span className="text-white/90 text-[10px] sm:text-xs font-medium tabular-nums drop-shadow-md">
            {formatTime(progress)}
          </span>
          <input 
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-white/30 rounded-full appearance-none accent-rose-500 cursor-pointer overflow-hidden"
            style={{
              background: `linear-gradient(to right, #f43f5e ${(duration ? (progress / duration) * 100 : 0)}%, rgba(255, 255, 255, 0.3) ${(duration ? (progress / duration) * 100 : 0)}%)`
            }}
          />
          <span className="text-white/90 text-[10px] sm:text-xs font-medium tabular-nums drop-shadow-md">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Thin Line Progress (when controls hidden) */}
      <div className={cn(
        "absolute bottom-0 left-0 w-full h-[2px] bg-white/20 z-40 transition-opacity duration-300 pointer-events-none",
        showControls ? "opacity-0" : "opacity-100"
      )}>
        <div 
          className="h-full bg-rose-500" 
          style={{ width: duration > 0 ? `${(progress / duration) * 100}%` : '0%' }} 
        />
      </div>

      {/* Limit Popup Overlay */}
      {limitData && isActive && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setLimitData(null)} 
              className="absolute top-3 right-3 text-zinc-400 hover:text-white bg-black/50 p-1.5 rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {limitData.popup?.image && (
              <img src={limitData.popup.image} alt="Banner" className="w-full h-32 object-cover rounded-xl mb-4" />
            )}
            <h3 className="text-xl font-bold mb-2">Limit Tercapai</h3>
            <p className="text-zinc-400 text-sm mb-6">{limitData.popup?.text || 'Batas tontonan gratis telah habis.'}</p>
            <div className="flex flex-col gap-3">
              <a href={`https://wa.me/${limitData.contact?.wa}`} target="_blank" rel="noreferrer" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors w-full text-sm">
                Hubungi WhatsApp
              </a>
              <a href={`https://t.me/${limitData.contact?.telegram}`} target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors w-full text-sm">
                Hubungi Telegram
              </a>
              <a href="/profile" className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-colors w-full text-sm mt-2">
                Lihat Info Upgrade
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
