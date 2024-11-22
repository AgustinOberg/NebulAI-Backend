export type Language = 'es' | 'en' | 'pt' | 'fr' | 'it';
export const AVAILABLE_LANGUAGES: Language[] = ['es', 'en', 'pt', 'fr', 'it'];
export const LANGUAGE_TRANSLATIONS: Record<Language, string> = {
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
  fr: 'French',
  it: 'Italian',
};
