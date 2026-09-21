import { Link } from "@tanstack/react-router";
import { EffectCoverflow, EffectCreative, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-creative";
import "swiper/css/pagination";
import { stillForType } from "@/data/atelier-stills";
import type { Concept } from "@/data/studio/types";

type Mode = "creative" | "coverflow";

export function CatalogCarousel({
  concepts,
  mode = "creative",
}: {
  concepts: Concept[];
  mode?: Mode;
}) {
  if (concepts.length === 0) return null;
  const coverflow = mode === "coverflow";

  return (
    <div className={coverflow ? "za-catalog is-cover" : "za-catalog"}>
      <Swiper
        dir="rtl"
        spaceBetween={coverflow ? 40 : 0}
        effect={coverflow ? "coverflow" : "creative"}
        grabCursor
        slidesPerView={coverflow ? 1.35 : "auto"}
        breakpoints={
          coverflow
            ? { 640: { slidesPerView: 2.43 } }
            : undefined
        }
        centeredSlides
        loop={concepts.length > 2}
        pagination={{ clickable: true }}
        coverflowEffect={
          coverflow
            ? { rotate: 0, slideShadows: false, stretch: 0, depth: 100, modifier: 2.5 }
            : undefined
        }
        creativeEffect={
          coverflow
            ? undefined
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
        modules={[EffectCoverflow, EffectCreative, Pagination]}
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
