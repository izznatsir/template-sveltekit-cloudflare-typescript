import type { RequestEvent } from '@sveltejs/kit';

let cf: IncomingRequestCfProperties;
let env: App.Platform['env'];

if (import.meta.env.DEV) {
	const { Miniflare } = await import('miniflare');

	const mf = new Miniflare({
		script: `
export default {
	fetch: () => {
		return new Response()
	}
}
		`,

		modules: true,

		envPath: true,
		packagePath: true,
		wranglerConfigPath: true,

		globalAsyncIO: true,
		globalRandom: true,
		globalTimers: true,

		kvNamespaces: ['SESSION']
	});

	Object.entries(await mf.getGlobalScope()).forEach(([property, value]) => {
		if (['global', 'self'].includes(property)) return;
		(global as Record<string, unknown>)[property] = value;
	});

	cf = (await import('./cf.json')) as IncomingRequestCfProperties;
	env = (await mf.getBindings()) as App.Platform['env'];
}

export async function patchflare(event: RequestEvent) {
	if (import.meta.env.DEV) {
		event.platform = {
			env,
			context: {
				passThroughOnException() {},
				waitUntil() {}
			}
		};

		event.request = new Request(event.request.url, {
			...event.request,
			cf
		});
	}
}
