import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, MailCheck, Layout, Zap, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    const mutation = useMutation({
        mutationFn: async (email: string) => {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to send reset link");
            }
            return res.json();
        },
        onSuccess: () => {
            setSubmitted(true);
            toast({
                title: "Email Sent",
                description: "Check your inbox for a password reset link.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(email);
    };

    return (
        <div className="min-h-screen flex bg-white font-sans selection:bg-mongodb-green/30">
            {/* Visual Section - Desktop */}
            <div className="hidden lg:flex w-1/2 bg-mongodb-deep-slate relative overflow-hidden flex-col justify-between p-16">
                <div className="absolute inset-0 z-0 scale-105 opacity-60">
                    <div className="absolute inset-0 bg-gradient-to-br from-mongodb-deep-slate/80 via-mongodb-deep-slate/40 to-transparent" />
                </div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-mongodb-green rounded-2xl flex items-center justify-center shadow-2xl shadow-mongodb-green/30 group-hover:rotate-12 transition-transform duration-500">
                            <Zap className="text-mongodb-deep-slate w-7 h-7 fill-current" />
                        </div>
                        <span className="text-3xl font-black text-white tracking-tighter">Lead Catcher</span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-8 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
                            Restore Your <span className="text-mongodb-green underline decoration-mongodb-green/30 decoration-8 underline-offset-8">Access</span>.
                        </h1>
                        <p className="mt-6 text-xl text-white/70 font-medium leading-relaxed">
                            Locked out? No problem. Reset your security credentials and get back to your lead intelligence hub in seconds.
                        </p>
                    </motion.div>
                </div>

                <div className="relative z-10 flex items-center gap-6 group cursor-default">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Agency Security Protocol Active
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
                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mongodb-green/10 border border-mongodb-green/20 text-[10px] font-black uppercase tracking-widest text-mongodb-green-dark mb-4">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Security Reset
                                    </div>
                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-mongodb-deep-slate tracking-tight">Recovery</h2>
                                    <p className="text-mongodb-slate-text font-medium text-lg leading-relaxed">
                                        Enter your email to receive an authorization link.
                                    </p>
                                </div>

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
                                    <Button
                                        type="submit"
                                        className="w-full h-14 rounded-2xl bg-mongodb-green text-mongodb-deep-slate font-black text-lg shadow-2xl shadow-mongodb-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3"
                                        disabled={mutation.isPending}
                                    >
                                        {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 fill-current" />}
                                        Send Authorization Link
                                    </Button>
                                </form>

                                <div className="pt-8 border-t border-mongodb-border-slate/20">
                                    <Link href="/auth">
                                        <span className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-mongodb-slate-text hover:text-mongodb-green-dark transition-all cursor-pointer">
                                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                            Back to Login
                                        </span>
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-8"
                            >
                                <div className="w-24 h-24 bg-mongodb-green/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner text-mongodb-green-dark border border-mongodb-green/20">
                                    <MailCheck className="h-12 w-12 text-mongodb-green-dark" />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black text-mongodb-deep-slate tracking-tight mb-4">Link Transmitted</h3>
                                    <p className="text-mongodb-slate-text font-medium text-lg leading-relaxed">
                                        We sent a reset link to <strong className="text-mongodb-deep-slate">{email}</strong>.
                                        Please check your secure inbox.
                                    </p>
                                </div>
                                <div className="pt-4 flex flex-col gap-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => mutation.mutate(email)}
                                        className="text-mongodb-green-dark hover:text-mongodb-green hover:bg-mongodb-green/5 font-black uppercase tracking-widest text-xs h-12 rounded-xl"
                                        disabled={mutation.isPending}
                                    >
                                        Resend Authorization
                                    </Button>
                                    <Link href="/auth" className="group inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-mongodb-slate-text hover:text-mongodb-green-dark transition-all">
                                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                        Return to Login
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
