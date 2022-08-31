// Copyright (c) Tyler van der Hoeven.
// Copyright (c) Izzuddin Natsir.

import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';

export async function extendPlatformAndRequest(event: RequestEvent) {
	if (!dev) return;

	let context: ExecutionContext = {
		passThroughOnException() {},
		waitUntil() {}
	};

	function patch(_context: ExecutionContext, _global: Record<string, any>) {
		Object.entries(_global).forEach(([property, value]) => {
			// @ts-ignore
			global[property] = value;
		});

		context = _context;
	}

	const { transform } = await import('esbuild');
	const { Miniflare } = await import('miniflare');

	const { code: script } = await transform(
		`
export default {
	fetch: async (_, env, context) => {
		patch(context, { caches, crypto });
		return new Response();
	}
}
	`,
		{
			loader: 'js',
			platform: 'neutral'
		}
	);

	const miniflare = new Miniflare({
		globalAsyncIO: true, // Allow async I/O outside handlers
		globalRandom: true, // Allow secure random generation outside handlers
		globalTimers: true, // Allow setting timers outside handlers
		globals: {
			patch
		},
		kvNamespaces: ['SESSION'],
		modules: true,
		script
	});

	// setup cloudflare workers global and context
	await miniflare.dispatchFetch('http://localhost:5173');

	const env = (await miniflare.getBindings()) as {
		SESSION: KVNamespace;
	};

	// @ts-ignore
	event.request.cf = await import('../../node_modules/.mf/cf.json');

	event.platform = {
		env,
		context
	};
}
