"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
        const variants = {
            primary: "bg-medical-teal text-white hover:bg-medical-teal/90 shadow-md shadow-medical-teal/20",
            secondary: "bg-medical-teal-soft text-medical-teal-deep hover:bg-medical-teal-soft/80",
            outline: "border-2 border-medical-teal text-medical-teal hover:bg-medical-teal/10",
            danger: "bg-emergency-red text-white hover:bg-emergency-red/90 shadow-md shadow-emergency-red/20",
            ghost: "hover:bg-medical-teal/10 text-medical-teal",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-6 py-3 text-base",
            lg: "px-8 py-4 text-lg font-bold",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "relative inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : null}
                <>{children}</>
            </motion.button>
        );
    }
);

Button.displayName = "Button";
