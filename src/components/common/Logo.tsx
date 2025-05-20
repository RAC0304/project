import React from "react";
import logoImage from "../../asset/image/logologin.png";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({
  className = "",
  width = 100,
  height = 100,
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={logoImage}
        alt="WanderWise Logo"
        style={{
          width: width,
          height: height,
          objectFit: "contain",
          backgroundColor: "transparent",
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
};

export default Logo;
