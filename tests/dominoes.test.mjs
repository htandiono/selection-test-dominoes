import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_DOMINOES,
  countDoubles,
  flipDominoes,
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
