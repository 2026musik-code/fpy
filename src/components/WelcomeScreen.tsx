import { useState } from 'react';
import { Shield, UserPlus, LogIn, Loader2, PlayCircle, KeyRound, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [mode, setMode] = useState<'select' | 'login'>('select');
  const [inputId, setInputId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/guest', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('userId', data.user.id);
        onComplete();
      } else {
        setError('Gagal membuat ID pengunjung');
      }
    } catch (e) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!inputId.trim()) return setError('ID tidak boleh kosong');
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/user/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inputId.trim() })
      });
      const data = await res.json();
      
      if (data.success && data.user) {
        localStorage.setItem('userId', data.user.id);
        window.dispatchEvent(new Event('user-login'));
        onComplete();
      } else {
        setError(data.error || 'ID tidak ditemukan');
      }
    } catch (e) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-4 overflow-hidden"
    >
      {/* Luxurious Abstract Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-rose-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            className="w-20 h-20 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent rounded-2xl" />
            <PlayCircle className="w-10 h-10 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)] fill-rose-500/20" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-3 tracking-tight"
          >
            VOD Premium
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-zinc-400 text-sm font-medium"
          >
            Satu klik menuju hiburan tanpa batas.
          </motion.p>
        </div>

        <div className="bg-zinc-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-2xl mb-5 text-center font-medium flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {mode === 'select' ? (
                <motion.div 
                  key="select"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <button 
                    onClick={handleGuest}
                    disabled={loading}
                    className="group relative w-full flex items-center justify-between overflow-hidden bg-white hover:bg-zinc-100 text-zinc-950 p-4 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 group-hover:bg-zinc-200 flex items-center justify-center transition-colors">
                        <UserPlus className="w-5 h-5 text-zinc-900" />
                      </div>
                      Mulai Sekarang
                    </div>
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                    ) : (
                      <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
                    )}
                  </button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink-0 mx-4 text-xs font-medium text-zinc-500 uppercase tracking-widest">Atau</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  <button 
                    onClick={() => { setMode('login'); setError(''); }}
                    className="group w-full flex items-center justify-between border border-white/10 hover:border-white/20 bg-zinc-950/30 hover:bg-zinc-800 text-zinc-300 hover:text-white p-4 rounded-2xl font-bold transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
                        <KeyRound className="w-5 h-5 text-rose-500" />
                      </div>
                      Gunakan ID Premium
                    </div>
                    <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all" />
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3 block text-center">
                      Masukkan ID Anda
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-orange-500/20 blur-xl opacity-0 transition-opacity duration-300 focus-within:opacity-100" />
                      <input 
                        type="text"
                        value={inputId}
                        onChange={e => setInputId(e.target.value)}
                        placeholder="Contoh: 1715830023412"
                        className="relative w-full bg-zinc-950/80 border border-white/10 hover:border-white/20 rounded-2xl px-5 py-4 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all font-mono text-center text-lg placeholder:text-zinc-700 shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setMode('select'); setError(''); }}
                      className="flex-[1] bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-transparent rounded-2xl py-4 font-semibold transition-all text-sm"
                    >
                      Kembali
                    </button>
                    <button 
                      onClick={handleLogin}
                      disabled={loading || !inputId.trim()}
                      className="flex-[2] bg-rose-600 hover:bg-rose-500 text-white rounded-2xl py-4 font-bold shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 group"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          < Shield className="w-4 h-4 text-rose-200" />
                          <span>Verifikasi</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-widest">
            Privasi & Keamanan Terenkripsi
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
