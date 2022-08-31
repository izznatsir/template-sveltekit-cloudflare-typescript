import type { ServerLoad } from '@sveltejs/kit';
import type { CfRequest } from '../types';

export const load: ServerLoad = async ({ request }) => {
	const cf = (request as CfRequest).cf;

	return cf ? cf.country : undefined;
};
