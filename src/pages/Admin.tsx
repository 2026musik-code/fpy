import { useState, useEffect, useRef } from 'react';
import { Users, Settings, BarChart2, MessageCircle, Save, Trash2, Edit2, Upload, Activity, ShieldCheck, CreditCard, Lock, ChevronRight, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminData {
  popup: { image: string; text: string };
  contact: { wa: string; telegram: string };
  upgrade: { description: string; price: string; limit: string };
  users: Array<{ id: string; name: string; type: string; limit: number; ip: string; userAgent: string }>;
  traffic: Array<{ provider: string; views: number }>;
  paymentApiKey: string;
  providers: Array<{ id: string; name: string; url: string; icon?: string }>;
}

export function Admin() {
  const [data, setData] = useState<AdminData | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePasswordMsg, setChangePasswordMsg] = useState('');

  // States for forms
  const [popupText, setPopupText] = useState('');
  const [popupImage, setPopupImage] = useState('');
  const [wa, setWa] = useState('');
  const [telegram, setTelegram] = useState('');
  const [upgradeDesc, setUpgradeDesc] = useState('');
  const [upgradePrice, setUpgradePrice] = useState('');
  const [upgradeLimit, setUpgradeLimit] = useState('');
  const [paymentApiKey, setPaymentApiKey] = useState('');
  const [providers, setProviders] = useState<Array<{ id: string; name: string; url: string; icon?: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          sessionStorage.setItem('adminToken', passwordInput);
          setIsAuthenticated(true);
        } else {
          setLoginError('Akses ditolak. Password salah.');
        }
      } else {
        setLoginError('Akses ditolak. Password salah.');
      }
    } catch {
      setLoginError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordMsg('');
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': sessionStorage.getItem('adminToken') || ''
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const json = await res.json();
      if (json.success) {
        setChangePasswordMsg('Password berhasil diubah!');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setChangePasswordMsg(json.error || 'Gagal mengubah password');
      }
    } catch {
      setChangePasswordMsg('Terjadi kesalahan');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data', {
        headers: {
          'x-admin-password': sessionStorage.getItem('adminToken') || ''
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setPopupText(json.popup?.text || '');
        setPopupImage(json.popup?.image || '');
        setWa(json.contact?.wa || '');
        setTelegram(json.contact?.telegram || '');
        setUpgradeDesc(json.upgrade?.description || '');
        setUpgradePrice(json.upgrade?.price || '');
        setUpgradeLimit(json.upgrade?.limit || '');
        setPaymentApiKey(json.paymentApiKey || '');
        setProviders(json.providers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const savePopup = async () => {
    try {
      await fetch('/api/admin/update-popup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': sessionStorage.getItem('adminToken') || ''
        },
        body: JSON.stringify({ text: popupText, image: popupImage })
      });
      alert('Popup saved successfully');
    } catch (e) {
      alert('Failed to save popup');
    }
  };

  const saveContact = async () => {
    try {
      await fetch('/api/admin/update-contact', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': sessionStorage.getItem('adminToken') || ''
        },
        body: JSON.stringify({ wa, telegram })
      });
      alert('Contacts saved successfully');
    } catch (e) {
      alert('Failed to save contacts');
    }
  };

  const saveProviders = async () => {
    try {
      await fetch('/api/admin/update-providers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': sessionStorage.getItem('adminToken') || ''
        },
        body: JSON.stringify({ providers })
      });
      alert('Providers saved successfully. They will be reflected across the app.');
      window.dispatchEvent(new Event('provider-changed'));
    } catch (e) {
      alert('Failed to save providers');
    }
  };

  const saveUpgrade = async () => {
    try {
      await fetch('/api/admin/update-upgrade', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': sessionStorage.getItem('adminToken') || ''
        },
        body: JSON.stringify({ description: upgradeDesc, price: upgradePrice, limit: upgradeLimit })
      });
      alert('Upgrade info saved successfully');
    } catch (e) {
      alert('Failed to save upgrade info');
    }
  };

  const savePaymentKey = async () => {
    try {
      await fetch('/api/admin/update-payment-key', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': sessionStorage.getItem('adminToken') || ''
        },
        body: JSON.stringify({ paymentApiKey })
      });
      alert('Payment key saved successfully');
    } catch (e) {
      alert('Failed to save payment key');
    }
  };

  const updateUserLimit = async (id: string, limit: number) => {
    try {
      await fetch('/api/admin/update-user-limit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': sessionStorage.getItem('adminToken') || ''
        },
        body: JSON.stringify({ id, limit })
      });
      fetchData();
    } catch (e) {
      alert('Failed to update limit');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`/api/admin/delete-user/${id}`, { 
        method: 'DELETE',
        headers: {
          'x-admin-password': sessionStorage.getItem('adminToken') || ''
        }
      });
      fetchData();
    } catch (e) {
      alert('Failed to delete user');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPopupImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen relative flex flex-col pt-10 md:pt-0 items-center justify-start md:justify-center p-4 bg-zinc-950 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-sm"
        >
          <div className="flex flex-col items-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 flex items-center justify-center shadow-2xl mb-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent" />
              <Lock className="w-8 h-8 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
            </motion.div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tight text-center">
              Admin Vault
            </h2>
            <p className="text-zinc-500 text-sm mt-2 font-medium tracking-wide">Administrator access only.</p>
          </div>
          
          <div className="bg-zinc-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)]">
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <AnimatePresence mode="wait">
                {loginError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-2xl text-center font-bold overflow-hidden flex justify-center items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {loginError}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 block text-center">
                  Masukkan Master Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-indigo-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                  <input 
                    type="password" 
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••" 
                    className="relative w-full bg-zinc-950/80 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-rose-500 transition-all text-center tracking-[0.5em] font-mono shadow-inner placeholder:text-zinc-700 placeholder:tracking-normal"
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || !passwordInput}
                className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-2xl py-4 transition-all shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.6)] disabled:shadow-none flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <span className="flex items-center gap-2 animate-pulse">Verifying Access...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-rose-200" /> Unlock Vault
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    );
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <Activity className="w-8 h-8 text-rose-500 animate-pulse" />
        <div className="text-zinc-500 text-sm font-medium tracking-widest uppercase">Initializing Vault...</div>
      </div>
    );
  }

  if (!data) return <div className="text-center pt-32 text-rose-500">Failed to load data vault.</div>;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[50%] bg-orange-900/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <main className="relative z-10 pt-20 md:pt-28 pb-24 px-4 md:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-72 shrink-0 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between p-5 bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-black text-lg tracking-tight">Admin Vault</h2>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Secure Dashboard</p>
              </div>
            </div>
            <button 
              onClick={() => {
                sessionStorage.removeItem('adminToken');
                setIsAuthenticated(false);
              }}
              className="p-2.5 text-zinc-500 hover:text-rose-500 bg-black/20 hover:bg-rose-500/10 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex lg:flex-col gap-2 overflow-x-auto hide-scrollbar pb-2 lg:pb-0 p-3 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[2rem]">
            <MenuButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users className="w-4 h-4" />} label="Users & Access" />
            <MenuButton active={activeTab === 'popup'} onClick={() => setActiveTab('popup')} icon={<MessageCircle className="w-4 h-4" />} label="Limit Popup" />
            <MenuButton active={activeTab === 'upgrade'} onClick={() => setActiveTab('upgrade')} icon={<Settings className="w-4 h-4" />} label="Upgrade Packages" />
            <MenuButton active={activeTab === 'traffic'} onClick={() => setActiveTab('traffic')} icon={<Activity className="w-4 h-4" />} label="Network Traffic" />
            <MenuButton active={activeTab === 'providers'} onClick={() => setActiveTab('providers')} icon={<BarChart2 className="w-4 h-4" />} label="Providers" />
            <MenuButton active={activeTab === 'contact'} onClick={() => setActiveTab('contact')} icon={<MessageCircle className="w-4 h-4" />} label="Support Contacts" />
            <MenuButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Lock className="w-4 h-4" />} label="Security Settings" />
            <MenuButton active={activeTab === 'payment'} onClick={() => setActiveTab('payment')} icon={<CreditCard className="w-4 h-4" />} label="Payment Gateway" />
          </nav>
        </motion.div>

        {/* Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-xl overflow-hidden flex flex-col min-h-[600px] relative"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-indigo-500 opacity-20" />
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="p-6 md:p-8 h-full"
            >

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">User Directory</h3>
                    <p className="text-sm text-zinc-400 mt-1">Manage user access limits and connection logs.</p>
                  </div>
                  
                  <div className="w-full overflow-x-auto bg-black/20 border border-white/5 rounded-[1.5rem] p-1">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-white/10 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-black/40">
                          <th className="p-4 rounded-tl-[1.5rem]">User Profile</th>
                          <th className="p-4">Tier</th>
                          <th className="p-4">Limit</th>
                          <th className="p-4 w-56">Network Info</th>
                          <th className="p-4 text-right rounded-tr-[1.5rem]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.users.map((user) => (
                          <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 text-sm transition-colors group">
                            <td className="p-4">
                              <div className="font-bold text-zinc-100">{user.name}</div>
                              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{user.id}</div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.type === 'VIP' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_10px_-2px_rgba(249,115,22,0.2)]' : 'bg-zinc-800 text-zinc-400'}`}>
                                {user.type}
                              </span>
                            </td>
                            <td className="p-4">
                              <input 
                                type="number" 
                                defaultValue={user.limit}
                                onBlur={(e) => updateUserLimit(user.id, parseInt(e.target.value) || 0)}
                                className="w-24 bg-zinc-950/50 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-2 text-sm font-bold text-zinc-200 focus:outline-none transition-colors"
                              />
                            </td>
                            <td className="p-4">
                              <div className="text-xs font-mono text-zinc-300">{user.ip}</div>
                              <div className="text-[10px] text-zinc-600 line-clamp-1 mt-1 truncate" title={user.userAgent}>{user.userAgent}</div>
                            </td>
                            <td className="p-4 text-right">
                              <button onClick={() => deleteUser(user.id)} className="p-2 text-zinc-500 hover:text-rose-500 bg-zinc-900 hover:bg-rose-500/10 rounded-xl transition-all ml-auto flex items-center justify-center border border-transparent hover:border-rose-500/20 shadow-sm">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.users.length === 0 && (
                      <div className="text-center p-12 text-zinc-500 font-medium text-sm">No user records found in vault.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Popup Configuration */}
              {activeTab === 'popup' && (
                <div className="space-y-8 max-w-2xl">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Limit Interstitial UX</h3>
                    <p className="text-sm text-zinc-400 mt-1">Configure the interface users see when they exhaust their quota.</p>
                  </div>

                  <div className="space-y-6 bg-black/20 p-6 sm:p-8 rounded-[1.5rem] border border-white/5">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Hero Context</label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shrink-0 shadow-lg group">
                          {popupImage ? (
                            <>
                              <img src={popupImage} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <button onClick={() => setPopupImage('')} className="bg-rose-500 text-white p-3 rounded-full hover:scale-110 transition-transform">
                                   <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-900/50">
                              <Upload className="w-8 h-8 mb-2" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Empty</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-bold rounded-xl transition-all shadow-md">
                            Select Artwork
                          </button>
                          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                          <p className="text-xs text-zinc-500 mt-3 leading-relaxed">Recommended size: 800x600px. Upload an engaging image to encourage upgrades.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Intercept Messaging</label>
                      <textarea 
                        value={popupText}
                        onChange={(e) => setPopupText(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:border-rose-500 transition-colors min-h-[120px] shadow-inner"
                        placeholder="Define compelling copy for the limit notice..."
                      />
                    </div>

                    <div className="pt-6 flex justify-end">
                      <button onClick={savePopup} className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-8 py-3.5 rounded-2xl text-sm font-bold shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)] transition-all">
                        <Save className="w-4 h-4" /> Commit Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upgrade Info */}
              {activeTab === 'upgrade' && (
                <div className="space-y-8 max-w-2xl">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Premium Tier Definition</h3>
                    <p className="text-sm text-zinc-400 mt-1">Configure the value proposition and pricing for VIP access.</p>
                  </div>

                  <div className="space-y-6 bg-black/20 p-6 sm:p-8 rounded-[1.5rem] border border-white/5">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Value Proposition</label>
                      <textarea 
                        value={upgradeDesc}
                        onChange={(e) => setUpgradeDesc(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:border-rose-500 transition-colors min-h-[100px] shadow-inner"
                        placeholder="Unlock unlimited access paradigm..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Pricing Label</label>
                        <input 
                          type="text" 
                          value={upgradePrice}
                          onChange={(e) => setUpgradePrice(e.target.value)}
                          className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-5 py-3.5 text-sm font-medium text-zinc-200 focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
                          placeholder="Rp 50.000 / Bulan"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Target Quota Status</label>
                        <input 
                          type="text" 
                          value={upgradeLimit}
                          onChange={(e) => setUpgradeLimit(e.target.value)}
                          className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-5 py-3.5 text-sm font-medium text-zinc-200 focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
                          placeholder="Unlimited"
                        />
                      </div>
                    </div>

                    <div className="pt-6 flex justify-end border-t border-white/5">
                      <button onClick={saveUpgrade} className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-8 py-3.5 rounded-2xl text-sm font-bold shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)] transition-all">
                        <Save className="w-4 h-4" /> Publish Package
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Providers Tab */}
              {activeTab === 'providers' && (
                <div className="space-y-8 max-w-4xl">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Providers configuration</h3>
                    <p className="text-sm text-zinc-400 mt-1">Manage video providers and their logo icons.</p>
                  </div>
                  
                  <div className="space-y-4">
                    {providers.map((p, index) => (
                      <div key={p.id} className="flex gap-4 items-center bg-black/20 border border-white/5 p-4 rounded-2xl">
                        <div className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                          <img src={p.icon || `https://www.google.com/s2/favicons?domain=${p.url}&sz=128`} alt={p.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex gap-3">
                            <input 
                              type="text" 
                              value={p.name} 
                              onChange={(e) => {
                                const newP = [...providers];
                                newP[index].name = e.target.value;
                                setProviders(newP);
                              }}
                              className="w-1/3 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-rose-500 transition-colors"
                              placeholder="Name"
                            />
                            <input 
                              type="text" 
                              value={p.url} 
                              onChange={(e) => {
                                const newP = [...providers];
                                newP[index].url = e.target.value;
                                setProviders(newP);
                              }}
                              className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-rose-500 transition-colors"
                              placeholder="URL"
                            />
                          </div>
                          <div>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const newP = [...providers];
                                    newP[index].icon = reader.result as string;
                                    setProviders(newP);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                            />
                            <p className="text-[10px] text-zinc-500 mt-1">Upload a custom logo to replace the default favicon.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const newP = providers.filter((_, i) => i !== index);
                            setProviders(newP);
                          }}
                          className="w-10 h-10 hover:bg-white/10 rounded-full flex items-center justify-center text-zinc-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between border-t border-white/5 pt-6">
                    <button 
                      onClick={() => setProviders([...providers, { id: 'new_prov_' + Date.now(), name: 'New Provider', url: 'https://', icon: '' }])}
                      className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all"
                    >
                       Add Provider
                    </button>
                    
                    <button onClick={saveProviders} className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-8 py-3.5 rounded-2xl text-sm font-bold shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)] transition-all">
                      <Save className="w-4 h-4" /> Save Providers
                    </button>
                  </div>
                </div>
              )}

              {/* Traffic Tab */}
              {activeTab === 'traffic' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">API Telemetry</h3>
                    <p className="text-sm text-zinc-400 mt-1">Real-time inspection of upstream provider throughput.</p>
                  </div>
                  
                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {data.traffic.map(item => (
                      <div key={item.provider} className="flex flex-col p-6 bg-black/20 border border-white/5 rounded-[1.5rem] hover:border-white/10 transition-colors relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-colors" />
                        
                        <div className="relative z-10 flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-lg">
                            <Activity className="w-5 h-5 text-rose-500" />
                          </div>
                          <div>
                            <div className="text-sm font-black uppercase tracking-widest text-zinc-200">{item.provider}</div>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Target Edge</div>
                          </div>
                        </div>
                        <div className="relative z-10 mt-auto flex flex-col items-start">
                          <span className="text-xs text-zinc-600 font-semibold mb-1 uppercase tracking-widest">Total Req</span>
                          <span className="text-4xl font-black text-white tracking-tight">{item.views.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    {data.traffic.length === 0 && (
                      <div className="col-span-full text-center p-12 bg-black/20 border border-white/5 rounded-3xl text-zinc-500 text-sm font-medium">No telemetry data recorded yet.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-8 max-w-2xl">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Support Channels</h3>
                    <p className="text-sm text-zinc-400 mt-1">Establish direct lines of communication for end-users.</p>
                  </div>

                  <div className="space-y-6 bg-black/20 p-6 sm:p-8 rounded-[1.5rem] border border-white/5">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">WhatsApp Enterprise</label>
                        <div className="flex shadow-inner rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-rose-500/50">
                          <span className="bg-zinc-900/50 border border-r-0 border-zinc-800 px-5 flex items-center justify-center text-sm font-bold text-rose-500 shrink-0">
                            +62
                          </span>
                          <input 
                            type="text" 
                            value={wa}
                            onChange={(e) => setWa(e.target.value)}
                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-r-2xl px-4 py-4 text-sm font-medium text-zinc-200 outline-none transition-colors"
                            placeholder="81234567890"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Telegram Handle</label>
                        <div className="flex shadow-inner rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-rose-500/50">
                          <span className="bg-zinc-900/50 border border-r-0 border-zinc-800 px-5 flex items-center justify-center text-sm font-bold text-blue-400 shrink-0">
                            @
                          </span>
                          <input 
                            type="text" 
                            value={telegram}
                            onChange={(e) => setTelegram(e.target.value)}
                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-r-2xl px-4 py-4 text-sm font-medium text-zinc-200 outline-none transition-colors"
                            placeholder="admin_vod"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex justify-end">
                      <button onClick={saveContact} className="flex items-center justify-center gap-2 bg-white text-zinc-950 hover:bg-zinc-200 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-md">
                        <Save className="w-4 h-4" /> Enforce Routing
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-8 max-w-xl">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Security Credentials</h3>
                    <p className="text-sm text-zinc-400 mt-1">Rotate the master vault access key.</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-6 bg-black/20 p-6 sm:p-8 rounded-[1.5rem] border border-white/5">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Current Protocol Key</label>
                        <input 
                          type="password"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-rose-500/50 transition-colors font-mono tracking-widest shadow-inner placeholder:text-zinc-700"
                          placeholder="••••••••••••"
                          required
                        />
                      </div>
                      <div className="pt-6 border-t border-white/5">
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">New Protocol Key</label>
                        <input 
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-rose-500/50 transition-colors font-mono tracking-widest shadow-inner text-rose-200 placeholder:text-zinc-700"
                          placeholder="Generate new secure key"
                          required
                        />
                      </div>
                    </div>

                    {changePasswordMsg && (
                      <div className={`p-4 rounded-xl text-sm font-bold text-center border ${changePasswordMsg.includes('berhasil') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {changePasswordMsg}
                      </div>
                    )}

                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white py-4 mt-4 rounded-2xl text-sm font-bold shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.5)] transition-all">
                      <Lock className="w-4 h-4" /> Invalidate & Rotate Key
                    </button>
                  </form>
                </div>
              )}

              {/* Payment Tab */}
              {activeTab === 'payment' && (
                <div className="space-y-8 max-w-2xl">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Payment Infrastructure</h3>
                    <p className="text-sm text-zinc-400 mt-1">Configure transaction processing provider credentials.</p>
                  </div>

                  <div className="space-y-6 bg-black/20 p-6 sm:p-8 rounded-[1.5rem] border border-white/5">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center justify-between">
                        <span>Paymenku Integration Token</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded shadow-sm">Encrypted</span>
                      </label>
                      <input 
                        type="text"
                        value={paymentApiKey}
                        onChange={e => setPaymentApiKey(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-rose-500/50 transition-colors font-mono text-sm tracking-wide text-rose-200 shadow-inner placeholder:text-zinc-700"
                        placeholder="sk_live_xxxxxxxxxxxxxxxx"
                      />
                      <p className="text-xs text-zinc-500 mt-4 leading-relaxed font-medium bg-black/40 p-4 rounded-xl border border-white/5 flex items-start gap-3">
                        <Lock className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                        This token is strictly injected via server-side process mapping and never exposed to client-side bundles yielding complete isolation.
                      </p>
                    </div>
                    
                    <div className="pt-6 flex justify-end border-t border-white/5">
                      <button onClick={savePaymentKey} className="flex items-center justify-center gap-2 bg-white text-zinc-950 hover:bg-zinc-200 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-md">
                        <Save className="w-4 h-4" /> Secure Vault Entry
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}

function MenuButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full px-5 py-4 rounded-[1.25rem] transition-all whitespace-nowrap text-left group border border-transparent ${
        active 
          ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20 border-white/10' 
          : 'hover:bg-white/[0.03] text-zinc-400 hover:text-zinc-200 hover:border-white/5'
      }`}
    >
      <div className={`transition-colors ${active ? 'text-white drop-shadow-md' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
        {icon}
      </div>
      <span className={`font-bold text-[13px] tracking-wide ${active ? 'opacity-100 drop-shadow-sm' : 'opacity-80'}`}>{label}</span>
      {active && (
        <ChevronRight className="w-4 h-4 ml-auto text-white opacity-70" />
      )}
    </button>
  );
}
