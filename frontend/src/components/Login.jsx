// Login.jsx
import { useState } from 'react';
import api from '../services/api';
import logo from '../assets/VERONLINE-simbolo-colorido-semfundo.png';

export default function Login({ setAuth, darkMode, setDarkMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await api.post('token/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('username', username);
      setAuth(true); 
    } catch (error) {
      setErrorMsg('Credenciais incorretas. Verifique seu usuário e senha.');
    }
  };

  return (
    <div className="flex min-h-screen bg-color1 dark:bg-color5 font-sans selection:bg-color2/20 dark:selection:bg-color2/40 overflow-hidden transition-colors duration-300">
      
      {/* Botão de Tema Top-Right no Login */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <button 
          type="button"
          onClick={() => setDarkMode(prev => !prev)}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-color4/60 dark:border-slate-700 text-color5/60 dark:text-slate-400 hover:text-color2 dark:hover:text-color3 shadow-sm transition-all duration-200"
        >
          {darkMode ? (
            <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
      </div>

      {/* Lado Esquerdo: Visual/Bem-vindo */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-color2 to-color3 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center flex flex-col items-center max-w-md animate-in fade-in zoom-in-95 duration-1000 px-4">
          <div className="w-24 h-24 flex items-center justify-center shadow-2xl rounded-2xl">
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Bem-vindo de volta!
          </h1>
          
          <p className="text-white/80 text-lg leading-relaxed font-medium">
            Acesse o painel de estoque da Veronline e gerencie seus produtos, relatórios e suporte de forma fácil e eficiente.
          </p>
        </div>
      </div>

      {/* Lado Direito: Formulário */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-color1 dark:bg-color5 relative transition-colors duration-300">
        <div className="w-full max-w-[400px] animate-in slide-in-from-bottom-8 lg:slide-in-from-right-8 duration-700">
          
          {/* Logo mobile */}
          <div className="flex lg:hidden justify-center mb-8">
            <div className="w-20 h-20 flex items-center justify-center shadow-lg rounded-2xl">
               <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <header className="mb-8 sm:mb-10 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-color5 dark:text-white mb-2 tracking-tight">Acesse sua conta</h2>
            <p className="text-color5/50 dark:text-slate-400 font-medium text-sm sm:text-base">Entre com suas credenciais para continuar.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            
            {/* Aviso de erro na tela */}
            {errorMsg && (
              <div className="p-3 sm:p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-color5 dark:text-slate-200 ml-1">Usuário corporativo</label>
              <input 
                className={`w-full p-4 bg-white dark:bg-slate-800 border ${errorMsg ? 'border-red-300 dark:border-red-500/50' : 'border-color4/80 dark:border-slate-700/80'} rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-slate-500 focus:outline-none focus:border-color2 dark:focus:border-color3 focus:ring-4 focus:ring-color2/10 dark:focus:ring-color3/10 transition-all text-sm font-medium shadow-sm`}
                placeholder="nome@exemplo.com" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-color5 dark:text-slate-200">Senha</label>
              </div>
              <div className="relative">
                <input 
                  className={`w-full p-4 bg-white dark:bg-slate-800 border ${errorMsg ? 'border-red-300 dark:border-red-500/50' : 'border-color4/80 dark:border-slate-700/80'} rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-slate-500 focus:outline-none focus:border-color2 dark:focus:border-color3 focus:ring-4 focus:ring-color2/10 dark:focus:ring-color3/10 transition-all text-sm font-medium shadow-sm`} 
                  type="password" 
                  placeholder="exemplo@123" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-color2 hover:bg-blue-600 dark:bg-color2 dark:hover:bg-color3 active:scale-[0.98] text-white font-bold p-4 rounded-xl mt-4 sm:mt-6 transition-all duration-200 shadow-xl shadow-color2/20 flex justify-center items-center text-sm tracking-wide"
            >
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
      
    </div>
  );
}