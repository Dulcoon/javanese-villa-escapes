import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Wifi, Waves, UtensilsCrossed, Car, Plane, Users, Sparkles, Trees,
  MapPin, Phone, Mail, Star, ChevronDown, Minus, Plus, ArrowRight,
} from "lucide-react";

import heroVilla from "@/assets/hero-villa.webp";
import expBatik from "@/assets/exp-batik.webp";
import expGamelan from "@/assets/exp-gamelan.webp";
import expDinner from "@/assets/exp-dinner.webp";
import expYoga from "@/assets/exp-yoga.webp";
import aboutDetail from "@/assets/about-detail.webp";
import galleryPool from "@/assets/gallery-pool.webp";
import galleryGarden from "@/assets/gallery-garden.webp";
import galleryRestaurant from "@/assets/gallery-restaurant.webp";
import roomPavilion from "@/assets/room-pavilion.webp";
import carousel1 from "@/assets/carousel1.webp";
import carousel2 from "@/assets/carousel2.webp";
import carousel3 from "@/assets/carousel3.webp";
import carousel4 from "@/assets/carousel4.webp";

import sekilas1 from "@/assets/sekilas1.webp";
import sekilas2 from "@/assets/sekilas2.webp";
import sekilas3 from "@/assets/sekilas3.webp";
import sekilas4 from "@/assets/sekilas4.webp";

import { rooms, formatIDR } from "@/lib/rooms";
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
  }),
  component: VillaHome,
});

/* ---------- Nav ---------- */
function Nav() {
  const links = [
    ["Tentang Kami", "#about"], ["Kamar", "#rooms"], ["Pengalaman", "#experiences"],
    ["Galeri", "#gallery"], ["Lokasi", "#location"], ["Kontak", "#contact"],
  ];
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <a href="#top" className="flex flex-col leading-none">
          <span className="font-manrope text-[26px] tracking-[0.08em] font-normal text-primary">MARME</span>
          <span className="font-sans text-[9.5px] tracking-[0.42em] font-light text-muted-foreground mt-1.5 ml-0.5 uppercase">VILLA JOGJA</span>
        </a>
        <nav className="hidden lg:flex items-center gap-10 text-sm">
          {links.map(([l, h]) => (
            <a key={h} href={h} className="text-foreground/80 hover:text-gold transition-colors">{l}</a>
          ))}
        </nav>
        <Link to="/availability" className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm tracking-wide rounded-full">
          Cek Ketersediaan <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const images = [carousel1, carousel2, carousel3, carousel4];
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
        <h1 className="text-4xl md:text-7xl lg:text-8xl text-ivory max-w-5xl text-balance leading-[1.05] drop-shadow-xl">
          Exceptional Service, Memorable Stays
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
    { v: "Keramahan", d: "Kehangatan yang berakar pada tradisi Jawa." },
    { v: "Budaya", d: "Warisan hidup di setiap detail." },
    { v: "Ketenangan", d: "Paviliun yang sunyi, langit yang terbuka." },
    { v: "Keberlanjutan", d: "Kerajinan lokal, kemewahan yang ramah lingkungan." },
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
          <h2 className="text-3xl md:text-5xl mt-4 leading-tight text-balance">
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
  return (
    <section id="rooms" className="py-32 px-6 bg-ivory/40">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <span className="eyebrow">Akomodasi</span>
          <h2 className="text-3xl md:text-5xl mt-4 text-balance">Dua paviliun. Masing-masing adalah dunia pribadi.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {rooms.map((r) => (
            <article key={r.name} className="group bg-background border border-border/60 overflow-hidden flex flex-col rounded-2xl">
              <Link to="/rooms/$slug" params={{ slug: r.slug }} className="aspect-[4/5] overflow-hidden block bg-[#8B7355]/20">
                <img src={r.img} alt={r.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </Link>
              <div className="p-8 flex-1 flex flex-col">
                <Link to="/rooms/$slug" params={{ slug: r.slug }}>
                  <h3 className="font-manrope text-2xl font-semibold text-primary hover:text-gold transition-colors">{r.name}</h3>
                </Link>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">{r.desc}</p>
                <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground border-t border-border/60 pt-4">
                  <span>{r.size}</span><span>·</span><span>{r.bed} kamar tidur</span><span>·</span><span>{r.baseGuests} tamu</span>
                </div>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <div className="font-sans text-2xl font-semibold text-primary">{formatIDR(r.price)}</div>
                    <div className="text-xs text-muted-foreground tracking-wide uppercase">per malam</div>
                  </div>
                  <Link to="/rooms/$slug" params={{ slug: r.slug }} className="text-sm tracking-wide text-gold hover:text-primary border-b border-gold pb-0.5">
                    Lihat Detail
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Experiences ---------- */
const experiences = [
  { img: expDinner, t: "Makan Malam Tradisional Jawa", d: "Sajian rijsttafel di bawah taburan bintang, disiapkan oleh koki warisan kuliner kami." },
  { img: expBatik, t: "Lokakarya Batik", d: "Menghabiskan sore hari mempelajari teknik canting dari pengrajin ahli." },
  { img: expGamelan, t: "Gamelan di Kala Senja", d: "Pertunjukan ansambel yang syahdu di pendopo utama." },
  { img: expYoga, t: "Yoga Matahari Terbit", d: "Sambut pagi hari di atas kabut, di dek kayu tepi sungai kami." },
];
function Experiences() {
  return (
    <section id="experiences" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
          <div>
            <span className="eyebrow">Pengalaman Terkurasi</span>
            <h2 className="text-3xl md:text-5xl mt-4 max-w-xl text-balance">Kisah yang akan Anda bawa pulang.</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.map((e) => (
            <article key={e.t} className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#8B7355]/20">
              <img src={e.img} alt={e.t} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                <h3 className="font-manrope text-2xl">{e.t}</h3>
                <p className="mt-2 text-sm text-ivory/80 leading-relaxed">{e.d}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Amenities ---------- */
const amenitiesList = [
  { i: Icon5Bed, t: "5 Bed room" },
  { i: Icon5Bath, t: "5 Bath room" },
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
          <h2 className="text-3xl md:text-5xl mt-4">Segalanya untuk Kenyamanan Anda.</h2>
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
          <h2 className="text-3xl md:text-5xl mt-4 text-balance">Sekilas tentang kehidupan di Marme Villa Jogja.</h2>
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
          <h2 className="text-3xl md:text-5xl mt-4">Kesan dari para tamu kami.</h2>
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
    ["Candi Borobudur", "25 mnt"], ["Candi Prambanan", "40 mnt"],
    ["Kota Tua Yogyakarta", "30 mnt"], ["Bandara Adisutjipto", "45 mnt"],
  ];
  return (
    <section id="location" className="py-32 px-6 bg-ivory/40">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="eyebrow">Lokasi</span>
          <h2 className="text-3xl md:text-5xl mt-4 text-balance">
            Di antara terasering sawah dan candi-candi kuno Jawa Tengah.
          </h2>
          <p className="mt-6 text-muted-foreground text-base md:text-lg leading-relaxed">
            Tersembunyi di kaki bukit di luar Yogyakarta, Marme Villa Jogja adalah dunia pribadi — namun sangat dekat dari beberapa bangunan budaya paling luar biasa di Indonesia.
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
  ["Apakah Anda menyediakan layanan antar-jemput bandara?", "Ya. Layanan antar-jemput pribadi dari Bandara Adisutjipto Yogyakarta (YIA) dapat diatur dengan biaya tambahan. Silakan ajukan saat pemesanan."],
  ["Bagaimana kebijakan pembatalan pemesanan?", "Pembatalan gratis hingga 14 hari sebelum kedatangan. Dalam kurun waktu 14 hari, akan dikenakan biaya malam pertama. Kebijakan periode khusus mungkin berbeda."],
  ["Apakah Anda mengakomodasi kebutuhan diet khusus?", "Tentu saja. Koki kami menyiapkan menu vegetarian, vegan, halal, dan bebas gluten berdasarkan permintaan."],
  ["Apakah villa ini cocok untuk anak-anak?", "Anak-anak dari segala usia disambut dengan hangat. Kami menawarkan layanan pengasuhan anak, fasilitas anak-anak, dan pengalaman keluarga yang dirancang khusus."],
];
function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="eyebrow">Pertanyaan</span>
          <h2 className="text-3xl md:text-5xl mt-4">Sebelum Anda Tiba.</h2>
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
          <h2 className="text-3xl md:text-5xl mt-4 text-balance">Kami menantikan kedatangan Anda.</h2>
          <p className="mt-6 text-primary-foreground/75 text-base md:text-lg leading-relaxed">
            Tim reservasi kami merespons secara pribadi dalam beberapa jam,
            sepanjang waktu. Selamat datang.
          </p>
          <div className="mt-12 space-y-5 text-sm">
            <div className="flex items-center gap-4"><Phone className="h-4 w-4 text-gold" /> +62 274 555 0188</div>
            <div className="flex items-center gap-4"><Mail className="h-4 w-4 text-gold" /> stay@sekarjawa.com</div>
            <div className="flex items-center gap-4"><MapPin className="h-4 w-4 text-gold" /> Jl. Heritage No. 8, Sleman, Yogyakarta</div>
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

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="bg-background border-t border-border/60 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
        <div className="font-manrope text-lg text-primary">Marme Villa Jogja</div>
        <div>© {new Date().getFullYear()} Marme Villa Jogja. Hak cipta dilindungi undang-undang.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gold">Instagram</a>
          <a href="#" className="hover:text-gold">Facebook</a>
          <a href="#" className="hover:text-gold">WhatsApp</a>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Page ---------- */
function VillaHome() {
  return (
    <div className="bg-background text-foreground">
      <Nav />
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
