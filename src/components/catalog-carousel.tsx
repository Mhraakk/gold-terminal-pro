import { Link } from "@tanstack/react-router";
import { EffectCreative, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/pagination";
import { stillForType } from "@/data/atelier-stills";
import type { Concept } from "@/data/studio/types";

export function CatalogCarousel({ concepts }: { concepts: Concept[] }) {
  const slides = concepts.length
    ? concepts
    : [];

  if (slides.length === 0) return null;

  return (
    <div className="za-catalog">
      <Swiper
        dir="rtl"
        spaceBetween={0}
        effect="creative"
        grabCursor
        slidesPerView="auto"
        centeredSlides
        loop={slides.length > 2}
        pagination={{ clickable: true }}
        creativeEffect={{
          prev: {
            shadow: true,
            origin: "left center",
            translate: ["-5%", 0, -200],
            rotate: [0, 100, 0],
          },
          next: {
            origin: "right center",
            translate: ["5%", 0, -200],
            rotate: [0, -100, 0],
          },
        }}
        modules={[EffectCreative, Pagination]}
        className="za-catalog-swiper"
      >
        {slides.map((c) => {
          const still = stillForType(c.brief.productType);
          return (
            <SwiperSlide key={c.id}>
              <Link
                to="/"
                search={{ desk: "dossier", concept: c.id }}
                className="za-catalog-slide"
              >
                <img src={still.src} alt={still.alt} />
                <span>{c.title}</span>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
