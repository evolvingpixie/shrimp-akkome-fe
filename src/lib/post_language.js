import iso6391 from 'iso-639-1'
import { computed } from 'vue'

export const usePostLanguageOptions = () => {
  const postLanguageOptions = computed(() => {
    return iso6391.getAllCodes().map(lang => ({
      key: lang,
      value: lang,
      label: lang,
    }));
  })

  return {
    postLanguageOptions,
  }
}
