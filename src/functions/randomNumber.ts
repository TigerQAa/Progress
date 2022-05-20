import random from "lodash-es/random.js";
let usePseudoo = false;
export default async function randomNumber(start: number, end: number, usePseudo: boolean): Promise<number> {
	if (usePseudo) return random(start, end);

	try {
		const res = await (
			await fetch(
				`https://www.random.org/integers/?num=1&min=${start}&max=${end}&col=1&base=10&format=plain&rnd=new`
			)
		).text();
		const num = parseInt(res);

		if (!num || isNaN(num)) {
			console.warn('Pseudo');
			usePseudo = true;
			return random(start, end, usePseudo);
		}

		return num;
	} catch {
		console.warn('Pseudo');
		usePseudo = true;
		return randomNumber(start, end, usePseudo);
	}
}
