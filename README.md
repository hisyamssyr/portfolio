# Hisyam Syafa Raditya - Portfolio

A personal portfolio for Hisyam Syafa Raditya, an Informatics Engineering
student at Institut Teknologi Sepuluh Nopember (ITS), Surabaya.

The site uses a dark-first "Ink & Glass" visual system: ink-black surfaces,
frosted glass panels, a single lime signal color, editorial serif italics,
variable-width display type, and restrained motion. Frost mode is a full
polarity inversion, not a separate theme layer.

## Stack

- Next.js 16.4 App Router with React 19 and TypeScript
- Tailwind CSS 4 through `@tailwindcss/turbopack`
- Motion for springs, drag, dialogs, and staged reveals
- GSAP, ScrollTrigger, and Flip for scene transitions and scroll direction
- Flubber for the navigation light-flood animation
- Lucide icons and inline Simple Icons logos
- CSS marquee for the scrolling skill logo stack
- `next/image` with local, build-time photo availability

## Requirements

- Node.js 20.9 or newer
- npm

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Turbopack development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

For a production check:

```bash
npm run build
npm run start
```

## Editing content

All CV content is kept in one typed file: [`content.ts`](content.ts). There is
no database or CMS. Edit the file, then restart or rebuild.

Important exports:

- `site` - name, role, institution, contact details, social links, summary,
  hero words, keywords, image treatment, and footer.
- `projects` - three projects, including stacks, bullets, phrases, and scene
  type.
- `experience` - two roles, with dates, impact blocks, and bullets.
- `organizations` - three organizations, with scenes, stats, and bullets.
- `skills` - 22 skills, grouped into four categories.
- `education` - two education entries.
- `photoSlots` and `getPhoto` - the photo registry used by every image.
- `navSections` - section order shared by the dock, command palette, and number
  shortcuts.

Keep references consistent when renaming an `id`. Project, experience, and
organization IDs are referenced across content sections and scenes; photo IDs
are referenced from project and role entries.

### Photo treatment

`site.imageTreatment` accepts `"graded"` (default) or `"raw"`. `"graded"`
applies the portfolio's subtle CSS photo treatment. `"raw"` leaves photos
untouched.

## Photos

The site has 30 optional photo slots. Every missing slot renders a designed
placeholder with its intended aspect ratio, pixel size, file path, and content
hint. Photos are detected at build/server-render time, so adding or removing a
file does not create a broken image; it switches between the real image and the
placeholder.

See [`public/images/README.md`](public/images/README.md) for the complete slot
table and guidance. The short version:

1. Add a JPG at the path listed for the slot under `public/images/`.
2. Rebuild, or restart the dev server, so availability is checked again.
3. Edit `alt`, `caption`, `hint`, or `sizes` in `content.ts` when needed.

Do not include private or unverified images. The repository intentionally ships
with no test photos or stock photography.

## Navigation and keyboard

- `/` opens the command palette.
- `1` through `8` jump to the eight sections in `navSections` order.
- `i` toggles between Dark and Frost.
- `Esc` closes the command palette, photo viewer, and mobile overflow menu.
- The command palette supports fuzzy filtering and `Up`/`Down` plus `Enter`.
- The photo viewer supports `Left`/`Right`, drag, and swipe gestures.
- The desktop and mobile docks support roving `Tab`, `Left`, `Right`, `Home`,
  and `End` navigation.
- Double-click or double-tap the page for the light ripple.

The theme choice is stored in `localStorage` under `hsr-polarity`. If no choice
exists, the site follows the operating system's color-scheme preference.

## Accessibility

- Semantic landmarks, a skip link, visible focus states, and labelled controls.
- Focus trapping and body scroll locking in dialogs.
- `prefers-reduced-motion` disables or simplifies physics, pinning, parallax,
  large transitions, and idle motion while preserving content and navigation.
- `prefers-reduced-transparency` replaces translucent surfaces with solid
  fallbacks.
- Keyboard access is maintained for the command palette, dock, galleries, and
  photo viewer.
- All interactive imagery has meaningful labels or is marked decorative.

The production release check reached Lighthouse mobile scores of Performance 92,
Accessibility 100, Best Practices 100, and SEO 100. Scores vary with hardware,
network, extensions, and browser version.

## Fonts

Fonts are self-hosted from `public/fonts/` and loaded through `@font-face` in
`app/globals.css`. The files are subset for the site's glyphs:

- Anybody variable - display type
- Fraunces italic 380 - editorial accents
- DM Mono 400 - labels and metadata

Licenses are included alongside the font files. If you replace a font, update
the `@font-face` rules and the preload links in `app/layout.tsx`.

## Deployment

The project deploys directly to Vercel or any platform that can run a Next.js
production build.

1. Set `NEXT_PUBLIC_SITE_URL` to the final canonical URL, for example
   `https://your-domain.example`.
2. Run `npm run build` and deploy the result.
3. Set the same variable in the hosting environment before building.

`app/layout.tsx` uses `NEXT_PUBLIC_SITE_URL` for `metadataBase` and Open Graph
URLs. On Vercel it falls back to `VERCEL_URL`; locally it falls back to
`http://localhost:3000`. Set the canonical variable explicitly for production
so social cards and canonical metadata are stable.

The Open Graph image is generated by [`app/opengraph-image.tsx`](app/opengraph-image.tsx)
using `next/og` at 1200x630.

## Project structure

```text
app/
  globals.css          design tokens, base typography, shared primitives
  sections.css         section layout and component styling
  layout.tsx           metadata, theme boot script, font preloads
  page.tsx             server entry, photo availability
  opengraph-image.tsx  generated social card
  icon.svg             favicon
components/
  sections/            Hero, About, Projects, Experience, Organizations,
                       Skills, Education, Contact
  projects/            project scene shell and interactive diagrams
  orgs/                organization canvas scenes
  Site.tsx             app shell and global shortcuts
  providers.tsx        theme, floods, ripples, photos
  Dock.tsx             desktop and mobile navigation
  CommandPalette.tsx   keyboard-first section/polarity launcher
  Photo.tsx            image or placeholder renderer
  Gallery.tsx          draggable photo stack
  Lightbox.tsx         full-screen photo viewer
  ...                  ambient, grain, frost lens, and scroll effects
content.ts             all editable CV content and photo slot metadata
lib/
  photos.ts            build-time photo existence checks
  hooks.ts             reduced-motion, focus trap, pointer hooks
  raf.ts               shared frame scheduler
public/
  fonts/               self-hosted fonts and licenses
  images/              photo slots; see images/README.md
```

## Implementation notes

- `cacheComponents` and `partialPrefetching` are enabled in `next.config.ts`.
- Heavy interactive pieces are loaded only when needed. Project diagrams, the
  lightbox, and the command palette are deferred.
- GSAP/ScrollTrigger initializes on the first intentional interaction rather
  than during initial load.
- The layout is responsive from small mobile screens through wide desktop, with
  touch-specific behavior for drag, tap, hover alternatives, and the mobile dock.
- The site uses no third-party analytics, trackers, embeds, or remote images.
