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
		const vertices = new Float32Array([x, y, ...color]);

		const vertexBuffer = this.gl.createBuffer();
		if (vertexBuffer === null) {
			throw new Error("Failed to create the vertex buffer");
		}
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

		const a_Position = this.gl.getAttribLocation(program, "a_Position");
		if (a_Position < 0) {
			throw new Error("Failed to get the reference of a_Position");
		}

		this.gl.vertexAttribPointer(a_Position, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(a_Position);

		const a_Color = this.gl.getAttribLocation(program, "a_Color");
		if (a_Color === null) {
			throw new Error("Failed to get the reference of a_Color");
		}

		this.gl.vertexAttribPointer(
			a_Color,
			3,
			this.gl.FLOAT,
			false,
			0,
			vertices.BYTES_PER_ELEMENT * 2,
		);
		this.gl.enableVertexAttribArray(a_Color);

		this.gl.drawArrays(this.gl.POINTS, 0, 1);
	}

	public triangleStrip(
		program: WebGLProgram,
		points: [x: number, y: number, color: [r: number, g: number, b: number]][],
	) {
		const vertices = new Float32Array(points.flat(2));
		const n = points.length;

		const vertexBuffer = this.gl.createBuffer();
		if (vertexBuffer === null) {
			throw new Error("Failed to create the vertex buffer");
		}
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

		const a_Position = this.gl.getAttribLocation(program, "a_Position");
		if (a_Position < 0) {
			throw new Error("Failed to get the reference of a_Position");
		}

		this.gl.vertexAttribPointer(
			a_Position,
			2,
			this.gl.FLOAT,
			false,
			vertices.BYTES_PER_ELEMENT * 5,
			0,
		);
		this.gl.enableVertexAttribArray(a_Position);

		const a_Color = this.gl.getAttribLocation(program, "a_Color");
		if (a_Color < 0) {
			throw new Error("Failed to get the reference of a_Color");
		}

		this.gl.vertexAttribPointer(
			a_Color,
			3,
			this.gl.FLOAT,
			false,
			vertices.BYTES_PER_ELEMENT * 5,
			vertices.BYTES_PER_ELEMENT * 2,
		);
		this.gl.enableVertexAttribArray(a_Color);

		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, n);
	}
}
