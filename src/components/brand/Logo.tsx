import React from "react";

export const LOGO_URL =
  "https://assets.zyrosite.com/AE0aqQkQ26ukrZyD/whatsapp_image_2025-09-09_at_21.53.36-removebg-preview-A0xv36rxqlHrX8j2.png";

interface LogoProps {
  className?: string;
  variant?: "full" | "symbol" | "monochrome";
  theme?: "light" | "dark" | "auto";
}

export const Logo: React.FC<LogoProps> = ({
  className = "h-20 sm:h-24 md:h-28 lg:h-32 w-auto",
}) => {
  return (
    <div className="flex items-center select-none py-1">
      {/* Official Transparent Brand Logo Image - 3X Larger, No Adjacent Text */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_URL}
        alt="GM REFORMA EXPRESS"
        className={`${className} max-w-none object-contain flex-shrink-0 drop-shadow-md transition-transform duration-300 hover:scale-105`}
        loading="eager"
      />
    </div>
  );
};

export default Logo;
