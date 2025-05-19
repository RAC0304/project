import React from 'react';
import { Compass } from 'lucide-react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Compass className={`w-8 h-8 ${className}`} strokeWidth={2.5} />
    </div>
  );
};

export default Logo;