import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type?: 'error' | 'success' | 'info' | 'warning';
}

export function AlertModal({ isOpen, onClose, title, description, type = 'error' }: AlertModalProps) {
  if (!isOpen) return null;

  const iconMap = {
    error: <AlertCircle className="h-6 w-6 text-destructive" />,
    success: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
    info: <Info className="h-6 w-6 text-blue-600" />,
    warning: <AlertCircle className="h-6 w-6 text-gold" />,
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative bg-background border border-border/80 rounded-2xl w-full max-w-sm p-6 shadow-luxe z-10 overflow-hidden transform transition-all duration-300 animate-in fade-in scale-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground/60 hover:text-foreground transition-colors"
          aria-label="Close alert"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4 text-gold">
            {iconMap[type]}
          </div>
          
          <h3 className="text-lg font-bold text-primary font-serif tracking-wide">{title}</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
          
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-full bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
