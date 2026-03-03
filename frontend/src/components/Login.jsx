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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login VeroStock</h2>
        <input className="w-full p-2 mb-4 border rounded" placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input className="w-full p-2 mb-6 border rounded" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="w-full bg-blue-600 text-white p-2 rounded" type="submit">Entrar</button>
      </form>
    </div>
  );
}