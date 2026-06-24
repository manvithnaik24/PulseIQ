import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Compass, 
  RefreshCw, 
  ExternalLink,
  Loader2,
  Calendar,
  Layers,
  Activity,
  Award,
  Sparkles,
  Info,
  Download
} from 'lucide-react'

export default function AnalysisResults({
  reports,
  activeReportId,
  reanalyzeReport,
  getToken
}) {
  const [reanalyzing, setReanalyzing] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [downloadingOriginal, setDownloadingOriginal] = useState(false)
  const [errorText, setErrorText] = useState(null)

  const activeReport = reports.find(r => r.id === activeReportId) || reports[0]

  const handleReanalyze = async () => {
    if (!activeReport) return
    setReanalyzing(true)
    setErrorText(null)
    try {
      await reanalyzeReport(activeReport.id, activeReport.extracted_text || `Report contents for ${activeReport.title}`)
    } catch (err) {
      setErrorText(err.message || "Failed to complete AI report re-analysis. Please try again.")
    } finally {
      setReanalyzing(false)
    }
  }

  const handleViewFile = (url) => {
    if (!url) return
    const fullUrl = url.startsWith('http') ? url : `http://localhost:8000${url}`
    window.open(fullUrl, '_blank')
  }

  const handleDownloadSummary = async () => {
    if (!activeReport) return
    setDownloadingPdf(true)
    setErrorText(null)
    try {
      const token = await getToken()
      const response = await fetch(`http://localhost:8000/api/v1/reports/${activeReport.id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error("Failed to compile and download PDF summary.")
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const name = activeReport.title.replace(/\.[^/.]+$/, "") // strip extension
      a.download = `AI_Summary_${name.replace(/\s+/g, "_")}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setErrorText(err.message || "Failed to download PDF summary report.")
    } finally {
      setDownloadingPdf(false)
    }
  }

  const handleDownloadOriginal = async () => {
    if (!activeReport || !activeReport.file_path) return
    setDownloadingOriginal(true)
    setErrorText(null)
    try {
      const fullUrl = activeReport.file_path.startsWith('http') 
        ? activeReport.file_path 
        : `http://localhost:8000${activeReport.file_path}`
      
      const response = await fetch(fullUrl)
      if (!response.ok) throw new Error("Could not fetch original file data.")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = activeReport.title
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      // Fallback to opening in a new tab if fetch is blocked
      const fullUrl = activeReport.file_path.startsWith('http') 
        ? activeReport.file_path 
        : `http://localhost:8000${activeReport.file_path}`
      window.open(fullUrl, '_blank')
    } finally {
      setDownloadingOriginal(false)
    }
  }

  if (!activeReport) {
    return (
      <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl p-16 border border-slate-100 border-dashed shadow-sm flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <FileText className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1.5 max-w-sm mx-auto">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">No Report Selected</h4>
          <p className="text-[11px] text-slate-450 font-semibold leading-relaxed">
            Please navigate to the **Reports Simplifier** tab to upload a new clinical record, or choose a record from your **Report History** vault to examine the AI analysis details.
          </p>
        </div>
      </div>
    )
  }

  // Map risk level aesthetics
  const getRiskAesthetics = (level) => {
    const l = (level || '').toLowerCase()
    if (l.includes('high') || l.includes('crit')) {
      return {
        label: 'High Risk',
        color: 'text-rose-600 border-rose-100 bg-rose-50/60',
        badge: 'bg-rose-500 text-white',
        text: 'AI analysis suggests clinically significant out-of-range markers. Telehealth consultation is highly recommended.',
        icon: <ShieldAlert className="w-5 h-5 text-rose-500" />
      }
    }
    if (l.includes('medium') || l.includes('mod')) {
      return {
        label: 'Moderate Risk',
        color: 'text-amber-600 border-amber-100 bg-amber-50/60',
        badge: 'bg-amber-500 text-white',
        text: 'AI analysis indicates minor biomarkers slightly out of optimal bounds. Keep tracking and discuss during your next review.',
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />
      }
    }
    return {
      label: 'Low Risk',
      color: 'text-emerald-650 border-emerald-100 bg-emerald-50/60',
      badge: 'bg-emerald-500 text-white',
      text: 'Biometric records correspond to stable and healthy thresholds. Maintain current nutrition and lifestyle guidelines.',
      icon: <CheckCircle className="w-5 h-5 text-emerald-550" />
    }
  }

  const riskAesthetics = getRiskAesthetics(activeReport.risk)

  return (
    <motion.div 
      className="space-y-8 text-left"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header Info Block */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-primary/10 text-primary border border-primary/10 font-extrabold uppercase">
              Clinical Report Analysis
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-slate-50 text-slate-500 border border-slate-100 font-bold">
              {activeReport.size}
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">{activeReport.title}</h2>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-300" />
              <span>Uploaded: <strong className="text-slate-650">{activeReport.date}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-300" />
              <span>Category: <strong className="text-primary font-bold uppercase">{activeReport.type || 'Other'}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={handleDownloadOriginal}
            disabled={reanalyzing || downloadingPdf || downloadingOriginal}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
          >
            {downloadingOriginal ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            <span>Download Original Report</span>
          </button>
          
          <button
            onClick={handleDownloadSummary}
            disabled={reanalyzing || downloadingPdf || downloadingOriginal}
            className="px-4 py-2.5 bg-primary/10 border border-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
          >
            {downloadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Download className="w-4 h-4 text-primary" />
            )}
            <span>Download AI Summary PDF</span>
          </button>
          
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing || downloadingPdf || downloadingOriginal}
            className="px-4 py-2.5 bg-primary text-white hover:bg-primary-hover font-bold rounded-xl transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
          >
            {reanalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Re-run AI Analysis</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {reanalyzing ? (
          <motion.div
            key="loading-skeleton"
            className="bg-white rounded-3xl p-12 sm:p-16 border border-slate-100 shadow-sm text-center space-y-6"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Clinical AI Processing</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Examining report biomarkers, checking reference bounds, and translating medical jargon to plain language...
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analysis-cards"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Left Side (col-span-8): Summary & Findings & Abnormal Values */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Error Banner */}
              {errorText && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-xs text-rose-600">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Re-analysis Error</p>
                    <p className="opacity-90 mt-0.5">{errorText}</p>
                    <button 
                      onClick={handleReanalyze}
                      className="mt-2 text-rose-700 underline font-bold hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 animate-spin" /> Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Health Summary Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
                <p className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-primary" /> Health Summary Translation
                </p>
                <div className="text-xs text-slate-650 font-semibold leading-relaxed space-y-2">
                  <p className="whitespace-pre-line">{activeReport.simplified || "AI analysis pending review."}</p>
                </div>
                {activeReport.provider && activeReport.provider !== "General Evaluation" && (
                  <div className="pt-3 border-t border-slate-50 flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                    <Award className="w-3.5 h-3.5 text-slate-450" />
                    <span>Report Source: <strong>{activeReport.provider}</strong></span>
                  </div>
                )}
              </div>

              {/* Abnormal Values Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
                <p className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Detected Abnormal Biomarkers
                </p>
                {(!activeReport.abnormal_values || activeReport.abnormal_values.length === 0) ? (
                  <div className="py-4 text-center space-y-2">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-4.5 h-4.5" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold">No critical or abnormal outliers flagged in this report.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeReport.abnormal_values.map((val, idx) => (
                      <div 
                        key={idx} 
                        className="p-3.5 bg-rose-50/40 border border-rose-100/60 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 font-bold"
                      >
                        <ShieldAlert className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Important Findings Checklist */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
                <p className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" /> Key Diagnostic Findings
                </p>
                {(!activeReport.findings || activeReport.findings.length === 0) ? (
                  <p className="text-xs text-slate-400 font-medium py-2">No key findings logged for this report.</p>
                ) : (
                  <ul className="space-y-3.5 text-xs font-semibold text-slate-650">
                    {activeReport.findings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                        <span className="leading-relaxed">{finding}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>

            {/* Right Side (col-span-4): Risk Level & Recommendations */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Risk Level Panel */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
                <p className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest border-b border-slate-50 pb-2">Clinical Risk Assessment</p>
                <div className={`p-4 rounded-2xl border ${riskAesthetics.color} space-y-3`}>
                  <div className="flex items-center gap-2.5">
                    {riskAesthetics.icon}
                    <span className="text-xs font-extrabold uppercase tracking-wider">{riskAesthetics.label}</span>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed opacity-90">{riskAesthetics.text}</p>
                </div>
              </div>

              {/* Recommendations Checklist */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
                <p className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest border-b border-slate-50 pb-2">Recommended Next Actions</p>
                {(!activeReport.actions || activeReport.actions.length === 0) ? (
                  <p className="text-xs text-slate-400 font-medium py-2">No clinical recommendations generated.</p>
                ) : (
                  <div className="space-y-3.5">
                    {activeReport.actions.map((act, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                        <CheckCircle className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700 font-bold leading-normal">{act}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Compliance Note */}
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-2.5 text-[10px] text-slate-400 text-left">
                <Info className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed">
                  <strong>PulseIQ Disclaimer:</strong> Clinical AI analyses are automatically compiled guidelines designed to simplify patient documentation. They do not constitute formal medical diagnoses or bypass physician consultations.
                </p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
