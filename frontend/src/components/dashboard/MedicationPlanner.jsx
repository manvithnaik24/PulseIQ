import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Pill, 
  Clock, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Calendar, 
  AlertTriangle,
  X,
  Sparkles,
  TrendingUp,
  Activity,
  Heart
} from 'lucide-react'

export default function MedicationPlanner({
  medicines,
  setMedicines,
  newMedName,
  setNewMedName,
  newMedTime,
  setNewMedTime,
  newMedDosage,
  setNewMedDosage,
  showAddMedModal,
  setShowAddMedModal,
  customTimeVal,
  setCustomTimeVal,
  handleAddMed,
  toggleMedicine,
  deleteMedicine, // Passed from parent if implemented, otherwise handled locally
  adherenceRate,
  takenCount,
  totalCount
}) {
  
  // Custom local delete handler fallback in case it is not passed from parent
  const handleDeleteClick = async (medId, medName) => {
    if (deleteMedicine) {
      deleteMedicine(medId, medName)
    } else {
      // Fallback local state delete if prop not passed
      try {
        setMedicines(prev => prev.filter(m => m.id !== medId))
      } catch (err) {
        console.error(err)
      }
    }
  }

  const timeOptions = [
    { value: "Morning (08:00 AM)", label: "Morning (08:00 AM)" },
    { value: "Noon (12:00 PM)", label: "Noon (12:00 PM)" },
    { value: "Evening (06:00 PM)", label: "Evening (06:00 PM)" },
    { value: "Night (09:00 PM)", label: "Night (09:00 PM)" },
    { value: "custom", label: "Custom Specified Time..." }
  ]

  const dosageOptions = [
    { value: "1 pill", label: "1 Pill" },
    { value: "2 pills", label: "2 Pills" },
    { value: "0.5 pill", label: "Half Pill" },
    { value: "1 table spoon", label: "1 Tablespoon" },
    { value: "1 injection", label: "1 Injection" }
  ]

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
    >
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Adherence Card */}
        <div className="glass-card p-6 rounded-3xl flex items-center gap-5 border border-slate-100 bg-gradient-to-br from-white to-slate-50/50">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="4.5" fill="transparent" />
              <circle 
                cx="32" 
                cy="32" 
                r="28" 
                stroke="#1E53FF" 
                strokeWidth="5" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - (adherenceRate || 0) / 100)}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-sm font-black text-slate-800">{adherenceRate}%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Adherence Index</p>
            <h4 className="text-base font-black text-slate-800 mt-0.5">Taken: {takenCount} / {totalCount}</h4>
            <p className="text-[9px] text-slate-400 font-semibold mt-1">Doses marked as taken today.</p>
          </div>
        </div>

        {/* Next Scheduled Med */}
        <div className="glass-card p-6 rounded-3xl flex items-center gap-4 border border-slate-100">
          <div className="w-11 h-11 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Next Scheduled Dose</p>
            {medicines.filter(m => !m.taken).length > 0 ? (
              <>
                <h4 className="text-xs font-black text-slate-800 mt-1 truncate max-w-[200px]">
                  {medicines.filter(m => !m.taken)[0].name}
                </h4>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                  Scheduled for {medicines.filter(m => !m.taken)[0].time}
                </p>
              </>
            ) : (
              <h4 className="text-xs font-black text-slate-400 mt-1">All doses completed!</h4>
            )}
          </div>
        </div>

        {/* Add Med quick action card */}
        <div 
          onClick={() => setShowAddMedModal(true)}
          className="glass-card p-6 rounded-3xl border border-dashed border-slate-200 hover:border-primary hover:bg-slate-50/50 transition-all flex items-center gap-4 cursor-pointer group"
        >
          <div className="w-11 h-11 bg-primary/10 text-primary group-hover:scale-105 transition-transform rounded-2xl flex items-center justify-center shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 group-hover:text-primary transition-colors">Add Medication</h4>
            <p className="text-[9px] text-slate-400 font-semibold mt-1">Register a new scheduled medicine prescription log.</p>
          </div>
        </div>
      </div>

      {/* Medication List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4.5 h-4.5 text-primary" /> Active Prescription Schedules
            </h3>
            <p className="text-xs text-slate-450 font-medium">Verify your clinical schedules below and mark compliance daily.</p>
          </div>
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-100 border border-slate-200/50 px-2.5 py-1.5 rounded-full">
            {totalCount} Total Registered
          </span>
        </div>

        {medicines.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Pill className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700">No active medications logged</p>
              <p className="text-[10px] text-slate-400 font-medium">Click the "Add Medication" button to schedule your first dose.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3.5 pl-2">Status</th>
                  <th className="pb-3.5">Medication Details</th>
                  <th className="pb-3.5">Dosage</th>
                  <th className="pb-3.5">Schedule Target</th>
                  <th className="pb-3.5 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {medicines.map((med) => (
                  <tr key={med.id} className="group hover:bg-slate-50/40 transition-colors">
                    {/* Checkbox status */}
                    <td className="py-4 pl-2">
                      <button 
                        onClick={() => toggleMedicine(med.id)}
                        className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all ${
                          med.taken 
                            ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20' 
                            : 'border-slate-200 bg-white hover:border-primary/50'
                        }`}
                      >
                        {med.taken && <CheckCircle className="w-4 h-4 stroke-[2.5]" />}
                      </button>
                    </td>

                    {/* Name */}
                    <td className="py-4">
                      <div>
                        <p className={`font-bold ${med.taken ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{med.name}</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Status: {med.taken ? 'Taken today' : 'Awaiting dose'}</p>
                      </div>
                    </td>

                    {/* Dosage */}
                    <td className="py-4 font-semibold text-slate-650">{med.dosage}</td>

                    {/* Time */}
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-650 bg-slate-100 px-2 py-1 rounded-md text-[10px]">
                        <Clock className="w-3 h-3 text-slate-400" /> {med.time}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 text-right pr-2">
                      <button 
                        onClick={() => handleDeleteClick(med.id, med.name)}
                        className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete Schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Medication Modal Dialog */}
      <AnimatePresence>
        {showAddMedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddMedModal(false)}
            />
            
            <motion.div 
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden z-20 relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="bg-gradient-to-r from-primary to-blue-600 p-5 text-white flex justify-between items-center">
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  <Pill className="w-4.5 h-4.5 animate-pulse" /> Add Medication Schedule
                </h3>
                <button onClick={() => setShowAddMedModal(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMed} className="p-6 space-y-5 text-xs">
                {/* Medicine Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Medication Name</label>
                  <input 
                    type="text" 
                    required
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="E.g., Metformin 500mg"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all font-semibold"
                  />
                </div>

                {/* Dosage Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Dosage Intake</label>
                  <select 
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all font-semibold bg-white"
                  >
                    {dosageOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Intake Frequency Target</label>
                  <select 
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all font-semibold bg-white"
                  >
                    {timeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Custom Time Selector if selected */}
                {newMedTime === 'custom' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 pt-1"
                  >
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Specify Custom Time</label>
                    <input 
                      type="time" 
                      value={customTimeVal}
                      onChange={(e) => setCustomTimeVal(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all font-semibold"
                    />
                  </motion.div>
                )}

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowAddMedModal(false)}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl font-bold uppercase tracking-wider text-[10px] text-center"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-extrabold uppercase tracking-wider text-[10px] text-center shadow-md shadow-primary/10"
                  >
                    Schedule Medication
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
