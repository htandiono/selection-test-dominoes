# Domino logic, step by step

This guide explains the domain logic without assuming prior React knowledge.
All transformation functions live in `app/dominoes.ts`; the React component is
only responsible for deciding when to call them and displaying the result.

## 1. Representing a domino

A domino is stored as a two-item tuple:

```ts
type Domino = readonly [number, number];
```

For `[6, 1]`, `6` is the first face and `1` is the second. `readonly` prevents a
function from silently changing a tuple that it was given.

The whole collection is an array of those tuples:

```ts
const dominoes = [[6, 1], [4, 3], [1, 1]];
```

## 2. Parsing source input

Before totals are calculated, editable source text is parsed with
`JSON.parse`. The result is accepted only when it is an array and every item is
exactly two whole numbers between `0` and `6`:

```text
[[6,1],[2,2]] → valid
[[1,7]]       → invalid: 7 is outside the supported pip range
[[1,2,3]]     → invalid: a domino must have exactly two sides
```

Invalid text never replaces the last valid set. Valid text is normalized with
`JSON.stringify`, then becomes the single collection used by the tiles and all
summary values.

## 3. Calculating totals

The same small helper is reused wherever a total is needed:

```ts
const dominoTotal = ([first, second]: Domino) => first + second;
```

This avoids rewriting `domino[0] + domino[1]` in the sort, summary, and removal
logic.

For `[6, 1]`, the helper returns `7`.

## 4. Counting doubles

A double has equal values on both sides.

```text
[1,1] → double
[3,3] → double
[3,4] → not a double
```

The function keeps only the matching tuples, then returns the length:

```ts
dominoes.filter(([first, second]) => first === second).length;
```

The summary is recalculated from the current set, so removing or resetting tiles
immediately updates the displayed double count.

## 5. Sorting

Sorting has three comparison levels.

1. Compare the sum of both sides.
2. If the sums match, compare the first side.
3. If those also match, compare the second side.

For ascending order:

```text
input:  [3,4] [1,2] [1,6]
totals:    7     3     7

[1,2] comes first because 3 is the smallest total.
[1,6] comes before [3,4] because both total 7, but 1 is smaller than 3.
```

For descending order, a multiplier changes from `1` to `-1`. That reverses the
same comparisons without maintaining a second sorting algorithm.

The function starts with `[...dominoes]`. This creates a new array before calling
JavaScript's in-place `sort`, so the caller's original array remains untouched.

## 6. Flipping

Flipping swaps the two values of every tuple:

```ts
dominoes.map(([first, second]) => [second, first]);
```

Example:

```text
[1,2] [5,3] → [2,1] [3,5]
```

`map` returns a new array and a new tuple for every domino.

## 7. Removing repeated pairs

The supplied requirement treats orientation as irrelevant. These three values
are members of the same repeated group:

```text
[1,2] [1,2] [2,1]
```

The function first turns either orientation into one canonical key:

```text
[1,2] → "1:2"
[2,1] → "1:2"
```

It then works in two passes:

1. Count how often every canonical key appears in a `Map`.
2. Keep only dominoes whose key appears exactly once.

Why remove the whole group? The requirement's example ends with only `[1,3]`,
so “remove duplicate” means remove repeated combinations, not “keep one copy.”

```text
input:  [1,2] [1,2] [2,1] [1,3]
counts: 1:2 = 3, 1:3 = 1
result: [1,3]
```

The two-pass approach is linear: each domino is visited once to count and once
to filter.

## 8. Removing a chosen total

Filtering by total keeps only tiles that do not match the requested value:

```ts
dominoes.filter((domino) => dominoTotal(domino) !== total);
```

Example:

```text
input:    [1,2] [2,2] [2,1] [1,3]
remove 4:          ×             ×
result:   [1,2]       [2,1]
```

Before filtering, the UI validates that the submitted value is a whole number
between `0` and `12`. Those are the smallest and largest totals in a standard
double-six set.

## 9. Resetting safely

The default array is a constant and is never edited. Reset maps over it to make
fresh tuples:

```ts
DEFAULT_DOMINOES.map(([first, second]) => [first, second]);
```

That copy makes the reset independent of any array that was previously sorted,
flipped, or filtered.

## 10. Turning numbers into pips

The visual component uses a 3 × 3 grid. Positions are numbered like this:

```text
1 2 3
4 5 6
7 8 9
```

Each face value maps to the positions it needs:

```ts
1 → [5]
2 → [1, 9]
3 → [1, 5, 9]
4 → [1, 3, 7, 9]
5 → [1, 3, 5, 7, 9]
6 → [1, 3, 4, 6, 7, 9]
```

The renderer places one circular element at each listed position. Zero maps to
an empty list, so a blank face is supported without a special rendering branch.

## 11. How React connects the pieces

The data flow is intentionally one-way:

```text
button or form event
        ↓
pure transformation function
        ↓
setDominoes(newArray)
        ↓
React redraws tiles and recalculates summaries
```

No operation edits DOM elements directly, and no summary value needs manual
bookkeeping. This is the main reason the app stays predictable even after a
long sequence such as sort → flip → remove → reset.
