import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, ArrowRight, ArrowLeft } from "lucide-react";

type NavbarProps = {
  /** 
   * If true, shows the simple "Back" variant. 
   * If false, shows the full navigation with links and hamburger menu.
   */
  variant?: "full" | "back";
  backTo?: string;
  backText?: string;
};

export function Navbar({ variant = "full", backTo = "/", backText = "Kembali ke beranda" }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    ["Tentang Kami", "/#about"], 
    ["Kamar", "/#rooms"], 
    ["Pengalaman", "/#experiences"],
    ["Galeri", "/#gallery"], 
    ["Lokasi", "/#location"], 
    ["Kontak", "/#contact"],
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex flex-col leading-none" onClick={() => setIsOpen(false)}>
          <span className="font-serif text-[26px] tracking-[0.08em] font-normal text-primary">MARME</span>
          <span className="font-sans text-[9.5px] tracking-[0.42em] font-light text-muted-foreground mt-1.5 ml-0.5 uppercase">VILLA JOGJA</span>
        </Link>

        {variant === "full" ? (
          <>
            <nav className="hidden lg:flex items-center gap-10 text-sm">
              {links.map(([l, h]) => (
                <a key={h} href={h} className="text-foreground/80 hover:text-gold transition-colors">{l}</a>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <Link to="/availability" className="hidden items-center gap-2 px-5 py-2.5 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm tracking-wide rounded-full">
                Cek Ketersediaan <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button 
                className="lg:hidden p-2 -mr-2 text-primary"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </>
        ) : (
          <Link to={backTo} className="text-sm text-foreground/70 hover:text-gold inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> {backText}
          </Link>
        )}
      </div>

      {variant === "full" && isOpen && (
        <div className="lg:hidden fixed inset-x-0 top-20 h-[calc(100vh-5rem)] bg-background/95 backdrop-blur-md border-t border-border/40 overflow-y-auto">
          <nav className="flex flex-col px-6 py-8">
            {links.map(([l, h]) => (
              <a 
                key={h} 
                href={h} 
                onClick={() => setIsOpen(false)}
                className="py-4 border-b border-border/40 text-lg font-medium text-foreground/80 hover:text-gold transition-colors"
              >
                {l}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
