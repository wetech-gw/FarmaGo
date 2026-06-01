"use client";

import { useEffect, useRef, useState } from "react";
import PharmacyCard from "./PharmacyCard";
import { pharmacies } from "@/data/pharmacies";

export default function PharmacyCarousel() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const activeCard = track.querySelector<HTMLDivElement>(`[data-index="${activeIndex}"]`);
    activeCard?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, [activeIndex]);

  const handlePrev = () => {
    setActiveIndex((current) =>
      current === 0 ? pharmacies.length - 1 : current - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((current) =>
      current === pharmacies.length - 1 ? 0 : current + 1
    );
  };

  return (
    <section className="container py-5 position-relative">
      <h2 className="mb-4 fw-bold text-dark">FARMÁCIAS</h2>

      <div className="pharmacy-carousel-track" ref={trackRef}>
        {pharmacies.map((pharmacy, index) => (
          <div key={pharmacy.id} className="pharmacy-card-wrapper" data-index={index}>
            <PharmacyCard pharmacy={pharmacy} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handlePrev}
        className="btn btn-success rounded-circle position-absolute top-50 translate-middle-y shadow"
        style={{ width: 40, height: 40, left: -20, zIndex: 10 }}
        aria-label="Anterior"
      >
        <i className="bi bi-chevron-left text-white" aria-hidden="true"></i>
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="btn btn-success rounded-circle position-absolute top-50 translate-middle-y shadow"
        style={{ width: 40, height: 40, right: -20, zIndex: 10 }}
        aria-label="Seguinte"
      >
        <i className="bi bi-chevron-right text-white" aria-hidden="true"></i>
      </button>

      <div className="text-center mt-4 text-muted small">
        {activeIndex + 1} / {pharmacies.length}
      </div>
    </section>
  );
}
