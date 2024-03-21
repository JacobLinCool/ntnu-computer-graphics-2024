import { Renderer } from "library";
import { Matrix4, Vector4 } from "library/cuon-matrix";
import FSHADER_SOURCE from "./fshader.glsl?raw";
import VSHADER_SOURCE from "./vshader.glsl?raw";

//NOTE: You are NOT allowed to change the vertex information here
const triangleVerticesA = [0.0, 0.2, 0.0, -0.1, -0.3, 0.0, 0.1, -0.3, 0.0]; //green rotating triangle vertices
const triangleColorA = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]; //green trotating riangle color

//NOTE: You are NOT allowed to change the vertex information here
const triangleVerticesB = [0.0, 0.0, 0.0, -0.1, -0.5, 0.0, 0.1, -0.5, 0.0]; //green rotating triangle vertices
const triangleColorB = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]; //green trotating riangle color

let triangle1XMove = 0;
let triangle1YMove = 0;
let triangle2Angle = 125;
let triangle3Angle = 0;
let circleXMove = 0;
let circleYMove = 0;
// let circleAngle = 0;
let grabbing = false;
let touched = false;

const matActor = new Matrix4();
const matCircle = new Matrix4().setTranslate(0.5, 0, 0);

class Circle {
	vertices: number[] = [];
	colors: number[] = [];
	touch: number[] = [];
	grab: number[] = [];
	radius: number = 0.1;

	constructor(resolution: number) {
		for (let i = 0; i <= resolution; i++) {
			const x = this.radius * Math.cos((i * 2 * Math.PI) / 200);
			const y = this.radius * Math.sin((i * 2 * Math.PI) / 200);
			this.vertices.push(x, y);
			this.colors.push(1, 0, 0); //circle normal color
			this.touch.push(0, 1, 0); //color when the circle connect with the triangle corner
			this.grab.push(0, 0.5, 0); //color when the circle is grabbed by the triangle corner
		}
	}
}

const circle = new Circle(1000);

main();

async function main() {
	const renderer = new Renderer("#webgl");
	const program = renderer.compiler
		.compileFragment(FSHADER_SOURCE)
		.compileVertex(VSHADER_SOURCE)
		.link();
	renderer.use(program);

	const a_Position = renderer.gl.getAttribLocation(program, "a_Position");
	const a_Color = renderer.gl.getAttribLocation(program, "a_Color");
	const u_modelMatrix = renderer.gl.getUniformLocation(program, "u_modelMatrix");
	if (a_Position < 0 || a_Color < 0 || u_modelMatrix === null) {
		throw new Error(
			"Failed to get the storage location of a_Position, a_Color, or u_modelMatrix",
		);
	}

	/////create vertex buffer of rotating point, center points, rotating triangle for later use
	const triangleModelA = initVertexBufferForLaterUse(
		renderer.gl,
		triangleVerticesA,
		triangleColorA,
	);
	const triangleModelB = initVertexBufferForLaterUse(
		renderer.gl,
		triangleVerticesB,
		triangleColorB,
	);

	const circleModel = initVertexBufferForLaterUse(renderer.gl, circle.vertices, circle.colors);
	const circleModelTouch = initVertexBufferForLaterUse(
		renderer.gl,
		circle.vertices,
		circle.touch,
	);
	const circleModelGrab = initVertexBufferForLaterUse(renderer.gl, circle.vertices, circle.grab);

	const keys = new Set(["a", "d", "s", "w", "r", "l", "s", "o"]);
	const pressed = new Set();

	document.addEventListener("keydown", (event) => {
		const key = event.key.toLowerCase();
		if (keys.has(key)) {
			pressed.add(key);
		}

		if (key === "g" && touched) {
			grabbing = !grabbing;
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
			triangle1XMove = Math.max(triangle1XMove - 0.02, -1);
			if (grabbing) {
				circleXMove = Math.max(circleXMove - 0.02, -1);
			}
		}
		if (pressed.has("d")) {
			// move triangle1 to the right
			triangle1XMove = Math.min(triangle1XMove + 0.02, 1);
		}
		if (pressed.has("s")) {
			// move triangle1 down
			triangle1YMove = Math.max(triangle1YMove - 0.02, -1);
		}
		if (pressed.has("w")) {
			// move triangle1 up
			triangle1YMove = Math.min(triangle1YMove + 0.02, 1);
		}
		if (pressed.has("r")) {
			// rotate the second triangle
			triangle2Angle += 3;
		}
	}

	requestAnimationFrame(function render() {
		update();
		draw(
			renderer.gl,
			a_Position,
			a_Color,
			u_modelMatrix,
			triangleModelA,
			triangleModelB,
			circleModel,
			circleModelTouch,
			circleModelGrab,
		);
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
	circleModel: ReturnType<typeof initVertexBufferForLaterUse>,
	circleModelTouch: ReturnType<typeof initVertexBufferForLaterUse>,
	circleModelGrab: ReturnType<typeof initVertexBufferForLaterUse>,
) {
	////clear background color by black
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	matActor.setIdentity(); //set identity matrix to transformMat

	//Note: You are NOT Allowed to change the following code
	matActor.translate(triangle1XMove, triangle1YMove, 0);
	initAttributeVariable(gl, a_Position, triangleModelA.vertexBuffer); //set triangle  vertex to shader varibale
	initAttributeVariable(gl, a_Color, triangleModelA.colorBuffer); //set triangle  color to shader varibale
	gl.uniformMatrix4fv(u_modelMatrix, false, matActor.elements); //pass current transformMat to shader
	gl.drawArrays(gl.TRIANGLES, 0, triangleModelA.numVertices); //draw a triangle using triangleModelA
	////////////// END: draw the first triangle

	/////////The code segment from here to the end of draw() function
	/////////   is the only code segment you are allowed to change in this practice
	// @ts-expect-error
	matActor.translate(...triangleVerticesA.slice(0, 3)); // move to the center of the first triangle
	matActor.rotate(triangle2Angle, 0, 0, 1); // rotate the second triangle
	initAttributeVariable(gl, a_Position, triangleModelB.vertexBuffer); // set triangle vertex to shader variable
	initAttributeVariable(gl, a_Color, triangleModelB.colorBuffer); // set triangle color to shader variable
	gl.uniformMatrix4fv(u_modelMatrix, false, matActor.elements); // pass current transformMat to shader
	gl.drawArrays(gl.TRIANGLES, 0, triangleModelB.numVertices); // draw a triangle using triangleModelB

	const [x1, y1] = matActor.multiplyVector4(
		new Vector4([...triangleVerticesB.slice(0, 3), 1]),
	).elements;
	const [x2, y2] = matActor.multiplyVector4(
		new Vector4([...triangleVerticesB.slice(3, 6), 1]),
	).elements;
	const [x3, y3] = matActor.multiplyVector4(
		new Vector4([...triangleVerticesB.slice(6, 9), 1]),
	).elements;

	///////TODO: calculate whenther the triangle corner and the circle touch each other
	///////      show the circle by different color according to the touch-grab conditions
	///////      Draw the circle and its triangle and the proper locations
	let transformMat = new Matrix4(matCircle); //set identity matrix to
	if (grabbing) {
		transformMat = matActor;
		// @ts-expect-error
		transformMat.translate(...triangleVerticesB.slice(6, 9));
	} else {
		transformMat.translate(circleXMove, circleYMove, 0);
	}

	const [px, py] = transformMat.multiplyVector4(new Vector4([0, 0, 0, 1])).elements;
	circleXMove = px - 0.5;
	circleYMove = py;
	const d1 = Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
	const d2 = Math.sqrt((px - x2) ** 2 + (py - y2) ** 2);
	const d3 = Math.sqrt((px - x3) ** 2 + (py - y3) ** 2);
	touched = d1 < circle.radius || d2 < circle.radius || d3 < circle.radius;
	if (touched) {
		if (!grabbing) {
			initAttributeVariable(gl, a_Color, circleModelTouch.colorBuffer); // set circle touch color to shader variables
		} else {
			initAttributeVariable(gl, a_Color, circleModelGrab.colorBuffer); // set circle grab color to shader variablesd
		}
	} else {
		initAttributeVariable(gl, a_Color, circleModel.colorBuffer); //set circle normal color to shader varibale
	}

	initAttributeVariable(gl, a_Position, circleModel.vertexBuffer); //set circle  vertex to shader varibale
	gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements); //pass current transformMat to shader
	gl.drawArrays(gl.TRIANGLES, 0, circleModel.numVertices); //draw the triangle

	triangle3Angle++; //keep changing the angle of the triangle
	transformMat.rotate(triangle3Angle, 0, 0, 1);
	initAttributeVariable(gl, a_Position, triangleModelB.vertexBuffer); //set triangle  vertex to shader varibale
	initAttributeVariable(gl, a_Color, triangleModelB.colorBuffer); //set triangle  color to shader varibale

	gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements); //pass current transformMat to shader
	gl.drawArrays(gl.TRIANGLES, 0, triangleModelB.numVertices); //draw the triangle
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
