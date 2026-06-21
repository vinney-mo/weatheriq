"use client";
import Image from "next/image";

interface Props {
  icon: string; 
  alt?: string;
  size?: number;
  className?: string;
}

export function ConditionIcon({ icon, alt = "weather", size = 48, className = "" }: Props) {
  if (!icon) return null;
  return (
    <Image
      src={icon}
      alt={alt}
      width={size}
      height={size}
      className={className}
      unoptimized
    />
  );
}
