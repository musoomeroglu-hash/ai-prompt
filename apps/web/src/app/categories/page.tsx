"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Code,
    FileText,
    Megaphone,
    GraduationCap,
    ChartBar,
    Sparkles
} from "lucide-react";
import { CategoryCard } from "@/components/ui/category-card";

const categories = [
    {
        id: "coding",
        title: "Coding",
        icon: Code,
        description: "Generate code snippets, debug help, and architecture advice",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        id: "writing",
        title: "Writing",
        icon: FileText,
        description: "Content creation, editing, and creative storytelling",
        gradient: "from-purple-500 to-pink-500",
    },
    {
        id: "marketing",
        title: "Marketing",
        icon: Megaphone,
        description: "Campaigns, copywriting, and social media strategies",
        gradient: "from-pink-500 to-rose-500",
    },
    {
        id: "education",
        title: "Education",
        icon: GraduationCap,
        description: "Lesson plans, explanations, and study guides",
        gradient: "from-green-500 to-emerald-500",
    },
    {
        id: "analysis",
        title: "Analysis",
        icon: ChartBar,
        description: "Data interpretation, research, and insights",
        gradient: "from-orange-500 to-yellow-500",
    },
    {
        id: "prompt-engineering",
        title: "Prompt Engineering",
        icon: Sparkles,
        description: "Optimize and refine your existing prompts",
        gradient: "from-indigo-500 to-violet-500",
    },
];

export default function CategoriesPage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
        // Save to localStorage
        if (typeof window !== "undefined") {
            localStorage.setItem("selectedCategory", categoryId);
        }
        // Redirect to dashboard
        setTimeout(() => {
            router.push("/");
        }, 400);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-black flex items-center justify-center p-8 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl w-full">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
                        What do you{" "}
                        <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                            need?
                        </span>
                    </h1>
                    <p className="text-text-secondary text-xl max-w-2xl mx-auto font-light">
                        Choose a category to get started with AI-powered prompts tailored to your specific goals.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            {...category}
                            isSelected={selectedCategory === category.id}
                            onClick={() => handleCategorySelect(category.id)}
                        />
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center mt-12">
                    <p className="text-text-muted text-sm">
                        You can change this anytime from the main dashboard settings.
                    </p>
                </div>
            </div>
        </div>
    );
}
