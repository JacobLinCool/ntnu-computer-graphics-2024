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

	public triangle(
		program: WebGLProgram,
		points: [[number, number], [number, number], [number, number]],
	) {
		const vertices = new Float32Array(points.flat());
		const n = 3;

		const vertexBuffer = this.gl.createBuffer();
		if (vertexBuffer === null) {
			throw new Error("Failed to create the vertex buffer");
		}
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

		///// get the reference of the variable in the shader program
		const a_Position = this.gl.getAttribLocation(program, "a_Position");
		if (a_Position < 0) {
			throw new Error("Failed to get the reference of a_Position");
		}

		this.gl.vertexAttribPointer(a_Position, 2, this.gl.FLOAT, false, 0, 0); //setting of the vertex buffer
		this.gl.enableVertexAttribArray(a_Position); //enable the vetex buffer

		this.gl.drawArrays(this.gl.TRIANGLES, 0, n);
	}
}
