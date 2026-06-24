import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Show, UserButton } from '@clerk/react'
import { 
  ShieldAlert, 
  Activity, 
  ArrowRight, 
  Bot, 
  Calendar, 
  TrendingUp, 
  Lock, 
  Users, 
  Award, 
  HeartHandshake, 
  ChevronRight,
  Sparkles,
  CheckCircle2,
  FileText,
  Zap,
  Shield,
  Heart,
  Star
} from 'lucide-react'

function LandingPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  }

  const features = [
    {
      icon: <Bot className="w-6 h-6 text-primary" />,
      title: "Clinical AI Copilot",
      description: "Chat with our medical copilot to instantly analyze wellness parameters, sleep trends, and receive guidance on prescription compliance."
    },
    {
      icon: <Activity className="w-6 h-6 text-primary" />,
      title: "Symptom Triage Engine",
      description: "Log active symptoms to trigger automated clinical triage checklists and map recommended actions dynamically."
    },
    {
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: "Medical Vault & OCR",
      description: "Securely upload clinical PDFs or scans. Our simplified viewer parses complex medical reports into clear, understandable language."
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Caregiver Family Loop",
      description: "Keep loved ones and physicians synced in real-time. Share adherence checklists and receive live vitals updates remotely."
    }
  ]

  const heroStats = [
    { value: "99.2%", label: "Triage Accuracy", icon: <Zap className="w-4 h-4" /> },
    { value: "50k+", label: "Consultations", icon: <Heart className="w-4 h-4" /> },
    { value: "24/7", label: "AI Availability", icon: <Activity className="w-4 h-4" /> },
    { value: "4.9★", label: "Patient Rating", icon: <Star className="w-4 h-4" /> }
  ]

  const testimonials = [
    {
      quote: "PulseIQ has fundamentally streamlined how our clinic coordinates triage. The AI report simplifier translates complex lab results into patient-friendly summaries with remarkable clinical safety.",
      author: "Dr. Sarah Jenkins, MD",
      role: "Chief of Endocrinology, Metro Health",
      avatar: "SJ"
    },
    {
      quote: "Being a remote caregiver for my elderly mother was incredibly stressful. PulseIQ's real-time vitals monitoring and instant symptom triage have given our family unmatched peace of mind.",
      author: "Robert Miller",
      role: "Family Caregiver",
      avatar: "RM"
    },
    {
      quote: "The HIPAA-compliant secure medical vault is exceptionally designed. Being able to access instant AI consultations and retain full custody of my patient metrics is revolutionary.",
      author: "Dr. David Vance, FACP",
      role: "Clinical Director, Vance Integrative Medicine",
      avatar: "DV"
    }
  ]

  const steps = [
    { num: "01", title: "Create Profile", desc: "Sign up and configure your health parameters, chronic conditions, and wellness goals." },
    { num: "02", title: "Log Vitals & Reports", desc: "Input your wellness metrics and upload clinical documents to calibrate the AI engines." },
    { num: "03", title: "Access Real-time Guidance", desc: "Receive immediate daily health summaries, proactive risk warnings, and dietary guidance." }
  ]

  return (
    <div className="min-h-screen bg-bg-custom text-slate-800 selection:bg-primary/20 selection:text-primary overflow-x-hidden">

      {/* ─── Navigation ─── */}
      <div className="glass-nav sticky top-0 z-50 w-full">
        <nav className="max-w-screen-xl mx-auto px-6 xl:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-primary tracking-tight shrink-0">
            <Activity className="w-6 h-6 animate-pulse" />
            <span>PulseIQ</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
            <a href="#features" className="hover:text-primary transition-colors duration-200">Features</a>
            <a href="#workflow" className="hover:text-primary transition-colors duration-200">How It Works</a>
            <a href="#testimonials" className="hover:text-primary transition-colors duration-200">Testimonials</a>
            <a href="#trust" className="hover:text-primary transition-colors duration-200">Security</a>
          </div>

          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors duration-200 hidden sm:block">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2.5 text-sm font-bold bg-primary text-white rounded-full hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 duration-200">
                Get Started
              </Link>
            </Show>
            <Show when="signed-in">
              <Link to="/dashboard" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </Show>
          </div>
        </nav>
      </div>

      {/* ─── Hero Section ─── */}
      <header className="relative overflow-hidden">
        {/* Premium layered background */}
        <div className="absolute inset-0 -z-10">
          {/* Primary radial bloom — top left */}
          <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-primary/6 blur-[120px]" />
          {/* Secondary bloom — bottom right */}
          <div className="absolute top-1/2 -right-48 w-[600px] h-[600px] rounded-full bg-blue-400/7 blur-[100px]" />
          {/* Accent center glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/4 blur-[80px]" />
          {/* Subtle dot grid overlay */}
          <div className="absolute inset-0 hero-grid-bg opacity-40" />
        </div>

        <div className="max-w-screen-xl mx-auto px-6 xl:px-10 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-11 gap-10 xl:gap-14 items-center">

          {/* ── Left: 6 of 11 columns ≈ 55% ── */}
          <motion.div
            className="lg:col-span-6 space-y-7"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/8 text-primary font-semibold text-xs border border-primary/15 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Introducing PulseIQ Clinical Intelligence v2.0</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]"
            >
              Your Clinical{' '}
              <span className="text-primary relative">
                AI Assistant
                <svg className="absolute -bottom-1 left-0 w-full" height="4" viewBox="0 0 200 4" fill="none" preserveAspectRatio="none">
                  <path d="M0 2 Q50 0 100 2 T200 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary/30" />
                </svg>
              </span>
              {' '}& Health Companion
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={fadeInUp}
              className="text-lg xl:text-xl text-slate-500 max-w-lg leading-relaxed"
            >
              Experience next-generation clinical guidance, instant report triage, and real-time medical copilot intelligence. PulseIQ works continuously to assist you and your family.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Show when="signed-out">
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2.5 px-8 py-4 font-bold bg-primary text-white rounded-full hover:bg-primary-hover shadow-xl shadow-primary/25 hover:shadow-primary/35 transition-all hover:-translate-y-0.5 duration-200 group text-sm"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-7 py-4 font-semibold bg-white text-slate-800 rounded-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm text-sm"
                >
                  <span>Sign In to Patient Portal</span>
                </Link>
              </Show>
              <Show when="signed-in">
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 px-8 py-4 font-bold bg-primary text-white rounded-full hover:bg-primary-hover shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 duration-200 group text-sm"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Show>
            </motion.div>

            {/* ── Integrated Hero Stats Bar ── */}
            <motion.div variants={fadeInUp}>
              <div className="grid grid-cols-4 gap-3 pt-2">
                {heroStats.map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl px-4 py-3.5 text-center stat-glow hover:border-primary/15 transition-all duration-200"
                  >
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      {stat.icon}
                    </div>
                    <p className="font-extrabold text-slate-900 text-base leading-none">{stat.value}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Trust badges row */}
            <motion.div variants={fadeInUp}>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {[
                  { icon: <Shield className="w-3.5 h-3.5" />, text: "HIPAA Encrypted" },
                  { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: "FDA Class II" },
                  { icon: <Lock className="w-3.5 h-3.5" />, text: "100% Patient Owned" },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <span className="text-emerald-500">{badge.icon}</span>
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: 5 of 11 columns ≈ 45% ── */}
          <motion.div
            className="lg:col-span-5 flex justify-center lg:justify-end relative"
            initial={{ opacity: 0, x: 30, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
          >
            {/* Glow halo behind phone */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 rounded-full bg-primary/10 blur-[60px]" />
            </div>

            {/* Floating vitals badge — top left */}
            <motion.div
              className="absolute -top-4 left-4 xl:-left-4 glass-card p-3.5 rounded-2xl flex items-center gap-3 z-20 animate-float shadow-lg"
              style={{ animationDelay: '0s' }}
            >
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Vitals Syncing</p>
                <p className="text-sm font-bold text-slate-900">Normal 72 bpm</p>
              </div>
            </motion.div>

            {/* Floating AI badge — bottom right */}
            <motion.div
              className="absolute bottom-20 -right-4 xl:right-0 glass-card p-3.5 rounded-2xl flex items-center gap-3 z-20 animate-float shadow-lg"
              style={{ animationDelay: '3s' }}
            >
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-primary shrink-0">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">AI Assistant</p>
                <p className="text-sm font-bold text-slate-900">No warning flags</p>
              </div>
            </motion.div>

            {/* Phone mockup */}
            <div className="relative w-64 sm:w-[280px] h-[520px] rounded-[40px] bg-slate-950 p-3 shadow-2xl border-[3px] border-slate-800 overflow-hidden flex flex-col">
              {/* Camera notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-b-2xl z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>

              {/* App screen */}
              <div className="w-full h-full bg-[#F8FAFC] rounded-[30px] overflow-hidden flex flex-col pt-5 px-4 space-y-3.5">
                {/* Status bar */}
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>09:41 AM</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-1.5 border border-slate-400 rounded-sm" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full" />
                  </div>
                </div>

                {/* App header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">Good morning,</p>
                    <p className="text-sm font-bold text-slate-800">Sarah Jenkins</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-[10px]">
                    SJ
                  </div>
                </div>

                {/* Health index card */}
                <div className="bg-primary p-3.5 rounded-2xl text-white space-y-1.5 shadow-md shadow-primary/20">
                  <p className="text-[9px] font-medium opacity-80 uppercase tracking-wider">PulseIQ Health Index</p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold">94</span>
                    <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">Excellent</span>
                  </div>
                  <p className="text-[9px] opacity-80">All monitored vitals within stable thresholds.</p>
                </div>

                {/* Mini sparklines */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] text-slate-400">
                      <span>Heart Rate</span>
                      <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-extrabold text-slate-800">72</span>
                      <span className="text-[8px] text-slate-400">bpm</span>
                    </div>
                    <svg className="w-full h-7 text-emerald-500" viewBox="0 0 100 30" fill="none">
                      <path d="M0 15 Q25 5 50 20 T100 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] text-slate-400">
                      <span>Activity</span>
                      <TrendingUp className="w-2.5 h-2.5 text-primary" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-extrabold text-slate-800">8,421</span>
                      <span className="text-[8px] text-slate-400">steps</span>
                    </div>
                    <svg className="w-full h-7 text-primary" viewBox="0 0 100 30" fill="none">
                      <path d="M0 25 Q30 10 60 15 T100 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* AI Chat preview */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex-1 flex flex-col justify-between">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-700">AI Medical Assistant</span>
                  </div>
                  <div className="my-2">
                    <div className="bg-slate-100 text-[8px] p-2 rounded-lg max-w-[85%] text-slate-600 font-medium leading-relaxed">
                      I noticed your sleep hours dropped to 5.2 hrs. Would you like some tips?
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-1.5 flex items-center justify-between text-[9px] text-slate-400 border border-slate-100">
                    <span>Ask PulseIQ...</span>
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ─── Features Section ─── */}
      <section id="features" className="py-20 px-6 xl:px-10 max-w-screen-xl mx-auto space-y-14">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 text-primary text-xs font-semibold border border-primary/10">
            <Zap className="w-3 h-3" /> Core Capabilities
          </div>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl leading-tight">
            Intelligent Features Crafted For Modern Healthcare
          </h2>
          <p className="text-slate-500 leading-relaxed">
            A comprehensive clinical engine that works around the clock. Get predictive reports, connect with real doctors, and safeguard your data.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group"
              variants={fadeInUp}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
              <div className="pt-5 flex items-center gap-1 text-primary text-xs font-semibold group-hover:gap-2 transition-all cursor-pointer">
                <span>Learn more</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Workflow Section ─── */}
      <section id="workflow" className="bg-gradient-to-b from-slate-50/80 to-white py-20 px-6 xl:px-10 border-y border-slate-100">
        <div className="max-w-screen-xl mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 text-primary text-xs font-semibold border border-primary/10">
              <ChevronRight className="w-3 h-3" /> Quick Setup
            </div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl leading-tight">
              Setting Up PulseIQ Takes Minutes
            </h2>
            <p className="text-slate-500">
              Transform the way you interact with healthcare in less than five minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
                <span className="text-6xl font-black text-slate-100 absolute top-6 right-6 select-none group-hover:text-primary/8 transition-colors duration-500">{step.num}</span>
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 z-10 relative">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed z-10 relative">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials Section ─── */}
      <section id="testimonials" className="py-20 bg-white px-6 xl:px-10">
        <div className="max-w-screen-xl mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 text-primary text-xs font-semibold border border-primary/10">
              <Star className="w-3 h-3" /> Testimonials
            </div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl leading-tight">
              Trusted by Doctors & Loved by Families
            </h2>
            <p className="text-slate-500">
              Hear from the clinical leaders and dedicated caregivers using PulseIQ to monitor wellness and streamline care coordination.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 p-8 rounded-3xl flex flex-col justify-between hover:shadow-lg hover:border-slate-200 transition-all duration-300 group">
                <div>
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t.author}</h4>
                    <p className="text-xs text-slate-400 font-semibold">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trust & Accreditations ─── */}
      <section id="trust" className="py-20 px-6 xl:px-10 max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
            <Shield className="w-3 h-3" /> Enterprise Security
          </div>
          <h2 className="text-3xl font-bold text-slate-900 leading-tight">Your Privacy is Our Medical Promise</h2>
          <p className="text-slate-500 leading-relaxed">
            All user medical data is managed under strict compliance protocols. We process parameters locally or in highly protected cloud environment nodes with end-to-end user custody configurations.
          </p>
          <div className="space-y-3">
            {[
              "ISO 27001 Certified Security Practices",
              "GDPR & HIPAA compliant cloud vaults",
              "Zero data monetization model"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-2 gap-4">
          {[
            { Icon: Users, title: "Doctor Audited", desc: "Regular reviews of system algorithms" },
            { Icon: Award, title: "Aesthetic Design", desc: "Premium visual ease-of-use rewards" },
            { Icon: HeartHandshake, title: "Patient First", desc: "Fully transparent operation logs" },
            { Icon: ShieldAlert, title: "Immediate Alert", desc: "Automated crisis connection features" },
          ].map(({ Icon, title, desc }, i) => (
            <div key={i} className="p-5 bg-slate-50 hover:bg-primary/4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-colors duration-200 group">
              <Icon className="w-7 h-7 text-primary" />
              <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
              <p className="text-xs text-slate-400 leading-tight">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="relative overflow-hidden bg-primary py-24 px-6 text-white text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-2xl mx-auto space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold leading-tight">
            Ready to Take Control of Your Health Journey?
          </h2>
          <p className="opacity-85 max-w-lg mx-auto text-lg">
            Get instant AI analysis, link your favorite trackers, and access medical consultations on demand.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="px-8 py-4 bg-white text-primary font-bold rounded-full shadow-xl hover:bg-slate-50 hover:shadow-2xl transition-all w-full sm:w-auto hover:-translate-y-0.5 duration-200">
              Get Started Free
            </Link>
            <Link to="/login" className="px-8 py-4 border border-white/25 hover:bg-white/10 font-semibold rounded-full transition-all w-full sm:w-auto duration-200">
              Access Patient Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6 xl:px-10 border-t border-slate-800">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 font-bold text-lg text-white">
              <Activity className="w-5 h-5 text-primary" />
              <span>PulseIQ</span>
            </div>
            <p className="text-sm leading-relaxed">Modern mobile-first medical intelligence companion app designed for secure patient control.</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">AI Analysis</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Vitals Integration</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Schedules</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Privacy & Ethics</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">HIPAA Rules</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GDPR Controls</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security Audit</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Emergency Helplines</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Patient FAQs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-screen-xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-xs flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} PulseIQ Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
