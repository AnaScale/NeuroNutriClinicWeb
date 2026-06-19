import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Brain, Microscope, Sparkles, MoveRight, ChevronRight, Menu } from "lucide-react";
import "./_group.css";

const nncLogoUrl = "/images/nnc-logo.png";

export function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-nnc-ivory text-nnc-charcoal font-sans selection:bg-nnc-olive selection:text-white">
      {/* Editorial Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 border-b border-nnc-charcoal/10 ${scrolled ? "bg-nnc-ivory/95 backdrop-blur-md py-4" : "bg-nnc-ivory py-6"}`}>
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-medium tracking-tight">Neuro Nutri Clinic</span>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            {["Philosophy", "Journey", "Services", "FAQ"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs uppercase tracking-widest text-nnc-charcoal/70 hover:text-nnc-olive transition-colors">
                {item}
              </a>
            ))}
            <Button className="bg-nnc-charcoal hover:bg-nnc-olive text-white rounded-none px-8 py-0 h-10 text-xs uppercase tracking-widest transition-colors">
              Book Consultation
            </Button>
          </nav>
          <button className="md:hidden">
            <Menu className="w-6 h-6 text-nnc-charcoal" />
          </button>
        </div>
      </header>

      <main className="pt-32">
        {/* Editorial Hero */}
        <section className="container mx-auto px-6 md:px-12 pb-24">
          <div className="editorial-grid items-end mb-16">
            <div className="col-span-12 lg:col-span-9">
              <p className="font-serif italic text-2xl text-nnc-olive mb-6">Integrating neuroscience and holistic medicine.</p>
              <h1 className="font-serif text-6xl md:text-8xl lg:text-[7rem] leading-[0.9] text-nnc-charcoal tracking-tight">
                Where Neuroscience Meets<br />
                <span className="italic text-nnc-charcoal/80">Nutritional Precision</span>
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-3 pb-2 hidden lg:block">
              <p className="text-sm text-nnc-charcoal/60 leading-relaxed border-l border-nnc-charcoal/20 pl-6">
                A science-backed, sustainable roadmap to health, empowering you to optimize brain performance and reclaim vitality.
              </p>
            </div>
          </div>

          <div className="w-full h-[60vh] relative overflow-hidden bg-nnc-cream">
            <img src="/__mockup/images/hero-editorial.png" alt="Neuro Botanical Art" className="w-full h-full object-cover opacity-90 mix-blend-multiply" />
            <div className="absolute inset-0 border border-nnc-charcoal/10 m-4 pointer-events-none"></div>
          </div>

          {/* Modality Strip */}
          <div className="flex flex-wrap items-center justify-between border-b border-nnc-charcoal/20 py-8 mt-12 text-xs md:text-sm font-medium tracking-[0.2em] text-nnc-charcoal uppercase">
            <span>Neuroscience</span>
            <span className="hidden md:inline text-nnc-olive/50">✦</span>
            <span>Homeopathy</span>
            <span className="hidden md:inline text-nnc-olive/50">✦</span>
            <span>Nutrition</span>
            <span className="hidden md:inline text-nnc-olive/50">✦</span>
            <span>Lifestyle</span>
          </div>
        </section>

        {/* Philosophy - Editorial Grid */}
        <section id="philosophy" className="border-t border-nnc-charcoal/10 bg-nnc-cream">
          <div className="container mx-auto px-6 md:px-12">
            <div className="editorial-grid py-24">
              <div className="col-span-12 lg:col-span-4 lg:border-r border-nnc-charcoal/10 lg:pr-12">
                <h2 className="font-serif text-5xl mb-6">Our<br />Philosophy</h2>
                <p className="text-sm font-medium tracking-widest text-nnc-olive uppercase mb-12">The Biological "Why"</p>
              </div>
              <div className="col-span-12 lg:col-span-8 lg:pl-12 flex flex-col gap-12">
                <div className="text-2xl md:text-3xl font-serif leading-relaxed text-nnc-charcoal/90">
                  "We don't just mask your symptoms; we illuminate the root cause, giving you the clarity and biochemical support you need to fully reclaim your health."
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed text-nnc-charcoal/70">
                  <p>
                    Whether you are navigating physical health challenges like digestive issues, blood sugar imbalances, and hormonal irregularities, or managing mental and emotional concerns such as anxiety, brain fog, and ADHD, we look beneath the surface.
                  </p>
                  <p>
                    We believe that true healing happens at the intersection of mind and body. By uniting classical homeopathy with targeted lifestyle modifications and precise nutritional protocols, we address the unique terrain of your biology.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Journey - Numbered List */}
        <section id="journey" className="border-t border-nnc-charcoal/10 bg-nnc-ivory py-24">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex justify-between items-end mb-16">
              <h2 className="font-serif text-5xl">The NNC<br />Journey</h2>
              <p className="text-xs tracking-widest uppercase text-nnc-charcoal/50">5 Steps to Vitality</p>
            </div>
            
            <div className="border-t border-nnc-charcoal/20">
              {[
                { step: "01", title: "Discovery & Assessment", text: "We begin by deeply exploring your life history, diet, and lifestyle through comprehensive intake forms. This foundational step allows us to map out the unique environmental and habits-based drivers of your symptoms." },
                { step: "02", title: "Biological Insights", subtitle: "Advanced Testing", text: "We view your cells in real-time. By measuring your mineral 'bank account' and metabolic markers, we identify what your body might be missing and what toxicities need to be cleared." },
                { step: "03", title: "Nutritional Rebuilding", subtitle: "The Hardware", text: "We implement your customized NNC diet and lifestyle protocol. Using high-bioavailability nutrients, we stabilize your physical 'hardware', rebalance internal biochemistry, and calm the nervous system." },
                { step: "04", title: "Homeopathic Integration", subtitle: "The Software", text: "Once the physical foundation is stabilized, we introduce individualized homeopathy to upgrade the 'software'. We utilize precise remedies to help resolve deep-seated emotional patterns." },
                { step: "05", title: "Consolidation & Mastery", text: "True health is self-sustaining. In this final phase, we refine your protocol for long-term maintenance, educating you on how to listen to your body's signals." }
              ].map((item, i) => (
                <div key={i} className="group flex flex-col md:flex-row items-start md:items-center py-10 border-b border-nnc-charcoal/10 hover:bg-nnc-olive/5 transition-colors px-4 -mx-4 cursor-default">
                  <div className="font-serif text-5xl md:text-7xl text-nnc-charcoal/20 w-32 group-hover:text-nnc-olive transition-colors">{item.step}</div>
                  <div className="flex-1 md:pr-12 mb-4 md:mb-0">
                    <h3 className="font-serif text-3xl mb-1">{item.title}</h3>
                    {item.subtitle && <p className="text-xs uppercase tracking-widest text-nnc-olive mt-2">{item.subtitle}</p>}
                  </div>
                  <div className="flex-1 text-sm text-nnc-charcoal/70 leading-relaxed">
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet Shirin */}
        <section className="bg-nnc-charcoal text-nnc-ivory">
          <div className="container mx-auto px-6 md:px-12 py-24">
            <div className="editorial-grid">
              <div className="col-span-12 lg:col-span-5 relative mb-12 lg:mb-0">
                <div className="aspect-[3/4] bg-nnc-cream/10 p-4">
                  <img src="/__mockup/images/clinic-interior.png" alt="Clinic Interior" className="w-full h-full object-cover grayscale opacity-80 mix-blend-luminosity" />
                </div>
                <div className="absolute -bottom-8 -right-8 bg-nnc-ivory text-nnc-charcoal p-8 max-w-xs hidden md:block">
                  <p className="font-script text-3xl mb-2 text-nnc-olive">Shirin Akhavi</p>
                  <p className="text-xs uppercase tracking-widest text-nnc-charcoal/50">Founder & Lead Practitioner</p>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex flex-col justify-center">
                <h2 className="font-serif text-5xl mb-8">Meet Shirin</h2>
                <div className="space-y-6 text-nnc-ivory/70 text-sm leading-relaxed mb-12">
                  <p>
                    I founded Neuro Nutri Clinic to bridge the gap between rigorous scientific diagnostics and holistic, integrative healing. My approach is rooted in the belief that the body and mind are inextricably linked.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-nnc-rose mb-6">Credentials & Designations</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm border-t border-nnc-ivory/20 pt-6">
                    <li className="flex items-center gap-3">
                      <div className="w-1 h-1 bg-nnc-rose rounded-full" />
                      <span>Certified Brain Health Professional</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1 h-1 bg-nnc-rose rounded-full" />
                      <span>Integrative Psychiatry Training</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1 h-1 bg-nnc-rose rounded-full" />
                      <span>Registered Nutritional Consultant</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1 h-1 bg-nnc-rose rounded-full" />
                      <span>College of Homeopaths of Ontario</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1 h-1 bg-nnc-rose rounded-full" />
                      <span>BSc Honours</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1 h-1 bg-nnc-rose rounded-full" />
                      <span>Coaching Elite Brain Health</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services / Pricing */}
        <section id="services" className="bg-nnc-cream py-24 border-b border-nnc-charcoal/10">
          <div className="container mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="font-serif text-5xl mb-6">Clinical Services</h2>
              <p className="text-sm text-nnc-charcoal/60 leading-relaxed">
                Tailored protocols depending on your readiness and the complexity of your health goals.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { tier: "Tier 1", title: "Core Focus", price: "$250", desc: "For straightforward imbalances requiring foundational nutrition and lifestyle adjustments." },
                { tier: "Tier 2", title: "Integrated Protocol", price: "$350", desc: "Comprehensive analysis combining advanced testing, nutrition, and homeopathic integration.", highlight: "Most Popular" },
                { tier: "Tier 3", title: "Accountability Plus", price: "$450", desc: "Intensive 1-on-1 support for chronic concerns, including frequent touchpoints and adjustments." }
              ].map((service, i) => (
                <div key={i} className={`relative bg-nnc-ivory border ${service.highlight ? 'border-nnc-olive' : 'border-nnc-charcoal/10'} p-10 flex flex-col`}>
                  {service.highlight && (
                    <span className="absolute top-0 right-0 bg-nnc-olive text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                      {service.highlight}
                    </span>
                  )}
                  <p className="text-xs font-bold uppercase tracking-widest text-nnc-charcoal/40 mb-4">{service.tier}</p>
                  <h3 className="font-serif text-3xl mb-2">{service.title}</h3>
                  <p className="font-serif text-2xl text-nnc-olive mb-6">{service.price}</p>
                  <p className="text-sm text-nnc-charcoal/70 leading-relaxed mb-10 flex-1">
                    {service.desc}
                  </p>
                  <Button className="w-full bg-transparent border border-nnc-charcoal hover:bg-nnc-charcoal hover:text-white text-nnc-charcoal rounded-none text-xs uppercase tracking-widest h-12">
                    Select Plan
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-nnc-ivory border border-nnc-charcoal/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="font-serif text-2xl mb-1">Targeted Assessments & Follow-Up</h4>
                <p className="text-sm text-nnc-charcoal/60">Review sessions for ongoing patients.</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-serif text-2xl text-nnc-olive">$195</span>
                <Button className="bg-nnc-charcoal hover:bg-nnc-olive text-white rounded-none px-6 h-10 text-xs uppercase tracking-widest">
                  Book Session
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ - Editorial Style */}
        <section id="faq" className="py-24 bg-nnc-ivory">
          <div className="container mx-auto px-6 md:px-12 max-w-4xl">
            <h2 className="font-serif text-5xl mb-16 text-center">Frequently Asked<br/>Questions</h2>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border border-nnc-charcoal/10 bg-nnc-cream px-6">
                <AccordionTrigger className="font-serif text-xl hover:no-underline hover:text-nnc-olive py-6">
                  What makes NNC different from traditional clinics?
                </AccordionTrigger>
                <AccordionContent className="text-nnc-charcoal/70 leading-relaxed pb-6">
                  We integrate classical homeopathy, advanced nutritional microscopy, and neuroscience to treat the root cause rather than masking symptoms. Our approach is deeply customized to your unique biology.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border border-nnc-charcoal/10 bg-nnc-cream px-6">
                <AccordionTrigger className="font-serif text-xl hover:no-underline hover:text-nnc-olive py-6">
                  Do you offer virtual consultations?
                </AccordionTrigger>
                <AccordionContent className="text-nnc-charcoal/70 leading-relaxed pb-6">
                  Yes, we offer both in-person sessions at our Toronto clinic and secure virtual consultations for patients globally.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border border-nnc-charcoal/10 bg-nnc-cream px-6">
                <AccordionTrigger className="font-serif text-xl hover:no-underline hover:text-nnc-olive py-6">
                  Are services covered by insurance?
                </AccordionTrigger>
                <AccordionContent className="text-nnc-charcoal/70 leading-relaxed pb-6">
                  Many extended health benefit plans cover Registered Nutritional Consultants and Homeopaths. We provide detailed receipts for your claims.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border border-nnc-charcoal/10 bg-nnc-cream px-6">
                <AccordionTrigger className="font-serif text-xl hover:no-underline hover:text-nnc-olive py-6">
                  What is Hair Tissue Mineral Analysis (HTMA)?
                </AccordionTrigger>
                <AccordionContent className="text-nnc-charcoal/70 leading-relaxed pb-6">
                  HTMA is an analytical test that measures the mineral composition of hair. It provides a reliable cellular reading of mineral and heavy metal levels, reflecting long-term metabolic activity.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-nnc-charcoal text-nnc-cream pt-24 pb-12 border-t border-nnc-ivory/10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="editorial-grid mb-16">
            <div className="col-span-12 lg:col-span-6 mb-12 lg:mb-0">
              <h2 className="font-serif text-5xl md:text-7xl mb-8">Ready to reclaim<br/>your vitality?</h2>
              <Button className="bg-nnc-olive hover:bg-white hover:text-nnc-charcoal text-white rounded-none px-10 h-14 text-sm uppercase tracking-widest transition-colors">
                Book Initial Consultation
              </Button>
            </div>
            
            <div className="col-span-12 lg:col-span-2 lg:col-start-8">
              <h4 className="text-xs uppercase tracking-widest text-nnc-rose mb-6">Contact</h4>
              <ul className="space-y-4 text-sm text-nnc-cream/70">
                <li>shirinakhavi@yahoo.com</li>
                <li>416-835-5508</li>
                <li>Toronto, ON, Canada</li>
              </ul>
            </div>

            <div className="col-span-12 lg:col-span-3">
              <h4 className="text-xs uppercase tracking-widest text-nnc-rose mb-6">Explore</h4>
              <ul className="space-y-4 text-sm text-nnc-cream/70">
                <li><a href="#philosophy" className="hover:text-white transition-colors">Philosophy</a></li>
                <li><a href="#journey" className="hover:text-white transition-colors">The Journey</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Services & Pricing</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-nnc-cream/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-nnc-cream/40">
            <p>&copy; {new Date().getFullYear()} Neuro Nutri Clinic. All rights reserved.</p>
            <p className="max-w-xl text-center md:text-right">
              Disclaimer: Services are integrative and supportive, and do not replace medical diagnosis, psychiatric care, or emergency treatment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
