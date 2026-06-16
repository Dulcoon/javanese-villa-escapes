import * as React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BedDouble, Bath, Users, Maximize, Eye, Check, ChevronRight, Minus, Plus, Calendar as CalendarIcon, Users as UsersIcon } from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getRoom, rooms, formatIDR, type Room } from "@/lib/rooms";

import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  checkIn: fallback(z.string(), "").default(""),
  checkOut: fallback(z.string(), "").default(""),
  guests: fallback(z.number().int().min(1), 2).default(2),
});

export const Route = createFileRoute("/rooms/$slug")({
  validateSearch: zodValidator(searchSchema),
  loader: ({ params }) => {
    const room = getRoom(params.slug);
    if (!room) throw notFound();
    return { room };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.room.name} — Marme Villa Jogja` },
      { name: "description", content: loaderData?.room.desc },
      { property: "og:title", content: `${loaderData?.room.name} — Marme Villa Jogja` },
      { property: "og:description", content: loaderData?.room.desc },
      { property: "og:image", content: loaderData?.room.img },
    ],
  }),
  component: RoomDetail,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-3xl text-primary">Villa tidak ditemukan</h1>
        <Link to="/" className="mt-6 inline-block text-gold underline">Kembali ke beranda</Link>
      </div>
    </div>
  ),
  errorComponent: () => <div className="p-10">Terjadi kesalahan.</div>,
});

function RoomDetail() {
  const { room } = Route.useLoaderData() as { room: Room };
  const stats = [
    { icon: Maximize, label: room.size },
    { icon: BedDouble, label: `Ranjang ${room.bed}` },
    { icon: Users, label: `${room.baseGuests} tamu` },
    { icon: Bath, label: `${room.bathrooms} kamar mandi` },
    { icon: Eye, label: room.view },
  ];

  const searchParams = Route.useSearch();

  const initialFrom = searchParams.checkIn ? new Date(searchParams.checkIn) : startOfToday();
  const initialTo = searchParams.checkOut ? new Date(searchParams.checkOut) : addDays(startOfToday(), 1);

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: initialFrom,
    to: initialTo,
  });

  const [adults, setAdults] = React.useState(searchParams.guests);
  const [children, setChildren] = React.useState(0);
  const [infants, setInfants] = React.useState(0);

  const totalGuests = adults + children;

  const disabledDates = [
    addDays(startOfToday(), 3),
    addDays(startOfToday(), 4),
    addDays(startOfToday(), 5),
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Top bar */}
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
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="text-xs tracking-wide text-muted-foreground mb-6 flex items-center gap-2">
            <Link to="/" className="hover:text-gold">Beranda</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Akomodasi</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary">{room.name}</span>
          </nav>
          <div className="grid lg:grid-cols-2 gap-10 items-end">
            <div>
              <span className="eyebrow">Paviliun Pribadi</span>
              <h1 className="font-serif text-4xl md:text-6xl mt-4 leading-tight text-balance">{room.name}</h1>
              <p className="mt-6 text-lg text-muted-foreground italic">{room.tagline}</p>
            </div>
            <div className="lg:text-right">
              <div className="font-sans text-4xl font-semibold text-primary">{formatIDR(room.price)}</div>
              <div className="eyebrow text-muted-foreground mt-1">per malam · termasuk pajak</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4 auto-rows-[260px] md:auto-rows-[360px]">
          <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-2xl">
            <img src={room.gallery[0]} alt={room.name} className="h-full w-full object-cover" />
          </div>
          {room.gallery.slice(1, 3).map((g, i) => (
            <div key={i} className="overflow-hidden rounded-2xl">
              <img src={g} alt={`${room.name} ${i + 2}`} className="h-full w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* Details */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pb-10 border-b border-border/60">
              {stats.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col gap-2">
                  <Icon className="h-5 w-5 text-gold" strokeWidth={1.25} />
                  <div className="text-sm text-foreground">{label}</div>
                </div>
              ))}
            </div>

            <div>
              <span className="eyebrow">Suite</span>
              <h2 className="font-serif text-3xl md:text-4xl mt-3">Dunia yang intim, diukir dengan tangan.</h2>
              {room.longDesc.map((p, i) => (
                <p key={i} className="mt-6 text-muted-foreground leading-relaxed text-lg">{p}</p>
              ))}
            </div>

            <div>
              <span className="eyebrow">Fitur Unggulan</span>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                {room.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-foreground">
                    <Check className="h-4 w-4 text-gold mt-1 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="eyebrow">Fasilitas Kamar</span>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                {room.amenities.map((a) => (
                  <li key={a} className="flex items-start gap-3 text-muted-foreground">
                    <Check className="h-4 w-4 text-gold mt-1 shrink-0" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Booking card */}
          <aside className="lg:sticky lg:top-28 self-start">
            <div className="border border-border/60 bg-ivory/40 p-8 rounded-2xl">
              <div className="font-sans text-3xl font-semibold text-primary">{formatIDR(room.price)}</div>
              <div className="eyebrow text-muted-foreground mt-1">per malam</div>
              
              <div className="mt-6 space-y-4">
                {/* Date Picker */}
                <div>
                  <span className="eyebrow text-muted-foreground block mb-2">Pilih Tanggal</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center gap-3 p-3 bg-transparent border border-border/60 rounded-xl outline-none focus:border-gold hover:bg-black/5 text-left transition-colors">
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
                <div>
                  <span className="eyebrow text-muted-foreground block mb-2">Tamu</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center gap-3 p-3 bg-transparent border border-border/60 rounded-xl outline-none focus:border-gold hover:bg-black/5 text-left transition-colors">
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
                            <div className="text-xs text-muted-foreground">Usia 13+</div>
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
                            <div className="text-xs text-muted-foreground">Usia 2-12</div>
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
                            <div className="text-xs text-muted-foreground">Di bawah 2 tahun</div>
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

                        <div className="text-xs text-muted-foreground pt-4 border-t border-border/60">
                          Kapasitas villa adalah {room.baseGuests} tamu, lebih dari itu dikenakan biaya tambahan Rp 125.000/orang/malam. Balita tidak dihitung.
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Link
                to="/booking"
                search={{ 
                  room: room.slug, 
                  checkIn: date?.from ? format(date.from, "yyyy-MM-dd") : "",
                  checkOut: date?.to ? format(date.to, "yyyy-MM-dd") : "",
                  guests: totalGuests 
                }}
                disabled={!date?.from || !date?.to}
                className="mt-8 block text-center bg-gold text-gold-foreground py-4 font-medium tracking-wide hover:bg-gold/90 transition-colors rounded-full data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
              >
                Pesan Sekarang
              </Link>
              <a
                href="mailto:stay@sekarjawa.com"
                className="mt-3 block text-center border border-primary text-primary py-4 hover:bg-primary hover:text-primary-foreground transition-colors text-sm tracking-wide rounded-full"
              >
                Hubungi via Email
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* Other rooms */}
      <section className="py-24 px-6 bg-ivory/40">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="eyebrow">Paviliun Lainnya</span>
            <h2 className="font-serif text-3xl md:text-4xl mt-3">Jelajahi dunia pribadi kami yang lain.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {rooms.filter((r) => r.slug !== room.slug).map((r) => (
              <Link
                key={r.slug}
                to="/rooms/$slug"
                params={{ slug: r.slug }}
                className="group grid grid-cols-2 bg-background border border-border/60 overflow-hidden rounded-2xl"
              >
                <div className="aspect-square overflow-hidden">
                  <img src={r.img} alt={r.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <h3 className="font-serif text-xl text-primary">{r.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{r.desc}</p>
                  <div className="mt-4 text-sm text-gold tracking-wide">{formatIDR(r.price)} / malam</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-background border-t border-border/60 py-10 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Marme Villa Jogja
      </footer>
    </div>
  );
}
