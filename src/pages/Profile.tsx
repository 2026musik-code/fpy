import { UserCircle, Settings, LogOut, Shield, Zap, MessageCircle, Send } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProfileData {
  user: {
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

  useEffect(() => {
    fetch('/api/profile/data')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div className="text-center pt-32 text-zinc-500 flex flex-col items-center gap-4">
    <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
    Memuat Profil...
  </div>;

  return (
    <main className="min-h-screen pt-20 md:pt-28 pb-24 px-4 max-w-xl mx-auto flex flex-col gap-6">
      
      {/* Header Logo & Basic Info */}
      <div className="flex flex-col items-center mt-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 p-1 mb-4 shadow-xl">
          <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center">
            <UserCircle className="w-16 h-16 text-rose-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">{data.user?.name || "Guest"}</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-bold mt-2 ${data.user?.type === 'VIP' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
          {data.user?.type || "Free"} ACCOUNT
        </span>
      </div>

      {/* Account Details Box */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-rose-500" /> Profil Detail
        </h3>
        
        <div className="space-y-4">
          <DetailRow label="Nama" value={data.user?.name || '-'} />
          <DetailRow label="Jenis User" value={data.user?.type || '-'} />
          <DetailRow label="Limit" value={`${data.user?.limit || 0} Views`} highlight />
          <DetailRow label="IP" value={data.user?.ip || '-'} />
          <div className="pt-2 border-t border-white/5">
             <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-semibold">User-Agent</div>
             <div className="text-xs text-zinc-300 font-mono break-all bg-zinc-950 p-3 rounded-xl border border-zinc-900 leading-relaxed shadow-inner">
               {data.user?.userAgent || '-'}
             </div>
          </div>
        </div>
      </div>

      {/* Upgrade Banner */}
      <div className="bg-gradient-to-br from-rose-950 to-orange-950 border border-rose-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
           <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
             <Zap className="w-6 h-6" />
           </div>
           <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">Upgrade VIP</h3>
           <p className="text-sm text-rose-200/80 mb-6 max-w-sm">
             {data.upgrade?.description || 'Upgrade akun Anda untuk menikmati akses tanpa batas ke semua tayangan premium kami.'}
           </p>
           
           <div className="w-full bg-black/40 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-2 shadow-inner border border-white/5">
              <div className="text-center md:text-left flex-1">
                <div className="text-[10px] text-rose-300/70 font-semibold tracking-wider uppercase mb-1">Harga</div>
                <div className="text-lg font-bold text-white">{data.upgrade?.price || 'Rp 50.000'}</div>
              </div>
              <div className="w-px h-8 bg-white/10 hidden md:block"></div>
              <div className="w-full h-px bg-white/10 block md:hidden"></div>
              <div className="text-center md:text-right flex-1">
                <div className="text-[10px] text-rose-300/70 font-semibold tracking-wider uppercase mb-1">Limit</div>
                <div className="text-lg font-bold text-rose-400">{data.upgrade?.limit || 'Unlimited'}</div>
              </div>
           </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
        <div className="text-center mb-4">
          <h3 className="font-bold text-base mb-1">Hubungi Admin</h3>
          <p className="text-xs text-zinc-500">Upgrade akun atau sampaikan kendala.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <a href={`https://wa.me/${data.contacts?.wa}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl py-4 transition-colors">
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs font-semibold">WhatsApp</span>
          </a>
          <a href={`https://t.me/${data.contacts?.telegram}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-xl py-4 transition-colors">
            <Send className="w-6 h-6" />
            <span className="text-xs font-semibold">Telegram</span>
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <a href="/admin" className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
          <Shield className="w-4 h-4" /> Masuk Admin
        </a>
        <button className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-rose-500 hover:text-white hover:bg-rose-500 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

    </main>
  );
}

function DetailRow({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-zinc-400 font-medium">{label}</span>
      <span className={`text-sm font-semibold text-right ${highlight ? 'text-rose-400' : 'text-zinc-100'}`}>
        {value}
      </span>
    </div>
  );
}
