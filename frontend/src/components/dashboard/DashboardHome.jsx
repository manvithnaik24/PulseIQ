import React from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { 
  Heart, 
  Activity, 
  Moon, 
  Footprints, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Plus, 
  Users, 
  Phone, 
  MapPin, 
  AlertOctagon,
  Sparkles,
  ShieldAlert
} from 'lucide-react'

export default function DashboardHome({
  profileName,
  medicines,
  setMedicines,
  familyMembers,
  recentAlerts,
  reports,
  riskHeartRate,
  riskSpo2,
  riskSymptoms,
  setRiskHeartRate,
  setRiskSpo2,
  setRiskSymptoms,
  setActiveTab,
  setShowSosModal,
  setSosCountdown,
  sosCountdown
}) {
  
  // Calculate dynamic Health Score from parameters (Health Risk Engine logic)
  const calculateHealthScore = () => {
    let score = 96
    
    // Heart Rate penalties
    if (riskHeartRate > 100) {
      score -= (riskHeartRate - 100) * 0.8
    } else if (riskHeartRate < 55) {
      score -= (55 - riskHeartRate) * 0.5
    } else if (riskHeartRate > 85) {
      score -= (riskHeartRate - 85) * 0.2
    }
    
    // SpO2 penalties
    if (riskSpo2 < 90) {
      score -= (90 - riskSpo2) * 5 + 15
    } else if (riskSpo2 < 95) {
      score -= (95 - riskSpo2) * 3
    }
    
    // Symptom penalties
    if (riskSymptoms.chestPain) score -= 25
    if (riskSymptoms.shortnessOfBreath) score -= 18
    if (riskSymptoms.fever) score -= 10
    if (riskSymptoms.fatigue) score -= 6
    if (riskSymptoms.headache) score -= 4
    
    // Adherence bonus/penalty
    const activeMeds = medicines.filter(m => m.is_active)
    if (activeMeds.length > 0) {
      const taken = medicines.filter(m => m.taken).length
      const compliance = taken / activeMeds.length
      if (compliance < 0.5) score -= 10
      else if (compliance === 1) score += 3
    }
    
    return Math.max(12, Math.min(100, Math.round(score)))
  }

  const healthScore = calculateHealthScore()

  const getHealthStatus = () => {
    if (healthScore >= 90) return { label: 'Excellent', color: 'text-success bg-success/10 border-success/20' }
    if (healthScore >= 75) return { label: 'Good', color: 'text-primary bg-primary/10 border-primary/20' }
    if (healthScore >= 60) return { label: 'Moderate', color: 'text-warning bg-warning/10 border-warning/20' }
    return { label: 'Risk', color: 'text-danger bg-danger/10 border-danger/20' }
  }

  const status = getHealthStatus()

  // Generate mock chart data based on current telemetry for dynamic feel
  const generateTrendData = () => {
    return [
      { day: 'Mon', score: Math.round(healthScore * 0.98) },
      { day: 'Tue', score: Math.round(healthScore * 0.99) },
      { day: 'Wed', score: Math.round(healthScore * 0.97) },
      { day: 'Thu', score: Math.round(healthScore * 1.01 > 100 ? 100 : healthScore * 1.01) },
      { day: 'Fri', score: Math.round(healthScore * 0.96) },
      { day: 'Sat', score: Math.round(healthScore * 1.02 > 100 ? 100 : healthScore * 1.02) },
      { day: 'Sun', score: healthScore }
    ]
  }

  const trendData = generateTrendData()

  // Dynamic risk engine report factors
  const getRiskFactorsList = () => {
    const factors = []
    if (riskHeartRate > 100 || riskHeartRate < 55) {
      factors.push("Abnormal Heart Rate logged")
    }
    if (riskSpo2 < 95) {
      factors.push("Sub-optimal Oxygen levels")
    }
    if (riskSymptoms.chestPain) {
      factors.push("Chest pain warning flags")
    }
    if (riskSymptoms.shortnessOfBreath) {
      factors.push("Dyspnea / Shortness of breath")
    }
    if (riskSymptoms.fever) {
      factors.push("Elevated core temperature / Fever")
    }
    if (medicines.length > 0) {
      const active = medicines.filter(m => m.is_active)
      const taken = medicines.filter(m => m.taken).length
      if (taken < active.length) {
        factors.push("Missed daily medications")
      }
    }
    
    if (factors.length === 0) {
      factors.push("All vitals conform to optimal clinical ranges")
    }
    return factors
  }

  const riskFactors = getRiskFactorsList()

  // Toggle medicine completed today
  const toggleMedicineTaken = (id) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, taken: !m.taken }
      }
      return m
    }))
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
    >
      {/* SOS Standby Warning Alert */}
      {sosCountdown === 0 && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-3xl flex items-center gap-3 text-danger text-xs font-bold">
          <AlertOctagon className="w-5 h-5 animate-bounce shrink-0" />
          <span>🚨 SOS emergency dispatch is active. Emergency response services have been notified of your location. Stay calm.</span>
          <button onClick={() => setSosCountdown(5)} className="ml-auto px-4 py-1.5 bg-danger text-white rounded-xl hover:bg-danger-hover transition-all text-[10px] font-extrabold uppercase tracking-wider">Stand Down</button>
        </div>
      )}

      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(30,83,255,0.15),transparent)] pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <p className="text-xs font-extrabold text-primary uppercase tracking-widest">PulseIQ Diagnostic Console</p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Welcome back, {profileName.split(' ')[0]}</h1>
          <p className="text-xs text-slate-400 font-medium">Your telemetry nodes are fully synced. System diagnostic: <span className="text-emerald-400 font-bold">Active & Normal</span></p>
          
          {/* Quick Actions Ribbon */}
          <div className="flex flex-wrap gap-2.5 pt-4">
            <button onClick={() => setActiveTab('symptom_checker')} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-[10px] font-bold tracking-wider uppercase text-slate-200 transition-all flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-primary" /> Check Symptoms
            </button>
            <button onClick={() => setActiveTab('ai_assistant')} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-[10px] font-bold tracking-wider uppercase text-slate-200 transition-all flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Assistant
            </button>
            <button onClick={() => setActiveTab('reports')} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-[10px] font-bold tracking-wider uppercase text-slate-200 transition-all flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-primary" /> Upload Report
            </button>
            <button onClick={() => setActiveTab('sos')} className="px-3.5 py-2 bg-danger/10 hover:bg-danger/20 border border-danger/25 rounded-xl text-[10px] font-extrabold tracking-wider uppercase text-danger transition-all flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" /> Emergency SOS
            </button>
          </div>
        </div>

        {/* Health Score Circular Gauge */}
        <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-800 backdrop-blur-md relative z-10 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            {/* SVG Circle progress */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="34" className="stroke-slate-700" strokeWidth="4.5" fill="transparent" />
              <circle 
                cx="40" 
                cy="40" 
                r="34" 
                className={`${healthScore >= 90 ? 'stroke-success' : healthScore >= 75 ? 'stroke-primary' : healthScore >= 60 ? 'stroke-warning' : 'stroke-danger'} transition-all duration-1000 ease-out`} 
                strokeWidth="5" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - healthScore / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xl font-black text-white">{healthScore}</span>
              <p className="text-[7px] text-slate-400 font-extrabold uppercase tracking-wider">Score</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase rounded-md border ${status.color}`}>
              {status.label}
            </span>
            <p className="text-xs text-white font-bold mt-1">Health Index</p>
            <p className="text-[9px] text-slate-400 font-semibold">Last synced: Just now</p>
          </div>
        </div>
      </div>

      {/* Row 1 - Health Overview telemetry metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Heart Rate Card */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-40 hover:border-primary/20 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform shrink-0">
              <Heart className="w-4.5 h-4.5" />
            </div>
            <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase rounded-full ${riskHeartRate > 100 || riskHeartRate < 55 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {riskHeartRate > 100 ? 'High' : riskHeartRate < 55 ? 'Low' : 'Stable'}
            </span>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Heart Rate</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{riskHeartRate} <span className="text-xs text-slate-400 font-medium">bpm</span></h3>
          </div>
          {/* Heart rate micro sparkline */}
          <svg className="w-full h-8 text-rose-500/80" viewBox="0 0 100 40" fill="none">
            <path d="M0 20 L20 20 L25 10 L30 30 L35 20 L55 20 L60 5 L65 35 L70 20 L100 20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Oxygen Card */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-40 hover:border-primary/20 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 group-hover:scale-105 transition-transform shrink-0">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase rounded-full ${riskSpo2 < 95 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {riskSpo2 < 95 ? 'Suboptimal' : 'Optimal'}
            </span>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Blood Oxygen</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{riskSpo2}% <span className="text-xs text-slate-400 font-medium">SpO₂</span></h3>
          </div>
          {/* SpO2 wave sparkline */}
          <svg className="w-full h-8 text-sky-500/80" viewBox="0 0 100 40" fill="none">
            <path d="M0 25 Q15 15 35 25 T70 15 T100 20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Sleep Quality Card */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-40 hover:border-primary/20 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500 group-hover:scale-105 transition-transform shrink-0">
              <Moon className="w-4.5 h-4.5" />
            </div>
            <span className="px-2 py-0.5 text-[8px] font-extrabold uppercase rounded-full bg-emerald-50 text-emerald-600">
              Restful
            </span>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sleep Quality</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">7.8 <span className="text-xs text-slate-400 font-medium">hours</span></h3>
          </div>
          {/* Sleep blocks sparkline */}
          <div className="flex items-end gap-1.5 h-6">
            <div className="w-full bg-violet-100 rounded-sm h-3" />
            <div className="w-full bg-violet-200 rounded-sm h-4" />
            <div className="w-full bg-violet-100 rounded-sm h-2" />
            <div className="w-full bg-violet-300 rounded-sm h-6" />
            <div className="w-full bg-violet-400 rounded-sm h-5" />
            <div className="w-full bg-violet-200 rounded-sm h-3" />
            <div className="w-full bg-violet-500 rounded-sm h-6" />
          </div>
        </div>

        {/* Activity Score Card */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-40 hover:border-primary/20 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform shrink-0">
              <Footprints className="w-4.5 h-4.5" />
            </div>
            <span className="px-2 py-0.5 text-[8px] font-extrabold uppercase rounded-full bg-emerald-50 text-emerald-600">
              Active
            </span>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Daily Activity</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">8,450 <span className="text-xs text-slate-400 font-medium">steps</span></h3>
          </div>
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '84.5%' }} />
            </div>
            <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
              <span>84% of goal</span>
              <span>10,000 steps</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2 - Health Management & Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Medication checklist */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 flex flex-col justify-between lg:col-span-2">
          <div className="space-y-1.5 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" /> Daily Medication Adherence
            </h3>
            <p className="text-xs text-slate-400 font-medium">Check off taken doses to log logs dynamically and update health indexes.</p>
          </div>
          
          <div className="divide-y divide-slate-50 flex-1 py-2">
            {medicines.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No active medications registered. Add one in the scheduler tab.
              </div>
            ) : (
              medicines.map((med) => (
                <div key={med.id} className="py-3 flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleMedicineTaken(med.id)} 
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        med.taken 
                        ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20' 
                        : 'border-slate-200 bg-white hover:border-primary/50'
                      }`}
                    >
                      {med.taken && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <div>
                      <p className={`text-xs font-extrabold ${med.taken ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{med.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{med.dosage} · {med.time_of_day}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase rounded-full ${med.taken ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {med.taken ? 'Taken' : 'Scheduled'}
                  </span>
                </div>
              ))
            )}
          </div>
          
          <button onClick={() => setActiveTab('medication')} className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-primary font-bold hover:text-primary-hover transition-colors w-full">
            Manage Schedules <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Health Risk Engine Predicitve Panel */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 flex flex-col justify-between bg-gradient-to-br from-white to-slate-50/50">
          <div className="space-y-1.5 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-warning" /> Clinical Risk Assessment
            </h3>
            <p className="text-xs text-slate-400 font-medium">Automatic clinical forecast analyzing symptoms, logs, and compliance records.</p>
          </div>

          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Score circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" className="stroke-slate-100" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="48" 
                  className={`transition-all duration-1000 ${healthScore >= 90 ? 'stroke-success' : healthScore >= 75 ? 'stroke-primary' : healthScore >= 60 ? 'stroke-warning' : 'stroke-danger'}`} 
                  strokeWidth="7" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (healthScore / 100)} // Inverse mapping for risk percentage (100 - healthScore)
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-slate-800">{100 - healthScore}%</span>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Overall Risk</p>
              </div>
            </div>
            
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-slate-700">Risk Assessment: <span className={
                healthScore >= 90 ? 'text-success font-black' : healthScore >= 75 ? 'text-primary font-black' : healthScore >= 60 ? 'text-warning font-black' : 'text-danger font-black'
              }>{healthScore >= 90 ? 'Low' : healthScore >= 75 ? 'Mild' : healthScore >= 60 ? 'Moderate' : 'High'}</span></p>
              <p className="text-[10px] text-slate-400 font-medium">Aggregated across active diagnostic parameters</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Primary Risk Factors</p>
            <div className="space-y-1">
              {riskFactors.slice(0, 2).map((factor, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span className="truncate">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row 3 - Safety & Family */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Family Care loop */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-primary" /> Family Monitoring
            </h3>
            <span className="text-[10px] font-extrabold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase">
              {familyMembers.length} Linked
            </span>
          </div>

          <div className="space-y-3">
            {familyMembers.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                No family members connected. Set up loop in Hub tab.
              </div>
            ) : (
              familyMembers.slice(0, 2).map(member => (
                <div key={member.id} className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-extrabold text-xs">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-700">{member.name}</p>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">{member.relation} · Health index: {member.health_score}%</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                    member.status === 'Normal' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {member.status}
                  </span>
                </div>
              ))
            )}
          </div>
          
          <button onClick={() => setActiveTab('family')} className="w-full text-center text-xs text-primary font-bold hover:underline transition-all block pt-2">
            Open Caregiver Hub
          </button>
        </div>

        {/* Emergency Contacts quick launch */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4.5 h-4.5 text-danger" /> Primary Responders
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-rose-700">PulseIQ SOS Dispatch</p>
                <p className="text-[9px] text-rose-500 font-semibold mt-0.5">Emergency direct triage line</p>
              </div>
              <button onClick={() => setActiveTab('sos')} className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 text-[10px] font-bold shadow-sm shadow-rose-600/25">Trigger</button>
            </div>
            
            <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-700">Dr. Sarah Jenkins</p>
                <p className="text-[9px] text-slate-400 font-medium mt-0.5">General Practitioner</p>
              </div>
              <a href="tel:+15550199" className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"><Phone className="w-3.5 h-3.5" /></a>
            </div>
          </div>
        </div>

        {/* Live GPS Tracker status */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4.5 h-4.5 text-primary" /> Live GPS Diagnostics
          </h3>

          <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3 text-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-700">GPS Signal: Locked</p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">Triage telemetry tracking active</p>
            </div>
            <div className="text-[10px] bg-slate-100 p-2 rounded-xl text-slate-600 font-semibold truncate">
              Lat: 37.7749 | Lon: -122.4194
            </div>
          </div>
        </div>

      </div>

      {/* Weekly Clinical Trends Chart */}
      <div className="glass-card rounded-3xl p-6 border border-slate-100 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-primary" /> Weekly Health Trends
            </h3>
            <p className="text-xs text-slate-400 font-medium">Consolidated wellness progression index based on historical daily reports.</p>
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200/80">
            Last 7 Days
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E53FF" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1E53FF" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  fontSize: '11px',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
              <Area type="monotone" dataKey="score" stroke="#1E53FF" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}
