import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { Calendar, Users, BedDouble, Check, ChevronRight, Mail, Phone, User, MessageSquare, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { api, Villa, IMAGE_BASE_URL } from "@/lib/api";
import { toast } from "sonner";

const searchSchema = z.object({
  room: fallback(z.string(), "").default(""),
  checkIn: fallback(z.string(), "").default(""),
  checkOut: fallback(z.string(), "").default(""),
  guests: fallback(z.number().int().min(1), 2).default(2),
});

export const Route = createFileRoute("/booking/")({
  validateSearch: zodValidator(searchSchema),
  component: BookingFormPage,
});

function BookingFormPage() {
  const params = Route.useSearch();
  const navigate = useNavigate();

  // Data fetching state
  const [villas, setVillas] = useState<Villa[]>([]);
  const [selectedRoomData, setSelectedRoomData] = useState<Villa | null>(null);
  // pricing holds the unwrapped data object: { available, pricing, discount, grand_total, voucher_id }
  const [availData, setAvailData] = useState<any>(null);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Guest form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requests, setRequests] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!params.room) {
      api.getVillas().then(res => {
        if (res.status === 'success') setVillas(res.data);
      });
    }
  }, [params.room]);

  const fetchPricing = async (voucherToTest?: string) => {
    if (!params.room || !params.checkIn || !params.checkOut) return null;
    setIsPricingLoading(true);
    setAvailabilityError(null);
    try {
      const response = await api.checkAvailability({
        villa_slug: params.room,
        check_in: params.checkIn,
        check_out: params.checkOut,
        guests: params.guests,
        voucher_code: voucherToTest !== undefined ? voucherToTest : (isPromoApplied ? promoCode : undefined)
      });
      // API returns { status, data: { available, pricing, discount, grand_total } }
      const unwrapped = response?.data ?? response;
      setAvailData(unwrapped);
      return unwrapped;
    } catch (error: any) {
      setAvailabilityError(error.message || "Maaf, paviliun ini tidak tersedia pada tanggal yang dipilih.");
      toast.error(error.message || "Ketersediaan tidak dapat dicek.");
      throw error;
    } finally {
      setIsPricingLoading(false);
    }
  };

  useEffect(() => {
    if (params.room) {
      api.getVilla(params.room).then(res => {
        if (res.status === 'success') setSelectedRoomData(res.data);
      });
      fetchPricing();
    }
  }, [params.room, params.checkIn, params.checkOut, params.guests]);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setIsValidatingPromo(true);
    try {
      const unwrapped = await fetchPricing(promoCode);
      if (unwrapped && unwrapped.discount > 0) {
        setIsPromoApplied(true);
        toast.success("Kode promo berhasil digunakan!");
      } else {
        setIsPromoApplied(false);
        toast.error("Kode promo tidak valid atau kadaluarsa.");
      }
    } catch (error) {
      setIsPromoApplied(false);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const pricing = availData?.pricing ?? null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPricingLoading || !availData) {
      toast.error("Tunggu hingga harga selesai dihitung");
      return;
    }
    setShowConfirmModal(true);
  };

  const executeBookingSubmit = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);

    try {
      const response = await api.submitBooking({
        villa_slug: params.room,
        check_in: params.checkIn,
        check_out: params.checkOut,
        guests: params.guests,
        guest_name: fullName,
        guest_email: email,
        guest_phone: phone,
        special_requests: requests,
        voucher_code: isPromoApplied ? promoCode : undefined,
      });

      if (response.status === 'success') {
        if (response.data.payment_gateway === 'doku' && response.data.payment_url) {
          toast.success("Mengarahkan ke halaman pembayaran DOKU...");
          window.location.href = response.data.payment_url;
        } else if (response.data.snap_token) {
          // @ts-ignore
          window.snap.pay(response.data.snap_token, {
            onSuccess: function (result: any) {
              navigate({
                to: "/booking/success",
                search: {
                  room: params.room,
                  checkIn: params.checkIn,
                  checkOut: params.checkOut,
                  guests: params.guests,
                  name: fullName,
                  email,
                  bookingCode: response.data.booking?.booking_code ?? '',
                  total: availData.grand_total ?? 0,
                },
              });
            },
            onPending: function (result: any) {
              toast.info("Menunggu pembayaran...");
            },
            onError: function (result: any) {
              toast.error("Pembayaran gagal!");
              setIsLoading(false);
            },
            onClose: function () {
              toast.error("Pembayaran dibatalkan");
              setIsLoading(false);
            }
          });
        } else {
          toast.error("Metode pembayaran tidak dikenal.");
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat pesanan");
      setIsLoading(false);
    }
  };

  // If no room selected, show picker
  if (!params.room) {
    return (
      <main className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="eyebrow">Reservasi</span>
          <h1 className="text-4xl md:text-5xl mt-4">Pilih Paviliun</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Silakan pilih paviliun untuk memulai reservasi Anda.
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
            {villas.map((r) => {
              const primaryImage = r.images?.find(img => img.is_primary) || r.images?.[0];
              const imageUrl = primaryImage ? `${IMAGE_BASE_URL}${primaryImage.image_url}` : '';
              return (
                <Link
                  key={r.slug}
                  to="/booking"
                  search={{ room: r.slug, checkIn: params.checkIn, checkOut: params.checkOut, guests: params.guests }}
                  className="group bg-background border border-border/60 overflow-hidden hover:shadow-luxe transition-shadow rounded-2xl"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={imageUrl} alt={r.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl text-primary">{r.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg text-gold">{formatIDR(r.display_price ?? r.base_price)} <span className="text-xs text-muted-foreground font-sans">/malam</span></span>
                      <span className="text-gold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Pilih <ChevronRight className="h-3 w-3" /></span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  if (!selectedRoomData) {
    return (
      <main className="pt-32 pb-16 px-6 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
      </main>
    );
  }

  const primaryImage = selectedRoomData.images?.find(img => img.is_primary) || selectedRoomData.images?.[0];
  const imageUrl = primaryImage ? `${IMAGE_BASE_URL}${primaryImage.image_url}` : '';

  return (
    <main className="pt-20">
      {/* Breadcrumb */}
      <section className="pt-12 pb-4 px-6">
        <div className="max-w-6xl mx-auto">
          <nav className="text-xs tracking-wide text-muted-foreground flex items-center gap-2">
            <Link to="/" className="hover:text-gold">Beranda</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/availability" className="hover:text-gold">Ketersediaan</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary">Pemesanan</span>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <span className="eyebrow">Reservasi</span>
          <h1 className="text-4xl md:text-5xl mt-3">Selesaikan Reservasi Anda</h1>
          <p className="mt-2 text-muted-foreground">
            Tinggal selangkah lagi menuju pengalaman menginap yang tak terlupakan.
          </p>
        </div>
      </section>

      {/* Form + Summary */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-10">
          {/* Left: Guest form */}
          <div className="lg:col-span-3">
            <form id="booking-form" onSubmit={handleConfirm} className="space-y-8">
              {/* Room summary card */}
              <div className="border border-border/60 bg-ivory/40 p-6 flex items-start gap-5 rounded-2xl">
                <div className="w-24 h-24 shrink-0 overflow-hidden rounded-xl bg-[#8B7355]/20">
                  <img src={imageUrl} alt={selectedRoomData.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl text-primary">{selectedRoomData.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Calendar className="h-3 w-3 text-gold" /> {params.checkIn || "—"} → {params.checkOut || "—"}</span>
                    <span className="inline-flex items-center gap-1.5"><BedDouble className="h-3 w-3 text-gold" /> {pricing?.nights || 0} malam</span>
                    <span className="inline-flex items-center gap-1.5"><Users className="h-3 w-3 text-gold" /> {params.guests} tamu</span>

                  </div>
                  <Link
                    to="/rooms/$slug"
                    params={{ slug: selectedRoomData.slug }}
                    search={{ checkIn: params.checkIn, checkOut: params.checkOut, guests: params.guests }}
                    className="mt-3 inline-block text-xs text-gold hover:underline"
                  >
                    Ubah tanggal atau kamar
                  </Link>
                </div>
              </div>

              {/* Guest details */}
              <div className="border border-border/60 p-8 rounded-2xl">
                <span className="eyebrow">Detail Tamu</span>
                <h3 className="text-2xl mt-1 font-bold">Siapa yang akan menginap?</h3>
                <div className="mt-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-gold" /> Nama Lengkap <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="misal: Wayan Sudarma"
                      className="w-full bg-transparent border-b border-border py-2.5 outline-none focus:border-gold text-foreground placeholder:text-muted-foreground/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-gold" /> Alamat Email <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anda@email.com"
                      className="w-full bg-transparent border-b border-border py-2.5 outline-none focus:border-gold text-foreground placeholder:text-muted-foreground/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-gold" /> Nomor Telepon <span className="text-destructive">*</span>
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
                      <MessageSquare className="h-3.5 w-3.5 text-gold" /> Permintaan Khusus
                    </label>
                    <textarea
                      value={requests}
                      onChange={(e) => setRequests(e.target.value)}
                      placeholder="Ada preferensi atau permintaan khusus? (misal: alergi makanan, acara spesial)"
                      rows={3}
                      className="w-full bg-transparent border border-border p-3 outline-none focus:border-gold text-foreground placeholder:text-muted-foreground/50 transition-colors resize-none rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Submit (Desktop only) */}
              <div className="hidden lg:block">
                <button
                  type="submit"
                  disabled={!fullName || !email || !phone || isLoading || isPricingLoading || !!availabilityError}
                  className="w-full rounded-full bg-primary text-primary-foreground py-4 font-medium tracking-wide hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-3 text-lg"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Konfirmasi Pemesanan <ArrowRight className="h-5 w-5" /></>}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Price breakdown */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-28 border border-border/60 bg-ivory/40 p-8 space-y-6 rounded-2xl relative overflow-hidden">
              {isPricingLoading && (
                <div className="absolute inset-0 bg-ivory/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gold" />
                </div>
              )}
              
              <h3 className="text-2xl text-primary font-bold">Ringkasan Pemesanan</h3>

              {availabilityError ? (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 hidden" />
                    <span className="text-xl font-bold">!</span>
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Tidak Tersedia</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {availabilityError}
                  </p>
                  <Link 
                    to="/rooms/$slug" 
                    params={{ slug: params.room }}
                    className="inline-flex items-center justify-center px-6 py-3 bg-gold text-gold-foreground rounded-full text-sm font-medium hover:bg-gold/90 transition-colors"
                  >
                    Pilih Tanggal Lain
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paviliun</span>
                      <span className="font-medium text-right">{selectedRoomData.name}</span>
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
                      <span className="text-muted-foreground">Malam</span>
                      <span className="font-medium">{pricing?.nights || differenceInDays(new Date(params.checkOut || Date.now()), new Date(params.checkIn || Date.now()))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tamu</span>
                      <span className="font-medium">{params.guests}</span>
                    </div>
                  </div>

                  {pricing && pricing.extra_guests > 0 && (
                    <div className="bg-[#EFE5D5] p-4 rounded-xl flex gap-3 text-sm">
                      <div className="shrink-0 mt-0.5">
                        <div className="w-4 h-4 bg-black text-[#EFE5D5] rounded-full flex items-center justify-center font-bold text-[10px]">!</div>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Anda melebihi batas kapasitas villa</div>
                        <div className="text-muted-foreground mt-0.5 leading-snug">Tamu tambahan akan dikenakan biaya tambahan</div>
                      </div>
                    </div>
                  )}

                  <hr className="border-border/60" />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Harga Villa</span>
                        <span className="text-[11px] text-muted-foreground/50">{pricing?.nights || differenceInDays(new Date(params.checkOut || Date.now()), new Date(params.checkIn || Date.now()))} malam</span>
                      </div>
                      <span className="font-medium">{pricing ? formatIDR(pricing.base_price_total) : '—'}</span>
                    </div>

                    {pricing?.breakdown && (
                      <div className="pl-4 border-l border-gold/30 space-y-1.5 text-xs text-muted-foreground/80 my-1">
                        {pricing.breakdown.map((day: any) => (
                          <div key={day.date} className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5">
                              <span>{new Date(day.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", weekday: "short" })}</span>
                              {day.type === 'custom' && (
                                <span className="text-[9px] font-sans tracking-wide uppercase px-1.5 py-0.5 rounded bg-gold/10 text-gold border border-gold/25">
                                  Tarif Khusus
                                </span>
                              )}
                              {day.type === 'weekend' && (
                                <span className="text-[9px] font-sans tracking-wide uppercase px-1.5 py-0.5 rounded bg-[#EFE5D5] text-[#8B7355]">
                                  Weekend
                                </span>
                              )}
                            </span>
                            <span className="font-mono">{formatIDR(day.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {pricing && pricing.extra_guests > 0 && (
                      <div className="flex justify-between items-start mt-1">
                        <div>
                          <span className="text-muted-foreground block">Biaya tamu tambahan</span>
                          <span className="text-[11px] text-muted-foreground/50 mt-1 block">{pricing.extra_guests} orang ekstra</span>
                        </div>
                        <span className="font-medium">{formatIDR(pricing.extra_charge_total)}</span>
                      </div>
                    )}
                  </div>

                  <hr className="border-border/60" />

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Kode Promo"
                        className="w-full bg-transparent border border-border px-3 py-2 outline-none focus:border-gold text-foreground placeholder:text-muted-foreground/50 transition-colors rounded-xl text-sm"
                        disabled={isPromoApplied || isValidatingPromo}
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={isPromoApplied || !promoCode || isValidatingPromo}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors inline-flex items-center gap-2"
                      >
                        {isValidatingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isPromoApplied ? "Terpakai" : "Pakai"}
                      </button>
                    </div>
                    {isPromoApplied && availData && availData.discount > 0 && (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span>Diskon (Promo: {promoCode})</span>
                        <span>-{formatIDR(availData.discount)}</span>
                      </div>
                    )}
                  </div>

                  <hr className="border-border/60" />

                  <div className="flex justify-between items-baseline">
                    <span className="text-xl text-primary font-medium">Total</span>
                    <span className="text-3xl text-primary">{availData ? formatIDR(availData.grand_total) : '—'}</span>
                  </div>
                </>
              )}

              {/* Submit (Mobile only) */}
              <div className="lg:hidden pt-6 mt-6 border-t border-border/60">
                <button
                  type="submit"
                  form="booking-form"
                  disabled={!fullName || !email || !phone || isLoading || isPricingLoading || !!availabilityError}
                  className="w-full rounded-full bg-primary text-primary-foreground py-4 font-medium tracking-wide hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-3 text-lg"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Konfirmasi Pemesanan <ArrowRight className="h-5 w-5" /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-background border border-border/60 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-luxe z-10 overflow-hidden transform transition-all duration-300 animate-in scale-in duration-200">
            {/* Elegant header */}
            <div className="flex items-center gap-3 border-b border-border/40 pb-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">Konfirmasi Data Anda</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Mohon periksa kembali agar tidak ada kesalahan pengiriman invoice.</p>
              </div>
            </div>
            
            {/* Form details overview */}
            <div className="space-y-4 text-sm bg-ivory/30 border border-border/40 rounded-xl p-5 mb-6">
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border/20">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 col-span-1">
                  <User className="h-3.5 w-3.5 text-gold shrink-0" /> Nama
                </span>
                <span className="text-foreground font-semibold col-span-2 break-words">{fullName}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border/20">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 col-span-1">
                  <Mail className="h-3.5 w-3.5 text-gold shrink-0" /> Email
                </span>
                <span className="text-foreground font-semibold col-span-2 break-all">{email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border/20">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 col-span-1">
                  <Phone className="h-3.5 w-3.5 text-gold shrink-0" /> Telepon
                </span>
                <span className="text-foreground font-semibold col-span-2 break-words">{phone}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 col-span-1">
                  <MessageSquare className="h-3.5 w-3.5 text-gold shrink-0" /> Catatan
                </span>
                <span className="text-foreground italic col-span-2 break-words text-xs">{requests ? `"${requests}"` : "Tidak ada"}</span>
              </div>
            </div>
            
            {/* Warning Text */}
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 text-xs text-[#8B7355] leading-relaxed mb-6">
              <strong>PENTING:</strong> Nomor invoice dan rincian pembayaran akan dikirimkan otomatis ke email Anda. Admin juga akan menghubungi Anda via WhatsApp/Telepon ke nomor di atas untuk koordinasi kedatangan. Pastikan data di atas sudah aktif dan benar.
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-full border border-border/80 text-foreground py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                onClick={executeBookingSubmit}
                className="flex-1 rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Ya, Lanjutkan Pemesanan <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
