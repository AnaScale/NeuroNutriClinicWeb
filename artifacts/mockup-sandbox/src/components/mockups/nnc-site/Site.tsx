import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import { format } from "date-fns";
import { ArrowRight, Menu, CheckCircle2, ChevronRight, Sparkles, Brain, Leaf, HeartHandshake, Microscope, ArrowLeft, Plus, Trash2, CalendarDays, LogIn, LogOut, User as UserIcon, Shield, Edit3, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import "./_group.css";

export type AuthUser = { id: number; email: string; name: string | null; isAdmin: boolean } | null;

// MAIN SITE COMPONENT
export function Site() {
  const [currentScreen, setCurrentScreen] = useState<
    "home" | "enroll" | "intake" | "consent" | "booking" | "confirmation" | "login" | "signup" | "dashboard" | "admin"
  >("home");

  // State to hold all form data
  const [formData, setFormData] = useState<any>({
    intake: {},
    consent: {},
    booking: {}
  });
  const [lastEnrollment, setLastEnrollment] = useState<{ id: number; claimToken: string | null } | null>(null);

  const [currentUser, setCurrentUser] = useState<AuthUser>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  // Fetch current user on mount
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : { user: null })
      .then(d => setCurrentUser(d.user))
      .catch(() => setCurrentUser(null))
      .finally(() => setAuthLoaded(true));
  }, []);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("nnc-draft");
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem("nnc-draft", JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (section: "intake" | "consent" | "booking", data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const navigateTo = (screen: typeof currentScreen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitEnrollment = async () => {
    const res = await fetch("/api/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Submission failed" }));
      throw new Error(err.error || "Submission failed");
    }
    const data = await res.json();
    setLastEnrollment({ id: data.id, claimToken: data.claimToken ?? null });
    return data;
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setCurrentUser(null);
    navigateTo("home");
    toast.success("Signed out");
  };

  return (
    <div className="min-h-screen bg-nnc-cream text-nnc-charcoal font-sans">
      <Toaster position="top-center" />
      <Nav onNavigate={navigateTo} currentScreen={currentScreen} currentUser={currentUser} onLogout={handleLogout} />
      
      <main className="pt-24 pb-20">
        {currentScreen === "home" && <ScreenHome onNavigate={navigateTo} />}
        {currentScreen === "enroll" && <ScreenEnroll onNavigate={navigateTo} />}
        {currentScreen === "intake" && <ScreenIntake onNavigate={navigateTo} formData={formData.intake} updateData={(d: any) => updateFormData("intake", d)} />}
        {currentScreen === "consent" && <ScreenConsent onNavigate={navigateTo} formData={formData.consent} updateData={(d: any) => updateFormData("consent", d)} />}
        {currentScreen === "booking" && <ScreenBooking onNavigate={navigateTo} formData={formData.booking} updateData={(d: any) => updateFormData("booking", d)} onSubmit={submitEnrollment} />}
        {currentScreen === "confirmation" && <ScreenConfirmation onNavigate={navigateTo} formData={formData} currentUser={currentUser} setCurrentUser={setCurrentUser} lastEnrollment={lastEnrollment} />}
        {currentScreen === "login" && <ScreenLogin onNavigate={navigateTo} setCurrentUser={setCurrentUser} />}
        {currentScreen === "signup" && <ScreenSignup onNavigate={navigateTo} setCurrentUser={setCurrentUser} />}
        {currentScreen === "dashboard" && <ScreenDashboard onNavigate={navigateTo} currentUser={currentUser} authLoaded={authLoaded} />}
        {currentScreen === "admin" && <ScreenAdmin onNavigate={navigateTo} currentUser={currentUser} authLoaded={authLoaded} />}
      </main>

      <Footer />
    </div>
  );
}

function Nav({ onNavigate, currentScreen, currentUser, onLogout }: { onNavigate: (screen: any) => void, currentScreen: string, currentUser: AuthUser, onLogout: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goHome = (anchor?: string) => {
    if (currentScreen !== "home") {
      onNavigate("home");
      setTimeout(() => {
        if (anchor) {
          const el = document.getElementById(anchor);
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }
      }, 100);
    } else if (anchor) {
      const el = document.getElementById(anchor);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const navLinks = [
    { label: "Philosophy", anchor: "philosophy" },
    { label: "Services", anchor: "services" },
    { label: "Journey", anchor: "journey" },
    { label: "About", anchor: "about" },
    { label: "FAQ", anchor: "faq" },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-nnc-ivory/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"}`}>
      <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-[1fr_auto_1fr] items-center gap-6">
        <nav className="hidden md:flex items-center justify-end gap-8">
          {navLinks.slice(0, 3).map((link) => (
            <button 
              key={link.label}
              onClick={() => goHome(link.anchor)}
              className="text-sm font-medium text-nnc-charcoal/70 hover:text-nnc-olive transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <button 
          type="button"
          aria-label="Neuro Nutri Clinic — Home"
          className="cursor-pointer appearance-none bg-transparent border-none p-0 m-0 justify-self-center"
          onClick={() => goHome()}
        >
          <img src="/__mockup/images/nnc-logo.png" alt="Neuro Nutri Clinic" className="h-32 md:h-40 lg:h-44 object-contain" />
        </button>

        <nav className="hidden md:flex items-center justify-start gap-8">
          {navLinks.slice(3).map((link) => (
            <button 
              key={link.label}
              onClick={() => goHome(link.anchor)}
              className="text-sm font-medium text-nnc-charcoal/70 hover:text-nnc-olive transition-colors"
            >
              {link.label}
            </button>
          ))}
          {currentUser ? (
            <>
              <button onClick={() => onNavigate("dashboard")} className="text-sm font-medium text-nnc-charcoal/70 hover:text-nnc-olive transition-colors flex items-center gap-1.5">
                <UserIcon className="w-4 h-4" /> Dashboard
              </button>
              {currentUser.isAdmin && (
                <button onClick={() => onNavigate("admin")} className="text-sm font-medium text-nnc-rose hover:text-nnc-charcoal transition-colors flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Admin
                </button>
              )}
              <button onClick={onLogout} className="text-sm font-medium text-nnc-charcoal/70 hover:text-nnc-olive transition-colors flex items-center gap-1.5">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </>
          ) : (
            <button onClick={() => onNavigate("login")} className="text-sm font-medium text-nnc-charcoal/70 hover:text-nnc-olive transition-colors flex items-center gap-1.5">
              <LogIn className="w-4 h-4" /> Sign in
            </button>
          )}
          <Button 
            onClick={() => onNavigate("enroll")}
            className="bg-nnc-olive hover:bg-nnc-charcoal text-white rounded-full px-6 py-2 shadow-nnc-soft transition-all"
          >
            Book Consultation
          </Button>
        </nav>

        <div className="md:hidden flex items-center justify-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-nnc-olive" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-nnc-cream border-l-nnc-sage/20">
            <div className="flex flex-col gap-6 mt-12">
              {navLinks.map((link) => (
                <button 
                  key={link.label}
                  onClick={() => goHome(link.anchor)}
                  className="text-xl font-serif text-left border-b border-nnc-sage/20 pb-4 text-nnc-charcoal hover:text-nnc-olive"
                >
                  {link.label}
                </button>
              ))}
              {currentUser ? (
                <>
                  <button onClick={() => onNavigate("dashboard")} className="text-xl font-serif text-left border-b border-nnc-sage/20 pb-4 text-nnc-charcoal hover:text-nnc-olive">Dashboard</button>
                  {currentUser.isAdmin && (
                    <button onClick={() => onNavigate("admin")} className="text-xl font-serif text-left border-b border-nnc-sage/20 pb-4 text-nnc-rose hover:text-nnc-charcoal">Admin</button>
                  )}
                  <button onClick={onLogout} className="text-xl font-serif text-left border-b border-nnc-sage/20 pb-4 text-nnc-charcoal hover:text-nnc-olive">Sign out</button>
                </>
              ) : (
                <button onClick={() => onNavigate("login")} className="text-xl font-serif text-left border-b border-nnc-sage/20 pb-4 text-nnc-charcoal hover:text-nnc-olive">Sign in</button>
              )}
              <Button 
                onClick={() => onNavigate("enroll")}
                className="bg-nnc-olive hover:bg-nnc-charcoal text-white rounded-full w-full py-6 mt-4"
              >
                Book Consultation
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-nnc-charcoal text-nnc-cream/80 py-16">
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="mb-6 bg-nnc-ivory p-6 rounded-xl inline-flex">
            <img src="/__mockup/images/nnc-logo.png" alt="Neuro Nutri Clinic" className="h-40 md:h-48 object-contain" />
          </div>
          <p className="max-w-md mb-6 leading-relaxed">
            Where Neuroscience Meets Nutritional Precision. We provide a science-backed, sustainable roadmap to health, empowering you to optimize brain performance and reclaim vitality.
          </p>
        </div>
        
        <div>
          <h4 className="font-serif text-xl text-nnc-ivory mb-6">Contact</h4>
          <ul className="space-y-4 text-sm">
            <li>Email: shirinakhavi@yahoo.com</li>
            <li>Phone: 416-835-5508</li>
            <li>Location: Toronto, Ontario, Canada</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-serif text-xl text-nnc-ivory mb-6">Credentials</h4>
          <ul className="space-y-2 text-sm text-nnc-cream/60">
            <li>Certified Brain Health Professional</li>
            <li>Integrative Psychiatry Training</li>
            <li>Registered Nutritional Consultant</li>
            <li>College of Homeopaths of Ontario</li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-6 md:px-12 mt-16 pt-8 border-t border-nnc-cream/10 text-center text-xs text-nnc-cream/40">
        <p>&copy; {new Date().getFullYear()} Neuro Nutri Clinic. All rights reserved.</p>
        <p className="mt-2">Disclaimer: Services are integrative and supportive, and do not replace medical diagnosis, psychiatric care, or emergency treatment.</p>
      </div>
    </footer>
  );
}

function ScreenHome({ onNavigate }: { onNavigate: (screen: any) => void }) {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-nnc-ivory to-nnc-cream pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-nnc-blush/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-nnc-sage/10 blur-3xl rounded-full -translate-x-1/3 translate-y-1/4 pointer-events-none" />
        
        <div className="container mx-auto px-6 md:px-12 relative z-10 text-center max-w-4xl">
          <Badge className="bg-nnc-olive/10 text-nnc-olive hover:bg-nnc-olive/20 mb-8 border-none px-4 py-1.5 font-medium tracking-wide">
            Integrative Holistic Health Practice
          </Badge>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-nnc-charcoal leading-[1.1] mb-6">
            Where Neuroscience Meets Nutritional Precision
          </h1>
          <p className="text-lg md:text-xl text-nnc-charcoal/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            We don't just treat symptoms; we investigate the biological "why." Discover a science-backed, sustainable roadmap to health that optimizes your mind and body at the cellular level.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={() => onNavigate("enroll")}
              size="lg"
              className="bg-nnc-olive hover:bg-nnc-charcoal text-white rounded-full px-8 py-6 text-lg shadow-nnc-soft w-full sm:w-auto transition-all"
            >
              Book Your Initial Consultation
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                const el = document.getElementById("philosophy");
                if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
              }}
              className="border-nnc-sage/30 text-nnc-olive hover:bg-nnc-sage/10 rounded-full px-8 py-6 text-lg w-full sm:w-auto bg-transparent transition-all"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section id="philosophy" className="py-24 bg-white relative">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center justify-center p-3 bg-nnc-blush/30 rounded-2xl mb-6 text-nnc-rose">
                <Brain className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-nnc-charcoal mb-6">Our Philosophy</h2>
              <p className="text-lg text-nnc-charcoal/70 mb-6 leading-relaxed">
                Whether you are struggling with chronic insomnia, brain fog, or emotional imbalances like anxiety and ADHD, we look beneath the surface.
              </p>
              <p className="text-lg text-nnc-charcoal/70 leading-relaxed">
                By utilizing advanced tools—such as Hair Mineral Analysis, Applied Nutritional Microscopy and Fatty Acid Analysis—we identify the specific mineral deficiencies and inflammatory markers that are holding you back.
              </p>
            </div>
            <div className="bg-nnc-cream p-10 rounded-3xl shadow-sm border border-nnc-sage/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-nnc-olive">
                <Microscope className="w-48 h-48" />
              </div>
              <h3 className="font-serif text-2xl text-nnc-olive mb-6 relative z-10">Advanced Diagnostics</h3>
              <ul className="space-y-6 relative z-10">
                <li className="flex gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-nnc-sage shrink-0" />
                  <div>
                    <h4 className="font-medium text-nnc-charcoal">Applied Nutritional Microscopy</h4>
                    <p className="text-sm text-nnc-charcoal/60 mt-1">Live analysis of cellular health and digestive terrain.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-nnc-sage shrink-0" />
                  <div>
                    <h4 className="font-medium text-nnc-charcoal">Hair Tissue Mineral Analysis (HTMA)</h4>
                    <p className="text-sm text-nnc-charcoal/60 mt-1">Long-term mineral balance and heavy metal screening.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-nnc-sage shrink-0" />
                  <div>
                    <h4 className="font-medium text-nnc-charcoal">Zinzino BalanceTest</h4>
                    <p className="text-sm text-nnc-charcoal/60 mt-1">Fatty acid profiling to measure systemic inflammation.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-24 bg-nnc-cream">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-3xl">
          <h2 className="font-serif text-4xl md:text-5xl text-nnc-charcoal mb-10">Who This Is For</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-nnc-sage/20 shadow-sm text-lg text-nnc-charcoal/80">
              Do you struggle with chronic insomnia, brain fog, anxiety, ADHD, or digestion and metabolic issues?
            </div>
            <div className="bg-white p-6 rounded-2xl border border-nnc-sage/20 shadow-sm text-lg text-nnc-charcoal/80">
              Are you looking for a science-backed alternative to "one-size-fits-all" supplements?
            </div>
            <div className="bg-white p-6 rounded-2xl border border-nnc-sage/20 shadow-sm text-lg text-nnc-charcoal/80">
              Are you ready to commit to cellular-level healing and lifestyle changes?
            </div>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section id="journey" className="py-24 bg-white relative">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <h2 className="font-serif text-4xl md:text-5xl text-nnc-charcoal mb-4 text-center">The NNC Journey</h2>
          <p className="text-center text-nnc-olive font-medium tracking-wide mb-16 uppercase text-sm">From Root Cause to Vitality</p>
          
          <div className="space-y-12">
            {[
              { title: "Discovery & Assessment", text: "We begin by reviewing your life history, diet, and lifestyle through comprehensive intake forms. This allows us to map out the potential environmental and habits-based drivers of your symptoms." },
              { title: "Biological Data (Diagnostics)", text: "We move from theory to evidence if requested by using Applied Nutritional Microscopy, Inflammatory Blood test (Zinzino), and Hair Tissue Mineral Analysis. By seeing your cells in real-time and measuring your mineral 'bank account,' and other markers, we identify exactly what your body is missing and what toxicities need to be cleared." },
              { title: "Nutritional Rebuilding (The Hardware)", text: "We implement your customized NNC diet and lifestyle protocol. Using specific supplements and minerals such as Schussler Tissue Salts and targeted, high-bioavailability nutrients, we stabilize your physical 'hardware'—rebalancing your biochemistry and calming the nervous system." },
              { title: "Homeopathic Integration (The Software)", text: "Once the physical body is supported, we introduce individualized Homeopathy. This step addresses the 'vital force,' using specific remedies to help clear deep-seated emotional patterns and stimulate your body's innate ability to heal itself from the inside out." },
              { title: "Optimization & Peak Performance", text: "In the final phase, we fine-tune your protocol for long-term maintenance. We ensure your mental, emotional, and physical bodies are synchronized, leaving you with a clear mind and a resilient body." }
            ].map((step, i) => (
              <div key={i} className="flex gap-6 md:gap-8">
                <div className="w-16 h-16 rounded-full bg-nnc-cream text-nnc-olive font-serif text-2xl flex items-center justify-center shrink-0 border-2 border-nnc-sage/30">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-nnc-charcoal mb-2">{step.title}</h3>
                  <p className="text-nnc-charcoal/70 leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Shirin */}
      <section id="about" className="py-24 bg-nnc-sage/10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl text-nnc-charcoal mb-4 text-center">Meet Shirin Akhavi</h2>
            <p className="text-center text-nnc-olive font-medium tracking-wide mb-12 uppercase text-sm">Holistic Integrative Practitioner & Founder</p>
            
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-nnc-soft border border-nnc-sage/20">
              <div className="prose prose-lg text-nnc-charcoal/80 max-w-none">
                <p className="text-xl font-serif text-nnc-olive italic mb-8 border-l-4 border-nnc-sage pl-6">
                  "My background in International Commerce and R&D allows me to look behind the label; I leverage years of experience in global raw material sourcing and product formulation to ensure that every supplement recommended meets the highest standards of purity, bioavailability, and clinical efficacy."
                </p>
                <p>
                  At Neuro Nutri Clinic, I believe that true health is not just the absence of symptoms—it is the optimization of your mental, emotional, and physical potential. My mission is to move you away from "guessing" with supplements and towards a precision-based protocol rooted in cellular science.
                </p>
                <p>
                  I specialize in the connection between the brain and the gut. By combining the diagnostic frameworks of Amen University (Brain Health) and Psychiatry Redefined with the energetic healing of Homeopathy, I offer a truly integrative "Neuro-Nutritional" approach.
                </p>
                
                <h4 className="font-serif text-2xl text-nnc-charcoal mt-10 mb-4">A Decade of Dedication</h4>
                <p>
                  My practice is built on a foundation of rigorous standards and long-term commitment. I have been a member in good standing of the International Organization of Nutritional Consultants (IONC) since 2014, adhering to the strict ethical standards of Orthomolecular health. In 2017, my commitment to academic excellence was recognized by the Golden Key International Honor Society.
                </p>

                <h4 className="font-serif text-2xl text-nnc-charcoal mt-10 mb-4">Why I Do This</h4>
                <p>
                  I founded Neuro Nutri Clinic because I saw too many people "falling through the cracks" of standard healthcare. They were told their blood work was "normal," yet they felt exhausted, anxious, and foggy. I am here to validate your experience with data and provide you with a roadmap to recovery that is sustainable, scientific, and deeply supportive.
                </p>
              </div>
            </div>

            {/* Trust Bar */}
            <div className="mt-16 flex flex-wrap justify-center gap-4 md:gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <Badge variant="outline" className="px-4 py-2 border-nnc-sage">Amen University</Badge>
              <Badge variant="outline" className="px-4 py-2 border-nnc-sage">Psychiatry Redefined</Badge>
              <Badge variant="outline" className="px-4 py-2 border-nnc-sage">IONC (since 2014)</Badge>
              <Badge variant="outline" className="px-4 py-2 border-nnc-sage">Golden Key Honour Society</Badge>
              <Badge variant="outline" className="px-4 py-2 border-nnc-sage">CSOM</Badge>
              <Badge variant="outline" className="px-4 py-2 border-nnc-sage">CHO</Badge>
              <Badge variant="outline" className="px-4 py-2 border-nnc-sage">NASH</Badge>
              <Badge variant="outline" className="px-4 py-2 border-nnc-sage">Harvard Medical School</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-nnc-charcoal mb-6">Our Services</h2>
            <p className="text-lg text-nnc-charcoal/70">
              We don't believe in "one-size-fits-all" health. We provide a tiered approach to wellness, moving from deep diagnostic analysis to consistent, habit-forming support.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-nnc-sage/20 shadow-sm hover:shadow-nnc-soft transition-all duration-300 relative overflow-hidden group bg-nnc-ivory">
              <div className="absolute top-0 left-0 w-full h-1 bg-nnc-sage transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-nnc-charcoal">Tier 1: Basic</CardTitle>
                <CardDescription className="text-nnc-olive font-medium">60 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif mb-6">$250 <span className="text-sm font-sans text-nnc-charcoal/50">+ HST</span></div>
                <p className="text-sm text-nnc-charcoal/70 leading-relaxed">
                  Focuses on a single modality (Holistic Nutrition, Homeopathy, or Brain Health Coaching). Includes one deep-dive session and a targeted wellness plan.
                </p>
              </CardContent>
            </Card>

            <Card className="border-nnc-olive/40 shadow-md relative overflow-hidden transform md:-translate-y-4 bg-white">
              <div className="absolute top-0 left-0 w-full h-1 bg-nnc-olive" />
              <div className="absolute top-4 right-4 bg-nnc-blush text-nnc-charcoal text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Popular</div>
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-nnc-charcoal">Tier 2: Comprehensive</CardTitle>
                <CardDescription className="text-nnc-olive font-medium">90 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-serif mb-6 text-nnc-olive">$350 <span className="text-sm font-sans text-nnc-charcoal/50">+ HST</span></div>
                <p className="text-sm text-nnc-charcoal/70 leading-relaxed">
                  A multi-dimensional approach that integrates all relevant clinic modalities into one cohesive protocol. Synergistic in nature, addressing biochemical and neurological aspects simultaneously.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => onNavigate("enroll")} className="w-full bg-nnc-olive hover:bg-nnc-charcoal text-white rounded-full">Select Tier 2</Button>
              </CardFooter>
            </Card>

            <Card className="border-nnc-sage/20 shadow-sm hover:shadow-nnc-soft transition-all duration-300 relative overflow-hidden group bg-nnc-ivory">
              <div className="absolute top-0 left-0 w-full h-1 bg-nnc-sage transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-nnc-charcoal">Tier 3: Plus</CardTitle>
                <CardDescription className="text-nnc-olive font-medium">Weekly Coaching</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif mb-6">$450 <span className="text-sm font-sans text-nnc-charcoal/50">+ HST</span></div>
                <p className="text-sm text-nnc-charcoal/70 leading-relaxed">
                  Includes the full Integrated Protocol plus high-accountability support. Features two 15-minute weekly coaching check-ins to monitor progress and refine the protocol.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 pt-12 border-t border-nnc-sage/20">
            <h3 className="font-serif text-2xl text-center mb-8">Targeted Assessments & Therapies</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-6 rounded-2xl bg-nnc-cream">
                <h4 className="font-medium text-nnc-charcoal mb-2">Live Blood Cell Analysis</h4>
                <p className="text-sm text-nnc-charcoal/60 mb-3">Initial Session (60 min)</p>
                <p className="font-serif text-lg text-nnc-olive">$250 <span className="text-xs">+ HST</span></p>
              </div>
              <div className="p-6 rounded-2xl bg-nnc-cream">
                <h4 className="font-medium text-nnc-charcoal mb-2">Hair Tissue Mineral Analysis</h4>
                <p className="text-sm text-nnc-charcoal/60 mb-3">Complete Lab & Discovery</p>
                <p className="font-serif text-lg text-nnc-olive">$370 <span className="text-xs">+ HST</span></p>
              </div>
              <div className="p-6 rounded-2xl bg-nnc-cream">
                <h4 className="font-medium text-nnc-charcoal mb-2">Bach Flower Therapy</h4>
                <p className="text-sm text-nnc-charcoal/60 mb-3">Initial Consultation (60 min)</p>
                <p className="font-serif text-lg text-nnc-olive">$125 <span className="text-xs">+ HST</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-nnc-cream">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="font-serif text-4xl md:text-5xl text-nnc-charcoal mb-12 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="bg-white px-6 rounded-xl border border-nnc-sage/20">
              <AccordionTrigger className="text-left font-medium hover:no-underline text-nnc-charcoal hover:text-nnc-olive py-4">How do you specifically address Brain and Mental Health?</AccordionTrigger>
              <AccordionContent className="text-nnc-charcoal/70 leading-relaxed pb-4">
                We view mental health as a reflection of physical brain function. Using frameworks from Amen University and Psychiatry Redefined, we focus on the gut-brain axis and neurotransmitter balance. We optimize your "biological hardware" to improve focus, stabilize mood, and resolve the physiological triggers of anxiety and insomnia.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="bg-white px-6 rounded-xl border border-nnc-sage/20">
              <AccordionTrigger className="text-left font-medium hover:no-underline text-nnc-charcoal hover:text-nnc-olive py-4">What is Applied Nutritional Microscopy?</AccordionTrigger>
              <AccordionContent className="text-nnc-charcoal/70 leading-relaxed pb-4">
                This is a live analysis of a single drop of blood. By viewing your cells in real-time under a high-powered microscope, we can see immediate markers of inflammation, oxidative stress, and nutritional deficiencies. This provides an instant visual "roadmap" for your customized protocol.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="bg-white px-6 rounded-xl border border-nnc-sage/20">
              <AccordionTrigger className="text-left font-medium hover:no-underline text-nnc-charcoal hover:text-nnc-olive py-4">How does Hair Tissue Mineral Analysis (HTMA) work?</AccordionTrigger>
              <AccordionContent className="text-nnc-charcoal/70 leading-relaxed pb-4">
                HTMA is a non-invasive screening that uses a hair sample to measure the mineral content of your tissues. Unlike blood tests that show a "snapshot" of the moment, hair analysis provides a 3-month metabolic blueprint. This allows us to identify heavy metal toxicities and long-term mineral imbalances that are the root causes of low energy and chronic stress.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white px-6 rounded-xl border border-nnc-sage/20">
              <AccordionTrigger className="text-left font-medium hover:no-underline text-nnc-charcoal hover:text-nnc-olive py-4">What is the Zinzino BalanceTest (Fatty Acid Analysis)?</AccordionTrigger>
              <AccordionContent className="text-nnc-charcoal/70 leading-relaxed pb-4">
                This scientific dried-blood-spot test measures your Omega-6:3 ratio. It allows us to quantify systemic inflammation and precisely tailor your intake of essential fatty acids to optimize brain function and cardiovascular health.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5" className="bg-white px-6 rounded-xl border border-nnc-sage/20">
              <AccordionTrigger className="text-left font-medium hover:no-underline text-nnc-charcoal hover:text-nnc-olive py-4">What is the role of Homeopathy at Neuro Nutri Clinic?</AccordionTrigger>
              <AccordionContent className="text-nnc-charcoal/70 leading-relaxed pb-4">
                Homeopathy is used to stimulate your body's innate healing response. By selecting highly individualized remedies based on your unique physical and emotional symptoms, we address the "vital force" of the body. This helps resolve deep-seated imbalances and supports your system in a way that nutrition alone cannot.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-white px-6 rounded-xl border border-nnc-sage/20">
              <AccordionTrigger className="text-left font-medium hover:no-underline text-nnc-charcoal hover:text-nnc-olive py-4">Why are Schussler Tissue Salts part of the protocol and why do I need to chew them?</AccordionTrigger>
              <AccordionContent className="text-nnc-charcoal/70 leading-relaxed pb-4">
                These are 12 essential micro-minerals prepared for immediate cellular absorption. They bypass complex digestive processes to restore mineral balance at the cellular level, which is crucial for nerve health, metabolic function, and physical recovery. We recommend chewing them because they are absorbed through the mucous membranes in the mouth, entering your bloodstream directly for faster and more efficient use by your body.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="bg-white px-6 rounded-xl border border-nnc-sage/20">
              <AccordionTrigger className="text-left font-medium hover:no-underline text-nnc-charcoal hover:text-nnc-olive py-4">How do Bach Flower Remedies help with Emotional Balancing?</AccordionTrigger>
              <AccordionContent className="text-nnc-charcoal/70 leading-relaxed pb-4">
                We utilize these essences to address the emotional aspect of health. They help clear negative emotional states like fear, uncertainty, or overwhelm. By balancing your emotional body alongside your physical nutritional needs, we create a truly integrative path to wellness.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="bg-white px-6 rounded-xl border border-nnc-sage/20">
              <AccordionTrigger className="text-left font-medium hover:no-underline text-nnc-charcoal hover:text-nnc-olive py-4">How do the 15-minute check-ins work?</AccordionTrigger>
              <AccordionContent className="text-nnc-charcoal/70 leading-relaxed pb-4">
                These are "laser-focused" sessions held via video or phone. We review your weekly tracker, adjust your remedy dosages if needed, and discuss one specific health hurdle. It's the highest level of accountability in the shortest amount of time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="bg-white px-6 rounded-xl border border-nnc-sage/20">
              <AccordionTrigger className="text-left font-medium hover:no-underline text-nnc-charcoal hover:text-nnc-olive py-4">Can I take these supplements with my current medication?</AccordionTrigger>
              <AccordionContent className="text-nnc-charcoal/70 leading-relaxed pb-4">
                While our protocols focus on natural minerals and vitamins, we always review your current medications during the Initial Deep-Dive Consultation to ensure everything is balanced and safe for your specific needs. Though you need to consult with your physician regarding this matter.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA / Contact Teaser */}
      <section className="py-24 bg-nnc-charcoal text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-nnc-olive opacity-20 mix-blend-multiply" />
        <div className="container mx-auto px-6 md:px-12 relative z-10 text-center max-w-3xl">
          <h2 className="font-serif text-4xl md:text-5xl text-nnc-ivory mb-6">Ready to start your journey?</h2>
          <p className="text-lg text-nnc-cream/80 mb-10 leading-relaxed">
            Commit to cellular-level healing and lifestyle changes. Begin your enrollment process to book your comprehensive initial consultation.
          </p>
          <Button 
            onClick={() => onNavigate("enroll")}
            size="lg"
            className="bg-white hover:bg-nnc-cream text-nnc-charcoal rounded-full px-10 py-6 text-lg shadow-xl"
          >
            Begin Enrollment <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// ENROLLMENT SCREENS
// ============================================================================

function ScreenEnroll({ onNavigate }: { onNavigate: (screen: any) => void }) {
  return (
    <div className="container mx-auto px-6 md:px-12 max-w-3xl py-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <Badge className="bg-nnc-olive/10 text-nnc-olive hover:bg-nnc-olive/20 mb-4 border-none">Patient Onboarding</Badge>
        <h1 className="font-serif text-4xl md:text-5xl text-nnc-charcoal mb-4">Welcome to Your Journey</h1>
        <p className="text-nnc-charcoal/70 text-lg">We need a clear picture of your internal landscape before we begin.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-nnc-soft border border-nnc-sage/20">
        <div className="space-y-8 relative">
          <div className="absolute top-8 bottom-8 left-[23px] w-px bg-nnc-sage/20" />
          
          <div className="flex gap-6 relative z-10">
            <div className="w-12 h-12 rounded-full bg-nnc-blush flex items-center justify-center text-nnc-charcoal font-serif font-bold text-xl shrink-0 border-4 border-white shadow-sm">1</div>
            <div>
              <h3 className="font-serif text-2xl text-nnc-charcoal mb-2">Comprehensive Intake</h3>
              <p className="text-nnc-charcoal/70 leading-relaxed">A detailed evaluation of your life history, diet, and lifestyle designed to uncover the root causes of your symptoms. This form is extensive—please allow 15-20 minutes to complete.</p>
            </div>
          </div>
          
          <div className="flex gap-6 relative z-10">
            <div className="w-12 h-12 rounded-full bg-nnc-cream border-2 border-nnc-sage/30 flex items-center justify-center text-nnc-charcoal/40 font-serif font-bold text-xl shrink-0 bg-white">2</div>
            <div className="opacity-60">
              <h3 className="font-serif text-2xl text-nnc-charcoal mb-2">Consent & Tier Selection</h3>
              <p className="text-nnc-charcoal/70 leading-relaxed">Review our clinical scope of practice, financial policies, and select the level of care that best suits your goals.</p>
            </div>
          </div>
          
          <div className="flex gap-6 relative z-10">
            <div className="w-12 h-12 rounded-full bg-nnc-cream border-2 border-nnc-sage/30 flex items-center justify-center text-nnc-charcoal/40 font-serif font-bold text-xl shrink-0 bg-white">3</div>
            <div className="opacity-60">
              <h3 className="font-serif text-2xl text-nnc-charcoal mb-2">Book Consultation</h3>
              <p className="text-nnc-charcoal/70 leading-relaxed">Select a date and time for your initial Deep-Dive consultation with Shirin.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-nnc-sage/20 flex justify-end">
          <Button 
            onClick={() => onNavigate("intake")}
            size="lg"
            className="bg-nnc-olive hover:bg-nnc-charcoal text-white rounded-full px-8 w-full md:w-auto"
          >
            Start Step 1: Intake Form <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ScreenIntake({ onNavigate, formData, updateData }: { onNavigate: (s: any) => void, formData: any, updateData: (d: any) => void }) {
  const handleNext = () => {
    // Basic validation
    if (!formData.fullName || !formData.email) {
      toast.error("Please provide at least your Full Name and Email to continue.");
      return;
    }
    onNavigate("consent");
  };

  const handleChange = (field: string, val: any) => {
    updateData({ [field]: val });
  };

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-4xl py-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => onNavigate("enroll")}><ArrowLeft className="w-5 h-5 text-nnc-olive" /></Button>
        <div>
          <h1 className="font-serif text-3xl text-nnc-charcoal">Comprehensive Intake</h1>
          <p className="text-nnc-charcoal/60 text-sm">Step 1 of 3</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-nnc-sage/20 mb-8 space-y-16">
        
        {/* Patient Info */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Patient Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={formData.fullName || ''} onChange={e => handleChange("fullName", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={formData.dob || ''} onChange={e => handleChange("dob", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={formData.age || ''} onChange={e => handleChange("age", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Input value={formData.gender || ''} onChange={e => handleChange("gender", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={formData.date || format(new Date(), 'yyyy-MM-dd')} onChange={e => handleChange("date", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Textarea value={formData.address || ''} onChange={e => handleChange("address", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" value={formData.phone || ''} onChange={e => handleChange("phone", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={formData.email || ''} onChange={e => handleChange("email", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Emergency Contact & Phone</Label>
              <Input value={formData.emergencyContact || ''} onChange={e => handleChange("emergencyContact", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
          </div>
        </section>

        {/* Primary Health Concerns */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Primary Health Concerns</h2>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Please list your top 3 concerns (physical, emotional, cognitive, neurological, or metabolic):</Label>
              <Textarea placeholder="1. &#10;2. &#10;3. " value={formData.concerns || ''} onChange={e => handleChange("concerns", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <Label>When did these concerns begin?</Label>
              <Input value={formData.concernsBegin || ''} onChange={e => handleChange("concernsBegin", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
          </div>
        </section>

        {/* General Information */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">General Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Height</Label>
              <Input value={formData.height || ''} onChange={e => handleChange("height", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Weight</Label>
              <Input value={formData.weight || ''} onChange={e => handleChange("weight", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Lightest Adult Weight</Label>
              <Input value={formData.lightestWeight || ''} onChange={e => handleChange("lightestWeight", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Reason for Lightest Weight</Label>
              <Input value={formData.lightestReason || ''} onChange={e => handleChange("lightestReason", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Heaviest Adult Weight</Label>
              <Input value={formData.heaviestWeight || ''} onChange={e => handleChange("heaviestWeight", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Reason for Heaviest Weight</Label>
              <Input value={formData.heaviestReason || ''} onChange={e => handleChange("heaviestReason", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Blood Type</Label>
              <Input value={formData.bloodType || ''} onChange={e => handleChange("bloodType", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Marital status</Label>
              <Input value={formData.maritalStatus || ''} onChange={e => handleChange("maritalStatus", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Living with</Label>
              <Input value={formData.livingWith || ''} onChange={e => handleChange("livingWith", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Pets</Label>
              <Input value={formData.pets || ''} onChange={e => handleChange("pets", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
          </div>
        </section>

        {/* Family Health History */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Family Health History</h2>
            <p className="text-sm text-nnc-charcoal/60 mt-1">Age, major health concerns, cause of death</p>
          </div>
          <div className="space-y-4">
            {[
              "Mother", "Father", "Grand-father (Mother side)", "Grand-mother (Mother side)", 
              "Grand-father (Father side)", "Grand-mother (Father side)", "Sister", "Brother", "Children"
            ].map(member => (
              <div key={member} className="space-y-2">
                <Label>{member}</Label>
                <Input value={formData[`family_${member}`] || ''} onChange={e => handleChange(`family_${member}`, e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
              </div>
            ))}
          </div>
        </section>

        {/* Personal Health History */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Personal Health History</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Natural Birth?</Label>
              <Input value={formData.naturalBirth || ''} onChange={e => handleChange("naturalBirth", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Vaccination/s (Approximate dates)</Label>
              <Input value={formData.vaccinations || ''} onChange={e => handleChange("vaccinations", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Breast fed up to</Label>
              <Input value={formData.breastFed || ''} onChange={e => handleChange("breastFed", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Weight at birth / Under or Over</Label>
              <Input value={formData.birthWeight || ''} onChange={e => handleChange("birthWeight", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Premature Birth or on time</Label>
              <Input value={formData.premature || ''} onChange={e => handleChange("premature", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Complications at birth/after birth</Label>
              <Input value={formData.birthComplications || ''} onChange={e => handleChange("birthComplications", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Major illnesses at birth</Label>
              <Input value={formData.birthIllnesses || ''} onChange={e => handleChange("birthIllnesses", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Surgery History (Body parts, Wisdom teeth)</Label>
              <Textarea value={formData.surgeries || ''} onChange={e => handleChange("surgeries", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
          </div>
        </section>

        {/* Teeth, Gum, Bowel Health */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Teeth, Gum & Bowel Health</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label>Amalgam fillings (present or removed + how many)</Label>
              <Input value={formData.amalgam || ''} onChange={e => handleChange("amalgam", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Root canals</Label>
              <Input value={formData.rootCanals || ''} onChange={e => handleChange("rootCanals", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Swollen gums</Label>
              <Input value={formData.swollenGums || ''} onChange={e => handleChange("swollenGums", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            
            {/* Bowel Health */}
            <div className="space-y-2">
              <Label>Constipation/Diarrhea</Label>
              <Input value={formData.constipationDiarrhea || ''} onChange={e => handleChange("constipationDiarrhea", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>When nervous</Label>
              <Input value={formData.bowelNervous || ''} onChange={e => handleChange("bowelNervous", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label># BM /day</Label>
              <Input value={formData.bmPerDay || ''} onChange={e => handleChange("bmPerDay", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Color & Consistency</Label>
              <Input value={formData.bowelColorConsistency || ''} onChange={e => handleChange("bowelColorConsistency", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Recent changes over past months or year</Label>
              <Input value={formData.bowelChanges || ''} onChange={e => handleChange("bowelChanges", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
          </div>
        </section>

        {/* Females Section */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Females Only</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Menstrual health (When started, Regularity)</Label>
              <Input value={formData.menstrualHealth || ''} onChange={e => handleChange("menstrualHealth", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>PMS (What type)</Label>
              <Input value={formData.pmsType || ''} onChange={e => handleChange("pmsType", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Pregnancies & Complications</Label>
              <Input value={formData.pregnancies || ''} onChange={e => handleChange("pregnancies", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Miscarriages / Abortions</Label>
              <Input value={formData.miscarriages || ''} onChange={e => handleChange("miscarriages", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Fertility history & Changes within past year</Label>
              <Input value={formData.fertility || ''} onChange={e => handleChange("fertility", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>If menopause, when did it start? Any issues?</Label>
              <Input value={formData.menopause || ''} onChange={e => handleChange("menopause", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Birth Control Pills / HRT?</Label>
              <Input value={formData.birthControlHRT || ''} onChange={e => handleChange("birthControlHRT", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
          </div>
        </section>

        {/* Substances, Environment & Sleep */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Substances, Environment & Sleep</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Smoking (Present or Past)</Label>
              <Input value={formData.smoking || ''} onChange={e => handleChange("smoking", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Recreational drug use (Present or Past)</Label>
              <Input value={formData.recDrugs || ''} onChange={e => handleChange("recDrugs", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Alcohol (Present or Past)</Label>
              <Input value={formData.alcoholUse || ''} onChange={e => handleChange("alcoholUse", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Secondhand smoke (Present or Past)</Label>
              <Input value={formData.secondhandSmoke || ''} onChange={e => handleChange("secondhandSmoke", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Occupation</Label>
              <Input value={formData.occupation || ''} onChange={e => handleChange("occupation", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Distance from home</Label>
              <Input value={formData.distanceHome || ''} onChange={e => handleChange("distanceHome", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Chemical exposure / Environmental health</Label>
              <Input value={formData.chemicalExposure || ''} onChange={e => handleChange("chemicalExposure", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>EMF exposure / Time at computer per day</Label>
              <Input value={formData.emfComputerTime || ''} onChange={e => handleChange("emfComputerTime", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            
            {/* Sleep Basics */}
            <div className="space-y-2">
              <Label>Sleep: How long / When you go to sleep</Label>
              <Input value={formData.sleepDurationWhen || ''} onChange={e => handleChange("sleepDurationWhen", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Darkness of room / Wake feeling rested</Label>
              <Input value={formData.sleepEnvironment || ''} onChange={e => handleChange("sleepEnvironment", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Naps / Do you wake up during night? (How many times and why?)</Label>
              <Input value={formData.napsWakeNight || ''} onChange={e => handleChange("napsWakeNight", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
          </div>
        </section>

        {/* Diet & Lifestyle */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Diet & Lifestyle</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Desert Island food (favorite food)</Label>
              <Input value={formData.favoriteFood || ''} onChange={e => handleChange("favoriteFood", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Exercise routine</Label>
              <Input value={formData.exerciseRoutine || ''} onChange={e => handleChange("exerciseRoutine", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Time for self/hobby</Label>
              <Input value={formData.hobbyTime || ''} onChange={e => handleChange("hobbyTime", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Stress level (1-10) Daily / Weekly</Label>
              <Input value={formData.stressDailyWeekly || ''} onChange={e => handleChange("stressDailyWeekly", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Eating habits (Likes/Dislikes/Mostly eats)</Label>
              <Input value={formData.eatingHabits || ''} onChange={e => handleChange("eatingHabits", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Any allergies/food allergies</Label>
              <Input value={formData.allergies || ''} onChange={e => handleChange("allergies", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Beverages (Water, Teas, Liquids, Coffee, Alcohol - type and quantity)</Label>
              <Textarea value={formData.beverages || ''} onChange={e => handleChange("beverages", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl min-h-[80px]" />
            </div>
          </div>
        </section>

        {/* Medical History */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Medical History</h2>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Current diagnoses</Label>
              <Input value={formData.currentDiagnoses || ''} onChange={e => handleChange("currentDiagnoses", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Past major illnesses / surgeries</Label>
              <Input value={formData.pastIllnesses || ''} onChange={e => handleChange("pastIllnesses", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Family history (neurological, psychiatric, metabolic)</Label>
              <Input value={formData.familyHistoryDetailed || ''} onChange={e => handleChange("familyHistoryDetailed", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
          </div>
        </section>

        {/* Brain, Cognitive & Mood Health */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Brain, Cognitive & Mood Health</h2>
            <p className="text-sm text-nnc-charcoal/60 mt-1">Check all that apply and rate intensity (1-10)</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Memory changes / brain fog",
              "Difficulty concentrating / executive dysfunction",
              "Anxiety / chronic stress",
              "Depression / low mood",
              "Bipolar symptoms / mood instability",
              "ADHD traits",
              "Sleep disturbances",
              "Migraines / headaches",
              "History of concussion / head injury",
              "Neurodegenerative concerns (e.g., Alzheimer’s)",
              "Sensory sensitivity / overwhelm",
              "Other (Brain/Mood)"
            ].map(symptom => {
              const key = `symptom_${symptom.replace(/[^a-z0-9]/gi, '')}`;
              const isChecked = formData[key]?.checked || false;
              const intensity = formData[key]?.intensity || 5;

              return (
                <div key={symptom} className="bg-nnc-cream/50 p-4 rounded-xl border border-nnc-sage/10">
                  <div className="flex items-start gap-3 mb-3">
                    <Checkbox 
                      id={key}
                      checked={isChecked}
                      onCheckedChange={(c) => handleChange(key, { ...formData[key], checked: !!c })}
                    />
                    <Label htmlFor={key} className="text-sm leading-tight cursor-pointer font-medium">{symptom}</Label>
                  </div>
                  {isChecked && (
                    <div className="pl-7 pr-2">
                      <div className="flex justify-between text-xs text-nnc-charcoal/50 mb-2">
                        <span>Mild</span>
                        <span>Intensity: {intensity}</span>
                        <span>Severe</span>
                      </div>
                      <Slider 
                        defaultValue={[5]} 
                        max={10} 
                        min={1} 
                        step={1}
                        value={[intensity]}
                        onValueChange={(v) => handleChange(key, { ...formData[key], intensity: v[0] })}
                        className="py-2"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Emotional & Mental Well-being */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Emotional & Mental Well-being</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Chronic stress", "Anxiety", "Mood swings", "Trauma history", 
              "Burnout", "Emotional eating", "Other (Emotional)"
            ].map(symptom => {
              const key = `symptom_emot_${symptom.replace(/[^a-z0-9]/gi, '')}`;
              const isChecked = formData[key]?.checked || false;
              const intensity = formData[key]?.intensity || 5;
              return (
                <div key={symptom} className="bg-nnc-cream/50 p-4 rounded-xl border border-nnc-sage/10">
                  <div className="flex items-start gap-3 mb-3">
                    <Checkbox 
                      id={key}
                      checked={isChecked}
                      onCheckedChange={(c) => handleChange(key, { ...formData[key], checked: !!c })}
                    />
                    <Label htmlFor={key} className="text-sm leading-tight cursor-pointer font-medium">{symptom}</Label>
                  </div>
                  {isChecked && (
                    <div className="pl-7 pr-2">
                      <Slider value={[intensity]} max={10} min={1} step={1} onValueChange={(v) => handleChange(key, { ...formData[key], intensity: v[0] })} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Nutritional & Digestive Health */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Nutritional & Digestive Health</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Bloating / gas", "Constipation", "Diarrhea", "Acid reflux / heartburn", 
              "Food sensitivities", "Cravings (sugar, salt, caffeine)", "Low energy / fatigue", "Other (Digestive)"
            ].map(symptom => {
              const key = `symptom_dig_${symptom.replace(/[^a-z0-9]/gi, '')}`;
              const isChecked = formData[key]?.checked || false;
              const intensity = formData[key]?.intensity || 5;
              return (
                <div key={symptom} className="bg-nnc-cream/50 p-4 rounded-xl border border-nnc-sage/10">
                  <div className="flex items-start gap-3 mb-3">
                    <Checkbox 
                      id={key}
                      checked={isChecked}
                      onCheckedChange={(c) => handleChange(key, { ...formData[key], checked: !!c })}
                    />
                    <Label htmlFor={key} className="text-sm leading-tight cursor-pointer font-medium">{symptom}</Label>
                  </div>
                  {isChecked && (
                    <div className="pl-7 pr-2">
                      <Slider value={[intensity]} max={10} min={1} step={1} onValueChange={(v) => handleChange(key, { ...formData[key], intensity: v[0] })} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Hormonal & Metabolic Health */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Hormonal & Metabolic Health</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Thyroid imbalance", "Blood sugar imbalance", "Weight changes", 
              "PMS / menopause / andropause", "Low libido", "Other (Hormonal)"
            ].map(symptom => {
              const key = `symptom_horm_${symptom.replace(/[^a-z0-9]/gi, '')}`;
              const isChecked = formData[key]?.checked || false;
              const intensity = formData[key]?.intensity || 5;
              return (
                <div key={symptom} className="bg-nnc-cream/50 p-4 rounded-xl border border-nnc-sage/10">
                  <div className="flex items-start gap-3 mb-3">
                    <Checkbox 
                      id={key}
                      checked={isChecked}
                      onCheckedChange={(c) => handleChange(key, { ...formData[key], checked: !!c })}
                    />
                    <Label htmlFor={key} className="text-sm leading-tight cursor-pointer font-medium">{symptom}</Label>
                  </div>
                  {isChecked && (
                    <div className="pl-7 pr-2">
                      <Slider value={[intensity]} max={10} min={1} step={1} onValueChange={(v) => handleChange(key, { ...formData[key], intensity: v[0] })} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Lifestyle, Sleep & Stress Assessment */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Lifestyle, Sleep & Stress Assessment</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Average sleep quality (1 -10)</Label>
              <Input type="number" value={formData.sleepQuality || ''} onChange={e => handleChange("sleepQuality", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Hours/night</Label>
              <Input type="number" value={formData.sleepHours || ''} onChange={e => handleChange("sleepHours", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            
            <div className="space-y-3 md:col-span-2 bg-nnc-cream/50 p-4 rounded-xl border border-nnc-sage/10">
              <Label>Check all that apply to your sleep:</Label>
              <div className="flex flex-wrap gap-4">
                {["Difficulty falling asleep", "Night waking", "Early waking", "Unrestful sleep"].map(lbl => (
                  <div key={lbl} className="flex items-center gap-2">
                    <Checkbox id={`sleep_${lbl}`} checked={formData[`sleep_${lbl}`] || false} onCheckedChange={(c) => handleChange(`sleep_${lbl}`, !!c)} />
                    <Label htmlFor={`sleep_${lbl}`} className="cursor-pointer">{lbl}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Label>Reasons</Label>
                <Input value={formData.sleepReasons || ''} onChange={e => handleChange("sleepReasons", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl mt-1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Exercise / movement (type & frequency)</Label>
              <Input value={formData.exerciseDetail || ''} onChange={e => handleChange("exerciseDetail", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Time outdoors (daily average)</Label>
              <Input value={formData.outdoorsTime || ''} onChange={e => handleChange("outdoorsTime", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Occupation & Screen time (approx.)</Label>
              <Input value={formData.occupationScreenTime || ''} onChange={e => handleChange("occupationScreenTime", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Smoking / Rec Drugs (amount & frequency)</Label>
              <Input value={formData.smokingDrugsDetail || ''} onChange={e => handleChange("smokingDrugsDetail", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl" />
            </div>
            
            <div className="md:col-span-2 space-y-4 pt-4">
              <Label>Rate your current levels (1-10):</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {["Stress", "Anxiety", "Low mood", "Irritability", "Focus clarity", "Energy"].map(metric => {
                  const key = `metric_${metric}`;
                  const val = formData[key] || 5;
                  return (
                    <div key={metric} className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">{metric}</Label>
                        <span className="text-xs text-nnc-charcoal/60">{val}/10</span>
                      </div>
                      <Slider value={[val]} max={10} min={1} step={1} onValueChange={(v) => handleChange(key, v[0])} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-2 space-y-3 pt-4">
              <Label>Dominant emotions (check all that apply):</Label>
              <div className="flex flex-wrap gap-4">
                {["Shame", "Low self-confidence", "Loneliness and disconnection", "Hopelessness", "Anxious", "Sad", "Unmotivated", "Overwhelmed", "Angry", "Irritable", "Numb", "Grief", "Exhaustion"].map(emotion => {
                  const key = `emotion_${emotion}`;
                  return (
                    <div key={emotion} className="flex items-center gap-2">
                      <Checkbox id={key} checked={formData[key] || false} onCheckedChange={(c) => handleChange(key, !!c)} />
                      <Label htmlFor={key} className="cursor-pointer">{emotion}</Label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Notes / triggers</Label>
              <Textarea value={formData.emotionNotes || ''} onChange={e => handleChange("emotionNotes", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl min-h-[80px]" />
            </div>
          </div>
        </section>

        {/* Medications & Supplements Table */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Medications & Supplements</h2>
            <p className="text-sm text-nnc-charcoal/60 mt-1">List all medications, vaccinations, supplements, herbs, or remedies you are currently taking or have taken in the past.</p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-nnc-charcoal/60 px-2">
              <div className="col-span-4">Name</div>
              <div className="col-span-2">Dosage</div>
              <div className="col-span-3">Frequency</div>
              <div className="col-span-3">Reason</div>
            </div>
            
            {Array.from({ length: formData.medRows || 5 }).map((_, idx) => {
              const med = formData.medications?.[idx] || {};
              return (
                <div key={idx} className="grid grid-cols-12 gap-2">
                  <div className="col-span-4">
                    <Input value={med.name || ''} onChange={e => {
                      const meds = [...(formData.medications || [])];
                      meds[idx] = { ...meds[idx], name: e.target.value };
                      handleChange("medications", meds);
                    }} className="bg-nnc-cream border-nnc-sage/30 h-9" />
                  </div>
                  <div className="col-span-2">
                    <Input value={med.dosage || ''} onChange={e => {
                      const meds = [...(formData.medications || [])];
                      meds[idx] = { ...meds[idx], dosage: e.target.value };
                      handleChange("medications", meds);
                    }} className="bg-nnc-cream border-nnc-sage/30 h-9" />
                  </div>
                  <div className="col-span-3">
                    <Input value={med.freq || ''} onChange={e => {
                      const meds = [...(formData.medications || [])];
                      meds[idx] = { ...meds[idx], freq: e.target.value };
                      handleChange("medications", meds);
                    }} className="bg-nnc-cream border-nnc-sage/30 h-9" />
                  </div>
                  <div className="col-span-3">
                    <Input value={med.reason || ''} onChange={e => {
                      const meds = [...(formData.medications || [])];
                      meds[idx] = { ...meds[idx], reason: e.target.value };
                      handleChange("medications", meds);
                    }} className="bg-nnc-cream border-nnc-sage/30 h-9" />
                  </div>
                </div>
              );
            })}
            <Button variant="outline" size="sm" onClick={() => handleChange("medRows", (formData.medRows || 5) + 1)} className="mt-2 text-nnc-olive border-nnc-sage/30">
              <Plus className="w-4 h-4 mr-1" /> Add Row
            </Button>
          </div>
        </section>

        {/* Goals */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Goals, Priorities & Success Markers</h2>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>What would meaningful improvement look like for you regarding your three main concerns?</Label>
              <Textarea value={formData.goals || ''} onChange={e => handleChange("goals", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Motivation level for commitment and change right now (1–10)</Label>
                <span className="text-sm font-medium">{formData.motivation || 10}/10</span>
              </div>
              <Slider value={[formData.motivation || 10]} max={10} min={1} step={1} onValueChange={(v) => handleChange("motivation", v[0])} />
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Additional Information</h2>
          </div>
          <div className="space-y-2">
            <Label>Please share anything else you feel is important for your care:</Label>
            <Textarea value={formData.additionalInfo || ''} onChange={e => handleChange("additionalInfo", e.target.value)} className="bg-nnc-cream border-nnc-sage/30 rounded-xl min-h-[100px]" />
          </div>
        </section>

        {/* 3-Day Journal */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">3-Day Diet, Sleep, Lifestyle & Mood Journal</h2>
            <p className="text-sm text-nnc-charcoal/60 mt-1">Please complete this log for three days (include at least one weekend). This information helps identify nutrition–mood–sleep–stress patterns.</p>
          </div>
          
          {[1, 2, 3].map(day => (
            <div key={day} className="bg-nnc-cream/30 p-6 rounded-2xl border border-nnc-sage/20 space-y-6">
              <h3 className="font-serif text-xl font-medium">DAY {day}</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Water</Label>
                  <Input value={formData[`day${day}_water`] || ''} onChange={e => handleChange(`day${day}_water`, e.target.value)} className="bg-white border-nnc-sage/30 h-8" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Herbal teas</Label>
                  <Input value={formData[`day${day}_teas`] || ''} onChange={e => handleChange(`day${day}_teas`, e.target.value)} className="bg-white border-nnc-sage/30 h-8" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Sodas</Label>
                  <Input value={formData[`day${day}_sodas`] || ''} onChange={e => handleChange(`day${day}_sodas`, e.target.value)} className="bg-white border-nnc-sage/30 h-8" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Caffeine drinks</Label>
                  <Input value={formData[`day${day}_caffeine`] || ''} onChange={e => handleChange(`day${day}_caffeine`, e.target.value)} className="bg-white border-nnc-sage/30 h-8" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Alcohol</Label>
                  <Input value={formData[`day${day}_alcohol`] || ''} onChange={e => handleChange(`day${day}_alcohol`, e.target.value)} className="bg-white border-nnc-sage/30 h-8" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-nnc-charcoal/60 px-1">
                  <div className="col-span-2">Time</div>
                  <div className="col-span-5">Food and Beverage</div>
                  <div className="col-span-5">Notes (cravings, symptoms, mood)</div>
                </div>
                
                {[0, 1, 2, 3].map(row => {
                  const entry = formData[`day${day}_log`] ? formData[`day${day}_log`][row] || {} : {};
                  return (
                    <div key={row} className="grid grid-cols-12 gap-2">
                      <div className="col-span-2">
                        <Input value={entry.time || ''} onChange={e => {
                          const logs = [...(formData[`day${day}_log`] || [{},{},{},{}])];
                          logs[row] = { ...logs[row], time: e.target.value };
                          handleChange(`day${day}_log`, logs);
                        }} className="bg-white border-nnc-sage/30 h-8 text-sm" />
                      </div>
                      <div className="col-span-5">
                        <Input value={entry.food || ''} onChange={e => {
                          const logs = [...(formData[`day${day}_log`] || [{},{},{},{}])];
                          logs[row] = { ...logs[row], food: e.target.value };
                          handleChange(`day${day}_log`, logs);
                        }} className="bg-white border-nnc-sage/30 h-8 text-sm" />
                      </div>
                      <div className="col-span-5">
                        <Input value={entry.notes || ''} onChange={e => {
                          const logs = [...(formData[`day${day}_log`] || [{},{},{},{}])];
                          logs[row] = { ...logs[row], notes: e.target.value };
                          handleChange(`day${day}_log`, logs);
                        }} className="bg-white border-nnc-sage/30 h-8 text-sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* Clinic Use Only */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Clinic Use Only</h2>
            <p className="text-sm text-nnc-charcoal/60 mt-1">(For practitioner completion)</p>
          </div>
          <div className="bg-white/40 p-6 rounded-2xl border border-dashed border-nnc-sage/40 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-nnc-charcoal/70">Date received</Label>
                <Input value={formData.clinicDateReceived || ''} onChange={e => handleChange("clinicDateReceived", e.target.value)} className="bg-white/50 border-nnc-sage/30 h-9" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-nnc-charcoal/70">Practitioner notes</Label>
                <Textarea value={formData.clinicPractitionerNotes || ''} onChange={e => handleChange("clinicPractitionerNotes", e.target.value)} className="bg-white/50 border-nnc-sage/30 min-h-[80px]" />
              </div>
            </div>
          </div>
        </section>

        {/* Integrative & Functional Assessment Tools */}
        <section className="space-y-6">
          <div className="border-b border-nnc-sage/20 pb-2 mb-6">
            <h2 className="font-serif text-2xl text-nnc-olive">Integrative & Functional Assessment Tools (Practitioner Use)</h2>
            <p className="text-sm text-nnc-charcoal/60 mt-1">(For practitioner completion)</p>
          </div>
          <div className="bg-white/40 p-6 rounded-2xl border border-dashed border-nnc-sage/40 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "HTMA recommended",
                "LBCA recommended",
                "Zinzino BalanceTest recommended",
                "Bach Flower assessment recommended",
                "Schussler Tissue Salts recommended",
                "Functional bloodwork referral"
              ].map(item => {
                const key = `clinic_${item.replace(/[^a-z0-9]/gi, '')}`;
                return (
                  <div key={item} className="flex items-center gap-2">
                    <Checkbox id={key} checked={formData[key] || false} onCheckedChange={(c) => handleChange(key, !!c)} />
                    <Label htmlFor={key} className="text-nnc-charcoal/70 cursor-pointer">{item}</Label>
                  </div>
                );
              })}
            </div>
            <div className="space-y-2">
              <Label className="text-nnc-charcoal/70">Additional assessment notes</Label>
              <Textarea value={formData.clinicAssessmentNotes || ''} onChange={e => handleChange("clinicAssessmentNotes", e.target.value)} className="bg-white/50 border-nnc-sage/30 min-h-[80px]" />
            </div>
          </div>
        </section>

      </div>

      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-nnc-sage/20 sticky bottom-4 z-10">
        <span className="text-sm text-nnc-charcoal/50">Your progress is autosaved</span>
        <Button onClick={handleNext} className="bg-nnc-olive hover:bg-nnc-charcoal text-white rounded-full px-8 shadow-nnc-soft">
          Continue to Consent <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function ScreenConsent({ onNavigate, formData, updateData }: { onNavigate: (s: any) => void, formData: any, updateData: (d: any) => void }) {
  
  const handleNext = () => {
    if (!formData.tier) {
      toast.error("Please select a Service Tier");
      return;
    }
    if (!formData.agreed || !formData.signature) {
      toast.error("Please sign and agree to the policies");
      return;
    }
    onNavigate("booking");
  };

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-4xl py-8 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => onNavigate("intake")}><ArrowLeft className="w-5 h-5 text-nnc-olive" /></Button>
        <div>
          <h1 className="font-serif text-3xl text-nnc-charcoal">Consent & Tier Selection</h1>
          <p className="text-nnc-charcoal/60 text-sm">Step 2 of 3</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-nnc-sage/20">
            <h2 className="font-serif text-2xl text-nnc-olive mb-6">Service Tier Selection</h2>
            
            <RadioGroup 
              value={formData.tier || ""} 
              onValueChange={(v) => updateData({ tier: v })}
              className="space-y-4"
            >
              <div className={`border-2 rounded-2xl p-5 transition-all cursor-pointer ${formData.tier === 'tier1' ? 'border-nnc-olive bg-nnc-olive/5' : 'border-nnc-sage/20 hover:border-nnc-sage'}`}>
                <div className="flex gap-4">
                  <RadioGroupItem value="tier1" id="t1" className="mt-1" />
                  <div>
                    <Label htmlFor="t1" className="font-serif text-xl cursor-pointer">Tier 1: Basic Consultation</Label>
                    <div className="text-nnc-olive font-medium mt-1 mb-2">60 minutes • $250 + HST</div>
                    <p className="text-sm text-nnc-charcoal/70 leading-relaxed">Focuses on a single modality (Holistic Nutrition, Homeopathy, or Brain Health Coaching). Includes one deep-dive session and a targeted wellness plan.</p>
                  </div>
                </div>
              </div>

              <div className={`border-2 rounded-2xl p-5 transition-all cursor-pointer relative overflow-hidden ${formData.tier === 'tier2' ? 'border-nnc-olive bg-nnc-olive/5' : 'border-nnc-sage/20 hover:border-nnc-sage'}`}>
                <div className="absolute top-0 right-0 bg-nnc-blush px-3 py-1 text-xs font-bold uppercase rounded-bl-lg">Recommended</div>
                <div className="flex gap-4">
                  <RadioGroupItem value="tier2" id="t2" className="mt-1" />
                  <div>
                    <Label htmlFor="t2" className="font-serif text-xl cursor-pointer">Tier 2: Comprehensive Protocol</Label>
                    <div className="text-nnc-olive font-medium mt-1 mb-2">90 minutes • $350 + HST</div>
                    <p className="text-sm text-nnc-charcoal/70 leading-relaxed">A multi-dimensional approach integrating all relevant clinic modalities into one cohesive protocol addressing biochemical and neurological aspects.</p>
                  </div>
                </div>
              </div>

              <div className={`border-2 rounded-2xl p-5 transition-all cursor-pointer ${formData.tier === 'tier3' ? 'border-nnc-olive bg-nnc-olive/5' : 'border-nnc-sage/20 hover:border-nnc-sage'}`}>
                <div className="flex gap-4">
                  <RadioGroupItem value="tier3" id="t3" className="mt-1" />
                  <div>
                    <Label htmlFor="t3" className="font-serif text-xl cursor-pointer">Tier 3: Comprehensive Plus</Label>
                    <div className="text-nnc-olive font-medium mt-1 mb-2">Weekly Coaching • $450 + HST</div>
                    <p className="text-sm text-nnc-charcoal/70 leading-relaxed">Includes the full Integrated Protocol plus high-accountability support featuring two 15-minute weekly coaching check-ins.</p>
                  </div>
                </div>
              </div>
            </RadioGroup>

            <div className="mt-8 border-t border-nnc-sage/20 pt-6">
              <h3 className="font-serif text-lg text-nnc-olive mb-4">Additional Fees</h3>
              <ul className="space-y-2 text-sm text-nnc-charcoal/70 mb-4">
                <li><strong>Live Blood Cell Analysis follow-up:</strong> $150 + HST</li>
                <li><strong>Bach Flower remedy refills:</strong> $35 + HST</li>
                <li><strong>HTMA retest package:</strong> $295 + HST</li>
              </ul>
              <p className="text-xs text-nnc-charcoal/50 italic">All prices are in Canadian dollars and subject to Ontario HST.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-nnc-sage/20">
            <h2 className="font-serif text-2xl text-nnc-olive mb-6">Consent & Scope of Practice</h2>
            
            <div className="prose prose-sm text-nnc-charcoal/70 mb-8 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
              <p>I acknowledge that I am seeking the services of Shirin Akhavi, an Integrative Holistic Practitioner and founder of Neuro Nutri Clinic.</p>
              <p>I understand that Shirin Akhavi utilizes a diverse clinical expertise—including Holistic Nutrition, Homeopathy, Live Blood Cell Analysis, Hair Mineral Analysis, Bach Flowers, Cell Salts and Brain Health Coaching—to support my wellness journey. I recognize that her approach is highly personalized; depending on my specific needs and the service tier I have selected, she will apply one or a combination of these integrative modalities as deemed suitable to address my biochemical, energetic, and neurological health.</p>
              <p>I am choosing to engage in this collaborative process to support my overall well-being and understand that these services are integrative and supportive in nature and do not replace medical diagnosis, psychiatric care, or emergency treatment.</p>
              
              <h4 className="font-bold text-nnc-charcoal mt-4 mb-2">I acknowledge that:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>I am responsible for my own healthcare decisions.</li>
                <li>I have disclosed all relevant medical, neurological, psychiatric, and medication information.</li>
                <li>My information will be kept confidential in accordance with Ontario privacy legislation (PHIPA), except where disclosure is required by law.</li>
              </ul>

              <h4 className="font-bold text-nnc-charcoal mt-4 mb-2">Financial Acknowledgment</h4>
              <p><strong>Payment:</strong> I understand that payment is due in full to secure my appointment or upon receipt of the invoice.</p>
              <p><strong>Grace Period:</strong> I acknowledge there is a 15-minute grace period for deep-dive sessions and a 5-minute grace period for coaching check-ins. Arrivals beyond this window will result in a forfeited session and a 100% cancellation fee.</p>
              <p><strong>Cancellation:</strong> I agree to provide at least 24 hours' notice for cancellations or rescheduling. Failure to do so will result in being charged the full session fee.</p>
              <p><strong>Nature of Service:</strong> I understand that these services are integrative and supportive. They are intended to work alongside my primary medical care and do not replace the advice of a licensed medical doctor.</p>
            </div>

            <div className="bg-nnc-cream p-6 rounded-2xl space-y-6">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="agree" 
                  checked={formData.agreed || false}
                  onCheckedChange={(c) => updateData({ agreed: !!c })}
                  className="mt-1"
                />
                <Label htmlFor="agree" className="font-medium text-sm leading-relaxed cursor-pointer">
                  I have read and agree to the Consent, Scope of Practice, Privacy Acknowledgement, and Financial policies above.
                </Label>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-nnc-charcoal/70 italic mb-2">Your information is transmitted securely and reviewed only by Neuro Nutri Clinic staff.</p>
                <Label>Type your full legal name to sign</Label>
                <Input 
                  value={formData.signature || ''} 
                  onChange={e => updateData({ signature: e.target.value })}
                  placeholder="John Doe"
                  className="bg-white border-nnc-sage/30 rounded-xl text-lg"
                />
              </div>

              {formData.signature && (
                <div className="p-4 bg-white/50 rounded-xl border border-nnc-sage/20 border-dashed flex items-center justify-between">
                  <div>
                    <span className="text-xs text-nnc-charcoal/50 uppercase tracking-widest block mb-1">Digital Signature</span>
                    <span className="font-script text-3xl text-nnc-olive">{formData.signature}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-nnc-charcoal/50 uppercase tracking-widest block mb-1">Date</span>
                    <span className="font-mono text-sm">{format(new Date(), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
        
        <div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-nnc-sage/20 sticky top-28">
            <h3 className="font-serif text-xl text-nnc-charcoal mb-4 pb-4 border-b border-nnc-sage/20">Summary</h3>
            <div className="space-y-4 text-sm text-nnc-charcoal/70 mb-8">
              <div className="flex justify-between items-center">
                <span>Intake Form</span>
                <CheckCircle2 className="w-4 h-4 text-nnc-sage" />
              </div>
              <div className="flex justify-between items-center">
                <span>Tier Selection</span>
                {formData.tier ? <span className="font-medium text-nnc-olive">{formData.tier.replace('tier', 'Tier ')}</span> : <span className="text-nnc-charcoal/30">Pending</span>}
              </div>
              <div className="flex justify-between items-center">
                <span>Consent</span>
                {formData.agreed && formData.signature ? <CheckCircle2 className="w-4 h-4 text-nnc-sage" /> : <span className="text-nnc-charcoal/30">Pending</span>}
              </div>
            </div>
            
            <Button 
              onClick={handleNext} 
              className="w-full bg-nnc-olive hover:bg-nnc-charcoal text-white rounded-full shadow-nnc-soft"
              disabled={!formData.tier || !formData.agreed || !formData.signature}
            >
              Continue to Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenBooking({ onNavigate, formData, updateData, onSubmit }: { onNavigate: (s: any) => void, formData: any, updateData: (d: any) => void, onSubmit: () => Promise<any> }) {
  const [submitting, setSubmitting] = useState(false);

  const handleNext = async () => {
    if (!formData.date || !formData.time) {
      toast.error("Please select a date and time");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit();
      onNavigate("confirmation");
    } catch (e: any) {
      toast.error(e?.message || "Could not submit your enrollment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const timeSlots = ["9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"];

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-4xl py-8 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => onNavigate("consent")}><ArrowLeft className="w-5 h-5 text-nnc-olive" /></Button>
        <div>
          <h1 className="font-serif text-3xl text-nnc-charcoal">Book Consultation</h1>
          <p className="text-nnc-charcoal/60 text-sm">Step 3 of 3</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-nnc-sage/20 flex flex-col items-center">
          <h2 className="font-serif text-xl text-nnc-olive mb-6 self-start w-full border-b border-nnc-sage/20 pb-4">Select Date</h2>
          <Calendar
            mode="single"
            selected={formData.date ? new Date(formData.date + "T00:00:00") : undefined}
            onSelect={(d) => {
              if (d) {
                updateData({ date: format(d, "yyyy-MM-dd") });
              }
            }}
            disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
            className="rounded-xl border border-nnc-sage/10 p-4"
          />
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-nnc-sage/20">
          <h2 className="font-serif text-xl text-nnc-olive mb-6 border-b border-nnc-sage/20 pb-4">Select Time</h2>
          
          {!formData.date ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-nnc-charcoal/40 text-center p-6">
              <CalendarDays className="w-12 h-12 mb-4 opacity-20" />
              <p>Please select a date from the calendar first to see available times.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-nnc-charcoal mb-4">
                Available slots for {format(new Date(formData.date + "T00:00:00"), 'EEEE, MMMM do')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map(time => (
                  <Button
                    key={time}
                    variant={formData.time === time ? "default" : "outline"}
                    onClick={() => updateData({ time })}
                    className={`rounded-xl py-6 ${formData.time === time ? 'bg-nnc-olive text-white' : 'border-nnc-sage/30 text-nnc-charcoal hover:border-nnc-olive hover:bg-nnc-olive/5'}`}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleNext} 
          size="lg"
          disabled={!formData.date || !formData.time || submitting}
          className="bg-nnc-olive hover:bg-nnc-charcoal text-white rounded-full px-12 shadow-nnc-soft"
        >
          {submitting ? "Submitting…" : "Confirm Appointment"}
        </Button>
      </div>
    </div>
  );
}

function ScreenConfirmation({ onNavigate, formData, currentUser, setCurrentUser, lastEnrollment }: { onNavigate: (s: any) => void, formData: any, currentUser: AuthUser, setCurrentUser: (u: AuthUser) => void, lastEnrollment: { id: number; claimToken: string | null } | null }) {
  const [showSignup, setShowSignup] = useState(false);
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const patientEmail = formData.intake?.email || "";
  const patientName = formData.intake?.fullName || "";

  // Clean up draft on mount — the enrollment has already been persisted server-side
  useEffect(() => {
    localStorage.removeItem("nnc-draft");
  }, []);

  const handleCreateAccount = async () => {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setCreating(true);
    try {
      const payload: any = { email: patientEmail, password, name: patientName };
      if (lastEnrollment?.id && lastEnrollment?.claimToken) {
        payload.claimEnrollmentId = lastEnrollment.id;
        payload.claimToken = lastEnrollment.claimToken;
      }
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create account");
      setCurrentUser(data.user);
      toast.success("Account created — your enrollment is linked");
      onNavigate("dashboard");
    } catch (e: any) {
      toast.error(e?.message || "Could not create account");
    } finally {
      setCreating(false);
    }
  };

  const dateObj = formData.booking?.date ? new Date(formData.booking.date + "T00:00:00") : new Date();
  
  return (
    <div className="container mx-auto px-4 md:px-8 max-w-2xl py-16 animate-in zoom-in-95 duration-500 text-center">
      <div className="w-24 h-24 bg-nnc-sage/20 rounded-full flex items-center justify-center mx-auto mb-8 text-nnc-olive">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      
      <h1 className="font-serif text-4xl md:text-5xl text-nnc-charcoal mb-4">You're Enrolled</h1>
      <p className="text-lg text-nnc-charcoal/70 mb-12">Your enrollment has been recorded for our team to review.</p>

      <Card className="bg-white border-nnc-sage/20 shadow-nnc-soft mb-12 text-left overflow-hidden">
        <div className="bg-nnc-cream border-b border-nnc-sage/20 px-8 py-4">
          <h3 className="font-serif text-xl text-nnc-olive">Appointment Summary</h3>
        </div>
        <CardContent className="p-8">
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <div className="text-xs uppercase tracking-widest text-nnc-charcoal/50 mb-1">Patient</div>
              <div className="font-medium text-lg text-nnc-charcoal">{formData.intake?.fullName || 'Guest'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-nnc-charcoal/50 mb-1">Service</div>
              <div className="font-medium text-lg text-nnc-charcoal">{formData.consent?.tier === 'tier2' ? 'Tier 2: Comprehensive' : formData.consent?.tier === 'tier3' ? 'Tier 3: Plus' : 'Tier 1: Basic'}</div>
            </div>
            <div className="sm:col-span-2 bg-nnc-ivory p-4 rounded-xl border border-nnc-sage/10 flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-nnc-sage/20 text-center min-w-[80px]">
                <div className="text-xs font-bold text-nnc-rose uppercase">{format(dateObj, 'MMM')}</div>
                <div className="text-2xl font-serif text-nnc-charcoal leading-none my-1">{format(dateObj, 'dd')}</div>
              </div>
              <div>
                <div className="font-medium text-nnc-charcoal">{format(dateObj, 'EEEE')} at {formData.booking?.time || '9:00 AM'}</div>
                <div className="text-sm text-nnc-charcoal/60 mt-1">Please arrive 10 minutes early. Remember the 15-minute grace period policy.</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!currentUser && patientEmail && (
        <Card className="bg-nnc-sage/10 border-nnc-sage/30 shadow-nnc-soft mb-8 text-left">
          <CardContent className="p-6 md:p-8">
            {!showSignup ? (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
                <div>
                  <h3 className="font-serif text-xl text-nnc-olive mb-1">Create an account</h3>
                  <p className="text-sm text-nnc-charcoal/70">Track your appointment, reschedule, or update your intake any time.</p>
                </div>
                <Button onClick={() => setShowSignup(true)} className="bg-nnc-olive hover:bg-nnc-charcoal text-white rounded-full px-6 shrink-0">
                  Create account
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-serif text-xl text-nnc-olive">Create your account</h3>
                <p className="text-sm text-nnc-charcoal/70">Email: <strong>{patientEmail}</strong></p>
                <Label htmlFor="signup-pw">Choose a password (min 8 characters)</Label>
                <Input id="signup-pw" type="password" value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl" />
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleCreateAccount} disabled={creating} className="bg-nnc-olive hover:bg-nnc-charcoal text-white rounded-full">
                    {creating ? "Creating…" : "Create account"}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowSignup(false)} className="rounded-full">Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {currentUser && (
          <Button onClick={() => onNavigate("dashboard")} className="bg-nnc-olive hover:bg-nnc-charcoal text-white rounded-full px-8">
            Go to Dashboard
          </Button>
        )}
        <Button 
          onClick={() => onNavigate("home")} 
          variant="outline"
          className="border-nnc-sage/30 text-nnc-olive hover:bg-nnc-sage/10 rounded-full px-8"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
}

// ---------- AUTH SCREENS ----------

function ScreenLogin({ onNavigate, setCurrentUser }: { onNavigate: (s: any) => void, setCurrentUser: (u: AuthUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign in failed");
      setCurrentUser(data.user);
      toast.success(`Welcome back, ${data.user.name || data.user.email}`);
      onNavigate(data.user.isAdmin ? "admin" : "dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-md py-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-nnc-soft border border-nnc-sage/20">
        <h1 className="font-serif text-3xl text-nnc-charcoal mb-2">Sign in</h1>
        <p className="text-sm text-nnc-charcoal/60 mb-8">Access your appointments and intake details.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input id="login-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl" />
          </div>
          <Button type="submit" disabled={submitting} className="bg-nnc-olive hover:bg-nnc-charcoal text-white rounded-full w-full py-6">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="text-sm text-nnc-charcoal/60 mt-6 text-center">
          New here?{" "}
          <button onClick={() => onNavigate("signup")} className="text-nnc-olive hover:text-nnc-charcoal font-medium underline-offset-2 hover:underline">
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}

function ScreenSignup({ onNavigate, setCurrentUser }: { onNavigate: (s: any) => void, setCurrentUser: (u: AuthUser) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create account");
      setCurrentUser(data.user);
      toast.success("Welcome to Neuro Nutri Clinic");
      onNavigate("dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Could not create account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-md py-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-nnc-soft border border-nnc-sage/20">
        <h1 className="font-serif text-3xl text-nnc-charcoal mb-2">Create account</h1>
        <p className="text-sm text-nnc-charcoal/60 mb-8">For patients to track appointments and update intake details.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full name</Label>
            <Input id="signup-name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input id="signup-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-pw">Password (min 8 characters)</Label>
            <Input id="signup-pw" type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl" />
          </div>
          <Button type="submit" disabled={submitting} className="bg-nnc-olive hover:bg-nnc-charcoal text-white rounded-full w-full py-6">
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="text-sm text-nnc-charcoal/60 mt-6 text-center">
          Already have an account?{" "}
          <button onClick={() => onNavigate("login")} className="text-nnc-olive hover:text-nnc-charcoal font-medium underline-offset-2 hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

// ---------- DASHBOARD ----------

type Enrollment = {
  id: number;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  tier: string;
  appointment_date: string;
  appointment_time: string;
  intake_data: Record<string, any>;
  consent_data: Record<string, any>;
  booking_data: Record<string, any>;
  created_at: string;
  user_id?: number | null;
};

function tierLabel(tier: string) {
  if (tier === "tier2") return "Tier 2: Comprehensive";
  if (tier === "tier3") return "Tier 3: Plus";
  if (tier === "tier1") return "Tier 1: Basic";
  return tier || "—";
}

function isFuture(dateStr: string) {
  if (!dateStr) return false;
  return new Date(dateStr + "T00:00:00") >= new Date(new Date().toDateString());
}

function ScreenDashboard({ onNavigate, currentUser, authLoaded }: { onNavigate: (s: any) => void, currentUser: AuthUser, authLoaded: boolean }) {
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState<Enrollment | null>(null);
  const [editingIntake, setEditingIntake] = useState<Enrollment | null>(null);

  const reload = () => {
    setEnrollments(null);
    fetch("/api/my/enrollments", { credentials: "include" })
      .then(async r => {
        if (r.status === 401) throw new Error("Please sign in");
        if (!r.ok) throw new Error((await r.json()).error || "Failed to load");
        return r.json();
      })
      .then(d => setEnrollments(d.enrollments))
      .catch(e => setError(e.message));
  };

  useEffect(() => {
    if (!authLoaded) return;
    if (!currentUser) {
      onNavigate("login");
      return;
    }
    reload();
  }, [authLoaded, currentUser?.id]);

  if (!authLoaded || !currentUser) {
    return <div className="container mx-auto px-4 md:px-8 max-w-3xl py-16 text-center text-nnc-charcoal/50">Loading…</div>;
  }

  const upcoming = enrollments?.find(e => isFuture(e.appointment_date));

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-4xl py-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-nnc-charcoal">Welcome, {currentUser.name || currentUser.email}</h1>
        <p className="text-nnc-charcoal/60">Your appointments and intake details.</p>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200 mb-8"><CardContent className="p-4 text-sm text-red-800">{error}</CardContent></Card>
      )}

      {enrollments === null && !error && (
        <div className="text-nnc-charcoal/50 text-center py-12">Loading…</div>
      )}

      {enrollments && enrollments.length === 0 && (
        <Card className="bg-white border-nnc-sage/20 shadow-nnc-soft">
          <CardContent className="p-10 text-center">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 text-nnc-sage" />
            <h3 className="font-serif text-2xl text-nnc-charcoal mb-2">No appointments yet</h3>
            <p className="text-nnc-charcoal/60 mb-6">Book your first consultation to get started.</p>
            <Button onClick={() => onNavigate("enroll")} className="bg-nnc-olive hover:bg-nnc-charcoal text-white rounded-full px-8">Book Consultation</Button>
          </CardContent>
        </Card>
      )}

      {upcoming && (
        <Card className="bg-white border-nnc-sage/30 shadow-nnc-soft mb-8 overflow-hidden">
          <div className="bg-nnc-olive text-white px-6 py-4">
            <div className="text-xs uppercase tracking-widest opacity-80">Next appointment</div>
            <div className="font-serif text-2xl mt-1">{format(new Date(upcoming.appointment_date + "T00:00:00"), "EEEE, MMMM do, yyyy")}</div>
            <div className="text-sm opacity-90">{upcoming.appointment_time} • {tierLabel(upcoming.tier)}</div>
          </div>
          <CardContent className="p-6 flex flex-wrap gap-2">
            <Button onClick={() => setRescheduling(upcoming)} variant="outline" className="border-nnc-sage/30 text-nnc-olive hover:bg-nnc-sage/10 rounded-full">
              <CalendarDays className="w-4 h-4 mr-2" /> Reschedule
            </Button>
            <Button onClick={() => setEditingIntake(upcoming)} variant="outline" className="border-nnc-sage/30 text-nnc-olive hover:bg-nnc-sage/10 rounded-full">
              <Edit3 className="w-4 h-4 mr-2" /> Edit intake
            </Button>
          </CardContent>
        </Card>
      )}

      {enrollments && enrollments.length > 0 && (
        <div>
          <h2 className="font-serif text-2xl text-nnc-charcoal mb-4">All enrollments</h2>
          <div className="space-y-3">
            {enrollments.map(e => (
              <EnrollmentRow key={e.id} enrollment={e} onReschedule={() => setRescheduling(e)} onEditIntake={() => setEditingIntake(e)} />
            ))}
          </div>
        </div>
      )}

      <RescheduleDialog
        enrollment={rescheduling}
        onClose={() => setRescheduling(null)}
        onSaved={() => { setRescheduling(null); reload(); }}
      />
      <EditIntakeDialog
        enrollment={editingIntake}
        onClose={() => setEditingIntake(null)}
        onSaved={() => { setEditingIntake(null); reload(); }}
      />
    </div>
  );
}

function EnrollmentRow({ enrollment, onReschedule, onEditIntake }: { enrollment: Enrollment, onReschedule: () => void, onEditIntake: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const dateObj = enrollment.appointment_date ? new Date(enrollment.appointment_date + "T00:00:00") : null;
  const future = isFuture(enrollment.appointment_date);

  return (
    <Card className="bg-white border-nnc-sage/20 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-nnc-cream/50 transition-colors">
          <div className="flex items-center gap-4">
            {dateObj && (
              <div className="bg-nnc-cream rounded-lg px-3 py-2 text-center min-w-[60px]">
                <div className="text-xs font-bold text-nnc-rose uppercase">{format(dateObj, 'MMM')}</div>
                <div className="text-xl font-serif text-nnc-charcoal leading-none mt-0.5">{format(dateObj, 'dd')}</div>
              </div>
            )}
            <div>
              <div className="font-medium text-nnc-charcoal">{enrollment.appointment_time} • {tierLabel(enrollment.tier)}</div>
              <div className="text-xs text-nnc-charcoal/50">Submitted {format(new Date(enrollment.created_at), 'MMM d, yyyy')}{future ? "" : " • past"}</div>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-nnc-charcoal/40" /> : <ChevronDown className="w-5 h-5 text-nnc-charcoal/40" />}
        </button>
        {expanded && (
          <div className="border-t border-nnc-sage/10 p-5 space-y-4 bg-nnc-cream/20">
            <DetailBlock title="Booking" obj={enrollment.booking_data} />
            <DetailBlock title="Intake" obj={enrollment.intake_data} />
            <DetailBlock title="Consent" obj={enrollment.consent_data} />
            {future && (
              <div className="flex gap-2 pt-2">
                <Button onClick={onReschedule} variant="outline" size="sm" className="border-nnc-sage/30 text-nnc-olive hover:bg-nnc-sage/10 rounded-full">
                  <CalendarDays className="w-4 h-4 mr-2" /> Reschedule
                </Button>
                <Button onClick={onEditIntake} variant="outline" size="sm" className="border-nnc-sage/30 text-nnc-olive hover:bg-nnc-sage/10 rounded-full">
                  <Edit3 className="w-4 h-4 mr-2" /> Edit intake
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatLabel(k: string) {
  return k.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
}

function DetailBlock({ title, obj }: { title: string, obj: Record<string, any> }) {
  const entries = Object.entries(obj || {}).filter(([, v]) => v !== "" && v !== null && v !== undefined);
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-widest text-nnc-olive mb-2">{title}</h4>
      {entries.length === 0 ? (
        <p className="text-sm text-nnc-charcoal/40 italic">No data</p>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-x-4 gap-y-1 text-sm">
          {entries.map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="text-nnc-charcoal/60">{formatLabel(k)}</dt>
              <dd className="text-nnc-charcoal break-words">{
                typeof v === 'boolean' ? (v ? 'Yes' : 'No') :
                Array.isArray(v) ? (v.length === 0 ? '—' : v.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(', ')) :
                typeof v === 'object' ? JSON.stringify(v) :
                String(v)
              }</dd>
            </React.Fragment>
          ))}
        </dl>
      )}
    </div>
  );
}

function RescheduleDialog({ enrollment, onClose, onSaved }: { enrollment: Enrollment | null, onClose: () => void, onSaved: () => void }) {
  const [date, setDate] = useState<string | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const timeSlots = ["9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"];

  useEffect(() => {
    if (enrollment) {
      setDate(enrollment.appointment_date);
      setTime(enrollment.appointment_time);
    }
  }, [enrollment?.id]);

  if (!enrollment) return null;

  const save = async () => {
    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/my/enrollments/${enrollment.id}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date, time }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not reschedule");
      toast.success("Appointment updated");
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Could not reschedule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!enrollment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-nnc-charcoal">Reschedule appointment</DialogTitle>
          <DialogDescription>Pick a new date and time. We'll notify the clinic.</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-2">
          <div>
            <Label className="mb-2 block">Date</Label>
            <Calendar
              mode="single"
              selected={date ? new Date(date + "T00:00:00") : undefined}
              onSelect={(d) => { if (d) setDate(format(d, "yyyy-MM-dd")); }}
              disabled={(d) => d < new Date(new Date().toDateString()) || d.getDay() === 0 || d.getDay() === 6}
              className="rounded-xl border border-nnc-sage/20 p-3"
            />
          </div>
          <div>
            <Label className="mb-2 block">Time</Label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map(t => (
                <Button key={t} variant={time === t ? "default" : "outline"} onClick={() => setTime(t)} className={`rounded-xl ${time === t ? 'bg-nnc-olive text-white' : 'border-nnc-sage/30 text-nnc-charcoal hover:border-nnc-olive'}`}>
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-nnc-olive hover:bg-nnc-charcoal text-white">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const INTAKE_FIELDS: { key: string; label: string; type: "text" | "textarea" }[] = [
  { key: "fullName", label: "Full name", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "reasonForSeeking", label: "Reason for seeking care", type: "textarea" },
  { key: "goals", label: "Health goals", type: "textarea" },
  { key: "currentMedications", label: "Current medications", type: "textarea" },
  { key: "supplements", label: "Supplements", type: "textarea" },
  { key: "allergies", label: "Allergies", type: "textarea" },
  { key: "diet", label: "Current diet", type: "textarea" },
  { key: "sleep", label: "Sleep notes", type: "textarea" },
];

function EditIntakeDialog({ enrollment, onClose, onSaved }: { enrollment: Enrollment | null, onClose: () => void, onSaved: () => void }) {
  const [intake, setIntake] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (enrollment) setIntake({ ...enrollment.intake_data });
  }, [enrollment?.id]);

  if (!enrollment) return null;

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/my/enrollments/${enrollment.id}/intake`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ intake }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      toast.success("Intake updated");
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  // Show known fields first, then any extras the patient previously filled
  const extras = Object.keys(intake).filter(k => !INTAKE_FIELDS.find(f => f.key === k));

  return (
    <Dialog open={!!enrollment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-nnc-charcoal">Edit intake</DialogTitle>
          <DialogDescription>Update the information you shared. Changes are saved to your file.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {INTAKE_FIELDS.map(f => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={`intake-${f.key}`}>{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea id={`intake-${f.key}`} rows={3} value={String(intake[f.key] ?? "")} onChange={e => setIntake({ ...intake, [f.key]: e.target.value })} className="rounded-xl" />
              ) : (
                <Input id={`intake-${f.key}`} value={String(intake[f.key] ?? "")} onChange={e => setIntake({ ...intake, [f.key]: e.target.value })} className="rounded-xl" />
              )}
            </div>
          ))}
          {extras.length > 0 && (
            <details className="pt-2">
              <summary className="text-sm text-nnc-charcoal/60 cursor-pointer">Additional fields ({extras.length})</summary>
              <div className="space-y-3 pt-3">
                {extras.map(k => {
                  const v = intake[k];
                  const stringy = typeof v === "string" || typeof v === "number";
                  return (
                    <div key={k} className="space-y-1.5">
                      <Label htmlFor={`extra-${k}`}>{formatLabel(k)}</Label>
                      {stringy ? (
                        <Input id={`extra-${k}`} value={String(v ?? "")} onChange={e => setIntake({ ...intake, [k]: e.target.value })} className="rounded-xl" />
                      ) : (
                        <p className="text-xs text-nnc-charcoal/50 italic">Complex value — not editable here ({JSON.stringify(v).slice(0, 60)}…)</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-nnc-olive hover:bg-nnc-charcoal text-white">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- ADMIN ----------

function ScreenAdmin({ onNavigate, currentUser, authLoaded }: { onNavigate: (s: any) => void, currentUser: AuthUser, authLoaded: boolean }) {
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!authLoaded) return;
    if (!currentUser) { onNavigate("login"); return; }
    if (!currentUser.isAdmin) { onNavigate("home"); return; }
    fetch("/api/admin/enrollments", { credentials: "include" })
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed to load");
        return r.json();
      })
      .then(d => setEnrollments(d.enrollments))
      .catch(e => setError(e.message));
  }, [authLoaded, currentUser?.id]);

  if (!authLoaded || !currentUser || !currentUser.isAdmin) {
    return <div className="container mx-auto px-4 md:px-8 max-w-3xl py-16 text-center text-nnc-charcoal/50">Loading…</div>;
  }

  const filtered = (enrollments ?? []).filter(e => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (e.patient_name || "").toLowerCase().includes(q) ||
      (e.patient_email || "").toLowerCase().includes(q) ||
      (e.patient_phone || "").toLowerCase().includes(q) ||
      (e.appointment_date || "").includes(q)
    );
  });

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-6xl py-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <Badge className="bg-nnc-rose/15 text-nnc-rose hover:bg-nnc-rose/25 mb-2 border-none">Admin</Badge>
          <h1 className="font-serif text-4xl text-nnc-charcoal">All Enrollments</h1>
          <p className="text-nnc-charcoal/60">{enrollments?.length ?? 0} total · showing {filtered.length}</p>
        </div>
        <div className="w-full md:w-80">
          <Input placeholder="Search name, email, phone, date" value={query} onChange={e => setQuery(e.target.value)} className="rounded-full" />
        </div>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200 mb-8"><CardContent className="p-4 text-sm text-red-800">{error}</CardContent></Card>
      )}

      {enrollments === null && !error && (
        <div className="text-nnc-charcoal/50 text-center py-12">Loading…</div>
      )}

      {enrollments && enrollments.length === 0 && (
        <Card className="bg-white border-nnc-sage/20"><CardContent className="p-10 text-center text-nnc-charcoal/60">No enrollments yet.</CardContent></Card>
      )}

      {filtered.length > 0 && (
        <div className="bg-white border border-nnc-sage/20 rounded-2xl overflow-hidden shadow-nnc-soft">
          <div className="hidden md:grid grid-cols-[1.5fr_1.5fr_1fr_1fr_120px_40px] gap-4 px-5 py-3 border-b border-nnc-sage/20 bg-nnc-cream text-xs uppercase tracking-widest text-nnc-charcoal/60 font-medium">
            <div>Patient</div><div>Email</div><div>Date</div><div>Time</div><div>Tier</div><div></div>
          </div>
          {filtered.map(e => {
            const open = expandedId === e.id;
            const dateObj = e.appointment_date ? new Date(e.appointment_date + "T00:00:00") : null;
            return (
              <div key={e.id} className="border-b border-nnc-sage/10 last:border-0">
                <button onClick={() => setExpandedId(open ? null : e.id)} className="w-full grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_1fr_1fr_120px_40px] gap-2 md:gap-4 px-5 py-4 text-left hover:bg-nnc-cream/40 transition-colors text-sm">
                  <div className="font-medium text-nnc-charcoal">{e.patient_name || <em className="text-nnc-charcoal/40">unnamed</em>}</div>
                  <div className="text-nnc-charcoal/70 truncate">{e.patient_email || '—'}</div>
                  <div className="text-nnc-charcoal/70">{dateObj ? format(dateObj, 'MMM d, yyyy') : '—'}</div>
                  <div className="text-nnc-charcoal/70">{e.appointment_time || '—'}</div>
                  <div><Badge variant="outline" className="border-nnc-sage/30 text-nnc-olive">{tierLabel(e.tier)}</Badge></div>
                  <div className="flex justify-end">{open ? <ChevronUp className="w-4 h-4 text-nnc-charcoal/40" /> : <ChevronDown className="w-4 h-4 text-nnc-charcoal/40" />}</div>
                </button>
                {open && (
                  <div className="px-5 pb-5 pt-1 bg-nnc-cream/30 space-y-4">
                    <div className="grid sm:grid-cols-3 gap-3 text-sm">
                      <div><span className="text-nnc-charcoal/50">Phone:</span> {e.patient_phone || '—'}</div>
                      <div><span className="text-nnc-charcoal/50">Submitted:</span> {format(new Date(e.created_at), 'MMM d, yyyy h:mm a')}</div>
                      <div><span className="text-nnc-charcoal/50">Account:</span> {e.user_id ? <Badge variant="outline" className="border-nnc-sage/30 text-nnc-olive">linked</Badge> : <span className="text-nnc-charcoal/40">anonymous</span>}</div>
                    </div>
                    <DetailBlock title="Booking" obj={e.booking_data} />
                    <DetailBlock title="Intake" obj={e.intake_data} />
                    <DetailBlock title="Consent" obj={e.consent_data} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
