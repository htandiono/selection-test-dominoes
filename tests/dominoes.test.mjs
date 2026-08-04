import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_DOMINOES,
  countDoubles,
  formatDominoSource,
  flipDominoes,
  parseDominoSource,
  removeDominoesByTotal,
  removeRepeatedDominoes,
  sortDominoes,
  totalPips,
} from "../app/dominoes.ts";

test("reports summary values for the original set", () => {
  assert.equal(DEFAULT_DOMINOES.length, 7);
  assert.equal(countDoubles(DEFAULT_DOMINOES), 1);
  assert.equal(totalPips(DEFAULT_DOMINOES), 39);
});

test("parses and normalizes a valid source array", () => {
  const result = parseDominoSource(" [ [6, 1], [2, 2], [0, 4] ] ");

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.deepEqual(result.dominoes, [
    [6, 1],
    [2, 2],
    [0, 4],
  ]);
  assert.equal(formatDominoSource(result.dominoes), "[[6,1],[2,2],[0,4]]");
  assert.equal(countDoubles(result.dominoes), 1);
});

test("rejects malformed source arrays and out-of-range sides", () => {
  assert.deepEqual(parseDominoSource("not an array"), {
    ok: false,
    message: "Use a valid array such as [[6,1],[1,1],[3,4]].",
  });
  assert.deepEqual(parseDominoSource("[[1,2,3]]"), {
    ok: false,
    message: "Every domino needs exactly two whole numbers from 0 to 6.",
  });
  assert.equal(parseDominoSource("[[1,7]]").ok, false);
});

test("sorts by total and then by each side", () => {
  const source = [
    [3, 4],
    [1, 2],
    [1, 6],
  ];

  assert.deepEqual(sortDominoes(source, "asc"), [
    [1, 2],
    [1, 6],
    [3, 4],
  ]);
  assert.deepEqual(sortDominoes(source, "desc"), [
    [3, 4],
    [1, 6],
    [1, 2],
  ]);
  assert.deepEqual(source, [
    [3, 4],
    [1, 2],
    [1, 6],
  ]);
});

test("flips each domino without changing the source", () => {
  const source = [
    [1, 2],
    [5, 3],
  ];

  assert.deepEqual(flipDominoes(source), [
    [2, 1],
    [3, 5],
  ]);
  assert.deepEqual(source, [
    [1, 2],
    [5, 3],
  ]);
});

test("removes every member of a repeated pair regardless of orientation", () => {
  const source = [
    [1, 2],
    [1, 2],
    [2, 1],
    [1, 3],
  ];

  assert.deepEqual(removeRepeatedDominoes(source), [[1, 3]]);
});

test("removes all dominoes with the requested total", () => {
  const source = [
    [1, 2],
    [2, 2],
    [2, 1],
    [1, 3],
  ];

  assert.deepEqual(removeDominoesByTotal(source, 4), [
    [1, 2],
    [2, 1],
  ]);
});
