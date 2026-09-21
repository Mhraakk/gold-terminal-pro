import { Link } from "@tanstack/react-router";
import { Autoplay, EffectCards, EffectCoverflow, EffectCreative, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-creative";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { stillForType } from "@/data/atelier-stills";
import type { Concept } from "@/data/studio/types";

type Mode = "creative" | "coverflow" | "cards" | "stack";

export function CatalogCarousel({
  concepts,
  mode = "creative",
}: {
  concepts: Concept[];
  mode?: Mode;
}) {
  if (concepts.length === 0) return null;
  const coverflow = mode === "coverflow";
  const cards = mode === "cards";
  const stack = mode === "stack";

  return (
    <div
      className={
        cards
          ? "za-catalog is-cards"
          : coverflow
            ? "za-catalog is-cover"
            : stack
              ? "za-catalog is-stack"
              : "za-catalog"
      }
    >
      <Swiper
        dir="rtl"
        spaceBetween={0}
        effect={cards ? "cards" : coverflow ? "coverflow" : "creative"}
        grabCursor
        slidesPerView={cards ? 1 : coverflow ? 1.35 : stack ? 1 : "auto"}
        breakpoints={
          coverflow
            ? { 640: { slidesPerView: 2.43 } }
            : undefined
        }
        centeredSlides={!cards}
        loop={concepts.length > 2}
        autoplay={
          stack
            ? { delay: 1500, disableOnInteraction: true }
            : false
        }
        pagination={cards ? false : { clickable: true }}
        coverflowEffect={
          coverflow
            ? { rotate: 0, slideShadows: false, stretch: 0, depth: 100, modifier: 2.5 }
            : undefined
        }
        creativeEffect={
          cards || coverflow
            ? undefined
            : stack
              ? {
                  prev: { shadow: true, translate: [0, 0, -400] },
                  next: { translate: ["100%", 0, 0] },
                }
              : {
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
                }
        }
        modules={[Autoplay, EffectCards, EffectCoverflow, EffectCreative, Pagination]}
        className="za-catalog-swiper"
      >
        {concepts.map((c) => {
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
