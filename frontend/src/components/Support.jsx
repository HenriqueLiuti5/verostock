// Support.jsx
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
    <div className="relative w-full">
      <header className="mb-10">
        <h2 className="text-2xl font-bold tracking-tight text-color5">Suporte Técnico</h2>
        <p className="text-color5/60 mt-1.5 text-sm">Registro de manutenções, defeitos e diagnósticos.</p>
      </header>
      
      <form onSubmit={handleSubmit} className="mb-12 bg-white border border-color4 p-6 md:p-8 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 transition-all">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">Produto/Modelo</label>
          <input 
            placeholder="Ex: ONU GPON" 
            className="w-full p-3 bg-white border border-color4 rounded-xl text-color5 placeholder-color5/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all shadow-sm" 
            value={form.product_name} 
            onChange={e => setForm({...form, product_name: e.target.value})} 
            required 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">Serial Number</label>
          <input 
            placeholder="SN do equipamento" 
            className="w-full p-3 bg-white border border-color4 rounded-xl text-color5 placeholder-color5/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all shadow-sm" 
            value={form.serial_number} 
            onChange={e => setForm({...form, serial_number: e.target.value})} 
            required 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">Descrição do Problema</label>
          <textarea 
            placeholder="Relato do defeito" 
            className="w-full p-3 bg-white border border-color4 rounded-xl text-color5 placeholder-color5/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all resize-none min-h-[80px] shadow-sm" 
            value={form.problem_description} 
            onChange={e => setForm({...form, problem_description: e.target.value})} 
            required 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">Ação de Correção</label>
          <textarea 
            placeholder="O que foi feito (opcional)" 
            className="w-full p-3 bg-white border border-color4 rounded-xl text-color5 placeholder-color5/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all resize-none min-h-[80px] shadow-sm" 
            value={form.fix_action} 
            onChange={e => setForm({...form, fix_action: e.target.value})} 
          />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">Status</label>
          <select 
            className="w-full md:w-1/2 p-3 bg-white border border-color4 rounded-xl text-color5 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all appearance-none shadow-sm" 
            value={form.status} 
            onChange={e => setForm({...form, status: e.target.value})} 
            required
          >
            <option value="PENDENTE">Pendente</option>
            <option value="CORRIGIDO">Corrigido</option>
            <option value="CONDENADO">Condenado</option>
          </select>
        </div>
        
        <div className="md:col-span-2 flex items-center gap-3 pt-2">
          <button type="submit" className="bg-gradient-to-r from-color2 to-color3 hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md text-sm">
            {editingId ? 'Salvar Alterações' : 'Registrar Chamado'}
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
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest">Produto</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest">Serial</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest max-w-[200px]">Problema</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest max-w-[200px]">Correção</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest">Data</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-color4/40">
              {tickets.map(t => (
                <tr key={t.id} className="hover:bg-color1 transition-colors duration-150 group">
                  <td className="px-6 py-4 text-sm font-medium text-color5">{t.product_name}</td>
                  <td className="px-6 py-4 text-sm font-mono text-color5/80">{t.serial_number}</td>
                  <td className="px-6 py-4 text-sm text-color5/60 max-w-[200px] truncate" title={t.problem_description}>{t.problem_description}</td>
                  <td className="px-6 py-4 text-sm text-color5/60 max-w-[200px] truncate" title={t.fix_action}>{t.fix_action || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${t.status === 'CORRIGIDO' ? 'bg-color2/10 text-color2 border-color2/30' : t.status === 'CONDENADO' ? 'bg-color5 text-white border-color5' : 'bg-white text-color5/70 border-color4 shadow-sm'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-color5/80">{new Date(t.support_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button type="button" onClick={() => handleEdit(t)} className="text-color2 hover:text-color2/80 font-medium transition-colors mr-4 opacity-0 group-hover:opacity-100 focus:opacity-100">
                      Editar
                    </button>
                    <button type="button" onClick={() => setTicketToDelete(t.id)} className="text-color5/40 hover:text-red-500 font-medium transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-color5/40 text-sm">
                    Nenhum chamado de suporte registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {ticketToDelete && (
        <div className="fixed inset-0 bg-color5/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-color4 p-8 rounded-2xl shadow-xl max-w-md w-full scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2 text-color5 tracking-tight">Confirmar Exclusão</h3>
            <p className="text-color5/60 text-sm leading-relaxed mb-8">Tem certeza que deseja excluir este chamado de suporte? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setTicketToDelete(null)} className="px-5 py-2.5 bg-white border border-color4 text-color5 rounded-xl hover:bg-color1 font-medium transition-all duration-200 text-sm shadow-sm">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="px-5 py-2.5 bg-color5 text-white rounded-xl hover:bg-color5/90 font-medium transition-all duration-200 shadow-md text-sm">
                Excluir Chamado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}