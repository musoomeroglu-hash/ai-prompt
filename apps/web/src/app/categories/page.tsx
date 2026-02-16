"use client";

import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import RadialOrbitalTimeline, { TimelineItem } from "@/components/radial-orbital-timeline";

const timelineData: TimelineItem[] = CATEGORIES.map(cat => ({
    id: cat.id,
    title: cat.title,
    icon: cat.icon,
    content: cat.content,
    category: cat.categoryType,
    date: cat.date,
    relatedIds: cat.relatedIds,
    status: cat.status,
    energy: cat.energy
}));

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
