import { Verified, Upload, ClipboardList, SearchCode, Zap, Smile, Github, Code2, Sparkles } from 'lucide-react';
import { Screen } from '../types';
import { Logo } from '../components/ui/Logo';

// ─── Landing Page ─────────────────────────────────────────────────────────────

interface LandingProps {
  onStart: (focusJd?: boolean) => void;
}

const steps = [
  {
    title: 'Analyze',
    icon: SearchCode,
    desc: 'Our AI parses your resume exactly like a Fortune 500 ATS, identifying missing keywords and formatting errors.',
    color: 'bg-slate-100',
  },
  {
    title: 'Optimize',
    icon: Zap,
    desc: 'Receive instant, editorial-grade feedback on how to rewrite your bullets for maximum impact.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    title: 'Land Interviews',
    icon: Smile,
    desc: 'Apply with confidence knowing your resume is perfectly tailored to the job description.',
    color: 'bg-primary/10 text-primary',
  },
];

const footerLinks = [
  { label: 'GitHub Repository', href: 'https://github.com/Suvesh108/ATS-checker' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Free & Open Source', href: 'https://github.com/Suvesh108/ATS-checker' },
  { label: 'Privacy Policy', href: '#' },
];

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 z-50 w-full">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Logo size={36} showText />
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-100">
              100% Free
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8 font-headline font-semibold">
            <a href="#how-it-works" className="text-slate-600 hover:text-primary transition-colors text-sm">
              How It Works
            </a>
            <a
              href="https://github.com/Suvesh108/ATS-checker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors text-sm"
            >
              <Github size={16} />
              <span>GitHub Repo</span>
            </a>
          </div>
          <div className="flex items-center gap-3 font-headline font-semibold">
            <a
              href="https://github.com/Suvesh108/ATS-checker"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all text-sm font-bold"
            >
              <Code2 size={16} className="text-primary" />
              <span>Free Code</span>
            </a>
            <button onClick={() => onStart()} className="primary-gradient text-white px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-bold">
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero */}
        <section className="relative px-6 pt-8 pb-20 md:pt-12 md:pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
            <div className="w-full md:w-1/2 space-y-8">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-primary font-headline text-sm font-medium">
                  <Verified size={16} className="text-secondary" /> AI-Powered Curation
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-headline text-sm font-semibold border border-emerald-100">
                  <Sparkles size={14} className="text-emerald-500" /> Free & Open Source
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight text-primary leading-[1.1]">
                Get Your Resume Past the ATS Filters
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                Instantly analyze your resume against job descriptions to boost your interview chances.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onStart}
                  className="primary-gradient text-white px-8 py-4 rounded-xl font-headline font-bold text-lg shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={20} /> Upload Your Resume
                </button>
                <button
                  onClick={() => onStart(true)}
                  className="bg-slate-100 text-primary px-8 py-4 rounded-xl font-headline font-bold text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <ClipboardList size={20} /> Paste Job Description
                </button>
              </div>
            </div>

            {/* Hero Preview Mock */}
            <div className="w-full md:w-1/2 relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative border border-slate-100/80 bg-slate-50 p-4">
                <div className="w-full h-full bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                  
                  {/* Header/Toolbar */}
                  <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono font-medium">resume_senior_eng.pdf</span>
                    <div className="w-14" />
                  </div>

                  {/* Main content split */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Left: Resume Content Preview */}
                    <div className="w-3/5 p-6 border-r border-slate-100 overflow-y-auto space-y-4 font-sans text-[11px] text-slate-600">
                      <div className="border-b border-slate-100 pb-3">
                        <h4 className="font-extrabold text-sm text-slate-800 tracking-tight">Alex Rivera</h4>
                        <p className="text-slate-400 font-medium text-[10px]">Senior Full-Stack Developer • San Francisco, CA</p>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-bold text-slate-800 text-[9px] uppercase tracking-wider">Experience</h5>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>TechCorp Inc — Tech Lead</span>
                            <span className="text-slate-400 text-[9px]">2022 - Present</span>
                          </div>
                          <p className="text-[10px] leading-relaxed">
                            • Orchestrated transition to microservices architecture, improving system uptime by <span className="bg-green-50 text-green-700 px-1 py-0.5 rounded font-bold font-mono">14%</span>.
                          </p>
                          <p className="text-[10px] leading-relaxed">
                            • Led a cross-functional team of 6 engineers using <span className="bg-primary/5 text-primary px-1 py-0.5 rounded font-bold">React</span>, <span className="bg-primary/5 text-primary px-1 py-0.5 rounded font-bold">Node.js</span>, and Kubernetes.
                          </p>
                        </div>

                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>StartupLab — Software Engineer</span>
                            <span className="text-slate-400 text-[9px]">2020 - 2022</span>
                          </div>
                          <p className="text-[10px] leading-relaxed">
                            • Refactored database queries which reduced server costs by <span className="bg-green-50 text-green-700 px-1 py-0.5 rounded font-bold font-mono">22%</span>.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Analysis & Score */}
                    <div className="w-2/5 bg-slate-50/50 p-6 flex flex-col justify-between">
                      {/* Score Circle */}
                      <div className="text-center space-y-2 flex flex-col items-center">
                        <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-white shadow-md border border-slate-100">
                          {/* Radial Progress Ring (SVG) */}
                          <svg className="absolute w-full h-full transform -rotate-90">
                            <circle cx="40" cy="40" r="34" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                            <circle cx="40" cy="40" r="34" stroke="url(#score-gradient)" strokeWidth="6" fill="transparent" strokeDasharray={213.6} strokeDashoffset={213.6 * (1 - 0.88)} strokeLinecap="round" />
                            <defs>
                              <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4f46e5" />
                                <stop offset="100%" stopColor="#06b6d4" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-slate-800 tracking-tight">88</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Score</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Excellent Match</span>
                      </div>

                      {/* Checks checklist */}
                      <div className="space-y-2 pt-4 border-t border-slate-200/60 text-[9px] font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <span className="text-green-500 font-bold">✓</span>
                          <span>18 Keywords Found</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-green-500 font-bold">✓</span>
                          <span>Formatting Check Pass</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-500 font-bold">!</span>
                          <span className="text-slate-500">2 weak action verbs</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-100 -z-10 skew-x-12 translate-x-1/4" />
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 px-6 bg-white scroll-mt-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <h2 className="text-4xl font-headline font-extrabold text-primary">The Curated Path to Hired</h2>
              <p className="text-slate-600 text-lg">
                Our three-step process transforms your generic resume into a high-performance career asset.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="group p-8 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-100"
                >
                  <div className={`w-14 h-14 ${step.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <step.icon size={28} />
                  </div>
                  <h3 className="text-xl font-headline font-bold text-primary mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto primary-gradient rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-white leading-tight">
                Ready to bypass the digital gatekeepers?
              </h2>
              <p className="text-white/70 text-xl max-w-2xl mx-auto">
                Join professionals who have used Checkpoint ATS to land their dream roles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={onStart}
                  className="bg-white text-primary px-10 py-4 rounded-xl font-headline font-bold text-lg hover:bg-slate-50 transition-all shadow-lg"
                >
                  Start Free Analysis
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-slate-100 bg-white">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Logo size={28} showText />
          <div className="flex flex-wrap justify-center gap-8 my-2">
            {footerLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="text-slate-500 hover:text-primary hover:underline font-body text-xs tracking-wide transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-slate-400 font-body text-xs tracking-wide">
            © {new Date().getFullYear()} Checkpoint ATS. The Digital Curator.
          </p>
        </div>
      </footer>
    </div>
  );
}
