import { GraphObject, InvisibleObject, Renderer, RootObject } from "library";
import { Vector4 } from "library/cuon-matrix";
import FSHADER_SOURCE from "./fshader.glsl?raw";
import { Circle, Rect, Triangle } from "./objects";
import { repeat } from "./utils";
import VSHADER_SOURCE from "./vshader.glsl?raw";

class Homework2 {
	private renderer: Renderer;
	private screenZoom = 1;
	private screenCenterX = 0;
	private screenCenterY = 0;
	private mouseX = 0;
	private mouseY = 0;
	private vinylRotation = 0;
	private triangleSpeed = 0;
	private root = new RootObject();
	private vinyl: GraphObject = new InvisibleObject();
	private turntable: GraphObject = new InvisibleObject();
	private arm: GraphObject = new InvisibleObject();
	private joint1: GraphObject = new InvisibleObject();
	private joint2: GraphObject = new InvisibleObject();
	private joint3: GraphObject = new InvisibleObject();
	private joint4: GraphObject = new InvisibleObject();
	private magnet: GraphObject = new InvisibleObject();
	private triangles: GraphObject[] = [];
	private pressed = new Set<string>();
	private audio: HTMLAudioElement;
	constructor(selector: string, audio: HTMLAudioElement) {
		const renderer = new Renderer(selector);
		const program = renderer.compiler
			.compileFragment(FSHADER_SOURCE)
			.compileVertex(VSHADER_SOURCE)
			.link();
		renderer.use(program);

		// renderer.gl.enable(renderer.gl.DEPTH_TEST);
		// renderer.gl.enable(renderer.gl.SCISSOR_TEST);

		this.renderer = renderer;
		this.audio = audio;

		this.setup();
	}

	private setup() {
		this.setupControls();

		const turntable = new Circle(this.renderer.gl, [0, 0, 0, 0.47, 200], [2 / 3, 2 / 3, 2 / 3]);
		turntable.transform.translate(-0.5, 0.5, 0);
		this.root.children.push(turntable);
		this.turntable = turntable;

		const vinyl = new Circle(this.renderer.gl, [0, 0, 0, 0.45, 200], [1 / 3, 1 / 3, 1 / 3]);
		vinyl.transform.translate(-0.5, -0.5, 0);
		this.root.children.push(vinyl);
		this.vinyl = vinyl;

		const vinylBody = new Circle(this.renderer.gl, [0, 0, 0, 0.42, 200], [1, 0.4, 1]);
		vinyl.children.push(vinylBody);

		const vinylInner = new Circle(this.renderer.gl, [0, 0, 0, 0.1, 100], [1 / 3, 1 / 3, 1 / 3]);
		vinylBody.children.push(vinylInner);

		const vinylCenter = new Circle(this.renderer.gl, [0, 0, 0, 0.02, 100], [0.8, 0.8, 0.8]);
		vinylBody.children.push(vinylCenter);

		const triangleCount = 12;
		for (let i = 0; i < triangleCount; i++) {
			const empty = new InvisibleObject();
			empty.transform.rotate((360 / triangleCount) * i, 0, 0, 1);
			const triangle = new Triangle(
				this.renderer.gl,
				[
					Math.cos(Math.PI / 2),
					Math.sin(Math.PI / 2),
					0,
					Math.cos(Math.PI * (7 / 6)),
					Math.sin(Math.PI * (7 / 6)),
					0,
					Math.cos(Math.PI * (11 / 6)),
					Math.sin(Math.PI * (11 / 6)),
					0,
				],
				repeat([i % 2 ? 1 : 0.4, i % 2 ? 0.4 : 1, 0.4], 3),
			);
			triangle.transform.translate(0, 0.3, 0).scale(0.075, 0.075, 1);
			vinylBody.children.push(empty);
			empty.children.push(triangle);
			this.triangles.push(triangle);
		}

		const armBase = new Rect(
			this.renderer.gl,
			[0.15, 0.05, 0, -0.15, 0.05, 0, -0.15, -0.05, 0, 0.15, -0.05, 0],
			repeat([1, 1, 0.4], 4),
		);
		armBase.transform.translate(0.6, -0.5, 0);
		this.root.children.push(armBase);
		this.arm = armBase;

		const armWheel1 = new Circle(this.renderer.gl, [0, 0, 0, 0.05, 100], [0.4, 1, 0.4]);
		armWheel1.transform.translate(-0.075, -0.05, 0);
		armBase.children.push(armWheel1);

		const armWheel2 = new Circle(this.renderer.gl, [0, 0, 0, 0.05, 100], [0.4, 1, 0.4]);
		armWheel2.transform.translate(0.075, -0.05, 0);
		armBase.children.push(armWheel2);

		const armJoint1 = new Circle(this.renderer.gl, [0, 0, 0, 0.05, 100], [0.4, 1, 1]);
		armJoint1.transform.translate(0, 0.1, 0).rotate(-45, 0, 0, 1);
		armBase.children.push(armJoint1);
		this.joint1 = armJoint1;

		const arm1 = new Rect(
			this.renderer.gl,
			[0.04, 0.2, 0, -0.04, 0.2, 0, -0.04, -0.2, 0, 0.04, -0.2, 0],
			repeat([1, 1, 0.4], 4),
		);
		arm1.transform.translate(0, 0.25, 0);
		armJoint1.children.push(arm1);

		const armJoint2 = new Circle(this.renderer.gl, [0, 0, 0, 0.05, 100], [0.4, 1, 1]);
		armJoint2.transform.translate(0, 0.25, 0).rotate(90, 0, 0, 1);
		arm1.children.push(armJoint2);
		this.joint2 = armJoint2;

		const arm2 = new Rect(
			this.renderer.gl,
			[0.04, 0.3, 0, -0.04, 0.3, 0, -0.04, -0.3, 0, 0.04, -0.3, 0],
			repeat([1, 1, 0.4], 4),
		);
		arm2.transform.translate(0, 0.35, 0);
		armJoint2.children.push(arm2);

		const armJoint3 = new Circle(this.renderer.gl, [0, 0, 0, 0.05, 100], [0.4, 1, 1]);
		armJoint3.transform.translate(0, 0.35, 0).rotate(45, 0, 0, 1);
		arm2.children.push(armJoint3);
		this.joint3 = armJoint3;

		const arm3 = new Rect(
			this.renderer.gl,
			[0.04, 0.2, 0, -0.04, 0.2, 0, -0.04, -0.2, 0, 0.04, -0.2, 0],
			repeat([1, 1, 0.4], 4),
		);
		arm3.transform.translate(0, 0.25, 0);
		armJoint3.children.push(arm3);

		const armJoint4 = new Circle(this.renderer.gl, [0, 0, 0, 0.05, 100], [0.4, 1, 0.4]);
		armJoint4.transform.translate(0, 0.2, 0).rotate(90, 0, 0, 1);
		arm3.children.push(armJoint4);
		this.joint4 = armJoint4;

		const rope = new Rect(
			this.renderer.gl,
			[0.01, 0.3, 0, -0.01, 0.3, 0, -0.01, -0.3, 0, 0.01, -0.3, 0],
			repeat([1, 0.7, 0.4], 4),
		);
		rope.transform.translate(0, 0.35, 0);
		armJoint4.children.push(rope);

		const magnet = new Rect(
			this.renderer.gl,
			[0.03, 0.03, 0, -0.03, 0.03, 0, -0.03, -0.03, 0, 0.03, -0.03, 0],
			repeat([0.4, 0.4, 1], 4),
		);
		magnet.transform.translate(0, 0.33, 0);
		rope.children.push(magnet);
		this.magnet = magnet;
	}

	private setupControls() {
		const canvas = this.renderer.canvas;

		canvas.addEventListener(
			"wheel",
			(e) => {
				e.preventDefault();
				const delta = e.deltaY > 0 ? -0.01 : 0.01;
				this.screenZoom += delta;
				this.screenZoom = Math.min(Math.max(0.3, this.screenZoom), 5);
			},
			{ passive: false },
		);

		canvas.addEventListener("mouseleave", () => {
			this.screenZoom = 1;
			this.screenCenterX = 0;
			this.screenCenterY = 0;
			this.mouseX = canvas.width / 2;
			this.mouseY = canvas.height / 2;
		});
		canvas.addEventListener("mousemove", (e) => {
			const rect = canvas.getBoundingClientRect();
			this.mouseX = e.clientX - rect.left;
			this.mouseY = e.clientY - rect.top;
		});

		document.addEventListener("keydown", (e) => {
			this.pressed.add(e.key.toLowerCase());
		});
		document.addEventListener("keyup", (e) => {
			this.pressed.delete(e.key.toLowerCase());
		});

		this.screenZoom = 1;
		this.screenCenterX = 0;
		this.screenCenterY = 0;
		this.mouseX = canvas.width / 2;
		this.mouseY = canvas.height / 2;
	}

	public start() {
		return this.renderer.render(this.render.bind(this));
	}

	private render() {
		const canvas = this.renderer.canvas;
		this.screenCenterX +=
			(((this.mouseX - canvas.width / 2) / canvas.width) * this.screenZoom) / 100;
		this.screenCenterY +=
			(((canvas.height / 2 - this.mouseY) / canvas.height) * this.screenZoom) / 100;

		this.renderer.clear(0.8, 0.4, 0.1, 1);
		this.root.transform
			.setLookAt(
				this.screenCenterX,
				this.screenCenterY,
				1,
				this.screenCenterX,
				this.screenCenterY,
				-100,
				0,
				1,
				0,
			)
			.scale(this.screenZoom, this.screenZoom, 1);

		const magnetTransformBefore = this.root.calculateTransformFor(this.magnet);
		if (!magnetTransformBefore) {
			throw new Error("Magnet transform not found");
		}

		if (this.pressed.has("a")) {
			this.arm.transform.translate(-0.01, 0, 0);
		}
		if (this.pressed.has("d")) {
			this.arm.transform.translate(0.01, 0, 0);
		}
		if (this.pressed.has("w")) {
			this.arm.transform.translate(0, 0.01, 0);
		}
		if (this.pressed.has("s")) {
			this.arm.transform.translate(0, -0.01, 0);
		}

		const deg = this.pressed.has("r") ? -1 : this.pressed.has("f") ? 1 : 0;
		if (this.pressed.has("1")) {
			this.joint1.transform.rotate(deg, 0, 0, 1);
			this.joint4.transform.rotate(-deg, 0, 0, 1);
		}
		if (this.pressed.has("2")) {
			this.joint2.transform.rotate(deg, 0, 0, 1);
			this.joint4.transform.rotate(-deg, 0, 0, 1);
		}
		if (this.pressed.has("3")) {
			this.joint3.transform.rotate(deg, 0, 0, 1);
			this.joint4.transform.rotate(-deg, 0, 0, 1);
		}

		if (this.pressed.has(" ")) {
			const magnetTransform = this.root.calculateTransformFor(this.magnet);
			const vinylTransform = this.root.calculateTransformFor(this.vinyl);
			if (magnetTransform && vinylTransform) {
				const [x1, y1] = magnetTransform.multiplyVector4(
					new Vector4([0, 0, 0, 1]),
				).elements;
				const [x2, y2] = vinylTransform.multiplyVector4(new Vector4([0, 0, 0, 1])).elements;
				const dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) / this.screenZoom;
				if (dist < 0.1) {
					const [x, y] = magnetTransformBefore.multiplyVector4(
						new Vector4([0, 0, 0, 1]),
					).elements;
					this.vinyl.transform
						.rotate(-this.vinylRotation, 0, 0, 1)
						.scale(1 / this.screenZoom, 1 / this.screenZoom, 1)
						.translate(x1 - x, y1 - y, 0)
						.scale(this.screenZoom, this.screenZoom, 1)
						.rotate(this.vinylRotation, 0, 0, 1);
				}
			}
		}

		const turntableTransform = this.root.calculateTransformFor(this.turntable);
		const vinylTransform = this.root.calculateTransformFor(this.vinyl);
		if (turntableTransform && vinylTransform) {
			const [x1, y1] = turntableTransform.multiplyVector4(new Vector4([0, 0, 0, 1])).elements;
			const [x2, y2] = vinylTransform.multiplyVector4(new Vector4([0, 0, 0, 1])).elements;
			const dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) / this.screenZoom;
			if (dist < 0.1) {
				this.vinyl.transform.rotate(10, 0, 0, 1);
				this.vinylRotation += 10;
				if (this.audio.paused) {
					this.audio.play();
				}
			} else {
				if (!this.audio.paused) {
					this.audio.pause();
				}
			}
		}

		if (this.pressed.has("arrowup")) {
			this.triangleSpeed += 0.1;
			this.triangleSpeed = Math.min(this.triangleSpeed, 10);
		}
		if (this.pressed.has("arrowdown")) {
			this.triangleSpeed -= 0.1;
			this.triangleSpeed = Math.max(this.triangleSpeed, -10);
		}

		for (let i = 0; i < this.triangles.length; i++) {
			this.triangles[i].transform.rotate(this.triangleSpeed * (i % 2 ? 1 : -1), 0, 0, 1);
		}

		const scheduled = this.root.schedule();
		scheduled.sort((a, b) => a[0].id - b[0].id);
		this.root.renderScheduled(this.renderer.gl, scheduled);
	}
}

function main() {
	const hw2 = new Homework2("#webgl", document.querySelector("#audio")!);
	hw2.start();
}

main();
