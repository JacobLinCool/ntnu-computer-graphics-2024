import { Program } from "../../lab00/src/program";
import FSHADER_SOURCE from "./fshader.glsl?raw";
import { Screen } from "./screen";
import VSHADER_SOURCE from "./vshader.glsl?raw";

main();

async function main() {
	simple();
	animated();
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

	const points: [x: number, y: number, color: [number, number, number, number]][] = [];
	canvas.addEventListener("click", (evt) => {
		if (!(evt.target instanceof HTMLCanvasElement)) {
			throw new Error("Failed to get the target of the event");
		}

		const rect = evt.target.getBoundingClientRect();
		const x = -1 + ((evt.clientX - rect.left) / rect.width) * 2;
		const y = 1 - ((evt.clientY - rect.top) / rect.height) * 2;

		let color: [number, number, number, number];
		if (x >= 0.0 && y >= 0.0) {
			color = [1.0, 0.0, 0.0, 1.0]; // red
		} else if (x < 0.0 && y < 0.0) {
			color = [0.0, 1.0, 0.0, 1.0]; // green
		} else if (x < 0.0 && y >= 0.0) {
			color = [0.0, 0.0, 1.0, 1.0]; // blud
		} else {
			color = [1.0, 1.0, 1.0, 1.0]; // white
		}
		points.push([x, y, color]);
	});

	requestAnimationFrame(function render() {
		screen.clear(0.0, 0.0, 0.0, 1.0);
		for (const [x, y, color] of points) {
			screen.point(program, x, y, color);
		}
		requestAnimationFrame(render);
	});
}

function animated() {
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

	const points: [
		x: number,
		y: number,
		color: [number, number, number, number],
		v: [dx: number, dy: number],
	][] = [];
	canvas.addEventListener("click", (evt) => {
		if (!(evt.target instanceof HTMLCanvasElement)) {
			throw new Error("Failed to get the target of the event");
		}

		const rect = evt.target.getBoundingClientRect();
		const x = -1 + ((evt.clientX - rect.left) / rect.width) * 2;
		const y = 1 - ((evt.clientY - rect.top) / rect.height) * 2;

		let color: [number, number, number, number];
		let v: [number, number];
		if (x >= 0.0 && y >= 0.0) {
			color = [1.0, 0.0, 0.0, 1.0];
			v = [-0.01, -0.01];
		} else if (x < 0.0 && y < 0.0) {
			color = [0.0, 1.0, 0.0, 1.0];
			v = [0.01, 0.01];
		} else if (x < 0.0 && y >= 0.0) {
			color = [0.0, 0.0, 1.0, 1.0];
			v = [0.01, -0.01];
		} else {
			color = [1.0, 1.0, 1.0, 1.0];
			v = [-0.01, 0.01];
		}
		points.push([x, y, color, v]);
	});

	requestAnimationFrame(function render() {
		screen.clear(0.0, 0.0, 0.0, 1.0);
		for (const point of points) {
			point[0] += point[3][0];
			point[1] += point[3][1];
			if (point[0] >= 1.0 || point[0] <= -1.0) {
				point[3][0] = -point[3][0];
			}
			if (point[1] >= 1.0 || point[1] <= -1.0) {
				point[3][1] = -point[3][1];
			}

			screen.point(program, point[0], point[1], point[2]);
		}
		requestAnimationFrame(render);
	});
}
