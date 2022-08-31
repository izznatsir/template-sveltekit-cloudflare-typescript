// See https://kit.svelte.dev/docs/types#app
declare namespace App {
	// interface Locals {}
	// interface PageData {}
	interface Platform {
		env: {
			SESSION: KVNamespace;
		};
		context: ExecutionContext;
	}
}
