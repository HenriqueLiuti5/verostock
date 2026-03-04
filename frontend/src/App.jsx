// App.jsx
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Inventory from './components/Inventory';
import Dispatch from './components/Dispatch';
import Support from './components/Support';
import Login from './components/Login';

function App() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    checkToken();
  }, []);

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
        setIsAuthenticated(true);
      } catch (error) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setUserRole(null);
    setActiveTab('inventory');
  };

  if (!isAuthenticated) return <Login setAuth={(status) => { setIsAuthenticated(status); checkToken(); }} />;

  return (
    <div className="min-h-screen bg-color1 text-color5 font-sans selection:bg-color2/20 selection:text-color5">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-color4/60 shadow-sm">
        <div className="container mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <h1 className="text-lg font-bold tracking-tight text-color5 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-color2 to-color3 shadow-[0_0_12px_rgba(0,102,255,0.4)]"></div>
              VeroStock
            </h1>
            
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('inventory')} 
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'inventory' ? 'bg-color4/40 text-color5 shadow-sm border border-color4/60' : 'text-color5/60 hover:text-color5 hover:bg-color4/30 border border-transparent'}`}
              >
                Estoque
              </button>
              
              {(userRole === 'superadmin' || userRole === 'admin') && (
                <button 
                  onClick={() => setActiveTab('dispatch')} 
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'dispatch' ? 'bg-color4/40 text-color5 shadow-sm border border-color4/60' : 'text-color5/60 hover:text-color5 hover:bg-color4/30 border border-transparent'}`}
                >
                  Envios
                </button>
              )}
              
              {userRole === 'superadmin' && (
                <button 
                  onClick={() => setActiveTab('support')} 
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'support' ? 'bg-color4/40 text-color5 shadow-sm border border-color4/60' : 'text-color5/60 hover:text-color5 hover:bg-color4/30 border border-transparent'}`}
                >
                  Suporte
                </button>
              )}
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            className="text-sm font-medium text-color5/60 hover:text-color5 transition-all duration-200 flex items-center gap-2 px-3.5 py-1.5 rounded-lg hover:bg-color4/30 border border-transparent"
          >
            Sair
          </button>
        </div>
      </nav>
      
      <main className="container mx-auto max-w-6xl px-6 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'dispatch' && (userRole === 'superadmin' || userRole === 'admin') && <Dispatch />}
        {activeTab === 'support' && userRole === 'superadmin' && <Support />}
      </main>
    </div>
  );
}

export default App;