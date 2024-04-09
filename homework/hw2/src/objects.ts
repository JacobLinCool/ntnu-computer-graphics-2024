import { GraphObject } from "library";
import { repeat } from "./utils";

export class Triangle extends GraphObject {
	protected vertices: WebGLBuffer;
	protected colors: WebGLBuffer;

	constructor(
		gl: WebGLRenderingContext,
		v = [0, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0],
		c = [0, 1, 0, 0, 1, 0, 0, 1, 0],
	) {
		super();

		const vertices = new Float32Array(v);
		const colors = new Float32Array(c);

		const vBuffer = gl.createBuffer();
		if (!vBuffer) {
			throw new Error("Failed to create buffer object");
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
		this.vertices = vBuffer;

		const cBuffer = gl.createBuffer();
		if (!cBuffer) {
			throw new Error("Failed to create buffer object");
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
		this.colors = cBuffer;
	}

	public renderSelf(gl: WebGLRenderingContext, transform = this.transform): void {
		const program = gl.getParameter(gl.CURRENT_PROGRAM);
		if (!program) {
			throw new Error("Failed to get current program");
		}

		const a_Position = gl.getAttribLocation(program, "a_Position");
		if (a_Position < 0) {
			throw new Error("Failed to get the storage location of a_Position");
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
		gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(a_Position);

		const a_Color = gl.getAttribLocation(program, "a_Color");
		if (a_Color < 0) {
			throw new Error("Failed to get the storage location of a_Color");
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colors);
		gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(a_Color);

		const u_transformMatrix = gl.getUniformLocation(program, "u_transformMatrix");
		if (!u_transformMatrix) {
			throw new Error("Failed to get the storage location of u_transformMatrix");
		}
		gl.uniformMatrix4fv(u_transformMatrix, false, transform.elements);

		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}
}

export class Rect extends GraphObject {
	protected vertices: WebGLBuffer;
	protected colors: WebGLBuffer;

	constructor(
		gl: WebGLRenderingContext,
		v = [0.5, 0.5, 0, -0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0],
		c = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
	) {
		super();

		const vertices = new Float32Array(v);
		const colors = new Float32Array(c);

		const vBuffer = gl.createBuffer();
		if (!vBuffer) {
			throw new Error("Failed to create buffer object");
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
		this.vertices = vBuffer;

		const cBuffer = gl.createBuffer();
		if (!cBuffer) {
			throw new Error("Failed to create buffer object");
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
		this.colors = cBuffer;
	}

	public renderSelf(gl: WebGLRenderingContext, transform = this.transform): void {
		const program = gl.getParameter(gl.CURRENT_PROGRAM);
		if (!program) {
			throw new Error("Failed to get current program");
		}

		const a_Position = gl.getAttribLocation(program, "a_Position");
		if (a_Position < 0) {
			throw new Error("Failed to get the storage location of a_Position");
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
		gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(a_Position);

		const a_Color = gl.getAttribLocation(program, "a_Color");
		if (a_Color < 0) {
			throw new Error("Failed to get the storage location of a_Color");
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colors);
		gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(a_Color);

		const u_transformMatrix = gl.getUniformLocation(program, "u_transformMatrix");
		if (!u_transformMatrix) {
			throw new Error("Failed to get the storage location of u_transformMatrix");
		}
		gl.uniformMatrix4fv(u_transformMatrix, false, transform.elements);

		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	}
}

export class Circle extends GraphObject {
	protected vertices: WebGLBuffer;
	protected colors: WebGLBuffer;
	protected n: number;

	constructor(gl: WebGLRenderingContext, [x, y, z, r, n] = [0, 0, 0, 0.5, 100], c = [0, 1, 0]) {
		super();

		const vertices = [x, y, 0];
		for (let i = 0; i < n; i++) {
			const angle = (2 * Math.PI * i) / n;
			vertices.push(x + r * Math.cos(angle), y + r * Math.sin(angle), z);
		}
		vertices.push(x + r, y, 0);

		const vBuffer = gl.createBuffer();
		if (!vBuffer) {
			throw new Error("Failed to create buffer object");
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.vertices = vBuffer;

		const cBuffer = gl.createBuffer();
		if (!cBuffer) {
			throw new Error("Failed to create buffer object");
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(repeat(c, n + 2)), gl.STATIC_DRAW);
		this.colors = cBuffer;

		this.n = n;
	}

	public renderSelf(gl: WebGLRenderingContext, transform = this.transform): void {
		const program = gl.getParameter(gl.CURRENT_PROGRAM);
		if (!program) {
			throw new Error("Failed to get current program");
		}

		const a_Position = gl.getAttribLocation(program, "a_Position");
		if (a_Position < 0) {
			throw new Error("Failed to get the storage location of a_Position");
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
		gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(a_Position);

		const a_Color = gl.getAttribLocation(program, "a_Color");
		if (a_Color < 0) {
			throw new Error("Failed to get the storage location of a_Color");
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colors);
		gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(a_Color);

		const u_transformMatrix = gl.getUniformLocation(program, "u_transformMatrix");
		if (!u_transformMatrix) {
			throw new Error("Failed to get the storage location of u_transformMatrix");
		}
		gl.uniformMatrix4fv(u_transformMatrix, false, transform.elements);

		gl.drawArrays(gl.TRIANGLE_FAN, 0, this.n + 2);
	}
}
