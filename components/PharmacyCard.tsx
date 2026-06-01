import Link from "next/link";
import { Pharmacy } from "@/types/pharmacy";

interface Props {
  pharmacy: Pharmacy;
}

export default function PharmacyCard({ pharmacy }: Props) {
  return (
    <div className="card shadow-sm h-100 border-0">
      <div style={{ height: "180px", position: "relative" }}>
        <img
          src={pharmacy.image}
          className="w-100 h-100 object-fit-cover card-img-top"
          alt={pharmacy.name}
        />
      </div>

      <div className="card-body d-flex flex-column p-3">
        <h5 className="text-success fw-bold card-title mb-2">
          {pharmacy.name}
        </h5>

        <p className="card-text text-muted small mb-3">
          <i className="bi bi-clock-history text-warning me-1"></i>
          {pharmacy.hours}
        </p>

        <Link
          href={`/pharmacies/${pharmacy.id}`}
          className="btn btn-success w-100 rounded-pill fw-semibold mt-auto"
        >
          Mais detalhes
        </Link>
      </div>
    </div>
  );
}
