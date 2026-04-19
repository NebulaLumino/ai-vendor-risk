'use client';

import { useState } from 'react';

export default function VendorRiskPage() {
  const [vendorDetails, setVendorDetails] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!vendorDetails.trim()) return;
    setLoading(true);
    setError('');
    setReport('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorDetails }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setReport(data.report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-gray-100 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
            🤝 AI Third-Party Vendor Risk Assessment & SLA Compliance Report
          </h1>
          <p className="mt-3 text-gray-400 text-lg">
            Assess vendor security posture, SLA compliance, and generate comprehensive third-party risk reports.
          </p>
        </header>

        <section className="space-y-6 mb-10">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vendor Information (name, services provided, data access level, contract details, SLA terms, prior incidents)
            </label>
            <textarea
              value={vendorDetails}
              onChange={e => setVendorDetails(e.target.value)}
              placeholder="Vendor name, what services do they provide, what data/systems do they access (PII, financial, IP, infrastructure), contract value, SLA terms (uptime, breach notification, data residency), known security incidents, SOC2/ISO27001 certifications, data processing agreements..."
              rows={8}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-none"
            />
          </div>
          <button
            onClick={generate}
            disabled={loading || !vendorDetails.trim()}
            className="px-8 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-violet-500/30"
          >
            {loading ? '🔄 Generating Risk Assessment...' : '⚡ Generate Vendor Risk Report'}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">Error: {error}</p>}
        </section>

        {report && (
          <section className="bg-gray-800/40 border border-gray-700 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-violet-400">📋 Vendor Risk Assessment</h2>
              <button onClick={() => navigator.clipboard.writeText(report)} className="text-sm text-gray-400 hover:text-violet-400 transition-colors">📋 Copy</button>
            </div>
            <pre className="whitespace-pre-wrap text-gray-300 text-sm font-mono leading-relaxed bg-gray-900/60 rounded-xl p-6 border border-gray-700">{report}</pre>
          </section>
        )}
      </div>
    </main>
  );
}
