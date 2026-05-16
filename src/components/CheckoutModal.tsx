import { useState, useEffect } from 'react';
import { Shield, CreditCard, Loader2, X } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/profile/data')
        .then(res => res.json())
        .then(json => {
          setData(json);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/user/checkout', { method: 'POST' });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 bg-black/40 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-1">VIP Upgrade</h3>
          <p className="text-zinc-500 text-sm mb-6">Dapatkan akses tanpa batas ke semua tayangan eksklusif.</p>

          {loading || !data ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
            </div>
          ) : (
            <>
              <div className="bg-black/50 border border-white/5 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm font-medium text-zinc-400">Harga</span>
                  <span className="text-sm font-bold text-white">{data.upgrade?.price || 'Rp 50.000'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm font-medium text-zinc-400">Limit Bar</span>
                  <span className="text-sm font-bold text-amber-500">{data.upgrade?.limit || 'Unlimited'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-zinc-400">Status Anda</span>
                  <span className="text-sm font-semibold text-zinc-300">{data.user?.type}</span>
                </div>
              </div>

              {data.user?.type === 'VIP' ? (
                <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-3 rounded-xl font-bold text-sm">
                  Anda telah menjadi VIP
                </div>
              ) : (
                <button 
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full relative flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {checkoutLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Bayar Sekarang
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
