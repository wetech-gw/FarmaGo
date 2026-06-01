import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PharmacyCarousel from "@/components/PharmacyCarousel";
import Footer from "@/components/Footer";
export const dynamic = 'force-static';
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <PharmacyCarousel />
      <Footer />
    </>
  );
}