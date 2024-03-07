import { Program } from "../../lab00/src/program";
import FSHADER_SOURCE from "./fshader.glsl?raw";
import { Screen } from "./screen";
import VSHADER_SOURCE from "./vshader.glsl?raw";

main();

async function main() {
	simple();
	interactive();
}

function simple() {
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

	const points: [x: number, y: number, color: [number, number, number]][] = [
		[0.5, -0.5, [0.0, 0.0, 1.0]],
		[-0.5, -0.5, [1.0, 1.0, 1.0]],
		[0.5, 0.5, [1.0, 1.0, 1.0]],
		[-0.5, 0.5, [1.0, 0.0, 0.0]],
	];

	requestAnimationFrame(function render() {
		screen.clear(0.0, 0.0, 0.0, 1.0);
		screen.triangleStrip(program, points);
		requestAnimationFrame(render);
	});
}

function interactive() {
	const canvas = document.querySelector<HTMLCanvasElement>("#webgl2");
	if (canvas === null) {
		throw new Error("Failed to retrieve the <canvas> element");
	}

	const screen = new Screen(canvas);
	const program = new Program(screen.gl)
		.compile(WebGL2RenderingContext.FRAGMENT_SHADER, FSHADER_SOURCE)
		.compile(WebGL2RenderingContext.VERTEX_SHADER, VSHADER_SOURCE)
		.link();
	screen.use(program);

	let color: [number, number, number] = [1.0, 1.0, 1.0];
	let pointer: [x: number, y: number] = [0.0, 0.0];
	const points: [x: number, y: number, color: [number, number, number]][] = [];

	canvas.addEventListener("click", (evt) => {
		if (!(evt.target instanceof HTMLCanvasElement)) {
			throw new Error("Failed to get the target of the event");
		}

		const rect = evt.target.getBoundingClientRect();
		const x = -1 + ((evt.clientX - rect.left) / rect.width) * 2;
		const y = 1 - ((evt.clientY - rect.top) / rect.height) * 2;

		points.push([x, y, color]);
		color = [Math.random() / 2 + 0.5, Math.random() / 2 + 0.5, 0].sort(
			() => Math.random() - 0.5,
		) as [number, number, number];
	});

	canvas.addEventListener("mousemove", (evt) => {
		if (!(evt.target instanceof HTMLCanvasElement)) {
			throw new Error("Failed to get the target of the event");
		}

		const rect = evt.target.getBoundingClientRect();
		const x = -1 + ((evt.clientX - rect.left) / rect.width) * 2;
		const y = 1 - ((evt.clientY - rect.top) / rect.height) * 2;

		pointer = [x, y];
	});
	canvas.addEventListener("mouseleave", () => {
		pointer = [0.0, 0.0];
	});

	requestAnimationFrame(function render() {
		screen.clear(0.0, 0.0, 0.0, 1.0);
		screen.triangleStrip(program, points);
		for (const [x, y, color] of points.slice(-2)) {
			screen.point(program, x, y, [...color, 1]);
		}

		screen.point(program, pointer[0], pointer[1], [...color, 1.0]);
		requestAnimationFrame(render);
	});
}
