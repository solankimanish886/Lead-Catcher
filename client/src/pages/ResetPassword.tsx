import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Zap, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function ResetPassword() {
    const [, setLocation] = useLocation();
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { toast } = useToast();

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to reset password");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Password reset successfully! Please login with your new password.",
            });
            setLocation("/auth");
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
        if (password !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match.",
                variant: "destructive",
            });
            return;
        }
        if (!token) {
            toast({
                title: "Error",
                description: "Invalid or missing token.",
                variant: "destructive",
            });
            return;
        }
        mutation.mutate({ token, newPassword: password });
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-mongodb-light-slate flex items-center justify-center p-4">
                <div className="p-12 bg-white rounded-[2.5rem] shadow-2xl border border-mongodb-border-slate/40 text-center max-w-md">
                    <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-red-500 border border-red-100">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-mongodb-deep-slate mb-4">Invalid Key</h2>
                    <p className="text-mongodb-slate-text font-medium mb-8">This password reset link is invalid or has expired for security reasons.</p>
                    <Button onClick={() => setLocation("/auth")} className="w-full h-14 bg-mongodb-deep-slate text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all">
                        Return to Login
                    </Button>
                </div>
            </div>
        );
    }

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
                            Authorize New <span className="text-mongodb-green underline decoration-mongodb-green/30 decoration-8 underline-offset-8">Key</span>.
                        </h1>
                        <p className="mt-6 text-xl text-white/70 font-medium leading-relaxed">
                            Create a strong, unique password to protect your agency's lead data and account intelligence.
                        </p>
                    </motion.div>
                </div>

                <div className="relative z-10 flex items-center gap-6 group cursor-default">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        End-to-End Encryption Enabled
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
                            Secure Update
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-mongodb-deep-slate tracking-tight">Reset Key</h2>
                        <p className="text-mongodb-slate-text font-medium text-lg leading-relaxed">
                            Update your security credentials.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 group">
                            <Label htmlFor="password" title="NEW PASSWORD" className="text-[11px] font-black uppercase tracking-widest text-mongodb-slate-text px-1 group-focus-within:text-mongodb-green-dark transition-colors">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="h-14 rounded-2xl border-mongodb-border-slate/60 focus:ring-4 focus:ring-mongodb-green/10 font-bold transition-all bg-white"
                            />
                        </div>

                        <div className="space-y-2 group">
                            <Label htmlFor="confirm-password" title="CONFIRM PASSWORD" className="text-[11px] font-black uppercase tracking-widest text-mongodb-slate-text px-1 group-focus-within:text-mongodb-green-dark transition-colors">Confirm Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            Update Security Key
                        </Button>
                    </form>

                    <div className="pt-8 border-t border-mongodb-border-slate/20">
                        <Link href="/auth">
                            <span className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-mongodb-slate-text hover:text-mongodb-green-dark transition-all cursor-pointer">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Return to Login
                            </span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
