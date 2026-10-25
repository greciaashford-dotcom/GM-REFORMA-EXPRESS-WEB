"use client";

import React from "react";

const images = [
  { src: "https://assets.zyrosite.com/AE0aqQkQ26ukrZyD/4-d957D2VxOvs6bjqQ.png", alt: "Reforma Madrid 1" },
  { src: "https://assets.zyrosite.com/AE0aqQkQ26ukrZyD/1-d957D2VkkaIrOp1l.png", alt: "Reforma Madrid 2" },
  { src: "https://assets.zyrosite.com/AE0aqQkQ26ukrZyD/2-mxBMjeVRkPs2NbLx.png", alt: "Reforma Madrid 3" },
  { src: "https://assets.zyrosite.com/AE0aqQkQ26ukrZyD/7-YZ9xaoK1eVTPDa0B.png", alt: "Reforma Madrid 4" },
  { src: "https://assets.zyrosite.com/AE0aqQkQ26ukrZyD/3-mxBMjeVRBySKeaD8.png", alt: "Reforma Madrid 5" },
  { src: "https://assets.zyrosite.com/AE0aqQkQ26ukrZyD/6-AVL13oKRnXIV84ZR.png", alt: "Reforma Madrid 6" },
  { src: "https://assets.zyrosite.com/AE0aqQkQ26ukrZyD/5-m5KLlX0R9vcQwwgg.png", alt: "Reforma Madrid 7" },
];

export const ContinuousCarousel: React.FC = () => {
  // Triplicated images as specified in the snippet for smooth continuous movement
  const allImages = [...images, ...images, ...images];

  return (
    <div className="w-full overflow-hidden select-none bg-white">
      <div className="carousel">
        <div className="carousel-inner">
          {allImages.map((img, index) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={index}
              src={img.src}
              alt={img.alt}
              loading="lazy"
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .carousel {
          position: relative;
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          padding: 12px 0;
          background-color: #ffffff !important;
        }

        .carousel:hover .carousel-inner {
          animation-play-state: paused;
        }

        .carousel-inner {
          display: flex;
          width: max-content;
          animation: continuousScroll 18s linear infinite;
        }

        .carousel img {
          display: inline-block;
          vertical-align: top;
          border-radius: 8px;
          margin: 6px;
          filter: grayscale(0.85);
          transition: transform 0.35s cubic-bezier(0.2, 0, 0, 1), filter 0.35s ease, box-shadow 0.35s ease;
          opacity: 0.95;
          object-fit: cover;
          box-shadow: 0 4px 12px rgba(3, 32, 61, 0.08);
          cursor: pointer;
        }

        .carousel img:hover {
          transform: scale(1.18);
          filter: grayscale(0);
          opacity: 1;
          box-shadow: 0 10px 25px rgba(201, 147, 42, 0.3);
          z-index: 10;
          position: relative;
        }

        /* Gradientes laterales difuminados siempre a blanco puro */
        .carousel::before,
        .carousel::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 6%;
          z-index: 2;
          pointer-events: none;
        }

        .carousel::before {
          left: 0;
          background: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0));
        }

        .carousel::after {
          right: 0;
          background: linear-gradient(to left, #ffffff, rgba(255, 255, 255, 0));
        }

        /* Desplazamiento continuo fluido sin saltos */
        @keyframes continuousScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333333%);
          }
        }

        /* Dispositivos móviles */
        @media screen and (max-width: 768px) {
          .carousel img {
            width: 140px;
            height: 100px;
          }
        }

        /* Pantallas grandes */
        @media screen and (min-width: 769px) {
          .carousel img {
            width: 220px;
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
};

export default ContinuousCarousel;
