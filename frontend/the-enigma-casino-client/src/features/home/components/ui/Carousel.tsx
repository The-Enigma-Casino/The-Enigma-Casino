import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

const slides = [
  { href: "/", img: "/img/home-banner.webp", alt: "Home" },
  { href: "/install-app", img: "/img/install-banner.webp", alt: "Install" },
  { href: "/catalog", img: "/img/paymenth-banner.webp", alt: "Paymenth" },
];

export default function Carousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="w-full flex flex-col items-center justify-center pt-4 px-4">
      <div className="w-full max-w-screen-xl rounded-2xl overflow-hidden">
        <div ref={emblaRef} className="w-full overflow-hidden">
          <div className="flex">
            {slides.map((slide) => (
              <Link key={slide.alt} to={slide.href} className="w-full shrink-0">
                <img
                  src={slide.img}
                  alt={slide.alt}
                  className="w-full h-auto block"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="mt-2 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            aria-label={`Ir al elemento ${index + 1}`}
            className={`w-5 h-5 rounded-full transition flex items-center justify-center
    ${
      selectedIndex === index
        ? "bg-[var(--Principal)] scale-110"
        : "bg-white/30"
    }`}
          >
            <span className="sr-only">{`Ir al elemento ${index + 1}`}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
