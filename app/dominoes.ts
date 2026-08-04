export type Domino = readonly [number, number];
export type SortDirection = "asc" | "desc";
export type ParseDominoSourceResult =
  | { ok: true; dominoes: Domino[] }
  | { ok: false; message: string };

export const DEFAULT_DOMINOES: readonly Domino[] = [
  [6, 1],
  [4, 3],
  [5, 1],
  [3, 4],
  [1, 1],
  [3, 4],
  [1, 2],
];

export const dominoTotal = ([first, second]: Domino) => first + second;

export const formatDominoSource = (dominoes: readonly Domino[]) =>
  JSON.stringify(dominoes);

export function parseDominoSource(source: string): ParseDominoSourceResult {
  let value: unknown;

  try {
    value = JSON.parse(source);
  } catch {
    return {
      ok: false,
      message: "Use a valid array such as [[6,1],[1,1],[3,4]].",
    };
  }

  if (!Array.isArray(value)) {
    return { ok: false, message: "The source must be an array of pairs." };
  }

  const isDomino = (item: unknown): item is [number, number] =>
    Array.isArray(item) &&
    item.length === 2 &&
    item.every(
      (side) => Number.isInteger(side) && side >= 0 && side <= 6,
    );

  if (!value.every(isDomino)) {
    return {
      ok: false,
      message: "Every domino needs exactly two whole numbers from 0 to 6.",
    };
  }

  return {
    ok: true,
    dominoes: value.map(([first, second]) => [first, second]),
  };
}

export const countDoubles = (dominoes: readonly Domino[]) =>
  dominoes.filter(([first, second]) => first === second).length;

export const totalPips = (dominoes: readonly Domino[]) =>
  dominoes.reduce((total, domino) => total + dominoTotal(domino), 0);

export function sortDominoes(
  dominoes: readonly Domino[],
  direction: SortDirection,
): Domino[] {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...dominoes].sort((first, second) => {
    const totalDifference = dominoTotal(first) - dominoTotal(second);
    if (totalDifference !== 0) return totalDifference * multiplier;

    const firstSideDifference = first[0] - second[0];
    if (firstSideDifference !== 0) return firstSideDifference * multiplier;

    return (first[1] - second[1]) * multiplier;
  });
}

export const flipDominoes = (dominoes: readonly Domino[]): Domino[] =>
  dominoes.map(([first, second]) => [second, first]);

const pairKey = ([first, second]: Domino) =>
  first <= second ? `${first}:${second}` : `${second}:${first}`;

export function removeRepeatedDominoes(
  dominoes: readonly Domino[],
): Domino[] {
  const occurrences = new Map<string, number>();

  for (const domino of dominoes) {
    const key = pairKey(domino);
    occurrences.set(key, (occurrences.get(key) ?? 0) + 1);
  }

  return dominoes.filter((domino) => occurrences.get(pairKey(domino)) === 1);
}

export const removeDominoesByTotal = (
  dominoes: readonly Domino[],
  total: number,
): Domino[] => dominoes.filter((domino) => dominoTotal(domino) !== total);
