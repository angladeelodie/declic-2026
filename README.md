# Hydrogen template: Skeleton

Hydrogen is Shopify’s stack for headless commerce. Hydrogen is designed to dovetail with [Remix](https://remix.run/), Shopify’s full stack web framework. This template contains a **minimal setup** of components, queries and tooling to get started with Hydrogen.

[Check out Hydrogen docs](https://shopify.dev/custom-storefronts/hydrogen)
[Get familiar with Remix](https://remix.run/docs/en/v1)

## What's included

- Remix
- Hydrogen
- Oxygen
- Vite
- Shopify CLI
- ESLint
- Prettier
- GraphQL generator
- TypeScript and JavaScript flavors
- Minimal setup of components and routes

## Getting started

**Requirements:**

- Node.js version 18.0.0 or higher
- Shopify store with Metaobjects enabled
- Metaobject definitions created in Shopify admin

```bash
npm create @shopify/hydrogen@latest
```

## Setting up Metaobjects

1. **Create Metaobject definitions** in your Shopify admin:
   - Navigate to Settings → Custom data → Metaobjects
   - Create definitions for Route, SectionHero, SectionFeaturedProducts, etc.
   - See `guides/metaobjects/README.md` for detailed field configurations

2. **Create content entries**:
   - Add Route entries for pages you want to manage
   - Create Section entries and link them to Routes
   - Configure section content and references

3. **Query and render**:
   - Routes automatically query their associated sections
   - Sections component handles dynamic rendering based on type

## Building for production

```bash
npm run build
```

## Local development

```bash
npm run dev
```

## Creating New Sections

1. Define the Metaobject in Shopify admin
2. Create a React component in `app/sections/`
3. Add the GraphQL fragment for querying
4. Register in the Sections component switch statement

Example:
```tsx
export function SectionExample(props: SectionExampleFragment) {
  const section = parseSection<...>(props);
  return <section>...</section>;
}
```


## Setup for using Customer Account API (`/account` section)

Follow step 1 and 2 of <https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen#step-1-set-up-a-public-domain-for-local-development>


