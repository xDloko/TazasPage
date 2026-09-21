# Graph Report - TazasPage  (2026-09-17)

## Corpus Check
- 126 files · ~84,749 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 46 file(s) not represented in the graph (top: .log 38, (none) 3, .ttf 2)

## Summary
- 498 nodes · 712 edges · 75 communities (31 shown, 44 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 116 edges (avg confidence: 0.96)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App Pages & Auth
- 3D Customizer Components
- Project Config & Dependencies
- Layout & Providers
- Type Definitions & Database Schema
- UI/UX Concepts & Screenshots
- Store Page Components (tienda)
- CLAUDE.md Project Context
- TypeScript Configuration
- Playwright Test Captures
- Dev Dependencies
- Supabase Edge Functions
- Production Dependencies
- Toast Notification System
- ESLint Config
- Home Page Screenshots
- 2D Customizer Screenshots
- 3D Customizer Screenshots
- Store Final Screenshots
- Dark Mode Home Screenshots
- Dark Mode Test Screenshots
- Dark Mode Store Screenshots
- Home Initial Screenshots
- Next.js Dev Types
- Playwright Customizer Tests
- Store Error State
- Store Error Screenshots
- Playwright Empty Design
- Next.js Config
- Playwright Cart Tests
- Playwright Shop/Cart Tests
- Playwright Auth/Error Tests
- MCP Server Config
- Playwright Cart/Checkout Tests
- Playwright Home/Customization Tests
- Playwright Footer/Contact Tests
- 2D Canvas Check - Element
- 2D Canvas Check - Render
- 2D Canvas Preview Pipeline
- Playwright Page Capture 39
- Playwright Page Capture 40
- Playwright Page Capture 41
- Playwright Page Capture 42
- Playwright Page Capture 43
- Playwright Page Capture 44
- Playwright Page Capture 45
- Implementation Phase Note
- Next.js Breaking Changes Note
- Santiago Greeting Note
- Loading States Concept
- Design Color Block Rhythm
- Design Floating CTA
- Design Four Green System (Starbucks)
- Design Gold Restricted
- Design Original Identity
- Design PDP Cluster
- Design Rem Spacing
- Design Responsive Behavior
- Design Shadow Philosophy
- Design Starbucks Reference
- Design Study Purposes
- Design Typography System
- Design Warm Canvas
- Playwright Product Empty State
- Playwright Page Capture 64
- Playwright Customization Controls
- Playwright Personalization Workflow
- Playwright Product Preview
- Playwright Terracotta Palette
- Playwright Two Column Layout
- Store Product Gallery Screenshot
- Store View Screenshot
- Store Fixed Filters Screenshot
- Store Fixed Screenshot

## God Nodes (most connected - your core abstractions)
1. `react` - 26 edges
2. `compilerOptions` - 17 edges
3. `DesignLayer3D` - 14 edges
4. `useCart()` - 13 edges
5. `useSupabase()` - 13 edges
6. `Playwright page capture 2026-09-14T18:18:33` - 13 edges
7. `useToast()` - 12 edges
8. `lucide-react` - 12 edges
9. `Tienda (Store Page)` - 12 edges
10. `useAuth()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `SignInPage()` --calls--> `useAuth()`  [EXTRACTED]
  app/auth/signin/page.tsx → components/providers/auth-provider.tsx
- `SignUpPage()` --calls--> `useAuth()`  [EXTRACTED]
  app/auth/signup/page.tsx → components/providers/auth-provider.tsx
- `CarritoPage()` --calls--> `useCart()`  [EXTRACTED]
  app/carrito/page.tsx → components/providers/cart-provider.tsx
- `Home()` --calls--> `useSupabase()`  [EXTRACTED]
  app/page.tsx → components/providers/supabase-provider.tsx
- `Toaster()` --calls--> `cn()`  [EXTRACTED]
  components/ui/use-toast.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **h_nav_footer_shared_layout** —  [INFERRED 0.95]
- **Storefront Navigation Structure** — playwright_mcp_page_2026_08_30t17_06_51_532z_tia_yami_brand, playwright_mcp_page_2026_08_30t17_27_20_537z_shop_page, playwright_mcp_page_2026_08_30t17_29_44_171z_cart_page, playwright_mcp_page_2026_08_30t17_31_13_894z_homepage, playwright_mcp_page_2026_09_14t15_55_51_800z_login_page [INFERRED 1.00]
- **Purchase Flow** — playwright_mcp_page_2026_08_30t17_31_13_894z_homepage, playwright_mcp_page_2026_08_30t17_32_39_593z_customization_flow, playwright_mcp_page_2026_09_14t15_46_56_220z_customizer_page, playwright_mcp_page_2026_09_14t15_55_32_082z_multi_item_cart, playwright_mcp_page_2026_08_30t17_34_24_742z_checkout_summary [INFERRED 0.85]
- **Mug Customization Feature Set** — playwright_mcp_page_2026_09_14t15_46_56_220z_customizer_page, playwright_mcp_page_2026_09_14t15_50_57_682z_finish_options, playwright_mcp_page_2026_09_14t15_51_57_546z_text_customization, playwright_mcp_page_2026_09_14t18_13_37_699z_3d_customizer [INFERRED 1.00]
- **Customization workflow (variant, finish, design, price, purchase)** — customizer, taza_minimal, taza_clasica, finish_options, design_options, price_display, buy_button [EXTRACTED 1.00]
- **Page navigation structure (brand, nav, back, footer, cart)** — tia_yami, nav, back_link, footer, cart [INFERRED 0.85]
- **Theme and view controls (theme switcher, 2D/3D, cart)** — theme_switcher, view_toggle, cart [INFERRED 0.75]
- **DESIGN.md reference constraints** — claude_design_md_reference, claude_starbucks_ban, design_original_identity [INFERRED 1.00]
- **customization e-commerce flow** — claude_mug_customization_storefront, claude_designs_table, claude_product_variants_table [INFERRED 1.00]
- **database schema order lifecycle** — claude_designs_table, claude_orders_table, claude_order_items_table [INFERRED 1.00]

## Communities (75 total, 44 thin omitted)

### Community 0 - "App Pages & Auth"
Cohesion: 0.08
Nodes (49): SignInPage(), SignUpPage(), CarritoPage(), CheckoutPage(), CuentaPage(), Design, Order, buttonLikeClasses (+41 more)

### Community 1 - "3D Customizer Components"
Cohesion: 0.08
Nodes (29): DecoratorContainerProps, ImageDecorator(), ImageDecoratorProps, planeGeometry, planeGeom, TextDecorator(), TextDecoratorProps, MugCanvasProps (+21 more)

### Community 2 - "Project Config & Dependencies"
Cohesion: 0.06
Nodes (34): prettier, name, private, scripts, build, dev, format, format:check (+26 more)

### Community 3 - "Layout & Providers"
Cohesion: 0.10
Nodes (20): app_globals, metadata, plusJakartaSans, AuthProvider(), init(), userFromSession(), CartContext, CartContextType (+12 more)

### Community 4 - "Type Definitions & Database Schema"
Cohesion: 0.09
Nodes (19): Database, Design, DesignConfig, Json, Order, OrderItem, Profile, Tables (+11 more)

### Community 5 - "UI/UX Concepts & Screenshots"
Cohesion: 0.13
Nodes (23): Authentication flow, Brand: Tia Yami, Cart badge with item count, Contact information, Customizer controls, Features section, Finish selector (Acabado), Footer / contentinfo (+15 more)

### Community 6 - "Store Page Components (tienda)"
Cohesion: 0.13
Nodes (23): Tía Yami, Color Swatch Options, Encuentra tu taza ideal (Find Your Ideal Mug), Decorative Arch Background, Accesorios (Accessories), Tazas (Mugs), Tazones (Bowls), Todos (All) (+15 more)

### Community 7 - "CLAUDE.md Project Context"
Cohesion: 0.10
Nodes (21): borrow ecommerce principles, re-skin in original identity, Supabase database schema, design guidance sources of truth, DESIGN.md reference material (not identity), design-taste-frontend skill, designs table (user-customized designs, layers, preview images), next development focus areas, ceramic mug customization ecommerce storefront (+13 more)

### Community 8 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 9 - "Playwright Test Captures"
Cohesion: 0.18
Nodes (19): Playwright page capture 2026-09-14T18:18:33, Playwright page capture 2026-09-14T18:19:35, Playwright page capture 2026-09-14T18:37:29, Playwright page capture 2026-09-14T18:37:58, Auto-save customization changes, Volver a la tienda link, Comprar / checkout trigger, Shopping cart with item-count badge (+11 more)

### Community 10 - "Dev Dependencies"
Cohesion: 0.11
Nodes (18): devDependencies, autoprefixer, dotenv, eslint, eslint-config-next, eslint-config-prettier, postcss, prettier (+10 more)

### Community 11 - "Supabase Edge Functions"
Cohesion: 0.13
Nodes (13): ref_jsr_supabase_functions_js_2, ref_jsr_supabase_supabase_js_2, corsHeaders, CreateOrderRequest, OrderItemInput, supabase, corsHeaders, supabase (+5 more)

### Community 12 - "Production Dependencies"
Cohesion: 0.14
Nodes (14): dependencies, clsx, lucide-react, next, next-themes, react, react-dom, @react-three/drei (+6 more)

### Community 13 - "Toast Notification System"
Cohesion: 0.22
Nodes (10): Action, addToRemoveQueue(), reducer(), removeToast(), State, Toaster(), ToastProps, ToastState (+2 more)

### Community 14 - "ESLint Config"
Cohesion: 0.25
Nodes (7): extends, prettier, rules, @next/next/no-img-element, no-unused-vars, prefer-const, next/core-web-vitals

### Community 15 - "Home Page Screenshots"
Cohesion: 0.33
Nodes (6): Call-to-Action Buttons, Footer Section, Hero Section, Home Page Final Version, Header Navigation, Product Cards Grid

### Community 16 - "2D Customizer Screenshots"
Cohesion: 0.40
Nodes (6): Add to Cart CTA, Auto-Save Indicator, Canvas Preview, Color Options, Personalización 2D, Text Input Field

### Community 17 - "3D Customizer Screenshots"
Cohesion: 0.33
Nodes (6): 3D View Toggle, Add to Cart CTA, Customization Controls, Personalización 3D, Design Layers, Rotatable Mug Model

### Community 18 - "Store Final Screenshots"
Cohesion: 0.33
Nodes (6): Add to Cart Button, Customization Controls, Hero Section, Navigation Bar, Price Display, Product Display

### Community 19 - "Dark Mode Home Screenshots"
Cohesion: 0.40
Nodes (5): Cart Badge, Footer Section, Home Page Dark Mode, Product Grid, Theme Toggle Button

### Community 20 - "Dark Mode Test Screenshots"
Cohesion: 0.40
Nodes (5): Accessibility Considerations, Dark Mode Color Scheme, Dark Mode Feature, Text Contrast Check, UI Components in Dark Mode

### Community 21 - "Dark Mode Store Screenshots"
Cohesion: 0.40
Nodes (5): Dark Mode Color Scheme, Navigation Dark Mode, Product Grid Dark Mode, Store Page Dark Mode, UI Components Dark Mode

### Community 22 - "Home Initial Screenshots"
Cohesion: 0.40
Nodes (5): Color Palette, Home Page Initial Version, Initial Page Layout, Spacing Scale, Typography Hierarchy

### Community 23 - "Next.js Dev Types"
Cohesion: 0.50
Nodes (3): next_dev_types_root_params_d, next_dev_types_routes_d, NOTE: This file should not be edited

### Community 24 - "Playwright Customizer Tests"
Cohesion: 0.50
Nodes (4): Mug Customizer Page, Finish Options (Artico, Sage), Text Customization, 3D Customizer View

### Community 25 - "Store Error State"
Cohesion: 0.83
Nodes (4): tienda-error_404-error, tienda-error_ecommerce-error-state, tienda-error_homepage-cta, tienda-error_tienda-error

### Community 26 - "Store Error Screenshots"
Cohesion: 0.67
Nodes (4): 404 Error Page, 404 Message, Return to Home Link, Storefront Error Context

### Community 27 - "Playwright Empty Design"
Cohesion: 0.67
Nodes (3): Playwright page capture 2026-09-14T18:38:13, Playwright page capture 2026-09-14T18:38:31, Empty design placeholder (Agrega disenos arriba)

### Community 29 - "Playwright Cart Tests"
Cohesion: 0.67
Nodes (3): Empty Cart State, Tia Yami, Theme Toggle (Light/Dark/System)

### Community 30 - "Playwright Shop/Cart Tests"
Cohesion: 0.67
Nodes (3): Shop Page (Tienda), Taza Clasica, Multi-Item Cart

### Community 31 - "Playwright Auth/Error Tests"
Cohesion: 0.67
Nodes (3): Invalid Path Error, Login Page, TazasPage

## Knowledge Gaps
- **271 isolated node(s):** `next/core-web-vitals`, `prettier`, `prefer-const`, `no-unused-vars`, `@next/next/no-img-element` (+266 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 298 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App Pages & Auth` to `3D Customizer Components`, `Project Config & Dependencies`, `Layout & Providers`, `Toast Notification System`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies` to `Project Config & Dependencies`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Production Dependencies` to `Project Config & Dependencies`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `prettier`, `prefer-const` to the rest of the system?**
  _271 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Pages & Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.0791476407914764 - nodes in this community are weakly interconnected._
- **Should `3D Customizer Components` be split into smaller, more focused modules?**
  _Cohesion score 0.08048780487804878 - nodes in this community are weakly interconnected._
- **Should `Project Config & Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05832147937411095 - nodes in this community are weakly interconnected._