import type { Handle } from '@sveltejs/kit';
import { extendPlatformAndRequest } from './platform';

export const handle: Handle = async ({ event, resolve }) => {
	await extendPlatformAndRequest(event);

	return resolve(event);
};
