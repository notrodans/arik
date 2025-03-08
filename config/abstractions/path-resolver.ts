import { resolve } from "path";
import { setTimeout } from "timers/promises";
import { ViteDevServer } from "vite";

export interface PathResolverOptions {
	name: string;
	prefix: string;
	folder: string;
	emoji?: string;
	devRoot?: string;
	prodRoot?: string;
}

class PathResolver {
	private server: unknown;
	private regex: RegExp;

	constructor(private options: PathResolverOptions) {
		const { prefix } = options;
		this.regex = new RegExp(`${prefix}/([^"']+)`, "g");
	}

	setServer(server: ViteDevServer) {
		this.server = server;
	}

	getAlias(isDev: boolean) {
		const root = isDev ? this.options.devRoot || "src" : this.options.prodRoot || "dist";
		return {
			[this.options.prefix]: resolve(process.cwd(), root, this.options.folder)
		};
	}

	transform(content: string, isDev: boolean) {
		return content.replace(this.regex, (match, path) => `${this.options.folder}${path}`);
	}
}
export function createPathPlugin(options: PathResolverOptions) {
	const resolver = new PathResolver(options);

	return {
		name: `vite-plugin-${options.name}-path`,

		config(config: any) {
			const isDev = config.mode === "development";
			return {
				resolve: {
					alias: resolver.getAlias(isDev)
				}
			};
		},
		transformIndexHtml(html: string, ctx: any) {
			const isDev = ctx.server !== undefined;
			return resolver.transform(html, isDev);
		}
	};
}
