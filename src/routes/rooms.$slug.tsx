import * as React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BedDouble, Bath, Users, Maximize, Eye, Check, ChevronRight, Minus, Plus, Calendar as CalendarIcon, Users as UsersIcon, MapPin } from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatIDR } from "@/lib/utils";
import { api, Villa, IMAGE_BASE_URL } from "@/lib/api";
import { Navbar } from "@/components/Navbar";

import { z } from "zod";
import { toast } from "sonner";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  checkIn: fallback(z.string(), "").default(""),
  checkOut: fallback(z.string(), "").default(""),
  guests: fallback(z.number().int().min(1), 2).default(2),
});

export const Route = createFileRoute("/rooms/$slug")({
  validateSearch: zodValidator(searchSchema),
  loader: async ({ params }) => {
    try {
      const [villaRes, villasRes, bookedDatesRes] = await Promise.all([
        api.getVilla(params.slug),
        api.getVillas(),
        api.getBookedDates(params.slug)
      ]);
      return { 
        room: villaRes.data,
        otherRooms: villasRes.data.filter((r: Villa) => r.slug !== params.slug),
        bookedDates: bookedDatesRes.data
      };
    } catch (err) {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { room } = loaderData;
    const images = room.images.map(img => `${IMAGE_BASE_URL}${img.image_url}`);
    return {
      meta: [
        { title: `${room.name} — Marme Villa Jogja` },
        { name: "description", content: room.description },
        { property: "og:title", content: `${room.name} — Marme Villa Jogja` },
        { property: "og:description", content: room.description },
        { property: "og:image", content: images[0] },
      ],
      links: [
        { rel: "preload", as: "image", href: images[0], fetchPriority: "high" },
        ...(images[1] ? [{ rel: "preload", as: "image", href: images[1] }] : []),
        ...(images[2] ? [{ rel: "preload", as: "image", href: images[2] }] : []),
      ],
    };
  },
  component: RoomDetail,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl text-primary">Villa tidak ditemukan</h1>
        <Link to="/" className="mt-6 inline-block text-gold underline">Kembali ke beranda</Link>
      </div>
    </div>
  ),
  errorComponent: () => <div className="p-10">Terjadi kesalahan.</div>,
});

function RoomDetail() {
  const { room, otherRooms, bookedDates } = Route.useLoaderData();
  const stats = [
    { icon: Maximize, label: room.size },
    { icon: BedDouble, label: `${room.bed_count} kamar tidur` },
    { icon: Users, label: `${room.capacity} tamu` },
    { icon: Bath, label: `${room.bathroom_count} kamar mandi` },
    { icon: Eye, label: room.view_description },
  ];

  const searchParams = Route.useSearch();

  const initialFrom = searchParams.checkIn ? new Date(searchParams.checkIn) : undefined;
  const initialTo = searchParams.checkOut ? new Date(searchParams.checkOut) : undefined;

  const [date, setDate] = React.useState<DateRange | undefined>(
    initialFrom || initialTo ? {
      from: initialFrom,
      to: initialTo,
    } : undefined
  );

  const [adults, setAdults] = React.useState(searchParams.guests);
  const [children, setChildren] = React.useState(0);
  const [infants, setInfants] = React.useState(0);

  const totalGuests = adults + children;

  const disabledDates = bookedDates.map((dateStr: string) => new Date(dateStr + "T00:00:00"));

  return (
    <div className="bg-background text-foreground">
      {/* Top bar */}
      <Navbar variant="back" backTo="/" backText="Kembali ke beranda" />

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
              <h1 className="text-4xl md:text-6xl font-bold mt-4 leading-tight text-balance">{room.name}</h1>
              <p className="mt-6 text-base md:text-lg text-muted-foreground italic">{room.tagline}</p>
              
              <div className="mt-6">
                <a 
                  href="https://maps.google.com/?q=Marme+Villa+Jogja,+Serayu,+Bantul,+Yogyakarta" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/30 bg-gold/5 hover:bg-gold/15 text-gold hover:text-gold-hover text-sm font-medium transition-all duration-300"
                >
                  <MapPin className="w-4 h-4" />
                  Lihat Lokasi di Google Maps
                </a>
              </div>
            </div>
            <div className="lg:text-right">
              <div className="font-sans text-4xl font-semibold text-primary">{formatIDR(room.base_price)}</div>
              <div className="eyebrow text-muted-foreground mt-1">per malam · termasuk pajak</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4 auto-rows-[260px] md:auto-rows-[360px]">
          <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-2xl bg-[#8B7355]/20">
            <img src={room.images[0] ? `${IMAGE_BASE_URL}${room.images[0].image_url}` : ''} alt={room.name} fetchPriority="high" decoding="sync" className="h-full w-full object-cover" />
          </div>
          {room.images.slice(1, 3).map((g, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-[#8B7355]/20">
              <img src={`${IMAGE_BASE_URL}${g.image_url}`} alt={`${room.name} ${i + 2}`} className="h-full w-full object-cover" loading="lazy" />
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
              <h2 className="text-3xl md:text-4xl mt-3 font-bold">Dunia yang intim, diukir dengan tangan.</h2>
              {room.long_description && room.long_description.map((p, i) => (
                <p key={i} className="mt-6 text-muted-foreground leading-relaxed text-base md:text-lg">{p}</p>
              ))}
            </div>

            <div>
              <span className="eyebrow">Fitur Unggulan</span>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                {room.features && room.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-foreground">
                    <Check className="h-4 w-4 text-gold mt-1 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {room.facilities && room.facilities.length > 0 && (
              <div>
                <span className="eyebrow mt-10 inline-block">Fasilitas Kamar</span>
                <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                  {room.facilities.map((f) => (
                    <li key={f.id} className="flex items-start gap-3 text-foreground">
                      <Check className="h-4 w-4 text-gold mt-1 shrink-0" /> {f.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* Booking card */}
          <aside className="lg:sticky lg:top-28 self-start">
            <div className="border border-border/60 bg-ivory/40 p-8 rounded-2xl">
              <div className="font-sans text-3xl font-semibold text-primary">{formatIDR(room.base_price)}</div>
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
                        numberOfMonths={1}
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

                        <div className="text-xs text-muted-foreground pt-4 border-t border-border/60">
                          Kapasitas villa adalah {room.capacity} tamu, lebih dari itu dikenakan biaya tambahan {formatIDR(room.extra_guest_fee)}/orang. Balita tidak dihitung.
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
                onClick={(e) => {
                  if (date?.from && date?.to && format(date.from, "yyyy-MM-dd") === format(date.to, "yyyy-MM-dd")) {
                    e.preventDefault();
                    toast.error("Minimal pemesanan 1 malam", { description: "Tanggal check-in dan check-out tidak boleh sama." });
                  }
                }}
                className="mt-8 block text-center bg-gold text-gold-foreground py-4 font-medium tracking-wide hover:bg-gold/90 transition-colors rounded-full data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
              >
                Pesan Sekarang
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Other rooms */}
      <section className="py-24 px-6 bg-ivory/40">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="eyebrow">Paviliun Lainnya</span>
            <h2 className="text-3xl md:text-4xl mt-3">Jelajahi dunia pribadi kami yang lain.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {otherRooms.map((r: Villa) => {
              const primaryImage = r.images.find(img => img.is_primary) || r.images[0];
              const imageUrl = primaryImage ? `${IMAGE_BASE_URL}${primaryImage.image_url}` : '';

              return (
                <Link
                  key={r.slug}
                  to="/rooms/$slug"
                  params={{ slug: r.slug }}
                  className="group grid grid-cols-2 bg-background border border-border/60 overflow-hidden rounded-2xl"
                >
                  <div className="aspect-square overflow-hidden">
                    <img src={imageUrl} alt={r.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <h3 className="font-manrope text-xl font-semibold text-primary">{r.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{r.description}</p>
                    <div className="mt-4 text-sm text-gold tracking-wide">{formatIDR(r.base_price)} / malam</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="bg-background border-t border-border/60 py-10 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Marme Villa Jogja
      </footer>
    </div>
  );
}
