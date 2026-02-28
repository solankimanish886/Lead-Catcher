import React, { useState, useEffect } from "react";
import {
    X,
    Code2,
    Server,
    Database,
    CreditCard,
    ChevronUp,
    ChevronDown,
    Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TechStackModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => setIsOpen(!isOpen);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const categories = [
        {
            title: "FRONTEND",
            icon: <Code2 className="w-4 h-4 text-[#00ff7f]" />,
            tags: ["React 18", "TypeScript", "Vite", "TailwindCSS", "React Query", "Radix UI", "Wouter", "Framer Motion"],
        },
        {
            title: "BACKEND",
            icon: <Server className="w-4 h-4 text-[#00ff7f]" />,
            tags: ["Node.js", "Express", "Passport.js", "WebSockets (ws)"],
        },
        {
            title: "DATABASE",
            icon: <Database className="w-4 h-4 text-[#00ff7f]" />,
            tags: ["MongoDB", "Mongoose"],
        },
        {
            title: "PAYMENTS",
            icon: <CreditCard className="w-4 h-4 text-[#00ff7f]" />,
            tags: ["Stripe"],
        },
    ];

    return (
        <>
            {/* Bottom Sticky Bar Trigger */}
            <div
                className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-2.5 bg-[#0d1f2d] border border-[rgba(0,255,127,0.15)] rounded-full cursor-pointer shadow-lg hover:border-[rgba(0,255,127,0.3)] transition-all group"
                onClick={toggleModal}
            >
                <div className="w-2 h-2 rounded-full bg-[#00ff7f] animate-pulse" />
                <span className="text-sm font-medium text-white/90">Built by Slash Easy</span>
                {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                ) : (
                    <ChevronUp className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[51]"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="fixed bottom-20 right-6 z-[52] w-[420px] max-w-[calc(100vw-48px)] bg-[#0d1f2d] border border-[rgba(0,255,127,0.15)] rounded-[16px] shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-white/60">
                                        <Terminal className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white tracking-tight">Tech Stack</h2>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 space-y-7 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {categories.map((cat, idx) => (
                                    <div key={idx} className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            {cat.icon}
                                            <span className="text-[10px] font-bold tracking-[0.15em] text-white/45 uppercase whitespace-nowrap">
                                                {cat.title}
                                            </span>
                                            <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {cat.tags.map((tag, tIdx) => (
                                                <div
                                                    key={tIdx}
                                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-white/[0.06] border border-white/[0.12] rounded-full hover:border-[rgba(0,255,127,0.4)] transition-all cursor-default select-none shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                                                >
                                                    {tag}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center mt-auto">
                                <p className="text-[11px] text-white/35 font-medium tracking-wide">
                                    Made with ❤️ by <span className="text-[#00ff7f] font-bold">SlashEasy</span>
                                </p>
                                <p className="text-[10px] text-white/25 mt-1">
                                    Developer: <span className="hover:text-white/40 transition-colors">Solanki Manish</span>
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 127, 0.2);
        }
      `}} />
        </>
    );
};

export default TechStackModal;
