# Dominoes - CodeSandbox submission

This single-page React app renders each pair as a graphical pip-based domino and keeps the collection fully dynamic. It uses the supplied starter data and implements every requested transformation without adding extra libraries or architecture.

## Features

- Edit the **Source** textarea with JSON pairs such as `[[6,1],[1,1],[3,4]]`.
- Validate that every tile has exactly two whole-number sides from `0` to `6`.
- Redraw the tiles and recalculate **Tiles**, **Double numbers**, and **Total pips** whenever the collection changes.
- Sort by pip total in ascending or descending order, with both sides used as deterministic tie-breakers.
- Flip every tile.
- Remove all repeated pairs, treating `[1,2]` and `[2,1]` as the same combination.
- Remove every tile whose sides add up to a selected total from `0` to `12`.
- Reset to the supplied original data.

## Data model

A domino is represented by a two-item array:

```js
[6, 1]
```

The application stores only the current array of dominoes. Counts and pip totals are derived from that array, so the display cannot drift out of sync with the tiles.

## Source validation

`parseSource` uses `JSON.parse`, then checks three rules:

1. The outer value must be an array.
2. Every item must contain exactly two entries.
3. Both entries must be whole numbers between `0` and `6`.

Invalid input leaves the last valid collection on screen and shows a concise explanation. Valid input is copied before becoming application state.

## Sorting

`sortDominoes` compares three values in order:

1. Sum of the two sides.
2. First side when sums match.
3. Second side when both earlier comparisons match.

The function sorts a copied array, so the current React state is never mutated in place.

## Repeated pairs

Orientation does not create a unique pair. `pairKey` normalizes both `[1,2]` and `[2,1]` to `"1:2"`. The removal logic counts these normalized keys, then keeps only keys that occurred exactly once. This removes the entire repeated group, matching the assignment example.

## Graphical tiles

Each half of a domino is a 3 x 3 CSS grid. The `PIPS` lookup maps values `0-6` to familiar pip positions. The renderer adds one circular element per position, so no numbers or image assets are displayed on the tiles. Each figure still has an accessible label that announces both sides and their total to screen readers.

## React flow

Every interaction follows the same small flow:

```text
form or button event
        |
pure array transformation
        |
setDominoes(newArray)
        |
React redraws tiles and summary values
```

The source textarea is synchronized after transformations so it always describes the collection currently on the table. A polite live status reports the result of each action.

## Main file

All assignment logic and presentation live in `src/App.js`. Keeping the submission in one clearly sectioned file makes the CodeSandbox version easy to review while the linked GitHub repository contains the more modular production version and tests.
