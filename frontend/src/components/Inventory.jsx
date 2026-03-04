// Inventory.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    category: '', 
    quantity: 0, 
    observations: '' 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [prodRes, catRes] = await Promise.all([api.get('products/'), api.get('categories/')]);
    setProducts(prodRes.data);
    setCategories(catRes.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`products/${editingId}/`, form);
    } else {
      await api.post('products/', form);
    }
    fetchData();
    resetForm();
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      quantity: product.quantity,
      observations: product.observations || ''
    });
  };

  const confirmDelete = async () => {
    try {
      // Verifica se o produto tem envios vinculados antes de tentar excluir
      const repRes = await api.get('reports/');
      const hasReports = repRes.data.some(r => r.product.toString() === productToDelete.toString());

      if (hasReports) {
        setProductToDelete(null);
        setErrorMessage("Não é possível excluir este produto do estoque enquanto houver registros de envio vinculados a ele.");
        return;
      }

      await api.delete(`products/${productToDelete}/`);
      fetchData();
      setProductToDelete(null);
    } catch (error) {
      setErrorMessage("Erro ao excluir o produto. Tente novamente mais tarde.");
      setProductToDelete(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', description: '', category: '', quantity: 0, observations: '' });
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'N/A';
  };

  const filteredProducts = products.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const dateStr = new Date(p.created_at).toLocaleDateString('pt-BR');
    return (
      p.name.toLowerCase().includes(searchLower) ||
      getCategoryName(p.category).toLowerCase().includes(searchLower) ||
      (p.description && p.description.toLowerCase().includes(searchLower)) ||
      (p.observations && p.observations.toLowerCase().includes(searchLower)) ||
      dateStr.includes(searchLower)
    );
  });

  return (
    <div className="relative w-full">
      <header className="mb-6 md:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-color5 dark:text-white">Estoque</h2>
          <p className="text-color5/60 dark:text-color4/60 mt-1.5 text-sm">Gerencie o catálogo e a quantidade de produtos disponíveis.</p>
        </div>
      </header>
      
      <form onSubmit={handleSubmit} className="mb-8 md:mb-12 bg-white dark:bg-slate-900 border border-color4 dark:border-slate-800 p-5 md:p-8 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 transition-colors duration-300">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 dark:text-color4/60 uppercase tracking-widest">Nome do Produto</label>
          <input 
            placeholder="Ex: Roteador Wi-Fi 6" 
            className="w-full p-3 bg-white dark:bg-slate-800 border border-color4 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-white/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all shadow-sm" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            required 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 dark:text-color4/60 uppercase tracking-widest">Categoria</label>
          <select 
            className="w-full p-3 bg-white dark:bg-slate-800 border border-color4 dark:border-slate-700 rounded-xl text-color5 dark:text-white focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all appearance-none shadow-sm truncate" 
            value={form.category} 
            onChange={e => setForm({...form, category: e.target.value})} 
            required
          >
            <option value="">Selecione a Categoria</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 dark:text-color4/60 uppercase tracking-widest">Quantidade</label>
          <input 
            type="number" 
            min="0"
            placeholder="0" 
            className="w-full p-3 bg-white dark:bg-slate-800 border border-color4 dark:border-slate-700 rounded-xl text-color5 dark:text-white focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all shadow-sm" 
            value={form.quantity} 
            onChange={e => {
              const val = e.target.value;
              if (val === '') {
                setForm({...form, quantity: ''});
              } else {
                const num = parseInt(val, 10);
                if (num >= 0) setForm({...form, quantity: num});
              }
            }} 
            required 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 dark:text-color4/60 uppercase tracking-widest">Descrição</label>
          <textarea 
            placeholder="Detalhes técnicos (opcional)" 
            className="w-full p-3 bg-white dark:bg-slate-800 border border-color4 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-white/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all resize-none h-[52px] shadow-sm" 
            value={form.description} 
            onChange={e => setForm({...form, description: e.target.value})} 
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label className="text-[11px] font-bold text-color5/60 dark:text-color4/60 uppercase tracking-widest">Observações</label>
          <textarea 
            placeholder="Notas internas (opcional)" 
            className="w-full p-3 bg-white dark:bg-slate-800 border border-color4 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-white/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all resize-none min-h-[80px] shadow-sm" 
            value={form.observations} 
            onChange={e => setForm({...form, observations: e.target.value})} 
          />
        </div>
        
        <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-color2 to-color3 hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md text-sm">
            {editingId ? 'Salvar Alterações' : 'Adicionar Produto'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="w-full sm:w-auto bg-white dark:bg-slate-800 border border-color4 dark:border-slate-700 text-color5 dark:text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 hover:bg-color1 dark:hover:bg-slate-700 shadow-sm text-sm">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-bold text-color5 dark:text-white">Catálogo de Produtos</h3>
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-color5/40 dark:text-color4/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="Pesquisar no estoque ou datas..." 
            className="w-full sm:w-72 pl-10 p-2.5 bg-white dark:bg-slate-800 border border-color4 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-white/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all shadow-sm text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-color4 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm w-full transition-colors duration-300">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
            <thead>
              <tr className="bg-color1/50 dark:bg-slate-800/50 border-b border-color4 dark:border-slate-800">
                <th className="px-4 md:px-6 py-4 text-[11px] font-bold text-color5/60 dark:text-color4/60 uppercase tracking-widest">Nome</th>
                <th className="px-4 md:px-6 py-4 text-[11px] font-bold text-color5/60 dark:text-color4/60 uppercase tracking-widest">Categoria</th>
                <th className="px-4 md:px-6 py-4 text-[11px] font-bold text-color5/60 dark:text-color4/60 uppercase tracking-widest">Qtd</th>
                <th className="px-4 md:px-6 py-4 text-[11px] font-bold text-color5/60 dark:text-color4/60 uppercase tracking-widest max-w-[200px]">Descrição</th>
                <th className="px-4 md:px-6 py-4 text-[11px] font-bold text-color5/60 dark:text-color4/60 uppercase tracking-widest max-w-[200px]">Observações</th>
                <th className="px-4 md:px-6 py-4 text-[11px] font-bold text-color5/60 dark:text-color4/60 uppercase tracking-widest">Criado em</th>
                <th className="px-4 md:px-6 py-4 text-[11px] font-bold text-color5/60 dark:text-color4/60 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-color4/40 dark:divide-slate-800/80">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-color1 dark:hover:bg-slate-800/50 transition-colors duration-150 group">
                  <td className="px-4 md:px-6 py-4 text-sm font-medium text-color5 dark:text-white">{p.name}</td>
                  <td className="px-4 md:px-6 py-4 text-sm">
                    <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-color4 dark:border-slate-700 text-color5/80 dark:text-color4/80 text-[11px] font-bold tracking-wide uppercase shadow-sm">{getCategoryName(p.category)}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm font-mono font-medium text-color5 dark:text-white">
                    <span className={`px-2.5 py-1 rounded-md ${p.quantity <= 0 ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20' : ''}`}>{p.quantity}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm text-color5/60 dark:text-color4/60 max-w-[200px] truncate" title={p.description}>{p.description || '-'}</td>
                  <td className="px-4 md:px-6 py-4 text-sm text-color5/60 dark:text-color4/60 max-w-[200px] truncate" title={p.observations}>{p.observations || '-'}</td>
                  <td className="px-4 md:px-6 py-4 text-sm text-color5/80 dark:text-color4/80">{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 md:px-6 py-4 text-sm text-right">
                    <button type="button" onClick={() => handleEdit(p)} className="text-color2 dark:text-color3 hover:text-color2/80 font-medium transition-colors mr-3 md:mr-4 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100">
                      Editar
                    </button>
                    <button type="button" onClick={() => setProductToDelete(p.id)} className="text-color5/40 dark:text-color4/40 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 md:px-6 py-12 text-center text-color5/40 dark:text-color4/40 text-sm">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {productToDelete && (
        <div className="fixed inset-0 bg-color5/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-color4 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2 text-color5 dark:text-white tracking-tight">Confirmar Exclusão</h3>
            <p className="text-color5/60 dark:text-color4/60 text-sm leading-relaxed mb-8">Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.</p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button onClick={() => setProductToDelete(null)} className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-slate-800 border border-color4 dark:border-slate-700 text-color5 dark:text-white rounded-xl hover:bg-color1 dark:hover:bg-slate-700 font-medium transition-all duration-200 text-sm shadow-sm">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="w-full sm:w-auto px-5 py-2.5 bg-color5 dark:bg-white text-white dark:text-color5 rounded-xl hover:bg-color5/90 dark:hover:bg-color4 font-medium transition-all duration-200 shadow-md text-sm">
                Excluir Produto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Aviso de Erro/Vinculação */}
      {errorMessage && (
        <div className="fixed inset-0 bg-color5/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-color4 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 tracking-tight">Aviso de Exclusão</h3>
            </div>
            <p className="text-color5/70 dark:text-color4/80 text-sm leading-relaxed mb-8 mt-4 font-medium">{errorMessage}</p>
            <div className="flex justify-end">
              <button onClick={() => setErrorMessage('')} className="w-full sm:w-auto px-6 py-2.5 bg-color5 dark:bg-white text-white dark:text-color5 rounded-xl hover:bg-color5/90 dark:hover:bg-color4 font-medium transition-all duration-200 shadow-md text-sm">
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}