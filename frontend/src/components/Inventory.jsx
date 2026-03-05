// Inventory.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

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
      const repRes = await api.get('reports/').catch(() => ({ data: [] }));
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
    const pDate = new Date(p.created_at);
    const start = dateStart ? new Date(dateStart + 'T00:00:00') : null;
    const end = dateEnd ? new Date(dateEnd + 'T23:59:59') : null;

    const matchesSearch = p.name.toLowerCase().includes(searchLower) ||
      getCategoryName(p.category).toLowerCase().includes(searchLower) ||
      (p.description && p.description.toLowerCase().includes(searchLower)) ||
      (p.observations && p.observations.toLowerCase().includes(searchLower));

    const matchesCategory = filterCategory ? p.category.toString() === filterCategory.toString() : true;
    const matchesDate = (!start || pDate >= start) && (!end || pDate <= end);

    return matchesSearch && matchesCategory && matchesDate;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Nome', 'Categoria', 'Quantidade', 'Descrição', 'Observações', 'Criado em'];
    const escapeCsv = (str) => '"' + String(str || '').replace(/"/g, '""') + '"';
    
    const csvContent = [
      headers.join(';'),
      ...filteredProducts.map(p => [
        p.id,
        escapeCsv(p.name),
        escapeCsv(getCategoryName(p.category)),
        p.quantity,
        escapeCsv(p.description),
        escapeCsv(p.observations),
        new Date(p.created_at).toLocaleDateString('pt-BR')
      ].join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'estoque.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="relative w-full">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-color5 dark:text-white">Estoque</h2>
          <p className="text-color5/60 dark:text-slate-400 mt-1 text-sm">Gerencie o catálogo e a quantidade de produtos disponíveis.</p>
        </div>
        <button onClick={handleExportCSV} type="button" className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-color4/80 dark:border-slate-700 text-color5 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-all duration-200 text-sm shadow-sm shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Exportar CSV
        </button>
      </header>
      
      <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-slate-900 border border-color4/70 dark:border-slate-800 p-4 md:p-5 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 transition-colors duration-300">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Nome do Produto</label>
          <input 
            placeholder="Ex: RUT200" 
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all text-sm" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            required 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Categoria</label>
          <select 
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all appearance-none truncate text-sm" 
            value={form.category} 
            onChange={e => setForm({...form, category: e.target.value})} 
            required
          >
            <option value="">Selecione...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Quantidade</label>
          <input 
            type="number" 
            min="0"
            placeholder="0" 
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all text-sm" 
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

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Descrição</label>
          <textarea 
            placeholder="Detalhes técnicos (opcional)" 
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all resize-none h-[38px] min-h-[38px] text-sm" 
            value={form.description} 
            onChange={e => setForm({...form, description: e.target.value})} 
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-3">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Observações</label>
          <textarea 
            placeholder="Notas internas (opcional)" 
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all resize-none h-[50px] min-h-[50px] text-sm" 
            value={form.observations} 
            onChange={e => setForm({...form, observations: e.target.value})} 
          />
        </div>
        
        <div className="sm:col-span-2 md:col-span-3 flex flex-col sm:flex-row items-center justify-end gap-3 pt-1">
          {editingId && (
            <button type="button" onClick={resetForm} className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 border border-color4/60 dark:border-slate-700 text-color5 dark:text-white px-5 py-2 rounded-xl font-medium transition-all duration-200 text-sm shadow-sm">
              Cancelar
            </button>
          )}
          <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-color2 to-color3 hover:opacity-90 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-md text-sm">
            {editingId ? 'Salvar Alterações' : 'Adicionar Produto'}
          </button>
        </div>
      </form>

      {/* Barra de Filtros */}
      <div className="mb-4 bg-white dark:bg-slate-900 border border-color4/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center transition-colors duration-300">
        <div className="relative w-full lg:w-1/3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-color5/40 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            className="w-full pl-10 px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-slate-500 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
          <select 
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all appearance-none text-sm w-full sm:w-40"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">Todas Categorias</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input 
              type="date" 
              title="Data Inicial"
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all text-sm dark:[color-scheme:dark]"
              value={dateStart}
              onChange={e => setDateStart(e.target.value)}
            />
            <span className="text-color5/40 dark:text-slate-500 text-sm">até</span>
            <input 
              type="date" 
              title="Data Final"
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all text-sm dark:[color-scheme:dark]"
              value={dateEnd}
              onChange={e => setDateEnd(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-color4/70 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm w-full transition-colors duration-300">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-color4/60 dark:border-slate-800">
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Nome</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Categoria</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Qtd</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest max-w-[200px]">Descrição</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest max-w-[200px]">Observações</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Criado em</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-color4/40 dark:divide-slate-800/80">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors duration-150 group">
                  <td className="px-4 md:px-6 py-3.5 text-sm font-medium text-color5 dark:text-slate-100">{p.name}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm">
                    <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-color4 dark:border-slate-700 text-color5/80 dark:text-slate-300 text-[10px] font-bold tracking-wide uppercase shadow-sm">{getCategoryName(p.category)}</span>
                  </td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-mono font-medium text-color5 dark:text-slate-100">
                    <span className={`px-2.5 py-1 rounded-md ${p.quantity <= 0 ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20' : ''}`}>{p.quantity}</span>
                  </td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-color5/60 dark:text-slate-400 max-w-[200px] truncate" title={p.description}>{p.description || '-'}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-color5/60 dark:text-slate-400 max-w-[200px] truncate" title={p.observations}>{p.observations || '-'}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-color5/80 dark:text-slate-300">{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-right">
                    <button type="button" onClick={() => handleEdit(p)} className="text-color2 dark:text-color3 hover:text-color2/80 font-medium transition-colors mr-3 md:mr-4 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100">
                      Editar
                    </button>
                    <button type="button" onClick={() => setProductToDelete(p.id)} className="text-color5/40 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 md:px-6 py-10 text-center text-color5/40 dark:text-slate-500 text-sm">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais omitidos para brevidade (mantém o mesmo que você já tem) */}
      {productToDelete && (
        <div className="fixed inset-0 bg-color5/20 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-color4/80 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2 text-color5 dark:text-white tracking-tight">Confirmar Exclusão</h3>
            <p className="text-color5/60 dark:text-slate-400 text-sm leading-relaxed mb-8">Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.</p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button onClick={() => setProductToDelete(null)} className="w-full sm:w-auto px-5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-color4/80 dark:border-slate-700 text-color5 dark:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-all duration-200 text-sm shadow-sm">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="w-full sm:w-auto px-5 py-2.5 bg-color5 dark:bg-white text-white dark:text-color5 rounded-xl hover:bg-color5/90 dark:hover:bg-slate-200 font-medium transition-all duration-200 shadow-md text-sm">
                Excluir Produto
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="fixed inset-0 bg-color5/20 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-color4/80 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 tracking-tight">Aviso de Exclusão</h3>
            </div>
            <p className="text-color5/70 dark:text-slate-300 text-sm leading-relaxed mb-8 mt-4 font-medium">{errorMessage}</p>
            <div className="flex justify-end">
              <button onClick={() => setErrorMessage('')} className="w-full sm:w-auto px-6 py-2.5 bg-color5 dark:bg-white text-white dark:text-color5 rounded-xl hover:bg-color5/90 dark:hover:bg-slate-200 font-medium transition-all duration-200 shadow-md text-sm">
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}