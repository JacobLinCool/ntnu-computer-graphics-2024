import { Compiler } from "./compiler";
import { Painter } from "./painter";

export class Renderer {
	public canvas: HTMLCanvasElement;
	public gl: WebGLRenderingContext;

	constructor(selector: string, opt?: WebGLContextAttributes) {
		const canvas = document.querySelector(selector);
		if (canvas === null) {
			throw new Error(`Failed to find a canvas element with the selector "${selector}"`);
		}
		if (!(canvas instanceof HTMLCanvasElement)) {
			throw new Error(`The element with the selector "${selector}" is not a canvas element`);
		}

		const gl = canvas.getContext("webgl", opt);
		if (gl === null) {
			throw new Error("Failed to get the rendering context for WebGL");
		}

		this.canvas = canvas;
		this.gl = gl;
	}

	public get compiler(): Compiler {
		return new Compiler(this.gl);
	}

	public use(program: WebGLProgram): Painter {
		return new Painter(this, program);
	}

	public clear(red: number, green: number, blue: number, alpha = 1) {
		this.gl.clearColor(red, green, blue, alpha);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	}

	private _id = 0;

	public render(callback: () => void | Promise<void>): () => void {
		const render = async () => {
			await callback();
			this._id = requestAnimationFrame(render);
		};

		this._id = requestAnimationFrame(render);

		return () => cancelAnimationFrame(this._id);
	}
}
