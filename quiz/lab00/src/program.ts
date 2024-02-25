export class Program {
	public shaders: WebGLShader[] = [];

	constructor(protected gl: WebGLRenderingContext) {}

	public compile(type: number, source: string): this {
		const shader = this.gl.createShader(type);
		if (shader === null) {
			throw new Error("Failed to create shader");
		}

		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);
		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			const message = this.gl.getShaderInfoLog(shader);
			throw new Error(`shader compile error: ${message}`);
		}

		this.shaders.push(shader);
		return this;
	}

	public link(): WebGLProgram {
		const program = this.gl.createProgram();
		if (program === null) {
			throw new Error("Failed to create program");
		}

		this.shaders.forEach((shader) => this.gl.attachShader(program, shader));
		this.gl.linkProgram(program);

		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			this.gl.deleteProgram(program);
			const message = this.gl.getProgramInfoLog(program)?.toString();
			throw new Error(message);
		}

		return program;
	}
}
