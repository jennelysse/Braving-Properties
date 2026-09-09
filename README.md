# Bravion Properties Website

GitHub-ready static website for **Bravion Properties**.

## Included

- Home page
- Available Homes page with bedroom and rent filters
- Rental application / applicant-profile flow
- Rental criteria section
- Configurable secure screening / application-fee button
- Contact page
- Responsive mobile navigation
- Equal Housing language
- Property data managed from one JSON file

## Important before publishing

### 1. Replace sample properties
Edit `data/properties.json`. Each property includes:

- title
- location
- rent
- deposit
- beds / baths / square footage
- availability
- image
- description
- amenities

Add real property photos inside `assets/` and update the `image` value.

### 2. Add Bravion's real contact information
Edit `contact.html` and replace:

- `your-email@example.com`
- `(000) 000-0000`
- office hours

Then open `js/app.js` and update:

```js
contactEmail: "your-real-email@example.com"
```

### 3. Configure the application fee and secure screening provider
Open `js/app.js` and edit:

```js
const SITE_CONFIG = {
  applicationFee: 50,
  screeningUrl: "https://your-secure-screening-or-payment-link.example",
  contactEmail: "your-real-email@example.com"
};
```

**Do not collect Social Security numbers, bank data, full government ID numbers, or other sensitive screening information directly through a GitHub Pages form.** Use a reputable secure screening provider or property-management platform for those steps.

### 4. Replace the rental criteria
The criteria currently shown on `apply.html` are placeholders. Replace them with Bravion Properties' actual written standards and ensure the criteria comply with applicable federal, state, and local law.

## Publish with GitHub Pages

1. Create a new GitHub repository, for example `bravion-properties`.
2. Upload the contents of this folder to the repository root. `index.html` must remain at the root.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder.
6. Save. GitHub will display the live site URL after deployment.

## File structure

```text
bravion-properties/
├── index.html
├── properties.html
├── apply.html
├── contact.html
├── README.md
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── data/
│   └── properties.json
└── assets/
    ├── property-placeholder-1.svg
    ├── property-placeholder-2.svg
    └── property-placeholder-3.svg
```

## Local preview

Because the property cards load from `data/properties.json`, use a local web server instead of opening the HTML by double-clicking it. One easy option if Python is installed:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.
