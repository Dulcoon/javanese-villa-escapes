import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import logoMarme from "@/assets/logo-marme.webp";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { WhatsAppButton } from "@/components/WhatsAppButton";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Halaman tidak dapat dimuat
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Terjadi kesalahan pada sistem kami. Anda dapat mencoba memuat ulang halaman atau kembali ke beranda.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Coba lagi
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Kembali ke beranda
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "xVhopx_xz8vQDWEZEWWTp2VGZ2YyOavm8Ehj1B_GpU0" },
      { title: "Marme Villa Jogja — Exceptional Service, Memorable Stays" },
      { name: "description", content: "Villa budaya mewah yang memadukan warisan tradisional Jawa, ketenangan, dan kenyamanan modern. Pesan Joglo pribadi Anda di Jawa Tengah." },
      { name: "author", content: "Marme Villa Jogja" },
      { property: "og:title", content: "Marme Villa Jogja — Exceptional Service, Memorable Stays" },
      { property: "og:description", content: "Rasakan keindahan warisan budaya Jawa di villa budaya premium kami." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        httpEquiv: "Content-Security-Policy",
        content: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.sandbox.midtrans.com https://snap-assets.sandbox.midtrans.com https://api.sandbox.midtrans.com https://pay.google.com https://gwk.gopayapi.com;",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=Manrope:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function PageLoader() {
  const isLoading = useRouterState({ select: (s) => s.status === 'pending' });

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[99999] h-0.5 transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="h-full w-full bg-[#C9A96E] animate-[loaderSlide_1.2s_ease_infinite] origin-left" />
    </div>
  );
}

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
        <style>{`@keyframes loaderSlide{0%{transform:scaleX(0);transform-origin:left}50%{transform:scaleX(1);transform-origin:left}50.1%{transform:scaleX(1);transform-origin:right}100%{transform:scaleX(0);transform-origin:right}}`}</style>
        <script type="text/javascript" src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={import.meta.env.VITE_MIDTRANS_CLIENT_KEY}></script>
      </head>
      <body>
        <PageLoader />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#F5F6EB] flex items-center justify-center overflow-hidden animate-[splashFade_2s_ease_forwards]">
      {/* Outer slow-expanding ring */}
      <div className="absolute w-[480px] h-[480px] sm:w-[600px] sm:h-[600px] rounded-full border border-[#C9A96E]/20 animate-[ringExpand_2s_ease-out_0.2s_forwards] opacity-0 pointer-events-none" />
      {/* Middle ring */}
      <div className="absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full border border-[#C9A96E]/30 animate-[ringExpand_2s_ease-out_0.5s_forwards] opacity-0 pointer-events-none" />
      {/* Soft gold radial glow behind logo */}
      <div className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.18)_0%,transparent_70%)] animate-[breathe_2s_ease-in-out_0.5s_infinite_alternate] pointer-events-none" />
      {/* Logo */}
      <div className="relative w-[260px] sm:w-[360px] md:w-[440px] animate-[logoReveal_0.8s_cubic-bezier(0.22,1,0.36,1)_0.2s_both]">
        <img src={logoMarme} alt="Marme Villa" className="w-full block mix-blend-multiply" />
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes splashFade {
          0%   { opacity: 1; }
          78%  { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
        @keyframes logoReveal {
          0%   { opacity: 0; transform: scale(0.88) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes ringExpand {
          0%   { opacity: 0; transform: scale(0.7); }
          20%  { opacity: 1; }
          80%  { opacity: 0.4; }
          100% { opacity: 0; transform: scale(1.35); }
        }
        @keyframes breathe {
          0%   { opacity: 0.5; transform: scale(0.92); }
          100% { opacity: 1;   transform: scale(1.08); }
        }
      `}} />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <SplashScreen />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <WhatsAppButton />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
