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

# SvelteKit Project Structure & Conventions

## Recommended Structure
```
src/
  lib/
    components/      # Reusable UI components
      ui/            # Atomic design system components
      demos/         # Demo/example components
    stores/          # Svelte stores for state management
    services/        # API clients and business logic
    hooks/           # Custom hooks
    server/          # Server-side utilities
    utils.ts         # Utility functions
  routes/            # Pages and endpoints
```

## Directories
- **components/**: All Svelte UI components
- **components/ui/**: Atomic, reusable UI elements (buttons, cards, etc.)
- **components/demos/**: Demo or example components
- **stores/**: Svelte stores for app/global state (e.g., user, auth, UI)
- **services/**: API clients and business logic (e.g., authService, billingService)
- **hooks/**: Custom Svelte hooks
- **server/**: Server-side utilities (e.g., analytics, logging)

## Best Practices
- Use TypeScript for all code
- Use Svelte stores for state management
- Keep API logic in services/
- Use environment variables for secrets/config
- Organize components by feature or domain if the app grows
- Use ESLint/Prettier for code quality

---

For more details, see the main project documentation or ask the team.

# Login & Session Flow

## How it works
- All authentication and session logic is handled via service modules and Svelte stores.
- After login, the user store is updated with the current user profile.
- On logout, the user store is cleared.
- Errors are managed globally via an error store and displayed at the top of the app.

## Key files
- `src/lib/services/authService.ts` — Handles login, OAuth, and JWT exchange
- `src/lib/services/userService.ts` — Fetches user profile
- `src/lib/stores/user.ts` — Svelte store for user state
- `src/lib/stores/error.ts` — Svelte store for global error messages
- `src/routes/oauth-callback/+page.svelte` — Handles OAuth callback, sets cookie, updates user store
- `src/routes/logout/+server.ts` — Deletes JWT cookie and redirects to clear user store
- `src/routes/logout/clear/+page.svelte` — Clears user store and redirects to login
- `src/routes/+layout.svelte` — Displays global error messages

## Best practices
- Keep all API logic in service modules
- Use Svelte stores for global state
- Handle errors globally for a better UX
- Keep UI components focused on display and state, not fetch logic
