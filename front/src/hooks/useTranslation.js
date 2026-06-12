import { useLanguage } from '@/providers/LanguageProvider'

export function useTranslation() {
  return useLanguage()
}
