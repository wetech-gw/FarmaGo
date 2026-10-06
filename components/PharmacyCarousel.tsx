"use client";

import { useEffect, useRef, useState } from "react";
import PharmacyCard from "./PharmacyCard";
import { useT } from "@/components/I18nProvider";

interface Pharmacy {
  id: number;
  name: string;
  image: string | null;
  address: string;
  hours: string;
}

interface Props {
  pharmacies: Pharmacy[];
}

export default function PharmacyCarousel({ pharmacies }: Props) {
  const t = useT();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const activeCard = track.querySelector<HTMLDivElement>(`[data-index="${activeIndex}"]`);
    activeCard?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, [activeIndex]);

  const handlePrev = () =>
    setActiveIndex((c) => (c === 0 ? pharmacies.length - 1 : c - 1));

  const handleNext = () =>
    setActiveIndex((c) => (c === pharmacies.length - 1 ? 0 : c + 1));

  return (
    <section className="container py-5 position-relative">
      <div className="mb-4">
        <h2 className="fw-bold text-dark m-0 pb-2 text-uppercase" style={{ fontSize: "1.75rem" }}>
          {t("pharmacy.section")}
        </h2>
        <div style={{ height: "4px", width: "160px", backgroundColor: "#198754" }}></div>
      </div>

      <div className="pharmacy-carousel-track" ref={trackRef}>
        {pharmacies.map((pharmacy, index) => (
          <div key={pharmacy.id} className="pharmacy-card-wrapper" data-index={index}>
            <PharmacyCard pharmacy={pharmacy} />
          </div>
        ))}
      </div>

      <button
        type="button" onClick={handlePrev}
        className="btn btn-success rounded-circle position-absolute top-50 translate-middle-y shadow"
        style={{ width: 40, height: 40, left: -20, zIndex: 10 }}
        aria-label={t("common.previous")}
      >
        <i className="bi bi-chevron-left text-white" aria-hidden="true"></i>
      </button>

      <button
        type="button" onClick={handleNext}
        className="btn btn-success rounded-circle position-absolute top-50 translate-middle-y shadow"
        style={{ width: 40, height: 40, right: -20, zIndex: 10 }}
        aria-label={t("common.next")}
      >
        <i className="bi bi-chevron-right text-white" aria-hidden="true"></i>
      </button>

      <div className="text-center mt-4 text-muted small">
        {activeIndex + 1} / {pharmacies.length}
      </div>
    </section>
  );
}