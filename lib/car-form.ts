const allowedFuelValues = [
  "petrol",
  "diesel",
  "hybrid-diesel-electric",
  "hybrid-petrol-electric",
  "cng",
  "electric",
  "hydrogen",
  "plugin-hybrid",
  "ethanol",
  "lpg",
  "other"
];

const allowedTransmissionValues = ["automatic", "semi-automatic", "manual"];

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getNumber(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseCarFormData(formData: FormData) {
  const rawFuel = getString(formData, "fuel");
  const rawTransmission = getString(formData, "transmission");

  return {
    brand: getString(formData, "brand"),
    model: getString(formData, "model"),
    variant: getString(formData, "variant") || null,
    year: getNumber(formData, "year"),
    price: getNumber(formData, "price"),
    mileage: getNumber(formData, "mileage"),
    fuel: allowedFuelValues.includes(rawFuel) ? rawFuel : "",
    transmission: allowedTransmissionValues.includes(rawTransmission) ? rawTransmission : "",
    description: getString(formData, "description"),
    primaryChoice: getString(formData, "primaryChoice"),
    bodyType: getString(formData, "bodyType") || null,
    driveType: getString(formData, "driveType") || null,
    condition: getString(formData, "condition") || null,
    sellerType: getString(formData, "sellerType") || null,
    firstRegistration: getString(formData, "firstRegistration") || null,
    ownersCount: getNumber(formData, "ownersCount") ?? null,
    weightKg: getNumber(formData, "weightKg") ?? null,
    powerHp: getNumber(formData, "powerHp") ?? null,
    powerKw: getNumber(formData, "powerKw") ?? null,
    displacementCc: getNumber(formData, "displacementCc") ?? null,
    seats: getNumber(formData, "seats") ?? null,
    doors: getString(formData, "doors") || null,
    huUntil: getString(formData, "huUntil") || null,
    airConditioning: getString(formData, "airConditioning") || null,
    parkingAssist: getString(formData, "parkingAssist") || null,
    airbags: getString(formData, "airbags") || null,
    color: getString(formData, "color") || null,
    interior: getString(formData, "interior") || null,
    towingCapacityBrakedKg: getNumber(formData, "towingCapacityBrakedKg") ?? null,
    towingCapacityUnbrakedKg: getNumber(formData, "towingCapacityUnbrakedKg") ?? null,
    cylinders: getNumber(formData, "cylinders") ?? null,
    tankVolumeL: getNumber(formData, "tankVolumeL") ?? null,
    fuelConsumption: getString(formData, "fuelConsumption") || null,
    co2Emission: getNumber(formData, "co2Emission") ?? null,
    co2Class: getString(formData, "co2Class") || null,
    emissionSticker: getString(formData, "emissionSticker") || null,
    category: getString(formData, "category") || null,
    trimLine: getString(formData, "trimLine") || null,
    origin: getString(formData, "origin") || null
  };
}
