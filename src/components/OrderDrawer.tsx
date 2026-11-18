import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { Dialog } from "./Dialog";
import {
  money,
  products,
  SWIGGY_URL,
  WHATSAPP,
  ZOMATO_URL,
  type Cart,
  type OrderMode,
} from "../data/menu";

type OrderDrawerProps = {
  unavailable: string[];
  shopOpen: boolean;
  closedMessage: string;
  open: boolean;
  onClose: () => void;
  mode: OrderMode;
  onModeChange: (mode: OrderMode) => void;
  cart: Cart;
  onQuantityChange: (id: string, quantity: number) => void;
  onBrowse: () => void;
};

function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function OrderDrawer({
  unavailable,
  shopOpen,
  closedMessage,
  open,
  onClose,
  mode,
  onModeChange,
  cart,
  onQuantityChange,
  onBrowse,
}: OrderDrawerProps) {
  const [step, setStep] = useState<"bag" | "details" | "ready">("bag");
  const [name, setName] = useState("");
  const [store, setStore] = useState("Vennala");
  const [notes, setNotes] = useState("");
  const [pickupDay, setPickupDay] = useState<"Today" | "Tomorrow">("Today");
  const [pickupTime, setPickupTime] = useState("");
  const [timeError, setTimeError] = useState("");
  const [nameError, setNameError] = useState("");
  const [requestLink, setRequestLink] = useState("");
  const items = products.filter((product) => cart[product.id]);
  const hasUnavailable = items.some((p) => unavailable.includes(p.id));
  const count = Object.values(cart).reduce(
    (sum, quantity) => sum + quantity,
    0,
  );
  const total = items
    .filter((product) => !unavailable.includes(product.id))
    .reduce(
    (sum, product) => sum + product.price * cart[product.id],
    0,
  );

  useEffect(() => {
    if (!open) {
      setStep("bag");
      setNameError("");
    }
  }, [open]);

  useEffect(() => {
    if (!open || mode !== "pickup") return;
    const target =
      step === "details"
        ? "pickup-name"
        : step === "ready"
          ? "order-ready-title"
          : null;
    if (!target) return;
    const frame = window.requestAnimationFrame(() =>
      document.getElementById(target)?.focus(),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [step, open, mode]);

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setNameError("Please tell us your name, using at least two characters.");
      document.getElementById("pickup-name")?.focus();
      return;
    }
    if (!pickupTime) {
      setTimeError("Please choose your pickup time.");
      document.getElementById("pickup-time")?.focus();
      return;
    }
    if (pickupDay === "Today") {
      const now = new Date();
      const [h, m] = pickupTime.split(":").map(Number);
      if (h * 60 + m <= now.getHours() * 60 + now.getMinutes()) {
        setTimeError("That time has passed. Choose a later time or Tomorrow.");
        document.getElementById("pickup-time")?.focus();
        return;
      }
    }
    if (!items.length || hasUnavailable || !shopOpen) {
      setStep("bag");
      return;
    }
    const message = [
      "*NEW ORDER - CHOCO BROWN*",
      "",
      `Name: ${name.trim()}`,
      "Type: Pickup",
      `Store: ${store}`,
      `Pickup: ${pickupDay}, ${formatTime(pickupTime)}`,
      "",
      "*Items*",
      ...items.map(
        (product, index) =>
          `${index + 1}. ${product.name} x ${cart[product.id]} = ${money(product.price * cart[product.id])}`,
      ),
      "",
      `*Total: ${money(total)}*`,
      ...(notes.trim() ? ["", `Note: ${notes.trim()}`] : []),
      "",
      "Please confirm my order.",
    ].join("\n");
    const link = `${WHATSAPP}?text=${encodeURIComponent(message)}`;
    setRequestLink(link);
    window.open(link, "_blank", "noopener,noreferrer");
    setStep("ready");
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy="order-title"
      className="order-drawer"
    >
      <div className="drawer-header">
        <div>
          <p className="eyebrow">A LITTLE HAPPINESS, TO GO</p>
          <h2 id="order-title">Your happy little bag.</h2>
        </div>
        <button
          className="icon-button close-button"
          onClick={onClose}
          aria-label="Close order bag"
        >
          <X size={23} />
        </button>
      </div>

      <div className="order-tabs" role="group" aria-label="Order type">
        <button
          className={mode === "pickup" ? "active" : ""}
          aria-pressed={mode === "pickup"}
          onClick={() => {
            onModeChange("pickup");
            setStep("bag");
          }}
        >
          Pickup bag <span>{count}</span>
        </button>
        <button
          className={mode === "delivery" ? "active" : ""}
          aria-pressed={mode === "delivery"}
          onClick={() => onModeChange("delivery")}
        >
          Get it delivered <ArrowUpRight size={16} />
        </button>
      </div>

      {mode === "delivery" ? (
        <div className="delivery-content">
          <span className="delivery-illustration">
            <ShoppingBag size={44} strokeWidth={1.2} />
          </span>
          <h3>Your craving. Your couch.</h3>
          <p>
            Let the good stuff come to you. Find Choco Brown on your favourite
            delivery app.
          </p>
          <a
            className="delivery-provider"
            href={SWIGGY_URL}
            target="_blank"
            rel="noreferrer"
          >
            <div>
              <span className="provider-name swiggy">swiggy</span>
              <span>Find a store near you</span>
            </div>
            <ArrowUpRight size={25} />
          </a>
          <a
            className="delivery-provider"
            href={ZOMATO_URL}
            target="_blank"
            rel="noreferrer"
          >
            <div>
              <span className="provider-name zomato">zomato</span>
              <span>Order from our Vennala store</span>
            </div>
            <ArrowUpRight size={25} />
          </a>
          <p className="fine-print">
            Delivery areas, availability, and prices are set by each platform.
            Your pickup bag does not transfer to these apps.
          </p>
          <button
            className="text-link"
            onClick={() => {
              onModeChange("pickup");
              setStep("bag");
            }}
          >
            Rather pick it up? <ArrowRight size={16} />
          </button>
        </div>
      ) : step === "ready" ? (
        <div className="request-ready">
          <span className="ready-icon">
            <Check size={34} strokeWidth={1.5} />
          </span>
          <p className="eyebrow">ONE MORE LITTLE STEP</p>
          <h3 id="order-ready-title" tabIndex={-1}>
            Your request is ready.
          </h3>
          <p>
            Send your prepared message on WhatsApp. Our team will reply to
            confirm your treats, final price, and pickup time.
          </p>
          <p className="request-notice">
            This is an order request, not a confirmed order. It is confirmed only
            when the shop replies on WhatsApp. No payment has been taken.
          </p>
          <p className="request-notice">
            Pickup: {pickupDay}, {formatTime(pickupTime)}. Please collect on
            time. We hold your order for 15 minutes after your pickup time, then
            it is treated as cancelled. Running late? Message us immediately.
          </p>
          <a
            className="button button-dark full-width"
            href={requestLink}
            target="_blank"
            rel="noreferrer"
          >
            Open WhatsApp again <MessageCircle size={18} />
          </a>
          <button className="text-link" onClick={() => setStep("bag")}>
            Back to your bag <ArrowRight size={16} />
          </button>
        </div>
      ) : step === "details" ? (
        <form className="pickup-form" onSubmit={submitRequest}>
          <button
            type="button"
            className="text-link back-link"
            onClick={() => setStep("bag")}
          >
            <ArrowLeft size={16} /> Back to your bag
          </button>
          <h3>Make it yours.</h3>
          <p>Just a few details, then we'll chat on WhatsApp.</p>
          <label htmlFor="pickup-name">
            Your name <span>*</span>
          </label>
          <input
            id="pickup-name"
            name="name"
            autoComplete="given-name"
            placeholder="What should we call you?"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setNameError("");
            }}
            maxLength={60}
            required
            aria-invalid={!!nameError}
            aria-describedby={nameError ? "name-error" : undefined}
          />
          {nameError && (
            <p className="form-error" id="name-error" role="alert">
              {nameError}
            </p>
          )}
          <label htmlFor="pickup-store">Preferred store</label>
          <select
            id="pickup-store"
            value={store}
            onChange={(event) => setStore(event.target.value)}
          >
            <option value="Vennala">Vennala, near Arakkakadavu Bridge</option>
            <option value="Eroor">Eroor, Pulse Nagar Road</option>
          </select>
          <label htmlFor="pickup-day">
            Pickup time <span>*</span>
          </label>
          <div className="pickup-time-row">
            <select
              id="pickup-day"
              value={pickupDay}
              onChange={(event) => {
                setPickupDay(event.target.value as "Today" | "Tomorrow");
                setTimeError("");
              }}
              aria-label="Pickup day"
            >
              <option value="Today">Today</option>
              <option value="Tomorrow">Tomorrow</option>
            </select>
            <input
              id="pickup-time"
              type="time"
              value={pickupTime}
              onChange={(event) => {
                setPickupTime(event.target.value);
                setTimeError("");
              }}
              required
              aria-label="Pickup time"
              aria-invalid={!!timeError}
            />
          </div>
          {timeError && (
            <p className="form-error" role="alert">
              {timeError}
            </p>
          )}
          <label htmlFor="pickup-notes">
            A little note <span className="optional">(optional)</span>
          </label>
          <textarea
            id="pickup-notes"
            placeholder="A special occasion, a message for the cake..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={300}
            rows={3}
          />
          <div className="order-total">
            <span>Estimated total</span>
            <strong>{money(total)}</strong>
          </div>
          <button
            type="submit"
            className="button button-dark full-width"
            disabled={!shopOpen || hasUnavailable}
          >
            Request on WhatsApp <MessageCircle size={19} />
          </button>
          <div className="pickup-policy">
            <p>
              <strong>Not confirmed yet.</strong> Your order is confirmed only
              when the shop replies to confirm it on WhatsApp.
            </p>
            <p>
              <strong>Be on time.</strong> Collect at your pickup time. We hold
              your order for 15 minutes after it. After that it is treated as
              cancelled. Running late? Message us on WhatsApp straight away.
            </p>
          </div>
        </form>
      ) : items.length ? (
        <div className="bag-content">
          {!shopOpen && (
            <p className="shop-closed-note" role="status">
              We're closed right now, so orders are paused.
              {closedMessage ? ` ${closedMessage}` : ""}
            </p>
          )}
          <p className="bag-intro">Good choices. Really good choices.</p>
          <div className="bag-items">
            {items.map((product) => (
              <div
                className={
                  unavailable.includes(product.id)
                    ? "bag-item bag-item-unavailable"
                    : "bag-item"
                }
                key={product.id}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  width="86"
                  height="92"
                />
                <div className="bag-item-info">
                  <h3>{product.name}</h3>
                  <p>
                    {unavailable.includes(product.id)
                      ? "Currently unavailable. Please remove."
                      : `${money(product.price)} each`}
                  </p>
                  <div className="quantity-control">
                    <button
                      onClick={() =>
                        onQuantityChange(product.id, cart[product.id] - 1)
                      }
                      aria-label={`Remove one ${product.name}`}
                    >
                      <Minus size={13} />
                    </button>
                    <span aria-live="polite">{cart[product.id]}</span>
                    <button
                      onClick={() =>
                        onQuantityChange(product.id, cart[product.id] + 1)
                      }
                      disabled={cart[product.id] >= 20}
                      aria-label={`Add one ${product.name}`}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
                <div className="bag-item-end">
                  <strong>{money(product.price * cart[product.id])}</strong>
                  <button
                    className="icon-button"
                    onClick={() => onQuantityChange(product.id, 0)}
                    aria-label={`Remove ${product.name} from bag`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="text-link add-more" onClick={onBrowse}>
            <Plus size={16} /> A little something more
          </button>
          <div className="bag-summary">
            <div className="order-total">
              <span>Estimated total</span>
              <strong>{money(total)}</strong>
            </div>
            <p className="fine-print">
              Fresh bakes can sell out. Prices are indicative and will be
              confirmed by the bakery.
            </p>
            <button
              className="button button-dark full-width"
              onClick={() => setStep("details")}
              disabled={hasUnavailable || !shopOpen}
            >
              {!shopOpen
                ? "We're closed right now"
                : hasUnavailable
                  ? "Remove unavailable items"
                  : "Continue to pickup"}{" "}
              <ArrowRight size={18} />
            </button>
            <p className="checkout-note">
              No payment now. Just good things to look forward to.
            </p>
          </div>
        </div>
      ) : (
        <div className="empty-bag">
          <span className="delivery-illustration">
            <ShoppingBag size={48} strokeWidth={1.1} />
          </span>
          <h3>
            A little empty.
            <br />A lot of possibility.
          </h3>
          <p>
            Your next favourite is waiting. Let's find something that makes you
            smile.
          </p>
          <button className="button button-dark" onClick={onBrowse}>
            Explore the menu <ArrowRight size={18} />
          </button>
        </div>
      )}
    </Dialog>
  );
}
