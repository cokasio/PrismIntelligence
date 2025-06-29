// src/components/magicui/gradient-background.tsx
import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  className?: string;
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
}

export function GradientBackground({
  className,
  gradientBackgroundStart = "rgb(62, 151, 255)",
  gradientBackgroundEnd = "rgb(114, 57, 234)",
  firstColor = "18, 113, 255",
  secondColor = "80, 205, 137",
  thirdColor = "241, 65, 108",
  fourthColor = "255, 199, 0",
  fifthColor = "114, 57, 234",
  pointerColor = "62, 151, 255",
  size = "80%",
  blendingValue = "hard-light",
}: GradientBackgroundProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div
        className={`[background-size:${size}] absolute inset-0 opacity-30`}
        style={{
          backgroundImage: `
            radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 1) 0px, transparent 0%),
            radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 1) 0px, transparent 50%),
            radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 1) 0px, transparent 50%),
            radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 1) 0px, transparent 50%),
            radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 1) 0px, transparent 50%),
            radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 1) 0px, transparent 50%),
            radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 1) 0px, transparent 50%)
          `,
          filter: "blur(100px) saturate(150%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/70 dark:from-gray-950 dark:via-gray-950/90 dark:to-gray-950/70" />
    </div>
  );
}