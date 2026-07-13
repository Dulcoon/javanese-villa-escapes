import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { CheckCircle, Calendar, Users, BedDouble, Mail, Home } from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { api, Villa, IMAGE_BASE_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
const searchSchema = z.object({
  room: fallback(z.string(), "").default(""),
  checkIn: fallback(z.string(), "").default(""),
  checkOut: fallback(z.string(), "").default(""),
  guests: fallback(z.number().int().min(1), 2).default(2),
  name: fallback(z.string(), "Guest").default("Guest"),
  email: fallback(z.string(), "").default(""),
  bookingCode: fallback(z.string(), "").default(""),
  total: fallback(z.number(), 0).default(0),
});

export const Route = createFileRoute("/booking/success")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Reservasi Terkonfirmasi — Marme Villa Jogja" },
      { name: "description", content: "Reservasi Anda di Marme Villa Jogja telah berhasil dikonfirmasi." },
    ],
  }),
  component: BookingSuccessPage,
});


function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

function BookingSuccessPage() {
  const params = Route.useSearch();
  const [selectedRoom, setSelectedRoom] = useState<Villa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { lang, t, tDynamic } = useTranslation();

  useEffect(() => {
    document.title = t("booking.success.title", { name: params.name.split(" ")[0] }) + " — Marme Villa";
  }, [params.name, t]);

  useEffect(() => {
    if (params.room) {
      api.getVilla(params.room).then(res => {
        if (res.status === 'success') {
          setSelectedRoom(res.data);
        }
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [params.room]);

  const nights = nightsBetween(params.checkIn, params.checkOut);
  // Use the real booking code from the server; fallback to a display placeholder
  const bookingRef = params.bookingCode || '—';

  const primaryImage = selectedRoom?.images?.find(img => img.is_primary) || selectedRoom?.images?.[0];
  const imageUrl = primaryImage ? `${IMAGE_BASE_URL}${primaryImage.image_url}` : '';

  return (
    <main className="pt-20">
      {/* Confirmation hero */}
      <section className="pt-16 pb-12 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex mx-auto items-center justify-center w-20 h-20 rounded-full bg-gold/10 mb-6">
            <CheckCircle className="h-10 w-10 text-gold" strokeWidth={1.25} />
          </div>
          <div className="eyebrow">{t("booking.success.eyebrow")}</div>
          <h1 className="text-4xl md:text-5xl mt-3">{t("booking.success.title", { name: params.name.split(" ")[0] })}</h1>
          <p className="mt-4 text-muted-foreground text-lg">
            {t("booking.success.subtitle")}
          </p>
          <div className="mt-6 inline-block bg-ivory/60 border border-border/60 px-6 py-3">
            <span className="text-xs text-muted-foreground tracking-widest uppercase">{t("booking.success.order_number")}</span>
            <div className="font-mono text-xl text-primary tracking-wider mt-1">{bookingRef}</div>
          </div>
        </div>
      </section>

      {/* Booking details */}
      <section className="px-6 pb-12">
        <div className="max-w-2xl mx-auto border border-border/60 bg-ivory/40 p-8">
          <h2 className="text-2xl text-primary mb-6">{t("booking.summary.title")}</h2>

          {selectedRoom && (
            <div className="flex items-start gap-5 pb-6 border-b border-border/60 mb-6">
              <div className="w-20 h-20 shrink-0 overflow-hidden bg-[#8B7355]/20">
                <img src={imageUrl} alt={tDynamic(selectedRoom, "name")} className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl text-primary">{tDynamic(selectedRoom, "name")}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{tDynamic(selectedRoom, "description")}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gold" /> {t("booking.summary.checkin")}
              </div>
              <div className="font-medium">{params.checkIn || "—"}</div>
              <div className="text-xs text-muted-foreground">{lang === "en" ? "From 2:00 PM" : "Mulai 14:00"}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gold" /> {t("booking.summary.checkout")}
              </div>
              <div className="font-medium">{params.checkOut || "—"}</div>
              <div className="text-xs text-muted-foreground">{lang === "en" ? "Until 12:00 PM" : "Sebelum 12:00"}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-1.5">
                <BedDouble className="h-3.5 w-3.5 text-gold" /> {t("booking.summary.nights")}
              </div>
              <div className="font-medium">{nights === 1 ? t("booking.night", { count: nights }) : t("booking.nights", { count: nights })}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-gold" /> {t("booking.summary.guests")}
              </div>
              <div className="font-medium">{params.guests} {lang === "en" ? (params.guests === 1 ? "guest" : "guests") : "tamu"}</div>
            </div>
            <div className="col-span-2">
              <div className="text-muted-foreground mb-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gold" /> {t("booking.success.confirmation_sent")}
              </div>
              <div className="font-medium">{params.email || "—"}</div>
            </div>
          </div>

          {params.total > 0 && (
            <div className="mt-6 pt-6 border-t border-border/60 flex justify-between items-baseline">
              <span className="text-lg text-primary">{t("booking.summary.total")}</span>
              <span className="text-3xl text-primary">{formatIDR(params.total)}</span>
            </div>
          )}
        </div>
      </section>

      {/* What's next */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl text-primary mb-8 text-center">{t("booking.success.steps.title")}</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="border border-border/60 p-6 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/5 mb-4 text-primary text-lg">1</div>
              <h3 className="font-medium mb-2">{t("booking.success.steps.1.title")}</h3>
              <p className="text-xs text-muted-foreground">{t("booking.success.steps.1.desc").replace("{email}", params.email || (lang === "en" ? "your email" : "email Anda"))}</p>
            </div>
            <div className="border border-border/60 p-6 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/5 mb-4 text-primary text-lg">2</div>
              <h3 className="font-medium mb-2">{t("booking.success.steps.2.title")}</h3>
              <p className="text-xs text-muted-foreground">{t("booking.success.steps.2.desc")}</p>
            </div>
            <div className="border border-border/60 p-6 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/5 mb-4 text-primary text-lg">3</div>
              <h3 className="font-medium mb-2">{t("booking.success.steps.3.title")}</h3>
              <p className="text-xs text-muted-foreground">{t("booking.success.steps.3.desc")}</p>
            </div>
          </div>

          <div className="mt-10 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("booking.success.questions").split("·")[0]} · +62 851 9008 3940
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 font-medium tracking-wide hover:bg-primary/90 transition-colors"
            >
              <Home className="h-4 w-4" /> {t("booking.success.back_home")}
            </Link>
          </div>

          {/* Note: booking is real and stored in system */}
        </div>
      </section>
    </main>
  );
}
