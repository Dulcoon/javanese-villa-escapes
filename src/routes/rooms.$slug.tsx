import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BedDouble, Bath, Users, Maximize, Eye, Check, ChevronRight } from "lucide-react";
import { getRoom, rooms, formatIDR, type Room } from "@/lib/rooms";

export const Route = createFileRoute("/rooms/$slug")({
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
    { icon: Users, label: `${room.guests} tamu` },
    { icon: Bath, label: `${room.bathrooms} kamar mandi` },
    { icon: Eye, label: room.view },
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
              <div className="mt-6 space-y-4 text-sm">
                <label className="block">
                  <span className="eyebrow text-muted-foreground">Tanggal Masuk</span>
                  <input type="date" className="w-full mt-2 bg-transparent border-b border-border py-2 outline-none focus:border-gold" />
                </label>
                <label className="block">
                  <span className="eyebrow text-muted-foreground">Tanggal Keluar</span>
                  <input type="date" className="w-full mt-2 bg-transparent border-b border-border py-2 outline-none focus:border-gold" />
                </label>
              </div>
              <Link
                to="/availability"
                search={{ room: room.slug, guests: room.guests }}
                className="mt-8 block text-center bg-primary text-primary-foreground py-4 font-medium tracking-wide hover:bg-primary/90 transition-colors rounded-full"
              >
                Cari Ketersediaan
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
