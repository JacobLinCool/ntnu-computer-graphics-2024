import { Matrix4 } from "./cuon-matrix";

export abstract class GraphObject {
	static count = 0;
	public readonly id = GraphObject.count++;
	public transform = new Matrix4().setIdentity();
	public children: GraphObject[] = [];

	/**
	 * Renders the object.
	 * @throws {Error} If the render method is not implemented.
	 */
	public renderSelf(gl: WebGLRenderingContext, transform: Matrix4): void;
	public renderSelf(): void {
		throw new Error("Render method not implemented.");
	}

	/**
	 * Renders the object and its descendants.
	 * @param gl - The WebGL rendering context.
	 * @param origin - The origin transformation matrix to apply. Defaults to the identity matrix.
	 */
	public render(gl: WebGLRenderingContext, origin = new Matrix4().setIdentity()): void {
		const scheduled = this.schedule(origin);
		this.renderScheduled(gl, scheduled);
	}

	/**
	 * Preparing the object and its descendants for rendering, calculating their transformations.
	 * @param origin - The origin transformation matrix to apply. Defaults to the identity matrix.
	 * @returns An array of tuples containing the scheduled objects and their corresponding calculated transformations.
	 */
	public schedule(origin = new Matrix4().setIdentity()): [GraphObject, Matrix4][] {
		const transform = new Matrix4(origin).multiply(this.transform);
		const scheduled: [GraphObject, Matrix4][] = [[this, transform]];
		for (const child of this.children) {
			scheduled.push(...child.schedule(transform));
		}
		return scheduled;
	}

	/**
	 * Renders the scheduled objects.
	 * @param gl - The WebGL rendering context.
	 * @param scheduled - An array of tuples containing the scheduled objects and their corresponding calculated transformations.
	 */
	public renderScheduled(gl: WebGLRenderingContext, scheduled: [GraphObject, Matrix4][]): void {
		for (const [object, transform] of scheduled) {
			object.renderSelf(gl, transform);
		}
	}

	public calculateTransform(origin = new Matrix4().setIdentity()): Matrix4 {
		return new Matrix4(origin).multiply(this.transform);
	}

	/**
	 * Calculates the transformation matrix of a child object relative to a parent object.
	 * @param child - The child object to calculate the transformation for.
	 * @param origin - The origin transformation matrix to apply. Defaults to the identity matrix.
	 * @returns The transformation matrix of the child object relative to the parent object, or null if the child object is not found.
	 */
	public calculateTransformFor(
		child: GraphObject,
		origin = new Matrix4().setIdentity(),
	): Matrix4 | null {
		const transform = new Matrix4(origin).multiply(this.transform);
		if (this === child) {
			return transform;
		}

		for (const c of this.children) {
			const found = c.calculateTransformFor(child, transform);
			if (found) {
				return found;
			}
		}

		return null;
	}

	public find(id: number): GraphObject | null {
		if (this.id === id) {
			return this;
		}
		for (const child of this.children) {
			const found = child.find(id);
			if (found) {
				return found;
			}
		}
		return null;
	}
}

export class InvisibleObject extends GraphObject {
	public renderSelf(): void {
		return;
	}
}

export class RootObject extends InvisibleObject {}
