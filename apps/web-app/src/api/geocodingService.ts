export interface GeocodingSuggestion {
  displayName: string;
  latitude: number;
  longitude: number;
}

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export async function searchVietnamAddress(query: string): Promise<GeocodingSuggestion[]> {
  const normalized = query.trim();
  if (!normalized) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("countrycodes", "vn");
  url.searchParams.set("q", normalized);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Accept-Language": "vi,en",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Khong the goi y dia chi luc nay");
  }

  const data = (await res.json()) as NominatimResult[];
  return data
    .map((item) => ({
      displayName: item.display_name,
      latitude: Number.parseFloat(item.lat),
      longitude: Number.parseFloat(item.lon),
    }))
    .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
}
