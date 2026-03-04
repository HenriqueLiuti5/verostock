// Dispatch.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dispatch() {
  const [reports, setReports] = useState([]);
  const [products, setProducts] = useState([]);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [form, setForm] = useState({ 
    product: '', 
    router_id: '', 
    serial_number: '', 
    mac_addres: '', 
    client_name: '', 
    date_sent: '' 
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [repRes, prodRes] = await Promise.all([api.get('reports/'), api.get('products/')]);
    setReports(repRes.data);
    setProducts(prodRes.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (file) formData.append('invoice_pdf', file);

    try {
      await api.post('reports/', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      fetchData();
      setForm({ product: '', router_id: '', serial_number: '', mac_addres: '', client_name: '', date_sent: '' });
      setFile(null);
      document.getElementById('fileInput').value = '';
    } catch (error) {
      alert("Erro ao salvar. Verifique se o estoque é suficiente e se os dados estão corretos.");
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`reports/${reportToDelete}/`);
      fetchData();
      setReportToDelete(null);
    } catch (error) {
      alert("Erro ao excluir o relatório.");
      setReportToDelete(null);
    }
  };

  const getProductName = (id) => {
    const prod = products.find(p => p.id === id);
    return prod ? prod.name : 'Produto Excluído/N/A';
  };

  return (
    <div className="relative w-full">
      <header className="mb-10">
        <h2 className="text-2xl font-bold tracking-tight text-color5">Envios</h2>
        <p className="text-color5/60 mt-1.5 text-sm">Gerencie os despachos e notas fiscais de equipamentos.</p>
      </header>
      
      <form onSubmit={handleSubmit} className="mb-12 bg-white border border-color4 p-6 md:p-8 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">Produto</label>
          <select 
            className="w-full p-3 bg-white border border-color4 rounded-xl text-color5 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all appearance-none shadow-sm" 
            value={form.product} 
            onChange={e => setForm({...form, product: e.target.value})} 
            required
          >
            <option value="">Selecione o Produto</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} (Estoque: {p.quantity})</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">Nome do Cliente</label>
          <input 
            placeholder="Ex: João da Silva" 
            className="w-full p-3 bg-white border border-color4 rounded-xl text-color5 placeholder-color5/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all shadow-sm" 
            value={form.client_name} 
            onChange={e => setForm({...form, client_name: e.target.value})} 
            required 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">Router ID</label>
          <input 
            placeholder="Opcional" 
            className="w-full p-3 bg-white border border-color4 rounded-xl text-color5 placeholder-color5/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all shadow-sm" 
            value={form.router_id} 
            onChange={e => setForm({...form, router_id: e.target.value})} 
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
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">MAC Address</label>
          <input 
            placeholder="00:00:00:00:00:00" 
            className="w-full p-3 bg-white border border-color4 rounded-xl text-color5 placeholder-color5/40 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all shadow-sm" 
            value={form.mac_addres} 
            onChange={e => setForm({...form, mac_addres: e.target.value})} 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">Data de Envio</label>
          <input 
            type="date" 
            className="w-full p-3 bg-white border border-color4 rounded-xl text-color5 focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all shadow-sm" 
            value={form.date_sent} 
            onChange={e => setForm({...form, date_sent: e.target.value})} 
            required 
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-[11px] font-bold text-color5/60 uppercase tracking-widest">Nota Fiscal (PDF)</label>
          <input 
            id="fileInput" 
            type="file" 
            accept="application/pdf" 
            className="w-full p-2.5 bg-white border border-color4 rounded-xl text-color5 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:uppercase file:tracking-wider file:bg-color4/40 file:text-color5 hover:file:bg-color4/60 file:transition-colors focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/20 transition-all cursor-pointer shadow-sm" 
            onChange={e => setFile(e.target.files[0])} 
          />
        </div>

        <div className="flex items-end justify-end pt-2">
          <button type="submit" className="w-full md:w-auto bg-gradient-to-r from-color2 to-color3 hover:opacity-90 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md flex items-center justify-center gap-2">
            Registrar Envio
          </button>
        </div>
      </form>

      <div className="bg-white border border-color4 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-color1/50 border-b border-color4">
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest">Produto</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest">Router ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest">Serial</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest">MAC</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest">Data Envio</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest">Nota Fiscal</th>
                <th className="px-6 py-4 text-[11px] font-bold text-color5/60 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-color4/40">
              {reports.map(r => (
                <tr key={r.id} className="hover:bg-color1 transition-colors duration-150 group">
                  <td className="px-6 py-4 text-sm font-medium text-color5">{getProductName(r.product)}</td>
                  <td className="px-6 py-4 text-sm text-color5/80">{r.client_name}</td>
                  <td className="px-6 py-4 text-sm text-color5/50">{r.router_id || '-'}</td>
                  <td className="px-6 py-4 text-sm font-mono text-color5/80">{r.serial_number}</td>
                  <td className="px-6 py-4 text-sm font-mono text-color5/50">{r.mac_addres || '-'}</td>
                  <td className="px-6 py-4 text-sm text-color5/80">{new Date(r.date_sent + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-sm">
                    {r.invoice_pdf ? (
                      <a href={r.invoice_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-color4 text-color5 hover:bg-color1 transition-all font-medium text-xs shadow-sm">
                        Ver PDF
                      </a>
                    ) : (
                      <span className="text-color5/40 italic text-xs">Sem anexo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button type="button" onClick={() => setReportToDelete(r.id)} className="text-color5/40 hover:text-red-500 font-medium transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-color5/40 text-sm">
                    Nenhum envio registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reportToDelete && (
        <div className="fixed inset-0 bg-color5/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-color4 p-8 rounded-2xl shadow-xl max-w-md w-full scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2 text-color5 tracking-tight">Confirmar Exclusão</h3>
            <p className="text-color5/60 text-sm leading-relaxed mb-8">Tem certeza que deseja excluir este envio? O produto retornará ao estoque automaticamente.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setReportToDelete(null)} className="px-5 py-2.5 bg-white border border-color4 text-color5 rounded-xl hover:bg-color1 font-medium transition-all duration-200 text-sm shadow-sm">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="px-5 py-2.5 bg-color5 text-white rounded-xl hover:bg-color5/90 font-medium transition-all duration-200 shadow-md text-sm">
                Excluir Envio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}