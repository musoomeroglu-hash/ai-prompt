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
              1px 3px 2px 0 #a855f7 inset,
              0 0 12px 2px #d946ef inset,
              0 0 4px 1px rgba(168, 85, 247, 0.4);
          }
          50% {
            transform: rotate(180deg);
            box-shadow:
              1px 3px 2px 0 #9333ea inset,
              0 0 16px 4px #c026d3 inset,
              0 0 8px 2px rgba(217, 70, 239, 0.4);
          }
          100% {
            transform: rotate(360deg);
            box-shadow:
              1px 3px 2px 0 #a855f7 inset,
              0 0 12px 2px #d946ef inset,
              0 0 4px 1px rgba(168, 85, 247, 0.4);
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
            text-shadow: 0 0 8px #a855f7;
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
