// Support.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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

  const handleExportCSV = async () => {
    try {
      const response = await api.get('support-tickets/export_csv/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'suporte.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setErrorMessage("Erro ao exportar CSV.");
    }
  };

  const filteredTickets = tickets.filter(t => {
    const searchLower = searchTerm.toLowerCase();
    const dateStr = new Date(t.support_at).toLocaleDateString('pt-BR');
    return (
      t.product_name.toLowerCase().includes(searchLower) ||
      t.serial_number.toLowerCase().includes(searchLower) ||
      (t.problem_description && t.problem_description.toLowerCase().includes(searchLower)) ||
      (t.fix_action && t.fix_action.toLowerCase().includes(searchLower)) ||
      t.status.toLowerCase().includes(searchLower) ||
      dateStr.includes(searchLower)
    );
  });

  return (
    <div className="relative w-full">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-color5 dark:text-white">Suporte Técnico</h2>
          <p className="text-color5/60 dark:text-slate-400 mt-1 text-sm">Registro de manutenções e diagnósticos.</p>
        </div>
        <button onClick={handleExportCSV} type="button" className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-color4/80 dark:border-slate-700 text-color5 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-all duration-200 text-sm shadow-sm shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Exportar CSV
        </button>
      </header>
      
      <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-slate-900 border border-color4/70 dark:border-slate-800 p-4 md:p-5 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 transition-colors duration-300">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Produto/Modelo</label>
          <input 
            placeholder="Ex: VRV-150" 
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all shadow-sm text-sm" 
            value={form.product_name} 
            onChange={e => setForm({...form, product_name: e.target.value})} 
            required 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Serial Number</label>
          <input 
            placeholder="SN do equipamento" 
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all shadow-sm text-sm" 
            value={form.serial_number} 
            onChange={e => setForm({...form, serial_number: e.target.value})} 
            required 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Descrição do Problema</label>
          <textarea 
            placeholder="Relato do defeito" 
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all resize-none min-h-[60px] shadow-sm text-sm" 
            value={form.problem_description} 
            onChange={e => setForm({...form, problem_description: e.target.value})} 
            required 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Ação de Correção</label>
          <textarea 
            placeholder="O que foi feito" 
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all resize-none min-h-[60px] shadow-sm text-sm" 
            value={form.fix_action} 
            onChange={e => setForm({...form, fix_action: e.target.value})} 
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Status</label>
          <select 
            className="w-full sm:w-1/2 px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all appearance-none shadow-sm text-sm" 
            value={form.status} 
            onChange={e => setForm({...form, status: e.target.value})} 
            required
          >
            <option value="PENDENTE">Pendente</option>
            <option value="CORRIGIDO">Corrigido</option>
            <option value="CONDENADO">Condenado</option>
          </select>
        </div>
        
        <div className="sm:col-span-2 flex flex-col sm:flex-row items-center justify-end gap-3 pt-1">
          {editingId && (
            <button type="button" onClick={resetForm} className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 border border-color4/60 dark:border-slate-700 text-color5 dark:text-white px-5 py-2 rounded-xl font-medium transition-all duration-200 text-sm shadow-sm">
              Cancelar
            </button>
          )}
          <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-color2 to-color3 hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md text-sm">
            {editingId ? 'Salvar Alterações' : 'Registrar Chamado'}
          </button>
        </div>
      </form>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-bold text-color5 dark:text-white">Chamados Registrados</h3>
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-color5/40 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="Pesquisar chamados ou datas..." 
            className="w-full sm:w-72 pl-10 px-3 py-2 bg-white dark:bg-slate-900 border border-color4/80 dark:border-slate-800 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-slate-500 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all shadow-sm text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-color4/70 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm w-full transition-colors duration-300">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-color4/60 dark:border-slate-800">
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Produto</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Serial</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest max-w-[200px]">Problema</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest max-w-[200px]">Correção</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-color4/40 dark:divide-slate-800/80">
              {filteredTickets.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors duration-150 group">
                  <td className="px-4 md:px-6 py-3.5 text-sm font-medium text-color5 dark:text-slate-100">{t.product_name}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-mono text-color5/80 dark:text-slate-300">{t.serial_number}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-color5/60 dark:text-slate-400 max-w-[200px] truncate" title={t.problem_description}>{t.problem_description}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-color5/60 dark:text-slate-400 max-w-[200px] truncate" title={t.fix_action}>{t.fix_action || '-'}</td>
                  <td className="px-4 md:px-6 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${t.status === 'CORRIGIDO' ? 'bg-color2/10 dark:bg-color2/20 text-color2 dark:text-color3 border-color2/30' : t.status === 'CONDENADO' ? 'bg-color5 dark:bg-red-500/20 text-white dark:text-red-400 border-color5 dark:border-red-500/30' : 'bg-white dark:bg-slate-800 text-color5/70 dark:text-slate-400 border-color4/80 dark:border-slate-700 shadow-sm'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-color5/80 dark:text-slate-300">{new Date(t.support_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-right">
                    <button type="button" onClick={() => handleEdit(t)} className="text-color2 dark:text-color3 hover:text-color2/80 font-medium transition-colors mr-3 md:mr-4 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100">
                      Editar
                    </button>
                    <button type="button" onClick={() => setTicketToDelete(t.id)} className="text-color5/40 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 md:px-6 py-10 text-center text-color5/40 dark:text-slate-500 text-sm">
                    Nenhum chamado encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {ticketToDelete && (
        <div className="fixed inset-0 bg-color5/20 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-color4/80 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2 text-color5 dark:text-white tracking-tight">Confirmar Exclusão</h3>
            <p className="text-color5/60 dark:text-slate-400 text-sm leading-relaxed mb-8">Tem certeza que deseja excluir este chamado de suporte? Esta ação não pode ser desfeita.</p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button onClick={() => setTicketToDelete(null)} className="w-full sm:w-auto px-5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-color4/80 dark:border-slate-700 text-color5 dark:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-all duration-200 text-sm shadow-sm">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="w-full sm:w-auto px-5 py-2.5 bg-color5 dark:bg-white text-white dark:text-color5 rounded-xl hover:bg-color5/90 dark:hover:bg-slate-200 font-medium transition-all duration-200 shadow-md text-sm">
                Excluir Chamado
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
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 tracking-tight">Aviso de Erro</h3>
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