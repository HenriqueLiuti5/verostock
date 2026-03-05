// Dispatch.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dispatch() {
  const [reports, setReports] = useState([]);
  const [products, setProducts] = useState([]);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

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

    const selectedProduct = products.find(p => p.id.toString() === form.product.toString());
    if (selectedProduct && selectedProduct.quantity <= 0) {
      setErrorMessage("Não é possível realizar o envio. Este produto está com o estoque zerado.");
      return;
    }

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
      setErrorMessage("Erro ao salvar o envio. Verifique os dados fornecidos e tente novamente.");
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`reports/${reportToDelete}/`);
      fetchData();
      setReportToDelete(null);
    } catch (error) {
      setErrorMessage("Erro ao excluir o relatório. Tente novamente mais tarde.");
      setReportToDelete(null);
    }
  };

  const getProductName = (id, report = null) => {
    if (report && report.product_name) return report.product_name; 
    const prod = products.find(p => p.id === id);
    return prod ? prod.name : 'Produto Excluído/N/A';
  };

  const filteredReports = reports.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const rDate = new Date(r.date_sent + 'T00:00:00');
    const start = dateStart ? new Date(dateStart + 'T00:00:00') : null;
    const end = dateEnd ? new Date(dateEnd + 'T23:59:59') : null;

    const matchesSearch = getProductName(r.product, r).toLowerCase().includes(searchLower) ||
      r.client_name.toLowerCase().includes(searchLower) ||
      (r.router_id && r.router_id.toLowerCase().includes(searchLower)) ||
      (r.serial_number && r.serial_number.toLowerCase().includes(searchLower)) ||
      (r.mac_addres && r.mac_addres.toLowerCase().includes(searchLower));

    const matchesDate = (!start || rDate >= start) && (!end || rDate <= end);

    return matchesSearch && matchesDate;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Produto', 'Cliente', 'Router ID', 'Serial', 'MAC', 'Data Envio'];
    const escapeCsv = (str) => '"' + String(str || '').replace(/"/g, '""') + '"';

    const csvContent = [
      headers.join(';'),
      ...filteredReports.map(r => [
        r.id,
        escapeCsv(getProductName(r.product, r)),
        escapeCsv(r.client_name),
        escapeCsv(r.router_id),
        escapeCsv(r.serial_number),
        escapeCsv(r.mac_addres),
        new Date(r.date_sent + 'T00:00:00').toLocaleDateString('pt-BR')
      ].join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'envios.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="relative w-full">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-color5 dark:text-white">Envios</h2>
          <p className="text-color5/60 dark:text-slate-400 mt-1 text-sm">Gerencie os despachos e notas fiscais.</p>
        </div>
        <button onClick={handleExportCSV} type="button" className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-color4/80 dark:border-slate-700 text-color5 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-all duration-200 text-sm shadow-sm shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Exportar CSV
        </button>
      </header>
      
      <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-slate-900 border border-color4/70 dark:border-slate-800 p-4 md:p-5 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 transition-colors duration-300">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Produto</label>
          <select 
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all appearance-none truncate text-sm" 
            value={form.product} 
            onChange={e => setForm({...form, product: e.target.value})} 
            required
          >
            <option value="">Selecione...</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} (Qtd: {p.quantity})</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Cliente</label>
          <input 
            placeholder="Nome do cliente" 
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all text-sm" 
            value={form.client_name} 
            onChange={e => setForm({...form, client_name: e.target.value})} 
            required 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Data</label>
          <input 
            type="date" 
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all text-sm dark:[color-scheme:dark]" 
            value={form.date_sent} 
            onChange={e => setForm({...form, date_sent: e.target.value})} 
            required 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Router ID</label>
          <input 
            placeholder="Opcional" 
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all text-sm" 
            value={form.router_id} 
            onChange={e => setForm({...form, router_id: e.target.value})} 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Serial Number</label>
          <input 
            placeholder="SN do equipamento" 
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all text-sm" 
            value={form.serial_number} 
            onChange={e => setForm({...form, serial_number: e.target.value})} 
            required 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">MAC Address</label>
          <input 
            placeholder="00:00:00:00:00:00" 
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white placeholder-color5/40 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all text-sm" 
            value={form.mac_addres} 
            onChange={e => setForm({...form, mac_addres: e.target.value})} 
          />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Nota Fiscal (PDF)</label>
          <input 
            id="fileInput" 
            type="file" 
            accept="application/pdf" 
            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800/40 border border-color4/60 dark:border-slate-700 rounded-xl text-color5 dark:text-white file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-color4/40 dark:file:bg-slate-700 file:text-color5 dark:file:text-white hover:file:bg-color4/60 dark:hover:file:bg-slate-600 focus:bg-white dark:focus:bg-slate-800 file:transition-colors focus:outline-none focus:border-color2 focus:ring-2 focus:ring-color2/10 transition-all cursor-pointer text-sm" 
            onChange={e => setFile(e.target.files[0])} 
          />
        </div>

        <div className="flex items-end justify-end pt-1 md:col-span-1">
          <button type="submit" className="w-full bg-gradient-to-r from-color2 to-color3 hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md flex items-center justify-center gap-2 text-sm">
            Registrar Envio
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
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Produto</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Router ID</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Serial</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">MAC</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Data Envio</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest">Nota Fiscal</th>
                <th className="px-4 md:px-6 py-3.5 text-[10px] font-bold text-color5/60 dark:text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-color4/40 dark:divide-slate-800/80">
              {filteredReports.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors duration-150 group">
                  <td className="px-4 md:px-6 py-3.5 text-sm font-medium text-color5 dark:text-slate-100">{getProductName(r.product, r)}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-color5/80 dark:text-slate-300">{r.client_name}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-color5/50 dark:text-slate-400">{r.router_id || '-'}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-mono text-color5/80 dark:text-slate-300">{r.serial_number}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-mono text-color5/50 dark:text-slate-400">{r.mac_addres || '-'}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-color5/80 dark:text-slate-300">{new Date(r.date_sent + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm">
                    {r.invoice_pdf ? (
                      <a href={r.invoice_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-color4/80 dark:border-slate-700 text-color5 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium text-xs shadow-sm">
                        Ver PDF
                      </a>
                    ) : (
                      <span className="text-color5/40 dark:text-slate-500 italic text-xs">Sem anexo</span>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-right">
                    <button type="button" onClick={() => setReportToDelete(r.id)} className="text-color5/40 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 md:px-6 py-10 text-center text-color5/40 dark:text-slate-500 text-sm">
                    Nenhum envio encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais omitidos para brevidade */}
      {reportToDelete && (
        <div className="fixed inset-0 bg-color5/20 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-color4/80 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2 text-color5 dark:text-white tracking-tight">Confirmar Exclusão</h3>
            <p className="text-color5/60 dark:text-slate-400 text-sm leading-relaxed mb-8">Tem certeza que deseja excluir este envio? O produto retornará ao estoque automaticamente.</p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button onClick={() => setReportToDelete(null)} className="w-full sm:w-auto px-5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-color4/80 dark:border-slate-700 text-color5 dark:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-all duration-200 text-sm shadow-sm">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="w-full sm:w-auto px-5 py-2.5 bg-color5 dark:bg-white text-white dark:text-color5 rounded-xl hover:bg-color5/90 dark:hover:bg-slate-200 font-medium transition-all duration-200 shadow-md text-sm">
                Excluir Envio
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
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 tracking-tight">Aviso de Envio</h3>
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