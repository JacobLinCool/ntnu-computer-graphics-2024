export class CompileError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "CompileError";
	}
}

export class Compiler {
	protected shaders: WebGLShader[] = [];

	constructor(protected readonly gl: WebGLRenderingContext) {}

	protected compile(type: number, source: string): this {
		const shader = this.gl.createShader(type);
		if (shader === null) {
			throw new CompileError("Failed to create shader");
		}

		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);
		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			const message = this.gl.getShaderInfoLog(shader);
			throw new CompileError(`shader compile error: ${message}`);
		}

		this.shaders.push(shader);
		return this;
	}

	public compileVertex(source: string): this {
		return this.compile(WebGLRenderingContext.VERTEX_SHADER, source);
	}

	public compileFragment(source: string): this {
		return this.compile(WebGLRenderingContext.FRAGMENT_SHADER, source);
	}

	public link(): WebGLProgram {
		const program = this.gl.createProgram();
		if (program === null) {
			throw new CompileError("Failed to create program");
		}

		this.shaders.forEach((shader) => this.gl.attachShader(program, shader));
		this.gl.linkProgram(program);

		if (!this.gl.getProgramParameter(program, WebGLRenderingContext.LINK_STATUS)) {
			this.gl.deleteProgram(program);
			const message =
				this.gl.getProgramInfoLog(program)?.toString() || "Failed to link program";
			throw new CompileError(message);
		}

		return program;
	}
}
