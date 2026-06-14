import { Verified, Upload, ClipboardList, SearchCode, Zap, Smile } from 'lucide-react';
import { Screen } from '../types';
import logo from '../assets/logo.png';

// ─── Landing Page ─────────────────────────────────────────────────────────────

interface LandingProps {
  onStart: () => void;
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

const footerLinks = ['Privacy Policy', 'Terms of Service', 'Contact Support', 'Careers'];

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 z-50 w-full">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Curator Logo" className="w-9 h-9 rounded-lg object-contain shadow-sm" />
            <span className="text-xl font-extrabold text-primary font-headline">Checkpoint ATS</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 font-headline font-semibold">
            <a href="#" className="text-slate-600 hover:text-primary transition-colors">Pricing</a>
            <a href="#" className="text-slate-600 hover:text-primary transition-colors">Blog</a>
          </div>
          <div className="flex items-center gap-4 font-headline font-semibold">
            <button className="text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-md transition-all">Login</button>
            <button onClick={onStart} className="primary-gradient text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero */}
        <section className="relative px-6 py-20 md:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
            <div className="w-full md:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-primary font-headline text-sm font-medium">
                <Verified size={16} className="text-secondary" /> AI-Powered Curation
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
                <button className="bg-slate-100 text-primary px-8 py-4 rounded-xl font-headline font-bold text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                  <ClipboardList size={20} /> Paste Job Description
                </button>
              </div>
            </div>

            {/* Hero Preview Mock */}
            <div className="w-full md:w-1/2 relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative border border-slate-100">
                <div className="absolute inset-0 bg-slate-50 flex">
                  <div className="w-3/5 bg-white p-8 space-y-4 border-r border-slate-100">
                    <div className="h-4 w-3/4 bg-slate-100 rounded" />
                    <div className="h-2 w-full bg-slate-50 rounded" />
                    <div className="h-2 w-5/6 bg-slate-50 rounded" />
                  </div>
                  <div className="w-2/5 p-6 space-y-4">
                    <div className="text-center pb-2">
                      <div className="text-3xl font-headline font-extrabold text-primary">—</div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">ATS Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-100 -z-10 skew-x-12 translate-x-1/4" />
        </section>

        {/* How it Works */}
        <section className="py-24 px-6 bg-white">
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
          <div className="flex gap-8 mb-4">
            {footerLinks.map(link => (
              <a key={link} href="#" className="text-slate-500 hover:text-primary hover:underline font-body text-xs tracking-wide transition-all">
                {link}
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
