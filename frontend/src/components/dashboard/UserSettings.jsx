import React, { useState, useEffect } from 'react'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Settings, 
  Database, 
  CheckCircle, 
  Info, 
  Loader2, 
  AlertTriangle,
  RefreshCw,
  Heart,
  Scale,
  Ruler
} from 'lucide-react'

export default function UserSettings({
  profileName,
  setProfileName,
  profileEmail,
  setProfileEmail,
  profileAge,
  setProfileAge,
  profileWeight,
  setProfileWeight,
  profileHeight,
  setProfileHeight,
  profileBloodGroup,
  setProfileBloodGroup,
  settingsSuccess,
  saveSettings,
  getToken,
  profileLoading
}) {
  const [dbStatus, setDbStatus] = useState('checking') // checking, connected, failed
  const [dbInfo, setDbInfo] = useState(null)
  const [checkingDb, setCheckingDb] = useState(false)

  const verifyDatabaseConnection = async () => {
    setCheckingDb(true)
    setDbStatus('checking')
    try {
      const res = await fetch(`${API_BASE_URL}/api/health/db`)
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'success') {
          setDbStatus('connected')
          setDbInfo(data)
        } else {
          setDbStatus('failed')
        }
      } else {
        setDbStatus('failed')
      }
    } catch (err) {
      console.error(err)
      setDbStatus('failed')
    } finally {
      setCheckingDb(false)
    }
  }

  useEffect(() => {
    verifyDatabaseConnection()
  }, [])

  const bloodGroups = [
    'O-Positive', 'O-Negative', 
    'A-Positive', 'A-Negative', 
    'B-Positive', 'B-Negative', 
    'AB-Positive', 'AB-Negative'
  ]

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
    >
      {/* Left side (col-span-2): Demographics Settings */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-primary" /> Patient Demographics Profile
            </h3>
            <p className="text-xs text-slate-400 font-medium">Update biometric standards and credentials synced directly with PostgreSQL storage.</p>
          </div>
          {profileLoading && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing profile...
            </span>
          )}
        </div>

        <form onSubmit={saveSettings} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Full Legal Name
              </label>
              <input 
                type="text" 
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all font-semibold"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Primary Email Address
              </label>
              <input 
                type="email" 
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all font-semibold bg-slate-55/30"
              />
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Age (Years)
              </label>
              <input 
                type="number" 
                min="0"
                max="125"
                required
                value={profileAge}
                onChange={(e) => setProfileAge(e.target.value)}
                placeholder="E.g., 28"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all font-semibold"
              />
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> Clinical Blood Group
              </label>
              <select 
                value={profileBloodGroup}
                onChange={(e) => setProfileBloodGroup(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all font-semibold bg-white"
              >
                {bloodGroups.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-slate-400" /> Weight (kg)
              </label>
              <input 
                type="number" 
                min="0"
                required
                value={profileWeight}
                onChange={(e) => setProfileWeight(e.target.value)}
                placeholder="E.g., 68"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all font-semibold"
              />
            </div>

            {/* Height */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-slate-400" /> Height (cm)
              </label>
              <input 
                type="number" 
                min="0"
                required
                value={profileHeight}
                onChange={(e) => setProfileHeight(e.target.value)}
                placeholder="E.g., 175"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all font-semibold"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
            {settingsSuccess ? (
              <span className="text-xs text-emerald-500 font-extrabold flex items-center gap-1.5 animate-bounce">
                <CheckCircle className="w-4.5 h-4.5" /> Demographic parameters successfully synced!
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">Verify values before syncing database structures.</span>
            )}
            <button 
              type="submit"
              className="px-6 py-3 bg-primary text-white hover:bg-primary-hover rounded-xl text-xs font-extrabold transition-all shadow-md shadow-primary/10 cursor-pointer uppercase tracking-wider"
            >
              Update Profile Sync
            </button>
          </div>
        </form>
      </div>

      {/* Right side (col-span-1): Neon Database Connection Diagnostic card */}
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h4 className="font-bold text-slate-950 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <span>Neon PostgreSQL</span>
            </h4>
            <button 
              onClick={verifyDatabaseConnection}
              disabled={checkingDb}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-primary transition-all cursor-pointer ${checkingDb ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-450 font-bold">Status Badge</span>
              {dbStatus === 'checking' && (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-slate-100 text-slate-500">Checking...</span>
              )}
              {dbStatus === 'connected' && (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-650 animate-pulse border border-emerald-100">Live & Connected</span>
              )}
              {dbStatus === 'failed' && (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-50 text-rose-600 border border-rose-100">Connection Failed</span>
              )}
            </div>

            {dbStatus === 'connected' && dbInfo && (
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3 text-[10px] font-bold text-slate-650">
                <div className="flex justify-between">
                  <span className="text-slate-400">Database Adapter</span>
                  <span className="text-slate-800 uppercase">{dbInfo.database_url_schema}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Insert Logs Verification</span>
                  <span className="text-emerald-500 font-extrabold">{dbInfo.operations.insert}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Read Verification</span>
                  <span className="text-emerald-500 font-extrabold">{dbInfo.operations.read}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Teardown Verification</span>
                  <span className="text-emerald-500 font-extrabold">{dbInfo.operations.delete}</span>
                </div>
              </div>
            )}

            {dbStatus === 'failed' && (
              <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-2xl text-[10px] font-bold text-rose-600 flex gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="leading-normal">Could not establish contact with backend PostgreSQL server. Check environment keys or verify port 8000 status.</p>
              </div>
            )}

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[9px] font-bold text-slate-400 leading-relaxed flex gap-2">
              <Info className="w-5 h-5 text-slate-350 shrink-0" />
              <p>PulseIQ uses Neon serverless SQL clusters. Daily compliance check-offs, medical reports simplified tags, and GPS coordinates log instantly to remote storage schema.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
