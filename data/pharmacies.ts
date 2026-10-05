import { Pharmacy } from "@/types/pharmacy";

export const pharmacies: Pharmacy[] = [
  {
    id: 1,
    name: "Farmácia A. Combatentes",
    image: "/images/img6.jpg",
    address: "Avenida dos Combatentes da Liberdade da Pátria, Bissau, Guiné-Bissau",
    hours: "Aberto 9h - 23h",
    phone: "+245955000001",
    schedule: "09:00 - 23:00",
    medications: [
      { id: 1, name: "Panadol", dosage: "500mg", image: "/medicamentos/Panadol.jpeg" },
      { id: 2, name: "Doliprane", dosage: "1000mg", image: "/medicamentos/Doliprane.jpeg" },
      { id: 3, name: "Antidol", dosage: "500mg", image: "/medicamentos/Antidol.jpg" },
    ],
  },
  {
    id: 2,
    name: "Farmácia Mocambique",
    image: "/images/img7.jpg",
    address: "Bairro de Moçambique, Bissau, Guiné-Bissau",
    hours: "Aberto 9h - 23h",
    phone: "+245955000002",
    schedule: "09:00 - 23:00",
    medications: [
      { id: 1, name: "Panadol", dosage: "500mg", image: "/medicamentos/Panadol.jpeg" },
      { id: 4, name: "Smectalia", dosage: "3g", image: "/medicamentos/smectalia.jpeg" },
      { id: 5, name: "Imodium", dosage: "2mg", image: "/medicamentos/Imodium.jpeg" }
    ],
  },
  {
    id: 3,
    name: "Farmácia N. Mandela",
    image: "/images/img5.jpg",
    address: "Avenida Nelson Mandela, Bissau, Guiné-Bissau",
    hours: "Aberto 9h - 23h",
    phone: "+245955000003",
    schedule: "09:00 - 23:00",
    medications: [
      { id: 3, name: "Antidol", dosage: "500mg", image: "/medicamentos/Antidol.jpg" },
      { id: 5, name: "Imodium", dosage: "2mg", image: "/medicamentos/Imodium.jpeg" },
      { id: 6, name: "Hydroxyd", dosage: "500mg", image: "/medicamentos/hydroxyd.jpeg" }
    ],
  },
  {
    id: 4,
    name: "Farmácia Takir",
    image: "/images/img9.jpg",
    address: "Bairro de Takir, Bissau, Guiné-Bissau",
    hours: "Aberto 9h - 23h",
    phone: "+245955000004",
    schedule: "09:00 - 23:00",
    medications: [
      { id: 2, name: "Doliprane", dosage: "1000mg", image: "/medicamentos/Doliprane.jpeg" },
      { id: 6, name: "Hydroxyd", dosage: "500mg", image: "/medicamentos/hydroxyd.jpeg" },
      { id: 4, name: "Smectalia", dosage: "3g", image: "/medicamentos/smectalia.jpeg" }
    ],
  },
  {
    id: 5,
    name: "Farmácia Ociano",
    image: "/images/img10.jpg",
    address: "Bairro Central, Avenida Amílcar Cabral, Bissau, Guiné-Bissau",
    hours: "Aberto 9h - 23h",
    phone: "+245955000005",
    schedule: "09:00 - 23:00",
    medications: [
      { id: 1, name: "Panadol", dosage: "500mg", image: "/medicamentos/Panadol.jpeg" },
      { id: 5, name: "Imodium", dosage: "2mg", image: "/medicamentos/Imodium.jpeg" },
      { id: 6, name: "Hydroxyd", dosage: "500mg", image: "/medicamentos/hydroxyd.jpeg" },
    ],
  },
];
