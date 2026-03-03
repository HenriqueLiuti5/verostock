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
    <div className="p-4 relative">
      <h2 className="text-2xl font-bold mb-4">Estoque</h2>
      
      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded">
        <input placeholder="Nome" className="p-2 border" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <select className="p-2 border" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
          <option value="">Selecione a Categoria</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" placeholder="Quantidade" className="p-2 border" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
        <textarea placeholder="Descrição" className="p-2 border" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <textarea placeholder="Observações" className="p-2 border col-span-2" value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} />
        
        <div className="col-span-2 flex gap-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {editingId ? 'Atualizar Produto' : 'Adicionar Produto'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">Categoria</th>
              <th className="p-2 border">Qtd</th>
              <th className="p-2 border max-w-xs">Descrição</th>
              <th className="p-2 border max-w-xs">Observações</th>
              <th className="p-2 border">Criado em</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{p.id}</td>
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border">{getCategoryName(p.category)}</td>
                <td className="p-2 border">{p.quantity}</td>
                <td className="p-2 border max-w-xs truncate" title={p.description}>{p.description}</td>
                <td className="p-2 border max-w-xs truncate" title={p.observations}>{p.observations}</td>
                <td className="p-2 border">{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="p-2 border">
                  <button type="button" onClick={() => handleEdit(p)} className="text-blue-500 mr-4 hover:underline">Editar</button>
                  <button type="button" onClick={() => setProductToDelete(p.id)} className="text-red-500 hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setProductToDelete(null)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}