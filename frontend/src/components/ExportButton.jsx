import React from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ExportButton = ({ title, columns, data, filename = 'military_asset_report' }) => {
  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const header = columns.map(col => col.header).join(',');
    const rows = data.map(item => {
      return columns.map(col => {
        let val = col.accessor(item);
        if (typeof val === 'string') {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (!data || data.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`MILITARY ASSET MANAGEMENT SYSTEM - ${title.toUpperCase()}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toUTCString()} | Clearance: CONFIDENTIAL / OFFICIAL USE`, 14, 28);

    const tableHeaders = columns.map(col => col.header);
    const tableRows = data.map(item => columns.map(col => String(col.accessor(item) || '')));

    doc.autoTable({
      head: [tableHeaders],
      body: tableRows,
      startY: 34,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [56, 189, 248] },
      styles: { fontSize: 8 },
    });

    doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button onClick={exportCSV} className="btn-tactical btn-secondary" style={{ padding: '8px 12px', fontSize: '0.78rem' }}>
        <FileSpreadsheet size={14} color="#10b981" /> Export CSV
      </button>
      <button onClick={exportPDF} className="btn-tactical btn-secondary" style={{ padding: '8px 12px', fontSize: '0.78rem' }}>
        <FileText size={14} color="#38bdf8" /> Export PDF
      </button>
    </div>
  );
};

export default ExportButton;
