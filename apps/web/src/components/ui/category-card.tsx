"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface CategoryCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  isSelected?: boolean;
  onClick: () => void;
}

export function CategoryCard({
  title,
  description,
  icon: Icon,
  gradient,
  isSelected,
  onClick,
}: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative group cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300
        ${isSelected
          ? "border-accent-primary bg-background-secondary shadow-[0_0_30px_rgba(99,102,241,0.3)]"
          : "border-white/5 bg-background-tertiary hover:border-accent-primary/50 hover:bg-background-secondary hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
        }
      `}
    >
      {/* Glow Effect */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${gradient}`}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Icon Container */}
        <div className={`
          w-14 h-14 rounded-xl mb-5 flex items-center justify-center
          bg-gradient-to-br ${gradient} shadow-lg
        `}>
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-4 flex-grow">
          {description}
        </p>

        {/* Selection Indicator */}
        <div className={`
          flex items-center gap-2 text-sm font-medium transition-colors
          ${isSelected ? "text-accent-primary" : "text-text-muted group-hover:text-white"}
        `}>
          <span>Select Category</span>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${isSelected || "group-hover:translate-x-1"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>

      {/* Selected Stripe */}
      {isSelected && (
        <motion.div
          layoutId="selectedStripe"
          className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-b-2xl"
        />
      )}
    </motion.div>
  );
}
