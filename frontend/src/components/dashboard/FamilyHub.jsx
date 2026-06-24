import React, { useState } from 'react'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  Heart, 
  Activity, 
  User, 
  X, 
  LayoutGrid, 
  Table as TableIcon,
  Check,
  AlertCircle,
  ShieldAlert,
  Calendar,
  Sparkles
} from 'lucide-react'

export default function FamilyHub({
  familyMembers,
  fetchFamilyMembers,
  getToken
}) {
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  
  // Form states matching requested biometrics monitoring
  const [fullName, setFullName] = useState('')
  const [relationship, setRelationship] = useState('Father')
  const [age, setAge] = useState('')
  const [status, setStatus] = useState('Stable')
  const [heartRate, setHeartRate] = useState(72)
  const [spo2, setSpo2] = useState(98)
  const [healthScore, setHealthScore] = useState(90)
  const [medAdherence, setMedAdherence] = useState(85)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')

  // Relationship Options
  const relationshipOptions = [
    'Father',
    'Mother',
    'Brother',
    'Sister',
    'Guardian',
    'Doctor',
    'Other'
  ]

  // Status Color Mappings
  const getStatusColor = (s) => {
    switch (s) {
      case 'Critical':
        return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40'
      case 'Caution':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40'
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40'
    }
  }

  // Get relationship colors
  const getRelationColor = (relation) => {
    switch (relation) {
      case 'Father':
      case 'Mother':
        return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
      case 'Brother':
      case 'Sister':
        return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
      case 'Guardian':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
      case 'Doctor':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-850'
    }
  }

  // Get initials for initials circle badge
  const getInitials = (name) => {
    if (!name) return 'FM'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // Caregiver Warning Alerts
  const flaggedMembers = familyMembers.filter(m => m.status === 'Critical' || m.status === 'Caution')

  // Reset Form
  const resetForm = () => {
    setFullName('')
    setRelationship('Father')
    setAge('')
    setStatus('Stable')
    setHeartRate(72)
    setSpo2(98)
    setHealthScore(90)
    setMedAdherence(85)
    setErrorMsg('')
    setPhoneNumber('')
    setEmail('')
  }

  // Handle Add Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE_URL}/api/v1/family/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: fullName,
          relation: relationship,
          age: age ? Number(age) : null,
          status: status,
          heart_rate: Number(heartRate),
          spo2: Number(spo2),
          health_score: Number(healthScore),
          medication_adherence: Number(medAdherence),
          phone_number: phoneNumber.trim() || null,
          email: email.trim() || null
        })
      })

      if (!res.ok) {
        throw new Error('Failed to create family member')
      }

      await fetchFamilyMembers()
      setShowAddModal(false)
      resetForm()
    } catch (err) {
      console.error(err)
      setErrorMsg('Error saving family member. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Edit Modal
  const openEditModal = (member) => {
    setEditingMember(member)
    setFullName(member.name || '')
    setRelationship(member.relation || 'Father')
    setAge(member.age !== null && member.age !== undefined ? member.age : '')
    setStatus(member.status || 'Stable')
    setHeartRate(member.vitals?.hr || member.heartRate || 72)
    setSpo2(member.vitals?.spo2 || member.spo2 || 98)
    setHealthScore(member.healthScore || 90)
    setMedAdherence(member.medAdherence || 85)
    setPhoneNumber(member.phone_number || '')
    setEmail(member.email || '')
    setErrorMsg('')
    setShowEditModal(true)
  }

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE_URL}/api/v1/family/${editingMember.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: fullName,
          relation: relationship,
          status: status,
          heart_rate: Number(heartRate),
          spo2: Number(spo2),
          health_score: Number(healthScore),
          medication_adherence: Number(medAdherence),
          phone_number: phoneNumber.trim() || null,
          email: email.trim() || null
        })
      })

      if (!res.ok) {
        throw new Error('Failed to update family member')
      }

      await fetchFamilyMembers()
      setShowEditModal(false)
      setEditingMember(null)
      resetForm()
    } catch (err) {
      console.error(err)
      setErrorMsg('Error updating family member. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Delete
  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) {
      return
    }

    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE_URL}/api/v1/family/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to delete family member')
      }

      await fetchFamilyMembers()
    } catch (err) {
      console.error(err)
      alert(`Error deleting family member: ${err.message}`)
    }
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
    >
      {/* Alert Console (Caregiver Alerts) */}
      <AnimatePresence>
        {flaggedMembers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/40 rounded-2xl space-y-3 text-rose-700 dark:text-rose-350"
          >
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-450 animate-bounce shrink-0" />
              <span>Caregiver Alert Console ({flaggedMembers.length} active warnings)</span>
            </div>
            <div className="space-y-2">
              {flaggedMembers.map(member => (
                <div key={member.id} className="p-3 bg-white dark:bg-slate-900 border border-rose-100/50 dark:border-rose-950/30 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-slate-800 dark:text-slate-200">
                      {member.name} ({member.relation})
                    </p>
                    <p className="text-[10px] text-rose-600 dark:text-rose-450 font-semibold flex items-center gap-1">
                      ⚠️ Abnormal biometric signature: {member.vitals?.hr || member.heartRate || 72} bpm resting heart rate & {member.vitals?.spo2 || member.spo2 || 98}% O₂.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded-md font-extrabold uppercase text-[9px] tracking-wide shrink-0">
                    {member.status} status
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Actions Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-5">
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Connected Family Loop
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Coordinate remote care plans, check live vitals, and track compliance metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Toggle View Buttons */}
          <div className="flex border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden p-0.5 bg-slate-50/50 dark:bg-slate-900/50">
            <button 
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'cards' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-650'}`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-650'}`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => {
              resetForm()
              setShowAddModal(true)
            }}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-primary text-white hover:bg-primary-hover rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {/* Main Members Display */}
      {familyMembers.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-3xl p-16 border border-dashed border-slate-200 dark:border-slate-850 text-center space-y-4 shadow-sm">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">No linked family members</h4>
            <p className="text-[11px] text-slate-450 dark:text-slate-500 font-semibold leading-relaxed">
              Add parents, grandparents, or children to track their baseline vitals and health status.
            </p>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {familyMembers.map(member => (
            <div 
              key={member.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              <div className="space-y-4">
                {/* Header details with initials avatar */}
                <div className="flex gap-4 items-center">
                  <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center font-extrabold text-slate-755 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-800 uppercase shrink-0">
                    {getInitials(member.name)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-extrabold text-slate-805 dark:text-slate-100 text-sm truncate">{member.name}</h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getRelationColor(member.relation)}`}>
                        {member.relation}
                      </span>
                      {member.age !== null && member.age !== undefined && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                          · {member.age} yrs
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score indicators */}
                <div className="grid grid-cols-2 gap-4 border-y border-slate-50 dark:border-slate-850/60 py-3 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">Health Index</span>
                    <div className="flex items-center gap-1.5 font-extrabold text-slate-850 dark:text-slate-250">
                      <span className="text-sm font-black text-primary">{member.healthScore || member.health_score || 90}%</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        member.status === 'Critical' ? 'bg-rose-500 animate-ping' :
                        member.status === 'Caution' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                    </div>
                  </div>
                  
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">Med Adherence</span>
                    <p className="font-extrabold text-slate-850 dark:text-slate-250 mt-0.5">{member.medAdherence || member.medication_adherence || 85}% ratio</p>
                  </div>
                </div>

                {/* Vitals Telemetry logs */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Live Diagnostics</span>
                  <div className="grid grid-cols-2 gap-3 text-[10px] font-bold">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850/60 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 dark:text-slate-500">Heart Rate</span>
                        <p className="text-slate-850 dark:text-slate-250 font-extrabold">{member.vitals?.hr || member.heart_rate || 72} bpm</p>
                      </div>
                      <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                    </div>
                    
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850/60 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 dark:text-slate-500">Blood Oxygen</span>
                        <p className="text-slate-850 dark:text-slate-250 font-extrabold">{member.vitals?.spo2 || member.spo2 || 98}% O₂</p>
                      </div>
                      <Activity className="w-4 h-4 text-sky-500 shrink-0" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badge and Actions */}
              <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-850/60 pt-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase border ${getStatusColor(member.status)}`}>
                  {member.status} status
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => openEditModal(member)}
                    className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-primary rounded-lg transition-all cursor-pointer"
                    title="Edit health parameters"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteMember(member.id, member.name)}
                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 dark:text-slate-500 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View Mode */
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/50 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 tracking-wider">
                  <th className="py-3 px-5">Name</th>
                  <th className="py-3 px-5">Relationship</th>
                  <th className="py-3 px-5">Age</th>
                  <th className="py-3 px-5">Condition</th>
                  <th className="py-3 px-5">Heart Rate</th>
                  <th className="py-3 px-5">SpO2 Level</th>
                  <th className="py-3 px-5">Health Index</th>
                  <th className="py-3 px-5">Adherence</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850 text-xs font-semibold text-slate-700 dark:text-slate-350">
                {familyMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-all">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center font-extrabold text-slate-650 dark:text-slate-400 text-[10px] border border-slate-150 dark:border-slate-800 uppercase">
                          {getInitials(member.name)}
                        </div>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase ${getRelationColor(member.relation)}`}>
                        {member.relation}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 font-medium">
                      {member.age !== null && member.age !== undefined ? `${member.age} yrs` : '—'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-605 dark:text-slate-400 font-bold flex items-center gap-1.5 mt-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{member.vitals?.hr || member.heart_rate || 72} bpm</span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-605 dark:text-slate-400 font-bold">
                      {member.vitals?.spo2 || member.spo2 || 98}% O₂
                    </td>
                    <td className="py-3.5 px-5 text-primary font-black">
                      {member.healthScore || member.health_score || 90}%
                    </td>
                    <td className="py-3.5 px-5 text-slate-605 dark:text-slate-400 font-medium">
                      {member.medAdherence || member.medication_adherence || 85}%
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => openEditModal(member)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 dark:text-slate-500 hover:text-primary rounded-lg transition-all cursor-pointer"
                          title="Edit details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMember(member.id, member.name)}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-450 dark:text-slate-500 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                          title="Remove member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Family Member Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
            />
            
            <motion.div 
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xl max-w-lg w-full overflow-hidden z-20 relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="bg-gradient-to-r from-primary to-blue-600 p-5 text-white flex justify-between items-center">
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  <Users className="w-4.5 h-4.5" /> Link Family Member
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/10 rounded-lg text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-650 dark:text-slate-450">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/40 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Grid 1: Name, Relation, Age */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Full Legal Name</label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="E.g., Grandma Jenkins"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-primary text-slate-800 dark:text-slate-100 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Age (Years)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      max="150"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="68"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-primary text-slate-800 dark:text-slate-100 text-xs"
                    />
                  </div>
                </div>

                {/* Grid 2: Relation and Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Relationship</label>
                    <select 
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-primary text-slate-800 dark:text-slate-100 text-xs bg-white"
                    >
                      {relationshipOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Health Condition/Status</label>
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-primary text-slate-800 dark:text-slate-100 text-xs bg-white"
                    >
                      <option value="Stable">Stable status</option>
                      <option value="Caution">Caution status</option>
                      <option value="Critical">Critical status</option>
                    </select>
                  </div>
                </div>

                {/* Grid 3: Phone Number and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-primary text-slate-800 dark:text-slate-100 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="member@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-primary text-slate-800 dark:text-slate-100 text-xs"
                    />
                  </div>
                </div>

                {/* Vitals Telemetry Setup block */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850/60 rounded-xl space-y-4">
                  <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Baseline Vitals Diagnostics</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-extrabold text-slate-500">
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider">Heart Rate</span>
                      <input 
                        type="number" 
                        required
                        min="30"
                        max="220"
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-900 outline-none focus:border-primary text-[10px] text-slate-850 dark:text-slate-250"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider">SpO2 Level</span>
                      <input 
                        type="number" 
                        required
                        min="50"
                        max="100"
                        value={spo2}
                        onChange={(e) => setSpo2(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-900 outline-none focus:border-primary text-[10px] text-slate-850 dark:text-slate-250"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider">Health Index %</span>
                      <input 
                        type="number" 
                        required
                        min="0"
                        max="100"
                        value={healthScore}
                        onChange={(e) => setHealthScore(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-900 outline-none focus:border-primary text-[10px] text-slate-850 dark:text-slate-250"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider">Adherence %</span>
                      <input 
                        type="number" 
                        required
                        min="0"
                        max="100"
                        value={medAdherence}
                        onChange={(e) => setMedAdherence(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-900 outline-none focus:border-primary text-[10px] text-slate-850 dark:text-slate-250"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500 rounded-xl font-bold uppercase tracking-wider text-[10px] text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl font-extrabold uppercase tracking-wider text-[10px] text-center shadow-md shadow-primary/10 cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : 'Add Member'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Family Member Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowEditModal(false)
                setEditingMember(null)
              }}
            />
            
            <motion.div 
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xl max-w-lg w-full overflow-hidden z-20 relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="bg-gradient-to-r from-primary to-blue-600 p-5 text-white flex justify-between items-center">
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  <Edit2 className="w-4.5 h-4.5" /> Edit Family Member
                </h3>
                <button 
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingMember(null)
                  }} 
                  className="p-1 hover:bg-white/10 rounded-lg text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-650 dark:text-slate-450">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/40 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Grid 1: Name, Relation, Age */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Full Legal Name</label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="E.g., Grandma Jenkins"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-primary text-slate-800 dark:text-slate-100 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Age (Years)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      max="150"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="68"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-primary text-slate-800 dark:text-slate-100 text-xs"
                    />
                  </div>
                </div>

                {/* Grid 2: Relation and Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Relationship</label>
                    <select 
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-primary text-slate-800 dark:text-slate-100 text-xs bg-white"
                    >
                      {relationshipOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Health Condition/Status</label>
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-primary text-slate-800 dark:text-slate-100 text-xs bg-white"
                    >
                      <option value="Stable">Stable status</option>
                      <option value="Caution">Caution status</option>
                      <option value="Critical">Critical status</option>
                    </select>
                  </div>
                </div>

                {/* Grid 3: Phone Number and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-primary text-slate-800 dark:text-slate-100 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="member@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-primary text-slate-800 dark:text-slate-100 text-xs"
                    />
                  </div>
                </div>

                {/* Vitals Telemetry Setup block */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850/60 rounded-xl space-y-4">
                  <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Diagnostics Telemetry Config</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-extrabold text-slate-500">
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider">Heart Rate</span>
                      <input 
                        type="number" 
                        required
                        min="30"
                        max="220"
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-900 outline-none focus:border-primary text-[10px] text-slate-850 dark:text-slate-250"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider">SpO2 Level</span>
                      <input 
                        type="number" 
                        required
                        min="50"
                        max="100"
                        value={spo2}
                        onChange={(e) => setSpo2(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-900 outline-none focus:border-primary text-[10px] text-slate-850 dark:text-slate-250"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider">Health Index %</span>
                      <input 
                        type="number" 
                        required
                        min="0"
                        max="100"
                        value={healthScore}
                        onChange={(e) => setHealthScore(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-900 outline-none focus:border-primary text-[10px] text-slate-850 dark:text-slate-250"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider">Adherence %</span>
                      <input 
                        type="number" 
                        required
                        min="0"
                        max="100"
                        value={medAdherence}
                        onChange={(e) => setMedAdherence(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-900 outline-none focus:border-primary text-[10px] text-slate-850 dark:text-slate-250"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingMember(null)
                    }}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500 rounded-xl font-bold uppercase tracking-wider text-[10px] text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl font-extrabold uppercase tracking-wider text-[10px] text-center shadow-md shadow-primary/10 cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
