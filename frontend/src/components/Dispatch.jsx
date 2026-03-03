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
    <div className="p-4 relative">
      <h2 className="text-2xl font-bold mb-4">Envios (Dispatch)</h2>
      
      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-3 gap-4 bg-gray-100 p-4 rounded">
        <select className="p-2 border" value={form.product} onChange={e => setForm({...form, product: e.target.value})} required>
          <option value="">Selecione o Produto</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name} (Estoque: {p.quantity})</option>)}
        </select>
        <input placeholder="Nome do Cliente" className="p-2 border" value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} required />
        <input placeholder="Router ID" className="p-2 border" value={form.router_id} onChange={e => setForm({...form, router_id: e.target.value})} />
        <input placeholder="Serial Number" className="p-2 border" value={form.serial_number} onChange={e => setForm({...form, serial_number: e.target.value})} required />
        <input placeholder="MAC Address" className="p-2 border" value={form.mac_addres} onChange={e => setForm({...form, mac_addres: e.target.value})} />
        <input type="date" className="p-2 border" value={form.date_sent} onChange={e => setForm({...form, date_sent: e.target.value})} required />
        <div className="col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Nota Fiscal (PDF)</label>
          <input id="fileInput" type="file" accept="application/pdf" className="p-2 border w-full bg-white" onChange={e => setFile(e.target.files[0])} />
        </div>
        <button type="submit" className="bg-green-600 text-white p-2 rounded self-end">Registrar Envio</button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Produto</th>
              <th className="p-2 border">Cliente</th>
              <th className="p-2 border">Router ID</th>
              <th className="p-2 border">Serial</th>
              <th className="p-2 border">MAC</th>
              <th className="p-2 border">Data Envio</th>
              <th className="p-2 border">Nota Fiscal</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{getProductName(r.product)}</td>
                <td className="p-2 border">{r.client_name}</td>
                <td className="p-2 border">{r.router_id || '-'}</td>
                <td className="p-2 border">{r.serial_number}</td>
                <td className="p-2 border">{r.mac_addres || '-'}</td>
                <td className="p-2 border">{new Date(r.date_sent + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                <td className="p-2 border">
                  {r.invoice_pdf ? (
                    <a href={r.invoice_pdf} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Ver PDF</a>
                  ) : (
                    <span className="text-gray-400">Sem anexo</span>
                  )}
                </td>
                <td className="p-2 border">
                  <button type="button" onClick={() => setReportToDelete(r.id)} className="text-red-500 hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reportToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">Tem certeza que deseja excluir este envio? O produto retornará ao estoque automaticamente.</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setReportToDelete(null)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
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