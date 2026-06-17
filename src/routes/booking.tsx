import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Complete Your Reservation — Villa Sekar Jawa" },
      { name: "description", content: "Fill in your details to complete your reservation at Villa Sekar Jawa." },
    ],
  }),
  component: BookingLayout,
});

function BookingLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-manrope text-xl tracking-wide text-primary">Sekar Jawa</span>
            <span className="text-[10px] tracking-[0.3em] text-muted-foreground mt-0.5">VILLA · JAVA</span>
          </Link>
          <Link to="/" className="text-sm text-foreground/70 hover:text-gold inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to villa
          </Link>
        </div>
      </header>

      {/* Page content — child route renders here */}
      <Outlet />

      {/* Footer */}
      <footer className="bg-background border-t border-border/60 py-10 px-6 text-center text-sm text-muted-foreground">
        <p className="mb-1">© {new Date().getFullYear()} Villa Sekar Jawa Heritage</p>
        <p className="text-xs text-muted-foreground/70">Prototype · No real transactions</p>
      </footer>
    </div>
  );
}
