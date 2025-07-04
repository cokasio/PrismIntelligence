// src/components/magicui/animated-gradient-text.tsx
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function AnimatedGradientText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl bg-white/40 dark:bg-gray-800/40 px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#8fdfff1f] backdrop-blur-sm transition-shadow duration-500 ease-out [--bg-size:300%] hover:shadow-[inset_0_-5px_10px_#3E97FF3f] dark:shadow-[inset_0_-8px_10px_#1a1a1a1f] dark:hover:shadow-[inset_0_-5px_10px_#3E97FF3f]",
        className
      )}
    >
      <div
        className={`absolute inset-0 block h-full w-full animate-gradient bg-gradient-to-r from-[#3E97FF]/50 via-[#7239EA]/50 to-[#3E97FF]/50 bg-[length:var(--bg-size)_100%] p-[1px] ![mask-composite:subtract] [border-radius:inherit] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]`}
      />
      {children}
    </div>
  );
}

// Add to your global CSS
const gradientAnimation = `
@keyframes animate-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  animation: animate-gradient 8s ease infinite;
}
`;