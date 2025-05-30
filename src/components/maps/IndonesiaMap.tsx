import React from 'react';
import { useNavigate } from 'react-router-dom';

interface IndonesiaMapProps {
    className?: string;
}

const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ className = '' }) => {
    const navigate = useNavigate();

    const handleIslandClick = (islandName: string) => {
        navigate(`/destinations?search=${islandName}`);
    };

    return (
        <div className={`indonesia-map-container relative ${className}`}>
            <div className="indonesia-map w-full max-w-3xl mx-auto">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 800 400"
                    className="w-full h-auto"
                >
                    <defs>
                        <style>
                            {`
              .island {
                fill: #34d399;
                stroke: #0d9488;
                stroke-width: 1;
                transition: fill 0.3s ease;
              }
              .island:hover {
                fill: #0d9488;
                cursor: pointer;
              }
              .label {
                font-family: Arial, sans-serif;
                font-size: 12px;
                fill: #1e293b;
                font-weight: 600;
                text-anchor: middle;
                pointer-events: none;
              }
              `}
                        </style>
                    </defs>

                    {/* Sumatra */}
                    <path
                        className="island"
                        data-name="Sumatra"
                        d="M100,200 Q120,150 140,120 Q160,100 190,90 Q220,85 250,100 Q270,120 260,150 Q250,170 230,190 Q200,210 170,215 Q140,220 120,210 Q100,200 100,200 Z"
                        onClick={() => handleIslandClick('Sumatra')}
                    />
                    <text className="label" x="180" y="150">Sumatra</text>

                    {/* Java */}
                    <path
                        className="island"
                        data-name="Java"
                        d="M270,240 Q290,230 320,225 Q350,223 380,225 Q420,230 450,235 Q470,240 460,250 Q430,255 400,260 Q350,265 310,260 Q280,255 270,240 Z"
                        onClick={() => handleIslandClick('Java')}
                    />
                    <text className="label" x="360" y="245">Java</text>

                    {/* Kalimantan (Borneo) */}
                    <path
                        className="island"
                        data-name="Kalimantan"
                        d="M300,150 Q330,130 360,120 Q390,110 420,115 Q450,125 460,155 Q465,180 460,200 Q450,220 430,230 Q400,240 370,235 Q340,225 320,210 Q300,190 290,170 Q285,160 300,150 Z"
                        onClick={() => handleIslandClick('Kalimantan')}
                    />
                    <text className="label" x="370" y="175">Kalimantan</text>

                    {/* Sulawesi (Celebes) */}
                    <path
                        className="island"
                        data-name="Sulawesi"
                        d="M500,160 Q520,140 535,150 Q550,165 545,185 Q535,200 540,215 Q550,230 540,245 Q525,255 510,245 Q500,230 490,215 Q485,200 495,185 Q505,170 500,160 Z"
                        onClick={() => handleIslandClick('Sulawesi')}
                    />
                    <text className="label" x="520" y="200">Sulawesi</text>

                    {/* Papua */}
                    <path
                        className="island"
                        data-name="Papua"
                        d="M580,170 Q610,155 640,150 Q670,148 700,155 Q720,165 730,185 Q735,200 725,215 Q710,230 680,235 Q650,238 620,230 Q590,220 580,200 Q575,185 580,170 Z"
                        onClick={() => handleIslandClick('Papua')}
                    />
                    <text className="label" x="650" y="195">Papua</text>

                    {/* Bali */}
                    <circle
                        className="island"
                        data-name="Bali"
                        cx="480"
                        cy="255"
                        r="10"
                        onClick={() => handleIslandClick('Bali')}
                    />
                    <text className="label" x="480" y="275">Bali</text>

                    {/* Lombok */}
                    <circle
                        className="island"
                        data-name="Lombok"
                        cx="500"
                        cy="255"
                        r="8"
                        onClick={() => handleIslandClick('Lombok')}
                    />
                    <text className="label" x="500" y="275">Lombok</text>

                    {/* Flores */}
                    <circle
                        className="island"
                        data-name="Flores"
                        cx="530"
                        cy="260"
                        r="12"
                        onClick={() => handleIslandClick('Flores')}
                    />
                    <text className="label" x="530" y="280">Flores</text>

                    {/* Timor */}
                    <ellipse
                        className="island"
                        data-name="Timor"
                        cx="570"
                        cy="260"
                        rx="20"
                        ry="10"
                        onClick={() => handleIslandClick('Timor')}
                    />
                    <text className="label" x="570" y="280">Timor</text>
                </svg>
            </div>
            <div className="text-center mt-4 text-gray-600 text-sm">
                <p>Klik pada pulau untuk melihat destinasi di daerah tersebut</p>
            </div>
        </div>
    );
};

export default IndonesiaMap;
