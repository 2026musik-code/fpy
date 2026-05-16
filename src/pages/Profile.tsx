import { UserCircle, Settings, ChevronRight, LogOut, Bell, Shield, CircleHelp } from 'lucide-react';
import { useState } from 'react';

export function Profile() {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <main className="min-h-screen pt-4 md:pt-24 pb-24 px-4 md:px-8 max-w-5xl mx-auto flex flex-col md:flex-row gap-4 md:gap-8">
      {/* Sidebar relative to profile */}
      <div className="w-full md:w-64 flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2 md:mb-4 p-3 md:p-4 bg-zinc-900 border border-white/5 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center shadow-lg">
            <UserCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base">Guest User</h2>
            <p className="text-xs text-zinc-500">Free Account</p>
          </div>
        </div>

        <nav className="flex md:flex-col gap-1.5 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
          <MenuButton 
            active={activeTab === 'account'} 
            onClick={() => setActiveTab('account')}
            icon={<UserCircle className="w-4 h-4" />} 
            label="Account" 
          />
          <MenuButton 
            active={activeTab === 'preferences'} 
            onClick={() => setActiveTab('preferences')}
            icon={<Settings className="w-4 h-4" />} 
            label="Preferences" 
          />
          <MenuButton 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')}
            icon={<Bell className="w-4 h-4" />} 
            label="Notifications" 
          />
          <MenuButton 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')}
            icon={<Shield className="w-4 h-4" />} 
            label="Security" 
          />
          <MenuButton 
            active={activeTab === 'help'} 
            onClick={() => setActiveTab('help')}
            icon={<CircleHelp className="w-4 h-4" />} 
            label="Help & Support" 
          />
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-2xl p-4 md:p-6 relative">
        {activeTab === 'account' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-lg font-bold mb-1">Account Details</h3>
              <p className="text-zinc-400 text-xs mb-4">Manage your account information and email settings.</p>
              
              <div className="space-y-3 max-w-md">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Username</label>
                  <input 
                    type="text" 
                    value="Guest User" 
                    disabled
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value="guest@fypshort.app" 
                    disabled
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 mt-4">
              <h3 className="text-base font-bold mb-3 text-rose-500">Danger Zone</h3>
              <button className="flex items-center gap-2 text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 rounded-xl transition-colors font-medium text-xs">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold mb-3">App Preferences</h3>
            <div className="space-y-3">
              <PreferenceItem title="Autoplay Video" description="Automatically play next episode" defaultChecked />
              <PreferenceItem title="High Quality Video" description="Stream in highest available quality (uses more data)" />
              <PreferenceItem title="Save History" description="Remember what I've watched" defaultChecked />
            </div>
          </div>
        )}

        {/* Placeholders for others */}
        {['notifications', 'security', 'help'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500 animate-in fade-in duration-300">
            <Settings className="w-12 h-12 mb-4 opacity-20" />
            <p>This feature is not available yet.</p>
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
      className={`flex items-center justify-between w-full p-3 rounded-xl transition-colors whitespace-nowrap ${
        active ? 'bg-rose-500/10 text-rose-500' : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
      <ChevronRight className={`w-4 h-4 ${active ? 'opacity-100' : 'opacity-0'}`} />
    </button>
  );
}

function PreferenceItem({ title, description, defaultChecked = false }: { title: string, description: string, defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-white/5">
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-rose-500' : 'bg-zinc-800'}`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
