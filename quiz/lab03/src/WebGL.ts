import { Program } from "../../lab00/src/program";
import { Matrix4 } from "./cuon-matrix";
import FSHADER_SOURCE from "./fshader.glsl?raw";
import { Screen } from "./screen";
import VSHADER_SOURCE from "./vshader.glsl?raw";

//NOTE: You are NOT allowed to change the vertex information here
const triangleVerticesA = [0.0, 0.2, 0.0, -0.1, -0.3, 0.0, 0.1, -0.3, 0.0]; //green rotating triangle vertices
const triangleColorA = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]; //green trotating riangle color

//NOTE: You are NOT allowed to change the vertex information here
const triangleVerticesB = [0.0, 0.0, 0.0, -0.1, -0.5, 0.0, 0.1, -0.5, 0.0]; //green rotating triangle vertices
const triangleColorB = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]; //green trotating riangle color

let triangle1XMove = 0;
let triangle2Angle = 125;
let triangle2HeightScale = 1;
let triangle3Angle = 0;

const mat = new Matrix4();

main();

async function main() {
	const canvas = document.querySelector<HTMLCanvasElement>("#webgl");
	if (canvas === null) {
		throw new Error("Failed to retrieve the <canvas> element");
	}

	const screen = new Screen(canvas);
	const program = new Program(screen.gl)
		.compile(WebGL2RenderingContext.FRAGMENT_SHADER, FSHADER_SOURCE)
		.compile(WebGL2RenderingContext.VERTEX_SHADER, VSHADER_SOURCE)
		.link();
	screen.use(program);

	const a_Position = screen.gl.getAttribLocation(program, "a_Position");
	const a_Color = screen.gl.getAttribLocation(program, "a_Color");
	const u_modelMatrix = screen.gl.getUniformLocation(program, "u_modelMatrix");
	if (a_Position < 0 || a_Color < 0 || u_modelMatrix === null) {
		throw new Error(
			"Failed to get the storage location of a_Position, a_Color, or u_modelMatrix",
		);
	}

	/////create vertex buffer of rotating point, center points, rotating triangle for later use
	const triangleModelA = initVertexBufferForLaterUse(
		screen.gl,
		triangleVerticesA,
		triangleColorA,
	);
	const triangleModelB = initVertexBufferForLaterUse(
		screen.gl,
		triangleVerticesB,
		triangleColorB,
	);

	const keys = new Set(["a", "d", "r", "l", "s", "o"]);
	const pressed = new Set();

	document.addEventListener("keydown", (event) => {
		const key = event.key.toLowerCase();
		if (keys.has(key)) {
			pressed.add(key);
		}
	});

	document.addEventListener("keyup", (event) => {
		const key = event.key.toLowerCase();
		if (keys.has(key)) {
			pressed.delete(key);
		}
	});

	function update() {
		if (pressed.has("a")) {
			// move triangle1 to the left
			console.log("A");
			triangle1XMove = Math.max(triangle1XMove - 0.02, -1);
		}
		if (pressed.has("d")) {
			// move triangle1 to the right
			console.log("D");
			triangle1XMove = Math.min(triangle1XMove + 0.02, 1);
		}
		if (pressed.has("r")) {
			// rotate the second triangle
			console.log("R");
			triangle2Angle += 10;
		}
		if (pressed.has("l")) {
			// elongate the second triangle
			console.log("L");
			triangle2HeightScale = Math.min(triangle2HeightScale + 0.02, 2);
		}
		if (pressed.has("s")) {
			// shorten the second triangle
			console.log("S");
			triangle2HeightScale = Math.max(triangle2HeightScale - 0.02, 0.1);
		}
		if (pressed.has("o")) {
			// rotate the third triangle
			console.log("O");
			triangle3Angle += 10;
		}
	}

	requestAnimationFrame(function render() {
		update();
		draw(screen.gl, a_Position, a_Color, u_modelMatrix, triangleModelA, triangleModelB);
		requestAnimationFrame(render);
	});
}

function draw(
	gl: WebGLRenderingContext,
	a_Position: number,
	a_Color: number,
	u_modelMatrix: WebGLUniformLocation,
	triangleModelA: ReturnType<typeof initVertexBufferForLaterUse>,
	triangleModelB: ReturnType<typeof initVertexBufferForLaterUse>,
) {
	////clear background color by black
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	mat.setIdentity(); //set identity matrix to transformMat

	//Note: You are NOT Allowed to change the following code
	mat.translate(triangle1XMove, 0, 0);
	initAttributeVariable(gl, a_Position, triangleModelA.vertexBuffer); //set triangle  vertex to shader varibale
	initAttributeVariable(gl, a_Color, triangleModelA.colorBuffer); //set triangle  color to shader varibale
	gl.uniformMatrix4fv(u_modelMatrix, false, mat.elements); //pass current transformMat to shader
	gl.drawArrays(gl.TRIANGLES, 0, triangleModelA.numVertices); //draw a triangle using triangleModelA
	////////////// END: draw the first triangle

	//////////TODO: draw the other 2 triangles////////////////
	/////////The code segment from here to the end of draw() function
	/////////   is the only code segment you are allowed to change in this practice
	// @ts-expect-error
	mat.translate(...triangleVerticesA.slice(0, 3)); // move to the center of the first triangle
	mat.rotate(triangle2Angle, 0, 0, 1); // rotate the second triangle
	mat.scale(1, triangle2HeightScale, 1); // scale the second triangle
	initAttributeVariable(gl, a_Position, triangleModelB.vertexBuffer); // set triangle vertex to shader variable
	initAttributeVariable(gl, a_Color, triangleModelB.colorBuffer); // set triangle color to shader variable
	gl.uniformMatrix4fv(u_modelMatrix, false, mat.elements); // pass current transformMat to shader
	gl.drawArrays(gl.TRIANGLES, 0, triangleModelB.numVertices); // draw a triangle using triangleModelB

	// @ts-expect-errorpnpm
	mat.translate(...triangleVerticesB.slice(6, 9)); // move to the center of the second triangle
	mat.scale(1, 1 / triangle2HeightScale, 1); // reset the scale
	mat.rotate(triangle3Angle, 0, 0, 1); // rotate the third triangle
	initAttributeVariable(gl, a_Position, triangleModelB.vertexBuffer); // set triangle vertex to shader variable
	initAttributeVariable(gl, a_Color, triangleModelB.colorBuffer); // set triangle color to shader variable
	gl.uniformMatrix4fv(u_modelMatrix, false, mat.elements); // pass current transformMat to shader
	gl.drawArrays(gl.TRIANGLES, 0, triangleModelB.numVertices); // draw a triangle using triangleModelA
}

function initAttributeVariable(
	gl: WebGLRenderingContext,
	a_attribute: number,
	x: { buffer: WebGLBuffer; num: number; type: number },
) {
	gl.bindBuffer(gl.ARRAY_BUFFER, x.buffer);
	gl.vertexAttribPointer(a_attribute, x.num, x.type, false, 0, 0);
	gl.enableVertexAttribArray(a_attribute);
}

function initArrayBufferForLaterUse(
	gl: WebGLRenderingContext,
	data: Float32Array,
	num: number,
	type: number,
) {
	// Create a buffer object
	const buffer = gl.createBuffer();
	if (!buffer) {
		throw new Error("Failed to create the buffer object");
	}
	// Write date into the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	// Store the necessary information to assign the object to the attribute variable later
	return { buffer, num, type };
}

function initVertexBufferForLaterUse(
	gl: WebGLRenderingContext,
	vertices: number[],
	colors: number[],
) {
	const nVertices = vertices.length / 3;

	const o = {
		vertexBuffer: initArrayBufferForLaterUse(gl, new Float32Array(vertices), 3, gl.FLOAT),
		colorBuffer: initArrayBufferForLaterUse(gl, new Float32Array(colors), 3, gl.FLOAT),
		numVertices: nVertices,
	};
	if (!o.vertexBuffer || !o.colorBuffer) {
		console.log("Error: in initVertexBufferForLaterUse(gl, vertices, colors)");
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	return o;
}
