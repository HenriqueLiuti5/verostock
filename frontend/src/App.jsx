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
    <div className="min-h-screen bg-white">
      <nav className="bg-gray-800 text-white p-4 flex gap-4 items-center">
        <h1 className="text-xl font-bold mr-8">VeroStock</h1>
        
        <button onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? 'underline' : ''}>
          Estoque
        </button>
        
        {(userRole === 'superadmin' || userRole === 'admin') && (
          <button onClick={() => setActiveTab('dispatch')} className={activeTab === 'dispatch' ? 'underline' : ''}>
            Envios
          </button>
        )}
        
        {userRole === 'superadmin' && (
          <button onClick={() => setActiveTab('support')} className={activeTab === 'support' ? 'underline' : ''}>
            Suporte
          </button>
        )}

        <button onClick={handleLogout} className="ml-auto bg-red-600 px-3 py-1 rounded hover:bg-red-700">
          Sair
        </button>
      </nav>
      
      <main className="container mx-auto mt-4">
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'dispatch' && (userRole === 'superadmin' || userRole === 'admin') && <Dispatch />}
        {activeTab === 'support' && userRole === 'superadmin' && <Support />}
      </main>
    </div>
  );
}

export default App;