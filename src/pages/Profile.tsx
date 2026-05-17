import { UserCircle, Settings, LogOut, Shield, Zap, MessageCircle, Send, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';

interface ProfileData {
  user: {
    id: string;
    name: string;
    type: string;
    limit: number;
    ip: string;
    userAgent: string;
  };
  contacts: {
    wa: string;
    telegram: string;
  };
  upgrade: {
    description: string;
    price: string;
    limit: string;
  };
}

export function Profile() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentSuccess = searchParams.get('payment') === 'success';
  const [showPopup, setShowPopup] = useState(paymentSuccess);
  
  useEffect(() => {
    let pollingInterval: any;
    
    const fetchData = async () => {
      const userId = localStorage.getItem('userId') || '';
      try {
        const res = await fetch('/api/profile/data', {
          headers: { 'x-user-id': userId }
        });
        const json = await res.json();
        setData(json);
        
        // Polling if VIP
        if (paymentSuccess && json.user?.type !== 'VIP') {
           // not VIP yet, poll again
        } else if (paymentSuccess && json.user?.type === 'VIP') {
           // Success! Stop polling and ensure popup is shown
           setShowPopup(true);
           if (pollingInterval) clearInterval(pollingInterval);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchData();
    window.addEventListener('user-login', fetchData);
    
    if (paymentSuccess) {
       pollingInterval = setInterval(fetchData, 3000);
    }
    
    return () => {
      window.removeEventListener('user-login', fetchData);
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [paymentSuccess]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const userId = localStorage.getItem('userId') || '';
      const res = await fetch('/api/user/checkout', { 
        method: 'POST',
        headers: { 'x-user-id': userId }
      });
      const json = await res.json();
      if (json.success && json.payment_url) {
        window.location.href = json.payment_url;
      } else {
        alert(json.error || 'Gagal memulai proses pembayaran');
      }
    } catch (e) {
      alert('Terjadi kesalahan, silakan coba lagi');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!data) return <div className="text-center pt-32 text-zinc-500 flex flex-col items-center gap-4">
    <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
    Memuat Profil...
  </div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.main 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="min-h-screen pt-20 md:pt-28 pb-24 px-4 max-w-xl mx-auto flex flex-col gap-6"
    >
      
      {showPopup && data.user?.type === 'VIP' && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-zinc-900 border border-rose-500/30 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/40 border-[6px] border-zinc-900">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <div className="mt-10 text-center mb-6">
              <h2 className="text-2xl font-black text-rose-400 mb-1">Pembayaran Berhasil!</h2>
              <p className="text-sm text-zinc-400">Akun Anda telah diupgrade ke VIP.</p>
            </div>
            
            <div className="bg-black/50 border border-white/5 rounded-2xl p-4 space-y-3 mb-6">
              <DetailRow label="ID Pengguna" value={data.user.id} highlight />
              <DetailRow label="Status" value="Aktif (VIP)" />
              <DetailRow label="Limit Views" value="Unlimited" highlight />
              <DetailRow label="Harga" value={data.upgrade?.price || 'Lunas'} />
              <DetailRow label="Tipe Akun" value={data.user.type} />
            </div>

            <div className="text-center mb-6 flex flex-col items-center gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(data.user.id);
                  alert('ID dicopy ke clipboard!');
                }}
                className="flex items-center gap-2 text-xs font-semibold text-rose-400 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
              >
                <Copy className="w-4 h-4" /> Simpan ID Anda
              </button>
            </div>
            
            <button
               onClick={() => {
                 setShowPopup(false);
                 setSearchParams({});
                 // Force login/reload
                 localStorage.removeItem('userId');
                 window.location.href = '/';
               }}
               className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-rose-500/25"
            >
               Login Ulang
            </button>
          </div>
        </div>
      )}

      {/* Header Logo & Basic Info */}
      <motion.div variants={itemVariants} className="flex flex-col items-center mt-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 p-1 mb-4 shadow-xl">
          <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center">
            <UserCircle className="w-16 h-16 text-rose-500" />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight">{data.user?.name || "Guest"}</h2>
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold mt-2 shadow-sm ${data.user?.type === 'VIP' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-zinc-800 text-zinc-400 border border-white/5'}`}>
          {data.user?.type || "Free"} ACCOUNT
        </span>
      </motion.div>

      {/* Account Details Box */}
      <motion.div variants={itemVariants} className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
          <Settings className="w-5 h-5 text-rose-500" /> Profil Detail
        </h3>
        
        <div className="space-y-4">
          <DetailRow label="ID Pengguna" value={data.user?.id || '-'} highlight />
          <DetailRow label="Nama" value={data.user?.name || '-'} />
          <DetailRow label="Jenis User" value={data.user?.type || '-'} />
          <DetailRow label="Limit" value={`${data.user?.limit || 0} Views`} highlight />
          <DetailRow label="IP" value={data.user?.ip || '-'} />
          <div className="pt-3 border-t border-white/5">
             <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 font-semibold">User-Agent</div>
             <div className="text-xs text-zinc-400 font-mono break-all bg-zinc-950 p-4 rounded-xl border border-zinc-800 leading-relaxed shadow-inner">
               {data.user?.userAgent || '-'}
             </div>
          </div>
        </div>
      </motion.div>

      {/* Upgrade Banner */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-rose-950 to-orange-950 border border-rose-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
           <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mb-5 shadow-inner">
             <Zap className="w-7 h-7" />
           </div>
           <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 mb-2 uppercase tracking-tight">Upgrade VIP</h3>
           <p className="text-sm text-rose-200/80 mb-6 max-w-sm leading-relaxed">
             {data.upgrade?.description || 'Upgrade akun Anda untuk menikmati akses tanpa batas ke semua tayangan premium kami.'}
           </p>
           
           <div className="w-full bg-black/40 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 mb-4 shadow-inner border border-white/10">
              <div className="text-center md:text-left flex-1">
                <div className="text-[10px] text-rose-300/70 font-bold tracking-widest uppercase mb-1">Harga</div>
                <div className="text-xl font-black text-white">{data.upgrade?.price || 'Rp 50.000'}</div>
              </div>
              <div className="w-px h-10 bg-white/10 hidden md:block"></div>
              <div className="w-full h-px bg-white/10 block md:hidden"></div>
              <div className="text-center md:text-right flex-1">
                <div className="text-[10px] text-rose-300/70 font-bold tracking-widest uppercase mb-1">Limit</div>
                <div className="text-xl font-black text-rose-400">{data.upgrade?.limit || 'Unlimited'}</div>
              </div>
           </div>
           
           <button 
             onClick={handleCheckout}
             disabled={checkoutLoading || data.user?.type === 'VIP'}
             className="w-full mt-2 flex items-center justify-center gap-2 bg-white text-rose-600 hover:bg-zinc-200 font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] disabled:shadow-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] text-lg"
           >
             {checkoutLoading ? (
               <Loader2 className="w-6 h-6 animate-spin" />
             ) : data.user?.type === 'VIP' ? (
               'Anda telah menjadi VIP'
             ) : (
               'Bayar Sekarang'
             )}
           </button>
        </div>
      </motion.div>

      {/* Contact Support */}
      <motion.div variants={itemVariants} className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-xl">
        <div className="text-center mb-5">
          <h3 className="font-bold text-lg mb-1">Hubungi Admin</h3>
          <p className="text-xs text-zinc-500">Upgrade akun atau sampaikan kendala.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <a href={`https://wa.me/${data.contacts?.wa}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-2xl py-5 transition-all hover:-translate-y-1">
            <MessageCircle className="w-7 h-7" />
            <span className="text-xs font-bold uppercase tracking-wider">WhatsApp</span>
          </a>
          <a href={`https://t.me/${data.contacts?.telegram}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-2xl py-5 transition-all hover:-translate-y-1">
            <Send className="w-7 h-7" />
            <span className="text-xs font-bold uppercase tracking-wider">Telegram</span>
          </a>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-center mt-2">
        <button 
          onClick={() => {
            localStorage.removeItem('userId');
            window.location.href = '/';
          }}
          className="flex items-center gap-2 py-3 px-6 rounded-2xl text-xs font-bold tracking-wider uppercase text-zinc-500 hover:text-white hover:bg-rose-600 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </motion.div>

    </motion.main>
  );
}

function DetailRow({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-zinc-400 font-medium">{label}</span>
      <span className={`text-sm font-semibold text-right max-w-[200px] truncate ${highlight ? 'text-rose-400' : 'text-zinc-100'}`}>
        {value}
      </span>
    </div>
  );
}
