// Copyright (c) Tyler van der Hoeven.
// Copyright (c) Izzuddin Natsir.

import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';
import type { Miniflare } from 'miniflare';

let miniflare: Miniflare;
let cf: IncomingRequestCfProperties;
let context: ExecutionContext;
let env: App.Platform['env'];

const ENV_VARIABLES = ['SECRET'];
const KV_NAMESPACES = ['SESSION'];
const BINDINGS = [...ENV_VARIABLES, ...KV_NAMESPACES];

if (dev) {
	function setContext(_context: ExecutionContext) {
		context = _context;
	}

	const { transform } = await import('esbuild');
	const { Miniflare } = await import('miniflare');

	const { code: script } = await transform(
		`
addEventListener('fetch', (event) => {
	setContext({ waitUntil: event.waitUntil, passThroughOnException: event.passThroughOnException })
	event.respondWith(new Response())
})
	`,
		{
			loader: 'js',
			platform: 'neutral'
		}
	);

	miniflare = new Miniflare({
		script,

		envPath: true,
		packagePath: true,
		wranglerConfigPath: true,

		globalAsyncIO: true, // Allow async I/O outside handlers
		globalRandom: true, // Allow secure random generation outside handlers
		globalTimers: true, // Allow setting timers outside handlers

		cfFetch: './.mf/cf.json',
		kvNamespaces: KV_NAMESPACES,
		globals: {
			setContext
		}
	});

	// setup cloudflare workers global and context
	await miniflare.dispatchFetch('http://localhost:5173');

	const _global = await miniflare.getGlobalScope();

	Object.entries(_global).forEach(([property, value]) => {
		if (['global', 'self', 'setContext', ...BINDINGS].includes(property)) return;
		// @ts-ignore
		global[property] = value;
	});

	cf = (await import('../../.mf/cf.json')) as IncomingRequestCfProperties;

	env = (await miniflare.getBindings()) as App.Platform['env'];
}

export async function extendPlatformAndRequest(event: RequestEvent) {
	if (!dev) return;

	event.request = new Request(event.request.url, {
		...event.request,
		cf
	});

	event.platform = {
		env,
		context
	};
}
