import { useState, useEffect, useRef } from 'react';
import { Users, Settings, BarChart2, MessageCircle, Save, Trash2, Edit2, Upload, Activity, ShieldCheck } from 'lucide-react';

interface AdminData {
  popup: { image: string; text: string };
  contact: { wa: string; telegram: string };
  upgrade: { description: string; price: string; limit: string };
  users: Array<{ id: string; name: string; type: string; limit: number; ip: string; userAgent: string }>;
  traffic: Array<{ provider: string; views: number }>;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verify-password', {
        method: 'POST',
        body: JSON.stringify({ password: passwordInput })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setIsAuthenticated(true);
          setLoginError('');
        } else {
          setLoginError('Password salah');
        }
      } else {
        setLoginError('Password salah');
      }
    } catch {
      setLoginError('Terjadi kesalahan');
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
      const res = await fetch('/api/admin/data');
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wa, telegram })
      });
      alert('Contacts saved successfully');
    } catch (e) {
      alert('Failed to save contacts');
    }
  };

  const saveUpgrade = async () => {
    try {
      await fetch('/api/admin/update-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: upgradeDesc, price: upgradePrice, limit: upgradeLimit })
      });
      alert('Upgrade info saved successfully');
    } catch (e) {
      alert('Failed to save upgrade info');
    }
  };

  const updateUserLimit = async (id: string, limit: number) => {
    try {
      await fetch('/api/admin/update-user-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      await fetch(`/api/admin/delete-user/${id}`, { method: 'DELETE' });
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
      <main className="min-h-screen pt-20 md:pt-32 pb-24 px-4 flex items-center justify-center">
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Admin Login</h2>
            <p className="text-zinc-500 text-sm mt-1">Masukkan password admin untuk melanjutkan</p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password Administator" 
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-rose-500 transition-colors"
                required
              />
            </div>
            {loginError && <p className="text-rose-500 text-sm font-medium">{loginError}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="bg-white text-black font-bold rounded-xl py-3 mt-2 hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sedang Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (loading && !data) {
    return <div className="text-center pt-32 text-zinc-500">Loading admin data...</div>;
  }

  if (!data) return <div className="text-center pt-32 text-rose-500">Failed to load data</div>;

  return (
    <main className="min-h-screen pt-20 md:pt-28 pb-24 px-4 md:px-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-4 md:gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2 md:mb-4 p-3 md:p-4 bg-zinc-900 border border-white/5 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base">Admin Panel</h2>
            <p className="text-xs text-zinc-500">Dashboard</p>
          </div>
        </div>

        <nav className="flex md:flex-col gap-1.5 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
          <MenuButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users className="w-4 h-4" />} label="Users" />
          <MenuButton active={activeTab === 'popup'} onClick={() => setActiveTab('popup')} icon={<MessageCircle className="w-4 h-4" />} label="Limit Popup" />
          <MenuButton active={activeTab === 'upgrade'} onClick={() => setActiveTab('upgrade')} icon={<Settings className="w-4 h-4" />} label="Upgrade Info" />
          <MenuButton active={activeTab === 'traffic'} onClick={() => setActiveTab('traffic')} icon={<Activity className="w-4 h-4" />} label="Traffic" />
          <MenuButton active={activeTab === 'contact'} onClick={() => setActiveTab('contact')} icon={<MessageCircle className="w-4 h-4" />} label="Contact" />
          <MenuButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<ShieldCheck className="w-4 h-4" />} label="Security" />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-2xl p-4 md:p-6 overflow-hidden">
        {activeTab === 'users' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold mb-1">User Management</h3>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-zinc-500 uppercase tracking-wider">
                    <th className="p-3">User</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Limit</th>
                    <th className="p-3 w-48">IP / User Agent</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 text-sm transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-zinc-200">{user.name}</div>
                        <div className="text-xs text-zinc-500">ID: {user.id}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.type === 'VIP' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
                          {user.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          defaultValue={user.limit}
                          onBlur={(e) => updateUserLimit(user.id, parseInt(e.target.value) || 0)}
                          className="w-20 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm text-zinc-300 focus:outline-none focus:border-rose-500"
                        />
                      </td>
                      <td className="p-3">
                        <div className="text-xs text-zinc-300">{user.ip}</div>
                        <div className="text-[10px] text-zinc-600 line-clamp-1 truncate" title={user.userAgent}>{user.userAgent}</div>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => deleteUser(user.id)} className="p-1.5 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors ml-auto flex items-center justify-center">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.users.length === 0 && <div className="text-center p-8 text-zinc-500">No users found.</div>}
            </div>
          </div>
        )}

        {activeTab === 'popup' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-xl">
            <div>
              <h3 className="text-lg font-bold mb-1">Limit Popup Configuration</h3>
              <p className="text-zinc-500 text-xs mb-4">Manage the popup shown when a user reaches their view limit.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Popup Image</label>
                <div className="flex items-center gap-4">
                  {popupImage ? (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                      <img src={popupImage} alt="Popup preview" className="w-full h-full object-cover" />
                      <button onClick={() => setPopupImage('')} className="absolute top-1 right-1 bg-black/60 p-1 rounded-md hover:bg-rose-500 text-white">
                         <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                      <Upload className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-lg transition-colors inline-block">
                      Upload Image
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                    <p className="text-xs text-zinc-500 mt-2">Upload a banner image to display on the popup limit.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Popup Message</label>
                <textarea 
                  value={popupText}
                  onChange={(e) => setPopupText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-rose-500 min-h-[100px]"
                  placeholder="Anda telah mencapai batas harian..."
                />
              </div>

              <button onClick={savePopup} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors mt-4">
                <Save className="w-4 h-4" /> Save Popup Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'upgrade' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-xl">
            <div>
              <h3 className="text-lg font-bold mb-1">Upgrade Info Configuration</h3>
              <p className="text-zinc-500 text-xs mb-4">Set the descriptive text and price shown in the user profile.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Upgrade Description</label>
                <textarea 
                  value={upgradeDesc}
                  onChange={(e) => setUpgradeDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-rose-500 min-h-[80px]"
                  placeholder="Buka akses tanpa batas tayangan premium..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Price / Pricing Text</label>
                <input 
                  type="text" 
                  value={upgradePrice}
                  onChange={(e) => setUpgradePrice(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-rose-500"
                  placeholder="Rp 50.000 / Bulan"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Limit After Upgrade</label>
                <input 
                  type="text" 
                  value={upgradeLimit}
                  onChange={(e) => setUpgradeLimit(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-rose-500"
                  placeholder="Unlimited"
                />
              </div>

              <button onClick={saveUpgrade} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors mt-4">
                <Save className="w-4 h-4" /> Save Upgrade Info
              </button>
            </div>
          </div>
        )}

        {activeTab === 'traffic' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold mb-1">Drama Provider Traffic</h3>
            <p className="text-xs text-zinc-500 mb-4">View total requests by provider.</p>
            
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 max-w-2xl">
              {data.traffic.map(item => (
                <div key={item.provider} className="flex items-center justify-between p-4 bg-zinc-950 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                      <BarChart2 className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <div className="text-sm font-bold uppercase tracking-wide">{item.provider}</div>
                      <div className="text-[10px] text-zinc-500">Provider Source</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold bg-zinc-900 px-3 py-1 rounded-lg">
                    {item.views.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-md">
            <div>
              <h3 className="text-lg font-bold mb-1">Contact Configuration</h3>
              <p className="text-zinc-500 text-xs mb-4">Set Whatsapp and Telegram contacts for users to reach out.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">WhatsApp Number</label>
                <div className="flex">
                  <span className="bg-zinc-800 border border-r-0 border-zinc-700 rounded-l-xl px-3 py-2 text-sm text-zinc-400 flex items-center">WA</span>
                  <input 
                    type="text" 
                    value={wa}
                    onChange={(e) => setWa(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-r-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-rose-500"
                    placeholder="6281234567890"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Telegram Username</label>
                <div className="flex">
                  <span className="bg-zinc-800 border border-r-0 border-zinc-700 rounded-l-xl px-3 py-2 text-sm text-zinc-400 flex items-center">@</span>
                  <input 
                    type="text" 
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-r-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-rose-500"
                    placeholder="admin_short"
                  />
                </div>
              </div>

              <button onClick={saveContact} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors mt-4">
                <Save className="w-4 h-4" /> Save Contacts
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold mb-1">Security Settings</h3>
            <p className="text-zinc-500 text-xs mb-4">Ganti password admin panel</p>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Password Lama</label>
                <input 
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-rose-500/50 transition-colors"
                  placeholder="Masukkan password saat ini"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Password Baru</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-rose-500/50 transition-colors"
                  placeholder="Masukkan password baru"
                  required
                />
              </div>
              {changePasswordMsg && (
                <p className={`text-sm font-medium ${changePasswordMsg.includes('berhasil') ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {changePasswordMsg}
                </p>
              )}
              <button type="submit" className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white w-full py-2.5 rounded-xl text-sm font-semibold transition-colors mt-2">
                <Save className="w-4 h-4" /> Update Password
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

function MenuButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-colors whitespace-nowrap text-left ${
        active ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200 border border-transparent'
      }`}
    >
      {icon}
      <span className="font-medium text-xs tracking-wide">{label}</span>
    </button>
  );
}
