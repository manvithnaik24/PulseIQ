import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth, useUser } from '@clerk/react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { 
  Home, 
  Sparkles, 
  Activity, 
  Pill, 
  FileText, 
  Users, 
  AlertOctagon, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  Search, 
  Bell, 
  Send, 
  Download, 
  Heart, 
  Moon, 
  Footprints,
  CheckCircle,
  UploadCloud,
  FileCheck,
  ArrowRight,
  MessageSquare,
  Trash2,
  History,
  Plus,
  Clock,
  TrendingUp,
  ShieldAlert,
  Map,
  MapPin,
  Star,
  Printer,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import DashboardHome from '../components/dashboard/DashboardHome'
import AiAssistant from '../components/dashboard/AiAssistant'
import SymptomChecker from '../components/dashboard/SymptomChecker'
import MedicationPlanner from '../components/dashboard/MedicationPlanner'
import ReportSimplifier from '../components/dashboard/ReportSimplifier'
import FamilyHub from '../components/dashboard/FamilyHub'
import EmergencySOS from '../components/dashboard/EmergencySOS'
import UserSettings from '../components/dashboard/UserSettings'
import ReportHistory from '../components/dashboard/ReportHistory'
import AnalysisResults from '../components/dashboard/AnalysisResults'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '${API_BASE_URL}'

function Dashboard() {
  const navigate = useNavigate()
  const { isLoaded, userId, getToken, signOut } = useAuth()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('home') // home, ai_assistant, symptom_checker, medication, reports, family, settings
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('pulseiq_sidebar_collapsed') === 'true')

  // Real-time Notification Logs
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Vitals sync completed successfully.", time: "5m ago", unread: true },
    { id: 2, text: "AI detected mild hydration alert. Drink water.", time: "1h ago", unread: true },
    { id: 3, text: "Upcoming visit with Dr. Vance in 3 days.", time: "1d ago", unread: false }
  ])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  // SOS Emergency Trigger Modal State
  const [showSosModal, setShowSosModal] = useState(false)
  const [sosCountdown, setSosCountdown] = useState(5)
  const [lastActiveSosAlert, setLastActiveSosAlert] = useState(null)
  const sosActiveRef = useRef(false)      // sync guard: is SOS currently active?
  const sirenStartedRef = useRef(false)   // prevents startSirenSound() being called more than once
  const sosDismissedRef = useRef(false)   // user clicked Stand Down — don't let WebSocket reopen modal

  // Medication Reminder State
  const [medicines, setMedicines] = useState([])
  const [newMedName, setNewMedName] = useState('')
  const [newMedTime, setNewMedTime] = useState('Morning (08:00 AM)')
  const [newMedDosage, setNewMedDosage] = useState('1 pill')
  const [showAddMedModal, setShowAddMedModal] = useState(false)
  const [customTimeVal, setCustomTimeVal] = useState('12:00')
  const [activeReminders, setActiveReminders] = useState([])
  const [alertedKeys, setAlertedKeys] = useState(new Set())

  // Calculate adherence rate when medicine checklist changes
  const takenCount = medicines.filter(m => m.taken).length
  const totalCount = medicines.length
  const adherenceRate = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0

  // Web Audio API 1-second Beep
  const playMedicationBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime)
      
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0)

      oscillator.start(audioCtx.currentTime)
      oscillator.stop(audioCtx.currentTime + 1.0)
    } catch (err) {
      console.warn("AudioContext blocked or not supported:", err)
    }
  }

  // Parse time of day formats to standard minutes from midnight
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null
    const twelveHourMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
    if (twelveHourMatch) {
      let hours = parseInt(twelveHourMatch[1], 10)
      const minutes = parseInt(twelveHourMatch[2], 10)
      const period = twelveHourMatch[3].toUpperCase()
      if (period === 'PM' && hours < 12) hours += 12
      if (period === 'AM' && hours === 12) hours = 0
      return hours * 60 + minutes
    }
    
    const twentyFourHourMatch = timeStr.match(/(\d{1,2}):(\d{2})/)
    if (twentyFourHourMatch) {
      const hours = parseInt(twentyFourHourMatch[1], 10)
      const minutes = parseInt(twentyFourHourMatch[2], 10)
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return hours * 60 + minutes
      }
    }
    return null
  }

  // Medication Scheduled Time Checker Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()
      const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`

      medicines.forEach(med => {
        if (med.taken) return

        const medMinutes = parseTimeToMinutes(med.time)
        if (medMinutes === null) return

        if (medMinutes === currentMinutes) {
          const alertKey = `${med.id}-${dateKey}-${currentMinutes}`
          
          if (!alertedKeys.has(alertKey)) {
            playMedicationBeep()

            setActiveReminders(prev => {
              if (prev.some(r => r.id === med.id)) return prev
              return [...prev, med]
            })

            setNotifications(prev => [
              { 
                id: Date.now(), 
                text: `⏰ Time to take your medication: ${med.name} (${med.dosage})!`, 
                time: "Just now", 
                unread: true 
              },
              ...prev
            ])

            setAlertedKeys(prev => {
              const next = new Set(prev)
              next.add(alertKey)
              return next
            })
          }
        }
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [medicines, alertedKeys])

  const handleTakeMedFromReminder = (medId) => {
    toggleMedicine(medId)
    setActiveReminders(prev => prev.filter(r => r.id !== medId))
  }

  const handleDismissReminder = (medId) => {
    setActiveReminders(prev => prev.filter(r => r.id !== medId))
  }

  // Add Medication
  const handleAddMed = async (e) => {
    e.preventDefault()
    if (!newMedName.trim()) return

    let finalTime = newMedTime
    if (newMedTime === 'custom') {
      const [h, m] = customTimeVal.split(':')
      let hourNum = parseInt(h, 10)
      const period = hourNum >= 12 ? 'PM' : 'AM'
      hourNum = hourNum % 12
      hourNum = hourNum ? hourNum : 12
      const hrStr = hourNum < 10 ? `0${hourNum}` : `${hourNum}`
      finalTime = `Custom (${hrStr}:${m} ${period})`
    }

    const token = await getToken()
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    try {
      const res = await fetch('${API_BASE_URL}/api/v1/medications/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newMedName,
          dosage: newMedDosage,
          frequency: "Daily",
          time_of_day: finalTime,
          is_active: true
        })
      })

      if (!res.ok) {
        throw new Error('Failed to create medication')
      }

      const m = await res.json()
      const newMed = {
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        time: m.time_of_day,
        taken: false
      }

      setMedicines(prev => [...prev, newMed])
      setNewMedName('')
      setNewMedDosage('1 pill')
      setShowAddMedModal(false)
      
      setNotifications(prev => [
        { id: Date.now(), text: `New medication ${newMedName} added to schedule.`, time: "Just now", unread: true },
        ...prev
      ])
    } catch (err) {
      console.error(err)
      setNotifications(prev => [
        { id: Date.now(), text: `❌ Failed to add medication: ${newMedName}`, time: "Just now", unread: true },
        ...prev
      ])
    }
  }

  // Toggle Medication taken
  const toggleMedicine = async (id) => {
    const med = medicines.find(m => m.id === id)
    if (!med) return

    const token = await getToken()
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    try {
      // Optimistic update in UI
      setMedicines(prev => prev.map(m => m.id === id ? { ...m, taken: !m.taken } : m))

      const res = await fetch('${API_BASE_URL}/api/v1/medications/taken', {
        method: 'POST',
        headers,
        body: JSON.stringify({ medication_id: id })
      })

      if (!res.ok) {
        throw new Error('Failed to toggle medication')
      }

      setNotifications(prev => [
        { id: Date.now(), text: `${med.name} marked as taken.`, time: "Just now", unread: true },
        ...prev
      ])
    } catch (err) {
      console.error(err)
      // Rollback UI update
      setMedicines(prev => prev.map(m => m.id === id ? { ...m, taken: !m.taken } : m))
      setNotifications(prev => [
        { id: Date.now(), text: `❌ Failed to update medication: ${med.name}`, time: "Just now", unread: true },
        ...prev
      ])
    }
  }

  const deleteMedicine = async (id, name) => {
    const token = await getToken()
    const headers = {
      'Authorization': `Bearer ${token}`
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/medications/${id}`, {
        method: 'DELETE',
        headers
      })

      if (!res.ok) {
        throw new Error('Failed to delete medication')
      }

      setMedicines(prev => prev.filter(m => m.id !== id))
      setNotifications(prev => [
        { id: Date.now(), text: `Removed medication schedule: ${name}`, time: "Just now", unread: true },
        ...prev
      ])
    } catch (err) {
      console.error(err)
      setNotifications(prev => [
        { id: Date.now(), text: `❌ Failed to remove medication: ${name}`, time: "Just now", unread: true },
        ...prev
      ])
    }
  }

  // AI Chat Assistant State with threads
  const [chatThreads, setChatThreads] = useState([
    {
      id: 'default_thread',
      title: 'Vitals & General Health',
      messages: [
        { id: 1, sender: 'ai', text: "Hello! I am your PulseIQ AI Copilot. Ask me anything about your current vitals, sleep parameters, or medication guidelines." }
      ]
    },
    {
      id: 'sleep_thread',
      title: 'Sleep Optimization Logs',
      messages: [
        { id: 1, sender: 'user', text: "Can you analyze my sleep trends?" },
        { id: 2, sender: 'ai', text: "Your sleep logs show an average of 7.8 hours. Your REM ratio is at 88% which is optimal. Ensure you avoid screens at least 30 minutes before sleep to sustain this." }
      ]
    }
  ])
  const [activeThreadId, setActiveThreadId] = useState('default_thread')
  const [chatInput, setChatInput] = useState('')
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [showHistoryMobile, setShowHistoryMobile] = useState(false)
  const chatEndRef = useRef(null)

  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const recognitionRef = useRef(null)



  // Initialize speech recognition on mount or demand
  const initSpeechRecognition = () => {
    if (recognitionRef.current) return recognitionRef.current

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionClass) {
      console.warn("Speech Recognition not supported in this browser.")
      return null
    }

    const recognition = new SpeechRecognitionClass()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      }
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      if (transcript) {
        setChatInput(prev => {
          const prefix = prev.trim() ? prev.trim() + " " : ""
          return prefix + transcript
        })
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech Recognition error:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    return recognition
  }

  const toggleListening = () => {
    const rec = initSpeechRecognition()
    if (!rec) {
      alert("Voice input is not supported in this browser. Please try Chrome or Safari.")
      return
    }

    if (isListening) {
      try {
        rec.stop()
      } catch (_) {}
    } else {
      try {
        rec.start()
      } catch (err) {
        console.error("Failed to start speech recognition:", err)
      }
    }
  }

  const speakText = (text) => {
    if (!window.speechSynthesis || !voiceEnabled) return

    window.speechSynthesis.cancel()
    setIsSpeaking(false)

    if (!text) return

    let cleanText = text
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/#+\s+([^\n]+)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/-\s+/g, '')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    
    const voices = window.speechSynthesis.getVoices()
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')))
    if (englishVoice) {
      utterance.voice = englishVoice
    }
    
    utterance.rate = 1.05
    utterance.pitch = 1.0

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = (e) => {
      console.error("Speech Synthesis error:", e)
      setIsSpeaking(false)
    }

    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices()
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (activeTab !== 'ai_assistant') {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      }
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop()
        } catch (_) {}
      }
    }
  }, [activeTab, isListening])

  const activeThread = chatThreads.find(t => t.id === activeThreadId) || chatThreads[0]
  const chatMessages = activeThread.messages

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isAiTyping])

  const handleSendChat = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
      } catch (_) {}
    }

    const token = await getToken()
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    const textToSend = chatInput
    const userMsg = { id: Date.now(), sender: 'user', text: textToSend }
    
    // Add user message immediately
    setChatThreads(prev => prev.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          messages: [...t.messages, userMsg]
        }
      }
      return t
    }))
    
    setChatInput('')
    setIsAiTyping(true)

    try {
      const res = await fetch('${API_BASE_URL}/api/v1/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: textToSend })
      })

      if (!res.ok) {
        throw new Error('Failed to fetch AI response.')
      }

      const data = await res.json()
      
      let botResponse = data.response
      let recommendedActions = []
      let conditions = []
      let severity = "Low"

      if (data.structured_data) {
        recommendedActions = data.structured_data.recommended_actions || []
        conditions = data.structured_data.potential_conditions || []
        severity = data.structured_data.severity || "Low"
      }

      const botMsg = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: botResponse,
        actions: recommendedActions,
        conditions: conditions,
        severity: severity
      }

      setChatThreads(prev => prev.map(t => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: [...t.messages, botMsg]
          }
        }
        return t
      }))
      
      // Speak the bot response
      speakText(botResponse)

      setNotifications(prev => [
        { id: Date.now(), text: "AI Assistant response compiled.", time: "Just now", unread: true },
        ...prev
      ])
    } catch (err) {
      console.error(err)
      const errorMsg = { id: Date.now() + 1, sender: 'ai', text: "Error: Could not connect to the clinical AI service." }
      setChatThreads(prev => prev.map(t => {
        if (t.id === activeThreadId) {
          return { ...t, messages: [...t.messages, errorMsg] }
        }
        return t
      }))
    } finally {
      setIsAiTyping(false)
    }
  }

  const handleNewChat = () => {
    const newId = 'new_' + Date.now()
    const newThread = {
      id: newId,
      title: 'New Health Consultation',
      messages: [
        { id: 1, sender: 'ai', text: "Hello! I am your PulseIQ AI Copilot. Ask me anything about your current vitals, sleep parameters, or medication guidelines." }
      ]
    }
    setChatThreads(prev => [newThread, ...prev])
    setActiveThreadId(newId)
  }

  const handleDeleteChat = (threadId, e) => {
    e.stopPropagation()
    if (chatThreads.length <= 1) {
      setChatThreads([{
        id: 'default_thread',
        title: 'New Health Consultation',
        messages: [
          { id: 1, sender: 'ai', text: "Hello! I am your PulseIQ AI Copilot. Ask me anything about your current vitals, sleep parameters, or medication guidelines." }
        ]
      }])
      setActiveThreadId('default_thread')
      return
    }

    const filtered = chatThreads.filter(t => t.id !== threadId)
    setChatThreads(filtered)
    if (activeThreadId === threadId) {
      setActiveThreadId(filtered[0].id)
    }
  }

  // Symptom Checker Triage State
  const [symptomInput, setSymptomInput] = useState('')
  const [triageReport, setTriageReport] = useState(null)
  const [checkingSymptom, setCheckingSymptom] = useState(false)

  const handleRunTriage = async (e) => {
    if (e) e.preventDefault()
    if (!symptomInput.trim()) return

    setCheckingSymptom(true)
    setTriageReport(null)

    const token = await getToken()
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    try {
      const res = await fetch('${API_BASE_URL}/api/v1/symptoms/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          symptoms: symptomInput,
          onset_date: new Date().toISOString()
        })
      })

      if (!res.ok) {
        throw new Error('Symptom analysis failed')
      }

      const data = await res.json()
      setTriageReport({
        diagnosis: data.possible_conditions.join(" / ") || "General Evaluation",
        advice: data.recommendations.join(". "),
        risk: data.severity === "High" ? "Critical" : data.severity === "Medium" ? "Moderate" : "Mild",
        inputDesc: data.symptoms,
        reportId: `HG-${data.id}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })

      setNotifications(prev => [
        { id: Date.now(), text: `AI Symptom Checker triage completed: ${data.possible_conditions[0] || 'Triage completed'}.`, time: "Just now", unread: true },
        ...prev
      ])
    } catch (err) {
      console.error(err)
      setNotifications(prev => [
        { id: Date.now(), text: `❌ Failed to execute symptom check.`, time: "Just now", unread: true },
        ...prev
      ])
    } finally {
      setCheckingSymptom(false)
    }
  }

  const resetTriage = () => {
    setSymptomInput('')
    setTriageReport(null)
  }

  // Health Reports State with Simplified breakdowns
  const [reports, setReports] = useState([])
  const [activeReportId, setActiveReportId] = useState(null)
  const [uploadingReport, setUploadingReport] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [completedActions, setCompletedActions] = useState({})
  const [uploadProgress, setUploadProgress] = useState(0)

  // Telemetry factors for risk prediction
  const [riskHeartRate, setRiskHeartRate] = useState(72)
  const [riskSpo2, setRiskSpo2] = useState(98)
  const [riskSleepHours, setRiskSleepHours] = useState(7.5)
  const [riskMedAdherence, setRiskMedAdherence] = useState(85)
  const [riskSymptoms, setRiskSymptoms] = useState({
    chestPain: false,
    shortnessOfBreath: false,
    fever: false,
    fatigue: false,
    headache: false
  })

  // Dynamic Risk Engine calculation
  const calculateRiskScore = () => {
    let score = 5 // Baseline healthy risk score
    
    // Heart rate factors (ideal: 60 - 85 bpm)
    if (riskHeartRate > 100) {
      score += (riskHeartRate - 100) * 0.8 // high HR penalty
    } else if (riskHeartRate < 55) {
      score += (55 - riskHeartRate) * 0.5 // bradycardia penalty
    } else if (riskHeartRate > 85) {
      score += (riskHeartRate - 85) * 0.2 // elevated penalty
    }

    // SpO2 factors (ideal: 95% - 100%)
    if (riskSpo2 < 90) {
      score += (90 - riskSpo2) * 5 + 25 // severe hypoxia penalty
    } else if (riskSpo2 < 95) {
      score += (95 - riskSpo2) * 4 // moderate hypoxia penalty
    }

    // Sleep quality factors (ideal: 7 - 9 hours)
    if (riskSleepHours < 6) {
      score += (6 - riskSleepHours) * 4 // short sleep penalty
    } else if (riskSleepHours > 9.5) {
      score += (riskSleepHours - 9.5) * 2 // excess sleep penalty
    }

    // Medication adherence (ideal: > 85%)
    if (riskMedAdherence < 50) {
      score += (50 - riskMedAdherence) * 0.4 + 15
    } else if (riskMedAdherence < 85) {
      score += (85 - riskMedAdherence) * 0.3
    }

    // Symptoms check (severe vs minor symptoms)
    if (riskSymptoms.chestPain) score += 30
    if (riskSymptoms.shortnessOfBreath) score += 20
    if (riskSymptoms.fever) score += 12
    if (riskSymptoms.fatigue) score += 8
    if (riskSymptoms.headache) score += 5

    // Normalize final score between 0% and 100%
    return Math.min(Math.max(Math.round(score), 0), 100)
  }

  const computedRiskScore = calculateRiskScore()
  
  const getRiskLevel = (score) => {
    if (score >= 50) {
      return { 
        label: 'Critical', 
        color: 'text-rose-600 border-rose-200 bg-rose-50', 
        badgeColor: 'bg-rose-500 text-white', 
        hexColor: '#EF4444',
        glowColor: 'shadow-rose-100'
      }
    }
    if (score >= 20) {
      return { 
        label: 'Moderate', 
        color: 'text-amber-650 border-amber-200 bg-amber-50', 
        badgeColor: 'bg-amber-500 text-white', 
        hexColor: '#F59E0B',
        glowColor: 'shadow-amber-100'
      }
    }
    return { 
      label: 'Low Risk', 
      color: 'text-emerald-650 border-emerald-200 bg-emerald-50', 
      badgeColor: 'bg-emerald-500 text-white', 
      hexColor: '#10B981',
      glowColor: 'shadow-emerald-100'
    }
  }

  const currentRisk = getRiskLevel(computedRiskScore)

  const resetPredictors = () => {
    setRiskHeartRate(72)
    setRiskSpo2(98)
    setRiskSleepHours(7.5)
    setRiskMedAdherence(85)
    setRiskSymptoms({
      chestPain: false,
      shortnessOfBreath: false,
      fever: false,
      fatigue: false,
      headache: false
    })
  }

  // API State Loaders
  const fetchMedications = async () => {
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch('${API_BASE_URL}/api/v1/medications/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const mapped = data.map(m => ({
          id: m.id,
          name: m.name,
          dosage: m.dosage,
          time: m.time_of_day || "Morning (08:00 AM)",
          taken: m.total_doses_scheduled > 0 && m.total_doses_taken >= m.total_doses_scheduled
        }))
        setMedicines(mapped)
        
        const total = data.length
        if (total > 0) {
          const sumRatio = data.reduce((acc, curr) => acc + curr.adherence_ratio, 0)
          setRiskMedAdherence(Math.round(sumRatio / total))
        }
      }
    } catch (err) {
      console.error("Failed to fetch medications:", err)
    }
  }

  const fetchFamilyMembers = async () => {
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch('${API_BASE_URL}/api/v1/family/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const mapped = data.map(f => ({
          id: f.id,
          name: f.name,
          relation: f.relation,
          age: f.age,
          photo: f.photo,
          status: f.status,
          healthScore: f.health_score,
          medAdherence: f.medication_adherence,
          vitals: { hr: f.heart_rate, spo2: f.spo2 },
          phone_number: f.phone_number,
          email: f.email
        }))
        setFamilyMembers(mapped)
      }
    } catch (err) {
      console.error("Failed to fetch family members:", err)
    }
  }

  const fetchReportsHistory = async () => {
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch('${API_BASE_URL}/api/v1/reports/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const mapped = data.map(doc => ({
          id: doc.id,
          title: doc.report_name,
          type: doc.report_type || "Other",
          provider: doc.practitioner_name || doc.facility_name || "PulseIQ Care Provider",
          date: new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          size: doc.file_size || "1.2 MB",
          file_path: doc.file_path,
          simplified: doc.summary,
          findings: doc.key_findings || [],
          abnormal_values: doc.abnormal_values || [],
          risk: doc.risk_level || "Low",
          actions: doc.recommendations || []
        }))
        setReports(mapped)
        if (mapped.length > 0 && !activeReportId) {
          setActiveReportId(mapped[0].id)
        }
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err)
    }
  }

  const fetchChatHistory = async () => {
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch('${API_BASE_URL}/api/v1/ai/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) {
          const messages = data.map(m => {
            let text = m.message
            let actions = []
            let conditions = []
            let severity = "Low"

            if (m.sender === 'bot') {
              try {
                const parsed = JSON.parse(m.message)
                text = parsed.response || m.message
                if (parsed.structured_data) {
                  actions = parsed.structured_data.recommended_actions || []
                  conditions = parsed.structured_data.potential_conditions || []
                  severity = parsed.structured_data.severity || "Low"
                }
              } catch (e) {
                text = m.message
              }
            }

            return {
              id: m.id,
              sender: m.sender === 'user' ? 'user' : 'ai',
              text: text,
              actions: actions,
              conditions: conditions,
              severity: severity
            }
          })
          setChatThreads([
            {
              id: 'default_thread',
              title: 'Consultation History',
              messages: messages
            }
          ])
          setActiveThreadId('default_thread')
        }
      }
    } catch (err) {
      console.error("Failed to fetch chat history:", err)
    }
  }

  const fetchAlertsHistory = async () => {
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch('${API_BASE_URL}/api/v1/sos/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const mapped = data.map(a => ({
          id: a.id,
          type: a.status === "Test Trigger" ? "Simulated SOS Test" : "Manual SOS Alert",
          timestamp: new Date(a.triggered_at).toLocaleString(),
          status: a.status,
          details: `SOS triggered at: ${a.resolved_address || 'Unknown'}. Coordinates: [${a.latitude || 'N/A'}, ${a.longitude || 'N/A'}]`
        }))
        setRecentAlerts(mapped)

        // Find if there is an active emergency incident
        const activeAlert = data.find(a => a.status === "Active")
        if (activeAlert) {
          setLastActiveSosAlert(activeAlert)
          if (!sosDismissedRef.current && sessionStorage.getItem('sos_dismissed') !== 'true') {
            sosActiveRef.current = true
            sirenStartedRef.current = false
            setSosCountdown(0)
            setShowSosModal(true)
          }
        } else {
          setLastActiveSosAlert(null)
        }
      }
    } catch (err) {
      console.error("Failed to fetch SOS history:", err)
    }
  }

  const fetchUserProfile = async () => {
    setProfileLoading(true)
    try {
      const token = await getToken()
      if (!token) return
      const res = await fetch('${API_BASE_URL}/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const profile = await res.json()
        
        // Detect if the database record is using temporary placeholder values
        const isNamePlaceholder = !profile.full_name || profile.full_name.startsWith('clerk_') || profile.full_name === profile.clerk_id
        const isEmailPlaceholder = !profile.email || profile.email.startsWith('clerk_') || profile.email.includes('@example.com')
        
        const finalName = isNamePlaceholder && user?.fullName ? user.fullName : (profile.full_name || '')
        const finalEmail = isEmailPlaceholder && user?.primaryEmailAddress?.emailAddress ? user.primaryEmailAddress.emailAddress : (profile.email || '')
        
        setProfileName(finalName)
        setProfileEmail(finalEmail)
        setProfileAge(profile.age ? String(profile.age) : '28')
        setProfileWeight(profile.weight ? String(profile.weight) : '70')
        setProfileHeight(profile.height ? String(profile.height) : '175')
        setProfileBloodGroup(profile.blood_group || 'O-Positive')
        
        // If we resolved better values from Clerk, sync them back to the database!
        if ((isNamePlaceholder && user?.fullName) || (isEmailPlaceholder && user?.primaryEmailAddress?.emailAddress)) {
          try {
            await fetch('${API_BASE_URL}/api/v1/auth/me', {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                full_name: finalName,
                email: finalEmail
              })
            })
          } catch (syncErr) {
            console.error("Failed to sync Clerk profile to backend DB:", syncErr)
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err)
    } finally {
      setProfileLoading(false)
    }
  }

  // Load state on mount
  useEffect(() => {
    if (userId) {
      fetchUserProfile()
      fetchMedications()
      fetchFamilyMembers()
      fetchReportsHistory()
      fetchChatHistory()
      fetchAlertsHistory()
    }
  }, [userId, user])

  // WebSocket Live Telemetry Stream
  useEffect(() => {
    let socket
    let reconnectTimeout
    let active = true

    const connectWS = async () => {
      try {
        const token = await getToken()
        if (!token || !active) return

        socket = new WebSocket(`${API_BASE_URL.replace(/^http/, 'ws')}/ws/health?token=${token}`)

        socket.onopen = () => {
          console.log("WebSocket connected to PulseIQ live telemetry server.")
        }

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'live_update') {
              if (data.health_metrics) {
                setRiskHeartRate(data.health_metrics.heart_rate || 72)
                setRiskSpo2(data.health_metrics.spo2 || 98)
              }
              if (data.family_dashboard && data.family_dashboard.monitored_patients) {
                const mappedFamily = data.family_dashboard.monitored_patients.map(p => ({
                  id: p.patient_id,
                  name: p.patient_name,
                  relation: "Patient",
                  age: 60,
                  photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
                  status: p.status,
                  healthScore: p.health_score,
                  medAdherence: 90,
                  vitals: { hr: p.heart_rate, spo2: p.spo2 }
                }))
                setFamilyMembers(mappedFamily)
              }
              if (data.dashboard && data.dashboard.status === 'emergency') {
                // Only open the modal if user hasn't manually dismissed it
                if (!sosDismissedRef.current && sessionStorage.getItem('sos_dismissed') !== 'true') {
                  sosActiveRef.current = true
                  sirenStartedRef.current = false
                  setSosCountdown(0)
                  setShowSosModal(true)
                }
              }
            }
          } catch (e) {
            console.error("Error parsing WebSocket JSON message:", e)
          }
        }

        socket.onclose = (event) => {
          console.warn("WebSocket closed. Attempting auto-reconnect in 5 seconds...", event.reason)
          if (active) {
            reconnectTimeout = setTimeout(connectWS, 5000)
          }
        }

        socket.onerror = (err) => {
          console.error("WebSocket encountered error:", err)
          socket.close()
        }
      } catch (err) {
        console.error("Failed to fetch Clerk token for WebSocket connection:", err)
      }
    }

    if (userId) {
      connectWS()
    }

    return () => {
      active = false
      if (socket) {
        socket.onclose = null
        socket.close()
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
  }, [userId])

  // Family Monitoring state
  const [familyMembers, setFamilyMembers] = useState([])

  // Emergency SOS page state
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: "Local EMT Services", relationship: "First Responders", phone: "911", isPrimary: true },
    { id: 2, name: "Dr. Alice Vance", relationship: "Cardiologist", phone: "+1 (555) 932-4112", isPrimary: false },
    { id: 3, name: "Robert Jenkins", relationship: "Father / Primary Caregiver", phone: "+1 (555) 102-4933", isPrimary: false }
  ])
  const [newContactName, setNewContactName] = useState('')
  const [newContactRelation, setNewContactRelation] = useState('Spouse')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [showAddContactModal, setShowAddContactModal] = useState(false)
  const [isLocationSharingActive, setIsLocationSharingActive] = useState(true)

  const [recentAlerts, setRecentAlerts] = useState([])

  // Web Audio Context & Oscillator Refs for siren
  const audioCtxRef = useRef(null)
  const sirenOsc1Ref = useRef(null)
  const sirenOsc2Ref = useRef(null)
  const sirenGainRef = useRef(null)

  const startSirenSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) return

      audioCtxRef.current = new AudioContextClass()
      sirenGainRef.current = audioCtxRef.current.createGain()
      sirenGainRef.current.gain.setValueAtTime(0.12, audioCtxRef.current.currentTime)

      sirenOsc1Ref.current = audioCtxRef.current.createOscillator()
      sirenOsc2Ref.current = audioCtxRef.current.createOscillator()

      sirenOsc1Ref.current.type = 'sawtooth'
      sirenOsc2Ref.current.type = 'sine'

      sirenOsc1Ref.current.frequency.setValueAtTime(500, audioCtxRef.current.currentTime)
      sirenOsc2Ref.current.frequency.setValueAtTime(1.5, audioCtxRef.current.currentTime)

      const modulationGain = audioCtxRef.current.createGain()
      modulationGain.gain.setValueAtTime(180, audioCtxRef.current.currentTime)

      sirenOsc2Ref.current.connect(modulationGain)
      modulationGain.connect(sirenOsc1Ref.current.frequency)

      sirenOsc1Ref.current.connect(sirenGainRef.current)
      sirenGainRef.current.connect(audioCtxRef.current.destination)

      sirenOsc1Ref.current.start()
      sirenOsc2Ref.current.start()
    } catch (err) {
      console.error("Failed to start siren synthesizer:", err)
    }
  }

  const stopSirenSound = () => {
    // Step 1: Zero the gain immediately for instant silence
    try {
      if (sirenGainRef.current && audioCtxRef.current) {
        sirenGainRef.current.gain.cancelScheduledValues(audioCtxRef.current.currentTime)
        sirenGainRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime)
      }
    } catch (_) {}
    // Step 2: Stop oscillators
    try { if (sirenOsc1Ref.current) { sirenOsc1Ref.current.stop(); sirenOsc1Ref.current.disconnect() } } catch (_) {}
    try { if (sirenOsc2Ref.current) { sirenOsc2Ref.current.stop(); sirenOsc2Ref.current.disconnect() } } catch (_) {}
    // Step 3: Close and discard the AudioContext
    try { if (audioCtxRef.current) { audioCtxRef.current.close() } } catch (_) {}
    sirenOsc1Ref.current = null
    sirenOsc2Ref.current = null
    sirenGainRef.current = null
    audioCtxRef.current = null
    sirenStartedRef.current = false
  }

  const handleStandDown = async () => {
    sosActiveRef.current = false          // block any new effect from restarting
    sosDismissedRef.current = true        // prevent WebSocket from reopening the modal
    sessionStorage.setItem('sos_dismissed', 'true')
    stopSirenSound()                      // kill audio instantly
    if (navigator.vibrate) navigator.vibrate(0)
    setShowSosModal(false)               // close modal
    setSosCountdown(5)                   // reset countdown for next use
    setLastActiveSosAlert(null)          // clear active alert state
    setNotifications(prev => [
      { id: Date.now(), text: '✅ SOS stand down — emergency deactivated.', time: 'Just now', unread: true },
      ...prev
    ])

    try {
      const token = await getToken()
      await fetch('${API_BASE_URL}/api/v1/sos/resolve', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchAlertsHistory()
    } catch (err) {
      console.error('Failed to resolve SOS in database:', err)
    }
  }

  // Live GPS Geolocation States
  const [gpsLatitude, setGpsLatitude] = useState(null)
  const [gpsLongitude, setGpsLongitude] = useState(null)
  const [gpsAccuracy, setGpsAccuracy] = useState(null)
  const [gpsLocationName, setGpsLocationName] = useState('San Francisco, CA, US')
  const [gpsLastUpdated, setGpsLastUpdated] = useState('Never updated')
  const [gpsStatus, setGpsStatus] = useState('Initializing...')
  const [gpsPermission, setGpsPermission] = useState('prompt')
  const [isGpsRefreshing, setIsGpsRefreshing] = useState(false)

  const fetchLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported by browser.')
      return
    }

    setIsGpsRefreshing(true)
    setGpsStatus('Accessing GPS sensor...')

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        const acc = position.coords.accuracy
        const timestamp = position.timestamp
        setGpsLatitude(lat.toFixed(6))
        setGpsLongitude(lon.toFixed(6))
        setGpsAccuracy(acc ? Math.round(acc) : null)
        setGpsPermission('granted')
        setGpsStatus('GPS Synchronized')

        let foundName = ''
        
        // 1. Try backend (only if authenticated)
        try {
          const token = await getToken()
          if (token) {
            const updateRes = await fetch('${API_BASE_URL}/api/v1/location/update', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                latitude: lat, 
                longitude: lon,
                accuracy: acc,
                timestamp: timestamp
              })
            })

            if (updateRes.ok) {
              const locData = await updateRes.json()
              const parts = [locData.city, locData.state, locData.country].filter(Boolean)
              if (parts.length > 0) foundName = parts.join(', ')
            }
          }
        } catch (e) { console.error("Backend geocoding failed", e) }

        // 2. Try Nominatim if backend returned empty
        if (!foundName) {
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
              headers: { 'Accept': 'application/json', 'User-Agent': 'PulseIQ/1.0' }
            })
            if (response.ok) {
              const data = await response.json()
              const addr = data.address || {}
              const parts = [addr.city || addr.town || addr.village, addr.state, addr.country].filter(Boolean)
              foundName = parts.join(', ') || data.display_name
            }
          } catch (e) { console.error("Nominatim geocoding failed", e) }
        }

        // 3. Last Resort
        setGpsLocationName(foundName || `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`)
        setGpsLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
        setIsGpsRefreshing(false)
      },
      (error) => {
        setIsGpsRefreshing(false)
        setGpsAccuracy(null)
        if (error.code === error.PERMISSION_DENIED) {
          setGpsPermission('denied')
          setGpsStatus('Permission Denied')
          setGpsLocationName('Location access was denied. Please enable location permissions.')
        } else {
          setGpsStatus(`Error: ${error.message}`)
          setGpsLocationName(`Lat: ${gpsLatitude || '37.7749'}, Lon: ${gpsLongitude || '-122.4194'}`)
        }
      },
      options
    )
  }

  // Nearby Emergency Services States
  const [servicesList, setServicesList] = useState([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [servicesFilter, setServicesFilter] = useState('all')
  const [selectedServiceId, setSelectedServiceId] = useState(null)
  const [showDirectionsToId, setShowDirectionsToId] = useState(null)

  // Feedback Analysis States
  const [feedbackList, setFeedbackList] = useState([
    {
      id: 1,
      name: "Dr. Sarah Jenkins",
      email: "s.jenkins@pulseiq.org",
      role: "physician",
      rating: 5,
      category: "Usability",
      comment: "The caregiver portal has significantly improved how I coordinate medication updates with my patients' families. The adherence metrics are highly accurate.",
      timestamp: "2 hours ago",
      resolved: true
    },
    {
      id: 2,
      name: "Robert Miller",
      email: "robert.m@gmail.com",
      role: "caregiver",
      rating: 4,
      category: "Care Quality",
      comment: "Monitoring my elderly mother's vitals remotely gives me great peace of mind. The SpO2 low alarm saved us a trip to the hospital last week. Very responsive.",
      timestamp: "1 day ago",
      resolved: false
    },
    {
      id: 3,
      name: "Alice Thompson",
      email: "alice.t@yahoo.com",
      role: "patient",
      rating: 5,
      category: "Speed",
      comment: "Getting my lab reports simplified instantly is my favorite feature. The AI translations make complex medical jargon easy to understand without waiting for doctor calls.",
      timestamp: "3 days ago",
      resolved: true
    },
    {
      id: 4,
      name: "David Vance",
      email: "d.vance@clinic.net",
      role: "physician",
      rating: 3,
      category: "Bug Report",
      comment: "The PDF reports parser sometimes misses the clinical unit symbols on older scans. The text simplification is accurate but please look into the scanner OCR parsing.",
      timestamp: "5 days ago",
      resolved: false
    },
    {
      id: 5,
      name: "Emily Watson",
      email: "emily.watson@care.com",
      role: "caregiver",
      rating: 2,
      category: "Usability",
      comment: "It is hard to navigate the Emergency Contacts page on smaller mobile screens. The buttons are close together and could benefit from larger padding targets.",
      timestamp: "1 week ago",
      resolved: false
    }
  ])

  const [feedbackName, setFeedbackName] = useState('')
  const [feedbackEmail, setFeedbackEmail] = useState('')
  const [feedbackRole, setFeedbackRole] = useState('patient')
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackCategory, setFeedbackCategory] = useState('Usability')
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)

  const [filterRating, setFilterRating] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  const handleSubmitFeedback = (e) => {
    e.preventDefault()
    if (!feedbackName.trim() || !feedbackEmail.trim() || !feedbackComment.trim()) {
      alert("Please fill in all required fields.")
      return
    }

    const newFeedback = {
      id: Date.now(),
      name: feedbackName,
      email: feedbackEmail,
      role: feedbackRole,
      rating: Number(feedbackRating),
      category: feedbackCategory,
      comment: feedbackComment,
      timestamp: "Just now",
      resolved: false
    }

    setFeedbackList([newFeedback, ...feedbackList])
    setFeedbackSuccess(true)

    // Reset Form Fields
    setFeedbackName('')
    setFeedbackEmail('')
    setFeedbackRole('patient')
    setFeedbackRating(5)
    setFeedbackCategory('Usability')
    setFeedbackComment('')

    setTimeout(() => {
      setFeedbackSuccess(false)
    }, 4500)
  }

  // Report Generator States
  const [reportTitle, setReportTitle] = useState('Monthly Biometric Assessment')
  const [reportPractitioner, setReportPractitioner] = useState('Dr. Sarah Jenkins, MD')
  const [reportFacility, setReportFacility] = useState('PulseIQ Diagnostics & Care')
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0])
  const [reportId, setReportId] = useState('PIQ-2026-887410')

  useEffect(() => {
    const timer = setTimeout(() => {
      setReportId(`PIQ-2026-${Math.floor(100000 + Math.random() * 900000)}`)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Dynamic Clinical Recommendations Compiler for A4 Report Preview
  const getReportRecommendations = () => {
    const recs = []
    
    // Heart Rate
    if (riskHeartRate > 100) {
      recs.push({
        id: 'hr_high',
        text: 'Elevated resting heart rate tachycardia (>100 bpm) detected. Restrict caffeine/stimulants, practice guided breathing, and schedule outpatient cardiology screening.',
        severity: 'warning'
      })
    } else if (riskHeartRate < 55) {
      recs.push({
        id: 'hr_low',
        text: 'Sinus bradycardia (heart rate < 55 bpm) observed. Triage for dizziness, and evaluate active medication lists for beta-blockers under clinical supervision.',
        severity: 'warning'
      })
    } else {
      recs.push({
        id: 'hr_normal',
        text: 'Cardiac rate logs reside within optimal parameters (60-85 bpm). Continue daily moderate aerobic activities.',
        severity: 'optimal'
      })
    }

    // SpO2
    if (riskSpo2 < 95) {
      recs.push({
        id: 'spo2_low',
        text: 'URGENT: Oxygen saturation level logs below target (<95% SpO2), indicating transient hypoxia hazard. Prepare supplemental therapy and seek immediate clinical care.',
        severity: 'critical'
      })
    } else {
      recs.push({
        id: 'spo2_normal',
        text: 'Systemic blood oxygenation maintains optimal cellular saturation levels (>95% SpO2). No oxygen titration indicated.',
        severity: 'optimal'
      })
    }

    // Sleep
    if (riskSleepHours < 6.5) {
      recs.push({
        id: 'sleep_low',
        text: 'Mild sleep duration deficit noted. Establish consistent circadian rhythms, restrict evening electronics, and aim for 7.5+ restorative sleep hours.',
        severity: 'caution'
      })
    } else if (riskSleepHours > 9.5) {
      recs.push({
        id: 'sleep_high',
        text: 'Hypersomnia sleep metrics logged (>9.5 hrs). Assess for diagnostic causes like sleep apnea if combined with morning fatigue.',
        severity: 'caution'
      })
    } else {
      recs.push({
        id: 'sleep_normal',
        text: 'Sleep quantity and cycles meet standard neurological and metabolic recovery thresholds.',
        severity: 'optimal'
      })
    }

    // Med Adherence
    if (riskMedAdherence < 80) {
      recs.push({
        id: 'med_low',
        text: 'Medication compliance falls below target parameters (80%). We recommend automated pill containers, visual checklists, or pharmacy prescription sync alerts.',
        severity: 'warning'
      })
    } else {
      recs.push({
        id: 'med_normal',
        text: 'Excellent pharmaceutical adherence. Continue current prescription protocols.',
        severity: 'optimal'
      })
    }

    // Symptoms
    if (riskSymptoms.chestPain || riskSymptoms.shortnessOfBreath) {
      recs.push({
        id: 'symptom_emergency',
        text: 'CRITICAL: Severe clinical warning indicators (Chest Pain / Shortness of Breath) active. Seek emergency medical dispatch immediately.',
        severity: 'critical'
      })
    } else if (riskSymptoms.fever || riskSymptoms.fatigue || riskSymptoms.headache) {
      recs.push({
        id: 'symptom_warning',
        text: 'General system symptoms logged (Fever/Fatigue/Headache). Stay hydrated, rest, and arrange telemedicine review if symptoms persist >48 hours.',
        severity: 'warning'
      })
    }

    return recs
  }

  const handlePrintReport = async () => {
    const token = await getToken()
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    try {
      setNotifications(prev => [
        { id: Date.now(), text: "Generating PDF health assessment report...", time: "Just now", unread: true },
        ...prev
      ])

      const res = await fetch('${API_BASE_URL}/api/v1/reports/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          practitioner_name: reportPractitioner,
          facility_name: reportFacility,
          report_title: reportTitle
        })
      })

      if (!res.ok) {
        throw new Error('Failed to generate report PDF.')
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportTitle.replace(/\s+/g, '_')}_${reportId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      fetchReportsHistory()

      setNotifications(prev => [
        { id: Date.now(), text: "PDF Health Report downloaded successfully.", time: "Just now", unread: true },
        ...prev
      ])
    } catch (err) {
      console.error(err)
      setNotifications(prev => [
        { id: Date.now(), text: `❌ Failed to generate report: ${err.message}`, time: "Just now", unread: true },
        ...prev
      ])
    }
  }

  const fetchNearbyServices = async (lat, lon) => {
    const baseLat = lat ? Number(lat) : 37.7749
    const baseLon = lon ? Number(lon) : -122.4194

    const token = await getToken()
    const headers = {
      'Authorization': `Bearer ${token}`
    }

    try {
      const urls = [
        { url: `${API_BASE_URL}/api/v1/nearby/hospitals?latitude=${baseLat}&longitude=${baseLon}`, type: 'hospital' },
        { url: `${API_BASE_URL}/api/v1/nearby/pharmacies?latitude=${baseLat}&longitude=${baseLon}`, type: 'pharmacy' },
        { url: `${API_BASE_URL}/api/v1/nearby/ambulances?latitude=${baseLat}&longitude=${baseLon}`, type: 'ambulance' }
      ]

      const responses = await Promise.all(
        urls.map(item =>
          fetch(item.url, { headers })
            .then(res => res.ok ? res.json() : [])
            .then(data => data.map(d => ({
              id: `${item.type}-${d.name}-${d.latitude}`,
              name: d.name,
              type: item.type,
              distance: d.distance.toFixed(1),
              latitude: d.latitude,
              longitude: d.longitude,
              phone: item.type === 'hospital' ? "+1 (555) 120-3000" : item.type === 'pharmacy' ? "+1 (555) 765-4321" : "+1 (555) 234-9111",
              address: `${Math.floor(d.latitude * 1000) % 900 + 100} Health Ave`
            })))
            .catch(() => [])
        )
      )

      return responses.flat().sort((a, b) => Number(a.distance) - Number(b.distance))
    } catch (err) {
      console.error("Failed to fetch nearby services:", err)
      return []
    }
  }

  // Effect to load nearby services on coordinates change — only when authenticated
  useEffect(() => {
    if (!userId) return
    const lat = gpsLatitude ? Number(gpsLatitude) : 37.7749
    const lon = gpsLongitude ? Number(gpsLongitude) : -122.4194
    
    let active = true
    const timer = setTimeout(() => {
      if (!active) return
      setServicesLoading(true)
      fetchNearbyServices(lat, lon).then(data => {
        if (!active) return
        setServicesList(data)
        setServicesLoading(false)
      })
    }, 0)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [gpsLatitude, gpsLongitude, userId])

  // Hook for Geolocation Setup & Timer — only when authenticated
  useEffect(() => {
    if (!userId) return

    const timer = setTimeout(() => {
      fetchLiveLocation()
    }, 0)

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setGpsPermission(result.state)
        result.onchange = () => {
          setGpsPermission(result.state)
          if (result.state === 'granted') {
            fetchLiveLocation()
          }
        }
      }).catch(err => console.log("Permissions API query failed:", err))
    }

    const interval = setInterval(() => {
      fetchLiveLocation()
    }, 30000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [userId])

  const handleAddContact = (e) => {
    e.preventDefault()
    if (!newContactName.trim() || !newContactPhone.trim()) return

    const newContact = {
      id: Date.now(),
      name: newContactName,
      relationship: newContactRelation,
      phone: newContactPhone,
      isPrimary: false
    }

    setEmergencyContacts(prev => [...prev, newContact])
    setNewContactName('')
    setNewContactPhone('')
    setNewContactRelation('Spouse')
    setShowAddContactModal(false)

    setNotifications(prev => [
      { id: Date.now(), text: `New contact ${newContactName} added to emergency list.`, time: "Just now", unread: true },
      ...prev
    ])
  }

  const handleDeleteContact = (id, name) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== id))
    setNotifications(prev => [
      { id: Date.now(), text: `Removed ${name} from emergency contacts.`, time: "Just now", unread: true },
      ...prev
    ])
  }



  const activeReport = reports.find(r => r.id === activeReportId) || reports[0]

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
      processFile(file)
    }
  }

  const handleFileChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const processFile = async (fileOrName, reportType = "Other", optionalSize) => {
    if (typeof fileOrName === 'string') {
      setUploadingReport(true)
      setUploadProgress(0)
      const fileName = fileOrName
      const fileSize = optionalSize
      const formattedSize = fileSize 
        ? (fileSize / (1024 * 1024)).toFixed(1) + " MB" 
        : "1.2 MB"

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 25
        })
      }, 300)

      setTimeout(() => {
        setUploadingReport(false)
        setUploadProgress(0)
        const newReportId = String(Date.now())
        
        const lowerName = fileName.toLowerCase()
        let diagnosis = "Urinalysis Diagnostic Log"
        let risk = "Low"
        let simplified = "Your urinalysis results are entirely clear, indicating healthy kidney function and metabolic balance. No signs of infection, protein leakage, or glucose elevations were observed."
        let findings = [
          "Protein: Negative (Optimal)",
          "Glucose: Negative (Normal)",
          "Specific Gravity: 1.018 (Optimal Hydration)",
          "pH Level: 6.0 (Healthy Range)"
        ]
        let actions = [
          "Continue drinking plenty of fluids to sustain kidney function.",
          "Maintain your standard periodic screening guidelines."
        ]

        if (lowerName.includes('blood') || lowerName.includes('cbc')) {
          diagnosis = "Hematology Analysis Log"
          risk = "Low"
          simplified = "Your hematology (blood cell count) analysis shows stable levels. Red cells, platelets, and immunity indicators fall well within baseline standards."
          findings = [
            "Hemoglobin: 14.2 g/dL (Normal)",
            "White Blood Cell: 5.8 x10^3/uL (Normal)",
            "Platelets: 280 x10^3/uL (Normal)"
          ]
          actions = [
            "Maintain current balanced diet and vitamin intakes."
          ]
        } else if (lowerName.includes('thyroid') || lowerName.includes('tsh') || lowerName.includes('hormone')) {
          diagnosis = "Endocrine Thyroid Log"
          risk = "Moderate"
          simplified = "Your thyroid stimulating hormone (TSH) level is slightly elevated, suggesting your thyroid gland is working a bit harder than average (mild hypothyroidism)."
          findings = [
            "TSH Level: 5.2 mIU/L (Slightly High)",
            "Free T4: 1.1 ng/dL (Normal Range)",
            "Free T3: 3.1 pg/mL (Normal Range)"
          ]
          actions = [
            "Discuss potential thyroid monitoring with a primary physician.",
            "Check iodine level intake, sleep quality, and stress markers."
          ]
        } else if (lowerName.includes('lipid') || lowerName.includes('cholesterol')) {
          diagnosis = "Lipid Profile Assessment"
          risk = "Moderate"
          simplified = "Your cholesterol profile shows borderline elevated LDL (often called 'bad' cholesterol) while your HDL ('good' cholesterol) and triglycerides remain in stable, healthy ranges."
          findings = [
            "Total Cholesterol: 220 mg/dL (Borderline High)",
            "LDL Cholesterol: 142 mg/dL (Elevated)",
            "HDL Cholesterol: 56 mg/dL (Optimal)",
            "Triglycerides: 115 mg/dL (Normal)"
          ]
          actions = [
            "Reduce consumption of saturated fats and trans fats in your daily meals.",
            "Increase soluble fiber intake (oats, beans, Brussels sprouts).",
            "Integrate 30 minutes of moderate aerobic exercise daily.",
            "Re-evaluate lipid panel metrics in 6 months."
          ]
        } else if (lowerName.includes('cardiac') || lowerName.includes('stress') || lowerName.includes('heart')) {
          diagnosis = "Cardiac Stress Test Summary"
          risk = "Low"
          simplified = "Your cardiac exercise tolerance test indicates healthy cardiovascular performance under stress workloads. No abnormal electrical patterns or signs of oxygen deficit were detected."
          findings = [
            "Target Heart Rate Reached: 168 bpm (96% of target)",
            "Blood Pressure Response: Normal systolic rise, stable diastolic",
            "ECG Patterns: No ST-segment depressions observed",
            "Exercise Duration: 12 minutes (Bruce Protocol)"
          ]
          actions = [
            "Maintain current cardiovascular conditioning schedule.",
            "Review routine ECG rhythms during annual wellness consults."
          ]
        } else if (lowerName.includes('metabolic') || lowerName.includes('cmp') || lowerName.includes('kidney') || lowerName.includes('liver')) {
          diagnosis = "Comprehensive Metabolic Panel"
          risk = "Low"
          simplified = "Your metabolic profile indicates normal organ function, fluid balance, and electrolyte levels. Kidney and liver enzyme values are optimal."
          findings = [
            "Glucose: 94 mg/dL (Normal)",
            "BUN: 15 mg/dL (Normal)",
            "Creatinine: 0.85 mg/dL (Normal)",
            "Sodium: 139 mEq/L (Normal)",
            "Potassium: 4.2 mEq/L (Normal)"
          ]
          actions = [
            "Maintain balanced hydration levels.",
            "Keep following a nutrient-rich, low-sodium dietary pattern."
          ]
        }

        const mockReport = {
          id: newReportId,
          title: fileName.endsWith('.pdf') ? fileName : fileName + '.pdf',
          type: reportType,
          provider: diagnosis,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          size: formattedSize,
          file_path: `/static/reports/mock_${newReportId}.pdf`,
          simplified,
          findings,
          risk,
          actions
        }

        setReports(prev => [mockReport, ...prev])
        setActiveReportId(newReportId)
        
        setNotifications(prev => [
          { id: Date.now(), text: `Mock report created: ${fileName}`, time: "Just now", unread: true },
          ...prev
        ])
      }, 1500)
      return
    }

    const file = fileOrName
    setUploadingReport(true)
    setUploadProgress(0)

    const token = await getToken()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('report_type', reportType)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '${API_BASE_URL}/api/v1/reports/upload')
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100)
        setUploadProgress(percent)
      }
    }

    xhr.onload = () => {
      setUploadingReport(false)
      setUploadProgress(0)
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const reportData = JSON.parse(xhr.responseText)
          const newReport = {
            id: reportData.id,
            title: reportData.report_name,
            type: reportData.report_type,
            provider: reportData.practitioner_name || reportData.facility_name || "PulseIQ Care Provider",
            date: new Date(reportData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            size: reportData.file_size || "1.2 MB",
            file_path: reportData.file_path,
            simplified: reportData.summary || "Clinical details pending review.",
            findings: reportData.key_findings || [],
            abnormal_values: reportData.abnormal_values || [],
            risk: reportData.risk_level || "Low",
            actions: reportData.recommendations || []
          }

          setReports(prev => [newReport, ...prev])
          setActiveReportId(reportData.id)
          setActiveTab('analysis_results')

          setNotifications(prev => [
            { id: Date.now(), text: `Report uploaded successfully: ${file.name}`, time: "Just now", unread: true },
            ...prev
          ])
        } catch (err) {
          console.error("Error parsing upload response:", err)
          setNotifications(prev => [
            { id: Date.now(), text: `❌ Report processing failed: Invalid server response.`, time: "Just now", unread: true },
            ...prev
          ])
        }
      } else {
        let errMsg = "Upload failed."
        try {
          const errData = JSON.parse(xhr.responseText)
          errMsg = errData.detail || errMsg
        } catch (_) {}
        setNotifications(prev => [
          { id: Date.now(), text: `❌ Report upload failed: ${errMsg}`, time: "Just now", unread: true },
          ...prev
        ])
      }
    }

    xhr.onerror = () => {
      setUploadingReport(false)
      setUploadProgress(0)
      setNotifications(prev => [
        { id: Date.now(), text: `❌ Connection error during report upload.`, time: "Just now", unread: true },
        ...prev
      ])
    }

    xhr.send(formData)
  }

  const reanalyzeReport = async (reportId, extractedText) => {
    const token = await getToken()
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    const res = await fetch('${API_BASE_URL}/api/v1/reports/analyze', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        report_id: reportId,
        extracted_text: extractedText
      })
    })

    if (!res.ok) {
      let errMsg = "AI report analysis failed."
      try {
        const errData = await res.json()
        errMsg = errData.detail || errMsg
      } catch (_) {}
      throw new Error(errMsg)
    }

    const updatedData = await res.json()
    
    // Update local state
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          provider: updatedData.practitioner_name || updatedData.facility_name || r.provider,
          simplified: updatedData.summary || r.simplified,
          findings: updatedData.key_findings || [],
          abnormal_values: updatedData.abnormal_values || [],
          risk: updatedData.risk_level || "Low",
          actions: updatedData.recommendations || []
        }
      }
      return r
    }))

    setNotifications(prev => [
      { id: Date.now(), text: "AI report analysis successfully updated.", time: "Just now", unread: true },
      ...prev
    ])
  }

  const deleteReport = async (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation()
    
    const token = await getToken()
    const headers = {
      'Authorization': `Bearer ${token}`
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/reports/${id}`, {
        method: 'DELETE',
        headers
      })

      if (!res.ok) {
        throw new Error('Failed to delete report from vault')
      }

      const remaining = reports.filter(r => r.id !== id)
      setReports(remaining)
      if (activeReportId === id) {
        if (remaining.length > 0) {
          setActiveReportId(remaining[0].id)
        } else {
          setActiveReportId(null)
        }
      }

      setNotifications(prev => [
        { id: Date.now(), text: `Report successfully removed from your vault.`, time: "Just now", unread: true },
        ...prev
      ])
    } catch (err) {
      console.error(err)
      setNotifications(prev => [
        { id: Date.now(), text: `❌ Failed to delete report: ${err.message}`, time: "Just now", unread: true },
        ...prev
      ])
    }
  }

  // Helper to read current session info synchronously during state init
  const getStoredUser = () => {
    const session = localStorage.getItem('currentUser')
    if (session) {
      try {
        return JSON.parse(session)
      } catch {
        return null
      }
    }
    return null
  }

  // Settings / Profile Info State
  const [profileName, setProfileName] = useState(() => {
    const user = getStoredUser()
    return user?.name || 'Sarah Jenkins'
  })
  const [profileEmail, setProfileEmail] = useState(() => {
    const user = getStoredUser()
    return user?.email || 'sarah@example.com'
  })
  const [profileAge, setProfileAge] = useState(() => {
    const user = getStoredUser()
    if (user?.dob) {
      const birthYear = new Date(user.dob).getFullYear()
      const currentYear = new Date().getFullYear()
      if (!isNaN(birthYear)) {
        return String(currentYear - birthYear)
      }
    }
    return '28'
  })
  const [profileWeight, setProfileWeight] = useState(() => {
    const user = getStoredUser()
    return user?.weight || '62'
  })
  const [profileHeight, setProfileHeight] = useState(() => {
    const user = getStoredUser()
    return user?.height || '168'
  })
  const [profileBloodGroup, setProfileBloodGroup] = useState(() => {
    const user = getStoredUser()
    return user?.bloodGroup || 'O-Positive'
  })
  const [settingsSuccess, setSettingsSuccess] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  // Auth Guard
  useEffect(() => {
    if (isLoaded && !userId) {
      navigate('/login')
    }
  }, [isLoaded, userId, navigate])

  // Unified SOS Effect: handles countdown tick AND siren/dispatch when it hits 0
  useEffect(() => {
    if (!showSosModal || !sosActiveRef.current) return

    if (sosCountdown > 0) {
      // Still counting down — tick once per second
      if (navigator.vibrate) navigator.vibrate(100)
      const timer = setTimeout(() => setSosCountdown(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    }

    // sosCountdown === 0: fire the SOS alert (only once per activation)
    if (sirenStartedRef.current) return  // already started — do not re-run
    sirenStartedRef.current = true

    startSirenSound()

    const vibratePattern = [400, 200, 400, 200, 400, 200]
    if (navigator.vibrate) navigator.vibrate(vibratePattern)

    const vibrationInterval = navigator.vibrate
      ? setInterval(() => {
          if (!sosActiveRef.current) { clearInterval(vibrationInterval); navigator.vibrate(0); return }
          navigator.vibrate(vibratePattern)
        }, 1800)
      : null

    const sendSosAlert = async (lat, lon) => {
      try {
        const token = await getToken()
        const res = await fetch('${API_BASE_URL}/api/v1/sos/trigger', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: Number(lat),
            longitude: Number(lon),
            resolved_address: gpsLocationName || 'Unknown Location'
          })
        })
        if (res.ok) {
          const data = await res.json()
          setLastActiveSosAlert(data)
          setNotifications(prev => [
            { id: Date.now(), text: '🚨 EMERGENCY SOS SYSTEM ACTIVATED. Responders notified.', time: 'Just now', unread: true },
            ...prev
          ])
          fetchAlertsHistory()
        }
      } catch (err) {
        console.error('Failed to trigger SOS:', err)
      }
    }

    const triggerEmergencySOS = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude
            const lon = position.coords.longitude
            setGpsLatitude(lat.toFixed(6))
            setGpsLongitude(lon.toFixed(6))
            setGpsAccuracy(position.coords.accuracy ? Math.round(position.coords.accuracy) : null)
            await sendSosAlert(lat, lon)
          },
          async (err) => {
            console.warn("Could not capture fresh GPS coordinates, using fallbacks:", err)
            await sendSosAlert(Number(gpsLatitude || 37.7749), Number(gpsLongitude || -122.4194))
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        )
      } else {
        sendSosAlert(Number(gpsLatitude || 37.7749), Number(gpsLongitude || -122.4194))
      }
    }

    triggerEmergencySOS()

    return () => { if (vibrationInterval) clearInterval(vibrationInterval) }
  }, [showSosModal, sosCountdown])

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const saveSettings = async (e) => {
    e.preventDefault()
    
    try {
      const token = await getToken()
      if (!token) return

      const response = await fetch('${API_BASE_URL}/api/v1/auth/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: profileName,
          email: profileEmail,
          age: Number(profileAge) || null,
          weight: Number(profileWeight) || null,
          height: Number(profileHeight) || null,
          blood_group: profileBloodGroup
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile settings')
      }

      setSettingsSuccess(true)
      setTimeout(() => setSettingsSuccess(false), 3000)

      setNotifications(prev => [
        { id: Date.now(), text: "Patient profile parameters successfully updated.", time: "Just now", unread: true },
        ...prev
      ])
    } catch (err) {
      console.error(err)
      setNotifications(prev => [
        { id: Date.now(), text: "❌ Failed to update profile settings.", time: "Just now", unread: true },
        ...prev
      ])
    }
  }

  const getInitials = (name) => {
    if (!name) return 'PT'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const unreadCount = notifications.filter(n => n.unread).length

  // Menu items list mapping
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { id: 'ai_assistant', label: 'AI Assistant', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'symptom_checker', label: 'Symptom Checker', icon: <Activity className="w-5 h-5" /> },
    { id: 'medication', label: 'Medication Reminder', icon: <Pill className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports Simplifier', icon: <FileText className="w-5 h-5" /> },
    { id: 'analysis_results', label: 'Analysis Results', icon: <FileCheck className="w-5 h-5" /> },
    { id: 'report_history', label: 'Report History', icon: <History className="w-5 h-5" /> },
    { id: 'family', label: 'Family Care', icon: <Users className="w-5 h-5" /> },
    { id: 'sos', label: 'Emergency SOS', icon: <AlertOctagon className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ]

  // Handle Tab Switch / Action
  const handleTabSelect = (tabId) => {
    setActiveTab(tabId)
    setShowMobileMenu(false)
  }

  return (
    <div className="min-h-screen bg-bg-custom text-slate-800 flex flex-col md:flex-row">
      
      {/* Sidebar for Desktop */}
      <aside className={`print:hidden hidden md:flex ${isSidebarCollapsed ? 'w-20 p-4' : 'w-64 p-6'} bg-white border-r border-slate-100 flex-col justify-between shrink-0 transition-all duration-300 ease-in-out z-20 shadow-sm`}>
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-2">
            <Link to="/dashboard" onClick={() => setActiveTab('home')} className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight truncate">
              <Activity className="w-5 h-5 animate-pulse shrink-0" />
              {!isSidebarCollapsed && <span>PulseIQ</span>}
            </Link>
            <button 
              onClick={() => {
                const nextVal = !isSidebarCollapsed;
                setIsSidebarCollapsed(nextVal);
                localStorage.setItem('pulseiq_sidebar_collapsed', String(nextVal));
              }}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors hidden md:block shrink-0"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center gap-0 px-2' : 'gap-3 px-4'} py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  tab.id === 'sos'
                    ? activeTab === 'sos'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                      : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                    : activeTab === tab.id 
                      ? 'bg-primary text-white shadow-lg shadow-primary/10' 
                      : 'text-slate-500 hover:text-primary hover:bg-slate-50'
                }`}
                title={isSidebarCollapsed ? tab.label : undefined}
              >
                <span className="shrink-0">{tab.icon}</span>
                {!isSidebarCollapsed && <span className="truncate">{tab.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center cursor-pointer hover:bg-slate-50 rounded-xl transition-all ${isSidebarCollapsed ? 'justify-center p-1' : 'gap-3 p-2'}`}
            title="Account Settings"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {getInitials(profileName)}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 font-semibold">Logged in as</p>
                <p className="text-sm font-bold text-slate-800 truncate">{profileName}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors ${isSidebarCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-4 py-2.5'}`}
            title={isSidebarCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="print:hidden md:hidden bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowMobileMenu(true)}
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/dashboard" onClick={() => setActiveTab('home')} className="flex items-center gap-1.5 font-bold text-sm text-primary">
            <Activity className="w-4 h-4" />
            <span>PulseIQ</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile SOS button */}
          <button 
            onClick={() => { 
              sosActiveRef.current = true; 
              sirenStartedRef.current = false; 
              sosDismissedRef.current = false; 
              sessionStorage.removeItem('sos_dismissed');
              setSosCountdown(5); 
              setShowSosModal(true); 
            }}
            className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 rounded-full text-rose-650 text-[10px] font-bold animate-pulse"
          >
            SOS
          </button>
          
          {/* Mobile Notifications Trigger */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 bg-slate-50 rounded-full relative text-slate-600"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Sliding Drawer */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
            />
            <motion.div 
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 md:hidden p-6 flex flex-col justify-between shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <Activity className="w-5 h-5 animate-pulse" />
                    <span>PulseIQ</span>
                  </div>
                  <button onClick={() => setShowMobileMenu(false)} className="p-1 hover:bg-slate-50 rounded-lg">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {menuItems.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabSelect(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                        tab.id === 'sos'
                          ? activeTab === 'sos'
                            ? 'bg-rose-600 text-white'
                            : 'text-rose-600 hover:text-rose-750 hover:bg-rose-50'
                          : activeTab === tab.id 
                            ? 'bg-primary text-white' 
                            : 'text-slate-500 hover:text-primary hover:bg-slate-50'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {getInitials(profileName)}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">Logged in as</p>
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{profileName}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-12 md:pb-6 relative">
        
        {/* Desktop Header / Top Navbar */}
        <div className="print:hidden hidden md:flex items-center justify-between px-8 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {activeTab === 'home' && `Good day, ${profileName.split(' ')[0]}`}
              {activeTab === 'ai_assistant' && "AI Health Assistant"}
              {activeTab === 'symptom_checker' && "Symptom Checker Triage"}
              {activeTab === 'medication' && "Medication Adherence Planner"}
              {activeTab === 'reports' && "Medical Vault & Reports"}
              {activeTab === 'analysis_results' && "Clinical AI Report Analysis"}
              {activeTab === 'report_history' && "Medical Records Vault & History"}
              {activeTab === 'risk_prediction' && "Health Risk Prediction"}
              {activeTab === 'family' && "Connected Family Loop"}
              {activeTab === 'nearby' && "Nearby Emergency Services"}
              {activeTab === 'feedback' && "Feedback Analysis & Ratings"}
              {activeTab === 'report_generator' && "Auto Health Report Generator"}
              {activeTab === 'sos' && "Emergency SOS Center"}
              {activeTab === 'settings' && "Patient Profile Settings"}
            </h1>
            <p className="text-[10px] text-slate-450 font-semibold mt-0.5">
              {activeTab === 'home' && "Your health parameters are fully optimized."}
              {activeTab === 'ai_assistant' && "Ask general queries, guidelines, or log analyses."}
              {activeTab === 'symptom_checker' && "Run mock diagnostic triage to map safety scores."}
              {activeTab === 'medication' && "Check off schedules to calculate weekly adherence."}
              {activeTab === 'reports' && "Upload records securely to encrypted storage logs."}
              {activeTab === 'analysis_results' && "Deep-dive diagnostic translation, out-of-range biomarkers, and clinical guidance."}
              {activeTab === 'report_history' && "Browse, review, and manage your uploaded medical records in a secure, HIPAA-compliant history vault."}
              {activeTab === 'risk_prediction' && "Consolidated predictive clinical health forecast."}
              {activeTab === 'family' && "Live tracking and alert connection status."}
              {activeTab === 'nearby' && "Locate hospitals, pharmacies, and dispatch services."}
              {activeTab === 'feedback' && "Patient compliance surveys and system usability reviews."}
              {activeTab === 'report_generator' && "Compile, preview, and generate print-ready clinical health summaries."}
              {activeTab === 'sos' && "Critical response console and dispatch logging."}
              {activeTab === 'settings' && "Manage medical metrics and biometric standards."}
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="relative w-48">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-slate-200 focus:border-primary transition-all outline-none bg-slate-50/50"
              />
            </div>

            {/* Emergency SOS Button */}
            <button 
              onClick={() => { 
                sosActiveRef.current = true; 
                sirenStartedRef.current = false; 
                sosDismissedRef.current = false; 
                sessionStorage.removeItem('sos_dismissed');
                setSosCountdown(5); 
                setShowSosModal(true); 
              }}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-full font-bold text-xs shadow-sm transition-all animate-pulse duration-1000 animate-pulse-subtle"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>SOS Emergency</span>
            </button>

            {/* Notification bell and Drawer */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 bg-white border border-slate-200 rounded-full relative text-slate-650 hover:text-primary hover:border-primary/20 transition-all"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div 
                      className="absolute right-0 mt-3 w-80 bg-white rounded-3xl border border-slate-100 shadow-2xl p-4 z-50 space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                        <span className="text-sm font-bold text-slate-800">Notifications ({unreadCount})</span>
                        <button onClick={markAllRead} className="text-xs font-semibold text-primary hover:underline">Mark all read</button>
                      </div>
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {notifications.map(n => (
                          <div key={n.id} className={`p-2.5 rounded-xl text-xs space-y-1 transition-colors ${n.unread ? 'bg-secondary/40 font-medium' : 'bg-white'}`}>
                            <p className="text-slate-700">{n.text}</p>
                            <p className="text-[10px] text-slate-400">{n.time}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 border border-slate-200 bg-white p-1 pr-3 rounded-full hover:border-primary/25 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  {getInitials(profileName)}
                </div>
                <span className="text-xs font-bold text-slate-700">{profileName}</span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <motion.div 
                      className="absolute right-0 mt-2 w-44 bg-white rounded-2xl border border-slate-100 shadow-2xl p-2 z-50 space-y-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <button 
                        onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-650 hover:bg-slate-50 transition-colors"
                      >
                        Profile Settings
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* SOS Emergency Modal Overlay */}
        <AnimatePresence>
          {showSosModal && (
            <div className="fixed inset-0 z-55 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
              <motion.div 
                className="fixed inset-0 bg-rose-950/90 backdrop-blur-md pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              
              {sosCountdown > 0 ? (
                // COUNTDOWN STATE
                <motion.div 
                  className="bg-black/40 border border-rose-500/30 rounded-[36px] max-w-lg w-full p-8 text-center relative overflow-hidden z-20 animate-emergency shadow-2xl flex flex-col items-center justify-center space-y-6"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-600" />
                  
                  <div className="w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-500 mb-2 animate-pulse">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">Emergency Activation</h3>
                    <p className="text-rose-200/70 text-xs leading-relaxed max-w-sm mx-auto">
                      Connecting you to emergency responders and broadcasting coordinates in:
                    </p>
                  </div>

                  <div className="my-2 relative flex items-center justify-center">
                    <span className="text-8xl font-black text-rose-500 tracking-tighter drop-shadow-md animate-pulse">
                      0:0{sosCountdown}
                    </span>
                  </div>

                  {/* Telemetry streaming status checklist */}
                  <div className="w-full bg-rose-950/50 p-4 rounded-2xl border border-rose-900/40 text-left text-[10px] font-bold text-rose-200/80 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>Biometrics Staged:</span>
                      </span>
                      <span className="text-white font-extrabold">{riskHeartRate} bpm | {riskSpo2}% O₂</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>Location Staged:</span>
                      </span>
                      <span className="text-white font-extrabold truncate max-w-[200px]" title={gpsLocationName}>{gpsLocationName}</span>
                    </div>
                  </div>

                  <div className="w-full pt-2">
                    <button 
                      onClick={() => {
                        sosActiveRef.current = false
                        sosDismissedRef.current = true
                        sessionStorage.setItem('sos_dismissed', 'true')
                        setShowSosModal(false)
                        stopSirenSound()
                        if (navigator.vibrate) navigator.vibrate(0)
                        setNotifications(prev => [
                          { id: Date.now(), text: '❌ SOS Emergency dispatch cancelled by patient.', time: 'Just now', unread: true },
                          ...prev
                        ])
                      }}
                      className="w-full py-4 bg-white hover:bg-slate-50 text-rose-950 font-black rounded-2xl transition-all shadow-xl hover:scale-[1.02] active:scale-95 cursor-pointer text-xs uppercase tracking-wider"
                    >
                      Cancel Emergency SOS
                    </button>
                  </div>
                </motion.div>
              ) : (
                // ACTIVE DISPATCH STATE
                <motion.div 
                  className="bg-slate-950 border border-red-500/40 rounded-[36px] max-w-lg w-full p-8 text-center relative overflow-hidden z-20 shadow-2xl flex flex-col items-center justify-center space-y-6"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  {/* Flashing background ambient indicators */}
                  <div className="absolute inset-0 bg-red-950/20 animate-pulse pointer-events-none" />
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600 animate-pulse" />
                  
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-red-500 mb-2 animate-bounce shadow-lg shadow-red-500/15">
                    <AlertOctagon className="w-8 h-8 text-red-500" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">🚨 SOS Alert Active</h3>
                    <p className="text-slate-350 text-[10px] leading-relaxed max-w-sm mx-auto font-medium">
                      Emergency response protocols have been initiated. Coordinates, biometrics, and medical summaries are broadcasting.
                    </p>
                  </div>

                  {/* Checklist of dispatched items */}
                  <div className="w-full bg-slate-900/60 p-4.5 rounded-2xl border border-red-900/30 text-left text-xs font-bold text-slate-300 space-y-4">
                    {/* SOS Sent */}
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 text-[10px] font-black">✓</span>
                      <div className="space-y-1 min-w-0">
                        <p className="text-white font-extrabold text-[11px]">SOS Broadcast Sent</p>
                        <p className="text-slate-400 text-[9px] font-semibold leading-none">
                          Biometrics Staged: {riskHeartRate} bpm | {riskSpo2}% O₂
                        </p>
                        <p className="text-slate-500 text-[8px] font-medium leading-none">
                          Triggered: {lastActiveSosAlert?.triggered_at 
                            ? new Date(lastActiveSosAlert.triggered_at).toLocaleTimeString() 
                            : new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Contacts Notified */}
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 text-[10px] font-black">✓</span>
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-white font-extrabold text-[11px]">Contacts Notified</p>
                        {lastActiveSosAlert?.notified_contacts && lastActiveSosAlert.notified_contacts.length > 0 ? (
                          <div className="grid grid-cols-1 gap-1.5 mt-1">
                            {lastActiveSosAlert.notified_contacts.map((contact, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-slate-950/40 px-2 py-1.5 rounded-xl border border-slate-800/40 text-[9px]">
                                <span className="text-slate-200 truncate font-semibold">{contact.name} ({contact.relation})</span>
                                <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 font-extrabold rounded text-[8px] uppercase">{contact.type} Alerted</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-450 text-[9px] font-medium leading-none mt-1">Alerting caregivers and responders...</p>
                        )}
                      </div>
                    </div>

                    {/* Location Shared */}
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 text-[10px] font-black">✓</span>
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-white font-extrabold text-[11px]">Location Shared</p>
                        <p className="text-slate-450 text-[9px] font-medium truncate" title={lastActiveSosAlert?.resolved_address || gpsLocationName}>
                          {lastActiveSosAlert?.resolved_address || gpsLocationName} ({lastActiveSosAlert?.latitude || gpsLatitude}, {lastActiveSosAlert?.longitude || gpsLongitude})
                        </p>
                        
                        {/* Map display */}
                        {(() => {
                          const alertLat = lastActiveSosAlert?.latitude || gpsLatitude || 37.774900
                          const alertLon = lastActiveSosAlert?.longitude || gpsLongitude || -122.419400
                          const offset = 0.005
                          const alertMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${Number(alertLon) - offset}%2C${Number(alertLat) - offset}%2C${Number(alertLon) + offset}%2C${Number(alertLat) + offset}&layer=mapnik&marker=${alertLat}%2C${alertLon}`
                          return (
                            <div className="space-y-2 mt-2">
                              <div className="w-full h-32 rounded-xl overflow-hidden border border-red-500/20 relative bg-black/40">
                                <iframe 
                                  title="Emergency Overlay Map"
                                  width="100%" 
                                  height="100%" 
                                  frameBorder="0" 
                                  scrolling="no" 
                                  marginHeight="0" 
                                  marginWidth="0" 
                                  src={alertMapUrl}
                                  className="absolute inset-0 w-full h-full"
                                />
                              </div>
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${alertLat},${alertLon}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2 bg-red-650/15 border border-red-500/20 hover:bg-red-650/25 text-rose-200 font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all text-[10px] uppercase tracking-wider"
                              >
                                <MapPin className="w-3.5 h-3.5" /> Navigate (Google Maps Link)
                              </a>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="w-full space-y-3 pt-2">
                    <button 
                      onClick={handleStandDown}
                      className="w-full py-4 bg-slate-900 hover:bg-slate-850 text-white border border-red-500/20 font-black rounded-2xl transition-all shadow-xl hover:scale-[1.02] active:scale-95 cursor-pointer text-xs uppercase tracking-wider"
                    >
                      Stand Down / Deactivate Siren
                    </button>
                    <p className="text-[9px] text-slate-400 font-semibold">Only click if you are in a safe condition.</p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Tab Content Panes */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            {/* VIEW 1: DASHBOARD / OVERVIEW */}
            {activeTab === 'home' && (
              <DashboardHome
                profileName={profileName}
                medicines={medicines}
                setMedicines={setMedicines}
                familyMembers={familyMembers}
                recentAlerts={recentAlerts}
                reports={reports}
                riskHeartRate={riskHeartRate}
                riskSpo2={riskSpo2}
                riskSymptoms={riskSymptoms}
                setRiskHeartRate={setRiskHeartRate}
                setRiskSpo2={setRiskSpo2}
                setRiskSymptoms={setRiskSymptoms}
                setActiveTab={setActiveTab}
                setShowSosModal={setShowSosModal}
                setSosCountdown={setSosCountdown}
                sosCountdown={sosCountdown}
              />
            )}

            {/* VIEW 2: AI ASSISTANT CHAT */}
            {activeTab === 'ai_assistant' && (
              <AiAssistant
                chatThreads={chatThreads}
                activeThreadId={activeThreadId}
                setActiveThreadId={setActiveThreadId}
                chatInput={chatInput}
                setChatInput={setChatInput}
                isAiTyping={isAiTyping}
                showHistoryMobile={showHistoryMobile}
                setShowHistoryMobile={setShowHistoryMobile}
                chatEndRef={chatEndRef}
                isListening={isListening}
                isSpeaking={isSpeaking}
                voiceEnabled={voiceEnabled}
                setVoiceEnabled={setVoiceEnabled}
                toggleListening={toggleListening}
                handleSendChat={handleSendChat}
                handleNewChat={handleNewChat}
                handleDeleteChat={handleDeleteChat}
                getInitials={getInitials}
                profileName={profileName}
              />
            )}

            {/* VIEW 3: SYMPTOM CHECKER */}
            {activeTab === 'symptom_checker' && (
              <SymptomChecker
                symptomInput={symptomInput}
                setSymptomInput={setSymptomInput}
                triageReport={triageReport}
                setTriageReport={setTriageReport}
                checkingSymptom={checkingSymptom}
                handleRunTriage={handleRunTriage}
                resetTriage={resetTriage}
                riskSymptoms={riskSymptoms}
                setRiskSymptoms={setRiskSymptoms}
              />
            )}

            {/* VIEW 4: MEDICATION PLANNER */}
            {activeTab === 'medication' && (
              <MedicationPlanner
                medicines={medicines}
                setMedicines={setMedicines}
                newMedName={newMedName}
                setNewMedName={setNewMedName}
                newMedTime={newMedTime}
                setNewMedTime={setNewMedTime}
                newMedDosage={newMedDosage}
                setNewMedDosage={setNewMedDosage}
                showAddMedModal={showAddMedModal}
                setShowAddMedModal={setShowAddMedModal}
                customTimeVal={customTimeVal}
                setCustomTimeVal={setCustomTimeVal}
                handleAddMed={handleAddMed}
                toggleMedicine={toggleMedicine}
                deleteMedicine={deleteMedicine}
                adherenceRate={adherenceRate}
                takenCount={takenCount}
                totalCount={totalCount}
              />
            )}

            {/* VIEW 5: REPORTS SIMPLIFIER */}
            {activeTab === 'reports' && (
              <ReportSimplifier
                reports={reports}
                setReports={setReports}
                activeReportId={activeReportId}
                setActiveReportId={setActiveReportId}
                uploadingReport={uploadingReport}
                setUploadingReport={setUploadingReport}
                dragActive={dragActive}
                setDragActive={setDragActive}
                processingStep={processingStep}
                setProcessingStep={setProcessingStep}
                processFile={processFile}
                deleteReport={deleteReport}
                reportTitle={reportTitle}
                setReportTitle={setReportTitle}
                reportPractitioner={reportPractitioner}
                setReportPractitioner={setReportPractitioner}
                reportFacility={reportFacility}
                setReportFacility={setReportFacility}
                handlePrintReport={handlePrintReport}
                reportId={reportId}
                uploadProgress={uploadProgress}
                setUploadProgress={setUploadProgress}
              />
            )}

            {/* VIEW 5B: REPORT HISTORY */}
            {activeTab === 'report_history' && (
              <ReportHistory
                reports={reports}
                deleteReport={deleteReport}
                setActiveReportId={setActiveReportId}
                setActiveTab={setActiveTab}
              />
            )}

            {/* VIEW 5C: ANALYSIS RESULTS */}
            {activeTab === 'analysis_results' && (
              <AnalysisResults
                reports={reports}
                activeReportId={activeReportId}
                reanalyzeReport={reanalyzeReport}
                getToken={getToken}
              />
            )}

            {/* VIEW 6: FAMILY HUB */}
            {activeTab === 'family' && (
              <FamilyHub
                familyMembers={familyMembers}
                fetchFamilyMembers={fetchFamilyMembers}
                getToken={getToken}
              />
            )}

            {/* VIEW 7: EMERGENCY SOS */}
            {activeTab === 'sos' && (
              <EmergencySOS
                emergencyContacts={emergencyContacts}
                setEmergencyContacts={setEmergencyContacts}
                newContactName={newContactName}
                setNewContactName={setNewContactName}
                newContactRelation={newContactRelation}
                setNewContactRelation={setNewContactRelation}
                newContactPhone={newContactPhone}
                setNewContactPhone={setNewContactPhone}
                showAddContactModal={showAddContactModal}
                setShowAddContactModal={setShowAddContactModal}
                handleAddContact={handleAddContact}
                handleDeleteContact={handleDeleteContact}
                isLocationSharingActive={isLocationSharingActive}
                setIsLocationSharingActive={setIsLocationSharingActive}
                recentAlerts={recentAlerts}
                sosCountdown={sosCountdown}
                setSosCountdown={setSosCountdown}
                showSosModal={showSosModal}
                setShowSosModal={setShowSosModal}
                handleStandDown={handleStandDown}
                gpsLatitude={gpsLatitude}
                gpsLongitude={gpsLongitude}
                gpsAccuracy={gpsAccuracy}
                gpsLocationName={gpsLocationName}
                gpsLastUpdated={gpsLastUpdated}
                gpsStatus={gpsStatus}
                gpsPermission={gpsPermission}
                fetchLiveLocation={fetchLiveLocation}
                servicesList={servicesList}
                servicesLoading={servicesLoading}
                servicesFilter={servicesFilter}
                setServicesFilter={setServicesFilter}
                selectedServiceId={selectedServiceId}
                setSelectedServiceId={setSelectedServiceId}
                showDirectionsToId={showDirectionsToId}
                setShowDirectionsToId={setShowDirectionsToId}
                riskHeartRate={riskHeartRate}
                riskSpo2={riskSpo2}
                sosActiveRef={sosActiveRef}
                sirenStartedRef={sirenStartedRef}
                sosDismissedRef={sosDismissedRef}
                lastActiveSosAlert={lastActiveSosAlert}
              />
            )}

            {/* VIEW 8: PATIENT PROFILE SETTINGS */}
            {activeTab === 'settings' && (
              <UserSettings
                profileName={profileName}
                setProfileName={setProfileName}
                profileEmail={profileEmail}
                setProfileEmail={setProfileEmail}
                profileAge={profileAge}
                setProfileAge={setProfileAge}
                profileWeight={profileWeight}
                setProfileWeight={setProfileWeight}
                profileHeight={profileHeight}
                setProfileHeight={setProfileHeight}
                profileBloodGroup={profileBloodGroup}
                setProfileBloodGroup={setProfileBloodGroup}
                settingsSuccess={settingsSuccess}
                saveSettings={saveSettings}
                getToken={getToken}
                profileLoading={profileLoading}
              />
            )}

          </AnimatePresence>

          {/* Medication Alarm / Reminders Overlay */}
          <div className="fixed top-6 right-6 z-60 space-y-4 max-w-sm w-full pointer-events-none">
            <AnimatePresence>
              {activeReminders.map(rem => (
                <motion.div
                  key={rem.id}
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 100, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="bg-white/95 backdrop-blur border border-blue-100 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 pointer-events-auto relative overflow-hidden"
                >
                  {/* Visual pulse line at the top */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" />
                  
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-650 shrink-0 animate-bounce">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black text-blue-650 uppercase tracking-widest bg-blue-100/50 px-2 py-0.5 rounded-full inline-block">Medication Alert</span>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-1.5 truncate">{rem.name}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Dosage: {rem.dosage}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-550" />
                        <span>Scheduled for {rem.time}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleTakeMedFromReminder(rem.id)}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer text-center"
                    >
                      Take Now
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDismissReminder(rem.id)}
                      className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl font-bold transition-all cursor-pointer text-center"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>

      </main>

    </div>
  )
}

export default Dashboard
