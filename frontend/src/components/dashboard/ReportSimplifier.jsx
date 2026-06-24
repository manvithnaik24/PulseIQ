import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Printer, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Loader2, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react'

export default function ReportSimplifier({
  reports,
  setReports,
  activeReportId,
  setActiveReportId,
  uploadingReport,
  setUploadingReport,
  dragActive,
  setDragActive,
  processingStep,
  setProcessingStep,
  processFile,
  deleteReport,
  reportTitle,
  setReportTitle,
  reportPractitioner,
  setReportPractitioner,
  reportFacility,
  setReportFacility,
  handlePrintReport,
  reportId,
  uploadProgress,
  setUploadProgress
}) {
  const fileInputRef = useRef(null)
  const [selectedReportType, setSelectedReportType] = useState("Blood Test")
  const [errorText, setErrorText] = useState(null)

  const activeReport = reports.find(r => r.id === activeReportId) || reports[0]

  const validateFile = (file) => {
    setErrorText(null)
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png']
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    
    if (!allowedExtensions.includes(ext)) {
      setErrorText("Invalid file format. Only PDF, JPG, JPEG, and PNG files are supported.")
      return false
    }
    
    if (file.size > 20 * 1024 * 1024) {
      setErrorText("File size exceeds the 20MB limit (Max: 20MB).")
      return false
    }
    
    return true
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        processFile(file, selectedReportType)
      }
    }
  }

  const handleFileChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        processFile(file, selectedReportType)
      }
    }
  }

  // Pre-configured sample reports for developer testing
  const sampleReports = [
    { name: "sample_blood_report.pdf", label: "Sample Blood Test (CBC)", size: 1024 * 1024 * 1.2 },
    { name: "thyroid_panel_TSH.pdf", label: "Thyroid Panel (TSH)", size: 1024 * 1024 * 0.85 },
    { name: "lipid_panel_cholesterol.pdf", label: "Lipid Cholesterol Profile", size: 1024 * 1024 * 1.45 }
  ]

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side (col-span-4): Category Dropdown & Upload Drag-Drop */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          
          {/* Category Dropdown */}
          <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest border-b border-slate-50 pb-2">Upload Parameters</p>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Select Report Category</label>
              <select 
                value={selectedReportType} 
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary bg-white text-xs text-slate-700 font-bold"
              >
                <option value="Blood Test">Blood Test (CBC, Lipid, Metabolic)</option>
                <option value="Imaging (X-Ray/MRI)">Imaging (X-Ray, MRI, CT, Ultrasound)</option>
                <option value="Prescription">Prescription Slip</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Other">Other Medical Document</option>
              </select>
            </div>
          </div>

          {/* Validation Errors Alert Banner */}
          <AnimatePresence>
            {errorText && (
              <motion.div 
                className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-xs font-semibold text-rose-600 text-left"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Upload Rejected</p>
                  <p className="text-[11px] font-medium opacity-90 mt-0.5">{errorText}</p>
                </div>
                <button onClick={() => setErrorText(null)} className="p-0.5 hover:bg-rose-100 rounded text-rose-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* File Upload zone */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploadingReport && fileInputRef.current?.click()}
            className={`p-6 rounded-3xl border-2 border-dashed transition-all text-center relative overflow-hidden bg-white ${
              uploadingReport ? 'cursor-not-allowed border-slate-200' : 'cursor-pointer border-slate-200 hover:border-primary/50'
            } ${dragActive ? 'border-primary bg-primary/5' : ''}`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              disabled={uploadingReport}
            />
            
            {uploadingReport ? (
              <div className="space-y-4 py-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {uploadProgress === 100 ? "Analyzing Biomarkers" : "Uploading Document"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    {uploadProgress === 100 
                      ? "PulseIQ Clinical AI is decoding records..." 
                      : (uploadProgress > 0 ? `Sending raw file data... ${uploadProgress}%` : "Preparing stream...")}
                  </p>
                </div>
                {/* Micro Progress Bar */}
                <div className="w-32 bg-slate-100 rounded-full h-1.5 mx-auto overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <UploadCloud className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-850 uppercase tracking-wide">Upload Medical Record</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-normal">Drag and drop or click to browse</p>
                </div>
                <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">PDF, JPG, PNG up to 20MB</p>
              </div>
            )}
          </div>

          {/* Quick Test Samples (using mock upload simulation) */}
          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3 text-left">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Quick Test Samples
            </p>
            <div className="space-y-2">
              {sampleReports.map((sample, i) => (
                <button
                  key={i}
                  disabled={uploadingReport}
                  onClick={() => processFile(sample.name, selectedReportType, sample.size)}
                  className="w-full p-2.5 bg-white hover:bg-slate-100 border border-slate-200/80 hover:border-primary/20 rounded-xl text-[10px] font-bold text-slate-650 flex items-center justify-between transition-all select-none cursor-pointer"
                >
                  <span className="truncate pr-2">{sample.label}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side (col-span-8): Active Report Details & PDF Generator */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {activeReport ? (
              <motion.div 
                key={activeReport.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 text-left"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-50 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-800 tracking-tight">{activeReport.title}</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">
                      Category: <span className="text-primary font-black uppercase text-[10px]">{activeReport.type || "Other"}</span> · Size: {activeReport.size} · {activeReport.date}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[8px] bg-slate-50 text-slate-600 border border-slate-100 font-extrabold uppercase">
                    Status: Uploaded
                  </span>
                </div>

                {/* Technical Raw Content Placeholder */}
                <div className="space-y-2">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Document Registry Details</p>
                  <div className="text-xs text-slate-600 font-semibold leading-relaxed p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                    <p><strong>Database ID:</strong> {activeReport.id}</p>
                    <p><strong>Relative URL:</strong> <a href={`http://localhost:8000${activeReport.file_path}`} target="_blank" rel="noreferrer" className="text-primary underline hover:text-primary-hover font-bold">{activeReport.file_path}</a></p>
                    <p><strong>Clinical Text Snippet:</strong> {activeReport.simplified || "Raw extracted file content metadata pending review."}</p>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-2.5 text-xs text-primary">
                  <Sparkles className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">AI Diagnostics Analysis Ready</p>
                    <p className="text-[11px] font-semibold opacity-90 mt-0.5">
                      PulseIQ's clinical AI has processed this document. Check the **Analysis Results** tab to view translated biomarkers, findings, and clinical recommendations.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl p-16 border border-slate-100 border-dashed shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Awaiting Records Intake</h4>
                  <p className="text-[11px] text-slate-450 font-semibold leading-relaxed">
                    Upload medical record PDF/JPG/PNG files or select one of the "Quick Test Samples" on the left to register a report in your profile vault.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Auto Health Report Generator Panel */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 text-left">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Printer className="w-4.5 h-4.5 text-primary" /> Auto Health Report Generator
              </h3>
              <p className="text-xs text-slate-400 font-medium">Compile demographic metadata and active biometric telemetry parameters into a print-ready clinical PDF report.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-650">
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Report Assessment Title</label>
                <input 
                  type="text" 
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-primary text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Attending Clinician / MD</label>
                <input 
                  type="text" 
                  value={reportPractitioner}
                  onChange={(e) => setReportPractitioner(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-primary text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Medical Facility Name</label>
                <input 
                  type="text" 
                  value={reportFacility}
                  onChange={(e) => setReportFacility(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-primary text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10px] font-semibold text-slate-450">Generated UUID: <span className="font-extrabold text-slate-700">{reportId || 'HG-PENDING'}</span></span>
              <button 
                onClick={handlePrintReport}
                className="px-5 py-3 bg-primary text-white hover:bg-primary-hover rounded-xl text-xs font-extrabold transition-all shadow-md shadow-primary/10 cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto uppercase tracking-wider"
              >
                <Download className="w-4.5 h-4.5" /> Compile & Download PDF
              </button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  )
}
