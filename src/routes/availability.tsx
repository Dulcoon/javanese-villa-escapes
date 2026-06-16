import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { ArrowLeft, Calendar, Users, Minus, Plus, Check, Search, BedDouble, Maximize, Eye } from "lucide-react";
import { rooms, formatIDR } from "@/lib/rooms";

const searchSchema = z.object({
  checkIn: fallback(z.string(), "").default(""),
  checkOut: fallback(z.string(), "").default(""),
  guests: fallback(z.number().int().min(1).max(10), 2).default(2),
  room: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/availability")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Cari Ketersediaan — Marme Villa Jogja" },
      { name: "description", content: "Cari ketersediaan kamar secara langsung di tiga paviliun warisan budaya kami." },
      { property: "og:title", content: "Cari Ketersediaan — Marme Villa Jogja" },
      { property: "og:description", content: "Find your dates and reserve a private heritage pavilion." },
    ],
  }),
  component: AvailabilityPage,
});

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d: string, n: number) =>
  new Date(new Date(d || today()).getTime() + n * 86400000).toISOString().slice(0, 10);

function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

function AvailabilityPage() {
  const params = Route.useSearch();
  const [checkIn, setCheckIn] = useState(params.checkIn || today());
  const [checkOut, setCheckOut] = useState(params.checkOut || addDays(today(), 3));
  const [guests, setGuests] = useState(params.guests);
  const [searched, setSearched] = useState(false);

  const nights = nightsBetween(checkIn, checkOut);

  // Mock availability — deterministic based on date
  const available = rooms.map((r) => {
    const seed = (new Date(checkIn).getDate() + r.slug.length) % 5;
    return {
      ...r,
      isAvailable: seed !== 0,
      remaining: Math.max(1, 3 - (seed % 3)),
    };
  });

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-serif text-[26px] tracking-[0.08em] font-normal text-primary">MARME</span>
            <span className="font-sans text-[9.5px] tracking-[0.42em] font-light text-muted-foreground mt-1.5 ml-0.5 uppercase">VILLA JOGJA</span>
          </Link>
          <Link to="/" className="text-sm text-foreground/70 hover:text-gold inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali ke villa
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 bg-ivory/40 border-b border-border/60">
        <div className="max-w-5xl mx-auto text-center">
          <span className="eyebrow">Reservasi</span>
          <h1 className="font-serif text-4xl md:text-5xl mt-4">Cari Ketersediaan</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Pilih tanggal dan jumlah tamu Anda. Kami akan menampilkan ketersediaan kamar dan harga terbaik untuk tiga paviliun warisan budaya kami.
          </p>
        </div>
      </section>

      {/* Search bar */}
      <section className="px-6 -mt-10">
        <div className="max-w-5xl mx-auto bg-background shadow-luxe border border-border/60 overflow-hidden rounded-2xl">
          <form
            onSubmit={(e) => { e.preventDefault(); setSearched(true); }}
            className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border"
          >
            <label className="p-6 block">
              <div className="eyebrow text-muted-foreground mb-2 text-[10px] flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Tanggal Masuk
              </div>
              <input type="date" value={checkIn} min={today()} onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent outline-none text-foreground" />
            </label>
            <label className="p-6 block">
              <div className="eyebrow text-muted-foreground mb-2 text-[10px] flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Tanggal Keluar
              </div>
              <input type="date" value={checkOut} min={addDays(checkIn || today(), 1)} onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent outline-none text-foreground" />
            </label>
            <div className="p-6">
              <div className="eyebrow text-muted-foreground mb-2 text-[10px] flex items-center gap-2">
                <Users className="h-3 w-3" /> Tamu
              </div>
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="p-1 text-muted-foreground hover:text-primary"><Minus className="h-4 w-4" /></button>
                <span className="font-medium">{guests} Tamu</span>
                <button type="button" onClick={() => setGuests(Math.min(10, guests + 1))} className="p-1 text-muted-foreground hover:text-primary"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <button type="submit" className="bg-primary text-primary-foreground font-medium tracking-wide hover:bg-primary/90 transition-colors py-6 md:py-0 px-8 inline-flex items-center justify-center gap-2">
              <Search className="h-4 w-4" /> Cari
            </button>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <span className="eyebrow">Paviliun Tersedia</span>
              <h2 className="font-serif text-3xl mt-2">
                {nights > 0 ? `${nights} malam · ${guests} tamu` : "Pilih tanggal Anda"}
              </h2>
            </div>
            {searched && (
              <div className="text-sm text-muted-foreground">
                {available.filter((r) => r.isAvailable).length} dari {rooms.length} paviliun tersedia
              </div>
            )}
          </div>

          <div className="space-y-6">
            {available.map((r) => {
              const total = r.price * Math.max(nights, 1);
              return (
                <article key={r.slug} className={`grid md:grid-cols-[280px_1fr_auto] gap-6 bg-background border border-border/60 overflow-hidden rounded-2xl ${!r.isAvailable ? "opacity-60" : ""}`}>
                  <Link to="/rooms/$slug" params={{ slug: r.slug }} className="aspect-[4/3] md:aspect-auto overflow-hidden">
                    <img src={r.img} alt={r.name} className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" />
                  </Link>
                  <div className="p-6 md:py-8">
                    <Link to="/rooms/$slug" params={{ slug: r.slug }}>
                      <h3 className="font-serif text-2xl text-primary hover:text-gold transition-colors">{r.name}</h3>
                    </Link>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><Maximize className="h-3.5 w-3.5 text-gold" />{r.size}</span>
                      <span className="inline-flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 text-gold" />Ranjang {r.bed}</span>
                      <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-gold" />Hingga {r.baseGuests} tamu</span>
                      <span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-gold" />{r.view}</span>
                    </div>
                    {r.isAvailable && (
                      <div className="mt-4 inline-flex items-center gap-2 text-xs text-gold">
                        <Check className="h-3.5 w-3.5" /> Tersisa {r.remaining} paviliun dengan harga ini
                      </div>
                    )}
                  </div>
                  <div className="p-6 md:py-8 md:pr-8 md:text-right border-t md:border-t-0 md:border-l border-border/60 flex md:flex-col items-center md:items-end justify-between gap-4">
                    <div>
                      <div className="font-sans text-2xl font-semibold text-primary">{formatIDR(r.price)}</div>
                      <div className="eyebrow text-muted-foreground mt-1">per malam</div>
                      {nights > 0 && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          Total: <span className="text-foreground font-medium">{formatIDR(total)}</span>
                        </div>
                      )}
                    </div>
                    {r.isAvailable ? (
                      <Link
                        to="/booking"
                        search={{ room: r.slug, checkIn, checkOut, guests }}
                        className="px-6 py-3 bg-gold text-gold-foreground font-medium tracking-wide hover:bg-gold/90 transition-colors text-sm whitespace-nowrap rounded-full"
                      >
                        Pesan Sekarang
                      </Link>
                    ) : (
                      <span className="px-6 py-3 border border-border text-muted-foreground text-sm whitespace-nowrap rounded-full">
                        Habis dipesan
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            Harga sudah termasuk sarapan harian, ritual penyambutan, dan teh sore. Pajak pemerintah & pelayanan sebesar 11% dikenakan saat pembayaran.
          </p>
        </div>
      </section>

      <footer className="bg-background border-t border-border/60 py-10 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Marme Villa Jogja
      </footer>
    </div>
  );
}
