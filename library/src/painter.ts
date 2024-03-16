import type { Renderer } from "./renderer";

export type XYZ = [x: number, y: number, z: number];
export type RGB = [r: number, g: number, b: number];
export type RGBA = [...RGB, a: number];
export type MaybeRGBA = RGB | RGBA;
export type Point = [...XYZ, ...MaybeRGBA, size: number];
export type Triangle<T extends MaybeRGBA = MaybeRGBA> = [
	[...XYZ, ...T],
	[...XYZ, ...T],
	[...XYZ, ...T],
];
export type PointList = [...XYZ, ...MaybeRGBA][];
export type Circle = [...XYZ, size: number, resolution: number, ...MaybeRGBA];

export class PainterError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "PainterError";
	}
}

export class Painter {
	public ref = {
		vertex: "a_Position",
		color: "a_Color",
		size: "a_Size",
	};

	constructor(
		public readonly renderer: Renderer,
		public readonly program: WebGLProgram,
	) {
		this.renderer.gl.useProgram(program);
	}

	protected bind(
		source: Float32Array,
		width: [position: number, color: number, size: number],
	): this {
		const [POSITION_ELEMENTS, COLOR_ELEMENTS, SIZE_ELEMENTS] = width;

		const FSIZE = Float32Array.BYTES_PER_ELEMENT;
		const STRIDE = (POSITION_ELEMENTS + COLOR_ELEMENTS + SIZE_ELEMENTS) * FSIZE;

		const gl = this.renderer.gl;
		const buffer = gl.createBuffer();
		if (buffer === null) {
			throw new PainterError("Failed to create buffer");
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW);

		const a_Position = gl.getAttribLocation(this.program, this.ref.vertex);
		if (a_Position < 0) {
			throw new PainterError(`Failed to get the storage location of "${this.ref.vertex}"`);
		}
		gl.vertexAttribPointer(a_Position, POSITION_ELEMENTS, gl.FLOAT, false, STRIDE, 0);
		gl.enableVertexAttribArray(a_Position);

		const a_Color = gl.getAttribLocation(this.program, this.ref.color);
		if (a_Color < 0) {
			throw new PainterError(`Failed to get the storage location of "${this.ref.color}"`);
		}
		gl.vertexAttribPointer(
			a_Color,
			COLOR_ELEMENTS,
			gl.FLOAT,
			false,
			STRIDE,
			FSIZE * POSITION_ELEMENTS,
		);
		gl.enableVertexAttribArray(a_Color);

		const a_Size = gl.getAttribLocation(this.program, this.ref.size);
		if (a_Size < 0) {
			throw new PainterError(`Failed to get the storage location of "${this.ref.size}"`);
		}
		gl.vertexAttribPointer(
			a_Size,
			SIZE_ELEMENTS,
			gl.FLOAT,
			false,
			STRIDE,
			FSIZE * (POSITION_ELEMENTS + COLOR_ELEMENTS),
		);
		gl.enableVertexAttribArray(a_Size);

		return this;
	}

	public points(source: Point[]): this {
		if (source.length === 0) {
			return this;
		}

		const POSITION_ELEMENTS = 3;
		const SIZE_ELEMENTS = 1;
		const COLOR_ELEMENTS = source[0].length - POSITION_ELEMENTS - SIZE_ELEMENTS;

		const data = new Float32Array(source.flat());
		this.bind(data, [POSITION_ELEMENTS, COLOR_ELEMENTS, SIZE_ELEMENTS]);

		const gl = this.renderer.gl;
		gl.drawArrays(gl.POINTS, 0, source.length);
		return this;
	}

	public triangles(source: Triangle[]): this {
		if (source.length === 0) {
			return this;
		}

		const POSITION_ELEMENTS = 3;
		const COLOR_ELEMENTS = source[0][0].length - POSITION_ELEMENTS;
		const SIZE_ELEMENTS = 1;

		const data = new Float32Array(source.flat().flatMap((v) => [...v, 1]));
		this.bind(data, [POSITION_ELEMENTS, COLOR_ELEMENTS, SIZE_ELEMENTS]);

		const gl = this.renderer.gl;
		gl.drawArrays(gl.TRIANGLES, 0, source.length * 3);
		return this;
	}

	public triangleStrip(source: PointList): this {
		if (source.length === 0) {
			return this;
		}

		const POSITION_ELEMENTS = 3;
		const COLOR_ELEMENTS = source[0].length - POSITION_ELEMENTS;
		const SIZE_ELEMENTS = 1;

		const data = new Float32Array(source.flatMap((v) => [...v, 1]));
		this.bind(data, [POSITION_ELEMENTS, COLOR_ELEMENTS, SIZE_ELEMENTS]);

		const gl = this.renderer.gl;
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, source.length);
		return this;
	}

	public triangleFan(source: PointList): this {
		if (source.length === 0) {
			return this;
		}

		const POSITION_ELEMENTS = 3;
		const COLOR_ELEMENTS = source[0].length - POSITION_ELEMENTS;
		const SIZE_ELEMENTS = 1;

		const data = new Float32Array(source.flatMap((v) => [...v, 1]));
		this.bind(data, [POSITION_ELEMENTS, COLOR_ELEMENTS, SIZE_ELEMENTS]);

		const gl = this.renderer.gl;
		gl.drawArrays(gl.TRIANGLE_FAN, 0, source.length);
		return this;
	}

	protected circle(source: Circle): this {
		const [x, y, z, size, resolution, ...color] = source;
		if (resolution < 3) {
			throw new PainterError("Circle resolution must be greater than or equal to 3");
		}

		const points: PointList = [];
		for (let i = 0; i < resolution; i++) {
			const angle = (i / resolution) * Math.PI * 2;
			points.push([x + Math.cos(angle) * size, y + Math.sin(angle) * size, z, ...color]);
		}
		points.push(points[0]);

		return this.triangleFan(points);
	}

	public circles(source: Circle[]): this {
		source.forEach((circle) => this.circle(circle));
		return this;
	}
}
