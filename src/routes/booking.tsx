import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";

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
      <footer className="bg-background border-t border-border/60 py-10 px-6 text-center text-sm text-muted-foreground">
        <p className="mb-1">© {new Date().getFullYear()} Marme Villa Jogja</p>
        <p className="text-xs text-muted-foreground/70">Prototype · No real transactions</p>
      </footer>
    </div>
  );
}
