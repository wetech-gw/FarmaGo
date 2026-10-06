"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useT } from "@/components/I18nProvider";

interface Pharmacy {
  id: number;
  name: string;
  image: string | null;
  hours: string;
}

interface Props {
  pharmacies: Pharmacy[];
}

export default function GuardsCarousel({ pharmacies }: Props) {
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
    <section className="py-5" style={{ backgroundColor: "#a3cfa4" }}>
      <div className="container position-relative">
        <div className="mb-4">
          <h2 className="fw-bold text-dark m-0 pb-2 text-uppercase" style={{ fontSize: "1.75rem" }}>
            {t("pharmacy.sectionGuards")}
          </h2>
          <div style={{ height: "4px", width: "340px", backgroundColor: "#198754" }}></div>
        </div>

        <div className="pharmacy-carousel-track" ref={trackRef}>
          {pharmacies.map((item, index) => (
            <div key={item.id} className="pharmacy-card-wrapper" data-index={index}>
              <div className="card border-0 rounded-3 shadow-sm h-100 bg-white">
                <div style={{ height: "150px" }}>
                  <img
                    src={item.image ?? "/images/default-pharmacy.svg"}
                    className="w-100 h-100 rounded-top-3"
                    style={{ objectFit: "cover" }}
                    alt={item.name}
                  />
                </div>
                <div className="card-body d-flex flex-column p-3">
                  <h5 className="card-title text-success fw-semibold mb-2">{item.name}</h5>
                  <p className="card-text text-muted small mb-4">{item.hours}</p>
                  <Link
                    href={`/guards/${item.id}`}
                    className="btn btn-success w-100 rounded-pill fw-semibold mt-auto text-decoration-none d-flex align-items-center justify-content-center"
                  >
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    {t("common.moreDetails")}
                  </Link>
                </div>
              </div>
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
      </div>
    </section>
  );
}