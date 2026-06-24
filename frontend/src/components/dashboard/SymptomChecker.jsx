import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  AlertTriangle, 
  Heart, 
  Thermometer, 
  HelpCircle, 
  Brain, 
  ChevronRight, 
  CheckCircle,
  Clock,
  Sparkles,
  Loader2,
  Undo2,
  Stethoscope,
  Info
} from 'lucide-react'

export default function SymptomChecker({
  symptomInput,
  setSymptomInput,
  triageReport,
  setTriageReport,
  checkingSymptom,
  handleRunTriage,
  resetTriage,
  riskSymptoms,
  setRiskSymptoms
}) {
  const toggleSymptomCheckbox = (key) => {
    setRiskSymptoms(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Pre-configured common check list
  const symptomList = [
    { key: 'chestPain', label: 'Chest Pain or Tightness', desc: 'Can indicate heart issues, immediate evaluation advised.', icon: <Heart className="w-4 h-4 text-rose-500" /> },
    { key: 'shortnessOfBreath', label: 'Shortness of Breath', desc: 'Difficulty breathing or catching breath.', icon: <Activity className="w-4 h-4 text-sky-500" /> },
    { key: 'fever', label: 'High Fever / Chills', desc: 'Elevated core temperature.', icon: <Thermometer className="w-4 h-4 text-amber-500" /> },
    { key: 'fatigue', label: 'Severe Fatigue / Lethargy', desc: 'Unusual lack of energy or muscle exhaustion.', icon: <HelpCircle className="w-4 h-4 text-indigo-500" /> },
    { key: 'headache', label: 'Persistent Headache', desc: 'Pounding or pressure in brain regions.', icon: <Brain className="w-4 h-4 text-violet-500" /> }
  ]

  // Count active symptoms for dynamic summary
  const activeCount = Object.values(riskSymptoms).filter(Boolean).length

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side (col-span-7): Symptom Intake Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-1.5 border-b border-slate-50 pb-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4.5 h-4.5 text-primary" /> Diagnostic Triage Portal
              </h3>
              <p className="text-xs text-slate-400 font-medium">Select active symptom checklist flags and describe details below for clinical triage analysis.</p>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Quick Flag Selector</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {symptomList.map(sym => (
                  <div 
                    key={sym.key} 
                    onClick={() => toggleSymptomCheckbox(sym.key)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 items-start select-none ${
                      riskSymptoms[sym.key] 
                        ? 'bg-primary/5 border-primary shadow-sm' 
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      riskSymptoms[sym.key] ? 'bg-primary/10' : 'bg-white border border-slate-100'
                    }`}>
                      {sym.icon}
                    </div>
                    <div className="space-y-0.5">
                      <p className={`text-xs font-bold ${riskSymptoms[sym.key] ? 'text-primary' : 'text-slate-700'}`}>{sym.label}</p>
                      <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">{sym.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Describe your Symptoms</label>
                <span className="text-[9px] text-slate-400 font-semibold">{symptomInput.length} chars</span>
              </div>
              <textarea 
                rows="4"
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                placeholder="E.g., I have had a mild throbbing headache for about 6 hours. I also feel a bit fatigued and feverish..."
                className="w-full p-4 text-xs rounded-2xl border border-slate-200 focus:border-primary transition-all outline-none bg-slate-50/50 font-medium resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-50">
            <button 
              onClick={resetTriage}
              className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Undo2 className="w-4 h-4" /> Reset Form
            </button>
            <button 
              onClick={handleRunTriage}
              disabled={checkingSymptom || (!symptomInput.trim() && activeCount === 0)}
              className="flex-1 px-5 py-3 bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer uppercase tracking-wider"
            >
              {checkingSymptom ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Symptoms...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run Diagnostic Check
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side (col-span-5): Triage Analysis Output */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {triageReport ? (
              <motion.div 
                key="report"
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 flex-1 flex flex-col justify-between"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Triage Report</p>
                      <h4 className="font-extrabold text-slate-800 text-xs mt-0.5">{triageReport.reportId}</h4>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                      triageReport.risk === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      triageReport.risk === 'Moderate' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {triageReport.risk} Severity
                    </span>
                  </div>

                  {/* Diagnosis */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Possible Clinical Conditions</p>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <p className="text-xs font-black text-slate-800">{triageReport.diagnosis}</p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-3">
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Triage Advice & Recommendations</p>
                    <div className="space-y-2">
                      {triageReport.advice.split('. ').filter(Boolean).map((sentence, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start text-xs font-semibold text-slate-650 leading-relaxed">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{sentence}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-[9px] font-bold text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Checked: {triageReport.timestamp}</span>
                  <button onClick={resetTriage} className="text-primary hover:underline uppercase tracking-wider font-extrabold">Done / New Check</button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl p-8 border border-slate-100 border-dashed shadow-sm flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Info className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-xs mx-auto">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Awaiting Intake Data</h4>
                  <p className="text-[11px] text-slate-450 font-semibold leading-relaxed">
                    Provide symptoms or select telemetry checklist flags on the left, then trigger clinical diagnostic checks.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Warning block */}
          <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl flex gap-3 text-amber-700 text-[10px] leading-relaxed font-semibold">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p>
              <strong className="font-extrabold uppercase tracking-wide">Emergency Warning:</strong> If you are experiencing severe symptoms such as sudden intense chest tightness, extreme respiratory distress, or severe bleeding, stand down immediately and trigger the <span className="text-rose-600 font-extrabold">Emergency SOS dispatch console</span>.
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  )
}
