import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Complete Your Reservation — Marme Villa Jogja" },
      { name: "description", content: "Fill in your details to complete your reservation at Marme Villa Jogja." },
    ],
  }),
  component: BookingLayout,
});

function BookingLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <Navbar variant="back" backTo="/" backText="Kembali ke beranda" />

      {/* Page content — child route renders here */}
      <Outlet />

      {/* Footer */}
      <Footer />
    </div>
  );
}
