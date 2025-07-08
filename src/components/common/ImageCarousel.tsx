import React from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ImageCarouselProps {
    images: string[];
    alt?: string;
    height?: number | string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, alt = "Image", height = 220 }) => {
    if (!images || images.length === 0) return null;
    return (
        <Swiper
            navigation
            pagination={{ clickable: true }}
            style={{ width: "100%", height }}
            className="rounded-none w-full object-cover"
        >
            {images.map((img, idx) => (
                <SwiperSlide key={idx}>
                    <img
                        src={img}
                        alt={alt}
                        style={{ width: "100%", height, objectFit: "cover", background: "#f3f3f3" }}
                        className="rounded-none w-full object-cover"
                    />
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default ImageCarousel;
