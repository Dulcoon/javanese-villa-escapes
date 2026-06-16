import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { Calendar, Users, BedDouble, Check, ChevronRight, Mail, Phone, User, MessageSquare, ArrowRight } from "lucide-react";
import { getRoom, rooms, formatIDR } from "@/lib/rooms";

const searchSchema = z.object({
  room: fallback(z.string(), "").default(""),
  checkIn: fallback(z.string(), "").default(""),
  checkOut: fallback(z.string(), "").default(""),
  guests: fallback(z.number().int().min(1).max(10), 2).default(2),
});

export const Route = createFileRoute("/booking/")({
  validateSearch: zodValidator(searchSchema),
  component: BookingFormPage,
});

function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

function BookingFormPage() {
  const params = Route.useSearch();
  const navigate = useNavigate();
  const nights = nightsBetween(params.checkIn, params.checkOut);

  // Find the selected room
  const selectedRoom = params.room ? getRoom(params.room) : null;

  // Guest form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requests, setRequests] = useState("");

  // Calculate price
  const basePricePerNight = selectedRoom ? selectedRoom.price : 0;
  const subtotalBase = basePricePerNight * Math.max(nights, 1);
  
  const baseGuests = selectedRoom ? selectedRoom.baseGuests : 2;
  const extraGuests = Math.max(0, params.guests - baseGuests);
  const extraChargePerNight = 125000;
  const extraChargeTotal = extraGuests * extraChargePerNight * Math.max(nights, 1);
  
  const subtotal = subtotalBase + extraChargeTotal;
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/booking/success",
      search: {
        room: params.room,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: params.guests,
        name: fullName,
        email,
        total,
      },
    });
  };

  // If no room selected, show picker
  if (!selectedRoom) {
    return (
      <main className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="eyebrow">Reservations</span>
          <h1 className="font-serif text-4xl md:text-5xl mt-4">Choose a Pavilion</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Please select a pavilion to begin your reservation.
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
            {rooms.map((r) => (
              <Link
                key={r.slug}
                to="/booking"
                search={{ room: r.slug, checkIn: params.checkIn, checkOut: params.checkOut, guests: params.guests }}
                className="group bg-background border border-border/60 overflow-hidden hover:shadow-luxe transition-shadow"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={r.img} alt={r.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-xl text-primary">{r.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.desc}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-serif text-lg text-gold">{formatIDR(r.price)} <span className="text-xs text-muted-foreground font-sans">/night</span></span>
                    <span className="text-gold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Select <ChevronRight className="h-3 w-3" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20">
      {/* Breadcrumb */}
      <section className="pt-12 pb-4 px-6">
        <div className="max-w-6xl mx-auto">
          <nav className="text-xs tracking-wide text-muted-foreground flex items-center gap-2">
            <Link to="/" className="hover:text-gold">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/availability" className="hover:text-gold">Availability</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary">Booking</span>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <span className="eyebrow">Reservations</span>
          <h1 className="font-serif text-4xl md:text-5xl mt-3">Complete Your Reservation</h1>
          <p className="mt-2 text-muted-foreground">
            You're just a few details away from an unforgettable stay.
          </p>
        </div>
      </section>

      {/* Form + Summary */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-10">
          {/* Left: Guest form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleConfirm} className="space-y-8">
              {/* Room summary card */}
              <div className="border border-border/60 bg-ivory/40 p-6 flex items-start gap-5">
                <div className="w-24 h-24 shrink-0 overflow-hidden">
                  <img src={selectedRoom.img} alt={selectedRoom.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-serif text-xl text-primary">{selectedRoom.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Calendar className="h-3 w-3 text-gold" /> {params.checkIn || "—"} → {params.checkOut || "—"}</span>
                    <span className="inline-flex items-center gap-1.5"><BedDouble className="h-3 w-3 text-gold" /> {nights} {nights === 1 ? "night" : "nights"}</span>
                    <span className="inline-flex items-center gap-1.5"><Users className="h-3 w-3 text-gold" /> {params.guests} {params.guests === 1 ? "guest" : "guests"}</span>
                  </div>
                  <Link
                    to="/availability"
                    search={{ room: selectedRoom.slug, checkIn: params.checkIn, checkOut: params.checkOut, guests: params.guests }}
                    className="mt-3 inline-block text-xs text-gold hover:underline"
                  >
                    Change dates or room
                  </Link>
                </div>
              </div>

              {/* Guest details */}
              <div className="border border-border/60 p-8">
                <span className="eyebrow">Guest Details</span>
                <h3 className="font-serif text-2xl mt-1">Who's staying?</h3>
                <div className="mt-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-gold" /> Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Wayan Sudarma"
                      className="w-full bg-transparent border-b border-border py-2.5 outline-none focus:border-gold text-foreground placeholder:text-muted-foreground/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-gold" /> Email Address <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-transparent border-b border-border py-2.5 outline-none focus:border-gold text-foreground placeholder:text-muted-foreground/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-gold" /> Phone Number <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 812 3456 7890"
                      className="w-full bg-transparent border-b border-border py-2.5 outline-none focus:border-gold text-foreground placeholder:text-muted-foreground/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-gold" /> Special Requests
                    </label>
                    <textarea
                      value={requests}
                      onChange={(e) => setRequests(e.target.value)}
                      placeholder="Any preferences or requests? (e.g. dietary, anniversary, airport transfer)"
                      rows={3}
                      className="w-full bg-transparent border border-border p-3 outline-none focus:border-gold text-foreground placeholder:text-muted-foreground/50 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!fullName || !email || !phone}
                className="w-full bg-primary text-primary-foreground py-4 font-medium tracking-wide hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-3 text-lg"
              >
                Confirm Booking <ArrowRight className="h-5 w-5" />
              </button>

              <p className="text-center text-xs text-muted-foreground">
                This is a prototype — no real payment or data is collected.
              </p>
            </form>
          </div>

          {/* Right: Price breakdown */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-28 border border-border/60 bg-ivory/40 p-8 space-y-6">
              <h3 className="font-serif text-xl text-primary">Booking Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pavilion</span>
                  <span className="font-medium">{selectedRoom.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="font-medium">{params.checkIn || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="font-medium">{params.checkOut || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nights</span>
                  <span className="font-medium">{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guests</span>
                  <span className="font-medium">{params.guests}</span>
                </div>
              </div>

              {extraGuests > 0 && (
                <div className="bg-[#EFE5D5] p-4 rounded-xl flex gap-3 text-sm">
                  <div className="shrink-0 mt-0.5">
                    <div className="w-4 h-4 bg-black text-[#EFE5D5] rounded-full flex items-center justify-center font-bold text-[10px]">!</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Anda melebihi batas kapasitas villa</div>
                    <div className="text-muted-foreground mt-0.5 leading-snug">Maksimal kapasitas villa adalah {baseGuests} orang, tamu tambahan akan dikenakan charge</div>
                  </div>
                </div>
              )}

              <hr className="border-border/60" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <div>
                    <span className="text-muted-foreground block">Harga (maks. {baseGuests} orang)</span>
                    <span className="text-xs text-muted-foreground/70">{nights} {nights === 1 ? "malam" : "malam"}</span>
                  </div>
                  <span className="font-medium">{formatIDR(subtotalBase)}</span>
                </div>
                {extraGuests > 0 && (
                  <div className="flex justify-between">
                    <div>
                      <span className="text-muted-foreground block">Charge tamu tambahan</span>
                      <span className="text-xs text-muted-foreground/70">{extraGuests} orang x {formatIDR(extraChargePerNight)}</span>
                    </div>
                    <span className="font-medium">{formatIDR(extraChargeTotal)}</span>
                  </div>
                )}
              </div>

              <hr className="border-border/60" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service & tax (11%)</span>
                  <span className="font-medium">{formatIDR(tax)}</span>
                </div>
              </div>

              <hr className="border-border/60" />

              <div className="flex justify-between items-baseline">
                <span className="font-serif text-lg text-primary">Total</span>
                <span className="font-serif text-3xl text-primary">{formatIDR(total)}</span>
              </div>

              <p className="text-xs text-muted-foreground">
                Includes daily breakfast, welcome ritual and afternoon tea.
              </p>

              <div className="pt-4 border-t border-border/60">
                <div className="flex items-start gap-3 text-xs text-muted-foreground">
                  <Check className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <span>Free cancellation up to 7 days before check-in</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-muted-foreground mt-2">
                  <Check className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <span>Secure booking — no payment required for prototype</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
