// Login.jsx
import { useState } from 'react';
import api from '../services/api';

export default function Login({ setAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('token/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      setAuth(true); 
    } catch (error) {
      alert('Credenciais inválidas');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-color1 text-color5 font-sans selection:bg-color2/20 selection:text-color5 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,102,255,0.06)_0,rgba(248,250,252,1)_100%)] pointer-events-none"></div>
      
      <form onSubmit={handleSubmit} className="bg-white border border-color4 p-10 rounded-3xl shadow-xl shadow-color4/30 w-full max-w-sm relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-white border border-color4 rounded-xl flex items-center justify-center mb-6 shadow-sm">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-color2 to-color3 shadow-[0_0_12px_rgba(0,102,255,0.4)]"></div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-color5">Acesse o VeroStock</h2>
          <p className="text-color5/50 mt-1.5 text-sm text-center">Insira suas credenciais para gerenciar.</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-color5/60 uppercase tracking-widest mb-2">Usuário</label>
            <input 
              className="w-full p-3.5 bg-white border border-color4 rounded-xl text-color5 placeholder-color5/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all shadow-sm text-sm" 
              placeholder="Digite seu usuário" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-color5/60 uppercase tracking-widest mb-2">Senha</label>
            <input 
              className="w-full p-3.5 bg-white border border-color4 rounded-xl text-color5 placeholder-color5/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all shadow-sm text-sm" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-color2 to-color3 hover:opacity-90 text-white font-medium p-3.5 rounded-xl mt-10 transition-all duration-300 shadow-md flex justify-center items-center text-sm" type="submit">
          Entrar no sistema
        </button>
      </form>
    </div>
  );
}