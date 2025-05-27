# Ed & Sy SaaS Landing Page

A modern, accessible, and conversion-focused landing page for Ed & Sy, local business automation experts. Built with **SvelteKit** and **Tailwind CSS** for speed, flexibility, and ease of customization.

## Features

- ✨ Modern, mobile-first design inspired by notebooklm.google and v0-new-project-ilofrbxjvqs.vercel.app
- 🧑‍💼 Older-generation friendly: large text, high contrast, big buttons, simple language
- 🧑‍🤝‍🧑 Team section with LinkedIn integration
- 💬 Floating Tally contact button (opens overlay form)
- 💸 Clear pricing section with "Most Popular" highlight
- 📱 Responsive and accessible (WCAG AA)
- ☁️ Animated hero with scattered app logos
- 📝 Consultation form (Tally)
- 🔗 Smooth anchor navigation (Home, Pricing, Team, Contact)
- 🧩 Easy to customize branding, colors, and content

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the dev server:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```
4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Folder Structure

```
src/
  routes/
    +layout.svelte      # Global layout, navbar, floating Tally button
    +page.svelte        # Main landing page content
    ...
  lib/
    ...                 # App logo cloud, UI helpers, etc.
static/
  ...                   # Static assets (logos, images)
tailwind.config.cjs     # Tailwind CSS config
svelte.config.js        # SvelteKit config
```

## Customization

- **Tally Button/Form:**
  - Update the `data-tally-open` attribute with your own Tally form ID.
  - Edit the floating button text and style in `+layout.svelte`.
- **Branding:**
  - Change colors, logos, and content in `+page.svelte` and `+layout.svelte`.
- **Team Section:**
  - Update LinkedIn/profile links and bios in the "Meet Ed & Sy" section.
- **App Logos:**
  - Add/remove logos in `src/lib/app-logos.ts`.

## Credits

- [SvelteKit](https://kit.svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Tally.so](https://tally.so/) (contact/consultation forms)

## License

[MIT](LICENSE) (or your preferred license)

## Contact

For questions or support, contact Ed & Sy at [hello@edsy.ca](mailto:hello@edsy.ca)
