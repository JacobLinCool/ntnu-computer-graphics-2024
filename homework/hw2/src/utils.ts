export function repeat(arr: number[], times: number): number[] {
	const res = [];
	for (let i = 0; i < times; i++) {
		res.push(...arr);
	}
	return res;
}
