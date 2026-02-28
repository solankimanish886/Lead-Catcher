import { Link } from "wouter";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    CheckCircle2,
    BarChart3,
    Users,
    Zap,
    Shield,
    Globe,
    MessageSquare,
    Layout,
    MousePointer2,
    Slack,
    Database,
    LineChart,
    ChevronRight,
    Play
} from "lucide-react";
import { useRef, useState, useEffect, useCallback, memo } from "react";

// Animation Variants
const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
};

const staggerChildren = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

// --- Ripple Grid Canvas Component ---
const RippleGridCanvas = memo(() => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wavesRef = useRef<any[]>([]);
    const lastSpawnTime = useRef<number>(0);
    const cellStatesRef = useRef<number[][]>([]);

    const CELL_SIZE = 60;
    const GRID_LINE_COLOR = 'rgba(255, 255, 255, 0.05)';

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let animationFrameId: number;
        let width = 0;
        let height = 0;
        let cols = 0;
        let rows = 0;

        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
            cols = Math.ceil(width / CELL_SIZE);
            rows = Math.ceil(height / CELL_SIZE);

            // Re-initialize cell states
            cellStatesRef.current = Array.from({ length: cols }, () => Array(rows).fill(0));
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        const spawnWave = () => {
            wavesRef.current.push({
                originX: Math.floor(Math.random() * cols),
                originY: Math.floor(Math.random() * rows),
                radius: 0,
                maxRadius: Math.max(cols, rows) * 1.5,
                speed: 0.24, // Matches 1.5-2.5s duration
                opacity: 0.24,
                lastProcessedRadius: -1
            });
        };

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // 1. Draw Grid Lines
            ctx.beginPath();
            ctx.strokeStyle = GRID_LINE_COLOR;
            ctx.lineWidth = 0.5;

            for (let x = 0; x <= width; x += CELL_SIZE) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            for (let y = 0; y <= height; y += CELL_SIZE) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();

            // 2. Update Cell States
            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    if (cellStatesRef.current[c] && cellStatesRef.current[c][r] > 0) {
                        cellStatesRef.current[c][r] *= 0.94; // Smooth fade out
                        if (cellStatesRef.current[c][r] < 0.001) cellStatesRef.current[c][r] = 0;
                    }
                }
            }

            // 3. Update Waves
            const now = Date.now();
            if (now - lastSpawnTime.current > 1200 + Math.random() * 1500) {
                spawnWave();
                lastSpawnTime.current = now;
            }

            wavesRef.current = wavesRef.current.filter(wave => wave.radius < wave.maxRadius);

            wavesRef.current.forEach(wave => {
                wave.radius += wave.speed;
                const rInt = Math.floor(wave.radius);

                // Only process if the wave has moved to a new set of cells
                if (rInt !== wave.lastProcessedRadius) {
                    wave.lastProcessedRadius = rInt;

                    for (let c = 0; c < cols; c++) {
                        for (let r = 0; r < rows; r++) {
                            const dist = Math.sqrt(Math.pow(c - wave.originX, 2) + Math.pow(r - wave.originY, 2));
                            if (Math.floor(dist) === rInt) {
                                const intensity = (1 - (dist / wave.maxRadius)) * wave.opacity;
                                if (cellStatesRef.current[c]) {
                                    cellStatesRef.current[c][r] = Math.max(cellStatesRef.current[c][r], intensity);
                                }
                            }
                        }
                    }
                }
            });

            // 4. Draw Cell Fills
            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    const alpha = cellStatesRef.current[c] ? cellStatesRef.current[c][r] : 0;
                    if (alpha > 0) {
                        ctx.fillStyle = `rgba(0, 237, 100, ${alpha})`;
                        ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                    }
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]"
        />
    );
});

export default function LandingPage() {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const yValue = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacityValue = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-mongodb-green selection:text-mongodb-deep-slate overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#001E2B]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-mongodb-green rounded-xl flex items-center justify-center shadow-lg shadow-mongodb-green/20 group-hover:scale-105 transition-transform duration-300">
                                <Layout className="text-mongodb-deep-slate w-6 h-6" />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">Lead Catcher</span>
                        </div>
                        <div className="hidden lg:flex items-center gap-10 text-white/60 font-bold text-xs uppercase tracking-[0.2em]">
                            <a href="#features" className="hover:text-mongodb-green transition-colors">Features</a>
                            <a href="#integration" className="hover:text-mongodb-green transition-colors">Integrations</a>
                            <a href="#pricing" className="hover:text-mongodb-green transition-colors">Pricing</a>
                        </div>
                        <div className="flex items-center gap-3 md:gap-5">
                            <Link href="/auth">
                                <Button variant="ghost" className="text-white font-bold hover:bg-white/5 rounded-xl px-4 md:px-6 h-10 md:h-12 text-xs md:text-sm">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/auth">
                                <Button className="bg-mongodb-green hover:bg-mongodb-green-dark text-mongodb-deep-slate font-black px-6 md:px-8 h-10 md:h-12 rounded-xl md:rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 text-[10px] md:text-xs uppercase tracking-widest">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} className="relative pt-32 pb-20 md:pt-48 md:pb-28 lg:pt-56 lg:pb-32 bg-[#001E2B] overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <RippleGridCanvas />

                    {/* Radial Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-mongodb-green/5 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 relative z-10 text-center">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={staggerChildren}
                    >
                        {/* Pill Label */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-mongodb-green mb-10"
                        >
                            <span className="relative flex h-2 w-2 mr-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mongodb-green opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-mongodb-green"></span>
                            </span>
                            Now processing 2.4l leads daily
                        </motion.div>

                        {/* Headline */}
                        <h1 className="text-center text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[1.1] text-white mb-10">
                            <motion.span
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                                className="block opacity-90"
                            >
                                Capture and Convert
                            </motion.span>

                            <motion.span
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                                className="block"
                            >
                                More Leads
                            </motion.span>

                            <motion.span
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                                className="block text-[#00ED64] relative py-2"
                            >
                                <span className="relative z-10 drop-shadow-[0_0_15px_rgba(0,237,100,0.3)]">
                                    Automatically.
                                </span>

                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "60%", opacity: 1 }}
                                    transition={{ delay: 1.2, duration: 1, ease: "circOut" }}
                                    className="absolute bottom-2 left-1/2 -translate-x-1/2 h-[3px] bg-gradient-to-r from-transparent via-[#00ED64] to-transparent rounded-full opacity-60"
                                />
                            </motion.span>
                        </h1>

                        {/* Subheadline */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="max-w-2xl mx-auto text-lg lg:text-xl text-white/50 font-medium leading-relaxed mb-16"
                        >
                            The smartest way to turn your website visitors into loyal customers. High-performance lead infrastructure—no coding required.
                        </motion.p>

                        {/* CTA Row */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.6 }}
                            className="flex justify-center px-4"
                        >
                            <Link href="/auth" className="w-full sm:w-auto">
                                <Button className="w-full sm:w-auto bg-mongodb-green hover:bg-mongodb-green-dark text-mongodb-deep-slate font-black h-16 md:h-20 px-8 md:px-12 text-lg md:text-xl rounded-xl md:rounded-2xl shadow-2xl shadow-mongodb-green/20 transition-all hover:scale-105 active:scale-95 group">
                                    Get Started Free
                                    <ArrowRight className="ml-3 w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Application Preview Frame */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-20 md:mt-32 relative max-w-6xl mx-auto px-2 sm:px-4 md:px-10"
                    >
                        <div className="relative rounded-2xl md:rounded-[2.5rem] bg-white/5 p-1 md:p-2 shadow-[0_0_0_1px_rgba(0,255,128,0.15),0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                            <div className="relative bg-[#001E2B] rounded-xl md:rounded-[1.5rem] overflow-hidden border border-white/5 shadow-3xl">
                                <div className="h-8 md:h-10 bg-white/5 border-b border-white/5 flex items-center px-4 md:px-6 gap-2">
                                    <div className="flex gap-1.5 md:gap-2">
                                        <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-[#FF5F57] shadow-lg shadow-[#FF5F57]/20" />
                                        <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-[#FFBD2E] shadow-lg shadow-[#FFBD2E]/20" />
                                        <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-[#28C840] shadow-lg shadow-[#28C840]/20" />
                                    </div>
                                    <div className="mx-auto text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Platform Intelligence v4.2</div>
                                </div>
                                <div className="video-frame relative group overflow-hidden aspect-video">
                                    <div className="absolute inset-0 bg-mongodb-green/5 group-hover:bg-transparent transition-colors z-20 pointer-events-none" />
                                    {/* Scan Line Overlay */}
                                    <div className="absolute inset-0 pointer-events-none z-30 opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] animate-scanline" />
                                    <video
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        poster="thumbnail.jpg"
                                        className="w-full h-full object-cover"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    >
                                        <source src="/assets/demo.mp4" type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                    <div className="absolute inset-x-0 bottom-0 h-16 md:h-32 bg-gradient-to-t from-[#001E2B] to-transparent z-20" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Logo Marquee */}
            <div className="py-20 bg-white border-y border-mongodb-border-slate/20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-mongodb-slate-text/60">Engineered for industry leaders</span>
                </div>
                <div className="flex gap-20 animate-marquee items-center whitespace-nowrap">
                    {[1, 2, 3, 4, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex gap-20 items-center opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                            <div className="text-3xl font-black text-mongodb-deep-slate tracking-tighter">MONGODB</div>
                            <div className="text-3xl font-black text-mongodb-deep-slate tracking-tighter">STRIPE</div>
                            <div className="text-3xl font-black text-mongodb-deep-slate tracking-tighter">VERCEL</div>
                            <div className="text-3xl font-black text-mongodb-deep-slate tracking-tighter">LINEAR</div>
                            <div className="text-3xl font-black text-mongodb-deep-slate tracking-tighter">RAYCAST</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bento Grid Features */}
            <section id="features" className="py-16 md:py-24 lg:py-32 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
                    <div className="mb-16 md:mb-24">
                        <span className="text-mongodb-green-dark font-black tracking-widest uppercase text-[10px] mb-4 block">Core Infrastructure</span>
                        <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-mongodb-deep-slate tracking-tighter leading-tight">
                            Built for the next <br /> decade of sales.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 grid-rows-2 gap-6 h-[auto] md:h-[800px]">
                        {/* Hero Bento Card */}
                        <motion.div
                            {...fadeInUp}
                            className="md:col-span-4 md:row-span-1 bg-mongodb-light-slate/40 rounded-3xl md:rounded-[2.5rem] p-8 md:p-12 border border-mongodb-border-slate/40 relative overflow-hidden group border-b-mongodb-green/30"
                        >
                            <div className="relative z-10 w-full md:w-2/3">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-xl text-mongodb-green group-hover:scale-110 transition-transform">
                                    <MousePointer2 className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-mongodb-deep-slate mb-4 md:mb-6 tracking-tight">AI-Enhanced Visual Builder</h3>
                                <p className="text-base md:text-lg text-mongodb-slate-text font-medium leading-relaxed">
                                    Stop struggling with complex form builders. Our intuitive canvas lets you prototype, test, and deploy in minutes, not days.
                                </p>
                            </div>
                            <div className="hidden md:block absolute right-[-10%] bottom-[-10%] w-[400px] h-[300px] bg-white rounded-3xl border border-mongodb-border-slate shadow-2xl rotate-[-10deg] group-hover:rotate-0 transition-all duration-700 opacity-60 group-hover:opacity-100">
                                <div className="p-6">
                                    <div className="h-4 w-1/2 bg-mongodb-light-slate rounded mb-4" />
                                    <div className="h-10 w-full bg-mongodb-green/10 rounded-xl mb-4" />
                                    <div className="h-10 w-full bg-mongodb-light-slate rounded-xl" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Side Bento Card */}
                        <motion.div
                            {...fadeInUp}
                            transition={{ delay: 0.1 }}
                            className="md:col-span-2 md:row-span-1 bg-mongodb-deep-slate rounded-3xl md:rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl shadow-mongodb-deep-slate/20"
                        >
                            <div className="relative z-10">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-mongodb-green rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-xl text-mongodb-deep-slate group-hover:rotate-12 transition-transform">
                                    <Zap className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight">Instant Sync</h3>
                                <p className="text-white/60 font-medium tracking-tight text-sm md:text-base">
                                    Deliver leads to Slack, CRM, or Webhooks in &lt;50ms.
                                </p>
                            </div>
                            <div className="absolute bottom-[-20%] left-[-10%] w-[120%] h-1/2 bg-gradient-to-t from-mongodb-green/20 to-transparent blur-3xl" />
                        </motion.div>

                        {/* Bottom Bento Card 1 */}
                        <motion.div
                            {...fadeInUp}
                            transition={{ delay: 0.2 }}
                            className="md:col-span-2 md:row-span-1 bg-white border border-mongodb-border-slate p-12 rounded-[2.5rem] hover:bg-mongodb-light-slate/30 transition-colors group"
                        >
                            <div className="w-14 h-14 bg-mongodb-light-slate rounded-2xl flex items-center justify-center mb-8 group-hover:bg-mongodb-green group-hover:text-white transition-all">
                                <BarChart3 className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-black text-mongodb-deep-slate mb-4 tracking-tight">Precision Analytics</h3>
                            <p className="text-mongodb-slate-text font-medium text-sm leading-relaxed">
                                Deep behavioral insights focused on intent, conversion velocity, and drop-off patterns.
                            </p>
                        </motion.div>

                        {/* Bottom Bento Card 2 */}
                        <motion.div
                            {...fadeInUp}
                            transition={{ delay: 0.3 }}
                            className="md:col-span-2 md:row-span-1 bg-mongodb-green/5 border border-mongodb-green/10 p-12 rounded-[2.5rem] relative overflow-hidden group"
                        >
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-md text-mongodb-green-dark group-hover:scale-110 transition-transform">
                                <Shield className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-black text-mongodb-deep-slate mb-4 tracking-tight">Fortified Privacy</h3>
                            <p className="text-mongodb-slate-text font-medium text-sm leading-relaxed">
                                Managed encryption and global compliance layers built directly into every data entry point.
                            </p>
                        </motion.div>

                        {/* Bottom Bento Card 3 */}
                        <motion.div
                            {...fadeInUp}
                            transition={{ delay: 0.4 }}
                            className="md:col-span-2 md:row-span-1 bg-white border border-mongodb-border-slate p-12 rounded-[2.5rem] flex flex-col justify-between group overflow-hidden"
                        >
                            <div>
                                <h3 className="text-2xl font-black text-mongodb-deep-slate mb-4 tracking-tight">Global Scale</h3>
                                <p className="text-mongodb-slate-text font-medium text-sm leading-relaxed mb-6">
                                    Global CDN distribution for zero-latency forms anywhere.
                                </p>
                            </div>
                            <div className="flex -space-x-4 mt-auto">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-mongodb-light-slate flex items-center justify-center text-[10px] font-black group-hover:translate-y-[-5px] transition-transform" style={{ transitionDelay: `${i * 100}ms` }}>
                                        {i === 4 ? "+4k" : "USR"}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Ecosystem / Integration Section */}
            <section id="integration" className="py-16 md:py-24 lg:py-32 bg-mongodb-deep-slate overflow-hidden relative">
                <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] bg-mongodb-green/5 rounded-full blur-[120px]" />

                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <motion.div {...fadeInUp}>
                            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-tight mb-8">
                                Connect your <br /> <span className="text-mongodb-green">Intelligence.</span>
                            </h2>
                            <p className="text-lg lg:text-xl text-white/50 font-medium mb-12 leading-relaxed">
                                Lead Catcher doesn't just collect data—it activates it. Direct-to-app integrations ensure your sales team strikes while the iron is hot.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { icon: <Slack className="w-5 h-5" />, title: "Automated Slack Routing", desc: "Notify specific channels based on lead value." },
                                    { icon: <Database className="w-5 h-5" />, title: "CRM Sychronization", desc: "Native sync with Salesforce and HubSpot." },
                                    { icon: <LineChart className="w-5 h-5" />, title: "API-First Infrastructure", desc: "Custom webhooks for unlimited flexibility." }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ x: 10 }}
                                        className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-default group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-mongodb-green/10 flex items-center justify-center text-mongodb-green">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white tracking-tight mb-1">{item.title}</h4>
                                                <p className="text-sm text-white/40 font-medium">{item.desc}</p>
                                            </div>
                                            <ChevronRight className="ml-auto w-4 h-4 text-white/20 group-hover:text-mongodb-green" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                        >
                            <div className="relative z-10 bg-white/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 shadow-3xl">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                                        <span className="text-xs font-black uppercase tracking-widest text-mongodb-green">Live Feed</span>
                                        <div className="flex gap-1.5 font-mono text-[9px] text-white/30 tracking-tight">SYSTEM STATUS: OPTIMAL</div>
                                    </div>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-4 items-center">
                                            <div className="w-10 h-10 rounded-full bg-mongodb-green/20" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-2 w-1/3 bg-white/10 rounded" />
                                                <div className="h-2 w-full bg-white/5 rounded" />
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-mongodb-green/90 shadow-lg shadow-mongodb-green/20" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-mongodb-green/20 rounded-full blur-[150px] pointer-events-none" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Expansion / Benefits Section */}
            <section className="py-16 md:py-24 lg:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative order-2 lg:order-1"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000"
                                className="rounded-[3rem] shadow-3xl border border-mongodb-border-slate/40 grayscale-[40%] hover:grayscale-0 transition-all duration-700"
                                alt="Data Visualization"
                            />
                            <div className="absolute bottom-[-10%] right-[-10%] p-10 bg-mongodb-deep-slate rounded-[2.5rem] shadow-2xl text-white hidden md:block">
                                <div className="text-5xl font-black mb-2 tracking-tighter">+84%</div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-mongodb-green">CTR Optimization</div>
                            </div>
                        </motion.div>

                        <motion.div {...fadeInUp} className="order-1 lg:order-2">
                            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-mongodb-deep-slate tracking-tighter leading-tight mb-8 md:mb-10">
                                Unmatched <br /> <span className="text-mongodb-green-dark underline decoration-mongodb-green/30 decoration-[8px] md:decoration-[12px] underline-offset-8">Precision.</span>
                            </h2>
                            <p className="text-lg lg:text-xl text-mongodb-slate-text font-medium leading-relaxed mb-10 md:mb-12">
                                Most lead systems are black boxes. We provide the surgical tools necessary to diagnose and optimize your entire acquisition ecosystem from day one.
                            </p>
                            <ul className="space-y-6">
                                {[
                                    "Zero-Javascript Fallbacks",
                                    "Staggered Lead Verification",
                                    "Proprietary Enrichment Engine",
                                    "Global Latency Optimization"
                                ].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        whileHover={{ x: 5 }}
                                        className="flex items-center gap-4 text-mongodb-deep-slate font-black tracking-tight"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-mongodb-green flex items-center justify-center shadow-lg shadow-mongodb-green/20">
                                            <CheckCircle2 className="w-5 h-5 text-mongodb-deep-slate" />
                                        </div>
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Conversion CTA */}
            <section className="py-16 bg-mongodb-light-slate/30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-mongodb-deep-slate rounded-[4rem] py-16 px-10 lg:py-20 lg:px-24 relative overflow-hidden text-center shadow-3xl"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-mongodb-green/20 via-transparent to-transparent opacity-50" />

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-white mb-8 md:mb-10 tracking-tighter leading-[1.1] md:leading-[0.9]">
                                Secure your <br /> advantage.
                            </h2>
                            <p className="text-lg lg:text-xl text-white/50 font-medium mb-12 md:mb-16 max-w-2xl mx-auto leading-relaxed">
                                Join 4,000+ agencies building high-frequency lead ecosystems. Instant deployment. Zero credit card.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
                                <Link href="/auth" className="w-full sm:w-auto">
                                    <Button className="w-full sm:w-auto bg-mongodb-green hover:bg-mongodb-green-dark text-mongodb-deep-slate font-black h-16 md:h-20 px-8 md:px-12 text-lg md:text-xl rounded-xl md:rounded-2xl shadow-2xl shadow-mongodb-green/20">
                                        Initialize Account
                                    </Button>
                                </Link>
                                <Button size="lg" variant="ghost" className="w-full sm:w-auto h-16 md:h-20 px-8 md:px-10 text-lg md:text-xl font-bold rounded-xl md:rounded-2xl text-white hover:bg-white/10 transition-all border border-white/10">
                                    Scale Inquiries
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#001E2B] pt-24 pb-12 md:pt-32 md:pb-16 border-t border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-mongodb-green/20 to-transparent" />

                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-20 mb-32"
                    >
                        <div className="col-span-2">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-10 h-10 bg-mongodb-green rounded-xl flex items-center justify-center shadow-lg shadow-mongodb-green/20">
                                    <Layout className="text-mongodb-deep-slate w-6 h-6" />
                                </div>
                                <span className="text-2xl font-black text-white tracking-tighter">Lead Catcher</span>
                            </div>
                            <p className="text-lg text-white/50 font-medium max-w-xs leading-relaxed">
                                Establishing the standard for high-performance lead acquisition.
                            </p>
                        </div>
                        {["Intelligence", "Ecosystem", "Expansion"].map((title, i) => (
                            <div key={i}>
                                <h4 className="font-black text-white/80 mb-8 uppercase text-[10px] tracking-[0.3em]">{title}</h4>
                                <ul className="space-y-4 text-sm text-white/40 font-bold">
                                    <li><a href="#" className="hover:text-mongodb-green transition-colors transition-all hover:translate-x-1 inline-block">Core API</a></li>
                                    <li><a href="#" className="hover:text-mongodb-green transition-colors transition-all hover:translate-x-1 inline-block">Global CDN</a></li>
                                    <li><a href="#" className="hover:text-mongodb-green transition-colors transition-all hover:translate-x-1 inline-block">SLA Console</a></li>
                                    <li><a href="#" className="hover:text-mongodb-green transition-colors transition-all hover:translate-x-1 inline-block">Trust Center</a></li>
                                </ul>
                            </div>
                        ))}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10"
                    >
                        <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-white/10">
                            <span>© 2024 SLASH EASY X MONGODB</span>
                            <span>ALL SYSTEMS OPERATIONAL</span>
                        </div>
                        <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-white/20">
                            <a href="#" className="hover:text-white transition-colors">Privacy Protcol</a>
                            <a href="#" className="hover:text-white transition-colors">Governance</a>
                        </div>
                    </motion.div>
                </div>
            </footer>

            <style>{`
                .video-frame {
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    border-radius: 0 0 12px 12px;
                    background: #0a1628;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                    display: flex;
                    width: max-content;
                }
                @keyframes scanline {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 100%; }
                }
                .animate-scanline {
                    animation: scanline 10s linear infinite;
                }
            `}</style>
        </div>
    );
}
