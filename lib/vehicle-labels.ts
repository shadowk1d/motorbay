import {
  BODY_TYPE_OPTIONS,
  CO2_CLASS_OPTIONS,
  CONDITION_OPTIONS,
  DRIVE_TYPE_OPTIONS,
  EMISSION_STICKER_OPTIONS,
  FUEL_OPTIONS,
  SELLER_OPTIONS,
  TRANSMISSION_OPTIONS
} from "@/lib/filter-options";

export type SupportedLocale = "ru" | "en" | "de";

type ValueMap = Record<string, Record<SupportedLocale, string>>;

const optionLabels: ValueMap = {
  petrol: {ru: "Бензин", en: "Petrol", de: "Benzin"},
  diesel: {ru: "Дизель", en: "Diesel", de: "Diesel"},
  "hybrid-diesel-electric": {ru: "Гибрид (дизель/электро)", en: "Hybrid (diesel/electric)", de: "Hybrid (Diesel/Elektro)"},
  "hybrid-petrol-electric": {ru: "Гибрид (бензин/электро)", en: "Hybrid (petrol/electric)", de: "Hybrid (Benzin/Elektro)"},
  cng: {ru: "Газ (CNG)", en: "Natural gas (CNG)", de: "Erdgas (CNG)"},
  electric: {ru: "Электро", en: "Electric", de: "Elektro"},
  hydrogen: {ru: "Водород", en: "Hydrogen", de: "Wasserstoff"},
  "plugin-hybrid": {ru: "Подключаемый гибрид", en: "Plug-in hybrid", de: "Plug-in-Hybrid"},
  ethanol: {ru: "Этанол", en: "Ethanol", de: "Ethanol (FFV, E85 etc.)"},
  lpg: {ru: "Автогаз", en: "LPG", de: "Autogas (LPG)"},
  other: {ru: "Другое", en: "Other", de: "Andere"},
  automatic: {ru: "Автомат", en: "Automatic", de: "Automatik"},
  "semi-automatic": {ru: "Полуавтомат", en: "Semi-automatic", de: "Halbautomatik"},
  manual: {ru: "Механика", en: "Manual", de: "Schaltgetriebe"},
  convertible: {ru: "Кабриолет / родстер", en: "Convertible / roadster", de: "Cabrio / Roadster"},
  "offroad-pickup": {ru: "Внедорожник / пикап", en: "Off-road / pickup", de: "Geländewagen / Pickup / SUV"},
  "small-car": {ru: "Малолитражка", en: "Small car", de: "Kleinwagen"},
  estate: {ru: "Универсал", en: "Estate", de: "Kombi"},
  saloon: {ru: "Седан", en: "Saloon", de: "Limousine"},
  "sport-coupe": {ru: "Спорткар / купе", en: "Sports car / coupe", de: "Sportwagen / Coupé"},
  "van-minibus": {ru: "Фургон / минивэн", en: "Van / minibus", de: "Van / Minibus"},
  front: {ru: "Передний", en: "Front-wheel", de: "Frontantrieb"},
  rear: {ru: "Задний", en: "Rear-wheel", de: "Heckantrieb"},
  all: {ru: "Полный", en: "All-wheel", de: "Allrad"},
  new: {ru: "Новый", en: "New", de: "Neu"},
  used: {ru: "Подержанный", en: "Used", de: "Gebraucht"},
  dealer: {ru: "Дилер", en: "Dealer", de: "Händler"},
  private: {ru: "Частное лицо", en: "Private seller", de: "Privatanbieter"},
  company: {ru: "Служебные / фирма", en: "Company car", de: "Firmenfahrzeuge"},
  "1": {ru: "1", en: "1", de: "1"},
  "2": {ru: "2", en: "2", de: "2"},
  "3": {ru: "3", en: "3", de: "3"},
  "4": {ru: "4 (зелёный)", en: "4 (green)", de: "4 (Grün)"},
  "A+": {ru: "A+", en: "A+", de: "A+"},
  A: {ru: "A", en: "A", de: "A"},
  B: {ru: "B", en: "B", de: "B"},
  C: {ru: "C", en: "C", de: "C"},
  D: {ru: "D", en: "D", de: "D"},
  E: {ru: "E", en: "E", de: "E"},
  F: {ru: "F", en: "F", de: "F"},
  G: {ru: "G", en: "G", de: "G"}
};

export function getOptionLabel(locale: string, value?: string | null) {
  if (!value) return "";
  const currentLocale: SupportedLocale = locale === "de" || locale === "en" ? locale : "ru";
  return optionLabels[value]?.[currentLocale] ?? value;
}

function withLabels<T extends readonly string[]>(locale: string, values: T) {
  return values.map((value) => ({value, label: getOptionLabel(locale, value)}));
}

export function getFuelChoices(locale: string) {
  return withLabels(locale, FUEL_OPTIONS);
}

export function getTransmissionChoices(locale: string) {
  return withLabels(locale, TRANSMISSION_OPTIONS);
}

export function getBodyTypeChoices(locale: string) {
  return withLabels(locale, BODY_TYPE_OPTIONS);
}

export function getDriveTypeChoices(locale: string) {
  return withLabels(locale, DRIVE_TYPE_OPTIONS);
}

export function getConditionChoices(locale: string) {
  return withLabels(locale, CONDITION_OPTIONS);
}

export function getSellerChoices(locale: string) {
  return withLabels(locale, SELLER_OPTIONS);
}

export function getEmissionStickerChoices(locale: string) {
  return withLabels(locale, EMISSION_STICKER_OPTIONS);
}

export function getCo2ClassChoices(locale: string) {
  return withLabels(locale, CO2_CLASS_OPTIONS);
}
