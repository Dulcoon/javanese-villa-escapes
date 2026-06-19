import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Wifi, Waves, UtensilsCrossed, Car, Plane, Users, Sparkles, Trees,
  MapPin, Phone, Mail, Star, ChevronDown, Minus, Plus, ArrowRight, Menu, X,
  Instagram, Facebook, Loader2
} from "lucide-react";

import heroVilla from "@/assets/hero-villa.webp";
import addon1 from "@/assets/addon1.webp";
import addon2 from "@/assets/addon2.webp";
import addon3 from "@/assets/addon3.webp";
import aboutDetail from "@/assets/about-detail.webp";
import galleryPool from "@/assets/gallery-pool.webp";
import galleryGarden from "@/assets/gallery-garden.webp";
import galleryRestaurant from "@/assets/gallery-restaurant.webp";
import roomPavilion from "@/assets/room-pavilion.webp";
import carousel1 from "@/assets/carousel1.webp";
import carousel2 from "@/assets/carousel2.webp";
import carousel3 from "@/assets/carousel3.webp";

import sekilas1 from "@/assets/sekilas1.webp";
import sekilas2 from "@/assets/sekilas2.webp";
import sekilas3 from "@/assets/sekilas3.webp";
import sekilas4 from "@/assets/sekilas4.webp";

import { formatIDR } from "@/lib/utils";
import { api, Villa, IMAGE_BASE_URL } from "@/lib/api";
import {
  Icon5Bed, Icon5Bath, IconKitchen, IconPool, IconFridge, IconAC, IconWifi,
  IconWaterHeater, IconDispenser, IconTV, IconAmenities, IconParking, IconSnack, IconWelcomeDrink
} from "@/components/Icons";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Marme Villa Jogja — Villa Warisan Budaya Jawa yang Mewah" },
      { name: "description", content: "Villa budaya mewah yang memadukan warisan tradisional Jawa, ketenangan, dan kenyamanan modern. Pesan Joglo pribadi Anda." },
      { property: "og:title", content: "Marme Villa Jogja" },
      { property: "og:description", content: "Villa budaya mewah di Jawa Tengah." },
      { property: "og:image", content: heroVilla },
    ],
    links: [
      { rel: "preload", as: "image", href: carousel1, fetchPriority: "high" },
      { rel: "preload", as: "image", href: carousel2 },
      { rel: "preload", as: "image", href: carousel3 },
    ],
  }),
  component: VillaHome,
});

import { Navbar } from "@/components/Navbar";

/* ---------- Nav ---------- */
// Removed inline Nav, now using imported Navbar

/* ---------- Hero ---------- */
function Hero() {
  const images = [carousel1, carousel2, carousel3];
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="top" className="relative h-screen min-h-[720px] w-full overflow-hidden bg-black">
      {images.map((img, idx) => (
        <img
          key={img}
          src={img}
          alt={`Marme Villa Carousel ${idx + 1}`}
          loading={idx === 0 ? "eager" : "lazy"}
          fetchPriority={idx === 0 ? "high" : "low"}
          decoding={idx === 0 ? "sync" : "async"}
          width="1920"
          height="1080"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ${idx === currentIdx ? "opacity-100" : "opacity-0"
            }`}
        />
      ))}
      <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-primary/60 via-primary/30 to-primary/80 backdrop-blur-[1px]" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl md:text-7xl lg:text-8xl text-ivory max-w-5xl text-balance leading-[1.05] drop-shadow-xl font-bold">
          Exceptional Service,<br />
          <span className="text-gold">Memorable Stays</span>
        </h1>
        <p className="mt-8 max-w-xl text-ivory text-base md:text-lg font-light leading-relaxed drop-shadow-md">
          Marme Villa Jogja lebih dari sekadar tempat menginap. Villa ini dirancang untuk menciptakan momen hangat yang berharga bersama keluarga dan orang terdekat
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <a href="#rooms" className="px-6 py-3 md:px-8 md:py-4 text-sm md:text-base bg-gold text-gold-foreground font-medium tracking-wide hover:bg-gold/90 transition-colors rounded-full shadow-lg">
            Reservasi Sekarang
          </a>
          <a href="#about" className="px-6 py-3 md:px-8 md:py-4 text-sm md:text-base border border-ivory/80 text-ivory hover:bg-ivory/20 transition-colors tracking-wide rounded-full shadow-lg backdrop-blur-sm">
            Tentang Kami
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
          <Field label="Tanggal Masuk"><input type="date" className="w-full bg-transparent outline-none text-foreground" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} /></Field>
          <Field label="Tanggal Keluar"><input type="date" className="w-full bg-transparent outline-none text-foreground" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></Field>
          <Field label="Tamu">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="p-1 text-muted-foreground hover:text-primary"><Minus className="h-4 w-4" /></button>
              <span className="font-medium">{guests} Tamu</span>
              <button type="button" onClick={() => setGuests(Math.min(10, guests + 1))} className="p-1 text-muted-foreground hover:text-primary"><Plus className="h-4 w-4" /></button>
            </div>
          </Field>
          <button type="submit" className="bg-primary text-primary-foreground font-medium tracking-wide hover:bg-primary/90 transition-colors py-6 md:py-0 px-8">
            Cari Ketersediaan
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
  const values = [
    { v: "Keramahan", d: "Pelayanan yang hangat dari semua staff Marme Villa Management." },
    { v: "Garansi", d: "Tanggungjawab atas semua kesalahan yang terjadi." },
    { v: "Ketenangan", d: "Lokasi pedesaan dengan keindahan alam yang menakjubkan." },
    { v: "Keberlanjutan", d: "Dilengkapi dengan beberap servis tambahan." },
  ];
  return (
    <section id="about" className="py-32 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl group bg-[#8B7355]/20">
          {/* Warm color overlay */}
          <div className="absolute inset-0 bg-[#8c6b3e]/20 mix-blend-color pointer-events-none z-10" />
          {/* Darkening gradient overlay for better depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-10" />

          <img
            src={aboutDetail}
            alt="Detail ukiran kayu jati Jawa"
            loading="lazy"
            className="h-full w-full object-cover hover:scale-105 transition-transform duration-700 sepia-[.25] saturate-[1.25] contrast-[1.05] brightness-[0.9]"
          />
          {/* <div className="absolute -bottom-6 -right-6 hidden md:block bg-gold text-gold-foreground p-8 max-w-[220px]">
            <div className="font-manrope text-4xl">1923</div>
          </div> */}
        </div>
        <div>
          <span className="eyebrow">Our Story</span>
          <h2 className="text-3xl md:text-5xl mt-4 leading-tight text-balance font-bold">
            Where Comfort Meets Timeless Mediterranean Charm
          </h2>
          <p className="mt-8 text-muted-foreground leading-relaxed text-base md:text-lg text-justify">
            Marme Villa Jogja hadir dengan desain elegan khas Mediterania. Sudut lengkung, guci, batu alam, dan tumbuhan tropis akan membuatmu seperti di dalam keajaiban labirin Mediterania Tropical yang sesungguhnya. </p>
          <p className="mt-4 text-muted-foreground leading-relaxed text-base md:text-lg text-justify">
            Villa ini menawarkan suasana santai di pedesaan yang jauh dari kesibukan kota. Ruang yang luas, pemandangan indah, dan fasilitas lengkap akan memberikan pengalaman menginap yang nyaman. Dengan perpaduan kenyamanan modern dan pesona khas Mediterania, setiap kunjungan disini akan terasa istimewa dan penuh kehangatan.</p>
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
  const [villas, setVillas] = useState<Villa[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getVillas().then(res => {
      if (res.status === 'success') {
        setVillas(res.data);
      }
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <section id="rooms" className="py-32 px-6 bg-ivory/40">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-gold" />
        </div>
      </section>
    );
  }

  return (
    <section id="rooms" className="py-32 px-6 bg-ivory/40">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <span className="eyebrow">Akomodasi</span>
          <h2 className="text-3xl md:text-5xl mt-4 text-balance font-bold">Beberapa Pilihan Tipe & Unit Marme Villa Management.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {villas.map((r) => {
            const primaryImage = r.images.find(img => img.is_primary) || r.images[0];
            const imageUrl = primaryImage ? `${IMAGE_BASE_URL}${primaryImage.image_url}` : '';

            return (
              <article key={r.slug} className="group bg-background border border-border/60 overflow-hidden flex flex-col rounded-2xl">
                <Link to="/rooms/$slug" params={{ slug: r.slug }} className="aspect-[4/5] overflow-hidden block bg-[#8B7355]/20">
                  <img src={imageUrl} alt={r.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </Link>
                <div className="p-8 flex-1 flex flex-col">
                  <Link to="/rooms/$slug" params={{ slug: r.slug }}>
                    <h3 className="font-manrope text-2xl font-semibold text-primary hover:text-gold transition-colors">{r.name}</h3>
                  </Link>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">{r.description}</p>
                  <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground border-t border-border/60 pt-4">
                    <span>{r.size}</span><span>·</span><span>{r.bed_count} kamar tidur</span><span>·</span><span>{r.capacity} tamu</span>
                  </div>
                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <div className="font-sans text-2xl font-semibold text-primary">{formatIDR(r.base_price)}</div>
                      <div className="text-xs text-muted-foreground tracking-wide uppercase">per malam</div>
                    </div>
                    <Link to="/rooms/$slug" params={{ slug: r.slug }} className="text-sm tracking-wide text-gold hover:text-primary border-b border-gold pb-0.5">
                      Lihat Detail
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

  return (
    <>
      <section id="experiences" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
            <div>
              <span className="eyebrow">Aditional Service</span>
              <h2 className="text-3xl md:text-5xl mt-4 max-w-xl text-balance font-bold">Layanan tambahan yang terbaik untuk tamu kami.</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((e) => (
              <article
                key={e.t}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#8B7355]/20 cursor-pointer"
                onClick={() => setSelectedImg(e.img)}
              >
                <img src={e.img} alt={e.t} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />

                {/* Gradient Overlay for text */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent transition-opacity duration-300 group-hover:opacity-40" />

                {/* Hover Cue */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-md mb-3 border border-white/30">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white font-medium tracking-wide">Lihat Gambar</span>
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
  { i: IconTV, t: "Smart TV 55\"" },
  { i: IconAmenities, t: "Amenities" },
  { i: IconParking, t: "Parking Area" },
  { i: IconSnack, t: "Snack" },
  { i: IconWelcomeDrink, t: "Welcome drink" },
];

function Amenities() {
  return (
    <section className="py-32 px-6 bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="eyebrow">Fasilitas</span>
          <h2 className="text-3xl md:text-5xl mt-4 font-bold">Segalanya untuk Kenyamanan Anda.</h2>
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
          <span className="eyebrow">Galeri</span>
          <h2 className="text-3xl md:text-5xl mt-4 text-balance font-bold">Sekilas tentang kehidupan di Marme Villa Jogja.</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4 auto-rows-[260px] md:auto-rows-[380px]">
          {imgs.map((im, idx) => (
            <div key={idx} className={`relative overflow-hidden ${im.span} rounded-2xl group bg-[#8B7355]/20`}>
              {/* Warm color overlay */}
              <div className="absolute inset-0 bg-[#8c6b3e]/20 mix-blend-color pointer-events-none z-10" />
              {/* Darkening gradient overlay for better depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-10" />

              <img
                src={im.src}
                alt={im.alt}
                loading="lazy"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700 sepia-[.25] saturate-[1.25] contrast-[1.05] brightness-[0.9]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
const reviews = [
  { n: "Amélie L.", p: "Paris", q: "Pengalaman menginap paling puitis dalam hidup kami. Setiap detail membisikkan keindahan Jawa kuno, namun kenyamanan modern tetap terpenuhi secara sempurna.", r: 5 },
  { n: "James & Mia", p: "Singapura", q: "Kami datang untuk akhir pekan dan akhirnya tinggal selama seminggu. Malam-malam syahdu dengan alunan gamelan akan selalu hidup dalam ingatan kami.", r: 5 },
  { n: "Putri Anggraini", p: "Jakarta", q: "Sebuah kepulangan yang tidak saya sadari sangat saya butuhkan. Seluruh tim memperlakukan Anda layaknya keluarga sendiri.", r: 5 },
];
function Testimonials() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="eyebrow">Cerita Tamu</span>
          <h2 className="text-3xl md:text-5xl mt-4 font-bold">Kesan dari para tamu kami.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((r) => (
            <figure key={r.n} className="bg-background border border-border/60 p-10 flex flex-col rounded-2xl">
              <div className="flex gap-1 text-gold mb-6">
                {Array.from({ length: r.r }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <blockquote className="font-manrope text-xl leading-relaxed text-foreground/90 flex-1">
                "{r.q}"
              </blockquote>
              <figcaption className="mt-8 pt-6 border-t border-border/60">
                <div className="font-medium text-primary">{r.n}</div>
                <div className="text-xs text-muted-foreground tracking-wide mt-1">{r.p}</div>
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
  const nearby = [
    ["Desa Wisata Sriharjo", "15 mnt"], ["Bukit Mangunan", "19 mnt"],
    ["Pantai Parangtritis", "20 mnt"], ["Malioboro", "20 mnt"], ["Obelix Sea View", "30 mnt"],
  ];
  return (
    <section id="location" className="py-32 px-6 bg-ivory/40">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="eyebrow">Lokasi</span>
          <h2 className="text-3xl md:text-5xl mt-4 text-balance font-bold">
            Di antara hamparan sawah dan pedesaan asri Yogyakarta.
          </h2>
          <p className="mt-6 text-muted-foreground text-base md:text-lg leading-relaxed">
            Tersembunyi di daerah pedesaan Bantul, Yogyakarta. Marme villa memiliki lokasi yang strategis dan indah </p>
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
            src="https://www.openstreetmap.org/export/embed.html?bbox=110.2%2C-7.85%2C110.5%2C-7.65&layer=mapnik&marker=-7.75%2C110.35"
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
  ["Apa saja yang termasuk dalam harga kamar?", "Sarapan harian, ritual penyambutan, teh sore, canapés malam, serta penggunaan gratis kolam renang, taman, dan paviliun kebugaran."],
  ["Kapan waktu untuk check in dan check out?", "Waktu check in pukul 15.00 WIB dan waktu check out pukul 12.00 WIB. Apabila ingin early check in atau late check out akan dikenakan biaya 200.000/jam (Ketentuan ini berlaku apabila villa tidak full tamu)"],
  ["Bagaimana kebijakan pembatalan pemesanan?", "Pembatalan gratis hingga 30 hari sebelum kedatangan. Dalam kurun waktu 30 hari, akan dikenakan biaya malam pertama. Kebijakan periode khusus mungkin berbeda."],
  ["Siapa yang akan melayani saya saat check in dan check out?", "Dikarenakan lokasi villa yang berbeda-beda maka petugas villa hanya akan datang hanya pada waktu chek in dan check out saja. Anda bisa meminta bantuan langsung kepada petugas sebelum pulang atau menghubungi nomer admin. Jam operasional admin mulai dari pukul 08.00-22.00 WIB."],
  ["Apakah villa ini cocok untuk anak-anak?", "Anak-anak dari segala usia disambut dengan hangat. Kami menawarkan layanan pengasuhan anak, fasilitas anak-anak, dan pengalaman keluarga yang dirancang khusus."],
];
function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="eyebrow">Pertanyaan</span>
          <h2 className="text-3xl md:text-5xl mt-4 font-bold">Sebelum Anda Tiba.</h2>
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
  return (
    <section id="contact" className="py-32 px-6 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
        <div>
          <span className="eyebrow">Reservasi</span>
          <h2 className="text-3xl md:text-5xl mt-4 text-balance font-bold">Kami menantikan kedatangan Anda.</h2>
          <p className="mt-6 text-primary-foreground/75 text-base md:text-lg leading-relaxed">
            Tim reservasi kami merespons secara pribadi dalam beberapa jam,
            sepanjang waktu. Selamat datang.
          </p>
          <div className="mt-12 space-y-5 text-sm">
            <div className="flex items-center gap-4"><Phone className="h-4 w-4 text-gold" /> +62 851 9008 3940</div>
            <div className="flex items-center gap-4"><Mail className="h-4 w-4 text-gold" /> marmevillajogja@gmail.com</div>
            <div className="flex items-center gap-4"><MapPin className="h-4 w-4 text-gold" /> Serayu, RT 01, Bantul, Bantul, Bantul, Yogyakarta, 55711</div>
          </div>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); alert("Terima kasih — tim kami akan segera menghubungi Anda."); }}
          className="space-y-6"
        >
          <Input label="Nama Lengkap" type="text" required />
          <Input label="Email" type="email" required />
          <Input label="Telepon" type="tel" />
          <div>
            <div className="eyebrow text-primary-foreground/60 mb-2">Pesan</div>
            <textarea rows={5} required className="w-full bg-transparent border-b border-primary-foreground/30 focus:border-gold outline-none py-3 text-primary-foreground placeholder:text-primary-foreground/40" />
          </div>
          <button type="submit" className="px-10 py-4 bg-gold text-gold-foreground font-medium tracking-wide hover:bg-gold/90 transition-colors rounded-full">
            Kirim Pertanyaan
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

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 448 512"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="bg-background border-t border-border/60 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
        <div className="font-manrope text-lg text-primary">Marme Villa Jogja</div>
        <div>© {new Date().getFullYear()} Marme Villa Jogja. Hak cipta dilindungi undang-undang.</div>
        <div className="flex gap-6">
          <a href="#" className="flex items-center gap-2 hover:text-gold transition-colors"><Instagram className="w-4 h-4" /> Instagram</a>
          <a href="#" className="flex items-center gap-2 hover:text-gold transition-colors"><Facebook className="w-4 h-4" /> Facebook</a>
          <a href="#" className="flex items-center gap-2 hover:text-gold transition-colors"><WhatsAppIcon className="w-4 h-4" /> WhatsApp</a>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Page ---------- */
function VillaHome() {
  return (
    <div className="bg-background text-foreground">
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
