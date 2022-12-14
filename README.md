# Svelte Kit Template for Cloudflare Pages

Inspired by https://github.com/tyvdh/boilerkit auhtored by Tyler van der Hoeven.

It use Miniflare to reflect Cloudflare Workers behaviour on Vite development environment. It extends `boilerkit` with `Request#cf` object, all Miniflare globals, and Typescript.

Because it does not use Miniflare as the server (it use Vite instead), the experience will not be as good as Miniflare or Wrangler. For example, the `waitUntil` and `passthroughOnException` function are just `no-op` functions.

If you use bindings, you need to define those bindings inside the miniflare settings located at `./src/platform/index.ts`. For environment variables, it automatically imported from a `.env` file.

You may notice that the `dev` script in package.json has `NODE_OPTIONS='--experimental-vm-modules --no-warnings'` variable set. It is required to run Miniflare in `modules` mode. It will be removed once VM Modules feature is stable on Node JS.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
