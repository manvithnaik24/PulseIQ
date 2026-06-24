import React from 'react'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
import { motion } from 'framer-motion'
import { FileText, Eye, Trash2, Calendar, HardDrive, Shield, Sparkles } from 'lucide-react'

export default function ReportHistory({ 
  reports, 
  deleteReport,
  setActiveReportId,
  setActiveTab
}) {
  const handleViewFile = (url) => {
    if (!url) return
    // Ensure relative urls point to local backend port 8000
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
    window.open(fullUrl, '_blank')
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Medical Reports Vault & History
            </h3>
            <p className="text-xs text-slate-400 font-medium">Browse, review, and manage your uploaded medical records in a secure, HIPAA-compliant history vault.</p>
          </div>
          <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl flex items-center gap-2 border border-slate-100/60 self-start sm:self-auto">
            <HardDrive className="w-4 h-4 text-slate-400" />
            <span>Total Reports: <strong className="text-slate-800 font-black">{reports.length}</strong></span>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto border border-dashed border-slate-200">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">No Records Uploaded Yet</h4>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                Your secure history vault is currently empty. Head over to the **Reports Simplifier** tab to upload your first medical PDF or image.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">File Name</th>
                  <th className="py-4 px-6">Report Type</th>
                  <th className="py-4 px-6">Upload Date</th>
                  <th className="py-4 px-6">File Size</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 max-w-xs sm:max-w-md truncate">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-bold text-slate-800 truncate" title={report.title}>{report.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                        {report.type || "General / Other"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-450">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{report.date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-450">
                      {report.size}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => {
                            setActiveReportId(report.id)
                            setActiveTab('analysis_results')
                          }}
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/10 rounded-xl transition-all font-bold flex items-center gap-1 cursor-pointer"
                          title="View Clinical AI Report Analysis"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <span>View Analysis</span>
                        </button>
                        <button
                          onClick={() => handleViewFile(report.file_path)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-primary border border-slate-200 rounded-xl transition-all font-bold flex items-center gap-1 cursor-pointer"
                          title="View Source Report File"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Report</span>
                        </button>
                        <button
                          onClick={(e) => deleteReport(report.id, e)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  )
}
