import * as React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BedDouble, Bath, Users, Maximize, Eye, Check, ChevronRight, Minus, Plus, Calendar as CalendarIcon, Users as UsersIcon, MapPin, Share, Heart, Star } from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatIDR } from "@/lib/utils";
import { api, Villa, IMAGE_BASE_URL } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { useTranslation } from "@/lib/i18n/LanguageContext";

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
  const { t, tDynamic } = useTranslation();
  const stats = [
    { icon: Maximize, label: room.size },
    { icon: BedDouble, label: `${room.bed_count} ${t("rooms.bedroom")}` },
    { icon: Users, label: `${room.capacity} ${t("rooms.guest")}` },
    { icon: Bath, label: `${room.bathroom_count} ${t("room.bathroom")}` },
    { icon: Eye, label: tDynamic(room, "view_description") },
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

  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(1);

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const width = carouselRef.current.clientWidth;
    const newIndex = Math.round(scrollLeft / width) + 1;
    setCurrentImageIndex(newIndex);
  };

  return (
    <div className="bg-background text-foreground">
      {/* Desktop Top Bar */}
      <div className="hidden md:block">
        <Navbar variant="back" backTo="/" backText={t("nav.back")} />
      </div>

      {/* MOBILE HEADER: Carousel + Actions */}
      <div className="md:hidden relative w-full h-[45vh] bg-black/5">
        {/* Top Actions Overlay */}
        <div className="absolute top-6 left-4 right-4 flex justify-between items-start z-10">
          <Link to="/" className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-black shadow-sm shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="bg-white/90 backdrop-blur-md text-black text-[13px] font-semibold px-4 py-2 rounded-full shadow-sm">
            {room.images[currentImageIndex - 1]?.album || 'Lainnya'}
          </div>
        </div>

        {/* Carousel */}
        <div 
          className="w-full h-full overflow-x-auto snap-x snap-mandatory flex hide-scrollbar" 
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          onClick={() => setIsGalleryOpen(true)}
        >
          {room.images.map((img) => (
            <div key={img.id} className="w-full h-full flex-none snap-center snap-always relative">
               <img src={`${IMAGE_BASE_URL}${img.image_url}`} alt={room.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>

        {/* Counter Badge */}
        <div className="absolute bottom-8 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide px-3 py-1 rounded-md">
          {currentImageIndex} / {room.images.length}
        </div>
      </div>

      {/* DESKTOP HERO */}
      <section className="hidden md:block pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="text-xs tracking-wide text-muted-foreground mb-6 flex items-center gap-2">
            <Link to="/" className="hover:text-gold">{t("nav.home")}</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{t("rooms.eyebrow")}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary">{room.name}</span>
          </nav>
          <div className="grid lg:grid-cols-2 gap-10 items-end">
            <div>
              <span className="eyebrow">{t("room.pavilion")}</span>
              <h1 className="text-4xl md:text-6xl font-bold mt-4 leading-tight text-balance">{room.name}</h1>
              <p className="mt-6 text-base md:text-lg text-muted-foreground italic">{tDynamic(room, "tagline")}</p>
              
              <div className="mt-6">
                <a 
                  href="https://maps.google.com/?q=Marme+Villa+Jogja,+Serayu,+Bantul,+Yogyakarta" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/30 bg-gold/5 hover:bg-gold/15 text-gold hover:text-gold-hover text-sm font-medium transition-all duration-300"
                >
                  <MapPin className="w-4 h-4" />
                  {t("room.map")}
                </a>
              </div>
            </div>
            <div className="lg:text-right">
              <div className="font-sans text-4xl font-semibold text-primary">{formatIDR(room.base_price)}</div>
              <div className="eyebrow text-muted-foreground mt-1">{t("rooms.pernight")} · {t("room.tax")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* DESKTOP GALLERY */}
      <section className="hidden md:block px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4 auto-rows-[360px] relative group cursor-pointer" onClick={() => setIsGalleryOpen(true)}>
          <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-2xl bg-[#8B7355]/20">
            <img src={room.images[0] ? `${IMAGE_BASE_URL}${room.images[0].image_url}` : ''} alt={room.name} fetchPriority="high" decoding="sync" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
          </div>
          {room.images.slice(1, 3).map((g, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-[#8B7355]/20 relative">
              <img src={`${IMAGE_BASE_URL}${g.image_url}`} alt={`${room.name} ${i + 2}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" loading="lazy" />
              {i === 1 && room.images.length > 3 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white text-black px-4 py-2 rounded-lg font-medium shadow-lg flex items-center gap-2">
                    <Maximize className="w-4 h-4" />
                    {t("room.showall", { count: room.images.length })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Modal */}
      <GalleryModal 
        isOpen={isGalleryOpen} 
        onClose={() => setIsGalleryOpen(false)} 
        images={room.images} 
        roomName={room.name} 
      />

      {/* Details Section */}
      <section className="relative bg-background md:bg-transparent rounded-t-3xl md:rounded-none -mt-6 md:mt-0 pt-6 md:pt-24 px-6 z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10 md:gap-16">
          <div className="lg:col-span-2 space-y-6 md:space-y-10">
            
            {/* Mobile Title Block */}
            <div className="md:hidden">
              <h1 className="text-[26px] font-bold leading-tight flex items-start gap-2">
                <span>{room.name}</span>
              </h1>
              <p className="text-sm text-foreground mt-2">
                {room.capacity} {t("rooms.guest")} · {room.bed_count} {t("rooms.bedroom")} · {room.bathroom_count} {t("room.bathroom")}
              </p>
              
              <div className="mt-5">
                <a 
                  href="https://maps.google.com/?q=Marme+Villa+Jogja,+Serayu,+Bantul,+Yogyakarta" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 text-gold text-[13px] font-medium transition-all active:scale-95"
                >
                  <MapPin className="w-4 h-4" />
                  {t("room.map")}
                </a>
              </div>
            </div>

            <hr className="md:hidden border-border/60 my-6" />

            {/* Desktop Stats */}
            <div className="hidden md:grid grid-cols-2 md:grid-cols-5 gap-6 pb-10 border-b border-border/60">
              {stats.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col gap-2">
                  <Icon className="h-5 w-5 text-gold" strokeWidth={1.25} />
                  <div className="text-sm text-foreground">{label}</div>
                </div>
              ))}
            </div>

            <div>
              <span className="hidden md:inline-block eyebrow">{t("room.suite")}</span>
              <h2 className="hidden md:block text-3xl md:text-4xl mt-3 font-bold">{t("room.slogan")}</h2>
              {tDynamic(room, "long_description") && tDynamic(room, "long_description").map((p: string, i: number) => (
                <p key={i} className="mt-6 text-foreground/90 leading-relaxed text-[15px] md:text-lg">{p}</p>
              ))}
            </div>

            <div>
              <span className="eyebrow">{t("room.features")}</span>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                {tDynamic(room, "features") && tDynamic(room, "features").map((f: string) => (
                  <li key={f} className="flex items-start gap-3 text-foreground">
                    <Check className="h-4 w-4 text-gold mt-1 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {room.facilities && room.facilities.length > 0 && (
              <div>
                <span className="eyebrow mt-10 inline-block">{t("room.facilities")}</span>
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
              <div className="eyebrow text-muted-foreground mt-1">{t("rooms.pernight")}</div>

              <div className="mt-6 space-y-4">
                {/* Date Picker */}
                <div>
                  <span className="eyebrow text-muted-foreground block mb-2">{t("room.choosedate")}</span>
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
                            <span className="text-muted-foreground font-normal">{t("room.checkinout")}</span>
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
                  <span className="eyebrow text-muted-foreground block mb-2">{t("booking.guest")}</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center gap-3 p-3 bg-transparent border border-border/60 rounded-xl outline-none focus:border-gold hover:bg-black/5 text-left transition-colors">
                        <UsersIcon className="h-4 w-4 text-gold" />
                        <span className="flex-1 text-sm text-foreground font-medium">
                          {totalGuests} {t("rooms.guest")}{infants > 0 ? `, ${infants} ${t("room.infant")}` : ''}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-6 rounded-2xl" align="start">
                      <div className="space-y-6">
                        {/* Adults */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-foreground">{t("room.adult")}</div>
                            <div className="text-xs text-muted-foreground">{t("room.adult.desc")}</div>
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
                            <div className="text-sm font-medium text-foreground">{t("room.child")}</div>
                            <div className="text-xs text-muted-foreground">{t("room.child.desc")}</div>
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
                            <div className="text-sm font-medium text-foreground">{t("room.infant")}</div>
                            <div className="text-xs text-muted-foreground">{t("room.infant.desc")}</div>
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
                          {t("room.capacity.desc", { capacity: room.capacity, fee: formatIDR(room.extra_guest_fee) })}
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
                    toast.error(t("room.minbook"), { description: t("room.minbook.desc") });
                  }
                }}
                className="mt-8 block text-center bg-gold text-gold-foreground py-4 font-medium tracking-wide hover:bg-gold/90 transition-colors rounded-full data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
              >
                {t("room.book")}
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Other rooms */}
      <section className="py-24 px-6 bg-ivory/40">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="eyebrow">{t("room.others")}</span>
            <h2 className="text-3xl md:text-4xl mt-3">{t("room.others.title")}</h2>
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
                  <div className="h-full overflow-hidden">
                    <img src={imageUrl} alt={r.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <h3 className="font-manrope text-xl font-semibold text-primary">{r.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{tDynamic(r, 'description')}</p>
                    <div className="mt-4 text-sm text-gold tracking-wide">{formatIDR(r.base_price)} / {t("rooms.pernight")}</div>
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

function GalleryModal({ isOpen, onClose, images, roomName }: { isOpen: boolean, onClose: () => void, images: any[], roomName: string }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [activeAlbum, setActiveAlbum] = React.useState(images[0]?.album || 'Lainnya');
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let timeoutId: any;

    const handleScroll = () => {
      // Throttle for performance
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const imageEls = container.querySelectorAll('[data-index]');
        let closest = null;
        let minDistance = Infinity;
        const containerCenter = container.scrollLeft + container.clientWidth / 2;

        imageEls.forEach(el => {
          const center = (el as HTMLElement).offsetLeft + (el as HTMLElement).clientWidth / 2;
          const distance = Math.abs(containerCenter - center);
          if (distance < minDistance) {
            minDistance = distance;
            closest = el;
          }
        });

        if (closest) {
          const index = parseInt((closest as HTMLElement).getAttribute('data-index') || '0', 10);
          setActiveIndex(index);
          setActiveAlbum((closest as HTMLElement).getAttribute('data-album') || 'Lainnya');
        }
      }, 50);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  // Group images to create thumbnails or grid view inside modal (optional for future)
  // For now we just implement the full-screen swipable carousel
  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-10 transition-opacity">
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="font-semibold text-lg drop-shadow-md">
          {activeAlbum}
        </div>
        <div className="text-sm text-white/90 font-medium drop-shadow-md">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Scrollable Carousel Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto flex snap-x snap-mandatory hide-scrollbar items-center"
      >
        {images.map((img, idx) => (
          <div 
            key={img.id} 
            data-index={idx}
            data-album={img.album || 'Lainnya'}
            className="flex-none w-full h-full snap-center snap-always flex items-center justify-center p-0 md:p-10"
          >
            <img 
              src={`${IMAGE_BASE_URL}${img.image_url}`} 
              alt={`${roomName} - ${img.album || 'Lainnya'}`}
              loading="lazy"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ))}
      </div>
      
      {/* CSS to hide scrollbar */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
