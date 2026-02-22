import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
}

export const Card = ({ className, hoverEffect = true, children, ...props }: CardProps) => {
    return (
        <div
            className={cn(
                "bg-white dark:bg-medical-teal-deep rounded-2xl border border-border p-6 shadow-sm transition-all",
                hoverEffect && "hover:shadow-lg hover:-translate-y-1 hover:border-medical-teal/30",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("mb-4 flex flex-col space-y-1.5", className)} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("text-xl font-bold leading-none tracking-tight text-medical-teal", className)} {...props}>
        {children}
    </h3>
);

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("text-sm text-muted", className)} {...props}>
        {children}
    </p>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("", className)} {...props}>
        {children}
    </div>
);
