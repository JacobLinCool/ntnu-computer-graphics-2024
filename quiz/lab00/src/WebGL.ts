import FSHADER_SOURCE from "./fshader.glsl?raw";
import { Program } from "./program";
import { Screen } from "./screen";
import VSHADER_SOURCE from "./vshader.glsl?raw";

main();

async function main() {
	const canvas1 = document.querySelector<HTMLCanvasElement>("#webgl");
	if (canvas1 === null) {
		throw new Error("Failed to retrieve the <canvas> element");
	}

	const screen1 = new Screen(canvas1);
	const program = new Program(screen1.gl)
		.compile(WebGL2RenderingContext.FRAGMENT_SHADER, FSHADER_SOURCE)
		.compile(WebGL2RenderingContext.VERTEX_SHADER, VSHADER_SOURCE)
		.link();
	screen1.use(program);

	screen1.clear(0.0, 1.0, 0.0, 1.0);
	screen1.triangle(program, [
		[0, -0.5],
		[0.5, 0.5],
		[-0.5, 0.5],
	]);

	const canvas2 = document.querySelector<HTMLCanvasElement>("#webgl2");
	if (canvas2 === null) {
		throw new Error("Failed to retrieve the <canvas> element");
	}

	const screen2 = new Screen(canvas2);
	const program2 = new Program(screen2.gl)
		.compile(WebGL2RenderingContext.FRAGMENT_SHADER, FSHADER_SOURCE)
		.compile(WebGL2RenderingContext.VERTEX_SHADER, VSHADER_SOURCE)
		.link();
	screen2.use(program2);

	let angle = 0,
		size = 1;
	requestAnimationFrame(function tick() {
		render(screen2, program2, angle, size);

		angle += 0.1;
		size += 0.01;

		requestAnimationFrame(tick);
	});
}

function render(screen: Screen, program: WebGLProgram, angle: number, size: number) {
	const x1 = Math.cos(angle) * Math.sin(size),
		y1 = Math.sin(angle) * Math.sin(size);
	const x2 = Math.cos(angle + (Math.PI * 2) / 3) * Math.sin(size),
		y2 = Math.sin(angle + (Math.PI * 2) / 3) * Math.sin(size);
	const x3 = Math.cos(angle + (Math.PI * 2 * 2) / 3) * Math.sin(size),
		y3 = Math.sin(angle + (Math.PI * 2 * 2) / 3) * Math.sin(size);

	screen.clear(0.0, 1.0, 0.0, 1.0);
	screen.triangle(program, [
		[x1, y1],
		[x2, y2],
		[x3, y3],
	]);
}
