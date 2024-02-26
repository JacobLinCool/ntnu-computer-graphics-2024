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

	public point(
		program: WebGLProgram,
		x: number,
		y: number,
		color: [r: number, g: number, b: number, a: number],
	) {
		const u_Position = this.gl.getUniformLocation(program, "u_Position");
		if (u_Position === null) {
			throw new Error("Failed to get the reference of u_Position");
		}

		const u_FragColor = this.gl.getUniformLocation(program, "u_FragColor");
		if (u_FragColor === null) {
			throw new Error("Failed to get the reference of u_FragColor");
		}

		this.gl.uniform4f(u_Position, x, y, 0.0, 1.0);
		this.gl.uniform4f(u_FragColor, ...color);
		this.gl.drawArrays(this.gl.POINTS, 0, 1);
	}
}
