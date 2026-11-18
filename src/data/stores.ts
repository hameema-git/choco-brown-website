export type Store = {
  id: string;
  name: string;
  subtitle: string;
  address: string;
  query: string;
  lat: number;
  lng: number;
  googleDirections: string;
  googleSearch: string;
  osmSearch: string;
  osmDirections: string;
  embed: string;
};

function buildStore(
  store: Pick<Store, "id" | "name" | "subtitle" | "address" | "query" | "lat" | "lng">,
): Store {
  const { lat, lng, query } = store;
  const encodedQuery = encodeURIComponent(query);
  const deltaLng = 0.012;
  const deltaLat = 0.008;
  return {
    ...store,
    googleDirections: `https://www.google.com/maps/dir/?api=1&destination=${encodedQuery}`,
    googleSearch: `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
    osmSearch: `https://www.openstreetmap.org/search?query=${encodedQuery}`,
    osmDirections: `https://www.openstreetmap.org/directions?to=${lat}%2C${lng}#map=16/${lat}/${lng}`,
    embed: `https://www.openstreetmap.org/export/embed.html?bbox=${lng - deltaLng}%2C${lat - deltaLat}%2C${lng + deltaLng}%2C${lat + deltaLat}&layer=mapnik&marker=${lat}%2C${lng}`,
  };
}

export const stores: Store[] = [
  buildStore({
    id: "vennala",
    name: "Vennala",
    subtitle: "Where the happiness began",
    address:
      "Arakkakadavu Road, near Arakkakadavu Bridge, Sundari Mukk Junction, Vennala, Kochi 682028.",
    query: "Choco Brown Vennala Kochi",
    lat: 9.9916678,
    lng: 76.3278941,
  }),
  buildStore({
    id: "eroor",
    name: "Eroor",
    subtitle: "Another little corner of happy",
    address:
      "Pulse Nagar Road, Eroor, Kochi, Kerala. Stop by for your favourite bakes and a little something more.",
    query: "Choco Brown Eroor Kochi",
    lat: 9.967003,
    lng: 76.340128,
  }),
];
