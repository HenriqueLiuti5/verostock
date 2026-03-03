import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [form, setForm] = useState({ 
    product_name: '', 
    serial_number: '', 
    problem_description: '', 
    fix_action: '', 
    status: 'PENDENTE' 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await api.get('support-tickets/');
    setTickets(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`support-tickets/${editingId}/`, form);
    } else {
      await api.post('support-tickets/', form);
    }
    fetchData();
    resetForm();
  };

  const handleEdit = (ticket) => {
    setEditingId(ticket.id);
    setForm({
      product_name: ticket.product_name,
      serial_number: ticket.serial_number,
      problem_description: ticket.problem_description || '',
      fix_action: ticket.fix_action || '',
      status: ticket.status || 'PENDENTE'
    });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`support-tickets/${ticketToDelete}/`);
      fetchData();
      setTicketToDelete(null);
    } catch (error) {
      alert("Erro ao excluir o chamado.");
      setTicketToDelete(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ product_name: '', serial_number: '', problem_description: '', fix_action: '', status: 'PENDENTE' });
  };

  return (
    <div className="p-4 relative">
      <h2 className="text-2xl font-bold mb-4">Suporte</h2>
      
      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded">
        <input placeholder="Produto/Modelo" className="p-2 border" value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} required />
        <input placeholder="Serial Number" className="p-2 border" value={form.serial_number} onChange={e => setForm({...form, serial_number: e.target.value})} required />
        <textarea placeholder="Descrição do Problema" className="p-2 border" value={form.problem_description} onChange={e => setForm({...form, problem_description: e.target.value})} required />
        <textarea placeholder="Ação de Correção" className="p-2 border" value={form.fix_action} onChange={e => setForm({...form, fix_action: e.target.value})} />
        <select className="p-2 border col-span-2" value={form.status} onChange={e => setForm({...form, status: e.target.value})} required>
          <option value="PENDENTE">Pendente</option>
          <option value="CORRIGIDO">Corrigido</option>
          <option value="CONDENADO">Condenado</option>
        </select>
        
        <div className="col-span-2 flex gap-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {editingId ? 'Atualizar Suporte' : 'Registrar Suporte'}
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
              <th className="p-2 border">Produto</th>
              <th className="p-2 border">Serial</th>
              <th className="p-2 border max-w-xs">Problema</th>
              <th className="p-2 border max-w-xs">Correção</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Data</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{t.product_name}</td>
                <td className="p-2 border">{t.serial_number}</td>
                <td className="p-2 border max-w-xs truncate" title={t.problem_description}>{t.problem_description}</td>
                <td className="p-2 border max-w-xs truncate" title={t.fix_action}>{t.fix_action}</td>
                <td className="p-2 border font-semibold">
                  <span className={`px-2 py-1 rounded text-sm ${t.status === 'CORRIGIDO' ? 'bg-green-100 text-green-800' : t.status === 'CONDENADO' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="p-2 border">{new Date(t.support_at).toLocaleDateString('pt-BR')}</td>
                <td className="p-2 border">
                  <button type="button" onClick={() => handleEdit(t)} className="text-blue-500 mr-4 hover:underline">Editar</button>
                  <button type="button" onClick={() => setTicketToDelete(t.id)} className="text-red-500 hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ticketToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">Tem certeza que deseja excluir este chamado de suporte? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setTicketToDelete(null)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
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