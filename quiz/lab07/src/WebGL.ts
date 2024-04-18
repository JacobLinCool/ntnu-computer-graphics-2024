import { Renderer } from "library";
import { Matrix4 } from "library/cuon-matrix";
import FSHADER_SOURCE from "./fshader.glsl?raw";
import MARIO from "./mario.obj?raw";
import SONIC from "./sonic.obj?raw";
import VSHADER_SOURCE from "./vshader.glsl?raw";

type ExtWebGLBuffer = WebGLBuffer & { num: number; type: number };

interface Model {
	vertexBuffer: ExtWebGLBuffer;
	normalBuffer: ExtWebGLBuffer;
	texCoordBuffer: ExtWebGLBuffer;
	numVertices: number;
}

class Lab07 {
	private renderer: Renderer;
	private a_Normal: number;
	private a_Position: number;
	private u_MvpMatrix: WebGLUniformLocation;
	private u_modelMatrix: WebGLUniformLocation;
	private u_normalMatrix: WebGLUniformLocation;
	private u_LightPosition: WebGLUniformLocation;
	private u_ViewPosition: WebGLUniformLocation;
	private u_Ka: WebGLUniformLocation;
	private u_Kd: WebGLUniformLocation;
	private u_Ks: WebGLUniformLocation;
	private u_shininess: WebGLUniformLocation;
	private u_Color: WebGLUniformLocation;
	private mvpMatrix = new Matrix4();
	private modelMatrix = new Matrix4();
	private normalMatrix = new Matrix4();
	private marioModels: Model[] = [];
	private sonicModels: Model[] = [];
	private cube: Model[] = [];

	private angleX = 0;
	private angleY = 0;
	private cameraX = 3;
	private cameraY = 3;
	private cameraZ = 7;
	private moveDistance = 0;
	private rotateAngle = 0;

	constructor(canvasSelector: string, moveSelector: string, rotateSelector: string) {
		const renderer = new Renderer(canvasSelector);
		const program = renderer.compiler
			.compileFragment(FSHADER_SOURCE)
			.compileVertex(VSHADER_SOURCE)
			.link();
		renderer.use(program);

		renderer.gl.enable(renderer.gl.DEPTH_TEST);

		renderer.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
		renderer.canvas.addEventListener("wheel", this.mouseWheel.bind(this), { passive: false });

		this.renderer = renderer;

		const a_Position = renderer.gl.getAttribLocation(program, "a_Position");
		if (a_Position < 0) {
			throw new Error("Failed to get the storage location of a_Position");
		}
		this.a_Position = a_Position;

		const a_Normal = renderer.gl.getAttribLocation(program, "a_Normal");
		if (a_Normal < 0) {
			throw new Error("Failed to get the storage location of a_Normal");
		}
		this.a_Normal = a_Normal;

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

		const u_Color = renderer.gl.getUniformLocation(program, "u_Color");
		if (!u_Color) {
			throw new Error("Failed to get the storage location of u_Color");
		}
		this.u_Color = u_Color;

		const mario = parseOBJ(MARIO);
		this.marioModels = mario.geometries.map((geo) =>
			this.initVertexBufferForLaterUse(geo.data.position, geo.data.normal, geo.data.texcoord),
		);

		const sonic = parseOBJ(SONIC);
		this.sonicModels = sonic.geometries.map((geo) =>
			this.initVertexBufferForLaterUse(geo.data.position, geo.data.normal, geo.data.texcoord),
		);

		////cube
		//TODO-1: create vertices for the cube whose edge length is 2.0 (or 1.0 is also fine)
		//F: Face, T: Triangle, V: vertex (XYZ)
		const cubeVertices: number[] = [
			//F1_T1_V1,  F1_T1_V2,  F1_T1_V3,  F1_T2_V4,  F1_T2_V5,  F1_T2_V6,   //this row for the face z = 1.0
			1.0,
			1.0,
			1.0,
			-1.0,
			1.0,
			1.0,
			-1.0,
			-1.0,
			1.0, //F1_T1_V1,  F1_T1_V2,  F1_T1_V3
			-1.0,
			-1.0,
			1.0,
			1.0,
			-1.0,
			1.0,
			1.0,
			1.0,
			1.0, //F1_T2_V4,  F1_T2_V5,  F1_T2_V6

			//F2_T1_V1,  F2_T1_V2,  F2_T1_V3,  F2_T2_V4,  F2_T2_V5,  F2_T2_V6,   //this row for the face x = 1.0
			1.0,
			1.0,
			1.0,
			1.0,
			-1.0,
			1.0,
			1.0,
			-1.0,
			-1.0, //F2_T1_V1,  F2_T1_V2,  F2_T1_V3
			1.0,
			-1.0,
			-1.0,
			1.0,
			1.0,
			-1.0,
			1.0,
			1.0,
			1.0, //F2_T2_V4,  F2_T2_V5,  F2_T2_V6

			//F3_T1_V1,  F3_T1_V2,  F3_T1_V3,  F3_T2_V4,  F3_T2_V5,  F3_T2_V6,   //this row for the face y = 1.0
			1.0,
			1.0,
			1.0,
			1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			-1.0, //F3_T1_V1,  F3_T1_V2,  F3_T1_V3
			-1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			1.0,
			1.0,
			1.0,
			1.0, //F3_T2_V4,  F3_T2_V5,  F3_T2_V6

			//F4_T1_V1,  F4_T1_V2,  F4_T1_V3,  F4_T2_V4,  F4_T2_V5,  F4_T2_V6,   //this row for the face x = -1.0
			-1.0,
			1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			-1.0,
			-1.0,
			-1.0, //F4_T1_V1,  F4_T1_V2,  F4_T1_V3
			-1.0,
			-1.0,
			-1.0,
			-1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			1.0, //F4_T2_V4,  F4_T2_V5,  F4_T2_V6

			//F5_T1_V1,  F5_T1_V2,  F5_T1_V3,  F5_T2_V4,  F5_T2_V5,  F5_T2_V6,   //this row for the face y = -1.0
			1.0,
			-1.0,
			1.0,
			1.0,
			-1.0,
			-1.0,
			-1.0,
			-1.0,
			-1.0, //F5_T1_V1,  F5_T1_V2,  F5_T1_V3
			-1.0,
			-1.0,
			-1.0,
			-1.0,
			-1.0,
			1.0,
			1.0,
			-1.0,
			1.0, //F5_T2_V4,  F5_T2_V5,  F5_T2_V6

			//F6_T1_V1,  F6_T1_V2,  F6_T1_V3,  F6_T2_V4,  F6_T2_V5,  F6_T2_V6,   //this row for the face z = -1.0
			1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			-1.0,
			-1.0,
			-1.0,
			-1.0, //F6_T1_V1,  F6_T1_V2,  F6_T1_V3
			-1.0,
			-1.0,
			-1.0,
			1.0,
			-1.0,
			-1.0,
			1.0,
			1.0,
			-1.0, //F6_T2_V4,  F6_T2_V5,  F6_T2_V6
		];
		const cubeNormals = getNormalOnVertices(cubeVertices);
		this.cube.push(this.initVertexBufferForLaterUse(cubeVertices, cubeNormals, cubeVertices));

		const move = document.querySelector<HTMLInputElement>(moveSelector);
		if (move) {
			move.addEventListener("input", () => {
				this.moveDistance = parseFloat(move.value) / 100;
			});
		}

		const rotate = document.querySelector<HTMLInputElement>(rotateSelector);
		if (rotate) {
			rotate.addEventListener("input", () => {
				this.rotateAngle = parseFloat(rotate.value);
			});
		}
	}

	private initVertexBufferForLaterUse(
		vertices: number[],
		normals: number[],
		texCoords: number[],
	): Model {
		const numVertices = vertices.length / 3;

		const vertexBuffer = this.initArrayBuffer(
			new Float32Array(vertices),
			3,
			this.renderer.gl.FLOAT,
		);
		const normalBuffer = this.initArrayBuffer(
			new Float32Array(normals),
			3,
			this.renderer.gl.FLOAT,
		);
		const texCoordBuffer = this.initArrayBuffer(
			new Float32Array(texCoords),
			2,
			this.renderer.gl.FLOAT,
		);

		console.log("numVertices", numVertices);
		console.log("vertices", vertices);
		console.log("normals", normals);

		return {
			vertexBuffer,
			normalBuffer,
			texCoordBuffer,
			numVertices,
		};
	}

	private initArrayBuffer(data: Float32Array, num: number, type: number): ExtWebGLBuffer {
		const gl = this.renderer.gl;

		const buffer = this.createBuffer(gl, data);
		if (!buffer) {
			throw new Error("Failed to create the buffer object");
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

		return Object.assign(buffer, { num, type });
	}

	public start() {
		return this.renderer.render(this.render.bind(this));
	}

	public render() {
		this.renderer.clear(0, 0, 0);

		const gl = this.renderer.gl;
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		//Cube (ground)
		//TODO-1: set mdlMatrix for the cube
		this.drawOneObject(this.cube, new Matrix4().scale(2, 0.1, 2), 1.0, 0.4, 0.4);

		//mario
		//TODO-2: set mdlMatrix for mario
		//drawOneObject(mario, mdlMatrix, 0.4, 1.0, 0.4);
		this.drawOneObject(
			this.marioModels,
			new Matrix4().translate(-1.0, 0.7, -1.0).scale(0.01, 0.01, 0.01),
			0.4,
			1.0,
			0.4,
		);

		//sonic
		//TODO-3: set mdlMatrix for sonic (include rotation and movement)
		//drawOneObject(sonic, mdlMatrix, 0.4, 0.4, 1.0);
		this.drawOneObject(
			this.sonicModels,
			new Matrix4()
				.translate(this.moveDistance, 0.1, 0.0)
				.rotate(this.rotateAngle, 0.0, 1.0, 0.0)
				.scale(0.05, 0.05, 0.05),
			0.4,
			0.4,
			1.0,
		);
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

	private drawOneObject(
		obj: Model[],
		mdlMatrix: Matrix4,
		colorR: number,
		colorG: number,
		colorB: number,
	) {
		const gl = this.renderer.gl;
		//model Matrix (part of the mvp matrix)
		this.modelMatrix.setRotate(this.angleY, 1, 0, 0); //for mouse rotation
		this.modelMatrix.rotate(this.angleX, 0, 1, 0); //for mouse rotation
		this.modelMatrix.multiply(mdlMatrix);
		//mvp: projection * view * model matrix
		this.mvpMatrix.setPerspective(30, 1, 1, 100);
		this.mvpMatrix.lookAt(this.cameraX, this.cameraY, this.cameraZ, 0, 0, 0, 0, 1, 0);
		this.mvpMatrix.multiply(this.modelMatrix);

		//normal matrix
		this.normalMatrix.setInverseOf(this.modelMatrix);
		this.normalMatrix.transpose();

		gl.uniform3f(this.u_LightPosition, 0, 5, 3);
		gl.uniform3f(this.u_ViewPosition, this.cameraX, this.cameraY, this.cameraZ);
		gl.uniform1f(this.u_Ka, 0.2);
		gl.uniform1f(this.u_Kd, 0.7);
		gl.uniform1f(this.u_Ks, 1.0);
		gl.uniform1f(this.u_shininess, 10.0);
		gl.uniform3f(this.u_Color, colorR, colorG, colorB);

		gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
		gl.uniformMatrix4fv(this.u_modelMatrix, false, this.modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_normalMatrix, false, this.normalMatrix.elements);

		for (let i = 0; i < obj.length; i++) {
			this.initAttributeVariable(this.a_Position, obj[i].vertexBuffer);
			this.initAttributeVariable(this.a_Normal, obj[i].normalBuffer);
			gl.drawArrays(gl.TRIANGLES, 0, obj[i].numVertices);
		}
	}

	initAttributeVariable(
		a_attribute: number,
		buffer: WebGLBuffer & { num: number; type: number },
	) {
		const gl = this.renderer.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
		gl.enableVertexAttribArray(a_attribute);
	}
}

async function main() {
	const lab = new Lab07("#webgl", "#move", "#rotate");
	lab.start();
}

main();

interface Geo {
	object: string;
	groups: string[];
	material: string;
	data: {
		position: number[];
		texcoord: number[];
		normal: number[];
	};
}

function parseOBJ(text: string) {
	// because indices are base 1 let's just fill in the 0th data
	const objPositions = [[0, 0, 0]];
	const objTexcoords = [[0, 0]];
	const objNormals = [[0, 0, 0]];

	// same order as `f` indices
	const objVertexData = [objPositions, objTexcoords, objNormals];

	// same order as `f` indices
	let webglVertexData: number[][] = [
		[], // positions
		[], // texcoords
		[], // normals
	];

	const materialLibs: string[] = [];
	const geometries: Geo[] = [];
	let geometry: Geo | undefined;
	let groups = ["default"];
	let material = "default";
	let object = "default";

	const noop = () => {};

	function newGeometry() {
		// If there is an existing geometry and it's
		// not empty then start a new one.
		if (geometry && geometry.data.position.length) {
			geometry = undefined;
		}
	}

	function setGeometry() {
		if (!geometry) {
			const position: number[] = [];
			const texcoord: number[] = [];
			const normal: number[] = [];
			webglVertexData = [position, texcoord, normal];
			geometry = {
				object,
				groups,
				material,
				data: {
					position,
					texcoord,
					normal,
				},
			};
			geometries.push(geometry);
		}
	}

	function addVertex(vert: string) {
		const ptn = vert.split("/");
		ptn.forEach((objIndexStr, i) => {
			if (!objIndexStr) {
				return;
			}
			const objIndex = parseInt(objIndexStr);
			const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
			webglVertexData[i].push(...objVertexData[i][index]);
		});
	}

	const keywords: Record<string, (parts: string[], unparsedArgs: string) => void> = {
		v(parts: string[]) {
			objPositions.push(parts.map(parseFloat));
		},
		vn(parts: string[]) {
			objNormals.push(parts.map(parseFloat));
		},
		vt(parts: string[]) {
			// should check for missing v and extra w?
			objTexcoords.push(parts.map(parseFloat));
		},
		f(parts: string[]) {
			setGeometry();
			const numTriangles = parts.length - 2;
			for (let tri = 0; tri < numTriangles; ++tri) {
				addVertex(parts[0]);
				addVertex(parts[tri + 1]);
				addVertex(parts[tri + 2]);
			}
		},
		s: noop, // smoothing group
		mtllib(parts: string[], unparsedArgs: string) {
			// the spec says there can be multiple filenames here
			// but many exist with spaces in a single filename
			materialLibs.push(unparsedArgs);
		},
		usemtl(parts: string[], unparsedArgs: string) {
			material = unparsedArgs;
			newGeometry();
		},
		g(parts: string[]) {
			groups = parts;
			newGeometry();
		},
		o(parts: string[], unparsedArgs: string) {
			object = unparsedArgs;
			newGeometry();
		},
	};

	const keywordRE = /(\w*)(?: )*(.*)/;
	const lines = text.split("\n");
	for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
		const line = lines[lineNo].trim();
		if (line === "" || line.startsWith("#")) {
			continue;
		}
		const m = keywordRE.exec(line);
		if (!m) {
			continue;
		}
		const [, keyword, unparsedArgs] = m;
		const parts = line.split(/\s+/).slice(1);
		const handler = keywords[keyword];
		if (!handler) {
			console.warn("unhandled keyword:", keyword); // eslint-disable-line no-console
			continue;
		}
		handler(parts, unparsedArgs);
	}

	// remove any arrays that have no entries.
	for (const geometry of geometries) {
		geometry.data = Object.fromEntries(
			Object.entries(geometry.data).filter(([, array]) => array.length > 0),
		) as Geo["data"];
	}

	return {
		geometries,
		materialLibs,
	};
}

function getNormalOnVertices(vertices: number[]) {
	var normals: number[] = [];
	var nTriangles = vertices.length / 9;
	for (let i = 0; i < nTriangles; i++) {
		var idx = i * 9 + 0 * 3;
		var p0x = vertices[idx + 0],
			p0y = vertices[idx + 1],
			p0z = vertices[idx + 2];
		idx = i * 9 + 1 * 3;
		var p1x = vertices[idx + 0],
			p1y = vertices[idx + 1],
			p1z = vertices[idx + 2];
		idx = i * 9 + 2 * 3;
		var p2x = vertices[idx + 0],
			p2y = vertices[idx + 1],
			p2z = vertices[idx + 2];

		var ux = p1x - p0x,
			uy = p1y - p0y,
			uz = p1z - p0z;
		var vx = p2x - p0x,
			vy = p2y - p0y,
			vz = p2z - p0z;

		var nx = uy * vz - uz * vy;
		var ny = uz * vx - ux * vz;
		var nz = ux * vy - uy * vx;

		var norm = Math.sqrt(nx * nx + ny * ny + nz * nz);
		nx = nx / norm;
		ny = ny / norm;
		nz = nz / norm;

		normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
	}
	return normals;
}
