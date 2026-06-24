import { Link, useNavigate } from 'react-router-dom'
import { SignUp } from '@clerk/react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  User,
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Calendar
} from 'lucide-react'

function RegisterPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg-custom text-slate-800 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl" />

      {/* Main Container */}
      <motion.div 
        className="w-full max-w-5xl bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[650px] z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Left Side: Brand & Visuals (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-5 bg-primary p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
          
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white self-start relative z-10">
            <Activity className="w-5 h-5" />
            <span>PulseIQ</span>
          </Link>

          <div className="space-y-6 relative z-10">
            <h2 className="text-3xl font-extrabold leading-tight">Start Your Clinical AI Journey Today.</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Create an account to activate personalized wellness metrics, sync hardware sensors, and chat with licensed clinical assistants instantly.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 bg-white/10 px-4 py-3 rounded-2xl border border-white/10 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
            <p className="text-white/90">Your medical data is HIPAA compliant and fully protected.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-6 flex flex-col items-center justify-center bg-white/40">
          <SignUp signInUrl="/login" forceRedirectUrl="/dashboard" />
        </div>
      </motion.div>
    </div>
  )
}

export default RegisterPage
