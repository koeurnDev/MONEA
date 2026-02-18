"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, ArrowRight, Check, X, Star, Heart, Play, MapPin } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValueEvent } from "framer-motion";
import { MoneaLogo } from "@/components/ui/MoneaLogo";

// --- Components ---

function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "ទំព័រដើម", href: "#" },
    { name: "លក្ខណៈពិសេស", href: "#features" },
    { name: "ពុម្ពគំរូ", href: "/templates" },
    { name: "តម្លៃ", href: "#pricing" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out border-b",
          isScrolled ? "bg-black/80 backdrop-blur-xl border-white/10 py-4" : "bg-transparent border-transparent py-6"
        )}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="relative z-50">
            <MoneaLogo showText size="md" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors font-kantumruy"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-white hover:text-pink-400 transition-colors font-kantumruy px-4">
              ចូលប្រើប្រាស់
            </Link>
            <Link href="/register">
              <span className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-white px-8 font-medium text-black transition-all duration-300 hover:bg-pink-500 hover:text-white hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]">
                <span className="font-kantumruy text-sm font-bold pt-0.5">ចាប់ផ្តើម</span>
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative z-50 p-2 text-white hover:text-pink-400 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl flex items-center justify-center"
          >
            <div className="flex flex-col gap-8 text-center">
              {navItems.map((item, idx) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl font-kantumruy text-white hover:text-pink-500 transition-colors"
                >
                  {item.name}
                </motion.a>
              ))}
              <div className="mt-8 flex flex-col gap-6 px-10">
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-xl text-white/80 font-kantumruy border border-white/20 py-3 rounded-full">ចូលប្រើប្រាស់</Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)} className="text-xl bg-pink-600 text-white font-kantumruy font-bold py-3 rounded-full">ចាប់ផ្តើម</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background Parallax */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <Image
          src="/images/bg_tunnel.jpg"
          alt="Wedding Tunnel"
          fill
          className="object-cover opacity-70 scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-pulse-slow">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-white/90 text-xs font-kantumruy font-bold tracking-widest uppercase">
              MONEA Wedding Digital : មនោសញ្ចេតនានៃក្តីស្រឡាញ់
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl lg:text-[10rem] font-bold font-kantumruy text-white mb-6 leading-none tracking-tighter drop-shadow-2xl"
        >
          សិរីមង្គល
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-200 to-pink-300 font-bold font-kantumruy text-4xl md:text-6xl lg:text-8xl mt-2 md:mt-4 tracking-normal">
            ក្នុងដៃរបស់អ្នក
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-white/70 text-lg md:text-2xl font-kantumruy max-w-2xl mx-auto mb-12 leading-relaxed font-light"
        >
          បង្កើតធៀបអញ្ជើញឌីជីថលដ៏ប្រណីត គ្រប់គ្រងភ្ញៀវ និងទទួលពរជ័យ ក្នុងវេទិកាតែមួយ។
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6"
        >
          <Link href="/register" className="group relative inline-flex h-14 w-64 items-center justify-center overflow-hidden rounded-full bg-white text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-600 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
            <span className="font-kantumruy text-lg font-bold">បង្កើតការអញ្ជើញ</span>
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="#templates" className="text-white/80 hover:text-white font-kantumruy text-lg underline decoration-white/30 underline-offset-8 decoration-1 transition-all hover:decoration-white">
            មើលពុម្ពគំរូ
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/50 text-[10px] uppercase font-kantumruy tracking-widest">អូសចុះក្រោម</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </section>
  );
}

// --- Museum Style Features ---
function FeatureRow({ title, sub, desc, img, index }: { title: string, sub: string, desc: string, img: string, index: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);

  const isEven = index % 2 === 0;

  return (
    <section ref={ref} className="min-h-[80vh] flex items-center py-24 bg-black overflow-hidden relative border-b border-white/5">
      {/* Background Glow */}
      <div className={cn("absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none", isEven ? "bg-purple-900/40 -left-64 top-0" : "bg-pink-900/40 -right-64 bottom-0")} />

      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
        <div className={cn("flex flex-col gap-8", isEven ? "lg:order-1" : "lg:order-2")}>
          <motion.div style={{ opacity }} className="space-y-6">
            <span className="inline-block py-1 px-3 rounded-full border border-white/10 bg-white/5 text-pink-300 font-mono text-xs uppercase tracking-wider backdrop-blur-md">
              ០{index + 1} — {sub === "DESIGN" ? "ការរចនា" : sub === "MANAGEMENT" ? "ការគ្រប់គ្រង" : "ការទំនាក់ទំនង"}
            </span>
            <h2 className="text-4xl md:text-6xl font-bold font-kantumruy text-white leading-tight tracking-tight">
              {title}
            </h2>
            <p className="text-gray-400 text-lg md:text-xl font-kantumruy leading-relaxed max-w-md font-light">
              {desc}
            </p>
            <div className="pt-4">
              <Button variant="link" className="text-white p-0 h-auto font-kantumruy text-base group">
                ស្វែងយល់បន្ថែម <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>

        <div className={cn("relative h-[500px] lg:h-[700px] w-full", isEven ? "lg:order-2" : "lg:order-1")}>
          <div className="absolute inset-0 bg-white/5 rounded-[3rem] transform rotate-3 scale-95 border border-white/5" />
          <motion.div style={{ y }} className="w-full h-full relative rounded-[3rem] overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
            <Image
              src={img}
              alt={title}
              fill
              className="object-cover transform hover:scale-105 transition-transform duration-1000 ease-out"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

            {/* Floating UI Element Simulation */}
            <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  {index === 0 ? <Heart className="text-pink-300 fill-pink-300" /> : index === 1 ? <Check className="text-green-400" /> : <MapPin className="text-blue-300" />}
                </div>
                <div>
                  <p className="text-white font-bold font-kantumruy text-sm">បានដំណើរការជោគជ័យ</p>
                  <p className="text-white/60 text-xs font-kantumruy">ទិន្នន័យត្រូវបានរក្សាទុកដោយសុវត្ថិភាព</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <div id="features" className="bg-black">
      <FeatureRow
        index={0}
        sub="DESIGN"
        title="ធៀបឌីជីថល ប្រណីតភាព"
        desc="រចនាប័ទ្មដែលឆ្លុះបញ្ចាំងពីបុគ្គលិកលក្ខណៈរបស់អ្នក។ ធៀបនីមួយៗត្រូវបានបង្កើតឡើងដោយផ្តល់នូវអារម្មណ៍ពិសេសមិនអាចបំភ្លេចបាន។"
        img="/images/couple.jpg"
      />
      <FeatureRow
        index={1}
        sub="MANAGEMENT"
        title="គ្រប់គ្រងភ្ញៀវ ងាយស្រួល"
        desc="រៀបចំតុ តាមដានអ្នកចូលរួម និងគ្រប់គ្រងការឆ្លើយតប (RSVP) ក្នុងកន្លែងតែមួយ។ មិនមានការឈឺក្បាលទៀតទេ។"
        img="/images/bg_staircase.jpg"
      />
      <FeatureRow
        index={2}
        sub="INTERACTION"
        title="ភ្ជាប់ទំនាក់ទំនង យ៉ាងជិតស្និទ្ធ"
        desc="ភ្ញៀវអាចមើលទីតាំង ផ្ញើពាក្យជូនពរ និងជូនកាដូតាមរយៈ QR Code ដោយផ្ទាល់ពីទូរស័ព្ទរបស់ពួកគេ។"
        img="/images/bg_enchanted.jpg"
      />
    </div>
  )
}

// --- Horizontal Scroll Showcase ---
function Templates() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);

  return (
    <section id="templates" ref={containerRef} className="bg-neutral-950 py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 mb-16 text-center">
        <span className="text-pink-500 text-sm font-mono uppercase tracking-widest mb-4 block">ការប្រមូលផ្តុំ</span>
        <h2 className="text-4xl md:text-6xl font-bold font-kantumruy text-white mb-6 tracking-tight">ពុម្ពគំរូដ៏ពេញនិយម</h2>
        <p className="text-gray-400 font-kantumruy max-w-2xl mx-auto">ជ្រើសរើសរចនាប័ទ្មដែលអ្នកពេញចិត្ត ហើយចាប់ផ្តើមតុបតែងតាមចិត្តរបស់អ្នក។</p>
      </div>

      <div className="flex overflow-x-auto pb-12 px-6 gap-8 snap-x snap-mandatory no-scrollbar hover:cursor-grab active:cursor-grabbing">
        {[
          { name: "Modern Wedding", img: "/images/bg_tunnel.jpg", tag: "ពេញនិយម" },
          { name: "Khmer Classic", img: "/images/couple.jpg", tag: "ប្រពៃណី" },
          { name: "Enchanted Garden", img: "/images/bg_enchanted.jpg", tag: "ផ្កាភ្ញី" },
          { name: "Golden Jubilee", img: "/images/bg_staircase.jpg", tag: "ខួបអាពាហ៍ពិពាហ៍" },
          { name: "Sweet Memory", img: "/images/couple.jpg", tag: "សាមញ្ញ" },
        ].map((t, i) => (
          <div key={i} className="min-w-[300px] md:min-w-[400px] snap-center">
            <div className="relative aspect-[9/16] rounded-3xl overflow-hidden group cursor-pointer border border-white/10 bg-white/5">
              <Image
                src={t.img}
                alt={t.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

              <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-500 group-hover:translate-y-0 translate-y-4">
                <span className="text-[10px] font-bold tracking-widest text-pink-400 uppercase bg-black/50 backdrop-blur-md px-3 py-1 rounded-full mb-4 inline-block">{t.tag}</span>
                <h3 className="text-2xl font-bold font-kantumruy text-white mb-2">{t.name}</h3>
                <div className="w-full h-[1px] bg-white/20 my-4 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                <p className="text-white/60 text-sm font-kantumruy opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">ចុចដើម្បីមើលគំរូ</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}


function Pricing() {
  return (
    <section id="pricing" className="py-32 bg-black border-t border-white/10 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold font-kantumruy text-white mb-6 tracking-tight">គម្រោងតម្លៃ</h2>
          <p className="text-gray-400 font-kantumruy">ជ្រើសរើសគម្រោងដែលសាកសមបំផុតសម្រាប់អ្នក</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { name: "ឥតគិតថ្លៃ", price: "0$", desc: "សម្រាប់ការសាកល្បង", features: ["១ ពុម្ពគំរូ", "ភ្ញៀវ ៥០ នាក់", "ទុកបាន ២ សប្តាហ៍"] },
            { name: "បរិបូរណ៍", price: "19$", desc: "ពេញនិយមបំផុត", features: ["ពុម្ពគំរូទាំងអស់", "ភ្ញៀវមិនកំណត់", "ទុកបានរហូត", "QR កាដូ", "ផែនទី Google"], highlight: true },
            { name: "អាជីវកម្ម", price: "49$", desc: "សម្រាប់អ្នករៀបចំកម្មវិធី", features: ["ស្លាកយីហោផ្ទាល់ខ្លួន", "ការប្រើប្រាស់ API", "ជំនួយ ២៤/៧ - VIP"] }
          ].map((plan, i) => (
            <div key={i} className={cn("relative p-8 rounded-3xl border flex flex-col items-start justify-between min-h-[500px] transition-all duration-500 group hover:-translate-y-2", plan.highlight ? "bg-white/10 border-pink-500/50 shadow-[0_0_40px_rgba(236,72,153,0.15)]" : "bg-white/5 border-white/10 hover:border-white/30")}>
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                  ការណែនាំ
                </div>
              )}

              <div className="w-full">
                <h3 className={cn("text-xl font-bold font-kantumruy mb-4", plan.highlight ? "text-white" : "text-white/70")}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-bold font-mono text-white tracking-tighter">{plan.price}</span>
                  <span className="text-white/40 text-sm">/មួយកម្មវិធី</span>
                </div>
                <p className="text-sm font-kantumruy text-gray-400 mb-8 border-b border-white/10 pb-8">{plan.desc}</p>

                <ul className="space-y-5 font-kantumruy text-sm">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-3">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center bg-white/10", plan.highlight ? "text-pink-400" : "text-gray-400")}>
                        <Check size={12} />
                      </div>
                      <span className="text-gray-300 group-hover:text-white transition-colors">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button className={cn("w-full py-6 mt-8 text-base font-bold font-kantumruy transition-all rounded-xl", plan.highlight ? "bg-white text-black hover:bg-gray-200" : "bg-white/10 text-white hover:bg-white/20")}>
                ជ្រើសរើស
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-black py-20 border-t border-white/10">
      <div className="container mx-auto px-6 text-center">
        <div className="flex flex-col items-center mb-12">
          <MoneaLogo size="lg" className="mb-6" />
          <h2 className="text-4xl md:text-6xl font-bold font-kantumruy text-white/10 tracking-[0.3em] uppercase">MONEA</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16 font-kantumruy text-white/60 uppercase text-xs tracking-[0.2em]">
          <a href="#" className="hover:text-white transition-colors">ទំព័រដើម</a>
          <a href="#" className="hover:text-white transition-colors">លក្ខណៈពិសេស</a>
          <a href="#" className="hover:text-white transition-colors">ពុម្ពគំរូ</a>
          <a href="#" className="hover:text-white transition-colors">ទាក់ទង</a>
        </div>

        <div className="flex justify-center gap-6 mb-12">
          {/* Social Icosn Placeholder */}
          {[1, 2, 3].map(i => (
            <div key={i} className="w-10 h-10 rounded-full border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all cursor-pointer flex items-center justify-center text-white/50">
              <div className="w-4 h-4 bg-current" />
            </div>
          ))}
        </div>

        <p className="text-white/30 text-xs font-kantumruy">រក្សាសិទ្ធិគ្រប់យ៉ាង ២០២៦ MONEA</p>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <div className="bg-black text-white selection:bg-pink-500 selection:text-white font-kantumruy overflow-x-hidden">
      <NavBar />
      <Hero />
      <Features />
      <Templates />
      <Pricing />
      <Footer />
    </div>
  );
}
