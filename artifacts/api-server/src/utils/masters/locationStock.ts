export interface LocationStock {
  location: string;
  stock: string;
}

export function buildMasterLocationStockData(
  locationStocks: LocationStock[] | undefined,
  currentStock: string | undefined
) {
  let ls = locationStocks ?? [];

  // Backward compatibility
  if (ls.length === 0) {
    ls = [
      {
        location: "Unallocated",
        stock: currentStock ?? "0",
      },
    ];
  }

  // Merge duplicate locations
  const mergedLocations = new Map<string, number>();

  for (const item of ls) {
    const location =   item.location?.trim() || "Unallocated";
    const stock = parseFloat(item.stock) || 0;

    mergedLocations.set(
      location,
      (mergedLocations.get(location) ?? 0) + stock
    );
  }

  const normalizedLocationStocks = Array.from(
    mergedLocations.entries()
  ).map(([location, stock]) => ({
    location,
    stock: String(stock),
  }));

  const normalizedCurrentStock = String(
    normalizedLocationStocks.reduce(
      (sum, item) => sum + (parseFloat(item.stock) || 0),
      0
    )
  );

  const warehouseLocation = normalizedLocationStocks
    .map(item => item.location)
    .join(", ");

  return {
    locationStocks: normalizedLocationStocks,
    currentStock: normalizedCurrentStock,
    warehouseLocation,
  };
}