import React from "react";

interface LoaderProps {
    size?: number;
    text?: string;
}

export const GradientSpinner: React.FC<LoaderProps> = ({ size = 200, text = "GENERATING" }) => {
    const letters = text.split("");

    return (
        <div className="flex items-center justify-center p-8">
            <div
                className="relative flex items-center justify-center font-inter select-none"
                style={{ width: size, height: size }}
            >
                {/* Letters */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {letters.map((letter, index) => (
                        <span
                            key={index}
                            className="inline-block text-xl font-bold text-white opacity-40 animate-loaderLetter tracking-widest"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {letter}
                        </span>
                    ))}
                </div>

                {/* Spinning Ring */}
                <div
                    className="absolute inset-0 rounded-full animate-loaderCircle"
                ></div>

                {/* Inner glow for depth */}
                <div className="absolute inset-4 rounded-full bg-black/50 blur-xl"></div>
            </div>

            <style jsx>{`
        @keyframes loaderCircle {
          0% {
            transform: rotate(0deg);
            box-shadow:
              1px 3px 2px 0 #f97316 inset,
              0 0 12px 2px #facc15 inset,
              0 0 4px 1px rgba(249, 115, 22, 0.4);
          }
          50% {
            transform: rotate(180deg);
            box-shadow:
              1px 3px 2px 0 #ea580c inset,
              0 0 16px 4px #eab308 inset,
              0 0 8px 2px rgba(250, 204, 21, 0.4);
          }
          100% {
            transform: rotate(360deg);
            box-shadow:
              1px 3px 2px 0 #f97316 inset,
              0 0 12px 2px #facc15 inset,
              0 0 4px 1px rgba(249, 115, 22, 0.4);
          }
        }

        @keyframes loaderLetter {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
            text-shadow: none;
            color: #525252;
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
            text-shadow: 0 0 8px #f97316;
            color: #ffffff;
          }
        }

        .animate-loaderCircle {
          animation: loaderCircle 1.5s linear infinite;
        }

        .animate-loaderLetter {
          animation: loaderLetter 2s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};
