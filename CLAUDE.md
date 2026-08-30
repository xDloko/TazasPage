# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in the repository.

## What this project is

**TazasPage** is the storefront of **Tía Yami**, a ceramic mug customization and ecommerce business. Buyers personalize ceramic mugs (body, glaze, design/engraving, text) and the site sells them.

The project is currently in the **implementation phase** with a functional Next.js 14 application featuring:

- ✅ Next.js 14 App Router with server and client components
- ✅ Supabase integration for authentication, database, and storage
- ✅ Tailwind CSS with custom terracotta/bone color scheme
- ✅ Product catalog, shopping cart, and checkout flow
- ✅ Product customization interface (colors, text, images, engraving)
- ✅ Protected routes (/checkout, /cuenta) with middleware
- ✅ Responsive design with dark mode support
- ✅ Custom UI components library (buttons, inputs, etc.)
- ✅ Seed scripts for initial product data

## Design guidance — sources of truth, in priority order

1. **Taste Skill** (`design-taste-frontend`) — creative direction and visual quality. Follow its design-read → three-dials → pre-flight-check workflow on every build.
2. **`DESIGN.md` — reference material only, not the identity.** See below.
3. **Web Design Guidelines** (`web-design-guidelines`) — UI quality, accessibility, interaction, and implementation standards. Run to audit output.
4. **Playwright MCP** (Model Context Protocol) — Herramientas de navegador para validación visual, testing y QA.

### `DESIGN.md` is a case study, not the identity

`DESIGN.md` documents Starbucks' ecommerce site for **studying product-design principles** (hierarchy, spacing, product presentation, navigation, photography, interaction patterns). It is **not** the project's visual identity.

**Never reproduce** Starbucks branding, colors, logos, typography, layouts, or visual identity: not the four-green palette, not the warm-cream canvas, not SoDoSans/Lander Tall/Kalam, not the Rewards/Frap/gift-card conventions, nothing that reads as Starbucks. The final site must have a **completely original identity** designed for a ceramic-mug customization brand.

**Borrow as concepts only** (re-skin in original colors, type, and art direction): the ecommerce page rhythm (hero → content sections → a dark feature band → footer bookend), section-layout diversity, the PDP cluster (configuration/size selector, customization controls, a product-detail/style table, store/availability prompt), a semantic spacing scale that scales across breakpoints, weight+color-driven type hierarchy, prioritized CTA structure, and product-photography treatments. Reuse the *principles*, never the *property values*.

## Current development focus

The application core is functional. Next steps typically involve:
- Refining the customization workflow and UX
- Implementing persistence for user designs
- Adding order management and history
- Polishing responsive breakpoints
- Enhancing product discovery and filtering
- Implementing payment processing
- Adding admin/dashboard features
- Performance optimization and SEO
- Comprehensive testing

## Database schema (Supabase)

Key tables include:
- `products`: Base mug models with pricing
- `product_variants`: Color/size options with stock and price adjustments
- `designs`: User-customized designs with layers and preview images
- `orders`: Completed purchases
- `order_items`: Line items linking designs to orders
- `profiles`: User information and roles

See `lib/types.ts` for full TypeScript definitions.

## Available skills

The repository includes specialized skills for:
- Design taste evaluation (`design-taste-frontend`)
- Web design guidelines adherence (`web-design-guidelines`)
- Supabase development guidance
- Context7 for up-to-date library documentation
- And others accessible via `/skill-name` commands

---

*Last updated: 2026-08-30 to reflect implementation phase completion*