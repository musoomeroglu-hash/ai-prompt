"use client";

import { animate } from "framer-motion";
import { useEffect, useState } from "react";

export function useAnimatedText(text: string, delimiter: string = "") {
    const [cursor, setCursor] = useState(0);
    const [startingCursor, setStartingCursor] = useState(0);
    const [prevText, setPrevText] = useState(text);

    if (prevText !== text) {
        setPrevText(text);
        setStartingCursor(text.startsWith(prevText) ? cursor : 0);
    }

    useEffect(() => {
        const parts = text.split(delimiter);
        const duration = delimiter === "" ? 8 : // Character animation
            delimiter === " " ? 4 : // Word animation
                2; // Chunk animation

        // Adjust duration based on length to prevent extremely long animations for long texts
        const finalDuration = Math.min(duration, parts.length * 0.05 + 1);

        const controls = animate(startingCursor, parts.length, {
            duration: finalDuration,
            ease: "easeOut",
            onUpdate(latest) {
                setCursor(Math.floor(latest));
            },
        });

        return () => controls.stop();
    }, [startingCursor, text, delimiter]);

    return text.split(delimiter).slice(0, cursor).join(delimiter);
}
