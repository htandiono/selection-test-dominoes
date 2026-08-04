# Dominoes

A small single-page React application for viewing and transforming a set of
dominoes. The interface uses pip-based tiles instead of printed number pairs,
while keeping every operation from the supplied selection-test brief.

## Submission links

- [CodeSandbox project](https://codesandbox.io/p/devbox/dominoes-student-template-forked-jcy3f3)
- [CodeSandbox live preview](https://jcy3f3.csb.app/)
- [Deployed application](https://domino-pair-study.steinway.chatgpt.site/)

## What is included

- Render every item in the provided data as a graphical domino.
- Accept a custom source array and redraw the collection from that input.
- Show the live tile count, double-number count, and total pip count.
- Sort ascending or descending by total, then by the two sides.
- Flip every domino.
- Remove every repeated pair, including reversed copies.
- Remove every domino with a chosen total from `0` to `12`.
- Reset to the original data at any time.
- Announce each operation for screen-reader users.
- Adapt the board and controls to desktop, tablet, and mobile widths.

The original data from the starter exercise is:

```ts
[
  [6, 1],
  [4, 3],
  [5, 1],
  [3, 4],
  [1, 1],
  [3, 4],
  [1, 2],
]
```

## Run locally

Requirements: Node.js `22.13.0` or newer.

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal.

Useful commands:

```bash
npm test       # production build + rendered-page tests + logic tests
npm run lint   # static code checks
npm run build  # production build only
```

## Project structure

```text
app/
├── page.tsx          # page entry point
├── DominoesApp.tsx   # state, controls, and interaction messages
├── DominoTile.tsx    # graphical pip-based tile renderer
├── dominoes.ts       # pure data transformations
├── layout.tsx        # page and social metadata
└── globals.css       # responsive visual system
tests/
├── dominoes.test.mjs       # transformation rules
└── rendered-html.test.mjs  # production-render smoke tests
docs/
└── LOGIC.md          # detailed, example-led logic walkthrough
codesandbox/
├── App.js            # self-contained version used by the supplied sandbox
└── README.md         # reviewer-facing CodeSandbox logic guide
```

## Design approach

The page is deliberately closer to a quiet tabletop study than a game UI.
Warm paper, dark ink, and a single clay-red accent keep the presentation
minimal. The dominoes are built with HTML and CSS: each half is a 3 × 3 grid,
and the appropriate grid positions receive circular pips. No image is required
for a tile, so every value stays crisp at any screen size.

The visuals never print the pair as numbers. Numeric values still appear in the
accessible label for each tile so a screen reader can announce, for example,
“Domino 6 and 1, total 7.”

## State model

The app has one main piece of domain state:

```ts
type Domino = readonly [number, number];
```

`DominoesApp` owns the current array. Buttons call functions from
`app/dominoes.ts`, then replace the current array with the returned one. The
functions do not mutate their input, which makes action order predictable and
keeps each rule easy to test.

Three small UI concerns sit beside the data:

- `sourceInput` contains the editable JSON representation of the collection.
- `sourceError` contains a friendly validation message when the input is invalid.
- `removeTotal` contains the number typed into the removal field.
- `status` contains the latest human-readable action result.

The three summary values are derived from the current array with `useMemo`.
They are never stored separately, so they cannot drift out of sync.

## Requirement decisions

### Editable source

The source field accepts a JSON array of two-number pairs, for example
`[[6,1],[2,2],[0,4]]`. Each side must be a whole number from `0` to `6`.
Applying valid input replaces the current collection, redraws the graphical
tiles, and immediately recalculates the tile, double-number, and pip summaries.

Invalid input leaves the last valid collection visible and explains what needs
to be corrected. Sorting, flipping, and removal also update the source field so
it always describes the tiles currently on the table.

### Sort order

The total is the primary key. If two tiles share a total, the first side is the
secondary key and the second side is the final key. Descending order reverses
all three comparisons.

```text
source:     [3,4] [1,2] [1,6]
ascending:  [1,2] [1,6] [3,4]
descending: [3,4] [1,6] [1,2]
```

### Repeated pairs

Orientation does not make a pair unique. `[1,2]` and `[2,1]` both receive the
canonical key `1:2`. If a key occurs more than once, every domino in that group
is removed. This follows the supplied example rather than retaining one copy.

### Remove by total

The input accepts whole numbers from `0` through `12`, the complete range for a
double-six set. Submitting filters out every tile whose two sides add up to that
number. Invalid input and no-match cases leave the collection unchanged and
produce a useful status message.

### Reset

Reset creates fresh tuple values from the constant default data. It also clears
the removal input and restores the initial status, so it is a full UI reset and
not only a data reset.

For pseudocode and step-by-step examples of every operation, see
[`docs/LOGIC.md`](docs/LOGIC.md).

## Accessibility

- Every control is a native button, input, label, or form.
- The remove action works by clicking the button or pressing Enter.
- Focus styles use a high-contrast accent outline.
- Each graphical tile has a descriptive accessible name.
- Operation results are exposed through a polite live region.
- Animation is reduced when the operating system requests reduced motion.
- Color is never the only way information is communicated.

## Testing strategy

The logic suite covers the data rules directly, including input immutability and
orientation-insensitive repeated pairs. The render suite loads the production
worker, checks the important content and controls, confirms all seven initial
tiles are present, and guards against accidentally shipping the starter preview.

This separation keeps tests close to user-visible behavior without adding a
large testing framework to a small project.
