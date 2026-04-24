import pl from './pl.json';
import en from './en.json';

const translations = { pl, en } as const;

type Lang = 'pl' | 'en';

export function useTranslations(lang: Lang) {
  const dict = translations[lang];
  return function t(key: string): string {
    return key.split('.').reduce((obj: any, k) => obj?.[k], dict) ?? key;
  };
}
