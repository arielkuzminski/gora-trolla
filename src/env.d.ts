/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface GTConcertText {
  pl?: string;
  en?: string;
}

interface GTConcert {
  id?: string;
  title: GTConcertText | string;
  date: string;
  venue: GTConcertText | string;
  city: string;
  poster?: string;
  description?: GTConcertText | string | null;
}

interface GTLightboxItem {
  src: string;
  alt?: string;
  caption?: string;
}

interface Window {
  initEntranceAnimations?: () => void;
  i18n?: {
    getLang?: () => 'pl' | 'en';
  };
  GoraTrollaLightbox?: {
    open: (items: GTLightboxItem[], index: number) => void;
    close: () => void;
  };
}

interface Document {
  startViewTransition?: (callback: () => void) => void;
}
