"use client";

"use client";

import {useMemo, useState} from "react";
import {CAR_BRANDS, getModelsForBrand} from "@/lib/filter-options";

type Props = {
  brand?: string;
  model?: string;
  brandPlaceholder?: string;
  modelPlaceholder?: string;
};

export default function BrandModelSelect({
  brand,
  model,
  brandPlaceholder = "Марка",
  modelPlaceholder = "Модель"
}: Props) {
  const [selectedBrand, setSelectedBrand] = useState(brand ?? "");
  const [selectedModel, setSelectedModel] = useState(model ?? "");

  const models = useMemo(() => (selectedBrand ? getModelsForBrand(selectedBrand) : []), [selectedBrand]);

  const onBrandChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedBrand(value);
    setSelectedModel("");
  };

  const onModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedModel(value);
  };

  return (
    <>
      <select name="brand" value={selectedBrand} onChange={onBrandChange}>
        <option value="">{brandPlaceholder}</option>
        {CAR_BRANDS.map((brandOption) => (
          <option key={brandOption} value={brandOption}>
            {brandOption}
          </option>
        ))}
      </select>

      <select
        name="model"
        value={selectedModel}
        onChange={onModelChange}
        disabled={!selectedBrand}
      >
        <option value="">{modelPlaceholder}</option>
        {models.map((modelOption) => (
          <option key={modelOption} value={modelOption}>
            {modelOption}
          </option>
        ))}
      </select>
    </>
  );
}
