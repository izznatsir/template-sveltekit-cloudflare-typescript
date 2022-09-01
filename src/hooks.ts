import type { Handle } from '@sveltejs/kit';
import { patchflare } from './platform';

export const handle: Handle = async ({ event, resolve }) => {
	if (import.meta.env.DEV) await patchflare(event);

	return resolve(event);
};
