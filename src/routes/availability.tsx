import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { ArrowLeft, Calendar as CalendarIcon, Users as UsersIcon, Minus, Plus, Check, Search, BedDouble, Maximize, Eye } from "lucide-react";
import { rooms, formatIDR } from "@/lib/rooms";
import { format, addDays, startOfToday } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const searchSchema = z.object({
  checkIn: fallback(z.string(), "").default(""),
  checkOut: fallback(z.string(), "").default(""),
  guests: fallback(z.number().int().min(1), 2).default(2),
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

function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

function AvailabilityPage() {
  const params = Route.useSearch();

  const initialFrom = params.checkIn ? new Date(params.checkIn) : startOfToday();
  const initialTo = params.checkOut ? new Date(params.checkOut) : addDays(startOfToday(), 3);

  const [date, setDate] = useState<DateRange | undefined>({
    from: initialFrom,
    to: initialTo,
  });

  const [adults, setAdults] = useState(params.guests);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [searched, setSearched] = useState(false);

  const totalGuests = adults + children;

  const checkInStr = date?.from ? format(date.from, "yyyy-MM-dd") : "";
  const checkOutStr = date?.to ? format(date.to, "yyyy-MM-dd") : "";
  const nights = nightsBetween(checkInStr, checkOutStr);

  const disabledDates = [
    addDays(startOfToday(), 3),
    addDays(startOfToday(), 4),
    addDays(startOfToday(), 5),
  ];

  // Mock availability — deterministic based on date
  const available = rooms.map((r) => {
    const seed = date?.from ? (date.from.getDate() + r.slug.length) % 5 : 0;
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
            <span className="font-manrope text-[26px] tracking-[0.08em] font-normal text-primary">MARME</span>
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
          <h1 className="text-4xl md:text-5xl mt-4">Cari Ketersediaan</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Pilih tanggal dan jumlah tamu Anda. Kami akan menampilkan ketersediaan kamar dan harga terbaik untuk tiga paviliun warisan budaya kami.
          </p>
        </div>
      </section>

      {/* Search bar */}
      <section className="px-6 -mt-10 relative z-20">
        <div className="max-w-5xl mx-auto bg-background shadow-luxe border border-border/60 overflow-visible rounded-2xl">
          <form
            onSubmit={(e) => { e.preventDefault(); setSearched(true); }}
            className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border"
          >
            {/* Date Picker */}
            <div className="p-4 md:p-6">
              <span className="eyebrow text-muted-foreground block mb-2 text-[10px]">Tanggal Menginap</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="w-full flex items-center gap-3 p-3 bg-transparent border border-border/60 rounded-xl outline-none focus:border-gold hover:bg-black/5 text-left transition-colors">
                    <CalendarIcon className="h-4 w-4 text-gold" />
                    <span className="flex-1 text-sm text-foreground font-medium">
                      {date?.from ? (
                        date.to ? (
                          <>{format(date.from, "d MMM yyyy", { locale: id })} - {format(date.to, "d MMM yyyy", { locale: id })}</>
                        ) : (
                          format(date.from, "d MMM yyyy", { locale: id })
                        )
                      ) : (
                        <span className="text-muted-foreground font-normal">Check-in - Check-out</span>
                      )}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    disabled={[
                      { before: startOfToday() },
                      ...disabledDates
                    ]}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Guest Picker */}
            <div className="p-4 md:p-6">
              <span className="eyebrow text-muted-foreground block mb-2 text-[10px]">Tamu</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="w-full flex items-center gap-3 p-3 bg-transparent border border-border/60 rounded-xl outline-none focus:border-gold hover:bg-black/5 text-left transition-colors">
                    <UsersIcon className="h-4 w-4 text-gold" />
                    <span className="flex-1 text-sm text-foreground font-medium">
                      {totalGuests} Tamu{infants > 0 ? `, ${infants} Balita` : ''}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-6 rounded-2xl" align="start">
                  <div className="space-y-6">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-foreground">Dewasa</div>
                        <div className="text-xs text-muted-foreground">Usia 17+</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          disabled={adults <= 1}
                          onClick={() => setAdults(a => a - 1)}
                          className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center text-foreground hover:border-gold disabled:opacity-30 disabled:hover:border-border/60 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center text-sm font-medium text-foreground">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults(a => a + 1)}
                          className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center text-foreground hover:border-gold disabled:opacity-30 disabled:hover:border-border/60 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-foreground">Anak-anak</div>
                        <div className="text-xs text-muted-foreground">Usia 5+</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          disabled={children <= 0}
                          onClick={() => setChildren(a => a - 1)}
                          className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center text-foreground hover:border-gold disabled:opacity-30 disabled:hover:border-border/60 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center text-sm font-medium text-foreground">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren(a => a + 1)}
                          className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center text-foreground hover:border-gold disabled:opacity-30 disabled:hover:border-border/60 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-foreground">Balita</div>
                        <div className="text-xs text-muted-foreground">Di bawah 5 tahun</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          disabled={infants <= 0}
                          onClick={() => setInfants(a => a - 1)}
                          className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center text-foreground hover:border-gold disabled:opacity-30 disabled:hover:border-border/60 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center text-sm font-medium text-foreground">{infants}</span>
                        <button
                          type="button"
                          disabled={infants >= 5}
                          onClick={() => setInfants(a => a + 1)}
                          className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center text-foreground hover:border-gold disabled:opacity-30 disabled:hover:border-border/60 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <button type="submit" disabled={!date?.from || !date?.to} className="bg-primary text-primary-foreground font-medium tracking-wide hover:bg-primary/90 transition-colors py-6 md:py-0 px-8 flex items-center justify-center gap-2 data-[disabled]:opacity-50 data-[disabled]:pointer-events-none rounded-b-2xl md:rounded-b-none md:rounded-r-2xl">
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
              <h2 className="text-3xl mt-2">
                {nights > 0 ? `${nights} malam · ${totalGuests} tamu` : "Pilih tanggal Anda"}
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
                      <h3 className="font-manrope text-2xl font-semibold text-primary hover:text-gold transition-colors">{r.name}</h3>
                    </Link>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><Maximize className="h-3.5 w-3.5 text-gold" />{r.size}</span>
                      <span className="inline-flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 text-gold" />Ranjang {r.bed}</span>
                      <span className="inline-flex items-center gap-1.5"><UsersIcon className="h-3.5 w-3.5 text-gold" />Hingga {r.baseGuests} tamu</span>
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
                        search={{ room: r.slug, checkIn: checkInStr, checkOut: checkOutStr, guests: totalGuests }}
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
