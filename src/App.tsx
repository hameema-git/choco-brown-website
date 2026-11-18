import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { Dialog } from "./components/Dialog";
import { OrderDrawer } from "./components/OrderDrawer";
import {
  MAPS_URL,
  PHONE,
  WHATSAPP,
  ZOMATO_URL,
  money,
  products,
  readCart,
  type OrderMode,
  type Product,
} from "./data/menu";
import { stores } from "./data/stores";
import { useShopStatus } from "./data/status";

const categories = ["All favourites", "Filled buns", "Donuts"] as const;
type Category = (typeof categories)[number];

const testimonials = [
  {
    text: "Soft, fluffy buns with gooey, generous fillings. The kind of little treat you come back for.",
    label: "ON OUR BUNS",
  },
  {
    text: "Big on chocolate, lovely little prices. Proof that the simplest things are often the best.",
    label: "ON VALUE FOR MONEY",
  },
  {
    text: "Fresh from the oven and gone before you know it. Come early for your favourites.",
    label: "ON FRESH BATCHES",
  },
];

const COPY_FEEDBACK_TIMEOUT = 2400;

function Instagram({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.8" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Flourish({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 2v28M2 16h28M6.1 6.1l19.8 19.8M6.1 25.9 25.9 6.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="4" fill="currentColor" />
    </svg>
  );
}

function BunDoodle({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 110 92"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 59C10 37 24 17 48 13c26-5 48 11 49 35 1 7-2 14-5 18-8 11-58 16-71 3-3-3-5-6-6-10Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M16 56c11 11 63 13 80-3M22 70c14 14 54 15 67-1M41 20c-6 6-9 13-8 18m25-21c-5 8-6 16-4 23m20-19c-2 5-1 12 1 17"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="m4 24 5 4m88-16-4 7M53 2v5m49 28 6-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      choco
      <br />
      brown<span className="wordmark-dot">.</span>
    </span>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ProductCard({
  product,
  quantity,
  onAdd,
  onQuantityChange,
  onDetails,
  index,
  available,
}: {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onQuantityChange: (quantity: number) => void;
  onDetails: () => void;
  index: number;
  available: boolean;
}) {
  return (
    <motion.article
      layout
      className={available ? "product" : "product product-unavailable"}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35, delay: index * 0.055 }}
    >
      <button
        className="product-image"
        onClick={onDetails}
        aria-label={`View ${product.name} details`}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width="600"
          height="600"
        />
        {available && product.tag && (
          <span className="product-tag">{product.tag}</span>
        )}
        {!available && (
          <span className="product-unavailable-label">Currently unavailable</span>
        )}
        <span className="product-image-arrow">
          <ArrowUpRight size={19} />
        </span>
      </button>
      <div className="product-info">
        <h3>
          <button onClick={onDetails}>{product.name}</button>
        </h3>
        <p>{product.shortDescription}</p>
        <div className="product-bottom">
          <span className="product-price">{money(product.price)}</span>
          {!available ? (
            <button className="add-button" disabled>
              Unavailable
            </button>
          ) : quantity > 0 ? (
            <div className="quantity-control product-quantity">
              <button
                onClick={() => onQuantityChange(quantity - 1)}
                aria-label={`Remove one ${product.name}`}
              >
                <Minus size={14} />
              </button>
              <span aria-label={`${quantity} in bag`} aria-live="polite">
                {quantity}
              </span>
              <button
                onClick={onAdd}
                disabled={quantity >= 20}
                aria-label={`Add one ${product.name}`}
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              className="add-button"
              onClick={onAdd}
              aria-label={`Add ${product.name} to bag`}
            >
              Add <Plus size={15} />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function App() {
  const [category, setCategory] = useState<Category>("All favourites");
  const [fullMenu, setFullMenu] = useState(false);
  const [cart, setCart] = useState(readCart);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderMode, setOrderMode] = useState<OrderMode>("pickup");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState("");
  const [activeStore, setActiveStore] = useState(0);
  const [copiedStore, setCopiedStore] = useState<string | null>(null);
  const shop = useShopStatus();
  const isAvailable = (id: string) => !shop.unavailable.includes(id);
  const count = Object.values(cart).reduce(
    (sum, quantity) => sum + quantity,
    0,
  );
  const filteredProducts = products.filter(
    (product) => category === "All favourites" || product.category === category,
  );
  const visibleProducts =
    category === "All favourites" && !fullMenu
      ? filteredProducts.slice(0, 4)
      : filteredProducts;

  useEffect(() => {
    try {
      localStorage.setItem("choco-brown-bag", JSON.stringify(cart));
    } catch {
      /* The bag still works for this visit when storage is unavailable. */
    }
  }, [cart]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!mobileMenu) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileMenu(false);
    }
    function closeOnOutside(event: PointerEvent) {
      if (
        event.target instanceof Element &&
        !event.target.closest(".site-header")
      ) {
        setMobileMenu(false);
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutside);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutside);
    };
  }, [mobileMenu]);

  function changeQuantity(id: string, quantity: number) {
    setCart((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[id];
      else next[id] = Math.min(20, quantity);
      return next;
    });
  }

  function addProduct(product: Product) {
    if (!isAvailable(product.id)) {
      setToast(`${product.name} is currently unavailable.`);
      return;
    }
    if ((cart[product.id] || 0) >= 20) {
      setToast("For a bigger box of happiness, message the bakery.");
      return;
    }
    setCart((current) => ({
      ...current,
      [product.id]: Math.min(20, (current[product.id] || 0) + 1),
    }));
    setToast(`${product.name} added to your bag.`);
  }

  function openOrder(mode: OrderMode) {
    setMobileMenu(false);
    setOrderMode(mode);
    setOrderOpen(true);
    setToast("");
  }

  function browseMenu() {
    setOrderOpen(false);
    setMobileMenu(false);
    window.setTimeout(
      () =>
        document.getElementById("menu")?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        }),
      50,
    );
  }

  async function copyAddress(storeId: string, address: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
      } else {
        const area = document.createElement("textarea");
        area.value = address;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setCopiedStore(storeId);
      window.setTimeout(() => {
        setCopiedStore((current) => (current === storeId ? null : current));
      }, COPY_FEEDBACK_TIMEOUT);
    } catch {
      setCopiedStore(null);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div
        className={shop.shopOpen ? "announcement" : "announcement announcement-closed"}
        id="home"
      >
        <Sparkles size={13} strokeWidth={1.5} />
        <p>
          {shop.shopOpen
            ? "A little chocolate. A little joy. A whole lot of love."
            : `We're closed right now.${shop.closedMessage ? ` ${shop.closedMessage}` : ""}`}
        </p>
        <Sparkles size={13} strokeWidth={1.5} />
      </div>

      <header className="site-header">
        <div className="nav-inner page-width">
          <a
            className="brand-link"
            href="#home"
            aria-label="Choco Brown home"
            onClick={() => setMobileMenu(false)}
          >
            <Wordmark />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#menu">Our menu</a>
            <a href="#story">Our story</a>
            <a href="#visit">
              Find us <ArrowUpRight size={13} />
            </a>
          </nav>
          <div className="nav-actions">
            <button
              className="bag-button"
              onClick={() => openOrder("pickup")}
              aria-label={`Open your bag, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <ShoppingBag size={21} strokeWidth={1.5} />
              <span className="bag-count">{count}</span>
            </button>
            <button
              className="button button-dark nav-order"
              onClick={() => openOrder("delivery")}
            >
              Order online <ArrowUpRight size={16} />
            </button>
            <button
              className="icon-button mobile-menu-button"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label={mobileMenu ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileMenu}
              aria-controls="mobile-navigation"
            >
              {mobileMenu ? <X size={25} /> : <Menu size={25} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.nav
              id="mobile-navigation"
              className="mobile-navigation"
              aria-label="Mobile navigation"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <a href="#menu" onClick={() => setMobileMenu(false)}>
                Our menu <ArrowUpRight size={20} />
              </a>
              <a href="#story" onClick={() => setMobileMenu(false)}>
                Our story <ArrowUpRight size={20} />
              </a>
              <a href="#visit" onClick={() => setMobileMenu(false)}>
                Find us <ArrowUpRight size={20} />
              </a>
              <button
                className="button button-dark"
                onClick={() => openOrder("delivery")}
              >
                Order online <ArrowUpRight size={17} />
              </button>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <motion.img
            className="hero-image"
            src="/images/choco-hero.jpg"
            alt="Golden, freshly baked buns filled with rich, gooey chocolate"
            fetchPriority="high"
            width="1568"
            height="882"
            initial={{ scale: 1.045 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
          />
          <div className="hero-shade" />
          <div className="hero-inner page-width">
            <motion.div
              className="hero-content"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.13, delayChildren: 0.12 },
                },
              }}
            >
              <motion.p
                className="eyebrow hero-eyebrow"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                LITTLE BUNS. BIG HAPPINESS.
              </motion.p>
              <motion.h1
                id="hero-title"
                variants={{
                  hidden: { opacity: 0, y: 23 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
                }}
              >
                choco
                <br />
                brown<span>.</span>
              </motion.h1>
              <motion.p
                className="hero-description"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                Soft buns. Generous fillings. Little prices.
                <br />
                Your everyday happy place, baked in Kochi.
              </motion.p>
              <motion.div
                className="hero-actions"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <a className="button button-pistachio" href="#menu">
                  Explore the menu <ArrowRight size={18} />
                </a>
                <a className="hero-secondary" href="#visit">
                  Find your happy place <ArrowUpRight size={16} />
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="brand-ribbon" aria-hidden="true">
          <div className="ribbon-track" aria-hidden="true">
            {[0, 1, 2, 3].map((repeat) => (
              <div className="ribbon-group" key={repeat}>
                <span>BAKED FRESH, EVERY DAY</span>
                <Flourish />
                <span>FILLED WITH THE GOOD STUFF</span>
                <Flourish />
                <span>SMALL BUNS. BIG FEELINGS.</span>
                <Flourish />
              </div>
            ))}
          </div>
        </div>

        <section
          className="menu-section section-padding page-width"
          id="menu"
          aria-labelledby="menu-title"
        >
          <Reveal className="section-heading-row">
            <div>
              <p className="eyebrow">THE GOOD STUFF</p>
              <h2 id="menu-title">Meet your next craving.</h2>
              <p className="section-description">
                A little soft. A little messy. A whole lot of happy.
              </p>
            </div>
            <button
              className="text-link full-menu-link"
              onClick={() => {
                setFullMenu(!fullMenu);
                setCategory("All favourites");
              }}
            >
              {fullMenu ? "Back to the favourites" : "See the full menu"}{" "}
              <ArrowUpRight size={18} />
            </button>
          </Reveal>
          <div className="menu-toolbar">
            <div
              className="category-tabs"
              role="group"
              aria-label="Filter the menu"
            >
              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? "active" : ""}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <span className="menu-aside">Fresh bakes. Happy prices.</span>
          </div>
          <p className="sr-only" aria-live="polite">
            Showing {visibleProducts.length} {category.toLowerCase()}.
          </p>
          {!shop.shopOpen && (
            <p className="shop-closed-note" role="status">
              We're closed right now, so orders are paused.
              {shop.closedMessage ? ` ${shop.closedMessage}` : ""}
            </p>
          )}
          <motion.div layout className="product-grid" id="menu-grid">
            <AnimatePresence mode="popLayout">
              {visibleProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  available={isAvailable(product.id)}
                  quantity={cart[product.id] || 0}
                  onAdd={() => addProduct(product)}
                  onQuantityChange={(quantity) =>
                    changeQuantity(product.id, quantity)
                  }
                  onDetails={() => setSelectedProduct(product)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
          <div className="menu-footnote">
            <span>
              Made fresh in small batches. Come early for your favourites.
            </span>
            <span>Indicative prices. Today's bakes may vary.</span>
          </div>
        </section>

        <section
          className="story-section"
          id="story"
          aria-labelledby="story-title"
        >
          <div className="story-image-wrap">
            <img
              src="/images/baked-with-love.jpg"
              alt="A baker gently pulling apart a warm, chocolate-filled bun"
              loading="lazy"
              width="1024"
              height="1024"
            />
          </div>
          <Reveal className="story-content">
            <BunDoodle className="story-doodle" />
            <p className="eyebrow">FROM OUR LITTLE BAKEHOUSE, WITH LOVE</p>
            <h2 id="story-title">
              Small beginnings.
              <br />
              Big, gooey hearts.
            </h2>
            <p>
              What started as a little neighbourhood bakehouse in Vennala has
              become Kochi's not-so-secret sweet spot.
            </p>
            <p>
              Our recipe hasn't changed. Soft, fresh bakes. Generous fillings.
              And a belief that a little happiness should be for everyone.
            </p>
            <a className="text-link" href="#visit">
              Come be part of our story <ArrowUpRight size={18} />
            </a>
            <span className="story-signoff">Always a little extra love.</span>
          </Reveal>
        </section>

        <section
          className="love-section section-padding page-width"
          aria-labelledby="love-title"
        >
          <Reveal className="love-intro">
            <p className="eyebrow">THE WORD AROUND KOCHI</p>
            <h2 id="love-title">A little local love.</h2>
            <a
              className="google-rating"
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Read Choco Brown's Google reviews, rated 4.6 out of 5"
            >
              <span className="review-stars" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    fill="currentColor"
                    strokeWidth={0}
                    className={star === 4 ? "last-star" : ""}
                  />
                ))}
              </span>
              <span>
                <strong>4.6</strong> on Google{" "}
                <span className="rating-divider">/</span> 1,700+ reviews{" "}
                <ArrowUpRight size={13} />
              </span>
            </a>
          </Reveal>
          <Reveal className="review-content" delay={0.1}>
            <div className="testimonial-grid">
              {testimonials.map((item) => (
                <figure className="testimonial-card" key={item.label}>
                  <span
                    className="review-stars testimonial-stars"
                    aria-hidden="true"
                  >
                    {[0, 1, 2, 3, 4].map((star) => (
                      <Star
                        key={star}
                        size={13}
                        fill="currentColor"
                        strokeWidth={0}
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                  <blockquote>{item.text}</blockquote>
                  <figcaption>{item.label}</figcaption>
                </figure>
              ))}
            </div>
            <div className="review-bottom">
              <span>
                Summarised from community feedback around Kochi — not paid
                reviews. Read the real thing on Google and Zomato.
              </span>
            </div>
            <div className="testimonial-links">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Google reviews <ArrowUpRight size={14} />
              </a>
              <a
                href={ZOMATO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Zomato reviews <ArrowUpRight size={14} />
              </a>
              <a
                href={`${WHATSAPP}?text=${encodeURIComponent("Hi Choco Brown! I had a happy bite and wanted to share some love.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Share your love <MessageCircle size={14} />
              </a>
            </div>
          </Reveal>
        </section>

        <section
          className="visit-section"
          id="visit"
          aria-labelledby="visit-title"
        >
          <div className="visit-inner page-width section-padding">
            <Reveal className="visit-intro">
              <p className="eyebrow">
                <MapPin size={15} /> A LITTLE CLOSER TO YOU
              </p>
              <h2 id="visit-title">
                Find your
                <br />
                happy place.
              </h2>
              <p>
                Two little corners of Kochi.
                <br />
                The same big love for good bakes.
              </p>
              <a
                className="text-link"
                href={`${WHATSAPP}?text=${encodeURIComponent("Hi Choco Brown! What are today's opening times and fresh bakes?")}`}
                target="_blank"
                rel="noreferrer"
              >
                Ask about today's bakes <MessageCircle size={18} />
              </a>
            </Reveal>
            <Reveal className="stores" delay={0.12}>
              {stores.map((store, index) => {
                const isCopied = copiedStore === store.id;
                return (
                  <div
                    className={`store ${activeStore === index ? "is-open" : ""}`}
                    key={store.id}
                  >
                    <h3>
                      <button
                        className="store-toggle"
                        aria-expanded={activeStore === index}
                        aria-controls={`store-${index}`}
                        onClick={() =>
                          setActiveStore(activeStore === index ? -1 : index)
                        }
                      >
                        <span className="store-number">0{index + 1}</span>
                        <span className="store-name">
                          {store.name}
                          <span>{store.subtitle}</span>
                        </span>
                        <ChevronDown size={23} />
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {activeStore === index && (
                        <motion.div
                          id={`store-${index}`}
                          className="store-expand"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="store-details">
                            <p>{store.address}</p>
                            <div className="store-map">
                              <iframe
                                title={`Map showing the ${store.name} store area`}
                                src={store.embed}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                              <a
                                href={store.osmSearch}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View larger map <ArrowUpRight size={12} />
                              </a>
                            </div>
                            <div className="store-actions">
                              <a
                                className="button button-dark"
                                href={store.googleDirections}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Get directions <ArrowUpRight size={16} />
                              </a>
                              <a className="text-link" href={`tel:${PHONE}`}>
                                <Phone size={15} /> Call the bakery
                              </a>
                            </div>
                            <div className="store-alt-actions">
                              <a
                                href={store.osmDirections}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                OpenStreetMap directions{" "}
                                <ArrowUpRight size={12} />
                              </a>
                              <span aria-hidden="true">·</span>
                              <a
                                href={store.googleSearch}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Google search <ArrowUpRight size={12} />
                              </a>
                              <span aria-hidden="true">·</span>
                              <button
                                type="button"
                                className="copy-address"
                                onClick={() =>
                                  copyAddress(store.id, store.address)
                                }
                                aria-live="polite"
                              >
                                {isCopied ? (
                                  <>
                                    <Check size={13} /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy size={13} /> Copy address
                                  </>
                                )}
                              </button>
                            </div>
                            {isCopied && (
                              <p className="copy-feedback" role="status">
                                Address copied. Paste it into any maps app.
                              </p>
                            )}
                            <p className="map-fallback">
                              If Google Maps shows “blocked” or “refused to
                              connect”, it is blocking the embedded preview.
                              Use OpenStreetMap, copy the address, or open the
                              Google link in a new tab.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              <p className="store-note">
                Good things go quickly. Message us for opening times and
                availability before a special trip.
              </p>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-width">
          <div className="footer-main">
            <a
              className="footer-brand"
              href="#home"
              aria-label="Choco Brown home"
            >
              <Wordmark />
              <span>A little bun. A whole lot of happy.</span>
            </a>
            <div className="footer-links">
              <p className="eyebrow">HAVE A LITTLE LOOK</p>
              <a href="#menu">Our menu</a>
              <a href="#story">Our story</a>
              <a href="#visit">Find your happy place</a>
              <a
                href="https://www.instagram.com/chocobrow_n/"
                target="_blank"
                rel="noreferrer"
              >
                Follow the good stuff <Instagram size={15} />
              </a>
            </div>
            <div className="footer-party">
              <p className="eyebrow">HAPPINESS IS BETTER SHARED</p>
              <h2>
                A big day?
                <br />
                Bring a little Choco Brown.
              </h2>
              <a
                className="text-link"
                href={`${WHATSAPP}?text=${encodeURIComponent("Hi Choco Brown! I'd like to ask about a party or bulk order.")}`}
                target="_blank"
                rel="noreferrer"
              >
                Let's talk party orders <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              &copy; {new Date().getFullYear()} Choco Brown. Baked with love in
              Kochi.
            </span>
            <a href={`tel:${PHONE}`}>
              Say hello: +91 70254 54597 <ArrowUpRight size={13} />
            </a>
            <span>Small prices. Big heart.</span>
          </div>
        </div>
      </footer>

      <OrderDrawer
        unavailable={shop.unavailable}
        shopOpen={shop.shopOpen}
        closedMessage={shop.closedMessage}
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        mode={orderMode}
        onModeChange={setOrderMode}
        cart={cart}
        onQuantityChange={changeQuantity}
        onBrowse={browseMenu}
      />

      <Dialog
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        labelledBy="product-detail-title"
        className="product-dialog"
      >
        {selectedProduct && (
          <>
            <button
              className="icon-button product-dialog-close"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close product details"
            >
              <X size={23} />
            </button>
            <img
              className="detail-image"
              src={selectedProduct.image}
              alt={selectedProduct.name}
              width="600"
              height="600"
            />
            <div className="detail-content">
              <p className="eyebrow">A LITTLE SOMETHING LOVELY</p>
              <h2 id="product-detail-title">{selectedProduct.name}</h2>
              <p>{selectedProduct.description}</p>
              <p className="allergen-note">
                Contains wheat and milk. Please ask the bakery about egg, nut,
                and other allergens before ordering. Product images are
                illustrative.
              </p>
              <div className="detail-price">
                <span>{money(selectedProduct.price)}</span>
                <span>Indicative price per piece</span>
              </div>
              <button
                className="button button-dark full-width"
                disabled={
                  !isAvailable(selectedProduct.id) ||
                  (cart[selectedProduct.id] || 0) >= 20
                }
                onClick={() => {
                  addProduct(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                {!isAvailable(selectedProduct.id)
                  ? "Currently unavailable"
                  : (cart[selectedProduct.id] || 0) >= 20
                    ? "Maximum 20 per item"
                    : "Add a little happiness"}
                <Plus size={18} />
              </button>
            </div>
          </>
        )}
      </Dialog>

      <AnimatePresence>
        {toast && !orderOpen && (
          <motion.div
            className="bag-toast"
            role="status"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
          >
            <span className="toast-check">
              <Check size={16} />
            </span>
            <span>{toast}</span>
            <button onClick={() => openOrder("pickup")}>
              View bag <ArrowUpRight size={14} />
            </button>
            <button
              className="toast-dismiss"
              onClick={() => setToast("")}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
