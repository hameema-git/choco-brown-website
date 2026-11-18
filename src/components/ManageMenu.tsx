import { useEffect, useState } from "react";
import { money, products } from "../data/menu";
import {
  DEFAULT_STATUS,
  fetchStatus,
  saveStatus,
  type ShopStatus,
} from "../data/status";

const PIN_KEY = "choco-brown-pin";

export function ManageMenu() {
  const [pin, setPin] = useState(() => {
    try {
      return sessionStorage.getItem(PIN_KEY) || "";
    } catch {
      return "";
    }
  });
  const [pinInput, setPinInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [status, setStatus] = useState<ShopStatus>(DEFAULT_STATUS);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Manage menu | Choco Brown";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  async function login(candidate: string) {
    setBusy(true);
    setError("");
    try {
      const r = await fetchStatus(candidate);
      if (!r.storageConnected) {
        setError("Storage is not connected yet. Ask your developer.");
      } else if (!r.authorized) {
        setError("That PIN is not right.");
        sessionStorage.removeItem(PIN_KEY);
        setPin("");
      } else {
        sessionStorage.setItem(PIN_KEY, candidate);
        setPin(candidate);
        setStatus(r.status);
        setMessage(r.status.closedMessage);
        setAuthed(true);
      }
    } catch {
      setError("Could not reach the website. Check your internet.");
    }
    setBusy(false);
  }

  useEffect(() => {
    if (pin) void login(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(next: ShopStatus) {
    const previous = status;
    setStatus(next);
    setError("");
    setNote("Saving...");
    try {
      setStatus(await saveStatus(pin, next));
      setNote("Saved. Customers will see this within a minute.");
    } catch (e) {
      setStatus(previous);
      setNote("");
      setError(e instanceof Error ? e.message : "Could not save.");
    }
  }

  const isUnavailable = (id: string) => status.unavailable.includes(id);
  const toggleItem = (id: string) =>
    save({
      ...status,
      unavailable: isUnavailable(id)
        ? status.unavailable.filter((x) => x !== id)
        : [...status.unavailable, id],
    });

  if (!authed) {
    return (
      <main className="mgr">
        <form
          className="mgr-card mgr-login"
          onSubmit={(e) => {
            e.preventDefault();
            void login(pinInput);
          }}
        >
          <p className="eyebrow">CHOCO BROWN</p>
          <h1>Manage menu</h1>
          <label htmlFor="mgr-pin">Enter your PIN</label>
          <input
            id="mgr-pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
          />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-dark full-width" disabled={busy || !pinInput}>
            {busy ? "Checking..." : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  const unavailableCount = products.filter((p) => isUnavailable(p.id)).length;

  return (
    <main className="mgr">
      <header className="mgr-top">
        <div>
          <p className="eyebrow">CHOCO BROWN</p>
          <h1>Manage menu</h1>
        </div>
        <div className="mgr-links">
          <a href="/">View website</a>
          <button
            className="text-link"
            onClick={() => {
              sessionStorage.removeItem(PIN_KEY);
              setPin("");
              setAuthed(false);
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <p className="mgr-status" role="status">
        {error ? <span className="form-error">{error}</span> : note}
      </p>

      <section className="mgr-card">
        <div className="mgr-row">
          <div>
            <h2>Shop is {status.shopOpen ? "OPEN" : "CLOSED"}</h2>
            <p>
              {status.shopOpen
                ? "Customers can send orders on WhatsApp."
                : "Customers can see the menu but cannot send orders."}
            </p>
          </div>
          <button
            role="switch"
            aria-checked={status.shopOpen}
            aria-label="Shop open"
            className={`mgr-switch ${status.shopOpen ? "on" : ""}`}
            onClick={() => save({ ...status, shopOpen: !status.shopOpen })}
          />
        </div>
        {!status.shopOpen && (
          <div className="mgr-message">
            <label htmlFor="mgr-msg">Message for customers (optional)</label>
            <input
              id="mgr-msg"
              maxLength={140}
              placeholder="Back tomorrow at 8 AM"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={() =>
                message.trim() !== status.closedMessage &&
                save({ ...status, closedMessage: message.trim() })
              }
            />
          </div>
        )}
      </section>

      <section className="mgr-card">
        <div className="mgr-row">
          <div>
            <h2>Menu items</h2>
            <p>Switch off what is sold out. It fades on the website.</p>
          </div>
          {unavailableCount > 0 && (
            <button
              className="text-link"
              onClick={() => save({ ...status, unavailable: [] })}
            >
              Make all available
            </button>
          )}
        </div>
        <ul className="mgr-list">
          {products.map((p) => {
            const off = isUnavailable(p.id);
            return (
              <li key={p.id} className={off ? "off" : ""}>
                <img src={p.image} alt="" width="56" height="56" />
                <div>
                  <strong>{p.name}</strong>
                  <span>
                    {money(p.price)} · {off ? "Unavailable" : "Available"}
                  </span>
                </div>
                <button
                  role="switch"
                  aria-checked={!off}
                  aria-label={`${p.name} available`}
                  className={`mgr-switch ${off ? "" : "on"}`}
                  onClick={() => toggleItem(p.id)}
                />
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
