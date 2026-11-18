# Shop Owner Guide — Add a New Item

This is the easiest way for the Choco Brown owner to add a new bun, donut, or cake to the website.

No admin login is needed. The menu lives in one file. You edit it, rebuild once, and re-upload.

## Easiest option: send this to your helper

If you don't want to touch code, just send these 5 things to whoever manages the site:

1. Product name — example: Honey Cake Bun
2. Price — example: 45 (number only, no ₹ sign)
3. Short line for the menu card — example: Soft bun with sweet honey cream.
4. One longer sentence for the details popup — example: Fresh soft bun with a generous honey-cream filling.
5. One square photo — JPG, phone photo is fine

Also tell them the category: `Filled buns` or `Donuts`.

They will do Steps 1–5 below and send you the new website files.

## Do it yourself in 5 steps

You need the `choco-brown` project folder and Node.js 22 on your computer.

### Step 1 — Add the photo

1. Put your product photo in:
   `public/images/`
2. Use a square JPG, for example:
   `public/images/honey-cake-bun.jpg`
3. Keep it under 500 KB if you can. A phone photo exported as JPG is perfect.

### Step 2 — Open the menu file

Open this file in Notepad, VS Code, or any text editor:

`src/data/menu.ts`

Find the `products` list. Each item looks like this:

```ts
{
  id: "milk-choco",
  name: "Milk Chocolate Bun",
  shortDescription: "A soft little bun. A whole lot of chocolate.",
  description: "Longer text shown in the details popup.",
  category: "Filled buns",
  price: 35,
  image: "/images/milk-choco-bun.jpg",
  tag: "THE CROWD FAVOURITE",
},
```

### Step 3 — Copy one block and change it

1. Copy one full `{ ... },` block.
2. Paste it right after the last product, before the closing `];`.
3. Change only these fields:

| Field | Rule | Example |
| --- | --- | --- |
| `id` | Unique, lowercase, no spaces. Use `-` between words. | `"honey-cake-bun"` |
| `name` | Shown on the website. | `"Honey Cake Bun"` |
| `shortDescription` | One short line on the menu card. | `"Soft bun with sweet honey cream."` |
| `description` | 1–2 sentences in the popup. | `"Fresh soft bun with a generous honey-cream filling."` |
| `category` | Must be exactly `"Filled buns"` or `"Donuts"`. | `"Filled buns"` |
| `price` | Number only, no quotes, no ₹. | `45` |
| `image` | Must match your photo path. Starts with `/images/`. | `"/images/honey-cake-bun.jpg"` |
| `tag` | Optional. Delete the whole `tag` line if you don't need it. | `"NEW"` |

A new item therefore looks like:

```ts
{
  id: "honey-cake-bun",
  name: "Honey Cake Bun",
  shortDescription: "Soft bun with sweet honey cream.",
  description: "Fresh soft bun with a generous honey-cream filling.",
  category: "Filled buns",
  price: 45,
  image: "/images/honey-cake-bun.jpg",
},
```

Common mistakes:

- Two items with the same `id` — the bag will behave strangely. Make every `id` different.
- Wrong image name — the photo will not load. Check spelling, including `.jpg`.
- `category: "Cake"` — it will disappear from the filter. Use only the two exact categories above unless a developer also updates `src/App.tsx`.
- `price: "45"` — remove the quotes. Price must be a plain number.

### Step 4 — Check it on your computer

In the `choco-brown` folder, run:

```bash
npm ci
npm run dev
```

Open the local address shown in the terminal and check:

- The new photo loads
- The name, price, and description are correct
- Add works and the bag total looks right
- Mobile view has no sideways scrolling

Then build the live files:

```bash
npm run build
```

This updates the `dist/` folder. Do not edit files inside `dist/` by hand.

### Step 5 — Publish

- Netlify manual update: open the same project → Deploys → upload the new `dist/` folder.
- Or recreate the ZIPs with `python3 scripts/package_release.py` and upload `choco-brown-live.zip` contents to your host.
- Hard-refresh the live site and test once on your phone.

## Hide an item or mark it sold out

- Temporary sold out: delete that product block from `src/data/menu.ts`, rebuild, and republish. Keep a backup of the deleted text so you can paste it back tomorrow.
- There is no automatic stock counter in this version. Availability is confirmed with the customer on WhatsApp.

## Quick checklist before publishing

- Photo is square and loads
- Name has no spelling mistakes
- Price is correct and current
- Category is exactly `Filled buns` or `Donuts`
- `id` is unique and lowercase
- Bag total is correct after adding the item
- WhatsApp message shows the new item correctly

Related files:

- Menu and prices: `src/data/menu.ts`
- Store addresses and map links: `src/data/stores.ts`
- Page text: `src/App.tsx`
- Full publishing steps: `DEPLOYMENT.md`
