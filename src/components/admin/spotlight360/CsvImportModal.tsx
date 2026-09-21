import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { SPOTLIGHT_PRESET_LOCATIONS } from './BulkEditModal';
import type { BulkUploadVideoItem, SpotlightRadiusKm } from '../../../types';

interface CsvImportModalProps {
  currentVideos: BulkUploadVideoItem[];
  onClose: () => void;
  onApplyCsvData: (mappedRows: Array<{
    fileName: string;
    title: string;
    description: string;
    locationName: string;
    radiusKm: SpotlightRadiusKm;
    category: string;
    campaignName: string;
    startDate: string;
    endDate: string;
  }>) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  currentVideos,
  onClose,
  onApplyCsvData
}) => {
  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sampleCsvHeader = 'Video Name,Title,Location,Radius,Start Date,End Date,Category,Campaign';
  const sampleRows = [
    'video01.mp4,Ponneri Jewellery Mega Festival,Ponneri,5 km,2026-09-20,2026-09-30,business,Festive Offer 2026',
    'video02.mp4,Minjur Engineering College Admissions,Minjur,3 km,2026-09-21,2026-09-30,community,College Admissions',
    'video03.mp4,Tiruvallur Organic Farm Fresh Veggies,Tiruvallur Town,10 km,2026-09-20,2026-10-05,business,Farm Direct',
    'video04.mp4,Gummidipoondi Industrial Safety Drive,Gummidipoondi,5 km,2026-09-22,2026-10-01,safety,Safety Awareness'
  ].join('\n');

  const handleDownloadSample = () => {
    const csvData = `${sampleCsvHeader}\n${sampleRows}`;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'spotlight360_bulk_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvText = (text: string) => {
    try {
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        setError('CSV must contain at least a header and 1 data row.');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const fnIdx = headers.findIndex((h) => h.includes('video') || h.includes('file'));
      const titleIdx = headers.findIndex((h) => h.includes('title') || h.includes('name'));
      const locIdx = headers.findIndex((h) => h.includes('location') || h.includes('area'));
      const radIdx = headers.findIndex((h) => h.includes('radius'));
      const startIdx = headers.findIndex((h) => h.includes('start'));
      const endIdx = headers.findIndex((h) => h.includes('end'));
      const catIdx = headers.findIndex((h) => h.includes('category'));
      const campIdx = headers.findIndex((h) => h.includes('campaign'));

      const rows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        // Handle comma within quotes if any
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length === 0 || !cols[0]) continue;

        const rowFileName = fnIdx >= 0 ? cols[fnIdx] : `video_${i}.mp4`;
        const rowTitle = titleIdx >= 0 ? cols[titleIdx] : 'Spotlight Video';
        const rowLoc = locIdx >= 0 ? cols[locIdx] : 'Ponneri';
        const rawRadius = radIdx >= 0 ? cols[radIdx] : '5';
        const numRadius = parseInt(rawRadius.replace(/\D/g, ''), 10) || 5;
        const validRadius: SpotlightRadiusKm = (
          [1, 3, 5, 10, 25].includes(numRadius) ? numRadius : 5
        ) as SpotlightRadiusKm;

        const rowStart = startIdx >= 0 ? cols[startIdx] : new Date().toISOString().slice(0, 10);
        const rowEnd = endIdx >= 0 ? cols[endIdx] : new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
        const rowCat = catIdx >= 0 ? cols[catIdx] : 'business';
        const rowCamp = campIdx >= 0 ? cols[campIdx] : 'General Campaign';

        // Check if matched with uploaded video
        const matched = currentVideos.some(
          (v) => v.fileName.toLowerCase() === rowFileName.toLowerCase()
        );

        rows.push({
          fileName: rowFileName,
          title: rowTitle,
          description: `Spotlight360 hyperlocal broadcast for ${rowLoc}.`,
          locationName: rowLoc,
          radiusKm: validRadius,
          startDate: rowStart,
          endDate: rowEnd,
          category: rowCat,
          campaignName: rowCamp,
          isMatched: matched
        });
      }

      setParsedRows(rows);
      setError(null);
    } catch (err: any) {
      setError(`Failed to parse CSV: ${err.message || 'Invalid format'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      parseCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleApply = () => {
    if (parsedRows.length === 0) return;
    onApplyCsvData(parsedRows);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid var(--border-subtle)',
          padding: '24px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                CSV / Excel Bulk Import
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                வீடியோ ஃபைல்களுக்கு தலைப்பு, லொகேஷன் மற்றும் ரேடியஸ் விவரங்களை CSV மூலம் தானாக இணைக்கவும்
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Action bar: Download Sample & Upload Button */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              1. Download CSV Template
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Includes Video Name, Title, Location, Radius, Start Date, End Date columns
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadSample}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: 'var(--brand-primary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={14} />
            <span>Download Sample CSV</span>
          </button>
        </div>

        {/* Upload File Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
            2. Choose or Drop your CSV File:
          </label>
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              border: '2px dashed #cbd5e1',
              borderRadius: '14px',
              background: '#fafafa',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease'
            }}
          >
            <Upload size={28} color="var(--brand-primary)" style={{ marginBottom: '8px' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {fileName ? fileName : 'Click to Browse or Drag & Drop .CSV file'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              Supports comma-separated UTF-8 CSV
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecdd3',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Parsed Rows ({parsedRows.length} found):
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 700 }}>
                {parsedRows.filter((r) => r.isMatched).length} / {parsedRows.length} matched with uploaded video files
              </span>
            </div>

            <div
              style={{
                maxHeight: '220px',
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                background: '#ffffff'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '8px 10px' }}>Video File</th>
                    <th style={{ padding: '8px 10px' }}>Title</th>
                    <th style={{ padding: '8px 10px' }}>Location</th>
                    <th style={{ padding: '8px 10px' }}>Radius</th>
                    <th style={{ padding: '8px 10px' }}>Schedule</th>
                    <th style={{ padding: '8px 10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0284c7' }}>
                        {row.fileName}
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{row.title}</td>
                      <td style={{ padding: '8px 10px' }}>{row.locationName}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700 }}>{row.radiusKm} km</td>
                      <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>
                        {row.startDate} to {row.endDate}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        {row.isMatched ? (
                          <span style={{ color: '#059669', fontWeight: 800 }}>✓ File Ready</span>
                        ) : (
                          <span style={{ color: '#ea580c', fontWeight: 700 }}>Metadata Only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0}
            onClick={handleApply}
            style={{
              padding: '9px 22px',
              borderRadius: '8px',
              background: parsedRows.length > 0 ? 'linear-gradient(90deg, #ff4500, #ea580c)' : '#cbd5e1',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: parsedRows.length > 0 ? 'pointer' : 'not-allowed',
              boxShadow: parsedRows.length > 0 ? '0 4px 14px rgba(255, 69, 0, 0.35)' : 'none'
            }}
          >
            <CheckCircle2 size={16} />
            <span>Apply CSV ({parsedRows.length} Rows)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
