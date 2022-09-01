import { sveltekit } from '@sveltejs/kit/vite';
import { Miniflare } from 'miniflare';
import type { UserConfig } from 'vite';

cf();

const config: UserConfig = {
	plugins: [sveltekit()]
};

export default config;

// cache cloudflare workers cf object as json
async function cf() {
	const mf = new Miniflare({
		script: `
export default {
	fetch: () => {
		return new Response()
	}
}
		`,
		modules: true,
		cfFetch: './src/platform/cf.json'
	});

	await mf.dispatchFetch('http://localhost:5173');
	await mf.dispose();
}
