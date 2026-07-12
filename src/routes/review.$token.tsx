import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Star } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export const Route = createFileRoute("/review/$token")({
  head: () => ({
    meta: [
      { title: "Tulis Ulasan — Marme Villa Jogja" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const { token } = Route.useParams();
  const { lang, t, tDynamic } = useTranslation();

  const [pageState, setPageState] = useState<"loading" | "form" | "submitted" | "already_done" | "error">("loading");
  const [formData, setFormData] = useState<any>(null);

  // Form state
  const [guestName, setGuestName] = useState("");
  const [city, setCity] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"}/reviews/form/${token}`, {
          headers: { Accept: "application/json" },
        });
        const data = await res.json();
        if (data.status === "already_submitted") {
          setPageState("already_done");
        } else if (data.status === "success") {
          setFormData(data.data);
          setGuestName(data.data.guest_name || "");
          setPageState("form");
        } else {
          setPageState("error");
        }
      } catch {
        setPageState("error");
      }
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 10) {
      toast.error(lang === "en" ? "Tell us about your experience in at least 10 characters." : "Cerita pengalaman Anda minimal 10 karakter.");
      return;
    }
    if (!city.trim()) {
      toast.error(lang === "en" ? "Please fill in your city of origin." : "Harap isi asal kota Anda.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"}/reviews/form/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ guest_name: guestName, city, rating, comment }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setPageState("submitted");
      } else {
        toast.error(data.message || (lang === "en" ? "Failed to send review." : "Gagal mengirimkan ulasan."));
      }
    } catch {
      toast.error(lang === "en" ? "An error occurred. Please try again." : "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (pageState === "loading") {
    return (
      <main className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9A96E]" />
      </main>
    );
  }

  // Error state
  if (pageState === "error") {
    return (
      <main className="min-h-screen bg-[#F9F7F2] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6">🔗</div>
          <h1 className="text-2xl font-bold text-[#402E2A] mb-3">{lang === "en" ? "Invalid Link" : "Tautan Tidak Valid"}</h1>
          <p className="text-[#70665E]">{lang === "en" ? "This review link was not found or is expired. Please contact the administrator if you believe this is an error." : "Tautan ulasan ini tidak ditemukan atau sudah tidak berlaku. Silakan hubungi admin jika Anda merasa ini adalah kesalahan."}</p>
        </div>
      </main>
    );
  }

  // Already submitted
  if (pageState === "already_done") {
    return (
      <main className="min-h-screen bg-[#F9F7F2] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-2xl font-bold text-[#402E2A] mb-3">{lang === "en" ? "Review Already Submitted" : "Ulasan Sudah Dikirim"}</h1>
          <p className="text-[#70665E]">{lang === "en" ? "You have already submitted a review. Thank you for your trust in Marme Villa!" : "Anda sudah mengisi ulasan ini sebelumnya. Terima kasih atas kepercayaan Anda kepada Marme Villa!"}</p>
        </div>
      </main>
    );
  }

  // Success submitted
  if (pageState === "submitted") {
    return (
      <main className="min-h-screen bg-[#F9F7F2] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-7xl mb-6">🙏</div>
          <h1 className="text-3xl font-serif font-bold text-[#402E2A] mb-4">{lang === "en" ? "Thank You!" : "Terima Kasih!"}</h1>
          <p className="text-[#70665E] leading-relaxed">
            {lang === "en" ? "Your review has been successfully received. Your words mean a lot to us and help other guests discover their best experiences at Marme Villa." : "Ulasan Anda telah berhasil kami terima. Kata-kata Anda sangat berarti bagi kami dan membantu calon tamu lain untuk menemukan pengalaman terbaik di Marme Villa."}
          </p>
          <div className="flex justify-center gap-1 mt-6">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <a
            href="/"
            className="inline-block mt-8 bg-[#402E2A] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#402E2A]/90 transition-colors"
          >
            {t("booking.success.back_home")}
          </a>
        </div>
      </main>
    );
  }

  // Review form
  return (
    <main className="min-h-screen bg-[#F9F7F2] flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">✍️</div>
          <h1 className="text-3xl font-serif font-bold text-[#402E2A]">{lang === "en" ? "Share Your Experience" : "Bagikan Pengalaman Anda"}</h1>
          {formData?.villa_name && (
            <p className="text-[#70665E] mt-2">
              {lang === "en" ? "Review for" : "Ulasan untuk"} <strong>{formData.villa_name}</strong>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E6E2D3] p-8 shadow-sm space-y-6">

          {/* Rating Stars */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#70665E] mb-3">
              {lang === "en" ? "Rate Your Experience" : "Rating Pengalaman Anda"}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200 fill-gray-200"
                      }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs text-[#70665E] mt-1.5">
              {rating === 5 && (lang === "en" ? "Excellent 🤩" : "Luar biasa 🤩")}
              {rating === 4 && (lang === "en" ? "Very good 😊" : "Sangat baik 😊")}
              {rating === 3 && (lang === "en" ? "Good 🙂" : "Cukup baik 🙂")}
              {rating === 2 && (lang === "en" ? "Poor 😕" : "Kurang memuaskan 😕")}
              {rating === 1 && (lang === "en" ? "Disappointing 😞" : "Mengecewakan 😞")}
            </div>
          </div>

          {/* Guest Name */}
          <div>
            <label htmlFor="guest_name" className="block text-xs font-semibold uppercase tracking-wider text-[#70665E] mb-2">
              {lang === "en" ? "Your Name" : "Nama Anda"}
            </label>
            <input
              id="guest_name"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder={lang === "en" ? "Name to be displayed" : "Nama yang akan ditampilkan"}
              required
              className="w-full border border-[#E6E2D3] bg-[#F9F7F2] rounded-xl px-4 py-3 text-sm text-[#402E2A] focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] transition-colors"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider text-[#70665E] mb-2">
              {lang === "en" ? "City of Origin" : "Asal Kota"}
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={lang === "en" ? "Example: New York, London, Singapore" : "Contoh: Jakarta, Surabaya, Singapura"}
              required
              className="w-full border border-[#E6E2D3] bg-[#F9F7F2] rounded-xl px-4 py-3 text-sm text-[#402E2A] focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] transition-colors"
            />
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-xs font-semibold uppercase tracking-wider text-[#70665E] mb-2">
              {lang === "en" ? "Tell Us Your Story" : "Cerita Pengalaman Anda"}
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={lang === "en" ? "Describe your stay experience at Marme Villa..." : "Ceritakan pengalaman menginap Anda di Marme Villa..."}
              required
              rows={5}
              minLength={10}
              className="w-full border border-[#E6E2D3] bg-[#F9F7F2] rounded-xl px-4 py-3 text-sm text-[#402E2A] focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] transition-colors resize-none leading-relaxed"
            />
            <div className="text-xs text-[#70665E] mt-1 text-right">{comment.length} {lang === "en" ? "characters" : "karakter"}</div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#402E2A] hover:bg-[#402E2A]/90 disabled:opacity-60 text-white py-4 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {lang === "en" ? "Submitting..." : "Mengirimkan..."}
              </>
            ) : (
              lang === "en" ? "Submit My Review 🌟" : "Kirim Ulasan Saya 🌟"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[#70665E] mt-6">
          {lang === "en" ? "Your review will be reviewed by our team before being displayed on the website." : "Ulasan Anda akan ditinjau oleh tim kami sebelum ditampilkan di website."}
        </p>
      </div>
    </main>
  );
}
