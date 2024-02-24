export class Screen {
	public gl: WebGLRenderingContext;

	constructor(canvas: HTMLCanvasElement) {
		const gl = canvas.getContext("webgl");
		if (gl === null) {
			throw new Error("Failed to get the rendering context for WebGL");
		}
		this.gl = gl;
	}

	public compile(type: number, source: string): WebGLShader {
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

		return shader;
	}

	public link(...shaders: WebGLShader[]): WebGLProgram {
		/////link shader to program (by a self-define function)
		const program = this.gl.createProgram();
		if (program === null) {
			throw new Error("Failed to create program");
		}

		shaders.forEach((shader) => this.gl.attachShader(program, shader));
		this.gl.linkProgram(program);
		//if not success, log the program info, and delete it.
		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			alert(this.gl.getProgramInfoLog(program) + "");
			this.gl.deleteProgram(program);
		}

		return program;
	}

	public use(program: WebGLProgram): this {
		this.gl.useProgram(program);
		return this;
	}

	public clear(red: number, green: number, blue: number, alpha: number) {
		this.gl.clearColor(red, green, blue, alpha);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	}

	public triangle(
		program: WebGLProgram,
		points: [[number, number], [number, number], [number, number]],
	) {
		const vertices = new Float32Array(points.flat());
		const n = 3;

		const vertexBuffer = this.gl.createBuffer();
		if (!vertexBuffer) {
			console.log("Failed to create the buffer object");
		}
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

		///// get the reference of the variable in the shader program
		const a_Position = this.gl.getAttribLocation(program, "a_Position");
		if (a_Position < 0) {
			console.log("a_Position < 0"); //check you get the refernce of the variable
		}

		this.gl.vertexAttribPointer(a_Position, 2, this.gl.FLOAT, false, 0, 0); //setting of the vertex buffer
		this.gl.enableVertexAttribArray(a_Position); //enable the vetex buffer

		this.gl.drawArrays(this.gl.TRIANGLES, 0, n);
	}
}
