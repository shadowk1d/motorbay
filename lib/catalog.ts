export type RawSearchValue = string | string[] | undefined;
export type RawCatalogSearchParams = Record<string, RawSearchValue>;

export type CatalogFilters = {
  page: number;
  query: string;
  brand: string;
  model: string;
  fuels: string[];
  transmissions: string[];
  bodyType: string;
  driveType: string;
  condition: string;
  sellerType: string;
  minPrice?: number;
  maxPrice?: number;
  minMileage?: number;
  maxMileage?: number;
  minYear?: number;
  maxYear?: number;
  minPower?: number;
  maxPower?: number;
  minWeight?: number;
  maxWeight?: number;
  minSeats?: number;
  maxSeats?: number;
  doors: string;
  ownersCount?: number;
  huUntil: string;
  emissionSticker: string;
  co2Class: string;
};

export function getFirstParam(value: RawSearchValue) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function getMultiParam(value: RawSearchValue) {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getNumberParam(value: RawSearchValue) {
  const raw = getFirstParam(value).trim();
  if (!raw) return undefined;
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

export function parseCatalogFilters(searchParams: RawCatalogSearchParams): CatalogFilters {
  const pageValue = Number(getFirstParam(searchParams.page));

  return {
    page: pageValue > 0 ? pageValue : 1,
    query: getFirstParam(searchParams.query).trim(),
    brand: getFirstParam(searchParams.brand).trim(),
    model: getFirstParam(searchParams.model).trim(),
    fuels: getMultiParam(searchParams.fuel),
    transmissions: getMultiParam(searchParams.transmission),
    bodyType: getFirstParam(searchParams.bodyType).trim(),
    driveType: getFirstParam(searchParams.driveType).trim(),
    condition: getFirstParam(searchParams.condition).trim(),
    sellerType: getFirstParam(searchParams.sellerType).trim(),
    minPrice: getNumberParam(searchParams.minPrice),
    maxPrice: getNumberParam(searchParams.maxPrice),
    minMileage: getNumberParam(searchParams.minMileage),
    maxMileage: getNumberParam(searchParams.maxMileage),
    minYear: getNumberParam(searchParams.minYear),
    maxYear: getNumberParam(searchParams.maxYear),
    minPower: getNumberParam(searchParams.minPower),
    maxPower: getNumberParam(searchParams.maxPower),
    minWeight: getNumberParam(searchParams.minWeight),
    maxWeight: getNumberParam(searchParams.maxWeight),
    minSeats: getNumberParam(searchParams.minSeats),
    maxSeats: getNumberParam(searchParams.maxSeats),
    doors: getFirstParam(searchParams.doors).trim(),
    ownersCount: getNumberParam(searchParams.ownersCount),
    huUntil: getFirstParam(searchParams.huUntil).trim(),
    emissionSticker: getFirstParam(searchParams.emissionSticker).trim(),
    co2Class: getFirstParam(searchParams.co2Class).trim()
  };
}

export function buildCatalogWhere(filters: CatalogFilters): any {
  const clauses: any[] = [];

  if (filters.query) {
    clauses.push({
      OR: [
        {brand: {contains: filters.query, mode: "insensitive"}},
        {model: {contains: filters.query, mode: "insensitive"}},
        {description: {contains: filters.query, mode: "insensitive"}},
        {variant: {contains: filters.query, mode: "insensitive"}}
      ]
    });
  }

  if (filters.brand) {
    clauses.push({brand: {equals: filters.brand, mode: "insensitive"}});
  }

  if (filters.model) {
    clauses.push({model: {equals: filters.model, mode: "insensitive"}});
  }

  if (filters.fuels.length > 0) {
    clauses.push({fuel: {in: filters.fuels}});
  }

  if (filters.transmissions.length > 0) {
    clauses.push({transmission: {in: filters.transmissions}});
  }

  if (filters.bodyType) {
    clauses.push({bodyType: {equals: filters.bodyType, mode: "insensitive"}});
  }

  if (filters.driveType) {
    clauses.push({driveType: {equals: filters.driveType, mode: "insensitive"}});
  }

  if (filters.condition) {
    clauses.push({condition: {equals: filters.condition, mode: "insensitive"}});
  }

  if (filters.sellerType) {
    clauses.push({sellerType: {equals: filters.sellerType, mode: "insensitive"}});
  }

  if (filters.doors) {
    clauses.push({doors: {equals: filters.doors, mode: "insensitive"}});
  }

  if (filters.huUntil) {
    clauses.push({huUntil: {equals: filters.huUntil, mode: "insensitive"}});
  }

  if (filters.emissionSticker) {
    clauses.push({emissionSticker: {equals: filters.emissionSticker, mode: "insensitive"}});
  }

  if (filters.co2Class) {
    clauses.push({co2Class: {equals: filters.co2Class, mode: "insensitive"}});
  }

  if (filters.ownersCount !== undefined) {
    clauses.push({ownersCount: {lte: filters.ownersCount}});
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    clauses.push({price: {gte: filters.minPrice, lte: filters.maxPrice}});
  }

  if (filters.minMileage !== undefined || filters.maxMileage !== undefined) {
    clauses.push({mileage: {gte: filters.minMileage, lte: filters.maxMileage}});
  }

  if (filters.minYear !== undefined || filters.maxYear !== undefined) {
    clauses.push({year: {gte: filters.minYear, lte: filters.maxYear}});
  }

  if (filters.minPower !== undefined || filters.maxPower !== undefined) {
    clauses.push({powerHp: {gte: filters.minPower, lte: filters.maxPower}});
  }

  if (filters.minWeight !== undefined || filters.maxWeight !== undefined) {
    clauses.push({weightKg: {gte: filters.minWeight, lte: filters.maxWeight}});
  }

  if (filters.minSeats !== undefined || filters.maxSeats !== undefined) {
    clauses.push({seats: {gte: filters.minSeats, lte: filters.maxSeats}});
  }

  return clauses.length > 0 ? {AND: clauses} : {};
}

export function buildCatalogQueryString(filters: Partial<CatalogFilters> & {page?: number}) {
  const searchParams = new URLSearchParams();

  const addValue = (key: string, value?: string | number) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  };

  addValue("query", filters.query);
  addValue("brand", filters.brand);
  addValue("model", filters.model);
  filters.fuels?.forEach((value) => searchParams.append("fuel", value));
  filters.transmissions?.forEach((value) => searchParams.append("transmission", value));
  addValue("bodyType", filters.bodyType);
  addValue("driveType", filters.driveType);
  addValue("condition", filters.condition);
  addValue("sellerType", filters.sellerType);
  addValue("minPrice", filters.minPrice);
  addValue("maxPrice", filters.maxPrice);
  addValue("minMileage", filters.minMileage);
  addValue("maxMileage", filters.maxMileage);
  addValue("minYear", filters.minYear);
  addValue("maxYear", filters.maxYear);
  addValue("minPower", filters.minPower);
  addValue("maxPower", filters.maxPower);
  addValue("minWeight", filters.minWeight);
  addValue("maxWeight", filters.maxWeight);
  addValue("minSeats", filters.minSeats);
  addValue("maxSeats", filters.maxSeats);
  addValue("doors", filters.doors);
  addValue("ownersCount", filters.ownersCount);
  addValue("huUntil", filters.huUntil);
  addValue("emissionSticker", filters.emissionSticker);
  addValue("co2Class", filters.co2Class);
  addValue("page", filters.page);

  return searchParams.toString();
}
