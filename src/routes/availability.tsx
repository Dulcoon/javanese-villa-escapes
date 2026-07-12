import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { ArrowLeft, Calendar as CalendarIcon, Users as UsersIcon, Minus, Plus, Check, Search, BedDouble, Maximize, Eye, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { formatIDR } from "@/lib/utils";
import { api, Villa, IMAGE_BASE_URL } from "@/lib/api";
import { format, startOfToday } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/LanguageContext";

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
  const { lang, t, tDynamic } = useTranslation();
  const activeLocale = lang === "en" ? enUS : id;

  useEffect(() => {
    document.title = t("availability.meta_title");
  }, [t]);

  const initialFrom = params.checkIn ? new Date(params.checkIn) : undefined;
  const initialTo = params.checkOut ? new Date(params.checkOut) : undefined;

  const [date, setDate] = useState<DateRange | undefined>(
    initialFrom || initialTo ? {
      from: initialFrom,
      to: initialTo,
    } : undefined
  );

  const [adults, setAdults] = useState(params.guests);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [searched, setSearched] = useState(false);

  const totalGuests = adults + children;

  const checkInStr = date?.from ? format(date.from, "yyyy-MM-dd") : "";
  const checkOutStr = date?.to ? format(date.to, "yyyy-MM-dd") : "";
  const nights = nightsBetween(checkInStr, checkOutStr);

  const [villas, setVillas] = useState<Villa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availabilityResults, setAvailabilityResults] = useState<Record<string, boolean>>({});
  const [isChecking, setIsChecking] = useState(false);

  // Fetch villas
  useEffect(() => {
    api.getVillas().then(res => {
      if (res.status === 'success') setVillas(res.data);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  // Check real availability when search is submitted
  const checkAllAvailability = async () => {
    if (!checkInStr || !checkOutStr || villas.length === 0) return;
    if (checkInStr === checkOutStr) {
      toast.error(t("availability.minbook_toast"), { description: t("availability.minbook_toast_desc") });
      return;
    }
    setIsChecking(true);
    const results: Record<string, boolean> = {};
    await Promise.all(
      villas.map(async (villa) => {
        try {
          const res = await api.checkAvailability({
            villa_slug: villa.slug,
            check_in: checkInStr,
            check_out: checkOutStr,
            guests: totalGuests,
          });
          results[villa.slug] = res?.data?.available ?? false;
        } catch {
          results[villa.slug] = false;
        }
      })
    );
    setAvailabilityResults(results);
    setIsChecking(false);
    setSearched(true);
  };

  // Map villas with real availability
  const available = villas.map((r) => ({
    ...r,
    isAvailable: !searched ? true : (availabilityResults[r.slug] ?? true),
  }));

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar variant="back" backTo="/" backText={t("nav.back")} />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 bg-ivory/40 border-b border-border/60">
        <div className="max-w-5xl mx-auto text-center">
          <span className="eyebrow">{t("contact.eyebrow")}</span>
          <h1 className="text-4xl md:text-5xl mt-4">{t("availability.title")}</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t("availability.desc")}
          </p>
        </div>
      </section>

      {/* Search bar */}
      <section className="px-6 -mt-10 relative z-20">
        <div className="max-w-5xl mx-auto bg-background shadow-luxe border border-border/60 overflow-visible rounded-2xl">
          <form
            onSubmit={(e) => { e.preventDefault(); checkAllAvailability(); }}
            className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border"
          >
            {/* Date Picker */}
            <div className="p-4 md:p-6">
              <span className="eyebrow text-muted-foreground block mb-2 text-[10px]">{t("availability.dates_label")}</span>
              
              {/* Desktop view */}
              <div className="hidden md:block">
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="w-full flex items-center gap-3 p-3 bg-transparent border border-border/60 rounded-xl outline-none focus:border-gold hover:bg-black/5 text-left transition-colors">
                      <CalendarIcon className="h-4 w-4 text-gold" />
                      <span className="flex-1 text-sm text-foreground font-medium">
                        {date?.from ? (
                          date.to ? (
                            <>{format(date.from, "d MMM yyyy", { locale: activeLocale })} - {format(date.to, "d MMM yyyy", { locale: activeLocale })}</>
                          ) : (
                            format(date.from, "d MMM yyyy", { locale: activeLocale })
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
                      disabled={[{ before: startOfToday() }]}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Mobile view */}
              <div className="md:hidden">
                <Drawer>
                  <DrawerTrigger asChild>
                    <button type="button" className="w-full flex items-center gap-3 p-3 bg-transparent border border-border/60 rounded-xl outline-none focus:border-gold hover:bg-black/5 text-left transition-colors">
                      <CalendarIcon className="h-4 w-4 text-gold" />
                      <span className="flex-1 text-sm text-foreground font-medium">
                        {date?.from ? (
                          date.to ? (
                            <>{format(date.from, "d MMM yyyy", { locale: activeLocale })} - {format(date.to, "d MMM yyyy", { locale: activeLocale })}</>
                          ) : (
                            format(date.from, "d MMM yyyy", { locale: activeLocale })
                          )
                        ) : (
                          <span className="text-muted-foreground font-normal">Check-in - Check-out</span>
                        )}
                      </span>
                    </button>
                  </DrawerTrigger>
                  <DrawerContent className="p-0 rounded-t-3xl max-h-[85vh] flex flex-col bg-background">
                    <DrawerHeader className="text-left border-b border-border/50 px-6 py-4 flex items-center justify-between shrink-0">
                      <div>
                        <DrawerTitle className="text-lg font-bold text-primary">{t("booking.alert.title.checkin")}</DrawerTitle>
                      </div>
                      <DrawerClose asChild>
                        <button type="button" className="text-muted-foreground p-1 hover:bg-black/5 rounded-full">
                          <X className="w-5 h-5" />
                        </button>
                      </DrawerClose>
                    </DrawerHeader>
                    
                    <div className="overflow-y-auto flex-1 p-6 flex flex-col items-center">
                      <Calendar
                        mode="range"
                        defaultMonth={date?.from || new Date()}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={24}
                        disabled={[{ before: startOfToday() }]}
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
                      <DrawerClose asChild>
                        <button 
                          type="button"
                          className="flex-1 py-3 text-sm font-semibold bg-gold text-gold-foreground rounded-full hover:bg-gold/90 transition-colors"
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
            <div className="p-4 md:p-6">
              <span className="eyebrow text-muted-foreground block mb-2 text-[10px]">{t("booking.guest")}</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="w-full flex items-center gap-3 p-3 bg-transparent border border-border/60 rounded-xl outline-none focus:border-gold hover:bg-black/5 text-left transition-colors">
                    <UsersIcon className="h-4 w-4 text-gold" />
                    <span className="flex-1 text-sm text-foreground font-medium">
                      {totalGuests} {lang === "en" ? (totalGuests === 1 ? "Guest" : "Guests") : "Tamu"}{infants > 0 ? `, ${infants} ${lang === "en" ? (infants === 1 ? "Infant" : "Infants") : "Balita"}` : ''}
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
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <button type="submit" disabled={!date?.from || !date?.to || isChecking} className="bg-primary text-primary-foreground font-medium tracking-wide hover:bg-primary/90 transition-colors py-6 md:py-0 px-8 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none rounded-b-2xl md:rounded-b-none md:rounded-r-2xl">
              {isChecking ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />{t("availability.checking")}</> : <><Search className="h-4 w-4" /> {t("availability.search")}</>}
            </button>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <span className="eyebrow">{t("availability.available_pavilions")}</span>
              <h2 className="text-3xl mt-2">
                {nights > 0 ? (
                  t("availability.summary_text", { nights, guests: totalGuests })
                ) : (
                  t("availability.select_dates")
                )}
              </h2>
            </div>
            {searched && (
              <div className="text-sm text-muted-foreground">
                {t("availability.count_text", { available: available.filter((r) => r.isAvailable).length, total: villas.length })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {available.map((r) => {
              const total = r.base_price * Math.max(nights, 1);
              const primaryImage = r.images?.find(img => img.is_primary) || r.images?.[0];
              const imageUrl = primaryImage ? `${IMAGE_BASE_URL}${primaryImage.image_url}` : '';

              return (
                <article key={r.slug} className={`grid md:grid-cols-[280px_1fr_auto] gap-6 bg-background border border-border/60 overflow-hidden rounded-2xl ${!r.isAvailable ? "opacity-60" : ""}`}>
                  <Link to="/rooms/$slug" params={{ slug: r.slug }} className="aspect-[4/3] md:aspect-auto overflow-hidden bg-[#8B7355]/20">
                    <img src={imageUrl} alt={tDynamic(r, "name")} className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" />
                  </Link>
                  <div className="p-6 md:py-8">
                    <Link to="/rooms/$slug" params={{ slug: r.slug }}>
                      <h3 className="font-manrope text-2xl font-semibold text-primary hover:text-gold transition-colors">{tDynamic(r, "name")}</h3>
                    </Link>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{tDynamic(r, "description")}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><Maximize className="h-3.5 w-3.5 text-gold" />{t("rooms.size")} {r.size}</span>
                      <span className="inline-flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 text-gold" />{t("availability.bed_count", { count: r.bed_count })}</span>
                      <span className="inline-flex items-center gap-1.5"><UsersIcon className="h-3.5 w-3.5 text-gold" />{t("availability.guest_count", { count: r.capacity })}</span>
                      <span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-gold" />{tDynamic(r, "view_description")}</span>
                    </div>
                    {r.isAvailable && (
                      <div className="mt-4 inline-flex items-center gap-2 text-xs text-gold">
                        <Check className="h-3.5 w-3.5" /> {t("availability.available_status")}
                      </div>
                    )}
                  </div>
                  <div className="p-6 md:py-8 md:pr-8 md:text-right border-t md:border-t-0 md:border-l border-border/60 flex md:flex-col items-center md:items-end justify-between gap-4">
                    <div>
                      <div className="font-sans text-2xl font-semibold text-primary">{formatIDR(r.display_price ?? r.base_price)}</div>
                      <div className="eyebrow text-muted-foreground mt-1">{t("availability.pernight")}</div>
                      {nights > 0 && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          {t("availability.total", { total: formatIDR(total) })}
                        </div>
                      )}
                    </div>
                    {r.isAvailable ? (
                      <Link
                        to="/booking"
                        search={{ room: r.slug, checkIn: checkInStr, checkOut: checkOutStr, guests: totalGuests }}
                        className="px-6 py-3 bg-gold text-gold-foreground font-medium tracking-wide hover:bg-gold/90 transition-colors text-sm whitespace-nowrap rounded-full"
                      >
                        {t("availability.book")}
                      </Link>
                    ) : (
                      <span className="px-6 py-3 border border-border text-muted-foreground text-sm whitespace-nowrap rounded-full">
                        {t("availability.soldout")}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            {t("availability.note")}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
