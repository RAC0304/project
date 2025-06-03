import React from "react";
import { useNavigate } from "react-router-dom";

interface IndonesiaMapProps {
  className?: string;
}

const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ className = "" }) => {
  const navigate = useNavigate();

  const handleRegionClick = (region: string) => {
    navigate(`/destinations?search=${region}`);
  };
  return (
    <div className={`indonesia-map-container relative z-10 ${className}`}>
      <div className="indonesia-map w-full max-w-4xl mx-auto bg-teal-50/50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow relative z-10">
        <div className="relative w-full z-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 550"
            className="w-full h-auto relative z-10"
          >
            <style>
              {`
              .island {
                fill: #10b981;
                stroke: #047857;
                stroke-width: 1.5;
                transition: all 0.3s ease;
                cursor: pointer;
              }
              .island:hover {
                fill: #059669;
                stroke: #065f46;
                stroke-width: 2;
                transform: scale(1.02);
              }
              .island-label {
                font-family: 'Arial', sans-serif;
                font-size: 14px;
                font-weight: 600;
                fill: #064e3b;
                text-anchor: middle;
                pointer-events: none;
              }
              .small-island-label {
                font-family: 'Arial', sans-serif;
                font-size: 11px;
                font-weight: 600;
                fill: #064e3b;
                text-anchor: middle;
                pointer-events: none;
              }
              .water {
                fill: #ecfdf5;
              }
              .map-title {
                font-family: 'Arial', sans-serif;
                font-size: 24px;
                font-weight: bold;
                fill: #047857;
                text-anchor: middle;
              }
              .map-subtitle {
                font-family: 'Arial', sans-serif;
                font-size: 14px;
                fill: #059669;
                text-anchor: middle;
              }
              `}
            </style>

            {/* Background */}
            <rect className="water" width="1000" height="550" rx="10" />

            {/* Sumatra */}
            <path
              className="island"
              d="M180,100 C160,120 150,150 140,200 C130,250 140,300 150,350 C160,380 180,400 200,420 C220,440 250,430 270,410 C290,390 300,360 310,330 C320,300 325,270 320,240 C315,210 300,180 280,160 C260,140 230,130 210,120 C190,110 190,90 180,100 Z"
              onClick={() => handleRegionClick("Sumatra")}
            />
            <text className="island-label" x="230" y="260">
              Sumatra
            </text>

            {/* Java */}
            <path
              className="island"
              d="M320,370 C350,360 380,350 420,350 C460,350 500,355 540,360 C580,365 620,370 640,375 C660,380 665,385 660,390 C655,395 640,400 620,405 C600,410 570,415 530,415 C490,415 450,413 410,410 C370,407 340,403 320,395 C300,387 300,375 320,370 Z"
              onClick={() => handleRegionClick("Java")}
            />
            <text className="island-label" x="480" y="382">
              Java
            </text>

            {/* Kalimantan (Borneo) */}
            <path
              className="island"
              d="M400,120 C380,140 370,170 370,210 C370,250 380,290 400,320 C420,350 450,370 490,380 C530,390 570,380 600,360 C630,340 640,310 640,270 C640,230 630,190 610,160 C590,130 560,110 520,100 C480,90 440,90 410,100 C380,110 420,100 400,120 Z"
              onClick={() => handleRegionClick("Kalimantan")}
            />
            <text className="island-label" x="510" y="240">
              Kalimantan
            </text>

            {/* Sulawesi (Celebes) */}
            <path
              className="island"
              d="M650,160 C630,180 620,210 625,240 C630,270 645,295 640,320 C635,345 620,365 630,385 C640,405 660,415 680,405 C700,395 710,370 720,345 C730,320 735,295 730,270 C725,245 710,225 720,200 C730,175 740,155 730,135 C720,115 700,105 680,115 C660,125 670,140 650,160 Z"
              onClick={() => handleRegionClick("Sulawesi")}
            />
            <text className="island-label" x="675" y="260">
              Sulawesi
            </text>

            {/* Papua */}
            <path
              className="island"
              d="M750,150 C730,170 720,200 720,240 C720,280 730,320 750,350 C770,380 800,400 840,410 C880,420 910,410 930,390 C950,370 960,340 960,300 C960,260 950,220 930,190 C910,160 880,140 840,130 C800,120 770,130 750,150 Z"
              onClick={() => handleRegionClick("Papua")}
            />
            <text className="island-label" x="840" y="270">
              Papua
            </text>

            {/* Bali */}
            <path
              className="island"
              d="M650,385 C645,390 643,395 645,400 C647,405 652,408 657,408 C662,408 667,405 669,400 C671,395 669,390 664,385 C659,380 655,380 650,385 Z"
              onClick={() => handleRegionClick("Bali")}
            />
            <text className="small-island-label" x="658" y="420">
              Bali
            </text>

            {/* Lombok */}
            <path
              className="island"
              d="M680,385 C675,390 673,395 675,400 C677,405 682,408 687,408 C692,408 697,405 699,400 C701,395 699,390 694,385 C689,380 685,380 680,385 Z"
              onClick={() => handleRegionClick("Lombok")}
            />
            <text className="small-island-label" x="686" y="420">
              Lombok
            </text>

            {/* Flores */}
            <path
              className="island"
              d="M710,380 C703,387 700,395 703,402 C706,409 713,413 720,413 C727,413 734,409 737,402 C740,395 737,387 730,380 C723,373 717,373 710,380 Z"
              onClick={() => handleRegionClick("Flores")}
            />
            <text className="small-island-label" x="720" y="425">
              Flores
            </text>

            {/* Timor */}
            <path
              className="island"
              d="M780,390 C770,395 765,402 770,410 C775,418 785,422 800,422 C815,422 825,418 830,410 C835,402 830,395 820,390 C810,385 790,385 780,390 Z"
              onClick={() => handleRegionClick("Timor")}
            />
            <text className="small-island-label" x="800" y="440">
              Timor
            </text>

            {/* Maluku */}
            <path
              className="island"
              d="M760,300 C755,305 753,310 755,315 C757,320 762,323 767,323 C772,323 777,320 779,315 C781,310 779,305 774,300 C769,295 765,295 760,300 Z"
              onClick={() => handleRegionClick("Maluku")}
            />
            <path
              className="island"
              d="M780,280 C775,285 773,290 775,295 C777,300 782,303 787,303 C792,303 797,300 799,295 C801,290 799,285 794,280 C789,275 785,275 780,280 Z"
              onClick={() => handleRegionClick("Maluku")}
            />
            <path
              className="island"
              d="M790,320 C785,325 783,330 785,335 C787,340 792,343 797,343 C802,343 807,340 809,335 C811,330 809,325 804,320 C799,315 795,315 790,320 Z"
              onClick={() => handleRegionClick("Maluku")}
            />
            <text className="small-island-label" x="780" y="350">
              Maluku
            </text>

            {/* Compass rose */}
            <g transform="translate(900, 100)">
              <circle
                cx="0"
                cy="0"
                r="30"
                fill="#ecfdf5"
                stroke="#047857"
                strokeWidth="2"
              />
              <path d="M0,-25 L5,-5 L0,-10 L-5,-5 Z" fill="#10b981" />
              <path d="M0,25 L5,5 L0,10 L-5,5 Z" fill="#10b981" />
              <path d="M-25,0 L-5,5 L-10,0 L-5,-5 Z" fill="#10b981" />
              <path d="M25,0 L5,5 L10,0 L5,-5 Z" fill="#10b981" />
              <text
                x="0"
                y="-32"
                textAnchor="middle"
                fontFamily="Arial"
                fontSize="12"
                fill="#047857"
              >
                N
              </text>
              <text
                x="0"
                y="40"
                textAnchor="middle"
                fontFamily="Arial"
                fontSize="12"
                fill="#047857"
              >
                S
              </text>
              <text
                x="-32"
                y="4"
                textAnchor="middle"
                fontFamily="Arial"
                fontSize="12"
                fill="#047857"
              >
                W
              </text>
              <text
                x="32"
                y="4"
                textAnchor="middle"
                fontFamily="Arial"
                fontSize="12"
                fill="#047857"
              >
                E
              </text>
            </g>

            {/* Scale bar */}
            <g transform="translate(100, 500)">
              <rect x="0" y="0" width="200" height="5" fill="#047857" />
              <rect x="0" y="0" width="100" height="5" fill="#10b981" />
              <text
                x="0"
                y="20"
                fontFamily="Arial"
                fontSize="12"
                fill="#047857"
              >
                0
              </text>
              <text
                x="100"
                y="20"
                fontFamily="Arial"
                fontSize="12"
                fill="#047857"
              >
                500km
              </text>
              <text
                x="200"
                y="20"
                fontFamily="Arial"
                fontSize="12"
                fill="#047857"
              >
                1000km
              </text>
            </g>
          </svg>
        </div>
      </div>{" "}
      <div className="text-center mt-4 text-gray-600">
        <p className="mb-1 font-medium">Jelajahi Indonesia dari peta</p>
        <p className="text-sm">
          Klik pada pulau untuk melihat destinasi di daerah tersebut
        </p>
      </div>
    </div>
  );
};

export default IndonesiaMap;
