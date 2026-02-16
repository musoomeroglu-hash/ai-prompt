"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { EyeBall, Pupil } from "@/components/ui/eye-components";
import { EmailAuthForm } from "./email-auth-form";

export function InteractiveLogin({ onLoginSuccess, onGoogleSignIn, onSignUp }: { onLoginSuccess: () => void; onGoogleSignIn?: () => void; onSignUp?: () => void }) {
    const [isTyping, setIsTyping] = useState(false);

    // ... (character animation state and refs remain) ...
    const [mouseX, setMouseX] = useState<number>(0);
    const [mouseY, setMouseY] = useState<number>(0);
    const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
    const [isBlackBlinking, setIsBlackBlinking] = useState(false);
    const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
    const [isPurplePeeking, setIsPurplePeeking] = useState(false);
    const purpleRef = useRef<HTMLDivElement>(null);
    const blackRef = useRef<HTMLDivElement>(null);
    const yellowRef = useRef<HTMLDivElement>(null);
    const orangeRef = useRef<HTMLDivElement>(null);

    // ... (keep existing effects for mouse move and blinking) ...

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMouseX(e.clientX);
            setMouseY(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Blinking effect for purple character
    useEffect(() => {
        const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

        const scheduleBlink = () => {
            const blinkTimeout = setTimeout(() => {
                setIsPurpleBlinking(true);
                setTimeout(() => {
                    setIsPurpleBlinking(false);
                    scheduleBlink();
                }, 150);
            }, getRandomBlinkInterval());

            return blinkTimeout;
        };

        const timeout = scheduleBlink();
        return () => clearTimeout(timeout);
    }, []);

    // Blinking effect for black character
    useEffect(() => {
        const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

        const scheduleBlink = () => {
            const blinkTimeout = setTimeout(() => {
                setIsBlackBlinking(true);
                setTimeout(() => {
                    setIsBlackBlinking(false);
                    scheduleBlink();
                }, 150);
            }, getRandomBlinkInterval());

            return blinkTimeout;
        };

        const timeout = scheduleBlink();
        return () => clearTimeout(timeout);
    }, []);

    // Looking at each other animation when typing starts
    useEffect(() => {
        if (isTyping) {
            setIsLookingAtEachOther(true);
            const timer = setTimeout(() => {
                setIsLookingAtEachOther(false);
            }, 800);
            return () => clearTimeout(timer);
        } else {
            setIsLookingAtEachOther(false);
        }
    }, [isTyping]);

    // Purple sneaky peeking animation - SIMPLIFIED since we don't have password state access
    useEffect(() => {
        if (isTyping) {
            const schedulePeek = () => {
                const peekInterval = setTimeout(() => {
                    setIsPurplePeeking(true);
                    setTimeout(() => {
                        setIsPurplePeeking(false);
                    }, 800);
                }, Math.random() * 3000 + 2000);
                return peekInterval;
            };

            const firstPeek = schedulePeek();
            return () => clearTimeout(firstPeek);
        } else {
            setIsPurplePeeking(false);
        }
    }, [isTyping]);

    const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 3;

        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;

        const faceX = Math.max(-15, Math.min(15, deltaX / 20));
        const faceY = Math.max(-10, Math.min(10, deltaY / 30));
        const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

        return { faceX, faceY, bodySkew };
    };

    const purplePos = calculatePosition(purpleRef);
    const blackPos = calculatePosition(blackRef);
    const yellowPos = calculatePosition(yellowRef);
    const orangePos = calculatePosition(orangeRef);

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-[#030303] text-white">
            {/* Left Content Section */}
            <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#0a0a0a] p-12">
                <div className="relative z-20">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <div className="size-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <Sparkles className="size-4" />
                        </div>
                        <span>AI Prompt App</span>
                    </div>
                </div>

                <div className="relative z-20 flex items-end justify-center h-[500px]">
                    {/* Cartoon Characters */}
                    <div className="relative" style={{ width: '550px', height: '400px' }}>
                        {/* Purple tall rectangle character */}
                        <div
                            ref={purpleRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: '70px',
                                width: '180px',
                                height: isTyping ? '440px' : '400px',
                                backgroundColor: '#6C3FF5',
                                borderRadius: '10px 10px 0 0',
                                zIndex: 1,
                                transform: isTyping
                                    ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                                    : `skewX(${purplePos.bodySkew || 0}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            <div
                                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                                style={{
                                    left: isLookingAtEachOther ? `${55}px` : `${45 + purplePos.faceX}px`,
                                    top: isLookingAtEachOther ? `${65}px` : `${40 + purplePos.faceY}px`,
                                }}
                            >
                                <EyeBall
                                    size={18}
                                    pupilSize={7}
                                    maxDistance={5}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isPurpleBlinking}
                                    forceLookX={isLookingAtEachOther ? 3 : undefined}
                                    forceLookY={isLookingAtEachOther ? 4 : undefined}
                                />
                                <EyeBall
                                    size={18}
                                    pupilSize={7}
                                    maxDistance={5}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isPurpleBlinking}
                                    forceLookX={isLookingAtEachOther ? 3 : undefined}
                                    forceLookY={isLookingAtEachOther ? 4 : undefined}
                                />
                            </div>
                        </div>

                        {/* Black tall rectangle character */}
                        <div
                            ref={blackRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: '240px',
                                width: '120px',
                                height: '310px',
                                backgroundColor: '#2D2D2D',
                                borderRadius: '8px 8px 0 0',
                                zIndex: 2,
                                transform: isLookingAtEachOther
                                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                                    : isTyping
                                        ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                                        : `skewX(${blackPos.bodySkew || 0}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            <div
                                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                                style={{
                                    left: isLookingAtEachOther ? `${32}px` : `${26 + blackPos.faceX}px`,
                                    top: isLookingAtEachOther ? `${12}px` : `${32 + blackPos.faceY}px`,
                                }}
                            >
                                <EyeBall
                                    size={16}
                                    pupilSize={6}
                                    maxDistance={4}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isBlackBlinking}
                                    forceLookX={isLookingAtEachOther ? 0 : undefined}
                                    forceLookY={isLookingAtEachOther ? -4 : undefined}
                                />
                                <EyeBall
                                    size={16}
                                    pupilSize={6}
                                    maxDistance={4}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isBlackBlinking}
                                    forceLookX={isLookingAtEachOther ? 0 : undefined}
                                    forceLookY={isLookingAtEachOther ? -4 : undefined}
                                />
                            </div>
                        </div>

                        {/* Orange semi-circle character */}
                        <div
                            ref={orangeRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: '0px',
                                width: '240px',
                                height: '200px',
                                zIndex: 3,
                                backgroundColor: '#d946ef', // fuchsia-500
                                borderRadius: '120px 120px 0 0',
                                transform: `skewX(${orangePos.bodySkew || 0}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            <div
                                className="absolute flex gap-8 transition-all duration-200 ease-out"
                                style={{
                                    left: `${82 + (orangePos.faceX || 0)}px`,
                                    top: `${90 + (orangePos.faceY || 0)}px`,
                                }}
                            >
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" />
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" />
                            </div>
                        </div>

                        {/* Yellow tall rectangle character */}
                        <div
                            ref={yellowRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: '310px',
                                width: '140px',
                                height: '230px',
                                backgroundColor: '#E8D754',
                                borderRadius: '70px 70px 0 0',
                                zIndex: 4,
                                transform: `skewX(${yellowPos.bodySkew || 0}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            <div
                                className="absolute flex gap-6 transition-all duration-200 ease-out"
                                style={{
                                    left: `${52 + (yellowPos.faceX || 0)}px`,
                                    top: `${40 + (yellowPos.faceY || 0)}px`,
                                }}
                            >
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" />
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" />
                            </div>
                            <div
                                className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                                style={{
                                    left: `${40 + (yellowPos.faceX || 0)}px`,
                                    top: `${88 + (yellowPos.faceY || 0)}px`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px] pointer-events-none" />
            </div>

            {/* Right Login Section */}
            <div className="flex items-center justify-center p-8 bg-[#030303] text-white">
                <div className="w-full max-w-[420px]">
                    <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
                        <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <Sparkles className="size-4" />
                        </div>
                        <span>AI Prompt App</span>
                    </div>

                    <div className="text-center mb-10">
                        {/* Header content managed by tabs in EmailAuthForm usually, keeping generic welcome or minimal */}
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Hoşgeldiniz!</h1>
                        <p className="text-neutral-400 text-sm">Hesabınıza giriş yapın veya kayıt olun</p>
                    </div>

                    <EmailAuthForm
                        onSuccess={onLoginSuccess}
                        onGoogleSignIn={onGoogleSignIn}
                        onInteractionStart={() => setIsTyping(true)}
                        onInteractionEnd={() => setIsTyping(false)}
                    />
                </div>
            </div>
        </div>
    );
}

