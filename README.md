# Amber & Oak Café: website

A fast, responsive website for a neighbourhood café. It has four pages: Home, About, Menu and Contact.

It's built with plain HTML, CSS and JavaScript. There's no build step, no server code, no database and no API keys, so the files in this repository are the whole website.

## What's in this repository

| Path | What it is |
|---|---|
| `index.html` | **Home:** welcome, the café in short, popular food and drinks, "A day at Amber & Oak", opening hours |
| `about.html` | **About:** the café's story, a timeline, and what the café believes in |
| `menu.html` | **Menu:** breakfast, lunch, and drinks & desserts, with prices and category tabs |
| `contact.html` | **Contact:** contact form, phone, email, address, hours, and a directions link |
| `css/styles.css` | All styling. Colours and fonts are at the top, under `:root`. |
| `js/main.js` | Mobile menu, scroll animations, the live "Open now" badge, menu tabs and form checks |
| `images/` | Every photo used by the site |

## Deploying the website

Deploy the **whole repository as it is**. The site's root is the folder that contains `index.html`. There's nothing to build, install or configure.

### Option 1: Netlify (recommended, free)

1. Go to <https://app.netlify.com> and sign in with GitHub.
2. Click **Add new site**, then **Import an existing project**, then **GitHub**, and choose `qubitrixai/cafe-website`.
   - If the repository isn't listed, click **Configure the Netlify app on GitHub** and give it access to the `qubitrixai` account or organisation.
3. Use these settings:
   - **Branch to deploy:** `main`
   - **Base directory:** leave empty
   - **Build command:** leave empty
   - **Publish directory:** `.` (a single dot, meaning the repository root)
4. Click **Deploy**. The site goes live at an address like `https://random-name.netlify.app` within a minute.
5. Optional settings:
   - Rename the address under **Site configuration**, then **Change site name**.
   - Connect your own domain under **Domain management**.

Every push to `main` redeploys the site automatically.

**Quick test without GitHub:** open <https://app.netlify.com/drop> and drag in the folder that contains `index.html`.

### Option 2: GitHub Pages

This repository is **private**. GitHub Pages only publishes private repositories on a paid plan (GitHub Pro, Team or Enterprise). On a free plan, either make the repository public or use Netlify.

1. In the repository, open **Settings**, then **Pages**.
2. Under **Build and deployment**, set:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/ (root)`
3. Click **Save**. After a minute or two the site is live at `https://qubitrixai.github.io/cafe-website/`.
4. To use your own domain, fill in the **Custom domain** field on the same page.

All links in the site are relative, so it works both on its own domain and under the `/cafe-website/` path.

## Before going live: checklist

- [ ] **Contact details.** The phone number, email and address are sample details. Replace them everywhere they appear:
  - the footer of all four HTML files;
  - `contact.html`;
  - the "Come and stay a while" block in `index.html`;
  - the Google Maps link in `contact.html`.
- [ ] **Opening hours.** Update them in `contact.html`, `index.html` and the footers, and in the `hours` list near the top of `js/main.js`. That list drives the live "Open now / Closed" badge. Each pair is `[opening hour, closing hour]` in 24-hour time, starting with Sunday.
- [ ] **Contact form.** It checks the fields and shows a thank-you message, but it doesn't send the message anywhere yet. Connect a form service before launch:
  - **Netlify Forms** (free on Netlify, built in);
  - or **Formspree** (works on any host).
- [ ] **Menu and prices:** in `menu.html`, plus the three favourites on the Home page.
- [ ] **Social links:** Instagram and Facebook are in the footer of each page.

## Editing tips

- **Text:** edit the HTML file for that page. The header and footer are repeated on each of the four pages, so change all four.
- **Photos:** replace a file in `images/` with one of the same name and a similar shape. Background photos are set like `style="--img: url('../images/story.jpg')"`, and the `../` is required.
- **Colours and fonts:** the variables at the top of `css/styles.css`.

## Browser support

Tested on phones, tablets, laptops and wide desktop screens, in the Chrome, Safari (WebKit) and Firefox browser engines. Animations switch off automatically for visitors who have "reduce motion" turned on in their device settings.
