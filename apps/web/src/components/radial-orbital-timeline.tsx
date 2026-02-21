"use client";
import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TimelineItem {
    id: string;
    title: string;
    date: string;
    content: string;
    category: string;
    icon: LucideIcon;
    relatedIds: string[];
    status: "completed" | "in-progress" | "pending";
    energy: number;
}

interface RadialOrbitalTimelineProps {
    timelineData: TimelineItem[];
    onSelectCategory: (categoryId: string) => void;
}

export default function RadialOrbitalTimeline({
    timelineData,
    onSelectCategory
}: RadialOrbitalTimelineProps) {
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
        {}
    );
    const [viewMode, setViewMode] = useState<"orbital">("orbital");
    const [rotationAngle, setRotationAngle] = useState<number>(0);
    const [autoRotate, setAutoRotate] = useState<boolean>(true);
    const [pulseEffect, setPulseEffect] = useState<Record<string, boolean>>({});
    const [centerOffset, setCenterOffset] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const orbitRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === containerRef.current || e.target === orbitRef.current) {
            setExpandedItems({});
            setActiveNodeId(null);
            setPulseEffect({});
            setAutoRotate(true);
        }
    };

    const toggleItem = (id: string) => {
        setExpandedItems((prev) => {
            const newState = { ...prev };
            Object.keys(newState).forEach((key) => {
                if (key !== id) {
                    newState[key] = false;
                }
            });

            newState[id] = !prev[id];

            if (!prev[id]) {
                setActiveNodeId(id);
                setAutoRotate(false);

                const relatedItems = getRelatedItems(id);
                const newPulseEffect: Record<string, boolean> = {};
                relatedItems.forEach((relId) => {
                    newPulseEffect[relId] = true;
                });
                setPulseEffect(newPulseEffect);

                centerViewOnNode(id);
            } else {
                setActiveNodeId(null);
                setAutoRotate(true);
                setPulseEffect({});
            }

            return newState;
        });
    };

    useEffect(() => {
        let rotationTimer: NodeJS.Timeout;

        if (autoRotate && viewMode === "orbital") {
            rotationTimer = setInterval(() => {
                setRotationAngle((prev) => {
                    const newAngle = (prev + 0.3) % 360;
                    return Number(newAngle.toFixed(3));
                });
            }, 50);
        }

        return () => {
            if (rotationTimer) {
                clearInterval(rotationTimer);
            }
        };
    }, [autoRotate, viewMode]);

    const centerViewOnNode = (nodeId: string) => {
        if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

        const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
        const totalNodes = timelineData.length;
        const targetAngle = (nodeIndex / totalNodes) * 360;

        setRotationAngle(270 - targetAngle);
    };

    const calculateNodePosition = (index: number, total: number) => {
        const angle = ((index / total) * 360 + rotationAngle) % 360;
        const radius = 250; // Increased radius for better spacing
        const radian = (angle * Math.PI) / 180;

        const x = radius * Math.cos(radian) + centerOffset.x;
        const y = radius * Math.sin(radian) + centerOffset.y;

        const zIndex = Math.round(100 + 50 * Math.cos(radian));
        const opacity = Math.max(
            0.4,
            Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
        );

        return { x, y, angle, zIndex, opacity };
    };

    const getRelatedItems = (itemId: string): string[] => {
        const currentItem = timelineData.find((item) => item.id === itemId);
        return currentItem ? currentItem.relatedIds : [];
    };

    const isRelatedToActive = (itemId: string): boolean => {
        if (!activeNodeId) return false;
        const relatedItems = getRelatedItems(activeNodeId);
        return relatedItems.includes(itemId);
    };

    const getStatusStyles = (status: TimelineItem["status"]): string => {
        switch (status) {
            case "completed":
                return "text-green-400 border-green-400 bg-green-400/10";
            case "in-progress":
                return "text-accent-primary border-accent-primary bg-accent-primary/10";
            case "pending":
                return "text-text-muted border-white/20 bg-white/5";
            default:
                return "text-text-muted border-white/20 bg-white/5";
        }
    };

    return (
        <div
            className="w-full h-screen flex flex-col items-center justify-center bg-transparent overflow-hidden"
            ref={containerRef}
            onClick={handleContainerClick}
        >
            <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
                <div
                    className="absolute w-full h-full flex items-center justify-center pointer-events-none md:pointer-events-auto"
                    ref={orbitRef}
                    style={{
                        perspective: "1000px",
                        transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
                    }}
                >
                    {/* Central Pulsing Core */}
                    <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-accent-primary via-accent-secondary to-accent-pink animate-pulse flex items-center justify-center z-10 shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                        <div className="absolute w-32 h-32 rounded-full border border-accent-primary/30 animate-ping opacity-70"></div>
                        <div
                            className="absolute w-40 h-40 rounded-full border border-accent-secondary/20 animate-ping opacity-50"
                            style={{ animationDelay: "0.5s" }}
                        ></div>
                        <div className="flex flex-col items-center justify-center text-center">
                            <Zap className="w-8 h-8 text-white fill-white" />
                            <span className="text-[10px] text-white font-bold mt-1 tracking-widest">SELECT</span>
                        </div>
                    </div>

                    <div className="absolute w-[500px] h-[500px] rounded-full border border-white/5 border-dashed animate-[spin_60s_linear_infinite]"></div>
                    <div className="absolute w-[350px] h-[350px] rounded-full border border-white/10"></div>

                    {timelineData.map((item, index) => {
                        const position = calculateNodePosition(index, timelineData.length);
                        const isExpanded = expandedItems[item.id];
                        const isRelated = isRelatedToActive(item.id);
                        const isPulsing = pulseEffect[item.id];
                        const Icon = item.icon;

                        const nodeStyle = {
                            transform: `translate(${position.x}px, ${position.y}px)`,
                            zIndex: isExpanded ? 200 : position.zIndex,
                            opacity: isExpanded ? 1 : position.opacity,
                        };

                        return (
                            <div
                                key={item.id}
                                ref={(el) => { nodeRefs.current[item.id] = el; }}
                                className="absolute transition-all duration-700 cursor-pointer pointer-events-auto"
                                style={nodeStyle}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(item.id);
                                }}
                            >
                                <div
                                    className={`absolute rounded-full -inset-1 ${isPulsing ? "animate-pulse duration-1000" : ""
                                        }`}
                                    style={{
                                        background: `radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0) 70%)`,
                                        width: `${item.energy * 0.5 + 60}px`,
                                        height: `${item.energy * 0.5 + 60}px`,
                                        left: `-${(item.energy * 0.5 + 60 - 40) / 2}px`,
                                        top: `-${(item.energy * 0.5 + 60 - 40) / 2}px`,
                                    }}
                                ></div>

                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 transform shadow-lg",
                                        isExpanded
                                            ? "bg-background-secondary border-accent-primary scale-125 shadow-accent-primary/50 text-white"
                                            : isRelated
                                                ? "bg-background-tertiary border-accent-secondary animate-pulse text-white"
                                                : "bg-black/80 border-white/20 hover:border-accent-primary/50 text-white/70 hover:text-white"
                                    )}
                                >
                                    <Icon size={20} />
                                </div>

                                <div
                                    className={cn(
                                        "absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10",
                                        isExpanded ? "text-accent-primary scale-110 border-accent-primary/30" : "text-white/60"
                                    )}
                                >
                                    {item.title}
                                </div>

                                {isExpanded && (
                                    <Card className="absolute top-24 left-1/2 -translate-x-1/2 w-72 bg-background-secondary/95 backdrop-blur-xl border-accent-primary/30 shadow-2xl shadow-black/50 overflow-hidden z-[200]">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary to-accent-secondary" />
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6 bg-accent-primary/50"></div>

                                        <CardHeader className="pb-2 pt-4 px-5">
                                            <div className="flex justify-between items-center mb-1">
                                                <Badge
                                                    variant="outline"
                                                    className={cn("px-2 py-0.5 text-[10px] uppercase border", getStatusStyles(item.status))}
                                                >
                                                    {item.status === "completed" ? "Available" : "Coming Soon"}
                                                </Badge>
                                                <span className="text-[10px] font-mono text-white/40">
                                                    ID: {item.id}
                                                </span>
                                            </div>
                                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                                {item.title}
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="text-xs text-text-secondary px-5 pb-5 space-y-4">
                                            <p className="leading-relaxed">{item.content}</p>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-text-muted">
                                                    <span className="flex items-center gap-1">
                                                        <Zap size={10} className="text-yellow-400" />
                                                        Popularity
                                                    </span>
                                                    <span className="font-mono text-white">{item.energy}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-accent-primary to-accent-pink"
                                                        style={{ width: `${item.energy}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <Button
                                                className="w-full bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-secondary hover:to-accent-primary text-white border-none shadow-lg shadow-accent-primary/20 transition-all duration-300 mt-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectCategory(item.id);
                                                }}
                                            >
                                                Select Project
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
