// Inventory.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
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
      await api.delete(`products/${productToDelete}/`);
      fetchData();
      setProductToDelete(null);
    } catch (error) {
      alert("Erro ao excluir. O produto pode estar vinculado a um envio.");
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

  return (
    <div className="relative w-full">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-color5">Estoque</h2>
          <p className="text-color5/60 mt-1.5 text-sm">Gerencie o catálogo e a quantidade de produtos disponíveis.</p>
        </div>
      </header>
      
      <form onSubmit={handleSubmit} className="mb-12 bg-white border border-color4 p-6 md:p-8 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 transition-all">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">Nome do Produto</label>
          <input 
            placeholder="Ex: Roteador Wi-Fi 6" 
            className="w-full p-3 bg-white border border-color4 rounded-xl text-color5 placeholder-color5/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all shadow-sm" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            required 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">Categoria</label>
          <select 
            className="w-full p-3 bg-white border border-color4 rounded-xl text-color5 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all appearance-none shadow-sm" 
            value={form.category} 
            onChange={e => setForm({...form, category: e.target.value})} 
            required
          >
            <option value="">Selecione a Categoria</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">Quantidade</label>
          <input 
            type="number" 
            placeholder="0" 
            className="w-full p-3 bg-white border border-color4 rounded-xl text-color5 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all shadow-sm" 
            value={form.quantity} 
            onChange={e => setForm({...form, quantity: e.target.value})} 
            required 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">Descrição</label>
          <textarea 
            placeholder="Detalhes técnicos (opcional)" 
            className="w-full p-3 bg-white border border-color4 rounded-xl text-color5 placeholder-color5/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all resize-none h-[52px] shadow-sm" 
            value={form.description} 
            onChange={e => setForm({...form, description: e.target.value})} 
          />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">Observações</label>
          <textarea 
            placeholder="Notas internas (opcional)" 
            className="w-full p-3 bg-white border border-color4 rounded-xl text-color5 placeholder-color5/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all resize-none min-h-[80px] shadow-sm" 
            value={form.observations} 
            onChange={e => setForm({...form, observations: e.target.value})} 
          />
        </div>
        
        <div className="md:col-span-2 flex items-center gap-3 pt-2">
          <button type="submit" className="bg-gradient-to-r from-color2 to-color3 hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md text-sm">
            {editingId ? 'Salvar Alterações' : 'Adicionar Produto'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-white border border-color4 text-color5 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 hover:bg-color1 shadow-sm text-sm">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="bg-white border border-color4 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-color1/50 border-b border-color4">
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest">Nome</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest">Qtd</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest max-w-[200px]">Descrição</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest max-w-[200px]">Observações</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest">Criado em</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-color4/40">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-color1 transition-colors duration-150 group">
                  <td className="px-6 py-4 text-sm font-medium text-color5">{p.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2.5 py-1 rounded-md bg-white border border-color4 text-color5/80 text-[11px] font-bold tracking-wide uppercase shadow-sm">{getCategoryName(p.category)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono font-medium text-color5">
                    <span className={`px-2.5 py-1 rounded-md ${p.quantity <= 5 ? 'bg-red-50 text-red-600 border border-red-200' : ''}`}>{p.quantity}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-color5/60 max-w-[200px] truncate" title={p.description}>{p.description || '-'}</td>
                  <td className="px-6 py-4 text-sm text-color5/60 max-w-[200px] truncate" title={p.observations}>{p.observations || '-'}</td>
                  <td className="px-6 py-4 text-sm text-color5/80">{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button type="button" onClick={() => handleEdit(p)} className="text-color2 hover:text-color2/80 font-medium transition-colors mr-4 opacity-0 group-hover:opacity-100 focus:opacity-100">
                      Editar
                    </button>
                    <button type="button" onClick={() => setProductToDelete(p.id)} className="text-color5/40 hover:text-red-500 font-medium transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-color5/40 text-sm">
                    Nenhum produto em estoque.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {productToDelete && (
        <div className="fixed inset-0 bg-color5/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-color4 p-8 rounded-2xl shadow-xl max-w-md w-full scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2 text-color5 tracking-tight">Confirmar Exclusão</h3>
            <p className="text-color5/60 text-sm leading-relaxed mb-8">Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita e pode falhar se houver envios vinculados.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setProductToDelete(null)} className="px-5 py-2.5 bg-white border border-color4 text-color5 rounded-xl hover:bg-color1 font-medium transition-all duration-200 text-sm shadow-sm">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="px-5 py-2.5 bg-color5 text-white rounded-xl hover:bg-color5/90 font-medium transition-all duration-200 shadow-md text-sm">
                Excluir Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}