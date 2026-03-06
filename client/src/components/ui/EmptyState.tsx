import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    title: string;
    description?: string;
    className?: string;
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
            <div className="w-[160px] md:w-[220px] aspect-square relative mb-6">
                <svg
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                >
                    {/* Background circles */}
                    <motion.circle
                        cx="100"
                        cy="100"
                        r="80"
                        stroke="#E0EEEC"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.circle
                        cx="100"
                        cy="100"
                        r="60"
                        stroke="#E0EEEC"
                        strokeWidth="1"
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Magnifying Glass Handle */}
                    <motion.rect
                        x="130"
                        y="130"
                        width="40"
                        height="8"
                        rx="4"
                        fill="#0D2B2B"
                        transform="rotate(45 130 130)"
                        animate={{ x: [0, 5, 0], y: [0, 5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Magnifying Glass Head */}
                    <motion.circle
                        cx="90"
                        cy="90"
                        r="45"
                        stroke="#0D2B2B"
                        strokeWidth="8"
                        fill="white"
                        animate={{
                            x: [0, 10, -5, 0],
                            y: [0, -5, 10, 0]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Inner lens effect */}
                    <motion.circle
                        cx="90"
                        cy="90"
                        r="35"
                        fill="#00A878"
                        fillOpacity="0.05"
                        animate={{
                            x: [0, 10, -5, 0],
                            y: [0, -5, 10, 0]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Search lines */}
                    <motion.path
                        d="M75 80H105"
                        stroke="#00A878"
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 3, repeat: Infinity, times: [0, 0.3, 0.7, 1] }}
                    />
                    <motion.path
                        d="M75 95H95"
                        stroke="#00A878"
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 3, delay: 0.5, repeat: Infinity, times: [0, 0.3, 0.7, 1] }}
                    />
                    <motion.path
                        d="M75 110H100"
                        stroke="#00A878"
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 3, delay: 1, repeat: Infinity, times: [0, 0.3, 0.7, 1] }}
                    />

                    {/* Floating particles */}
                    <motion.circle
                        cx="150"
                        cy="60"
                        r="4"
                        fill="#00A878"
                        animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.circle
                        cx="40"
                        cy="140"
                        r="3"
                        fill="#00A878"
                        animate={{ y: [0, -15, 0], opacity: [0, 0.7, 0] }}
                        transition={{ duration: 5, delay: 1, repeat: Infinity, ease: "easeInOut" }}
                    />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1A3535] mb-2">{title}</h3>
            {description && (
                <p className="text-[#6B8F8F] font-medium max-w-sm mx-auto">
                    {description}
                </p>
            )}
        </div>
    );
}
