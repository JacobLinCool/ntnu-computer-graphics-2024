import { Renderer } from "library";
import { Matrix4 } from "library/cuon-matrix";
import FSHADER_SOURCE from "./fshader.glsl?raw";
import VSHADER_SOURCE from "./vshader.glsl?raw";

class Lab06 {
	private renderer: Renderer;
	private u_MvpMatrix: WebGLUniformLocation;
	private u_modelMatrix: WebGLUniformLocation;
	private u_normalMatrix: WebGLUniformLocation;
	private u_LightPosition: WebGLUniformLocation;
	private u_ViewPosition: WebGLUniformLocation;
	private u_Ka: WebGLUniformLocation;
	private u_Kd: WebGLUniformLocation;
	private u_Ks: WebGLUniformLocation;
	private u_shininess: WebGLUniformLocation;
	private mvpMatrix = new Matrix4();
	private modelMatrix = new Matrix4();
	private normalMatrix = new Matrix4();
	private nVertex = -2;

	private angleY = 20;
	private angleX = -20;
	private cameraX = 0;
	private cameraY = 0;
	private cameraZ = 10;

	constructor(selector: string) {
		const renderer = new Renderer(selector);
		const program = renderer.compiler
			.compileFragment(FSHADER_SOURCE)
			.compileVertex(VSHADER_SOURCE)
			.link();
		renderer.use(program);

		renderer.gl.enable(renderer.gl.DEPTH_TEST);

		renderer.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
		renderer.canvas.addEventListener("wheel", this.mouseWheel.bind(this), { passive: false });

		this.renderer = renderer;

		const u_MvpMatrix = renderer.gl.getUniformLocation(program, "u_MvpMatrix");
		if (!u_MvpMatrix) {
			throw new Error("Failed to get the storage location of u_MvpMatrix");
		}
		this.u_MvpMatrix = u_MvpMatrix;

		const u_modelMatrix = renderer.gl.getUniformLocation(program, "u_modelMatrix");
		if (!u_modelMatrix) {
			throw new Error("Failed to get the storage location of u_modelMatrix");
		}
		this.u_modelMatrix = u_modelMatrix;

		const u_normalMatrix = renderer.gl.getUniformLocation(program, "u_normalMatrix");
		if (!u_normalMatrix) {
			throw new Error("Failed to get the storage location of u_normalMatrix");
		}
		this.u_normalMatrix = u_normalMatrix;

		const u_LightPosition = renderer.gl.getUniformLocation(program, "u_LightPosition");
		if (!u_LightPosition) {
			throw new Error("Failed to get the storage location of u_LightPosition");
		}
		this.u_LightPosition = u_LightPosition;

		const u_ViewPosition = renderer.gl.getUniformLocation(program, "u_ViewPosition");
		if (!u_ViewPosition) {
			throw new Error("Failed to get the storage location of u_ViewPosition");
		}
		this.u_ViewPosition = u_ViewPosition;

		const u_Ka = renderer.gl.getUniformLocation(program, "u_Ka");
		if (!u_Ka) {
			throw new Error("Failed to get the storage location of u_Ka");
		}
		this.u_Ka = u_Ka;

		const u_Kd = renderer.gl.getUniformLocation(program, "u_Kd");
		if (!u_Kd) {
			throw new Error("Failed to get the storage location of u_Kd");
		}
		this.u_Kd = u_Kd;

		const u_Ks = renderer.gl.getUniformLocation(program, "u_Ks");
		if (!u_Ks) {
			throw new Error("Failed to get the storage location of u_Ks");
		}
		this.u_Ks = u_Ks;

		const u_shininess = renderer.gl.getUniformLocation(program, "u_shininess");
		if (!u_shininess) {
			throw new Error("Failed to get the storage location of u_shininess");
		}
		this.u_shininess = u_shininess;

		this.nVertex = this.initVertexBuffers();
	}

	private initVertexBuffers() {
		const vertices = new Float32Array([
			1.0,
			1.0,
			1.0,
			-1.0,
			1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			1.0,
			1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			1.0,
			-1.0,
			1.0, //front
			1.0,
			1.0,
			1.0,
			1.0,
			-1.0,
			1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			1.0,
			1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			1.0,
			-1.0, //right
			1.0,
			1.0,
			1.0,
			1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			-1.0,
			1.0,
			1.0,
			1.0,
			-1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			1.0, //up
			-1.0,
			1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			-1.0,
			-1.0,
			-1.0,
			-1.0,
			-1.0,
			-1.0,
			-1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			1.0, //left
			-1.0,
			-1.0,
			1.0,
			-1.0,
			-1.0,
			-1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			-1.0,
			1.0,
			-1.0,
			-1.0,
			1.0, //bottom
			1.0,
			-1.0,
			-1.0,
			-1.0,
			-1.0,
			-1.0,
			-1.0,
			1.0,
			-1.0,
			1.0,
			-1.0,
			-1.0,
			-1.0,
			1.0,
			-1.0,
			1.0,
			1.0,
			-1.0, //back
		]);

		const colors = new Float32Array([
			0.4,
			0.4,
			1.0,
			0.4,
			0.4,
			1.0,
			0.4,
			0.4,
			1.0,
			0.4,
			0.4,
			1.0,
			0.4,
			0.4,
			1.0,
			0.4,
			0.4,
			1.0, //front
			0.4,
			1.0,
			0.4,
			0.4,
			1.0,
			0.4,
			0.4,
			1.0,
			0.4,
			0.4,
			1.0,
			0.4,
			0.4,
			1.0,
			0.4,
			0.4,
			1.0,
			0.4, //right
			1.0,
			0.4,
			0.4,
			1.0,
			0.4,
			0.4,
			1.0,
			0.4,
			0.4,
			1.0,
			0.4,
			0.4,
			1.0,
			0.4,
			0.4,
			1.0,
			0.4,
			0.4, //up
			1.0,
			0.4,
			1.0,
			1.0,
			0.4,
			1.0,
			1.0,
			0.4,
			1.0,
			1.0,
			0.4,
			1.0,
			1.0,
			0.4,
			1.0,
			1.0,
			0.4,
			1.0, //left
			1.0,
			1.0,
			0.4,
			1.0,
			1.0,
			0.4,
			1.0,
			1.0,
			0.4,
			1.0,
			1.0,
			0.4,
			1.0,
			1.0,
			0.4,
			1.0,
			1.0,
			0.4, //bottom
			0.4,
			1.0,
			1.0,
			0.4,
			1.0,
			1.0,
			0.4,
			1.0,
			1.0,
			0.4,
			1.0,
			1.0,
			0.4,
			1.0,
			1.0,
			0.4,
			1.0,
			1.0, //back
		]);

		const normals = new Float32Array([
			0.0,
			0.0,
			1.0,
			0.0,
			0.0,
			1.0,
			0.0,
			0.0,
			1.0,
			0.0,
			0.0,
			1.0,
			0.0,
			0.0,
			1.0,
			0.0,
			0.0,
			1.0, //front
			1.0,
			0.0,
			0.0,
			1.0,
			0.0,
			0.0,
			1.0,
			0.0,
			0.0,
			1.0,
			0.0,
			0.0,
			1.0,
			0.0,
			0.0,
			1.0,
			0.0,
			0.0, //right
			0.0,
			1.0,
			0.0,
			0.0,
			1.0,
			0.0,
			0.0,
			1.0,
			0.0,
			0.0,
			1.0,
			0.0,
			0.0,
			1.0,
			0.0,
			0.0,
			1.0,
			0.0, //up
			-1.0,
			0.0,
			0.0,
			-1.0,
			0.0,
			0.0,
			-1.0,
			0.0,
			0.0,
			-1.0,
			0.0,
			0.0,
			-1.0,
			0.0,
			0.0,
			-1.0,
			0.0,
			0.0, //left
			0.0,
			-1.0,
			0.0,
			0.0,
			-1.0,
			0.0,
			0.0,
			-1.0,
			0.0,
			0.0,
			-1.0,
			0.0,
			0.0,
			-1.0,
			0.0,
			0.0,
			-1.0,
			0.0, //bottom
			0.0,
			0.0,
			-1.0,
			0.0,
			0.0,
			-1.0,
			0.0,
			0.0,
			-1.0,
			0.0,
			0.0,
			-1.0,
			0.0,
			0.0,
			-1.0,
			0.0,
			0.0,
			-1.0, //back
		]);

		if (!this.initArrayBuffer(vertices, 3, "a_Position")) {
			return -1;
		}

		if (!this.initArrayBuffer(colors, 3, "a_Color")) {
			return -1;
		}

		if (!this.initArrayBuffer(normals, 3, "a_Normal")) {
			return -1;
		}

		return vertices.length / 3;
	}

	private initArrayBuffer(data: Float32Array, num: number, attribute: string) {
		const gl = this.renderer.gl;
		const program: WebGLProgram = gl.getParameter(gl.CURRENT_PROGRAM);

		const buffer = this.createBuffer(gl, data);
		if (!buffer) {
			console.log("Failed to create the buffer object");
			return false;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

		const a_attribute = gl.getAttribLocation(program, attribute);
		if (a_attribute < 0) {
			console.log("Failed to get the storage location of " + attribute);
			return false;
		}

		gl.vertexAttribPointer(a_attribute, num, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(a_attribute);

		return true;
	}

	public start() {
		return this.renderer.render(this.render.bind(this));
	}

	public render() {
		this.renderer.clear(0, 0, 0);

		const gl = this.renderer.gl;

		//model Matrix (part of the mvp matrix)
		this.modelMatrix.setRotate(this.angleY, 1, 0, 0); //for mouse rotation
		this.modelMatrix.rotate(this.angleX, 0, 1, 0); //for mouse rotation
		this.modelMatrix.translate(0.0, 0.0, -1.0);
		this.modelMatrix.scale(1.0, 0.5, 2.0);
		//mvp: projection * view * model matrix
		this.mvpMatrix.setPerspective(30, 1, 1, 100);
		this.mvpMatrix.lookAt(this.cameraX, this.cameraY, this.cameraZ, 0, 0, 0, 0, 1, 0);
		this.mvpMatrix.multiply(this.modelMatrix);

		//normal matrix
		this.normalMatrix.setInverseOf(this.modelMatrix);
		this.normalMatrix.transpose();

		gl.uniform3f(this.u_LightPosition, 0, 0, 3);
		gl.uniform3f(this.u_ViewPosition, this.cameraX, this.cameraY, this.cameraZ);
		gl.uniform1f(this.u_Ka, 0.2);
		gl.uniform1f(this.u_Kd, 0.7);
		gl.uniform1f(this.u_Ks, 1.0);
		gl.uniform1f(this.u_shininess, 10.0);

		gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
		gl.uniformMatrix4fv(this.u_modelMatrix, false, this.modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_normalMatrix, false, this.normalMatrix.elements);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.drawArrays(gl.TRIANGLES, 0, this.nVertex);
	}

	private mouseMove(evt: MouseEvent) {
		if (evt.buttons & 1) {
			this.angleX += evt.movementX;
			this.angleY += evt.movementY;
		}
	}

	private mouseWheel(evt: WheelEvent) {
		evt.preventDefault();
		this.cameraZ += evt.deltaY * 0.1;
		this.cameraZ = Math.max(Math.min(this.cameraZ, 100), 1);
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
	const lab = new Lab06("#webgl");
	lab.start();
}

main();
