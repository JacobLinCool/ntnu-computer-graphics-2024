import { Renderer } from "library";
import FSHADER_SOURCE from "./fshader.glsl?raw";
import VSHADER_SOURCE from "./vshader.glsl?raw";

type Spec = [x: number, y: number, z: number, r: number, g: number, b: number];

enum ShapeMode {
	Point,
	Square,
	Circle,
	Triangle,
}

enum ColorMode {
	Red,
	Green,
	Blue,
}

const ShapeMap = new Map<string, ShapeMode>([
	["point", ShapeMode.Point],
	["square", ShapeMode.Square],
	["circle", ShapeMode.Circle],
	["triangle", ShapeMode.Triangle],
]);

const ColorMap = new Map<string, ColorMode>([
	["red", ColorMode.Red],
	["green", ColorMode.Green],
	["blue", ColorMode.Blue],
]);

main();

async function main() {
	const brush = {
		shape: ShapeMode.Point,
		color: ColorMode.Red,
	};

	const shape = document.querySelector("#shape") as HTMLSelectElement;
	const color = document.querySelector("#color") as HTMLSelectElement;

	shape.addEventListener("change", () => {
		brush.shape = ShapeMap.get(shape.value) || ShapeMode.Point;
	});
	color.addEventListener("change", () => {
		brush.color = ColorMap.get(color.value) || ColorMode.Red;
	});

	const obj = {
		points: [] as Spec[],
		squares: [] as Spec[],
		circles: [] as Spec[],
		triangles: [] as Spec[],
	};

	const renderer = new Renderer("#webgl");
	const program = renderer.compiler
		.compileVertex(VSHADER_SOURCE)
		.compileFragment(FSHADER_SOURCE)
		.link();
	const painter = renderer.use(program);

	document.addEventListener("keydown", (evt) => {
		const key = evt.key.toLowerCase();
		if (key === "p") {
			brush.shape = ShapeMode.Point;
			shape.value = "point";
		} else if (key === "q") {
			brush.shape = ShapeMode.Square;
			shape.value = "square";
		} else if (key === "c") {
			brush.shape = ShapeMode.Circle;
			shape.value = "circle";
		} else if (key === "t") {
			brush.shape = ShapeMode.Triangle;
			shape.value = "triangle";
		} else if (key === "r") {
			brush.color = ColorMode.Red;
			color.value = "red";
		} else if (key === "g") {
			brush.color = ColorMode.Green;
			color.value = "green";
		} else if (key === "b") {
			brush.color = ColorMode.Blue;
			color.value = "blue";
		}
	});

	renderer.canvas.addEventListener("click", (evt) => {
		const rect = renderer.canvas.getBoundingClientRect();
		const x = -1 + ((evt.clientX - rect.left) / rect.width) * 2;
		const y = 1 - ((evt.clientY - rect.top) / rect.height) * 2;

		let specs: Spec[];
		if (brush.shape === ShapeMode.Point) {
			specs = obj.points;
		} else if (brush.shape === ShapeMode.Square) {
			specs = obj.squares;
		} else if (brush.shape === ShapeMode.Circle) {
			specs = obj.circles;
		} else if (brush.shape === ShapeMode.Triangle) {
			specs = obj.triangles;
		} else {
			throw new Error("Invalid shape mode");
		}

		specs.push([
			x,
			y,
			0,
			ColorMode.Red === brush.color ? 1 : 0,
			ColorMode.Green === brush.color ? 1 : 0,
			ColorMode.Blue === brush.color ? 1 : 0,
		]);
		if (specs.length > 3) {
			specs.shift();
		}
	});

	renderer.render(render);

	function render() {
		renderer.clear(0.0, 0.0, 0.0);
		painter.points(obj.points.map((p) => [...p, 5]));
		painter.points(obj.squares.map((p) => [...p, 20]));
		painter.circles(obj.circles.map((p) => [p[0], p[1], p[2], 0.1, 100, p[3], p[4], p[5]]));
		painter.triangles(
			obj.triangles.map((p) => {
				const [x, y, z, r, g, b] = p;
				return [
					[
						x + Math.cos(Math.PI / 2) * 0.1,
						y + Math.sin(Math.PI / 2) * 0.1,
						z,
						r,
						g,
						b,
						1,
					],
					[
						x + Math.cos((Math.PI / 6) * 7) * 0.1,
						y + Math.sin((Math.PI / 6) * 7) * 0.1,
						z,
						r,
						g,
						b,
						1,
					],
					[
						x + Math.cos((Math.PI / 6) * 11) * 0.1,
						y + Math.sin((Math.PI / 6) * 11) * 0.1,
						z,
						r,
						g,
						b,
						1,
					],
				];
			}),
		);
	}
}
