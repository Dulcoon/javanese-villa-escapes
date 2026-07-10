import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Wifi, Waves, UtensilsCrossed, Car, Plane, Users, Sparkles, Trees,
  MapPin, Phone, Mail, Star, ChevronDown, Minus, Plus, ArrowRight, Menu, X,
  Loader2
} from "lucide-react";

import heroVilla from "@/assets/hero-villa.webp";
import addon1 from "@/assets/addon1.webp";
import addon2 from "@/assets/addon2.webp";
import addon3 from "@/assets/addon3.webp";
import aboutDetail from "@/assets/about-detail.webp";
import carousel1 from "@/assets/carousel1.webp";
import carousel2 from "@/assets/carousel2.webp";
import carousel3 from "@/assets/carousel3.webp";

import sekilas1 from "@/assets/sekilas1.webp";
import sekilas2 from "@/assets/sekilas2.webp";
import sekilas3 from "@/assets/sekilas3.webp";
import sekilas4 from "@/assets/sekilas4.webp";

import { formatIDR } from "@/lib/utils";
import { api, VillaLite, IMAGE_BASE_URL } from "@/lib/api";
import {
  Icon5Bed, Icon5Bath, IconKitchen, IconPool, IconFridge, IconAC, IconWifi,
  IconWaterHeater, IconDispenser, IconTV, IconAmenities, IconParking, IconSnack, IconWelcomeDrink
} from "@/components/Icons";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  loader: async () => {
    const res = await api.getVillasLite();
    return { villas: res.data as VillaLite[] };
  },
  head: () => ({
    meta: [
      { title: "Marme Villa Jogja — Exceptional Service, Memorable Stays" },
      { name: "description", content: "Marme Villa Jogja lebih dari sekadar tempat menginap. Villa ini dirancang untuk menciptakan momen hangat yang berharga bersama keluarga dan orang terdekat" },
      { property: "og:title", content: "Marme Villa Jogja" },
      { property: "og:description", content: "Exceptional Service, Memorable Stays" },
      { property: "og:image", content: `https://marmevillajogja.com${carousel3}` },
    ],
    links: [
      { rel: "preload", as: "image", href: carousel1, fetchPriority: "high" },
    ],
  }),
  component: VillaHome,
});

import { Navbar } from "@/components/Navbar";
import { useTranslation } from "@/lib/i18n/LanguageContext";

/* ---------- Nav ---------- */
// Removed inline Nav, now using imported Navbar


/* ---------- Hero ---------- */
function Hero() {
  const images = [carousel1, carousel2, carousel3];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({ 0: false });
  const [timeElapsed, setTimeElapsed] = useState(false);
  const { t } = useTranslation();

  const markLoaded = (idx: number) => {
    setLoadedImages(prev => ({ ...prev, [idx]: true }));
  };

  // Fallback to force load other images after 1.5s in case onLoad fails
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadedImages(prev => prev[0] ? prev : { ...prev, 0: true });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Timer to signal when 5 seconds have passed
  useEffect(() => {
    setTimeElapsed(false);
    const timer = setTimeout(() => {
      setTimeElapsed(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentIdx]);

  // Transition controller
  useEffect(() => {
    const nextIdx = (currentIdx + 1) % images.length;
    if (timeElapsed && loadedImages[nextIdx]) {
      setCurrentIdx(nextIdx);
    }
  }, [timeElapsed, loadedImages, currentIdx, images.length]);

  return (
    <section id="top" className="relative h-screen min-h-[720px] w-full overflow-hidden bg-black">
      {images.map((img, idx) => (
        (idx === 0 || loadedImages[0]) ? (
          <img
            key={img}
            src={img}
            alt={`Marme Villa Carousel ${idx + 1}`}
            loading={idx === 0 ? "eager" : "lazy"}
            fetchPriority={idx === 0 ? "high" : "low"}
            decoding={idx === 0 ? "sync" : "async"}
            width="1920"
            height="1080"
            onLoad={() => markLoaded(idx)}
            onError={() => markLoaded(idx)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ${idx === currentIdx ? "opacity-100" : "opacity-0"
              }`}
          />
        ) : null
      ))}
      <div className="absolute inset-0 bg-black/20 bg-gradient-to-b from-primary/40 via-primary/20 to-primary/40" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl md:text-7xl lg:text-8xl text-ivory max-w-5xl text-balance leading-[1.05] font-bold [text-shadow:0_4px_8px_rgba(0,0,0,0.5)]">
          {t("hero.title1")}<br />
          <span className="">{t("hero.title2")}</span>
        </h1>
        <p className="mt-8 max-w-xl text-ivory text-base md:text-lg font-light leading-relaxed [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
          {t("hero.desc")}
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <a href="#rooms" className="px-6 py-3 md:px-8 md:py-4 text-sm md:text-base bg-gold text-gold-foreground font-medium tracking-wide hover:bg-gold/90 transition-colors rounded-full shadow-lg">
            {t("hero.btn.reserve")}
          </a>
          <a href="#about" className="px-6 py-3 md:px-8 md:py-4 text-sm md:text-base border border-ivory/80 text-ivory hover:bg-ivory/20 transition-colors tracking-wide rounded-full shadow-lg backdrop-blur-sm">
            {t("hero.btn.about")}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Booking widget ---------- */
function BookingWidget() {
  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState(new Date().toISOString().slice(0, 10));
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10));
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <section id="booking" className="relative -mt-20 z-20 px-6">
      <div className="max-w-6xl mx-auto bg-background shadow-luxe border border-border/60 overflow-hidden rounded-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/availability", search: { checkIn, checkOut, guests, room: "" } });
          }}
          className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border"
        >
          <Field label={t("booking.checkin")}><input type="date" className="w-full bg-transparent outline-none text-foreground" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} /></Field>
          <Field label={t("booking.checkout")}><input type="date" className="w-full bg-transparent outline-none text-foreground" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></Field>
          <Field label={t("booking.guest")}>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="p-1 text-muted-foreground hover:text-primary"><Minus className="h-4 w-4" /></button>
              <span className="font-medium">{guests} {t("rooms.guest")}</span>
              <button type="button" onClick={() => setGuests(Math.min(10, guests + 1))} className="p-1 text-muted-foreground hover:text-primary"><Plus className="h-4 w-4" /></button>
            </div>
          </Field>
          <button type="submit" className="bg-primary text-primary-foreground font-medium tracking-wide hover:bg-primary/90 transition-colors py-6 md:py-0 px-8">
            {t("booking.search")}
          </button>
        </form>
      </div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="p-6 block">
      <div className="eyebrow text-muted-foreground mb-2 text-[10px]">{label}</div>
      {children}
    </label>
  );
}

/* ---------- About ---------- */
function About() {
  const { t } = useTranslation();
  const values = [
    { v: t("about.val1.t"), d: t("about.val1.d") },
    { v: t("about.val2.t"), d: t("about.val2.d") },
    { v: t("about.val3.t"), d: t("about.val3.d") },
    { v: t("about.val4.t"), d: t("about.val4.d") },
  ];
  return (
    <section id="about" className="py-32 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl group bg-[#8B7355]/20">
          {/* Warm color overlay */}
          <div className="absolute inset-0 bg-[#8c6b3e]/30 pointer-events-none z-10" />
          {/* Darkening gradient overlay for better depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-10" />

          <img
            src={aboutDetail}
            alt="Detail ukiran kayu jati Jawa"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover hover:scale-105 transition-transform duration-700 transform-gpu"
          />
          {/* <div className="absolute -bottom-6 -right-6 hidden md:block bg-gold text-gold-foreground p-8 max-w-[220px]">
            <div className="font-manrope text-4xl">1923</div>
          </div> */}
        </div>
        <div>
          <span className="eyebrow">{t("about.eyebrow")}</span>
          <h2 className="text-3xl md:text-5xl mt-4 leading-tight text-balance font-bold">
            {t("about.title")}
          </h2>
          <p className="mt-8 text-muted-foreground leading-relaxed text-base md:text-lg text-justify">
            {t("about.p1")}</p>
          <p className="mt-4 text-muted-foreground leading-relaxed text-base md:text-lg text-justify">
            {t("about.p2")}</p>
          <div className="mt-12 grid grid-cols-2 gap-8">
            {values.map((val) => (
              <div key={val.v}>
                <div className="font-manrope text-xl text-primary">{val.v}</div>
                <div className="mt-2 text-sm text-muted-foreground">{val.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Rooms ---------- */
function Rooms() {
  const { villas } = Route.useLoaderData();
  const { t, tDynamic } = useTranslation();

  return (
    <section id="rooms" className="py-32 px-6 bg-ivory/40">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <span className="eyebrow">{t("rooms.eyebrow")}</span>
          <h2 className="text-3xl md:text-5xl mt-4 text-balance font-bold">{t("rooms.title")}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {villas.map((r) => {
            const primaryImage = r.images.find(img => img.is_primary) || r.images[0];
            const imageUrl = primaryImage ? `${IMAGE_BASE_URL}${primaryImage.image_url}` : '';

            return (
              <article key={r.slug} className="group bg-background border border-border/60 overflow-hidden flex flex-col rounded-2xl">
                <Link to="/rooms/$slug" params={{ slug: r.slug }} className="aspect-[4/5] overflow-hidden block bg-[#8B7355]/20">
                  <img src={imageUrl} alt={r.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 transform-gpu" />
                </Link>
                <div className="p-8 flex-1 flex flex-col">
                  <Link to="/rooms/$slug" params={{ slug: r.slug }}>
                    <h3 className="font-manrope text-2xl font-semibold text-primary hover:text-gold transition-colors">{r.name}</h3>
                  </Link>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">{tDynamic(r, 'description')}</p>
                  <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground border-t border-border/60 pt-4">
                    <span>{r.size}</span><span>·</span><span>{r.bed_count} {t("rooms.bedroom")}</span><span>·</span><span>{r.capacity} {t("rooms.guest")}</span>
                  </div>
                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <div className="font-sans text-2xl font-semibold text-primary">{formatIDR(r.display_price)}</div>
                      <div className="text-xs text-muted-foreground tracking-wide uppercase">{t("rooms.pernight")}</div>
                    </div>
                    <Link to="/rooms/$slug" params={{ slug: r.slug }} className="text-sm tracking-wide text-gold hover:text-primary border-b border-gold pb-0.5">
                      {t("rooms.detail")}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Experiences ---------- */
const experiences = [
  { img: addon1, t: "BBQ Grill Package", d: "Daging segar, bumbu, dan rempah pilihan menjadikan menu ini sangat istimewa." },
  { img: addon2, t: "Laundry Kilat", d: "Kamu gaperlu khawatir sama baju kotormu. Hanya 4 jam saja semua udah beres." },
  { img: addon3, t: "Extrabed", d: "Untuk menunjang kenyamanan tamu, kami menyediakan paket extrabed lengkap." },
];
function Experiences() {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const { t } = useTranslation();

  return (
    <>
      <section id="experiences" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
            <div>
              <span className="eyebrow">{t("exp.eyebrow")}</span>
              <h2 className="text-3xl md:text-5xl mt-4 max-w-xl text-balance font-bold">{t("exp.title")}</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((e) => (
              <article
                key={e.t}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#8B7355]/20 cursor-pointer"
                onClick={() => setSelectedImg(e.img)}
              >
                <img src={e.img} alt={e.t} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 transform-gpu" />

                {/* Gradient Overlay for text */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent transition-opacity duration-300 group-hover:opacity-40" />

                {/* Hover Cue */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-md mb-3 border border-white/30">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white font-medium tracking-wide">{t("exp.viewimg")}</span>
                </div>

                {/* Text Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 text-ivory transition-transform duration-300 group-hover:translate-y-4 group-hover:opacity-0">
                  <h3 className="font-manrope text-2xl">{e.t}</h3>
                  <p className="mt-2 text-sm text-ivory/80 leading-relaxed">{e.d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-md transition-opacity"
          onClick={() => setSelectedImg(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
            onClick={() => setSelectedImg(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImg}
            alt="Full screen preview"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

/* ---------- Amenities ---------- */
const amenitiesList = [
  { i: Icon5Bed, t: "Bed room" },
  { i: Icon5Bath, t: "Bath room" },
  { i: IconKitchen, t: "Kitchen" },
  { i: IconPool, t: "Private pool" },
  { i: IconFridge, t: "Kulkas" },
  { i: IconAC, t: "Air Conditioner" },
  { i: IconWifi, t: "WiFi" },
  { i: IconWaterHeater, t: "Waterheater" },
  { i: IconDispenser, t: "Dispenser" },
  { i: IconTV, t: "Smart TV" },
  { i: IconAmenities, t: "Amenities" },
  { i: IconParking, t: "Parking Area" },
  { i: IconSnack, t: "Snack" },
  { i: IconWelcomeDrink, t: "Welcome drink" },
];

function Amenities() {
  const { t } = useTranslation();
  return (
    <section className="py-32 px-6 bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="eyebrow">{t("amenities.eyebrow")}</span>
          <h2 className="text-3xl md:text-5xl mt-4 font-bold">{t("amenities.title")}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 text-center">
          {amenitiesList.map(({ i: Icon, t }, idx) => (
            <div
              key={t}
              className={`flex flex-col items-center justify-start ${idx === 12 ? "md:col-start-2" : ""
                }`}
            >
              <Icon className="h-10 w-10 text-gold mb-4" strokeWidth={1.25} />
              <div className="text-sm tracking-wide">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Gallery ---------- */
function Gallery() {
  const { t } = useTranslation();
  const imgs = [
    { src: sekilas1, span: "md:col-span-2 md:row-span-2", alt: "Sekilas kehidupan di villa 1" },
    { src: sekilas2, span: "", alt: "Sekilas kehidupan di villa 2" },
    { src: sekilas3, span: "", alt: "Sekilas kehidupan di villa 3" },
    { src: sekilas4, span: "md:col-span-2", alt: "Sekilas kehidupan di villa 4" },
  ];
  return (
    <section id="gallery" className="py-32 px-6 bg-ivory/40">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <span className="eyebrow">{t("gallery.eyebrow")}</span>
          <h2 className="text-3xl md:text-5xl mt-4 text-balance font-bold">{t("gallery.title")}</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4 auto-rows-[260px] md:auto-rows-[380px]">
          {imgs.map((im, idx) => (
            <div key={idx} className={`relative overflow-hidden ${im.span} rounded-2xl group bg-[#8B7355]/20`}>
              {/* Warm color overlay */}
              <div className="absolute inset-0 bg-[#8c6b3e]/10 pointer-events-none z-10" />
              {/* Darkening gradient overlay for better depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />

              <img
                src={im.src}
                alt={im.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700 transform-gpu"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
function Testimonials() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
    fetch(`${apiBase}/reviews`, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "success") setReviews(data.data);
      })
      .catch(() => { })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="eyebrow">{t("testi.eyebrow")}</span>
          <h2 className="text-3xl md:text-5xl mt-4 font-bold">{t("testi.title")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-background border border-border/60 p-10 flex flex-col rounded-2xl animate-pulse">
                <div className="flex gap-1 mb-6">{Array.from({ length: 5 }).map((_, j) => <div key={j} className="h-4 w-4 rounded bg-border/60" />)}</div>
                <div className="space-y-2 flex-1"><div className="h-4 bg-border/60 rounded w-full" /><div className="h-4 bg-border/60 rounded w-5/6" /><div className="h-4 bg-border/60 rounded w-4/6" /></div>
                <div className="mt-8 pt-6 border-t border-border/60"><div className="h-4 bg-border/60 rounded w-1/3 mb-2" /><div className="h-3 bg-border/40 rounded w-1/4" /></div>
              </div>
            ))
            : reviews.map((r) => (
              <figure key={r.id} className="bg-background border border-border/60 p-10 flex flex-col rounded-2xl">
                <div className="flex gap-1 text-gold mb-6">
                  {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="font-manrope text-xl leading-relaxed text-foreground/90 flex-1">
                  "{r.comment}"
                </blockquote>
                <figcaption className="mt-8 pt-6 border-t border-border/60">
                  <div className="font-medium text-primary">{r.guest_name}</div>
                  <div className="text-xs text-muted-foreground tracking-wide mt-1">{r.city}</div>
                </figcaption>
              </figure>
            ))}
        </div>
      </div>
    </section>
  );
}


/* ---------- Location ---------- */
function Location() {
  const { t } = useTranslation();
  const nearby = [
    ["Desa Wisata Sriharjo", "15 mnt"], ["Bukit Mangunan", "19 mnt"],
    ["Pantai Parangtritis", "20 mnt"], ["Malioboro", "20 mnt"], ["Obelix Sea View", "30 mnt"],
  ];
  return (
    <section id="location" className="py-32 px-6 bg-ivory/40">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="eyebrow">{t("location.eyebrow")}</span>
          <h2 className="text-3xl md:text-5xl mt-4 text-balance font-bold">
            {t("location.title")}
          </h2>
          <p className="mt-6 text-muted-foreground text-base md:text-lg leading-relaxed">
            {t("location.desc")}
          </p>
          <ul className="mt-10 divide-y divide-border/60 border-t border-b border-border/60">
            {nearby.map(([place, time]) => (
              <li key={place} className="flex items-center justify-between py-4">
                <span className="flex items-center gap-3 text-foreground"><MapPin className="h-4 w-4 text-gold" /> {place}</span>
                <span className="text-sm text-muted-foreground tracking-wide">{time}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="aspect-[4/5] overflow-hidden border border-border/60 rounded-2xl">
          <iframe
            title="Lokasi Marme Villa Jogja"
            src="https://maps.google.com/maps?q=marme%20villa%20jogja&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="h-full w-full grayscale-[20%]"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
const faqs = [
  ["Apa saja yang termasuk dalam harga kamar?", "Harga kamar sudah termasuk seluruh fasilitas, snack, dan welcome drink"],
  ["Kapan waktu untuk check in dan check out?", "Waktu check in pukul 15.00 WIB dan waktu check out pukul 12.00 WIB. Apabila ingin early check in atau late check out akan dikenakan biaya 200.000/jam (Ketentuan ini berlaku apabila villa tidak full tamu)"],
  ["Bagaimana kebijakan pembatalan pemesanan?", "Pembatalan gratis hingga 30 hari sebelum kedatangan. Dalam kurun waktu 30 hari, akan dikenakan biaya malam pertama. Kebijakan periode khusus mungkin berbeda."],
  ["Siapa yang akan melayani saya saat check in dan check out?", "Dikarenakan lokasi villa yang berbeda-beda maka petugas villa hanya akan datang pada waktu check in dan check out saja. Anda bisa meminta bantuan langsung kepada petugas sebelum pulang atau menghubungi nomer admin. Jam operasional admin mulai dari pukul 08.00-22.00 WIB."],
  ["Apakah villa ini cocok untuk anak-anak?", "Anak-anak akan diterima dengan sangat baik. Kami menyediakan fasilitas penunjang seperti baby chair yang berguna untuk menjaga keamanan bayi saat makan."],
];
function FAQ() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="eyebrow">{t("faq.eyebrow")}</span>
          <h2 className="text-3xl md:text-5xl mt-4 font-bold">{t("faq.title")}</h2>
        </div>
        <div className="border-t border-border/60">
          {faqs.map(([q, a], i) => (
            <div key={i} className="border-b border-border/60">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full py-6 flex items-center justify-between text-left">
                <span className="font-manrope text-xl text-primary pr-8">{q}</span>
                <ChevronDown className={`h-5 w-5 text-gold shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <p className="pb-6 text-muted-foreground leading-relaxed">{a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Contact ---------- */
function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.submitContact(formData);
      if (res.status === 'success') {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setError(res.message || 'Gagal mengirim pesan.');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32 px-6 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
        <div>
          <span className="eyebrow">{t("contact.eyebrow")}</span>
          <h2 className="text-3xl md:text-5xl mt-4 text-balance font-bold">{t("contact.title")}</h2>
          <p className="mt-6 text-primary-foreground/75 text-base md:text-lg leading-relaxed">
            {t("contact.desc")}
          </p>
          <div className="mt-12 space-y-5 text-sm">
            <div className="flex items-center gap-4"><Phone className="h-4 w-4 text-gold" /> +62 851 9008 3940</div>
            <div className="flex items-center gap-4"><Mail className="h-4 w-4 text-gold" /> marmevillajogja@gmail.com</div>
            <div className="flex items-center gap-4"><MapPin className="h-4 w-4 text-gold" /> Serayu, RT 01, Bantul, Bantul, Bantul, Yogyakarta, 55711</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="p-4 bg-green-500/20 text-green-200 rounded-md border border-green-500/30">
              Terima kasih — pesan Anda telah terkirim. Tim kami akan segera menghubungi Anda.
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-500/20 text-red-200 rounded-md border border-red-500/30">
              {error}
            </div>
          )}
          <Input
            label={t("contact.name")}
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label={t("contact.email")}
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label={t("contact.phone")}
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <div>
            <div className="eyebrow text-primary-foreground/60 mb-2">{t("contact.msg")}</div>
            <textarea
              rows={5}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-transparent border-b border-primary-foreground/30 focus:border-gold outline-none py-3 text-primary-foreground placeholder:text-primary-foreground/40"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-4 bg-gold text-gold-foreground font-medium tracking-wide hover:bg-gold/90 transition-colors rounded-full disabled:opacity-50 flex items-center justify-center min-w-[160px]"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t("contact.submit")}
          </button>
        </form>
      </div>
    </section>
  );
}
function Input({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <div className="eyebrow text-primary-foreground/60 mb-2">{label}</div>
      <input {...rest} className="w-full bg-transparent border-b border-primary-foreground/30 focus:border-gold outline-none py-3 text-primary-foreground" />
    </div>
  );
}

/* ---------- Page ---------- */
function VillaHome() {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://marmevillajogja.com/#website",
        "url": "https://marmevillajogja.com/",
        "name": "Marme Villa Jogja",
        "description": "Exceptional Service, Memorable Stays",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://marmevillajogja.com/?s={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "LodgingBusiness",
        "@id": "https://marmevillajogja.com/#lodging",
        "name": "Marme Villa Jogja",
        "url": "https://marmevillajogja.com/",
        "image": "https://marmevillajogja.com/assets/logo-marme-cropped.png",
        "telephone": "+62 851 9008 3940",
        "email": "marmevillajogja@gmail.com",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Marme Villa Jogja",
          "addressLocality": "Yogyakarta",
          "addressRegion": "Daerah Istimewa Yogyakarta",
          "addressCountry": "ID"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": -7.8525674,
          "longitude": 110.3496149
        },
        "sameAs": [
          "https://www.instagram.com/marmevilla.jogja"
        ]
      }
    ]
  };

  return (
    <div className="bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <Navbar />
      <main>
        <Hero />
        {/* <BookingWidget /> */}
        <About />
        <Rooms />
        <Experiences />
        <Amenities />
        <Gallery />
        <Testimonials />
        <Location />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
