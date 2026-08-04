import type { CSSProperties } from "react";
import { dominoTotal, type Domino } from "./dominoes";

const PIP_POSITIONS: Record<number, readonly number[]> = {
  0: [],
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

function PipFace({ value }: { value: number }) {
  return (
    <span className="pip-face" aria-hidden="true">
      {PIP_POSITIONS[value].map((position) => {
        const row = Math.ceil(position / 3);
        const column = ((position - 1) % 3) + 1;

        return (
          <i
            className="pip"
            key={position}
            style={{ gridArea: `${row} / ${column}` }}
          />
        );
      })}
    </span>
  );
}

export function DominoTile({
  domino,
  index,
}: {
  domino: Domino;
  index: number;
}) {
  const [first, second] = domino;

  return (
    <figure
      className="domino-item"
      data-domino="true"
      aria-label={`Domino ${first} and ${second}, total ${dominoTotal(domino)}`}
      style={{ "--tile-index": index } as CSSProperties}
    >
      <span className="domino-tile" aria-hidden="true">
        <PipFace value={first} />
        <span className="domino-divider" />
        <PipFace value={second} />
      </span>
      <figcaption>Tile {String(index + 1).padStart(2, "0")}</figcaption>
    </figure>
  );
}
