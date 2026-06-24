import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  MessageSquare, 
  Plus, 
  Trash2, 
  History, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  Stethoscope,
  Pill
} from 'lucide-react'

export default function AiAssistant({
  chatThreads,
  activeThreadId,
  setActiveThreadId,
  chatInput,
  setChatInput,
  isAiTyping,
  showHistoryMobile,
  setShowHistoryMobile,
  chatEndRef,
  isListening,
  isSpeaking,
  voiceEnabled,
  setVoiceEnabled,
  toggleListening,
  handleSendChat,
  handleNewChat,
  handleDeleteChat,
  getInitials,
  profileName
}) {
  const activeThread = chatThreads.find(t => t.id === activeThreadId) || chatThreads[0]
  const chatMessages = activeThread ? activeThread.messages : []

  const suggestionChips = [
    { label: "Analyze my recent telemetry parameters", icon: <Stethoscope className="w-3 h-3 text-primary" /> },
    { label: "What is my medication compliance score?", icon: <Pill className="w-3 h-3 text-emerald-500" /> },
    { label: "Give me sleep hygiene tips for deep sleep", icon: <HelpCircle className="w-3 h-3 text-indigo-500" /> }
  ]

  return (
    <motion.div 
      className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col md:flex-row h-[600px] relative"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
    >
      {/* Consultation History Sidebar */}
      <div className={`w-full md:w-64 border-r border-slate-100 bg-slate-50/50 flex-col shrink-0 ${
        showHistoryMobile 
          ? 'flex absolute inset-0 z-30 bg-white md:relative' 
          : 'hidden md:flex'
      }`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-slate-400" /> Consultations
          </span>
          <button 
            onClick={handleNewChat}
            className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all flex items-center justify-center cursor-pointer"
            title="New Consultation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {chatThreads.map(thread => (
            <div
              key={thread.id}
              onClick={() => {
                setActiveThreadId(thread.id)
                setShowHistoryMobile(false)
              }}
              className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer text-xs transition-all border ${
                activeThreadId === thread.id
                  ? 'bg-primary/10 text-primary border-primary/10 font-extrabold'
                  : 'hover:bg-slate-100 text-slate-650 border-transparent font-semibold'
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-primary shrink-0" />
                <span className="truncate">{thread.title}</span>
              </div>
              <button
                type="button"
                onClick={(e) => handleDeleteChat(thread.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        
        {/* Mobile Close Button */}
        <button 
          type="button"
          onClick={() => setShowHistoryMobile(false)}
          className="md:hidden m-3 p-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl text-center cursor-pointer"
        >
          Close History
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/10">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-primary to-blue-600 p-4 text-white flex justify-between items-center shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setShowHistoryMobile(!showHistoryMobile)}
              className="md:hidden p-1.5 hover:bg-white/10 rounded-xl"
              title="History"
            >
              <History className="w-5 h-5 text-white" />
            </button>
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm leading-tight">PulseIQ Clinical AI</h3>
              <p className="text-[9px] opacity-80 font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-ping" />
                <span>Diagnostic Assistant Active</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speaker Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const newVoiceEnabled = !voiceEnabled
                setVoiceEnabled(newVoiceEnabled)
                if (!newVoiceEnabled && window.speechSynthesis) {
                  window.speechSynthesis.cancel()
                }
              }}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition-all cursor-pointer flex items-center justify-center w-8 h-8"
              title={voiceEnabled ? "Mute Read Aloud" : "Unmute Read Aloud"}
            >
              {voiceEnabled ? (
                isSpeaking ? (
                  <span className="flex gap-0.5 items-center justify-center w-4 h-4">
                    <span className="w-0.5 bg-white rounded-full animate-pulse h-full" style={{ animationDuration: '0.6s' }} />
                    <span className="w-0.5 bg-white rounded-full animate-pulse h-3/5" style={{ animationDuration: '0.8s' }} />
                    <span className="w-0.5 bg-white rounded-full animate-pulse h-4/5" style={{ animationDuration: '0.5s' }} />
                  </span>
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )
              ) : (
                <VolumeX className="w-4 h-4 text-white/50" />
              )}
            </button>

            <button 
              type="button"
              onClick={handleNewChat}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Consult</span>
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400 max-w-sm mx-auto">
              <Sparkles className="w-8 h-8 text-primary opacity-60 animate-bounce" />
              <p className="font-semibold text-xs text-slate-500">How can I assist you with your health telemetry parameters today?</p>
            </div>
          ) : (
            chatMessages.map(m => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2.5 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-[10px] shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-primary/10 text-primary border border-primary/25'
                      : 'bg-primary text-white'
                  }`}>
                    {m.sender === 'user' ? getInitials(profileName) : <Sparkles className="w-4 h-4" />}
                  </div>
                  
                  {/* Bubble */}
                  <div className="flex flex-col gap-2">
                    <div className={`p-4 rounded-3xl leading-relaxed shadow-sm text-xs ${
                      m.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-sm' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                    }`}>
                      {m.text}
                    </div>

                    {/* AI Structured Data block (actions / recommendations) */}
                    {m.sender === 'ai' && ((m.conditions && m.conditions.length > 0) || (m.actions && m.actions.length > 0)) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 space-y-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-[10px]"
                      >
                        {m.severity && (
                          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                            <span className="font-bold text-slate-400 uppercase tracking-wider text-[8px]">Clinical Severity:</span>
                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px] ${
                              m.severity === 'Critical' || m.severity === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                              m.severity === 'Moderate' || m.severity === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>
                              {m.severity}
                            </span>
                          </div>
                        )}

                        {m.conditions && m.conditions.length > 0 && (
                          <div className="space-y-1">
                            <p className="font-extrabold text-slate-400 uppercase tracking-widest text-[8px]">Potential Diagnostic Conditions</p>
                            <div className="flex flex-wrap gap-1.5">
                              {m.conditions.map((c, i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-200/50 text-slate-650 rounded-md font-semibold">{c}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {m.actions && m.actions.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <p className="font-extrabold text-slate-400 uppercase tracking-widest text-[8px]">Recommended Clinical Actions</p>
                            <ul className="space-y-1.5">
                              {m.actions.map((act, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-slate-605 font-medium leading-relaxed">
                                  <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {isAiTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs text-slate-450 font-bold tracking-wider uppercase">Compiling response...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips */}
        {chatMessages.length <= 1 && (
          <div className="px-5 py-2 flex flex-wrap gap-2 shrink-0 border-t border-slate-50 bg-white/40">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setChatInput(chip.label)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-[10px] font-bold text-slate-600 transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.01]"
              >
                {chip.icon}
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Console */}
        <form onSubmit={handleSendChat} className="p-4 border-t border-slate-100 bg-white flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isListening 
                ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-primary hover:border-primary/20'
            }`}
            title={isListening ? "Stop listening" : "Start voice recognition"}
          >
            {isListening ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
          </button>
          
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={isListening ? "Listening... speak now" : "Consult clinical AI copilot..."}
            disabled={isAiTyping}
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50/80 hover:bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none transition-all font-medium"
          />

          <button
            type="submit"
            disabled={!chatInput.trim() || isAiTyping}
            className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover shadow-md shadow-primary/10 transition-all disabled:opacity-50 disabled:shadow-none shrink-0"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </motion.div>
  )
}
