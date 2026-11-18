export type Product = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: "Filled buns" | "Donuts";
  price: number;
  image: string;
  tag?: string;
};

export type Cart = Record<string, number>;
export type OrderMode = "pickup" | "delivery";

export const products: Product[] = [
  {
    id: "milk-choco",
    name: "Milk Chocolate Bun",
    shortDescription: "A soft little bun. A whole lot of chocolate.",
    description:
      "Our golden, pillowy bun with a generous heart of smooth milk chocolate. Soft on the outside, gloriously gooey on the inside. The little treat that started a very big love affair.",
    category: "Filled buns",
    price: 35,
    image: "/images/milk-choco-bun.jpg",
    tag: "THE CROWD FAVOURITE",
  },
  {
    id: "dark-choco",
    name: "Dark Chocolate Bun",
    shortDescription: "Deep, rich chocolate. No holding back.",
    description:
      "For the serious chocolate person. A soft, golden bun generously filled with rich dark chocolate. A little less sweet, a little more intense, and every bit as comforting.",
    category: "Filled buns",
    price: 40,
    image: "/images/dark-choco-bun.jpg",
  },
  {
    id: "cream-bun",
    name: "Classic Cream Bun",
    shortDescription: "The old-school favourite, made with love.",
    description:
      "Some things never need reinventing. Fresh, fluffy bread and a lovely generous layer of sweet vanilla cream. A little bite of the good old days.",
    category: "Filled buns",
    price: 25,
    image: "/images/cream-bun.jpg",
  },
  {
    id: "choco-donut",
    name: "Chocolate Donut",
    shortDescription: "Golden, fluffy, and dressed in chocolate.",
    description:
      "A pillowy golden donut with a thick, glossy coat of chocolate. The perfect companion for your afternoon catch-up, coffee break, or just-because moment.",
    category: "Donuts",
    price: 35,
    image: "/images/choco-donut.jpg",
  },
  {
    id: "white-choco",
    name: "White Chocolate Bun",
    shortDescription: "A dreamy, creamy white chocolate centre.",
    description:
      "A little sweeter, a little dreamier. Our signature soft bun with a generous filling of smooth white chocolate. For the days that call for something extra comforting.",
    category: "Filled buns",
    price: 40,
    image: "/images/white-choco-bun.jpg",
  },
  {
    id: "double-choco",
    name: "Double Chocolate Donut",
    shortDescription: "Chocolate inside. Chocolate outside. Yes.",
    description:
      "Why stop at the glaze? A soft, golden donut with chocolate on top and a rich chocolate centre. Made for the kind of craving that only more chocolate can fix.",
    category: "Donuts",
    price: 45,
    image: "/images/double-choco-donut.jpg",
  },
];

export const PHONE = "+917025454597";
export const WHATSAPP = "https://wa.me/917025454597";
export const SWIGGY_URL = "https://www.swiggy.com/search?query=Choco%20Brown";
export const ZOMATO_URL = "https://www.zomato.com/kochi/choco-brown-vennala";
export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Choco+Brown+Vennala+Kochi";

export const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export function readCart(): Cart {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem("choco-brown-bag") || "{}",
    );
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    return Object.fromEntries(
      Object.entries(saved).filter(
        ([id, quantity]) =>
          products.some((product) => product.id === id) &&
          typeof quantity === "number" &&
          Number.isInteger(quantity) &&
          quantity > 0 &&
          quantity <= 20,
      ),
    );
  } catch {
    return {};
  }
}
