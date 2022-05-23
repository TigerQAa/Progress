import random from "lodash-es/random.js";

export default function randomNumber(start: number, end: number): number {
  return random(start, end);
}
