"use client";

import { useRouter } from "next/navigation";
import {
    Code,
    FileText,
    Megaphone,
    GraduationCap,
    ChartBar,
    Sparkles
} from "lucide-react";
import RadialOrbitalTimeline, { TimelineItem } from "@/components/radial-orbital-timeline";

const timelineData: TimelineItem[] = [
    {
        id: "coding",
        title: "Coding",
        icon: Code,
        content: "Generate code snippets, debug help, and architecture advice. Perfect for developers of all levels.",
        category: "Development",
        date: "2024",
        relatedIds: ["analysis", "prompt-engineering"],
        status: "completed",
        energy: 95,
    },
    {
        id: "writing",
        title: "Writing",
        icon: FileText,
        content: "Content creation, editing, and creative storytelling. Enhance your narratives and blog posts.",
        category: "Creative",
        date: "2024",
        relatedIds: ["marketing", "education"],
        status: "completed",
        energy: 88,
    },
    {
        id: "marketing",
        title: "Marketing",
        icon: Megaphone,
        content: "Campaigns, copywriting, and social media strategies. Boost your brand's reach and engagement.",
        category: "Business",
        date: "2024",
        relatedIds: ["writing", "analysis"],
        status: "completed",
        energy: 92,
    },
    {
        id: "education",
        title: "Education",
        icon: GraduationCap,
        content: "Lesson plans, explanations, and study guides. Simplify complex topics for students.",
        category: "Academic",
        date: "2024",
        relatedIds: ["writing", "analysis"],
        status: "in-progress",
        energy: 75,
    },
    {
        id: "analysis",
        title: "Analysis",
        icon: ChartBar,
        content: "Data interpretation, research, and insights. Turn raw data into actionable intelligence.",
        category: "Business",
        date: "2024",
        relatedIds: ["coding", "marketing"],
        status: "in-progress",
        energy: 82,
    },
    {
        id: "prompt-engineering",
        title: "Prompt Engineering",
        icon: Sparkles,
        content: "Optimize and refine your existing prompts. Get the best possible results from AI models.",
        category: "Technical",
        date: "2024",
        relatedIds: ["coding", "writing"],
        status: "completed",
        energy: 98,
    },
];

export default function CategoriesPage() {
    const router = useRouter();

    const handleCategorySelect = (categoryId: string) => {
        // Save to localStorage
        if (typeof window !== "undefined") {
            localStorage.setItem("selectedCategory", categoryId);
        }
        // Redirect to dashboard
        setTimeout(() => {
            router.push("/");
        }, 800);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
            {/* Background Ambience similar to dashboard */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-50">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary/20 rounded-full blur-[100px]" />
            </div>

            <RadialOrbitalTimeline
                timelineData={timelineData}
                onSelectCategory={handleCategorySelect}
            />
        </div>
    );
}
