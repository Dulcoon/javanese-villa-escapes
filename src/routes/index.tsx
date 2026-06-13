import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Wifi, Waves, UtensilsCrossed, Car, Plane, Users, Sparkles, Trees,
  MapPin, Phone, Mail, Star, ChevronDown, Minus, Plus, ArrowRight,
} from "lucide-react";

import heroVilla from "@/assets/hero-villa.jpg";
import expBatik from "@/assets/exp-batik.jpg";
import expGamelan from "@/assets/exp-gamelan.jpg";
import expDinner from "@/assets/exp-dinner.jpg";
import expYoga from "@/assets/exp-yoga.jpg";
import aboutDetail from "@/assets/about-detail.jpg";
import galleryPool from "@/assets/gallery-pool.jpg";
import galleryGarden from "@/assets/gallery-garden.jpg";
import galleryRestaurant from "@/assets/gallery-restaurant.jpg";
import roomPavilion from "@/assets/room-pavilion.jpg";
import { rooms, formatIDR } from "@/lib/rooms";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Villa Sekar Jawa — Luxury Javanese Heritage Villa" },
      { name: "description", content: "A luxury cultural villa blending traditional Javanese heritage, tranquility, and modern comfort. Book your private Joglo retreat." },
      { property: "og:title", content: "Villa Sekar Jawa" },
      { property: "og:description", content: "Luxury cultural villa in Central Java." },
      { property: "og:image", content: heroVilla },
    ],
  }),
  component: VillaHome,
});

/* ---------- Nav ---------- */
function Nav() {
  const links = [
    ["About", "#about"], ["Rooms", "#rooms"], ["Experiences", "#experiences"],
    ["Gallery", "#gallery"], ["Location", "#location"], ["Contact", "#contact"],
  ];
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <a href="#top" className="flex flex-col leading-none">
          <span className="font-serif text-xl tracking-wide text-primary">Sekar Jawa</span>
          <span className="text-[10px] tracking-[0.3em] text-muted-foreground mt-0.5">VILLA · JAVA</span>
        </a>
        <nav className="hidden lg:flex items-center gap-10 text-sm">
          {links.map(([l, h]) => (
            <a key={h} href={h} className="text-foreground/80 hover:text-gold transition-colors">{l}</a>
          ))}
        </nav>
        <a href="#booking" className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm tracking-wide">
          Reserve <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section id="top" className="relative h-screen min-h-[720px] w-full overflow-hidden">
      <img src={heroVilla} alt="Villa Sekar Jawa at dusk" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/20 to-primary/70" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <span className="eyebrow text-gold mb-6">Sekar Jawa · Est. Heritage</span>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-ivory max-w-5xl text-balance leading-[1.05]">
          Experience the Beauty of Javanese Heritage
        </h1>
        <p className="mt-8 max-w-xl text-ivory/85 text-lg font-light leading-relaxed">
          A luxury cultural villa blending tradition, tranquility, and modern comfort —
          set among rice terraces in the heart of Central Java.
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <a href="#booking" className="px-8 py-4 bg-gold text-gold-foreground font-medium tracking-wide hover:bg-gold/90 transition-colors">
            Book Your Stay
          </a>
          <a href="#about" className="px-8 py-4 border border-ivory/60 text-ivory hover:bg-ivory/10 transition-colors tracking-wide">
            Explore the Villa
          </a>
        </div>
      </div>
      <a href="#booking" className="absolute bottom-10 left-1/2 -translate-x-1/2 text-ivory/70 animate-bounce">
        <ChevronDown className="h-6 w-6" />
      </a>
    </section>
  );
}

/* ---------- Booking widget ---------- */
function BookingWidget() {
  const [guests, setGuests] = useState(2);
  return (
    <section id="booking" className="relative -mt-20 z-20 px-6">
      <div className="max-w-6xl mx-auto bg-background shadow-luxe border border-border/60">
        <form
          onSubmit={(e) => { e.preventDefault(); document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" }); }}
          className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border"
        >
          <Field label="Check-in"><input type="date" className="w-full bg-transparent outline-none text-foreground" defaultValue={new Date().toISOString().slice(0,10)} /></Field>
          <Field label="Check-out"><input type="date" className="w-full bg-transparent outline-none text-foreground" defaultValue={new Date(Date.now()+3*864e5).toISOString().slice(0,10)} /></Field>
          <Field label="Guests">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setGuests(Math.max(1, guests-1))} className="p-1 text-muted-foreground hover:text-primary"><Minus className="h-4 w-4" /></button>
              <span className="font-medium">{guests} {guests === 1 ? "Guest" : "Guests"}</span>
              <button type="button" onClick={() => setGuests(Math.min(10, guests+1))} className="p-1 text-muted-foreground hover:text-primary"><Plus className="h-4 w-4" /></button>
            </div>
          </Field>
          <button type="submit" className="bg-primary text-primary-foreground font-medium tracking-wide hover:bg-primary/90 transition-colors py-6 md:py-0 px-8">
            Search Availability
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
    { t: "Hospitality", d: "Warmth rooted in Javanese tradition." },
    { t: "Culture", d: "Living heritage in every detail." },
    { t: "Serenity", d: "Quiet pavilions, open skies." },
    { t: "Sustainability", d: "Local craft, mindful luxury." },
  ];
  return (
    <section id="about" className="py-32 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img src={aboutDetail} alt="Carved Javanese teak detail" loading="lazy" className="h-full w-full object-cover" />
          <div className="absolute -bottom-6 -right-6 hidden md:block bg-gold text-gold-foreground p-8 max-w-[220px]">
            <div className="font-serif text-4xl">1923</div>
            <div className="eyebrow mt-2 text-gold-foreground/80">Heritage Year</div>
          </div>
        </div>
        <div>
          <span className="eyebrow">Our Story</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4 leading-tight text-balance">
            A century-old Joglo, reimagined as a sanctuary of modern Javanese luxury.
          </h2>
          <p className="mt-8 text-muted-foreground leading-relaxed text-lg">
            Hand-carved teak pillars, polished terrazzo floors, and the soft murmur of
            water gardens — Villa Sekar Jawa is a restoration of a 1920s royal pavilion,
            relocated stone by stone from the courts of Yogyakarta and reborn as an
            intimate retreat for travellers seeking depth, beauty, and quiet.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed text-lg">
            Every textile is woven on island, every dish prepared from heirloom recipes.
            What was once the home of a noble family is now yours, for a while.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-8">
            {values.map((v) => (
              <div key={v.t}>
                <div className="font-serif text-xl text-primary">{v.t}</div>
                <div className="mt-2 text-sm text-muted-foreground">{v.d}</div>
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
          <span className="eyebrow">Accommodations</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4 text-balance">Three pavilions. Each a private world.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((r) => (
            <article key={r.name} className="group bg-background border border-border/60 overflow-hidden flex flex-col">
              <Link to="/rooms/$slug" params={{ slug: r.slug }} className="aspect-[4/5] overflow-hidden block">
                <img src={r.img} alt={r.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </Link>
              <div className="p-8 flex-1 flex flex-col">
                <Link to="/rooms/$slug" params={{ slug: r.slug }}>
                  <h3 className="font-serif text-2xl text-primary hover:text-gold transition-colors">{r.name}</h3>
                </Link>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">{r.desc}</p>
                <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground border-t border-border/60 pt-4">
                  <span>{r.size}</span><span>·</span><span>{r.bed} bed</span><span>·</span><span>{r.guests} guests</span>
                </div>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <div className="font-serif text-2xl text-primary">{formatIDR(r.price)}</div>
                    <div className="text-xs text-muted-foreground tracking-wide uppercase">per night</div>
                  </div>
                  <Link to="/rooms/$slug" params={{ slug: r.slug }} className="text-sm tracking-wide text-gold hover:text-primary border-b border-gold pb-0.5">
                    View Details
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
  { img: expDinner, t: "Traditional Javanese Dinner", d: "A rijsttafel under the stars, prepared by our heritage chef." },
  { img: expBatik, t: "Batik Workshop", d: "An afternoon learning the canting from a master artisan." },
  { img: expGamelan, t: "Gamelan at Dusk", d: "An intimate ensemble performance in the central pendopo." },
  { img: expYoga, t: "Sunrise Yoga", d: "Greet the day above the mist, on our wooden river deck." },
];
function Experiences() {
  return (
    <section id="experiences" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
          <div>
            <span className="eyebrow">Curated Experiences</span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4 max-w-xl text-balance">Stories you'll bring home with you.</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.map((e) => (
            <article key={e.t} className="group relative aspect-[3/4] overflow-hidden">
              <img src={e.img} alt={e.t} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                <h3 className="font-serif text-2xl">{e.t}</h3>
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
const amenities = [
  { i: Waves, t: "Infinity Pool" }, { i: Wifi, t: "Free Wi-Fi" },
  { i: Sparkles, t: "Spa & Wellness" }, { i: UtensilsCrossed, t: "Heritage Restaurant" },
  { i: Car, t: "Private Parking" }, { i: Plane, t: "Airport Transfer" },
  { i: Users, t: "Meeting Pavilion" }, { i: Trees, t: "Tropical Garden" },
];
function Amenities() {
  return (
    <section className="py-32 px-6 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="eyebrow">Amenities</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4">Everything, considered.</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 text-center">
          {amenities.map(({ i: Icon, t }) => (
            <div key={t} className="flex flex-col items-center">
              <Icon className="h-8 w-8 text-gold" strokeWidth={1.25} />
              <div className="mt-4 text-sm tracking-wide">{t}</div>
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
    { src: galleryPool, span: "md:row-span-2", alt: "Pool at twilight" },
    { src: galleryGarden, span: "", alt: "Garden pavilion" },
    { src: galleryRestaurant, span: "", alt: "Open-air restaurant" },
    { src: roomPavilion, span: "md:col-span-2", alt: "Pavilion suite" },
  ];
  return (
    <section id="gallery" className="py-32 px-6 bg-ivory/40">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <span className="eyebrow">Gallery</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4 text-balance">Glimpses of life at Sekar Jawa.</h2>
        </div>
        <div className="grid md:grid-cols-3 grid-rows-2 gap-4 auto-rows-[260px] md:auto-rows-[320px]">
          {imgs.map((im, idx) => (
            <div key={idx} className={`overflow-hidden ${im.span}`}>
              <img src={im.src} alt={im.alt} loading="lazy" className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
const reviews = [
  { n: "Amélie L.", p: "Paris", q: "The most poetic stay of our lives. Every detail whispered of old Java, yet nothing was missing for modern comfort.", r: 5 },
  { n: "James & Mia", p: "Singapore", q: "We came for a weekend and stayed a week. The gamelan evenings will live in us forever.", r: 5 },
  { n: "Putri Anggraini", p: "Jakarta", q: "A homecoming I didn't know I needed. The team treats you as family.", r: 5 },
];
function Testimonials() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="eyebrow">Guest Stories</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4">Whispers from our guests.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((r) => (
            <figure key={r.n} className="bg-background border border-border/60 p-10 flex flex-col">
              <div className="flex gap-1 text-gold mb-6">
                {Array.from({ length: r.r }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <blockquote className="font-serif text-xl leading-relaxed text-foreground/90 flex-1">
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
    ["Borobudur Temple", "25 min"], ["Prambanan Temple", "40 min"],
    ["Yogyakarta Old City", "30 min"], ["Adisutjipto Airport", "45 min"],
  ];
  return (
    <section id="location" className="py-32 px-6 bg-ivory/40">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="eyebrow">Location</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4 text-balance">
            Among rice terraces and ancient temples of Central Java.
          </h2>
          <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
            Tucked into the foothills outside Yogyakarta, Villa Sekar Jawa is a private
            world — yet a short drive from some of Indonesia's most extraordinary
            cultural landmarks.
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
        <div className="aspect-[4/5] overflow-hidden border border-border/60">
          <iframe
            title="Villa Sekar Jawa location"
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
  ["What is included in the room rate?", "Daily breakfast, welcome ritual, afternoon tea, evening canapés, and complimentary use of pools, gardens, and the wellness pavilion."],
  ["Can you arrange airport transfers?", "Yes. Private transfers from Yogyakarta Adisutjipto Airport (YIA) can be arranged for an additional fee. Please request at booking."],
  ["What is the cancellation policy?", "Complimentary cancellation up to 14 days before arrival. Within 14 days, the first night is charged. Special periods may differ."],
  ["Do you accommodate dietary needs?", "Absolutely. Our chefs prepare vegetarian, vegan, halal, and gluten-free menus on request."],
  ["Is the villa suitable for children?", "Children of all ages are warmly welcomed. We offer babysitting, children's amenities, and bespoke family experiences."],
];
function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="eyebrow">Questions</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4">Before you arrive.</h2>
        </div>
        <div className="border-t border-border/60">
          {faqs.map(([q, a], i) => (
            <div key={i} className="border-b border-border/60">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full py-6 flex items-center justify-between text-left">
                <span className="font-serif text-xl text-primary pr-8">{q}</span>
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
          <span className="eyebrow">Reservations</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4 text-balance">We look forward to welcoming you.</h2>
          <p className="mt-6 text-primary-foreground/75 text-lg leading-relaxed">
            Our reservations team responds personally within a few hours,
            around the clock. Selamat datang.
          </p>
          <div className="mt-12 space-y-5 text-sm">
            <div className="flex items-center gap-4"><Phone className="h-4 w-4 text-gold" /> +62 274 555 0188</div>
            <div className="flex items-center gap-4"><Mail className="h-4 w-4 text-gold" /> stay@sekarjawa.com</div>
            <div className="flex items-center gap-4"><MapPin className="h-4 w-4 text-gold" /> Jl. Heritage No. 8, Sleman, Yogyakarta</div>
          </div>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); alert("Thank you — our team will be in touch shortly."); }}
          className="space-y-6"
        >
          <Input label="Full Name" type="text" required />
          <Input label="Email" type="email" required />
          <Input label="Phone" type="tel" />
          <div>
            <div className="eyebrow text-primary-foreground/60 mb-2">Message</div>
            <textarea rows={5} required className="w-full bg-transparent border-b border-primary-foreground/30 focus:border-gold outline-none py-3 text-primary-foreground placeholder:text-primary-foreground/40" />
          </div>
          <button type="submit" className="px-10 py-4 bg-gold text-gold-foreground font-medium tracking-wide hover:bg-gold/90 transition-colors">
            Send Inquiry
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
        <div className="font-serif text-lg text-primary">Villa Sekar Jawa</div>
        <div>© {new Date().getFullYear()} Sekar Jawa Heritage. All rights reserved.</div>
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
        <BookingWidget />
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
