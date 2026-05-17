import { useState } from 'react';
import { Shield, UserPlus, LogIn, Loader2 } from 'lucide-react';

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
      // First, get the ID checking via our new login endpoint
      const res = await fetch('/api/user/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inputId.trim() })
      });
      const data = await res.json();
      
      if (data.success && data.user) {
        localStorage.setItem('userId', data.user.id);
        
        // Also fire an event so Profile component can update if needed
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
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-900/20 via-zinc-950 to-zinc-950"></div>
      
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20 shadow-lg shadow-rose-500/10">
            <Shield className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Selamat Datang</h1>
          <p className="text-zinc-400 text-sm">Pilih metode masuk untuk menikmati layanan VOD Premium.</p>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-xl mb-4 text-center font-medium">
              {error}
            </div>
          )}

          {mode === 'select' ? (
            <div className="space-y-4">
              <button 
                onClick={handleGuest}
                disabled={loading}
                className="w-full flex items-center justify-between bg-white text-zinc-900 hover:bg-zinc-100 p-4 rounded-2xl font-bold transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-rose-600" />
                  Masuk sebagai Pengunjung
                </div>
                {loading && <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />}
              </button>

              <button 
                onClick={() => { setMode('login'); setError(''); }}
                className="w-full flex items-center justify-between bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white p-4 rounded-2xl font-bold transition-all border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <LogIn className="w-5 h-5" />
                  Sudah Mendaftar ID
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">Masukkan ID Premium</label>
                <input 
                  type="text"
                  value={inputId}
                  onChange={e => setInputId(e.target.value)}
                  placeholder="Contoh: 1715830023412"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all font-mono text-center text-lg placeholder:text-zinc-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setMode('select'); setError(''); }}
                  className="flex-[1] bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-white/10 rounded-xl py-3 font-semibold transition-all text-sm"
                >
                  Kembali
                </button>
                <button 
                  onClick={handleLogin}
                  disabled={loading || !inputId.trim()}
                  className="flex-[2] bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-3 font-bold shadow-lg shadow-rose-900/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verifikasi ID'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-xs text-zinc-600">
          Dengan masuk, Anda menyetujui syarat & ketentuan layanan kami.
        </div>
      </div>
    </div>
  );
}
