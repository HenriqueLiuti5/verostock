// App.jsx
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Inventory from './components/Inventory';
import Dispatch from './components/Dispatch';
import Support from './components/Support';
import Login from './components/Login';
import logo from './assets/VERONLINE-simbolo-colorido-semfundo.png';

function App() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    checkToken();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const checkToken = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.is_superuser) {
          setUserRole('superadmin');
        } else if (decoded.is_staff) {
          setUserRole('admin');
        } else {
          setUserRole('user');
        }
        
        const savedUsername = localStorage.getItem('username') || decoded.username || 'Admin';
        setUserName(savedUsername);
        
        setIsAuthenticated(true);
      } catch (error) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName('');
    setActiveTab('inventory');
  };

  if (!isAuthenticated) return <Login setAuth={(status) => { setIsAuthenticated(status); checkToken(); }} darkMode={darkMode} setDarkMode={setDarkMode} />;

  return (
    <div className="min-h-screen bg-color1 dark:bg-color5 text-color5 dark:text-color1 font-sans selection:bg-color2/20 selection:text-color5 dark:selection:text-color1 overflow-x-hidden transition-colors duration-300">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-color4 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-3 md:py-0 md:h-16 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
          
          <div className="flex w-full md:w-auto items-center justify-between">
            <h1 className="text-lg font-bold tracking-tight text-color5 dark:text-white flex items-center gap-3 shrink-0">
              <img src={logo} alt="VeroStock" className="w-7 h-7 object-contain" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-color2 to-color3">VeroStock</span>
            </h1>
            
            <div className="flex md:hidden items-center gap-2">
              <button 
                type="button"
                onClick={() => setDarkMode(prev => !prev)}
                className="p-1.5 rounded-lg text-color5/60 dark:text-color4 hover:text-color2 dark:hover:text-color3 transition-all duration-200"
              >
                {darkMode ? (
                  <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
              <button 
                type="button"
                onClick={handleLogout} 
                className="text-xs font-medium text-color5/60 dark:text-color4/80 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 px-2 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                Sair
              </button>
              <div 
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-color2 to-color3 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-color2/20 uppercase border-2 border-white dark:border-slate-800 shrink-0"
                title={userName}
              >
                {userName ? userName.charAt(0) : 'A'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto justify-start md:justify-center pb-1 md:pb-0 hide-scrollbar scroll-smooth">
            <button 
              type="button"
              onClick={() => setActiveTab('inventory')} 
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'inventory' ? 'bg-color4/60 dark:bg-slate-800 text-color2 dark:text-color3 shadow-sm' : 'text-color5/60 dark:text-color4/80 hover:text-color5 dark:hover:text-white hover:bg-color4/30 dark:hover:bg-slate-800/50'}`}
            >
              Estoque
            </button>
            
            {(userRole === 'superadmin' || userRole === 'admin') && (
              <button 
                type="button"
                onClick={() => setActiveTab('dispatch')} 
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'dispatch' ? 'bg-color4/60 dark:bg-slate-800 text-color2 dark:text-color3 shadow-sm' : 'text-color5/60 dark:text-color4/80 hover:text-color5 dark:hover:text-white hover:bg-color4/30 dark:hover:bg-slate-800/50'}`}
              >
                Envios
              </button>
            )}
            
            {userRole === 'superadmin' && (
              <button 
                type="button"
                onClick={() => setActiveTab('support')} 
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'support' ? 'bg-color4/60 dark:bg-slate-800 text-color2 dark:text-color3 shadow-sm' : 'text-color5/60 dark:text-color4/80 hover:text-color5 dark:hover:text-white hover:bg-color4/30 dark:hover:bg-slate-800/50'}`}
              >
                Suporte
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button 
              type="button"
              onClick={() => setDarkMode(prev => !prev)}
              className="p-2 rounded-xl text-color5/60 dark:text-color4 hover:text-color2 dark:hover:text-color3 transition-all duration-200"
            >
              {darkMode ? (
                <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <button 
              type="button"
              onClick={handleLogout} 
              className="text-sm font-medium text-color5/60 dark:text-color4/80 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              Sair
            </button>
            <div 
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-color2 to-color3 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-color2/20 uppercase border-2 border-white dark:border-slate-800"
              title={userName}
            >
              {userName ? userName.charAt(0) : 'A'}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 py-6 md:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'dispatch' && (userRole === 'superadmin' || userRole === 'admin') && <Dispatch />}
        {activeTab === 'support' && userRole === 'superadmin' && <Support />}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

export default App;