import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertOctagon, 
  MapPin, 
  Phone, 
  Trash2, 
  Plus, 
  RefreshCw, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  History, 
  X,
  Clock,
  Compass,
  AlertTriangle,
  Heart,
  Activity,
  Check,
  Users
} from 'lucide-react'

export default function EmergencySOS({
  emergencyContacts,
  setEmergencyContacts,
  newContactName,
  setNewContactName,
  newContactRelation,
  setNewContactRelation,
  newContactPhone,
  setNewContactPhone,
  showAddContactModal,
  setShowAddContactModal,
  handleAddContact,
  handleDeleteContact,
  isLocationSharingActive,
  setIsLocationSharingActive,
  recentAlerts,
  sosCountdown,
  setSosCountdown,
  showSosModal,
  setShowSosModal,
  handleStandDown,
  gpsLatitude,
  gpsLongitude,
  gpsAccuracy,
  gpsLocationName,
  gpsLastUpdated,
  gpsStatus,
  gpsPermission,
  fetchLiveLocation,
  servicesList,
  servicesLoading,
  servicesFilter,
  setServicesFilter,
  selectedServiceId,
  setSelectedServiceId,
  showDirectionsToId,
  setShowDirectionsToId,
  riskHeartRate,
  riskSpo2,
  sosActiveRef,
  sirenStartedRef,
  sosDismissedRef,
  lastActiveSosAlert
}) {

  const triggerManualSOS = () => {
    if (sosActiveRef) {
      sosActiveRef.current = true
    }
    if (sirenStartedRef) {
      sirenStartedRef.current = false
    }
    if (sosDismissedRef) {
      sosDismissedRef.current = false
    }
    sessionStorage.removeItem('sos_dismissed')
    setSosCountdown(5)
    setShowSosModal(true)
  }

  const filteredServices = servicesFilter === 'all' 
    ? servicesList 
    : servicesList.filter(s => s.type === servicesFilter)

  // Map URL configurations
  const mapLat = gpsLatitude || 37.774900
  const mapLon = gpsLongitude || -122.419400
  const bboxOffset = 0.005
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${Number(mapLon) - bboxOffset}%2C${Number(mapLat) - bboxOffset}%2C${Number(mapLon) + bboxOffset}%2C${Number(mapLat) + bboxOffset}&layer=mapnik&marker=${mapLat}%2C${mapLon}`

  const isIncidentActive = lastActiveSosAlert && lastActiveSosAlert.status === "Active"

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
    >
      {/* Active Incident Monitor Panel */}
      {isIncidentActive && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-950 border-2 border-red-500 rounded-[28px] p-6 shadow-2xl relative overflow-hidden text-slate-100"
        >
          {/* Pulsing hazard animation strip */}
          <div className="absolute top-0 left-0 w-full h-1 bg-red-650 animate-pulse" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
                <AlertOctagon className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-red-500 text-white font-extrabold uppercase tracking-widest animate-pulse">Critical</span>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Active Emergency Incident Monitor</h3>
                </div>
                <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Dispatched Responders & Real-Time Telemetry Feed</p>
              </div>
            </div>
            <button 
              onClick={handleStandDown}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-600/10 cursor-pointer"
            >
              Stand Down / Resolve Incident
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUMN 1: Broadcast & Telemetry */}
            <div className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/60">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-red-500" /> Dispatch & Telemetry
              </h4>
              
              <div className="space-y-3.5 text-xs font-semibold">
                <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                  <span className="text-slate-450 text-[10px]">SOS Broadcast Status:</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-[10px] uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Active / Broadcasting
                  </span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                  <span className="text-slate-450 text-[10px]">Live Heart Rate:</span>
                  <span className="text-white font-black">{riskHeartRate} bpm</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                  <span className="text-slate-450 text-[10px]">SpO₂ Oxygen:</span>
                  <span className="text-white font-black">{riskSpo2}% SpO₂</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                  <span className="text-slate-450 text-[10px]">Incident ID:</span>
                  <span className="text-slate-200 font-bold truncate max-w-[120px]" title={lastActiveSosAlert.id}>{lastActiveSosAlert.id}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                  <span className="text-slate-450 text-[10px]">Broadcast Time:</span>
                  <span className="text-slate-300 font-bold">{new Date(lastActiveSosAlert.triggered_at).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* COLUMN 2: Live Geolocation Feed */}
            <div className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/60 flex flex-col justify-between">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500" /> Live Geolocation Feed
              </h4>

              {(() => {
                const alertLat = lastActiveSosAlert.latitude || gpsLatitude || 37.774900
                const alertLon = lastActiveSosAlert.longitude || gpsLongitude || -122.419400
                const offset = 0.005
                const alertMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${Number(alertLon) - offset}%2C${Number(alertLat) - offset}%2C${Number(alertLon) + offset}%2C${Number(alertLat) + offset}&layer=mapnik&marker=${alertLat}%2C${alertLon}`
                return (
                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div className="w-full h-28 rounded-xl overflow-hidden border border-slate-800 relative bg-black/40">
                      <iframe 
                        title="Incident Tracker Map"
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
                    <div className="text-[9px] font-bold text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Latitude: {alertLat}</span>
                        <span>Longitude: {alertLon}</span>
                      </div>
                      <p className="truncate text-slate-300 font-semibold" title={lastActiveSosAlert.resolved_address || gpsLocationName}>Address: {lastActiveSosAlert.resolved_address || gpsLocationName}</p>
                    </div>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${alertLat},${alertLon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-red-650/15 border border-red-500/20 hover:bg-red-650/25 text-rose-200 font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all text-[10px] uppercase tracking-wider"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Navigate via Google Maps
                    </a>
                  </div>
                )
              })()}
            </div>

            {/* COLUMN 3: Dispatched Responders */}
            <div className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/60">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-4 h-4 text-red-500" /> Responders Notified
              </h4>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {lastActiveSosAlert.notified_contacts && lastActiveSosAlert.notified_contacts.length > 0 ? (
                  lastActiveSosAlert.notified_contacts.map((contact, idx) => (
                    <div key={idx} className="p-2 bg-slate-950/40 rounded-xl border border-slate-800/40 space-y-1">
                      <div className="flex justify-between items-center text-xs font-extrabold">
                        <span className="text-white">{contact.name}</span>
                        <span className="text-[8px] text-slate-450 uppercase font-bold">{contact.relation}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                        <span className="truncate max-w-[130px] font-semibold">{contact.contact}</span>
                        <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 font-extrabold rounded text-[7px] uppercase">Alert Sent</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-500 text-[10px] font-bold">
                    No responder list found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side (col-span-5): Big SOS Sonar Button & Location Tracker */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Big SOS Trigger Console */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center space-y-6">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-extrabold text-[8px] uppercase tracking-wider">Triage Dispatch Console</span>
              <h3 className="text-base font-black text-slate-900 tracking-tight">SOS emergency trigger</h3>
            </div>

            {/* Giant Sonar Siren Trigger */}
            <div className="relative my-4 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute w-44 h-44 rounded-full bg-rose-500/10 border-2 border-rose-500/10 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute w-36 h-36 rounded-full bg-rose-500/20 border border-rose-500/10 animate-ping" style={{ animationDuration: '2s' }} />

              <button 
                onClick={isIncidentActive ? handleStandDown : triggerManualSOS}
                className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all select-none hover:scale-105 active:scale-95 shadow-xl ${
                  isIncidentActive 
                    ? 'bg-rose-650 hover:bg-rose-700 text-white shadow-rose-600/30' 
                    : 'bg-white hover:bg-rose-50 border-4 border-rose-500 text-rose-500 shadow-rose-500/15'
                }`}
              >
                <AlertOctagon className={`w-8 h-8 ${isIncidentActive ? 'animate-bounce' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-wider mt-1.5">
                  {isIncidentActive ? 'Stand Down' : 'Trigger SOS'}
                </span>
              </button>
            </div>

            <div className="space-y-1 bg-slate-50 p-4 rounded-2xl w-full border border-slate-100 text-xs font-semibold text-slate-500 leading-normal">
              <p>
                {isIncidentActive 
                  ? "🚨 SOS DISPATCH ACTIVE. Emergency dispatch operations are underway."
                  : "Double-click or press to start a 5-second standby countdown. Clinician telemetry and real-time GPS locations will broadcast immediately."}
              </p>
            </div>
          </div>

          {/* GPS Diagnostics */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-primary" /> Live GPS Sensor Locked
              </h4>
              <button 
                onClick={fetchLiveLocation}
                className="p-1 rounded-lg text-slate-400 hover:text-primary transition-all cursor-pointer"
                title="Force GPS Sync"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Permission Denial Warning banner */}
              {gpsPermission === 'denied' && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 border border-rose-100 dark:border-rose-900/40 rounded-2xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-[10px] uppercase">GPS Permission Blocked</p>
                    <p className="text-[9px] leading-relaxed font-semibold">Please reset location permissions in your browser address bar to allow emergency location broadcasts.</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Compass className="w-4.5 h-4.5 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-slate-400 text-[9px] font-bold uppercase">Resolved Address</span>
                  <p className="font-extrabold text-slate-800 text-xs leading-snug truncate" title={gpsLocationName}>{gpsLocationName}</p>
                </div>
              </div>

              {/* Interactive OpenStreetMap Map */}
              {gpsPermission !== 'denied' && (
                <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-100 shadow-inner relative bg-slate-50">
                  <iframe 
                    title="Real-Time Location Map"
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight="0" 
                    marginWidth="0" 
                    src={mapUrl}
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-[10px] font-bold">
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-450">Latitude Coordinates</span>
                  <p className="text-slate-800 font-extrabold mt-0.5">{gpsLatitude || '37.774900'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-450">Longitude Coordinates</span>
                  <p className="text-slate-800 font-extrabold mt-0.5">{gpsLongitude || '-122.419400'}</p>
                </div>
              </div>

              {/* Google Maps Link and Accuracy details */}
              <div className="grid grid-cols-2 gap-3 text-[10px] font-bold">
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-450">GPS Accuracy</span>
                  <p className="text-slate-850 font-extrabold mt-0.5">
                    {gpsAccuracy ? `± ${gpsAccuracy} meters` : 'Unavailable'}
                  </p>
                </div>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${mapLat},${mapLon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-slate-55 border border-slate-200 hover:bg-slate-100 text-slate-700 font-extrabold rounded-2xl flex flex-col justify-center items-center text-center transition-all cursor-pointer select-none"
                >
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Navigate</span>
                  <p className="text-[10px] text-primary font-black mt-0.5">Google Maps Link</p>
                </a>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-3 text-[9px] font-bold text-slate-400">
                <span className={`px-2 py-0.5 rounded-full uppercase ${
                  gpsPermission === 'denied' 
                    ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                    : 'bg-emerald-50 text-emerald-650'
                }`}>{gpsStatus}</span>
                <span>Last updated: {gpsLastUpdated}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side (col-span-7): Responders list, nearby emergency services, logs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Primary Emergency Contacts */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                  <Phone className="w-4.5 h-4.5 text-rose-500" /> Primary Care Responders
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Contacts notified immediately on emergency SOS triggers.</p>
              </div>
              <button 
                onClick={() => setShowAddContactModal(true)}
                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {emergencyContacts.map(c => (
                <div key={c.id} className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-extrabold text-xs">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        {c.name}
                        {c.isPrimary && <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[7px] uppercase tracking-wider rounded-md font-extrabold">Primary</span>}
                      </p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{c.relationship} · {c.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${c.phone}`} className="p-2 bg-white border border-slate-205 text-slate-500 hover:text-primary hover:border-primary/20 rounded-xl transition-all"><Phone className="w-3.5 h-3.5" /></a>
                    {!c.isPrimary && (
                      <button 
                        onClick={() => handleDeleteContact(c.id, c.name)}
                        className="p-2 hover:bg-rose-50 text-slate-450 hover:text-rose-650 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby services */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-50 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                  <Compass className="w-4.5 h-4.5 text-primary" /> Nearby Emergency Triage
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Geolocated clinics, hospitals, and pharmacies.</p>
              </div>

              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-[9px] font-extrabold uppercase">
                <button onClick={() => setServicesFilter('all')} className={`px-2.5 py-1 rounded-lg ${servicesFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>All</button>
                <button onClick={() => setServicesFilter('hospital')} className={`px-2.5 py-1 rounded-lg ${servicesFilter === 'hospital' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>Hospitals</button>
                <button onClick={() => setServicesFilter('pharmacy')} className={`px-2.5 py-1 rounded-lg ${servicesFilter === 'pharmacy' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>Pharmacies</button>
              </div>
            </div>

            {servicesLoading ? (
              <div className="py-8 text-center space-y-2 text-slate-400 text-xs font-bold">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                <span>Locating nearby medical providers...</span>
              </div>
            ) : filteredServices.length === 0 ? (
              <p className="text-center text-[10px] text-slate-400 font-semibold py-4">No local medical entities returned.</p>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {filteredServices.map(service => (
                  <div key={service.id} className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-slate-800">{service.name}</p>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase">{service.type} · {service.distance} miles away</p>
                    </div>
                    <a href={`tel:${service.phone}`} className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-primary/20 text-slate-700 hover:text-primary font-bold text-[10px] rounded-xl transition-all shadow-sm">Call</a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical SOS Alert Logs */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
              <History className="w-4.5 h-4.5 text-slate-450" /> Emergency Activation Logs
            </h4>

            <div className="divide-y divide-slate-50 overflow-y-auto max-h-40">
              {recentAlerts.length === 0 ? (
                <p className="text-center text-[10px] text-slate-400 font-semibold py-4">No historical SOS events registered.</p>
              ) : (
                recentAlerts.map(alert => (
                  <div key={alert.id} className="py-3 flex justify-between items-start text-xs">
                    <div className="space-y-1 pr-4">
                      <p className="font-extrabold text-slate-850">{alert.type}</p>
                      <p className="text-[9px] text-slate-450 font-semibold leading-relaxed">{alert.details}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[7px] font-extrabold uppercase ${
                        alert.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {alert.status}
                      </span>
                      <p className="text-[8px] text-slate-400 font-semibold mt-1">{alert.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddContactModal(false)}
            />
            
            <motion.div 
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden z-20 relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-5 text-white flex justify-between items-center">
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  <Phone className="w-4.5 h-4.5" /> Add Responding Contact
                </h3>
                <button onClick={() => setShowAddContactModal(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddContact} className="p-6 space-y-4 text-xs font-semibold text-slate-650">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Contact Name</label>
                  <input 
                    type="text" 
                    required
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="E.g., Uncle Frank"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Relationship</label>
                  <select 
                    value={newContactRelation}
                    onChange={(e) => setNewContactRelation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-primary text-xs bg-white"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent / Guardian</option>
                    <option value="Physician">Attending Physician</option>
                    <option value="Neighbor">Neighbor</option>
                    <option value="Other">Other Contact</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="E.g., +1 (555) 120-4321"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowAddContactModal(false)}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl font-bold uppercase tracking-wider text-[10px] text-center"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-extrabold uppercase tracking-wider text-[10px] text-center shadow-md shadow-rose-600/10"
                  >
                    Add Responder
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
