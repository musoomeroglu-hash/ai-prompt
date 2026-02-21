import {
    Code,
    FileText,
    Megaphone,
    GraduationCap,
    ChartBar,
    Sparkles,
    type LucideIcon
} from "lucide-react";

export interface Category {
    id: string;
    title: string;
    icon: LucideIcon;
    description: string;
    content: string; // Extended description for timeline
    gradient: string;
    categoryType: string; // "Development", "Creative", etc.
    date: string;
    relatedIds: string[];
    status: "completed" | "in-progress" | "pending";
    energy: number;
}

export const CATEGORIES: Category[] = [
    {
        id: "coding",
        title: "Coding",
        icon: Code,
        description: "Generate code snippets, debug help, and architecture advice",
        content: "Generate code snippets, debug help, and architecture advice. Perfect for developers of all levels.",
        gradient: "from-blue-500 to-cyan-500",
        categoryType: "Development",
        date: "2024",
        relatedIds: ["analysis", "prompt-engineering"],
        status: "completed",
        energy: 95,
    },
    {
        id: "writing",
        title: "Writing",
        icon: FileText,
        description: "Content creation, editing, and creative storytelling",
        content: "Content creation, editing, and creative storytelling. Enhance your narratives and blog posts.",
        gradient: "from-purple-500 to-pink-500",
        categoryType: "Creative",
        date: "2024",
        relatedIds: ["marketing", "education"],
        status: "completed",
        energy: 88,
    },
    {
        id: "marketing",
        title: "Marketing",
        icon: Megaphone,
        description: "Campaigns, copywriting, and social media strategies",
        content: "Campaigns, copywriting, and social media strategies. Boost your brand's reach and engagement.",
        gradient: "from-pink-500 to-rose-500",
        categoryType: "Business",
        date: "2024",
        relatedIds: ["writing", "analysis"],
        status: "completed",
        energy: 92,
    },
    {
        id: "education",
        title: "Education",
        icon: GraduationCap,
        description: "Lesson plans, explanations, and study guides",
        content: "Lesson plans, explanations, and study guides. Simplify complex topics for students.",
        gradient: "from-green-500 to-emerald-500",
        categoryType: "Academic",
        date: "2024",
        relatedIds: ["writing", "analysis"],
        status: "in-progress",
        energy: 75,
    },
    {
        id: "analysis",
        title: "Analysis",
        icon: ChartBar,
        description: "Data interpretation, research, and insights",
        content: "Data interpretation, research, and insights. Turn raw data into actionable intelligence.",
        gradient: "from-purple-600 to-pink-600",
        categoryType: "Business",
        date: "2024",
        relatedIds: ["coding", "marketing"],
        status: "in-progress",
        energy: 82,
    },
    {
        id: "prompt-engineering",
        title: "Prompt Engineering",
        icon: Sparkles,
        description: "Optimize and refine your existing prompts",
        content: "Optimize and refine your existing prompts. Get the best possible results from AI models.",
        gradient: "from-indigo-500 to-violet-500",
        categoryType: "Technical",
        date: "2024",
        relatedIds: ["coding", "writing"],
        status: "completed",
        energy: 98,
    },
];
