import { Renderer } from "library";
import { Matrix4 } from "library/cuon-matrix";
import FSHADER_SOURCE from "./fshader.glsl?raw";
import VSHADER_SOURCE from "./vshader.glsl?raw";

const vertices = new Float32Array([
	//9 vertices (three triangles)
	0.0,
	1.0,
	-2.0, //x, y, z of the 1st vertex of the 1st triangle
	-0.5,
	-1.0,
	-2.0,
	0.5,
	-1.0,
	-2.0,

	0.0,
	1.0,
	-0.0,
	-0.5,
	-1.0,
	-0.0,
	0.5,
	-1.0,
	-0.0,

	0.0,
	1.0,
	2.0,
	-0.5,
	-1.0,
	2.0,
	0.5,
	-1.0,
	2.0,
]);

const colors = new Float32Array([
	//9 vertices (three triangles)'s color
	0.7,
	0.0,
	0.0, //r, g, b of the 1st vertex of the 1st triangle
	0.7,
	0.0,
	0.0,
	0.7,
	0.0,
	0.0,

	0.0,
	0.7,
	0.0,
	0.0,
	0.7,
	0.0,
	0.0,
	0.7,
	0.0,

	0.0,
	0.0,
	0.7,
	0.0,
	0.0,
	0.7,
	0.0,
	0.0,
	0.7,
]);

class Lab05 {
	private modelMatrix1 = new Matrix4();
	private modelMatrix2 = new Matrix4();
	private frontViewMatrix1 = new Matrix4();
	private frontViewMatrix2 = new Matrix4();
	private pespProjMatrix1 = new Matrix4();
	private pespProjMatrix2 = new Matrix4();
	private transformMat = new Matrix4();
	private mouseLastX = 0;
	private mouseLastY = 0;
	private x = 0;
	private y = 0;
	private mouseDragging = false;
	private angleX = 0;
	private angleY = 0;
	private renderer: Renderer;
	private a_Position: number;
	private a_Color: number;
	private u_mvpMatrix: WebGLUniformLocation;
	private triangles: { verticesBuffer: WebGLBuffer; colorsBuffer: WebGLBuffer; n: number };
	constructor(selector: string) {
		const renderer = new Renderer(selector);
		const program = renderer.compiler
			.compileFragment(FSHADER_SOURCE)
			.compileVertex(VSHADER_SOURCE)
			.link();
		renderer.use(program);
		const a_Position = renderer.gl.getAttribLocation(program, "a_Position");
		const a_Color = renderer.gl.getAttribLocation(program, "a_Color");
		const u_mvpMatrix = renderer.gl.getUniformLocation(program, "u_mvpMatrix");

		if (a_Position < 0 || a_Color < 0 || u_mvpMatrix === null) {
			throw new Error(
				"Failed to get the storage location of a_Position, a_Color, or u_mvpMatrix",
			);
		}

		this.frontViewMatrix1.setLookAt(0, 0, -10, 0, 0, 100, 0, 1, 0);
		this.pespProjMatrix1.setPerspective(
			30,
			renderer.canvas.width / renderer.canvas.height,
			1,
			100,
		);

		this.frontViewMatrix2.setLookAt(0, 2, 15, 0, 1.5, -100, 0, 1, 0);
		this.pespProjMatrix2.setOrtho(-2, 2, -2, 2, 1, 100);

		renderer.gl.enable(renderer.gl.DEPTH_TEST);
		renderer.gl.enable(renderer.gl.SCISSOR_TEST);

		renderer.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
		renderer.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
		renderer.canvas.addEventListener("mousemove", this.mouseMove.bind(this));

		this.renderer = renderer;
		this.a_Position = a_Position;
		this.a_Color = a_Color;
		this.u_mvpMatrix = u_mvpMatrix;
		this.triangles = this.initTriangleBuffers(vertices, colors);
	}

	public start() {
		return this.renderer.render(this.render.bind(this));
	}

	public render() {
		if (this.mouseDragging) {
			const factor = 100 / this.renderer.canvas.height;
			const dx = factor * (this.x - this.mouseLastX);
			const dy = factor * (this.y - this.mouseLastY);

			this.angleX = (this.angleX + dx) % 360;
			this.angleY = (this.angleY + dy) % 360;
		}
		this.mouseLastX = this.x;
		this.mouseLastY = this.y;

		this.modelMatrix1.setRotate(-this.angleY, 1, 0, 0);
		this.modelMatrix1.rotate(this.angleX, 0, 1, 0);
		this.modelMatrix1.translate(0.6, 0, 0);
		this.modelMatrix2.setRotate(-this.angleY, 1, 0, 0);
		this.modelMatrix2.rotate(this.angleX, 0, 1, 0);
		this.modelMatrix2.translate(-0.6, 0, 0);

		this.drawOneViewport(
			0,
			0,
			this.renderer.canvas.width / 2,
			this.renderer.canvas.height / 2,
			0,
			0,
			0,
			this.pespProjMatrix1,
			this.frontViewMatrix1,
		);

		this.drawOneViewport(
			this.renderer.canvas.width / 2,
			0,
			this.renderer.canvas.width / 2,
			this.renderer.canvas.height / 2,
			0.35,
			0.35,
			0.35,
			this.pespProjMatrix2,
			this.frontViewMatrix1,
		);

		this.drawOneViewport(
			0,
			this.renderer.canvas.height / 2,
			this.renderer.canvas.width,
			this.renderer.canvas.height,
			0.77,
			0.77,
			0.77,
			this.pespProjMatrix1,
			this.frontViewMatrix2,
		);
	}

	private initTriangleBuffers(vertices: Float32Array, colors: Float32Array) {
		const gl = this.renderer.gl;
		const ret = {
			verticesBuffer: this.createBuffer(gl, vertices),
			colorsBuffer: this.createBuffer(gl, colors),
			n: vertices.length / 3,
		};

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		return ret;
	}

	private mouseMove(evt: MouseEvent) {
		this.x = evt.clientX;
		this.y = evt.clientY;
	}

	private mouseDown(evt: MouseEvent) {
		const { clientX, clientY } = evt;
		const rect = this.renderer.canvas.getBoundingClientRect();
		if (
			rect.left <= clientX &&
			clientX < rect.right &&
			rect.top <= clientY &&
			clientY < rect.bottom
		) {
			this.mouseLastX = clientX;
			this.mouseLastY = clientY;
			this.mouseDragging = true;
		}
	}

	private mouseUp() {
		this.mouseDragging = false;
	}

	private drawOneViewport(
		viewportX: number,
		viewportY: number,
		viewportWidth: number,
		viewportHeight: number,
		bgColorR: number,
		bgColorG: number,
		bgColorB: number,
		projectionMatrix: Matrix4,
		viewMatrix: Matrix4,
	) {
		this.renderer.gl.viewport(viewportX, viewportY, viewportWidth, viewportHeight);
		this.renderer.gl.scissor(viewportX, viewportY, viewportWidth, viewportHeight);

		this.renderer.gl.clearColor(bgColorR, bgColorG, bgColorB, 1.0);
		this.renderer.gl.clear(
			this.renderer.gl.DEPTH_BUFFER_BIT | this.renderer.gl.COLOR_BUFFER_BIT,
		);

		this.transformMat.set(projectionMatrix);
		this.transformMat.multiply(viewMatrix);
		// this.modelMatrix1.translate(0.6, 0, 0);
		this.transformMat.multiply(this.modelMatrix1);
		this.renderer.gl.uniformMatrix4fv(this.u_mvpMatrix, false, this.transformMat.elements);
		this.initAttributeVariable(this.a_Position, {
			buffer: this.triangles.verticesBuffer,
			num: 3,
			type: this.renderer.gl.FLOAT,
		});
		this.initAttributeVariable(this.a_Color, {
			buffer: this.triangles.colorsBuffer,
			num: 3,
			type: this.renderer.gl.FLOAT,
		});
		this.renderer.gl.drawArrays(this.renderer.gl.TRIANGLES, 0, this.triangles.n);

		this.transformMat.set(projectionMatrix);
		this.transformMat.multiply(viewMatrix);
		// this.modelMatrix1.translate(-1.2, 0, 0);
		this.transformMat.multiply(this.modelMatrix2);
		this.renderer.gl.uniformMatrix4fv(this.u_mvpMatrix, false, this.transformMat.elements);
		this.initAttributeVariable(this.a_Position, {
			buffer: this.triangles.verticesBuffer,
			num: 3,
			type: this.renderer.gl.FLOAT,
		});
		this.initAttributeVariable(this.a_Color, {
			buffer: this.triangles.colorsBuffer,
			num: 3,
			type: this.renderer.gl.FLOAT,
		});
		this.renderer.gl.drawArrays(this.renderer.gl.TRIANGLES, 0, this.triangles.n);
	}

	private initAttributeVariable(
		a_attribute: number,
		x: { buffer: WebGLBuffer; num: number; type: number },
	) {
		const gl = this.renderer.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, x.buffer);
		gl.vertexAttribPointer(a_attribute, x.num, x.type, false, 0, 0);
		gl.enableVertexAttribArray(a_attribute);
	}

	private createBuffer(gl: WebGLRenderingContext, data: Float32Array) {
		// Create a buffer object
		const buffer = gl.createBuffer();
		if (!buffer) {
			throw new Error("Failed to create the buffer object");
		}
		// Write date into the buffer object
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

		// Store the necessary information to assign the object to the attribute variable later
		return buffer;
	}
}

async function main() {
	const lab05 = new Lab05("#webgl");
	lab05.start();
}

main();
