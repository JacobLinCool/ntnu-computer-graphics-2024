export class Screen {
	public gl: WebGLRenderingContext;

	constructor(canvas: HTMLCanvasElement) {
		const gl = canvas.getContext("webgl");
		if (gl === null) {
			throw new Error("Failed to get the rendering context for WebGL");
		}
		this.gl = gl;
	}

	public use(program: WebGLProgram): this {
		this.gl.useProgram(program);
		return this;
	}

	public clear(red: number, green: number, blue: number, alpha: number) {
		this.gl.clearColor(red, green, blue, alpha);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	}
}
