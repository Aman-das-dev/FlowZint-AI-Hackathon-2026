import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, ShieldAlert, Award, Compass, Truck, BarChart3, Users, Mail, Clock, Smartphone, CalendarCheck, Recycle, CheckCircle2, Zap } from 'lucide-react';

interface LandingPageProps {
  onStartApp: () => void;
  onOpenAuth: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
};

const services = [
  {
    icon: <ShieldAlert size={28} />,
    title: 'AI Device Scanner',
    desc: 'Upload a photo, our AI identifies the device, flags hazards, and calculates its recycling value instantly.',
    color: '#84B056',
    bg: '#f0f7e8',
  },
  {
    icon: <Compass size={28} />,
    title: 'Recycler Map',
    desc: 'Find certified e-waste collection centers near you on an interactive map with directions.',
    color: '#38523A',
    bg: '#eaf1ea',
    active: true,
  },
  {
    icon: <Truck size={28} />,
    title: 'Smart Pickup',
    desc: 'Schedule doorstep pickups with certified drivers. Track your pickup from Pending to Completed.',
    color: '#84B056',
    bg: '#f0f7e8',
  },
  {
    icon: <BarChart3 size={28} />,
    title: 'Impact Dashboard',
    desc: 'Track your carbon savings, trees planted equivalent, and water volumes preserved with live charts.',
    color: '#38523A',
    bg: '#eaf1ea',
  },
  {
    icon: <Award size={28} />,
    title: 'Gamified Rewards',
    desc: 'Earn EcoPoints for recycling. Unlock badges, level up, and climb the public leaderboard.',
    color: '#84B056',
    bg: '#f0f7e8',
  },
  {
    icon: <Users size={28} />,
    title: 'AI Eco Assistant',
    desc: 'Chat with our AI to learn about battery safety, secure data wiping, and sustainable disposal.',
    color: '#38523A',
    bg: '#eaf1ea',
  },
];

const steps = [
  { num: '01', label: 'You Scan Your Device', icon: <Smartphone size={24} /> },
  { num: '02', label: 'You Choose a Pickup Time', icon: <CalendarCheck size={24} /> },
  { num: '03', label: 'We Pick & Clean Up', icon: <Truck size={24} /> },
  { num: '04', label: 'We Responsibly Dispose', icon: <Recycle size={24} /> },
];

const stats = [
  { val: '62M+', label: 'Tonnes E-Waste Yearly', sub: 'UN Global E-Waste Monitor 2024' },
  { val: '19.9%', label: 'Global Recycling Rate', sub: 'Over 77% ends in landfills' },
  { val: '$62B', label: 'Precious Metals Lost', sub: 'Gold, silver & copper discarded' },
  { val: '20K+', label: 'Users Served', sub: 'Across cities worldwide' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStartApp, onOpenAuth }) => {
  return (
    <div className="relative min-h-screen bg-[#F8F9FA] overflow-hidden text-[#333333]">

      {/* ─── Top Utility Bar ─── */}
      <div className="hidden lg:flex bg-[#38523A] text-white text-xs justify-between items-center px-20 py-2">
        <span>Welcome To EcoTrack AI – Intelligent E-Waste Management Platform</span>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><Mail size={12}/> support@ecotrack.ai</span>
          <span className="flex items-center gap-1.5"><Clock size={12}/> Mon–Sat 9:00 – 6:00, Sunday – Off</span>
          <button onClick={onOpenAuth} className="px-3 py-1 bg-[#D9E335] text-[#38523A] font-semibold rounded cursor-pointer hover:bg-[#FFDE59] transition-colors">
            Request a Pickup
          </button>
        </div>
      </div>

      {/* ─── Navbar ─── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 w-full bg-white shadow-sm px-8 lg:px-20 py-4 flex justify-between items-center"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#38523A] flex items-center justify-center shadow-md">
            <Leaf size={20} className="text-[#D9E335]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#38523A] font-mono">
              ECOTRACK<span className="text-[#84B056]">.AI</span>
            </span>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest -mt-0.5">E-Waste Management</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          {['Home', 'About', 'Services', 'How It Works'].map(n => (
            <a key={n} href="#" className="hover:text-[#84B056] transition-colors">{n}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={onOpenAuth} className="px-4 py-2 rounded-lg border-2 border-[#38523A] text-[#38523A] text-sm font-semibold hover:bg-[#38523A] hover:text-white transition-all cursor-pointer">
            Sign In
          </button>
          <button onClick={onStartApp} className="px-4 py-2 rounded-lg bg-[#D9E335] text-[#38523A] text-sm font-bold hover:bg-[#FFDE59] transition-all cursor-pointer shadow-md">
            Launch Portal
          </button>
        </div>
      </motion.header>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 w-full overflow-hidden">
        {/* Hero BG Image with overlay */}
        <div className="relative min-h-[420px] md:min-h-[580px] flex items-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div className="absolute inset-0 bg-[#38523A]/75" />

          <div className="relative z-10 w-full px-6 sm:px-8 lg:px-20 py-20 sm:py-24 grid gap-12 lg:grid-cols-2 items-center">
            {/* Text */}
            <motion.div className="space-y-6 max-w-xl" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9E335]/20 border border-[#D9E335]/50 text-[#D9E335] text-xs font-semibold tracking-wide uppercase">
                <Zap size={12} className="fill-[#D9E335]" /> AI-Powered Eco Platform
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight" style={{ fontFamily: "'Amatic SC', cursive", letterSpacing: '2px' }}>
                Your E-Waste is <br/>
                <span className="text-[#D9E335]">Our Responsibility</span>
              </h1>
              <p className="text-white/80 text-base sm:text-lg max-w-full sm:max-w-xl font-light leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Scan devices with AI, find certified recyclers, schedule doorstep pickups and track your environmental impact — all in one platform.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button onClick={onStartApp} className="flex items-center gap-2 px-7 py-4 rounded-lg bg-[#D9E335] text-[#38523A] font-bold text-sm hover:bg-[#FFDE59] transition-all shadow-lg cursor-pointer group">
                  Request a Pickup
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={onOpenAuth} className="flex items-center gap-2 px-7 py-4 rounded-lg border-2 border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-all cursor-pointer">
                  Create Account
                </button>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              className="hidden md:flex lg:justify-center justify-center"
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
            >
              <div className="relative">
                <motion.img
                  src="/assets/images/waste_truck_3d.png"
                  alt="Eco Truck 3D"
                  className="w-64 h-64 md:w-96 md:h-96 object-contain drop-shadow-2xl"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Floating badges */}
                <motion.div
                  className="absolute top-10 -left-8 bg-white rounded-2xl px-4 py-3 shadow-xl border border-gray-100 flex items-center gap-2"
                  animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#84B056]/15 flex items-center justify-center">
                    <Recycle size={14} className="text-[#38523A]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">E-Waste</p>
                    <p className="text-xs font-bold text-[#38523A]">62M Tonnes</p>
                  </div>
                </motion.div>
                <motion.div
                  className="absolute bottom-16 -right-6 bg-[#D9E335] rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2"
                  animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                >
                  <CheckCircle2 size={15} className="text-[#38523A]" />
                  <p className="text-xs font-bold text-[#38523A]">100% Certified</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* How It Works Steps Bar */}
        <div className="bg-[#38523A] w-full">
          <div className="px-8 lg:px-20 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="flex flex-col items-center gap-3 text-center cursor-default group"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-[#84B056]/20 border-2 border-[#84B056]/60 flex items-center justify-center text-[#84B056] group-hover:bg-[#84B056]/30 group-hover:scale-110 transition-all duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#D9E335] flex items-center justify-center">
                    <span className="text-[8px] font-black text-[#38523A]">{step.num}</span>
                  </div>
                </div>
                <p className="text-white font-semibold text-sm leading-snug max-w-[100px]">{step.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─── */}
      <section className="w-full bg-white py-16 px-8 lg:px-20">
        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              className="text-center p-6 rounded-2xl border-2 border-gray-100 hover:border-[#84B056] hover:shadow-lg transition-all eco-card group"
            >
              <h3 className="text-4xl font-extrabold text-[#38523A] group-hover:text-[#84B056] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>{s.val}</h3>
              <p className="text-sm font-semibold text-gray-600 mt-1">{s.label}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Services Section ─── */}
      <section className="w-full bg-[#F8F9FA] py-20 px-8 lg:px-20">
        <motion.div className="text-center max-w-2xl mx-auto mb-14" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <p className="text-xs uppercase tracking-widest text-[#84B056] font-semibold mb-2">What We're Offering</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#38523A]" style={{ fontFamily: "'Amatic SC', cursive", letterSpacing: '2px' }}>
            The Services We're Providing
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              className={`eco-card eco-card-hover p-8 rounded-2xl cursor-default group ${s.active ? 'bg-[#38523A] text-white' : 'bg-white'}`}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                style={{ background: s.active ? 'rgba(217,227,53,0.2)' : s.bg, color: s.active ? '#D9E335' : s.color }}
              >
                {s.icon}
              </div>
              <h3 className={`text-xl font-bold mb-3 ${s.active ? 'text-white' : 'text-[#38523A]'}`}
                style={{ fontFamily: "'Amatic SC', cursive", letterSpacing: '1px', fontSize: '22px' }}
              >
                {s.title}
              </h3>
              <p className={`text-sm leading-relaxed ${s.active ? 'text-white/75' : 'text-gray-500'}`}>{s.desc}</p>
              {s.active && (
                <button onClick={onStartApp} className="mt-5 flex items-center gap-1.5 text-sm font-bold text-[#D9E335] hover:text-white transition-colors cursor-pointer">
                  Get Started <ArrowRight size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── About / Mission Section ─── */}
      <section className="w-full bg-white py-20 px-8 lg:px-20 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative">
          <img
            src="https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&q=80"
            alt="E-waste recycling workers"
            className="rounded-2xl w-full h-80 object-cover shadow-2xl"
          />
          <div className="absolute -bottom-6 -left-6 bg-[#38523A] text-white rounded-2xl px-6 py-4 shadow-xl">
            <p className="text-4xl font-extrabold text-[#D9E335]" style={{ fontFamily: 'Inter, sans-serif' }}>18+</p>
            <p className="text-xs text-white/70 font-semibold uppercase tracking-wider">Years of Experience</p>
          </div>
          {/* Decorative yellow block */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#D9E335] rounded-2xl -z-10" />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} className="space-y-5">
          <p className="text-xs uppercase tracking-widest text-[#84B056] font-semibold">Get to Know About Us →</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#38523A]" style={{ fontFamily: "'Amatic SC', cursive", letterSpacing: '2px' }}>
            Leading in E-Waste<br/>Management Services
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            EcoTrack AI combines artificial intelligence with certified logistics to make responsible e-waste disposal effortless for individuals and businesses.
          </p>
          <ul className="space-y-3">
            {['AI-powered device identification & hazard detection', 'Certified recycling center partner network', 'Real-time driver tracking & scheduling'].map((pt, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="mt-1 w-4 h-4 rounded-full bg-[#84B056] flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                {pt}
              </li>
            ))}
          </ul>
          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-2 bg-[#f0f7e8] rounded-xl px-4 py-3 text-sm font-semibold text-[#38523A]">
              <span className="text-lg">01</span> Going Above & Beyond
            </div>
            <div className="flex items-center gap-2 bg-[#f0f7e8] rounded-xl px-4 py-3 text-sm font-semibold text-[#38523A]">
              <span className="text-lg">02</span> Committed to People First
            </div>
          </div>
          <button onClick={onStartApp} className="mt-4 px-7 py-3 rounded-lg bg-[#D9E335] text-[#38523A] font-bold text-sm hover:bg-[#FFDE59] transition-all shadow-md cursor-pointer">
            Discover More
          </button>
        </motion.div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="relative w-full min-h-[280px] flex items-center justify-center text-center" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="absolute inset-0 bg-[#38523A]/80" />
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative z-10 space-y-6 px-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white" style={{ fontFamily: "'Amatic SC', cursive", letterSpacing: '3px' }}>
            Manage Waste Effectively<br/>&amp; Reduce Environmental Impact
          </h2>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <button onClick={onStartApp} className="px-8 py-3.5 rounded-lg bg-[#D9E335] text-[#38523A] font-bold text-sm hover:bg-[#FFDE59] transition-all shadow-lg cursor-pointer">
              Request a Pickup
            </button>
            <button onClick={onOpenAuth} className="px-8 py-3.5 rounded-lg border-2 border-white text-white font-semibold text-sm hover:bg-white/10 transition-all cursor-pointer">
              Contact With Us
            </button>
          </div>
        </motion.div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="w-full bg-[#F8F9FA] py-20 px-8 lg:px-20">
        <motion.div className="text-center mb-12" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2 className="text-4xl md:text-5xl font-bold text-[#38523A]" style={{ fontFamily: "'Amatic SC', cursive", letterSpacing: '2px' }}>
            What Our Users Say
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              quote: '"EcoTrack AI completely demystified the recycling process for my old company laptops. In 10 minutes we scheduled a certified pickup, tracked the driver, and logged our ESG carbon impact credits."',
              name: 'Amanda Myers', role: 'Sustainability Coordinator, TechGlobal', initials: 'AM', color: '#84B056'
            },
            {
              quote: '"I love the gamified achievements! I scanned three old phones and earned 250 EcoPoints, unlocking the Green Recruit badge. Very encouraging interface!"',
              name: 'David Lin', role: 'University Student & Tech Enthusiast', initials: 'DL', color: '#38523A'
            }
          ].map((t, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              className="eco-card eco-card-hover bg-white p-8 rounded-2xl space-y-5"
            >
              <div className="text-[#D9E335] text-5xl leading-none font-serif">"</div>
              <p className="text-gray-600 italic text-sm leading-relaxed">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md" style={{ background: t.color }}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-[#38523A] text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="w-full bg-[#38523A] text-white px-8 lg:px-20 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D9E335] flex items-center justify-center">
              <Leaf size={18} className="text-[#38523A]" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight font-mono">ECOTRACK<span className="text-[#D9E335]">.AI</span></span>
              <p className="text-[9px] text-white/50 uppercase tracking-widest -mt-0.5">E-Waste Management</p>
            </div>
          </div>
          <p className="text-xs text-white/50">© 2026 EcoTrack AI Inc. All rights reserved. Supporting R2v3 and e-Stewards standards.</p>
          <div className="flex gap-6 text-xs text-white/60">
            <a href="#" className="hover:text-[#D9E335] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#D9E335] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#D9E335] transition-colors">ESG Reporting</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
