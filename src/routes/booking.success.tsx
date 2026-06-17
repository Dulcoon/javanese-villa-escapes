import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { CheckCircle, Calendar, Users, BedDouble, Mail, Home } from "lucide-react";
import { getRoom, formatIDR } from "@/lib/rooms";

const searchSchema = z.object({
  room: fallback(z.string(), "").default(""),
  checkIn: fallback(z.string(), "").default(""),
  checkOut: fallback(z.string(), "").default(""),
  guests: fallback(z.number().int().min(1), 2).default(2),
  name: fallback(z.string(), "Guest").default("Guest"),
  email: fallback(z.string(), "").default(""),
  total: fallback(z.number(), 0).default(0),
});

export const Route = createFileRoute("/booking/success")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Reservasi Terkonfirmasi — Marme Villa Jogja" },
      { name: "description", content: "Reservasi Anda di Marme Villa Jogja telah berhasil dikonfirmasi." },
    ],
  }),
  component: BookingSuccessPage,
});

function generateRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "MAR-";
  for (let i = 0; i < 8; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

function BookingSuccessPage() {
  const params = Route.useSearch();
  const selectedRoom = params.room ? getRoom(params.room) : null;
  const nights = nightsBetween(params.checkIn, params.checkOut);
  const bookingRef = generateRef();

  return (
    <main className="pt-20">
      {/* Confirmation hero */}
      <section className="pt-16 pb-12 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex mx-auto items-center justify-center w-20 h-20 rounded-full bg-gold/10 mb-6">
            <CheckCircle className="h-10 w-10 text-gold" strokeWidth={1.25} />
          </div>
          <div className="eyebrow">Reservasi Terkonfirmasi</div>
          <h1 className="text-4xl md:text-5xl mt-3">Terima Kasih, {params.name.split(" ")[0]}!</h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Pesanan Anda di Marme Villa Jogja telah dikonfirmasi.
          </p>
          <div className="mt-6 inline-block bg-ivory/60 border border-border/60 px-6 py-3">
            <span className="text-xs text-muted-foreground tracking-widest uppercase">Nomor Pesanan</span>
            <div className="font-mono text-xl text-primary tracking-wider mt-1">{bookingRef}</div>
          </div>
        </div>
      </section>

      {/* Booking details */}
      <section className="px-6 pb-12">
        <div className="max-w-2xl mx-auto border border-border/60 bg-ivory/40 p-8">
          <h2 className="text-2xl text-primary mb-6">Ringkasan Pesanan</h2>

          {selectedRoom && (
            <div className="flex items-start gap-5 pb-6 border-b border-border/60 mb-6">
              <div className="w-20 h-20 shrink-0 overflow-hidden">
                <img src={selectedRoom.img} alt={selectedRoom.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl text-primary">{selectedRoom.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedRoom.desc}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gold" /> Check-in
              </div>
              <div className="font-medium">{params.checkIn || "—"}</div>
              <div className="text-xs text-muted-foreground">From 2:00 PM</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gold" /> Check-out
              </div>
              <div className="font-medium">{params.checkOut || "—"}</div>
              <div className="text-xs text-muted-foreground">Until 12:00 PM</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-1.5">
                <BedDouble className="h-3.5 w-3.5 text-gold" /> Nights
              </div>
              <div className="font-medium">{nights} {nights === 1 ? "night" : "nights"}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-gold" /> Guests
              </div>
              <div className="font-medium">{params.guests} {params.guests === 1 ? "guest" : "guests"}</div>
            </div>
            <div className="col-span-2">
              <div className="text-muted-foreground mb-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gold" /> Confirmation sent to
              </div>
              <div className="font-medium">{params.email || "—"}</div>
            </div>
          </div>

          {params.total > 0 && (
            <div className="mt-6 pt-6 border-t border-border/60 flex justify-between items-baseline">
              <span className="text-lg text-primary">Total</span>
              <span className="text-3xl text-primary">{formatIDR(params.total)}</span>
            </div>
          )}
        </div>
      </section>

      {/* What's next */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl text-primary mb-8 text-center">Langkah Selanjutnya</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="border border-border/60 p-6 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/5 mb-4 text-primary text-lg">1</div>
              <h3 className="font-medium mb-2">Cek Email Anda</h3>
              <p className="text-xs text-muted-foreground">Kami telah mengirimkan konfirmasi pesanan ke <strong>{params.email || "email Anda"}</strong> beserta semua rinciannya.</p>
            </div>
            <div className="border border-border/60 p-6 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/5 mb-4 text-primary text-lg">2</div>
              <h3 className="font-medium mb-2">Persiapkan Kunjungan</h3>
              <p className="text-xs text-muted-foreground">Bawa barang secukupnya, jangan lupa kamera, dan bersiaplah untuk pengalaman budaya Jawa yang tak terlupakan.</p>
            </div>
            <div className="border border-border/60 p-6 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/5 mb-4 text-primary text-lg">3</div>
              <h3 className="font-medium mb-2">Tiba & Bersantai</h3>
              <p className="text-xs text-muted-foreground">Tim kami akan menyambut Anda dengan sapaan tradisional Jawa dan ritual penyambutan.</p>
            </div>
          </div>

          <div className="mt-10 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Ada pertanyaan? <a href="mailto:stay@marmevillajogja.com" className="text-gold hover:underline">stay@marmevillajogja.com</a> · +62 361 1234 567
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 font-medium tracking-wide hover:bg-primary/90 transition-colors"
            >
              <Home className="h-4 w-4" /> Kembali ke beranda
            </Link>
          </div>

          {/* Prototype notice */}
          <p className="mt-8 text-center text-xs text-muted-foreground">
            ⚡ This is a prototype demonstration. No actual booking has been stored or emailed.
          </p>
        </div>
      </section>
    </main>
  );
}
