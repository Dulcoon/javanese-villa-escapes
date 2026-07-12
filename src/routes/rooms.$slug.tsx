import * as React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BedDouble, Bath, Users, Maximize, Eye, Check, ChevronRight, Minus, Plus, Calendar as CalendarIcon, Users as UsersIcon, MapPin, Share, Heart, Star, X } from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { IconRenderer } from "@/utils/icon-mapper";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { formatIDR } from "@/lib/utils";
import { api, Villa, IMAGE_BASE_URL } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { AlertModal } from "@/components/ui/AlertModal";

import { z } from "zod";
import { toast } from "sonner";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  checkIn: fallback(z.string(), "").default(""),
  checkOut: fallback(z.string(), "").default(""),
  guests: fallback(z.number().int().min(1), 2).default(2),
});

function sortVillaImages(images: any[], albumOrder?: string[]) {
  if (!images || images.length <= 1) return images;

  const primaryImg = images.find(img => img.is_primary) || images[0];
  const primaryImgId = primaryImg.id;

  // Filter out primary image from the rest to prevent duplication inside its album!
  const otherImgs = images.filter(img => img.id !== primaryImgId);

  // Group the remaining images by album
  const groups: Record<string, any[]> = {};
  otherImgs.forEach(img => {
    const album = img.album || 'Lainnya';
    if (!groups[album]) {
      groups[album] = [];
    }
    groups[album].push(img);
  });

  // The primary image goes first (cover/thumbnail)
  const result = [primaryImg];

  // Determine the order of albums:
  // 1. By index in albumOrder.
  // 2. Alphabetically for unordered.
  // 3. 'Lainnya' is always last.
  const order = albumOrder || [];
  const existingAlbums = Object.keys(groups);

  const sortedAlbums = existingAlbums.sort((a, b) => {
    if (a === 'Lainnya') return 1;
    if (b === 'Lainnya') return -1;

    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) {
      return -1;
    }
    if (indexB !== -1) {
      return 1;
    }

    return a.localeCompare(b, 'id');
  });

  sortedAlbums.forEach(album => {
    result.push(...groups[album]);
  });

  return result;
}

export const Route = createFileRoute("/rooms/$slug")({
  validateSearch: zodValidator(searchSchema),
  loader: async ({ params }) => {
    try {
      const [villaRes, villasRes, bookedDatesRes] = await Promise.all([
        api.getVilla(params.slug),
        api.getVillas(),
        api.getBookedDates(params.slug)
      ]);
      const room = villaRes.data;
      if (room && Array.isArray(room.images)) {
        room.images = sortVillaImages(room.images, room.album_order);
      }
      return { 
        room,
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
    
    // Choose custom SEO title/description if provided, else fallback to defaults
    const pageTitle = room.seo_title || `${room.name} — Marme Villa Jogja`;
    const pageDesc = room.seo_description || room.description;

    return {
      meta: [
        { title: pageTitle },
        { name: "description", content: pageDesc },
        { property: "og:title", content: pageTitle },
        { property: "og:description", content: pageDesc },
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
  const { lang, t, tDynamic } = useTranslation();
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

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      const fromStr = format(range.from, "yyyy-MM-dd");
      const toStr = format(range.to, "yyyy-MM-dd");
      if (fromStr === toStr) {
        setDate({ from: range.from, to: undefined });
        return;
      }
    }
    setDate(range);
  };

  const activeLocale = lang === "en" ? enUS : id;

  const hasRangeConflict = React.useMemo(() => {
    if (!date?.from || !date?.to) return false;
    let current = new Date(date.from.getFullYear(), date.from.getMonth(), date.from.getDate());
    const end = new Date(date.to.getFullYear(), date.to.getMonth(), date.to.getDate());
    // Move day by day from check-in (inclusive) to check-out (exclusive)
    while (current < end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const dateStr = String(current.getDate()).padStart(2, '0');
      const formatted = `${year}-${month}-${dateStr}`;
      if (bookedDates.includes(formatted)) {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }
    return false;
  }, [date, bookedDates]);

  const nightsCount = React.useMemo(() => {
    if (!date?.from || !date?.to) return 0;
    const diffTime = Math.abs(date.to.getTime() - date.from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [date]);

  const nightsText = React.useMemo(() => {
    if (nightsCount === 0) return "";
    if (lang === "en") {
      return t(nightsCount === 1 ? "booking.night" : "booking.nights", { count: nightsCount });
    }
    return t("booking.nights", { count: nightsCount });
  }, [nightsCount, lang, t]);

  const [adults, setAdults] = React.useState(searchParams.guests);
  const [children, setChildren] = React.useState(0);
  const [infants, setInfants] = React.useState(0);

  const totalGuests = adults + children;

  const isDateDisabled = (day: Date) => {
    const today = startOfToday();
    if (day < today) return true;

    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const dateStr = String(day.getDate()).padStart(2, '0');
    const formattedDay = `${year}-${month}-${dateStr}`;

    if (!date?.from) {
      return bookedDates.includes(formattedDay);
    }

    const checkIn = date.from;
    const checkInTime = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate()).getTime();
    const dayTime = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();

    if (dayTime <= checkInTime) return true;

    const bookedDatesSorted = [...bookedDates].sort();
    const checkInStr = `${checkIn.getFullYear()}-${String(checkIn.getMonth() + 1).padStart(2, '0')}-${String(checkIn.getDate()).padStart(2, '0')}`;
    
    const firstBookedDateAfterCheckIn = bookedDatesSorted.find(d => d > checkInStr);

    if (firstBookedDateAfterCheckIn) {
      const firstBookedTime = new Date(firstBookedDateAfterCheckIn + "T00:00:00").getTime();
      if (dayTime > firstBookedTime) {
        return true;
      }
    }

    return bookedDates.includes(formattedDay) && formattedDay !== firstBookedDateAfterCheckIn;
  };

  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(1);
  const [firstImageLoaded, setFirstImageLoaded] = React.useState(false);

  // Fallback to load other images after a short delay if onLoad doesn't fire (e.g. error, or cached image edge cases)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFirstImageLoaded(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const width = carouselRef.current.clientWidth;
    const newIndex = Math.round(scrollLeft / width) + 1;
    setCurrentImageIndex(newIndex);
  };

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `https://marmevillajogja.com/rooms/${room.slug}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": t("nav.home") || "Home",
            "item": "https://marmevillajogja.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": tDynamic(room, "name") || room.name,
            "item": `https://marmevillajogja.com/rooms/${room.slug}`
          }
        ]
      },
      {
        "@type": "HotelRoom",
        "@id": `https://marmevillajogja.com/rooms/${room.slug}#room`,
        "name": tDynamic(room, "name") || room.name,
        "description": tDynamic(room, "description") || room.description,
        "url": `https://marmevillajogja.com/rooms/${room.slug}`,
        "image": room.images.map(img => `${IMAGE_BASE_URL}${img.image_url}`),
        "bed": {
          "@type": "BedDetails",
          "numberOfBeds": room.bed_count,
          "typeOfBed": "Double Bed"
        },
        "occupancy": {
          "@type": "QuantitativeValue",
          "maxValue": room.capacity,
          "unitText": "people"
        },
        "offers": {
          "@type": "Offer",
          "price": room.base_price,
          "priceCurrency": "IDR",
          "availability": "https://schema.org/InStock",
          "validFrom": new Date().toISOString().split('T')[0]
        },
        "amenityFeature": room.facilities.map(facility => ({
          "@type": "LocationFeatureSpecification",
          "name": tDynamic(facility, "name") || facility.name,
          "value": true
        }))
      }
    ]
  };

  return (
    <div className="bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
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
          {currentImageIndex > 1 && (
            <div className="bg-white/90 backdrop-blur-md text-black text-[13px] font-semibold px-4 py-2 rounded-full shadow-sm">
              {room.images[currentImageIndex - 1]?.album || 'Lainnya'}
            </div>
          )}
        </div>

        {/* Carousel */}
        <div 
          className="w-full h-full overflow-x-auto snap-x snap-mandatory flex hide-scrollbar" 
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          onClick={() => setIsGalleryOpen(true)}
        >
          {room.images.map((img, idx) => (
            <div key={img.id} className="w-full h-full flex-none snap-center snap-always relative bg-[#8B7355]/10">
               {(idx === 0 || firstImageLoaded) ? (
                 <img 
                   src={`${IMAGE_BASE_URL}${img.image_url}`} 
                   alt={room.name} 
                   className="w-full h-full object-cover" 
                   loading={idx === 0 ? "eager" : "lazy"} 
                   onLoad={idx === 0 ? () => setFirstImageLoaded(true) : undefined}
                 />
               ) : null}
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
              <div className="font-sans text-4xl font-semibold text-primary">{formatIDR(room.display_price ?? room.base_price)}</div>
              <div className="eyebrow text-muted-foreground mt-1">{t("rooms.pernight")} · {t("room.tax")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* DESKTOP GALLERY */}
      <section className="hidden md:block px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4 auto-rows-[360px] relative group cursor-pointer" onClick={() => setIsGalleryOpen(true)}>
          <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-2xl bg-[#8B7355]/20">
            <img 
              src={room.images[0] ? `${IMAGE_BASE_URL}${room.images[0].image_url}` : ''} 
              alt={room.name} 
              fetchPriority="high" 
              decoding="sync" 
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" 
              onLoad={() => setFirstImageLoaded(true)}
            />
          </div>
          {room.images.slice(1, 3).map((g, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-[#8B7355]/20 relative">
              {firstImageLoaded ? (
                <img src={`${IMAGE_BASE_URL}${g.image_url}`} alt={`${room.name} ${i + 2}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" loading="lazy" />
              ) : null}
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
                      <IconRenderer name={f.icon || 'check_circle'} className="text-gold mt-1 shrink-0 text-[18px]" /> {tDynamic(f, 'name')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* Booking card */}
          <aside className="lg:sticky lg:top-28 self-start">
            <div className="border border-border/60 bg-ivory/40 p-8 rounded-2xl">
              <div className="font-sans text-3xl font-semibold text-primary">{formatIDR(room.display_price ?? room.base_price)}</div>
              <div className="eyebrow text-muted-foreground mt-1">{t("rooms.pernight")}</div>

              <div className="mt-6 space-y-4">
                {/* Date Picker */}
                <div>
                  <span className="eyebrow text-muted-foreground block mb-2">{t("room.choosedate")}</span>
                  
                  {/* Desktop view */}
                  <div className="hidden md:block">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full flex items-center gap-3 p-3 bg-transparent border border-border/60 rounded-xl outline-none focus:border-gold hover:bg-black/5 text-left transition-colors">
                          <CalendarIcon className="h-4 w-4 text-gold" />
                          <span className="flex-1 text-sm text-foreground font-medium">
                            {date?.from ? (
                              date.to ? (
                                <>{format(date.from, "d MMM yyyy", { locale: activeLocale })} - {format(date.to, "d MMM yyyy", { locale: activeLocale })}</>
                              ) : (
                                format(date.from, "d MMM yyyy", { locale: activeLocale })
                              )
                            ) : (
                              <span className="text-muted-foreground font-normal">{t("room.checkinout")}</span>
                            )}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                        {/* Real-time Selected Dates Summary & Warning for Desktop */}
                        <div className="p-4 border-b border-border/50 bg-muted/10">
                          <div className="flex items-center justify-between gap-4">
                             <div className="flex flex-col">
                              <span className="text-[0.6rem] eyebrow text-muted-foreground uppercase">{t("booking.checkin")}</span>
                              <span className="text-xs font-semibold text-foreground">
                                {date?.from ? format(date.from, "d MMM yyyy", { locale: activeLocale }) : "-"}
                              </span>
                            </div>
                            {nightsCount > 0 ? (
                              <span className="text-[0.65rem] px-2 py-0.5 bg-gold/15 text-gold rounded-full font-medium shrink-0">
                                {nightsText}
                              </span>
                            ) : (
                              <div className="w-4 h-[1px] bg-border" />
                            )}
                            <div className="flex flex-col text-right">
                              <span className="text-[0.6rem] eyebrow text-muted-foreground uppercase">{t("booking.checkout")}</span>
                              <span className="text-xs font-semibold text-foreground">
                                {date?.to ? format(date.to, "d MMM yyyy", { locale: activeLocale }) : "-"}
                              </span>
                            </div>
                          </div>
                          {hasRangeConflict && (
                            <div className="mt-2 text-[0.65rem] text-rose-500 font-medium flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              {t("booking.warning.unavailable")}
                            </div>
                          )}
                        </div>
                        <Calendar
                          mode="range"
                          defaultMonth={date?.from}
                          selected={date}
                          onSelect={handleDateSelect}
                          numberOfMonths={1}
                          disabled={isDateDisabled}
                        />
                        <div className="p-3 border-t border-border/50">
                          <button 
                            type="button"
                            onClick={() => setDate(undefined)} 
                            className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-lg transition-colors"
                          >
                            Reset
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Mobile view */}
                  <div className="md:hidden">
                    <Drawer>
                      <DrawerTrigger asChild>
                        <button className="w-full flex items-center gap-3 p-3 bg-transparent border border-border/60 rounded-xl outline-none focus:border-gold hover:bg-black/5 text-left transition-colors">
                          <CalendarIcon className="h-4 w-4 text-gold" />
                          <span className="flex-1 text-sm text-foreground font-medium">
                            {date?.from ? (
                              date.to ? (
                                <>{format(date.from, "d MMM yyyy", { locale: activeLocale })} - {format(date.to, "d MMM yyyy", { locale: activeLocale })}</>
                              ) : (
                                format(date.from, "d MMM yyyy", { locale: activeLocale })
                              )
                            ) : (
                              <span className="text-muted-foreground font-normal">{t("room.checkinout")}</span>
                            )}
                          </span>
                        </button>
                      </DrawerTrigger>
                      <DrawerContent className="p-0 rounded-t-3xl max-h-[85vh] flex flex-col bg-background">
                        <DrawerHeader className="text-left border-b border-border/50 px-6 py-4 shrink-0">
                          <div className="flex items-center justify-between">
                            <DrawerTitle className="text-lg font-bold text-primary">{t("room.choosedate")}</DrawerTitle>
                            <DrawerClose asChild>
                              <button className="text-muted-foreground p-1 hover:bg-black/5 rounded-full">
                                <X className="w-5 h-5" />
                              </button>
                            </DrawerClose>
                          </div>

                          {/* Real-time Selected Dates Summary */}
                          <div className="mt-3 px-3 py-2 bg-muted/40 border border-border/40 rounded-xl flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[0.65rem] eyebrow text-muted-foreground uppercase">{t("booking.checkin")}</span>
                              <span className="text-xs font-semibold text-foreground">
                                {date?.from ? format(date.from, "d MMM yyyy", { locale: activeLocale }) : "-"}
                              </span>
                            </div>
                            {nightsCount > 0 ? (
                              <span className="text-[0.65rem] px-2.5 py-0.5 bg-gold/15 text-gold rounded-full font-medium shrink-0">
                                {nightsText}
                              </span>
                            ) : (
                              <div className="w-6 h-[1px] bg-border" />
                            )}
                            <div className="flex flex-col text-right">
                              <span className="text-[0.65rem] eyebrow text-muted-foreground uppercase">{t("booking.checkout")}</span>
                              <span className="text-xs font-semibold text-foreground">
                                {date?.to ? format(date.to, "d MMM yyyy", { locale: activeLocale }) : "-"}
                              </span>
                            </div>
                          </div>
                          {/* Warning Message if range has unavailable dates */}
                          {hasRangeConflict && (
                            <div className="mt-2 text-[0.7rem] text-rose-500 font-medium flex items-center gap-1.5 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              {t("booking.warning.unavailable")}
                            </div>
                          )}
                        </DrawerHeader>
                        
                        <div className="overflow-y-auto flex-1 p-6 flex flex-col items-center">
                          <Calendar
                            mode="range"
                            defaultMonth={date?.from || new Date()}
                            selected={date}
                            onSelect={handleDateSelect}
                            numberOfMonths={24}
                            disabled={isDateDisabled}
                            className="w-full flex justify-center [&_.rdp-months]:flex-col [&_.rdp-months]:gap-8"
                          />
                        </div>
                        
                        <div className="p-6 border-t border-border/50 bg-background flex gap-4 shrink-0">
                          <button 
                            type="button"
                            onClick={() => setDate(undefined)} 
                            className="flex-1 py-3 text-sm font-semibold text-muted-foreground hover:bg-black/5 border border-border/60 rounded-full transition-colors"
                          >
                            Reset
                          </button>
                          <DrawerClose asChild disabled={!date?.from || !date?.to || hasRangeConflict}>
                            <button 
                              type="button"
                              disabled={!date?.from || !date?.to || hasRangeConflict}
                              className="flex-1 py-3 text-sm font-semibold bg-gold text-gold-foreground rounded-full hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {t("booking.apply")}
                            </button>
                          </DrawerClose>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </div>
                </div>

                {/* Guest Picker */}
                <div>
                  <span className="eyebrow text-muted-foreground block mb-2">{t("booking.guest")}</span>
                  
                  {/* Desktop view */}
                  <div className="hidden md:block">
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

                  {/* Mobile view */}
                  <div className="md:hidden">
                    <Drawer>
                      <DrawerTrigger asChild>
                        <button className="w-full flex items-center gap-3 p-3 bg-transparent border border-border/60 rounded-xl outline-none focus:border-gold hover:bg-black/5 text-left transition-colors">
                          <UsersIcon className="h-4 w-4 text-gold" />
                          <span className="flex-1 text-sm text-foreground font-medium">
                            {totalGuests} {t("rooms.guest")}{infants > 0 ? `, ${infants} ${t("room.infant")}` : ''}
                          </span>
                        </button>
                      </DrawerTrigger>
                      <DrawerContent className="p-0 rounded-t-3xl max-h-[85vh] flex flex-col bg-background">
                        <DrawerHeader className="text-left border-b border-border/50 px-6 py-4 flex items-center justify-between shrink-0">
                          <DrawerTitle className="text-lg font-bold text-primary">{t("booking.guest")}</DrawerTitle>
                          <DrawerClose asChild>
                            <button className="text-muted-foreground p-1 hover:bg-black/5 rounded-full">
                              <X className="w-5 h-5" />
                            </button>
                          </DrawerClose>
                        </DrawerHeader>
                        
                        <div className="overflow-y-auto flex-1 p-6 space-y-6">
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
                                className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center text-foreground hover:border-gold disabled:opacity-30 disabled:hover:border-border/60 transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-4 text-center text-sm font-medium text-foreground">{adults}</span>
                              <button
                                type="button"
                                onClick={() => setAdults(a => a + 1)}
                                className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center text-foreground hover:border-gold disabled:opacity-30 disabled:hover:border-border/60 transition-colors"
                              >
                                <Plus className="h-4 w-4" />
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
                                className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center text-foreground hover:border-gold disabled:opacity-30 disabled:hover:border-border/60 transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-4 text-center text-sm font-medium text-foreground">{children}</span>
                              <button
                                type="button"
                                onClick={() => setChildren(a => a + 1)}
                                className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center text-foreground hover:border-gold disabled:opacity-30 disabled:hover:border-border/60 transition-colors"
                              >
                                <Plus className="h-4 w-4" />
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
                                className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center text-foreground hover:border-gold disabled:opacity-30 disabled:hover:border-border/60 transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-4 text-center text-sm font-medium text-foreground">{infants}</span>
                              <button
                                type="button"
                                disabled={infants >= 5}
                                onClick={() => setInfants(a => a + 1)}
                                className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center text-foreground hover:border-gold disabled:opacity-30 disabled:hover:border-border/60 transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground pt-4 border-t border-border/60">
                            {t("room.capacity.desc", { capacity: room.capacity, fee: formatIDR(room.extra_guest_fee) })}
                          </div>
                        </div>
                        
                        <div className="p-6 border-t border-border/50 bg-background shrink-0">
                          <DrawerClose asChild>
                            <button 
                              type="button"
                              className="w-full py-3 text-sm font-semibold bg-gold text-gold-foreground rounded-full hover:bg-gold/90 transition-colors"
                            >
                              {t("booking.done")}
                            </button>
                          </DrawerClose>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </div>
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
                onClick={(e) => {
                  if (!date?.from) {
                    e.preventDefault();
                    setAlertTitle(t("booking.alert.title.checkin"));
                    setAlertMessage(t("booking.alert.msg.checkin"));
                    setAlertOpen(true);
                    return;
                  }
                  if (!date?.to) {
                    e.preventDefault();
                    setAlertTitle(t("booking.alert.title.checkout"));
                    setAlertMessage(t("booking.alert.msg.checkout"));
                    setAlertOpen(true);
                    return;
                  }
                  if (format(date.from, "yyyy-MM-dd") === format(date.to, "yyyy-MM-dd")) {
                    e.preventDefault();
                    setAlertTitle(t("booking.alert.title.minbook"));
                    setAlertMessage(t("room.minbook.desc"));
                    setAlertOpen(true);
                    return;
                  }

                  // Check if any selected date is already booked
                  let current = new Date(date.from);
                  const end = new Date(date.to);
                  let hasBookedDate = false;
                  while (current < end) {
                    const dateStr = format(current, "yyyy-MM-dd");
                    if (bookedDates.includes(dateStr)) {
                      hasBookedDate = true;
                      break;
                    }
                    current.setDate(current.getDate() + 1);
                  }

                  if (hasBookedDate || hasRangeConflict) {
                    e.preventDefault();
                    setAlertTitle(t("booking.alert.title.unavailable"));
                    setAlertMessage(t("booking.alert.msg.unavailable"));
                    setAlertOpen(true);
                    return;
                  }
                }}
                className="mt-8 block text-center bg-gold text-gold-foreground py-4 font-medium tracking-wide hover:bg-gold/90 transition-colors rounded-full"
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
                      <div className="mt-4 text-sm text-gold tracking-wide">{formatIDR(r.display_price ?? r.base_price)} / {t("rooms.pernight")}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <AlertModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={alertTitle}
        description={alertMessage}
        type="warning"
      />
      <Footer />
    </div>
  );
}function GalleryModal({ isOpen, onClose, images, roomName }: { isOpen: boolean, onClose: () => void, images: any[], roomName: string }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [activeAlbum, setActiveAlbum] = React.useState(images[0]?.album || 'Lainnya');
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Track loaded image indices to only render active and adjacent images initially
  const [loadedIndices, setLoadedIndices] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setLoadedIndices(prev => {
        const next = [...prev];
        if (!next.includes(activeIndex)) next.push(activeIndex);
        // Preload immediate neighbors
        if (activeIndex > 0 && !next.includes(activeIndex - 1)) next.push(activeIndex - 1);
        if (activeIndex < images.length - 1 && !next.includes(activeIndex + 1)) next.push(activeIndex + 1);
        return next;
      });
    }
  }, [activeIndex, isOpen, images.length]);

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

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-10 transition-opacity">
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="font-semibold text-lg drop-shadow-md">
          {activeIndex > 0 ? activeAlbum : ''}
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
        {images.map((img, idx) => {
          const isLoaded = loadedIndices.includes(idx);
          return (
            <div 
              key={img.id} 
              data-index={idx}
              data-album={img.album || 'Lainnya'}
              className="flex-none w-full h-full snap-center snap-always flex items-center justify-center p-0 md:p-10 bg-black"
            >
              {isLoaded ? (
                <img 
                  src={`${IMAGE_BASE_URL}${img.image_url}`} 
                  alt={`${roomName} - ${img.album || 'Lainnya'}`}
                  className="max-w-full max-h-full object-contain animate-in fade-in duration-300"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                  <IconRenderer name="autorenew" className="animate-spin text-2xl" />
                </div>
              )}
            </div>
          );
        })}
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
