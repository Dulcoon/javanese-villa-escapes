import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { Calendar, Users, BedDouble, Mail, Phone, CreditCard, Loader2, AlertCircle, CheckCircle, MapPin, MessageSquare, ArrowLeft } from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { api, IMAGE_BASE_URL } from "@/lib/api";
import { toast } from "sonner";

const searchSchema = z.object({
  code: fallback(z.string(), "").default(""),
  email: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/booking/status")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Cek Status Reservasi — Marme Villa Jogja" },
      { name: "description", content: "Cek status reservasi Paviliun Anda di Marme Villa Jogja secara real-time." },
    ],
  }),
  component: BookingStatusPage,
});

function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

function BookingStatusPage() {
  const params = Route.useSearch();
  const navigate = useNavigate();

  // Search input state
  const [inputCode, setInputCode] = useState(params.code);
  const [inputEmail, setInputEmail] = useState(params.email);

  // Fetching state
  const [bookingData, setBookingData] = useState<any>(null);
  const [paymentGateway, setPaymentGateway] = useState("");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchBookingStatus = async (code: string, email: string) => {
    if (!code || !email) return;
    setIsLoading(true);
    try {
      const response = await api.getBookingStatus(code, email);
      if (response.status === "success") {
        setBookingData(response.data.booking);
        setPaymentGateway(response.data.payment_gateway);
        setPaymentUrl(response.data.payment_url);
        setSnapToken(response.data.snap_token);
      } else {
        toast.error(response.message || "Gagal memuat status reservasi.");
        setBookingData(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menemukan reservasi. Periksa kode booking dan email Anda.");
      setBookingData(null);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  useEffect(() => {
    if (params.code && params.email) {
      fetchBookingStatus(params.code, params.email);
    }
  }, [params.code, params.email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim() || !inputEmail.trim()) {
      toast.error("Harap isi Kode Booking dan Email");
      return;
    }
    navigate({
      to: "/booking/status",
      search: {
        code: inputCode.trim(),
        email: inputEmail.trim(),
      },
    });
  };

  const handlePay = () => {
    if (paymentGateway === "doku" && paymentUrl) {
      toast.success("Mengarahkan ke DOKU...");
      window.location.href = paymentUrl;
    } else if (snapToken) {
      // @ts-ignore
      if (window.snap) {
        // @ts-ignore
        window.snap.pay(snapToken, {
          onSuccess: function (result: any) {
            toast.success("Pembayaran berhasil!");
            // Reload status
            if (params.code && params.email) {
              fetchBookingStatus(params.code, params.email);
            }
          },
          onPending: function (result: any) {
            toast.info("Menunggu pembayaran...");
          },
          onError: function (result: any) {
            toast.error("Pembayaran gagal!");
          },
          onClose: function () {
            toast.info("Pembayaran ditutup.");
          }
        });
      } else {
        toast.error("Midtrans Snap belum terload. Silakan muat ulang halaman.");
      }
    } else {
      toast.error("Gagal mendapatkan link pembayaran. Hubungi admin.");
    }
  };

  const getStatusDisplay = (bookingStatus: string, paymentStatus: string) => {
    if (bookingStatus === "cancelled") {
      return { label: "Dibatalkan", style: "text-red-700 bg-red-50 border-red-200" };
    }
    if (bookingStatus === "payment_error") {
      return { label: "Error Pembayaran", style: "text-red-700 bg-red-50 border-red-200" };
    }
    if (paymentStatus === "paid") {
      return { label: "Terkonfirmasi & Lunas", style: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    }
    if (paymentStatus === "pending") {
      return { label: "Menunggu Pembayaran", style: "text-amber-700 bg-amber-50 border-amber-200 animate-pulse" };
    }
    if (bookingStatus === "checked_in") {
      return { label: "Sudah Check-in", style: "text-blue-700 bg-blue-50 border-blue-200" };
    }
    if (bookingStatus === "checked_out") {
      return { label: "Selesai", style: "text-gray-700 bg-gray-50 border-gray-200" };
    }
    return { label: bookingStatus, style: "text-primary bg-ivory border-border" };
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
          </Link>
          {bookingData && (
            <button 
              onClick={() => {
                setBookingData(null);
                setHasSearched(false);
                setInputCode("");
                setInputEmail("");
                navigate({ to: "/booking/status", search: { code: "", email: "" } });
              }}
              className="text-xs tracking-wider uppercase text-gold hover:underline"
            >
              Cek Reservasi Lain
            </button>
          )}
        </div>

        {/* Search Form (if no booking details fetched yet) */}
        {!bookingData ? (
          <div className="bg-ivory/40 border border-border/60 p-8 rounded-2xl md:p-12 text-center">
            <h1 className="text-3xl font-serif text-primary mb-2">Cek Status Reservasi</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
              Masukkan Kode Booking (contoh: BK-XXXXXXXX) dan email yang Anda gunakan saat pemesanan untuk melacak status terbaru.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto text-left">
              <div>
                <label htmlFor="code" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Kode Booking</label>
                <input 
                  type="text" 
                  id="code"
                  placeholder="Contoh: BK-8F2D1A9B"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="w-full bg-background border border-border/80 px-4 py-3 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold rounded-lg font-mono"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Alamat Email</label>
                <input 
                  type="email" 
                  id="email"
                  placeholder="Contoh: emailtamu@gmail.com"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full bg-background border border-border/80 px-4 py-3 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold rounded-lg"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground py-3.5 font-medium tracking-wide flex items-center justify-center gap-2 transition-colors rounded-lg shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Mencari Reservasi...
                  </>
                ) : (
                  "Cari Reservasi"
                )}
              </button>
            </form>

            {hasSearched && !isLoading && (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50/50 max-w-md mx-auto p-4 border border-red-100 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Data reservasi tidak ditemukan. Pastikan kode booking dan email sudah benar.</span>
              </div>
            )}
          </div>
        ) : (
          /* Booking Details Card */
          <div className="space-y-6">
            {/* Header Status Card */}
            <div className="bg-background border border-border/60 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <span className="text-xs text-muted-foreground tracking-widest uppercase font-semibold">Nomor Reservasi</span>
                <h1 className="text-2xl font-mono text-primary font-bold mt-0.5">{bookingData.booking_code}</h1>
              </div>
              <div className="flex items-center gap-2.5">
                <span className={`px-4 py-2 rounded-full border text-sm font-semibold ${getStatusDisplay(bookingData.booking_status, bookingData.payment_status).style}`}>
                  {getStatusDisplay(bookingData.booking_status, bookingData.payment_status).label}
                </span>
              </div>
            </div>

            {/* Warning / Call to Action if payment is Pending */}
            {bookingData.payment_status === "pending" && bookingData.booking_status !== "cancelled" && (
              <div className="bg-amber-50/60 border border-amber-200/80 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-6 w-6 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-900 text-sm">Pembayaran Belum Diselesaikan</h3>
                    <p className="text-xs text-amber-700 mt-1 max-w-lg">
                      Selesaikan pembayaran Anda segera untuk mengamankan dan mengonfirmasi reservasi Paviliun pilihan Anda.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handlePay}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-6 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap shadow-sm"
                >
                  Bayar Sekarang
                </button>
              </div>
            )}

            {/* Main Details Info */}
            <div className="bg-ivory/30 border border-border/60 rounded-2xl p-6 md:p-8 space-y-8">
              {/* Paviliun Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-border/50">
                {bookingData.villa?.images && (
                  <div className="w-24 h-24 shrink-0 overflow-hidden bg-[#8B7355]/20 rounded-xl">
                    <img 
                      src={`${IMAGE_BASE_URL}${bookingData.villa.images.find((img: any) => img.is_primary)?.image_url || bookingData.villa.images[0]?.image_url}`} 
                      alt={bookingData.villa.name} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                )}
                <div>
                  <span className="text-xs text-gold uppercase tracking-wider font-semibold">Paviliun Pilihan</span>
                  <h3 className="text-xl text-primary font-semibold mt-0.5">{bookingData.villa?.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gold" /> Bantul, Daerah Istimewa Yogyakarta
                  </p>
                </div>
              </div>

              {/* Checkin / Checkout Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-border/50">
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gold" /> Tanggal Check-in
                  </div>
                  <div className="font-semibold text-primary">{formatDate(bookingData.check_in)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Mulai pukul 15:00 WIB</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gold" /> Tanggal Check-out
                  </div>
                  <div className="font-semibold text-primary">{formatDate(bookingData.check_out)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Sebelum pukul 12:00 WIB</div>
                </div>
              </div>

              {/* Guest & Stay Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-border/50 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-gold" /> Jumlah Tamu
                  </div>
                  <div className="font-medium text-primary">{bookingData.guest_count} Tamu</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <BedDouble className="h-3.5 w-3.5 text-gold" /> Durasi Menginap
                  </div>
                  <div className="font-medium text-primary">
                    {nightsBetween(bookingData.check_in, bookingData.check_out)} Malam
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gold" /> Email Pemesan
                  </div>
                  <div className="font-medium text-primary truncate">{bookingData.guest_email}</div>
                </div>
              </div>

              {/* Guest Information */}
              <div className="space-y-3 pb-6 border-b border-border/50 text-sm">
                <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Informasi Tamu</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">Nama Lengkap</span>
                    <span className="font-medium text-primary">{bookingData.guest_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Nomor Telepon</span>
                    <span className="font-medium text-primary">{bookingData.guest_phone}</span>
                  </div>
                </div>
                {bookingData.special_requests && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground block">Permintaan Khusus</span>
                    <p className="text-xs text-primary bg-background/50 p-3 rounded-lg border border-border/40 mt-1 italic">
                      "{bookingData.special_requests}"
                    </p>
                  </div>
                )}
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Rincian Pembayaran</h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Biaya Kamar ({nightsBetween(bookingData.check_in, bookingData.check_out)} malam)</span>
                    <span className="font-mono">{formatIDR(bookingData.base_price_total)}</span>
                  </div>
                  
                  {bookingData.extra_charge_total > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Biaya Tamu Tambahan</span>
                      <span className="font-mono">{formatIDR(bookingData.extra_charge_total)}</span>
                    </div>
                  )}

                  {bookingData.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Potongan Voucher</span>
                      <span className="font-mono">-{formatIDR(bookingData.discount_amount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-4 border-t border-border/60">
                    <span className="text-base font-semibold text-primary">Total Pembayaran</span>
                    <span className="text-2xl font-semibold text-primary font-mono">
                      {formatIDR(bookingData.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assistance Section */}
            <div className="bg-ivory/20 border border-border/60 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <div>
                <h4 className="font-semibold text-primary">Butuh Bantuan atau Kontak Darurat?</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Hubungi kami di nomor darurat admin jika ada kendala perjalanan atau penyesuaian pesanan.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <a 
                  href="https://wa.me/6285190083940" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 border border-border hover:bg-background/80 transition-colors text-primary text-sm px-6 py-2.5 rounded-lg font-medium"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-600" /> WhatsApp Admin
                </a>
                <a 
                  href="tel:+6285190083940" 
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 transition-colors text-white text-sm px-6 py-2.5 rounded-lg font-medium"
                >
                  <Phone className="h-4 w-4" /> Hubungi Telepon
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
