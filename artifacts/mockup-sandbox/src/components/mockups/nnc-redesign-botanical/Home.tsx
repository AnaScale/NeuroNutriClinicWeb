import React, { useState, useEffect } from "react";
import { Brain, Microscope, ArrowRight, Leaf, HeartHandshake, ChevronDown, CheckCircle2, MapPin, Phone, Mail, Instagram } from "lucide-react";
import "./_group.css";

const nncLogoUrl = "/__mockup/images/nnc-logo.png";
const heroImage = "/__mockup/images/botanical-hero.png";
const textureImage = "/__mockup/images/botanical-texture-1.png";
const shirinImage = "/__mockup/images/botanical-shirin-placeholder.png";

// Reusable Button Component for this specific mockup
const NNCButton = ({ children, variant = "primary", className = "", ...props }: any) => {
  const base = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 px-8 py-4 shadow-sm hover:shadow-md";
  const variants: Record<string, string> = {
    primary: "bg-nnc-olive text-white hover:bg-nnc-charcoal hover:scale-[1.02]",
    secondary: "bg-nnc-sage text-white hover:bg-[#2BAA7E] hover:scale-[1.02]",
    outline: "border-2 border-nnc-olive/30 text-nnc-olive hover:border-nnc-olive hover:bg-nnc-olive/5",
    ghost: "text-nnc-charcoal/70 hover:text-nnc-olive hover:bg-nnc-blush/20 shadow-none hover:shadow-none"
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export function Home() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-nnc-ivory text-nnc-charcoal font-sans overflow-hidden selection:bg-nnc-blush selection:text-nnc-olive">
      
      {/* Navigation */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-nnc-ivory/90 backdrop-blur-xl shadow-sm py-4" : "bg-transparent py-6"}`}>
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl tracking-wide text-nnc-charcoal font-medium">Neuro Nutri Clinic</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#philosophy" className="text-sm font-medium text-nnc-charcoal/70 hover:text-nnc-olive transition-colors">Philosophy</a>
            <a href="#services" className="text-sm font-medium text-nnc-charcoal/70 hover:text-nnc-olive transition-colors">Services</a>
            <a href="#journey" className="text-sm font-medium text-nnc-charcoal/70 hover:text-nnc-olive transition-colors">Journey</a>
            <a href="#about" className="text-sm font-medium text-nnc-charcoal/70 hover:text-nnc-olive transition-colors">About</a>
            <NNCButton variant="primary" className="py-2.5 px-6">Book Consultation</NNCButton>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[95vh] flex items-center pt-24 pb-12 overflow-hidden bg-gradient-botanical">
          <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-nnc-sage/10 blur-[100px] blob-shape pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-nnc-blush/30 blur-[100px] blob-shape-2 pointer-events-none" />
          
          {/* Subtle textured overlay */}
          <div className="absolute inset-0 opacity-10 mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

          <div className="container mx-auto px-6 md:px-12 relative z-10 grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-nnc-sage/20 text-nnc-sage font-medium text-sm tracking-wide mb-8 animate-in slide-in-from-bottom-4 duration-700">
                <Leaf className="w-4 h-4" /> Integrative Holistic Health Practice
              </div>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] text-nnc-charcoal mb-6 animate-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-both">
                Where <span className="text-nnc-sage italic font-normal">Neuroscience</span> <br/>
                Meets Nutritional <span className="text-nnc-olive">Precision.</span>
              </h1>
              <p className="text-lg md:text-xl text-nnc-charcoal/70 mb-10 leading-relaxed font-sans max-w-lg animate-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
                We don't just treat symptoms; we investigate the biological "why." Discover a science-backed, sustainable roadmap to health that optimizes your mind and body at the cellular level.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
                <NNCButton className="w-full sm:w-auto group">
                  Start Your Journey <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </NNCButton>
                <NNCButton variant="outline" className="w-full sm:w-auto">
                  Explore Services
                </NNCButton>
              </div>
              
              <div className="mt-16 flex items-center gap-8 text-sm font-medium tracking-widest text-nnc-charcoal/50 uppercase animate-in fade-in duration-1000 delay-500 fill-mode-both">
                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-nnc-olive/50" /> Neuroscience</span>
                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-nnc-sage/50" /> Homeopathy</span>
                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-nnc-rose/50" /> Nutrition</span>
              </div>
            </div>
            
            <div className="relative hidden md:block h-[600px] w-full animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-both">
              <div className="absolute inset-0 bg-nnc-sage/5 blob-shape-2 overflow-hidden shadow-nnc-glow">
                 <img src={heroImage} alt="Botanical abstract" className="w-full h-full object-cover mix-blend-overlay opacity-80" />
              </div>
              {/* Floating Cards */}
              <div className="absolute top-20 -left-12 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white max-w-[240px] hover-lift">
                <Brain className="w-8 h-8 text-nnc-olive mb-3" />
                <h3 className="font-serif text-xl mb-1 text-nnc-charcoal">Brain Health</h3>
                <p className="text-xs text-nnc-charcoal/60">Optimizing cognitive function & mood stability.</p>
              </div>
              <div className="absolute bottom-20 -right-8 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white max-w-[240px] hover-lift">
                <Microscope className="w-8 h-8 text-nnc-sage mb-3" />
                <h3 className="font-serif text-xl mb-1 text-nnc-charcoal">Cellular Insight</h3>
                <p className="text-xs text-nnc-charcoal/60">Advanced diagnostics including HTMA & Live Blood.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section id="philosophy" className="py-32 relative bg-nnc-cream overflow-hidden">
          <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-nnc-sage/5 rounded-full blur-[80px]" />
          
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl mx-auto text-center mb-20">
              <span className="font-script text-3xl text-nnc-olive block mb-4">Our Philosophy</span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-nnc-charcoal leading-tight">
                Healing happens at the intersection of mind and body.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div className="relative">
                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-nnc-soft">
                  <img src={textureImage} alt="Soft botanical texture" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-8 -right-8 bg-nnc-ivory p-8 rounded-[2rem] shadow-xl max-w-sm">
                  <p className="font-serif text-xl italic text-nnc-charcoal leading-relaxed">
                    "We don't just mask your symptoms; we illuminate the root cause, giving you the clarity and biochemical support you need to fully reclaim your health."
                  </p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <div className="w-12 h-12 rounded-full bg-nnc-blush/40 flex items-center justify-center mb-6">
                    <HeartHandshake className="w-6 h-6 text-nnc-olive" />
                  </div>
                  <h3 className="font-serif text-3xl text-nnc-charcoal mb-4">Beneath the Surface</h3>
                  <p className="text-nnc-charcoal/70 leading-relaxed text-lg">
                    Whether you are navigating physical health challenges like digestive issues, blood sugar imbalances, and hormonal irregularities, or managing mental and emotional concerns such as anxiety, brain fog, and ADHD, we look beneath the surface.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-serif text-3xl text-nnc-charcoal mb-4">Advanced Diagnostics</h3>
                  <p className="text-nnc-charcoal/70 leading-relaxed text-lg mb-6">
                    To take the guesswork out of your care, we utilize advanced functional testing. These tools allow us to pinpoint exact environmental toxicities, cellular mineral deficiencies, and systemic inflammatory markers.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex gap-4 items-start bg-white p-4 rounded-2xl border border-nnc-sage/10 shadow-sm hover-lift">
                      <div className="mt-1 w-6 h-6 rounded-full bg-nnc-sage/20 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-nnc-sage" />
                      </div>
                      <div>
                        <h4 className="font-medium text-nnc-charcoal text-lg">Applied Nutritional Microscopy</h4>
                        <p className="text-sm text-nnc-charcoal/60 mt-1">Live analysis of cellular health and digestive terrain.</p>
                      </div>
                    </li>
                    <li className="flex gap-4 items-start bg-white p-4 rounded-2xl border border-nnc-sage/10 shadow-sm hover-lift">
                      <div className="mt-1 w-6 h-6 rounded-full bg-nnc-sage/20 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-nnc-sage" />
                      </div>
                      <div>
                        <h4 className="font-medium text-nnc-charcoal text-lg">Hair Tissue Mineral Analysis (HTMA)</h4>
                        <p className="text-sm text-nnc-charcoal/60 mt-1">Long-term mineral balance and heavy metal screening.</p>
                      </div>
                    </li>
                    <li className="flex gap-4 items-start bg-white p-4 rounded-2xl border border-nnc-sage/10 shadow-sm hover-lift">
                      <div className="mt-1 w-6 h-6 rounded-full bg-nnc-sage/20 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-nnc-sage" />
                      </div>
                      <div>
                        <h4 className="font-medium text-nnc-charcoal text-lg">Zinzino BalanceTest</h4>
                        <p className="text-sm text-nnc-charcoal/60 mt-1">Fatty acid profiling to measure systemic inflammation.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The NNC Journey */}
        <section id="journey" className="py-32 bg-nnc-ivory">
          <div className="container mx-auto px-6 md:px-12">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="font-sans font-medium text-sm tracking-widest text-nnc-sage uppercase mb-3 block">From Root Cause to Vitality</span>
              <h2 className="font-serif text-4xl md:text-5xl text-nnc-charcoal">The NNC Journey</h2>
            </div>
            
            <div className="max-w-5xl mx-auto relative">
              <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-px bg-nnc-sage/20 md:-translate-x-1/2" />
              
              <div className="space-y-16">
                {[
                  {
                    step: 1,
                    title: "Discovery & Assessment",
                    text: "We begin by deeply exploring your life history, diet, and lifestyle through comprehensive intake forms. This allows us to map out the unique drivers of your symptoms."
                  },
                  {
                    step: 2,
                    title: "Biological Insights",
                    text: "Utilizing cutting-edge diagnostics—including Applied Nutritional Microscopy and HTMA—we view your cells in real-time, identifying missing nutrients and toxicities."
                  },
                  {
                    step: 3,
                    title: "Nutritional Rebuilding",
                    text: "With data in hand, we implement your customized protocol. Using high-bioavailability nutrients and Schüssler Tissue Salts, we stabilize your physical 'hardware'."
                  },
                  {
                    step: 4,
                    title: "Homeopathic Integration",
                    text: "Once the foundation is stabilized, we introduce individualized homeopathy to upgrade the 'software,' resolving deep-seated patterns and restoring self-regulation."
                  },
                  {
                    step: 5,
                    title: "Lifestyle Optimization",
                    text: "Finally, we equip you with specialized coaching focused on sleep, circadian rhythm, and nervous system regulation for sustainable, long-term vitality."
                  }
                ].map((item, index) => (
                  <div key={item.step} className={`relative flex flex-col md:flex-row gap-8 md:gap-16 items-start ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                    <div className="absolute left-0 md:left-1/2 w-20 h-20 bg-nnc-ivory border-4 border-nnc-cream rounded-full flex items-center justify-center shadow-sm z-10 md:-translate-x-1/2 mt-0 md:mt-0">
                      <span className="font-serif text-3xl text-nnc-olive">{item.step}</span>
                    </div>
                    
                    <div className={`ml-24 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:text-left" : "md:text-right"}`}>
                      <div className={`bg-white p-8 rounded-3xl shadow-sm border border-nnc-sage/10 hover-lift ${index % 2 === 0 ? "md:ml-12" : "md:mr-12"}`}>
                        <h3 className="font-serif text-2xl text-nnc-charcoal mb-3">{item.title}</h3>
                        <p className="text-nnc-charcoal/70 leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services / Pricing */}
        <section id="services" className="py-32 bg-nnc-blush/10 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-nnc-blush/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="container mx-auto px-6 md:px-12 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="font-serif text-4xl md:text-5xl text-nnc-charcoal mb-4">Our Services</h2>
              <p className="text-xl text-nnc-charcoal/70 font-serif mb-6">Tailored Care for Lasting Vitality</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Tier 1 */}
              <div className="bg-white rounded-[2rem] p-8 border border-nnc-sage/20 shadow-sm flex flex-col hover-lift relative overflow-hidden">
                <div className="h-2 bg-nnc-sage/40 absolute top-0 left-0 right-0" />
                <div className="mb-6">
                  <h3 className="font-serif text-2xl text-nnc-charcoal mb-2">Tier 1: Core Focus</h3>
                  <p className="text-nnc-sage font-medium text-sm">60 minutes</p>
                </div>
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="font-serif text-4xl text-nnc-charcoal">$250</span>
                  <span className="text-sm text-nnc-charcoal/50">+ HST</span>
                </div>
                <p className="text-nnc-charcoal/70 text-sm leading-relaxed mb-8 flex-grow">
                  Designed for individuals seeking targeted support, this tier focuses intensely on a single modality—whether Holistic Nutrition, Homeopathy, or Lifestyle/mental health coaching.
                </p>
                <NNCButton variant="outline" className="w-full">Book Tier 1</NNCButton>
              </div>

              {/* Tier 2 */}
              <div className="bg-nnc-olive text-white rounded-[2rem] p-8 shadow-nnc-soft flex flex-col hover-lift relative overflow-hidden transform md:-translate-y-4">
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                  Most Popular
                </div>
                <div className="mb-6">
                  <h3 className="font-serif text-2xl text-white mb-2">Tier 2: Integrated Protocol</h3>
                  <p className="text-white/80 font-medium text-sm">90 minutes</p>
                </div>
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="font-serif text-4xl text-white">$350</span>
                  <span className="text-sm text-white/60">+ HST</span>
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-8 flex-grow">
                  Our signature multi-dimensional approach. This tier seamlessly integrates all of our clinic modalities into one powerful, cohesive strategy to address biochemical, nutritional, and cognitive health simultaneously.
                </p>
                <button className="w-full bg-white text-nnc-olive py-4 rounded-full font-medium hover:bg-nnc-cream transition-colors shadow-sm hover:scale-[1.02]">
                  Select Tier 2
                </button>
              </div>

              {/* Tier 3 */}
              <div className="bg-white rounded-[2rem] p-8 border border-nnc-sage/20 shadow-sm flex flex-col hover-lift relative overflow-hidden">
                <div className="h-2 bg-nnc-sage/40 absolute top-0 left-0 right-0" />
                <div className="mb-6">
                  <h3 className="font-serif text-2xl text-nnc-charcoal mb-2">Tier 3: Accountability Plus</h3>
                  <p className="text-nnc-sage font-medium text-sm">Protocol + Weekly Coaching</p>
                </div>
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="font-serif text-4xl text-nnc-charcoal">$450</span>
                  <span className="text-sm text-nnc-charcoal/50">+ HST</span>
                </div>
                <p className="text-nnc-charcoal/70 text-sm leading-relaxed mb-8 flex-grow">
                  For those who want maximum guidance, this includes the complete Integrated Protocol layered with high-accountability support, featuring two 15-minute weekly coaching check-ins.
                </p>
                <NNCButton variant="outline" className="w-full">Book Tier 3</NNCButton>
              </div>
            </div>

            <div className="mt-20 max-w-5xl mx-auto">
              <h3 className="font-serif text-3xl text-center mb-10 text-nnc-charcoal">Targeted Assessments & Therapies</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-nnc-sage/10 text-center hover-lift">
                  <h4 className="font-medium text-lg text-nnc-charcoal mb-1">Live Blood Cell Analysis</h4>
                  <p className="text-xs text-nnc-charcoal/60 mb-4">Initial Session (60 min)</p>
                  <p className="font-serif text-2xl text-nnc-olive">$250 <span className="text-xs font-sans text-nnc-charcoal/50">+ HST</span></p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-nnc-sage/10 text-center hover-lift">
                  <h4 className="font-medium text-lg text-nnc-charcoal mb-1">Hair Tissue Mineral Analysis</h4>
                  <p className="text-xs text-nnc-charcoal/60 mb-4">Complete Lab & Discovery</p>
                  <p className="font-serif text-2xl text-nnc-olive">$370 <span className="text-xs font-sans text-nnc-charcoal/50">+ HST</span></p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-nnc-sage/10 text-center hover-lift">
                  <h4 className="font-medium text-lg text-nnc-charcoal mb-1">Bach Flower Therapy</h4>
                  <p className="text-xs text-nnc-charcoal/60 mb-4">Initial Consultation (60 min)</p>
                  <p className="font-serif text-2xl text-nnc-olive">$125 <span className="text-xs font-sans text-nnc-charcoal/50">+ HST</span></p>
                </div>
              </div>

              <div className="mt-10 bg-nnc-ivory p-8 rounded-3xl border border-nnc-olive/20 text-center max-w-2xl mx-auto shadow-sm">
                <h4 className="font-serif text-2xl text-nnc-charcoal mb-2">Follow-Up & Review Sessions</h4>
                <p className="font-serif text-3xl text-nnc-olive mb-4">$195 <span className="text-sm font-sans text-nnc-charcoal/50">+ HST</span> <span className="text-sm text-nnc-sage ml-2">(45 Minutes)</span></p>
                <p className="text-sm text-nnc-charcoal/70">
                  Available to existing clients to review functional testing results and safely fine-tune protocols as your biological terrain optimizes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Shirin */}
        <section id="about" className="py-32 bg-white relative">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="font-serif text-4xl md:text-5xl text-nnc-charcoal mb-4">Meet Shirin Akhavi</h2>
                <p className="text-nnc-sage font-medium tracking-wide uppercase text-sm mb-8 block">Holistic Integrative Practitioner & Founder</p>
                
                <div className="space-y-6 text-lg text-nnc-charcoal/80 leading-relaxed font-sans mb-10">
                  <p>
                    At Neuro Nutri Clinic, I believe that true health is not merely the absence of symptoms—it is the optimization of your mental, emotional, and physical potential. My mission is to move you away from "supplement guesswork" and guide you toward a precision-based protocol rooted in cellular science.
                  </p>
                  <p>
                    I specialize in the intricate connection between the brain and the gut. By combining the cutting-edge neuroscience of Amen University with the gentle, restorative healing of Homeopathy, I offer a truly integrative approach.
                  </p>
                  <div className="pl-6 border-l-2 border-nnc-olive py-2 my-8">
                    <p className="font-serif text-xl italic text-nnc-charcoal">
                      "I founded Neuro Nutri Clinic because I grew tired of seeing people 'falling through the cracks' of the standard healthcare model... I am here to validate your lived experience with objective biological data."
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-nnc-cream text-nnc-charcoal/80 rounded-full text-xs font-medium border border-nnc-sage/20">MSc Applied Neuroscience (KCL)</span>
                  <span className="px-4 py-2 bg-nnc-cream text-nnc-charcoal/80 rounded-full text-xs font-medium border border-nnc-sage/20">BSc Neuropsychology</span>
                  <span className="px-4 py-2 bg-nnc-cream text-nnc-charcoal/80 rounded-full text-xs font-medium border border-nnc-sage/20">Registered Homeopath (CHO)</span>
                  <span className="px-4 py-2 bg-nnc-cream text-nnc-charcoal/80 rounded-full text-xs font-medium border border-nnc-sage/20">ROHP / RNCP</span>
                  <span className="px-4 py-2 bg-nnc-cream text-nnc-charcoal/80 rounded-full text-xs font-medium border border-nnc-sage/20">Harvard Medical School Cert.</span>
                </div>
              </div>
              
              <div className="order-1 lg:order-2 relative">
                <div className="aspect-square max-w-md mx-auto relative z-10 rounded-[3rem] overflow-hidden shadow-xl border-4 border-white">
                  <img src={shirinImage} alt="Shirin Akhavi" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-1/2 right-0 lg:-right-10 w-64 h-64 bg-nnc-rose/20 rounded-full blur-[60px] -z-10" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-nnc-sage/20 rounded-full blur-[50px] -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Credentials */}
        <section id="credentials" className="py-24 bg-nnc-cream relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-white rounded-full blur-[100px] pointer-events-none" />
          <div className="container mx-auto px-6 md:px-12 relative z-10">
             <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="font-sans font-medium text-sm tracking-widest text-nnc-sage uppercase mb-3 block">Rigorous Training. Regulated Practice.</span>
              <h2 className="font-serif text-3xl md:text-4xl text-nnc-charcoal">Credentials & Professional Designations</h2>
            </div>
            
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-nnc-sage/10 hover-lift">
                 <h3 className="font-serif text-2xl text-nnc-olive mb-4">University Degrees</h3>
                 <ul className="space-y-4">
                   <li>
                     <h4 className="font-medium text-nnc-charcoal">MSc Applied Neuroscience, with Merit</h4>
                     <p className="text-sm text-nnc-charcoal/60 mt-1">King's College London (KCL), UK</p>
                   </li>
                   <li>
                     <h4 className="font-medium text-nnc-charcoal">Specialized Honours BSc in Neuropsychology</h4>
                     <p className="text-sm text-nnc-charcoal/60 mt-1">York University, Canada</p>
                   </li>
                 </ul>
               </div>

               <div className="bg-white p-8 rounded-3xl shadow-sm border border-nnc-sage/10 hover-lift">
                 <h3 className="font-serif text-2xl text-nnc-olive mb-4">Regulated Board & Designations</h3>
                 <ul className="space-y-4">
                   <li>
                     <h4 className="font-medium text-nnc-charcoal">Registered Homeopath (Hom)</h4>
                     <p className="text-sm text-nnc-charcoal/60 mt-1">College of Homeopaths of Ontario (CHO)</p>
                   </li>
                   <li>
                     <h4 className="font-medium text-nnc-charcoal">ROHP / RNCP</h4>
                     <p className="text-sm text-nnc-charcoal/60 mt-1">IONC — Member in Good Standing Since 2014</p>
                   </li>
                 </ul>
               </div>

               <div className="bg-white p-8 rounded-3xl shadow-sm border border-nnc-sage/10 hover-lift">
                 <h3 className="font-serif text-2xl text-nnc-olive mb-4">Elite Medical School Certificates</h3>
                 <ul className="space-y-4">
                   <li>
                     <h4 className="font-medium text-nnc-charcoal">Brain Medicine: Integrating Clinical Neurosciences</h4>
                     <p className="text-sm text-nnc-charcoal/60 mt-1">Harvard Medical School</p>
                   </li>
                   <li>
                     <h4 className="font-medium text-nnc-charcoal">Lifestyle & Wellness Coaching</h4>
                     <p className="text-sm text-nnc-charcoal/60 mt-1">Harvard Medical School</p>
                   </li>
                    <li>
                     <h4 className="font-medium text-nnc-charcoal">Talking with Voices Clinical Framework</h4>
                     <p className="text-sm text-nnc-charcoal/60 mt-1">Stanford University School of Medicine</p>
                   </li>
                 </ul>
               </div>

               <div className="bg-white p-8 rounded-3xl shadow-sm border border-nnc-sage/10 hover-lift">
                 <h3 className="font-serif text-2xl text-nnc-olive mb-4">Advanced Clinical Specialties</h3>
                 <ul className="space-y-4">
                   <li>
                     <h4 className="font-medium text-nnc-charcoal">Certified Brain Health Professional & Elite Coach</h4>
                     <p className="text-sm text-nnc-charcoal/60 mt-1">Amen University</p>
                   </li>
                   <li>
                     <h4 className="font-medium text-nnc-charcoal">Advanced Training in Functional Psychiatry</h4>
                     <p className="text-sm text-nnc-charcoal/60 mt-1">Psychiatry Redefined</p>
                   </li>
                   <li>
                     <h4 className="font-medium text-nnc-charcoal">Golden Key International Honour Society</h4>
                     <p className="text-sm text-nnc-charcoal/60 mt-1">Academic Distinction (Inducted 2017)</p>
                   </li>
                 </ul>
               </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-32 bg-nnc-ivory relative">
           <div className="container mx-auto px-6 md:px-12 max-w-4xl">
            <div className="text-center mb-16">
              <span className="font-script text-3xl text-nnc-olive block mb-4">Common Queries</span>
              <h2 className="font-serif text-4xl md:text-5xl text-nnc-charcoal">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-12">
              <div>
                <h3 className="font-serif text-2xl text-nnc-olive mb-6">General & Philosophy</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 border border-nnc-sage/10 shadow-sm">
                    <h4 className="font-medium text-nnc-charcoal text-lg mb-3">What is a "Neuro-Nutritional" approach?</h4>
                    <p className="text-nnc-charcoal/70 leading-relaxed">
                      A neuro-nutritional approach looks at the profound, bidirectional connection between your gut, your biochemistry, and your brain. By using targeted nutrition, minerals, and homeopathy, we support the physical "hardware" and nervous system pathways that directly influence your mind.
                    </p>
                  </div>
                   <div className="bg-white rounded-2xl p-6 border border-nnc-sage/10 shadow-sm">
                    <h4 className="font-medium text-nnc-charcoal text-lg mb-3">Do you replace my family doctor?</h4>
                    <p className="text-nnc-charcoal/70 leading-relaxed">
                      No. We work strictly as complementary health practitioners. We highly encourage you to maintain regular care with your primary physician, and we are always happy to work collaboratively alongside your healthcare team.
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-nnc-sage/10 shadow-sm">
                    <h4 className="font-medium text-nnc-charcoal text-lg mb-3">I've been told my blood work is "normal," but I still feel unwell. Can you help?</h4>
                    <p className="text-nnc-charcoal/70 leading-relaxed">
                       This is exactly why Neuro Nutri Clinic was founded. Standard blood work often looks for advanced disease states. We look at health through a functional and cellular lens to uncover imbalances that explain why you feel exhausted, anxious, or foggy despite having "normal" labs.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-serif text-2xl text-nnc-olive mb-6">Logistics & Bookings</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 border border-nnc-sage/10 shadow-sm">
                    <h4 className="font-medium text-nnc-charcoal text-lg mb-3">Can I buy just a single session?</h4>
                    <p className="text-nnc-charcoal/70 leading-relaxed">
                      Yes. Our Tier 1: Core Focus session is a standalone, 60-minute deep-dive initial assessment. However, for long-standing concerns regarding the brain-gut connection, we highly recommend Tier 2: The Integrated Protocol.
                    </p>
                  </div>
                   <div className="bg-white rounded-2xl p-6 border border-nnc-sage/10 shadow-sm">
                    <h4 className="font-medium text-nnc-charcoal text-lg mb-3">Are your services covered by health insurance?</h4>
                    <p className="text-nnc-charcoal/70 leading-relaxed">
                      Many extended health insurance benefits packages in Ontario cover Registered Orthomolecular Health Practitioners (ROHP) or Registered Nutritional Consultants (RNC) through the IONC, as well as Registered Homeopaths.
                    </p>
                  </div>
                </div>
              </div>
            </div>
           </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-nnc-charcoal relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-nnc-charcoal via-nnc-charcoal to-[#4A2D40] z-0" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-nnc-olive/20 rounded-full blur-[120px] z-0" />
          
          <div className="container mx-auto px-6 md:px-12 relative z-10 text-center max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Ready to Reclaim Your Health?</h2>
            <p className="text-xl text-nnc-cream/80 mb-12 font-sans font-light">
              Stop guessing. Start measuring. Begin your custom neuro-nutritional protocol today.
            </p>
            <NNCButton variant="primary" className="text-lg px-10 py-5 bg-nnc-blush text-nnc-charcoal hover:bg-white w-full sm:w-auto">
              Book Your Initial Consultation
            </NNCButton>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-nnc-ivory pt-24 pb-12 border-t border-nnc-sage/10">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5">
            <img src={nncLogoUrl} alt="NNC Logo" className="h-24 object-contain mb-8" />
            <p className="font-serif italic text-xl text-nnc-olive mb-4">
              Integrating neuroscience and holistic medicine.
            </p>
            <p className="text-nnc-charcoal/70 max-w-sm">
              We provide a science-backed, sustainable roadmap to health, empowering you to optimize brain performance and reclaim vitality.
            </p>
          </div>
          
          <div className="md:col-span-4">
            <h4 className="font-serif text-2xl text-nnc-charcoal mb-6">Contact</h4>
            <ul className="space-y-4 text-nnc-charcoal/70">
              <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-nnc-sage" /> shirinakhavi@yahoo.com</li>
              <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-nnc-sage" /> 416-835-5508</li>
              <li className="flex items-center gap-3"><MapPin className="w-5 h-5 text-nnc-sage" /> Toronto, Ontario, Canada</li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-serif text-2xl text-nnc-charcoal mb-6">Quick Links</h4>
            <ul className="space-y-3 text-nnc-charcoal/70">
              <li><a href="#philosophy" className="hover:text-nnc-olive transition-colors">Our Philosophy</a></li>
              <li><a href="#services" className="hover:text-nnc-olive transition-colors">Services & Pricing</a></li>
              <li><a href="#journey" className="hover:text-nnc-olive transition-colors">The NNC Journey</a></li>
              <li><a href="#about" className="hover:text-nnc-olive transition-colors">Meet Shirin</a></li>
            </ul>
          </div>
        </div>
        
        <div className="container mx-auto px-6 md:px-12 pt-8 border-t border-nnc-sage/10 text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-nnc-charcoal/50">
            &copy; {new Date().getFullYear()} Neuro Nutri Clinic. All rights reserved.
          </p>
          <p className="text-xs text-nnc-charcoal/40 max-w-2xl text-left md:text-right">
            Disclaimer: Services are integrative and supportive, and do not replace medical diagnosis, psychiatric care, or emergency treatment.
          </p>
        </div>
      </footer>
    </div>
  );
}
