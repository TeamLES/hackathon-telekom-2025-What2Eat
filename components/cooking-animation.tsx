"use client";

import { cn } from "@/lib/utils";

interface CookingAnimationProps {
  message?: string;
  className?: string;
}

export function CookingAnimation({
  message = "Cooking up some ideas...",
  className,
}: CookingAnimationProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      {/* Cooking pot animation container */}
      <div className="relative w-32 h-32 mb-6">
        {/* Steam bubbles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full flex justify-center gap-4">
          <div className="animate-steam-1">
            <div className="w-3 h-3 bg-gray-300/60 dark:bg-gray-500/40 rounded-full" />
          </div>
          <div className="animate-steam-2">
            <div className="w-2.5 h-2.5 bg-gray-300/50 dark:bg-gray-500/30 rounded-full" />
          </div>
          <div className="animate-steam-3">
            <div className="w-3.5 h-3.5 bg-gray-300/40 dark:bg-gray-500/35 rounded-full" />
          </div>
        </div>

        {/* Pot lid (animated bouncing) */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 animate-lid-bounce">
          {/* Lid handle */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-3 bg-gray-600 dark:bg-gray-400 rounded-full" />
          {/* Lid */}
          <div className="w-20 h-3 bg-gradient-to-b from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600 rounded-t-full shadow-md" />
        </div>

        {/* Pot body */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          {/* Pot rim */}
          <div className="w-24 h-3 bg-gradient-to-b from-orange-400 to-orange-500 rounded-t-md" />
          {/* Pot main body */}
          <div className="w-24 h-14 bg-gradient-to-b from-orange-500 to-orange-600 rounded-b-2xl relative overflow-hidden">
            {/* Pot shine */}
            <div className="absolute left-2 top-0 bottom-0 w-3 bg-orange-300/20 rounded-full" />
            {/* Bubbling content */}
            <div className="absolute inset-x-2 top-1 h-4 bg-amber-300/40 rounded-full overflow-hidden">
              <div className="absolute inset-0 animate-bubble-1">
                <div className="absolute left-2 top-1 w-2 h-2 bg-amber-200/60 rounded-full" />
              </div>
              <div className="absolute inset-0 animate-bubble-2">
                <div className="absolute left-8 top-0 w-1.5 h-1.5 bg-amber-200/50 rounded-full" />
              </div>
              <div className="absolute inset-0 animate-bubble-3">
                <div className="absolute left-14 top-1 w-2 h-2 bg-amber-200/40 rounded-full" />
              </div>
            </div>
          </div>
          {/* Pot handles */}
          <div className="absolute top-5 -left-3 w-4 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-l-full" />
          <div className="absolute top-5 -right-3 w-4 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-r-full" />
        </div>

        {/* Flame underneath */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div className="w-3 h-6 bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-200 rounded-t-full animate-flame-1 origin-bottom" />
          <div className="w-4 h-8 bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-100 rounded-t-full animate-flame-2 origin-bottom" />
          <div className="w-3 h-5 bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-200 rounded-t-full animate-flame-3 origin-bottom" />
          <div className="w-4 h-7 bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-100 rounded-t-full animate-flame-2 origin-bottom" />
          <div className="w-3 h-6 bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-200 rounded-t-full animate-flame-1 origin-bottom" />
        </div>
      </div>

      {/* Message */}
      <p className="text-muted-foreground font-medium text-center animate-pulse">
        {message}
      </p>

      {/* Styled component for animations */}
      <style jsx>{`
        @keyframes steam {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          20% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-30px) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes lidBounce {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(2deg);
          }
        }

        @keyframes flame {
          0%, 100% {
            transform: scaleY(1) scaleX(1);
          }
          50% {
            transform: scaleY(1.1) scaleX(0.9);
          }
        }

        @keyframes bubble {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-3px) scale(1.2);
            opacity: 1;
          }
        }

        :global(.animate-steam-1) {
          animation: steam 1.8s ease-in-out infinite;
        }

        :global(.animate-steam-2) {
          animation: steam 2.2s ease-in-out 0.3s infinite;
        }

        :global(.animate-steam-3) {
          animation: steam 2s ease-in-out 0.6s infinite;
        }

        :global(.animate-lid-bounce) {
          animation: lidBounce 0.8s ease-in-out infinite;
        }

        :global(.animate-flame-1) {
          animation: flame 0.3s ease-in-out infinite;
        }

        :global(.animate-flame-2) {
          animation: flame 0.4s ease-in-out 0.1s infinite;
        }

        :global(.animate-flame-3) {
          animation: flame 0.35s ease-in-out 0.2s infinite;
        }

        :global(.animate-bubble-1) {
          animation: bubble 1s ease-in-out infinite;
        }

        :global(.animate-bubble-2) {
          animation: bubble 1.2s ease-in-out 0.2s infinite;
        }

        :global(.animate-bubble-3) {
          animation: bubble 0.9s ease-in-out 0.4s infinite;
        }
      `}</style>
    </div>
  );
}
