import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Layout, ArrowLeft, ShieldCheck, Zap, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const { login, register, isLoggingIn, isRegistering, user } = useAuth();
  const [, setLocation] = useLocation();

  const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia",
  ];

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-mongodb-green/30">
      {/* Visual Section - Visible on desktop */}
      <div className="hidden lg:flex w-1/2 bg-mongodb-deep-slate relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0 z-0 scale-105 opacity-60">
          <img
            src="/brain/68e2bbd6-81e4-42a4-ad04-167152fb9cfe/auth_visual_section_1772260665727.png"
            alt="Lead Catcher Visual Intelligence"
            className="w-full h-full object-cover blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-mongodb-deep-slate/80 via-mongodb-deep-slate/40 to-transparent" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10 group">
            <div className="w-12 h-12 bg-mongodb-green rounded-2xl flex items-center justify-center shadow-2xl shadow-mongodb-green/30 group-hover:rotate-12 transition-transform duration-500">
              <Zap className="text-mongodb-deep-slate w-7 h-7 fill-current" />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter">Lead Catcher</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Capture <span className="text-mongodb-green underline decoration-mongodb-green/30 decoration-8 underline-offset-8">Intelligence</span> Faster.
            </h1>
            <p className="mt-6 text-xl text-white/70 font-medium leading-relaxed">
              The only platform designed to turn anonymous visitors into high-value executive leads with zero latency.
            </p>
          </motion.div>

          <div className="space-y-4 pt-10 border-t border-white/10">
            {[
              "Real-time Data Enrichment",
              "Advanced Lead Distribution",
              "High-Conversion Capture Modules"
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 text-white/90 font-bold"
              >
                <div className="w-6 h-6 rounded-lg bg-mongodb-green/20 flex items-center justify-center text-mongodb-green">
                  <Check className="w-4 h-4" />
                </div>
                {feature}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 group cursor-default">
          <div className="flex -space-x-4">
            {avatars.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`User ${i + 1}`}
                className="w-10 h-10 rounded-full border-2 border-[#0d1f2d] bg-white/10 object-cover shadow-lg transition-transform group-hover:scale-110"
                style={{ transitionDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Trusted by 2,000+ Agencies
          </span>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-mongodb-light-slate/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mongodb-green/10 border border-mongodb-green/20 text-[10px] font-black uppercase tracking-widest text-mongodb-green-dark mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure Sign In
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-mongodb-deep-slate tracking-tight">Welcome Back</h2>
            <p className="text-mongodb-slate-text font-medium text-lg lg:text-xl leading-relaxed">
              Login to access your lead dashboard.
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-10 bg-white/50 backdrop-blur-sm border border-mongodb-border-slate/40 p-1.5 rounded-2xl h-14">
              <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-mongodb-deep-slate data-[state=active]:text-white data-[state=active]:shadow-xl font-black text-xs uppercase tracking-widest transition-all">Login</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl data-[state=active]:bg-mongodb-deep-slate data-[state=active]:text-white data-[state=active]:shadow-xl font-black text-xs uppercase tracking-widest transition-all">Sign Up</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="login">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoginForm onSubmit={login} isLoading={isLoggingIn} />
                </motion.div>
              </TabsContent>

              <TabsContent value="register">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RegisterForm onSubmit={register} isLoading={isRegistering} />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          <div className="pt-8 border-t border-mongodb-border-slate/20 flex justify-center lg:justify-start">
            <Link href="/" className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-mongodb-slate-text hover:text-mongodb-green-dark transition-all">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, isLoading }: { onSubmit: any, isLoading: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 group">
        <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-mongodb-slate-text px-1 group-focus-within:text-mongodb-green-dark transition-colors">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-14 rounded-2xl border-mongodb-border-slate/60 focus:ring-4 focus:ring-mongodb-green/10 font-bold transition-all bg-white"
        />
      </div>
      <div className="space-y-2 group">
        <Label htmlFor="password" dir="auto" className="text-[11px] font-black uppercase tracking-widest text-mongodb-slate-text px-1 group-focus-within:text-mongodb-green-dark transition-colors">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-14 rounded-2xl border-mongodb-border-slate/60 focus:ring-4 focus:ring-mongodb-green/10 font-bold transition-all bg-white"
        />
        <div className="flex justify-end mt-1 px-1">
          <Link href="/forgot-password">
            <span className="text-sm text-[#00ff7f] hover:underline font-bold transition-colors cursor-pointer">
              Forgot Password?
            </span>
          </Link>
        </div>
      </div>
      <Button
        type="submit"
        className="w-full h-14 rounded-2xl bg-mongodb-green text-mongodb-deep-slate font-black text-lg shadow-2xl shadow-mongodb-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 fill-current" />}
        Login
      </Button>
    </form>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: any, isLoading: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agencyName, setAgencyName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, password, agencyName });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 group">
          <Label htmlFor="reg-name" className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text px-1 group-focus-within:text-mongodb-green-dark transition-colors">Full Name</Label>
          <Input
            id="reg-name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 rounded-xl border-mongodb-border-slate/60 focus:ring-4 focus:ring-mongodb-green/10 font-bold transition-all bg-white"
          />
        </div>
        <div className="space-y-2 group">
          <Label htmlFor="reg-agency" className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text px-1 group-focus-within:text-mongodb-green-dark transition-colors">Agency Name</Label>
          <Input
            id="reg-agency"
            placeholder="Acme Growth"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            required
            className="h-12 rounded-xl border-mongodb-border-slate/60 focus:ring-4 focus:ring-mongodb-green/10 font-bold transition-all bg-white"
          />
        </div>
      </div>
      <div className="space-y-2 group">
        <Label htmlFor="reg-email" className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text px-1 group-focus-within:text-mongodb-green-dark transition-colors">Email Address</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="primary@agency.xyz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 rounded-xl border-mongodb-border-slate/60 focus:ring-4 focus:ring-mongodb-green/10 font-bold transition-all bg-white"
        />
      </div>
      <div className="space-y-2 group">
        <Label htmlFor="reg-password" dir="auto" className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text px-1 group-focus-within:text-mongodb-green-dark transition-colors">Password</Label>
        <Input
          id="reg-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="h-12 rounded-xl border-mongodb-border-slate/60 focus:ring-4 focus:ring-mongodb-green/10 font-bold transition-all bg-white"
        />
      </div>
      <Button
        type="submit"
        className="w-full h-14 rounded-2xl bg-mongodb-green text-mongodb-deep-slate font-black text-lg shadow-2xl shadow-mongodb-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3 mt-4"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
        Create Account
      </Button>
    </form>
  );
}
