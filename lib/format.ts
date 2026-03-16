export function getIntlLocale(locale: string) {
  switch (locale) {
    case "de":
      return "de-DE";
    case "en":
      return "en-US";
    default:
      return "ru-RU";
  }
}

export function formatPrice(value: number, locale: string) {
  return `${new Intl.NumberFormat(getIntlLocale(locale)).format(value)} €`;
}

export function formatMileage(value: number, locale: string) {
  return `${new Intl.NumberFormat(getIntlLocale(locale)).format(value)} km`;
}
