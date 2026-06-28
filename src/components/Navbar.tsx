import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, ArrowRight, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

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
  const { lang, setLang, t } = useTranslation();

  const links = [
    [t("hero.btn.about"), "/#about"], 
    [t("rooms.eyebrow"), "/#rooms"], 
    [t("exp.eyebrow"), "/#experiences"],
    [t("gallery.eyebrow"), "/#gallery"], 
    [t("location.eyebrow"), "/#location"], 
    [t("contact.eyebrow"), "/#contact"],
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
              <button 
                onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
                className="hidden lg:flex items-center w-[52px] h-[26px] bg-black/5 dark:bg-white/10 rounded-full p-1 cursor-pointer transition-colors border border-border/40 relative"
                aria-label="Toggle language"
              >
                <div className="w-full flex justify-between px-1 text-[9px] font-bold text-muted-foreground z-0">
                  <span>ID</span>
                  <span>EN</span>
                </div>
                <div className={`absolute top-0.5 bottom-0.5 w-[20px] bg-white dark:bg-black rounded-full shadow-sm flex items-center justify-center text-[9px] font-bold transition-transform duration-300 z-10 ${lang === 'en' ? 'translate-x-[24px]' : 'translate-x-0'}`}>
                  {lang === 'id' ? 'ID' : 'EN'}
                </div>
              </button>
              {/* 
              <Link to="/availability" className="hidden lg:flex items-center gap-2 px-5 py-2.5 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm tracking-wide rounded-full">
                {t("nav.availability")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              */}
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
            <ArrowLeft className="h-4 w-4" /> {t("nav.back")}
          </Link>
        )}
      </div>

      {variant === "full" && isOpen && (
        <div className="lg:hidden fixed inset-x-0 top-20 h-[calc(100vh-5rem)] bg-background/95 backdrop-blur-md border-t border-border/40 overflow-y-auto">
          <nav className="flex flex-col px-6 py-8">
            <div className="flex justify-between items-center py-4 border-b border-border/40 mb-2">
              <span className="text-sm font-medium text-muted-foreground">Bahasa / Language</span>
              <button 
                onClick={() => {
                  setLang(lang === 'id' ? 'en' : 'id');
                  setIsOpen(false);
                }}
                className="flex items-center w-[60px] h-[30px] bg-black/5 dark:bg-white/10 rounded-full p-1 cursor-pointer transition-colors border border-border/40 relative"
              >
                <div className="w-full flex justify-between px-1 text-[10px] font-bold text-muted-foreground z-0">
                  <span>ID</span>
                  <span>EN</span>
                </div>
                <div className={`absolute top-0.5 bottom-0.5 w-[24px] bg-white dark:bg-black rounded-full shadow-sm flex items-center justify-center text-[10px] font-bold transition-transform duration-300 z-10 ${lang === 'en' ? 'translate-x-[28px]' : 'translate-x-0'}`}>
                  {lang === 'id' ? 'ID' : 'EN'}
                </div>
              </button>
            </div>
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
