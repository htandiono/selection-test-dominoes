"use client";

import { useMemo, useState, type FormEvent } from "react";
import { DominoTile } from "./DominoTile";
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
  type Domino,
  type SortDirection,
} from "./dominoes";

const copyDominoes = (dominoes: readonly Domino[]) =>
  dominoes.map(([first, second]) => [first, second] as Domino);

export function DominoesApp() {
  const [dominoes, setDominoes] = useState<Domino[]>(() =>
    copyDominoes(DEFAULT_DOMINOES),
  );
  const [sourceInput, setSourceInput] = useState(() =>
    formatDominoSource(DEFAULT_DOMINOES),
  );
  const [sourceError, setSourceError] = useState("");
  const [removeTotal, setRemoveTotal] = useState("");
  const [status, setStatus] = useState("Showing the original set.");

  const stats = useMemo(
    () => ({
      tiles: dominoes.length,
      doubles: countDoubles(dominoes),
      pips: totalPips(dominoes),
    }),
    [dominoes],
  );

  const replaceDominoes = (next: Domino[]) => {
    setDominoes(next);
    setSourceInput(formatDominoSource(next));
    setSourceError("");
  };

  const handleSourceSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = parseDominoSource(sourceInput);

    if (!result.ok) {
      setSourceError(result.message);
      setStatus("The source array needs attention.");
      return;
    }

    replaceDominoes(result.dominoes);
    setRemoveTotal("");
    setStatus(
      `Loaded ${result.dominoes.length} ${result.dominoes.length === 1 ? "tile" : "tiles"} from the source array.`,
    );
  };

  const applySort = (direction: SortDirection) => {
    replaceDominoes(sortDominoes(dominoes, direction));
    setStatus(
      direction === "asc"
        ? "Sorted from the lowest total to the highest."
        : "Sorted from the highest total to the lowest.",
    );
  };

  const handleFlip = () => {
    replaceDominoes(flipDominoes(dominoes));
    setStatus("Flipped every tile.");
  };

  const handleRemoveRepeated = () => {
    const next = removeRepeatedDominoes(dominoes);
    const removed = dominoes.length - next.length;

    replaceDominoes(next);
    setStatus(
      removed === 0
        ? "There are no repeated pairs to remove."
        : `Removed ${removed} repeated ${removed === 1 ? "tile" : "tiles"}.`,
    );
  };

  const handleRemoveTotal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (removeTotal.trim() === "") {
      setStatus("Enter a total from 0 to 12 first.");
      return;
    }

    const total = Number(removeTotal);

    if (!Number.isInteger(total) || total < 0 || total > 12) {
      setStatus("The total must be a whole number from 0 to 12.");
      return;
    }

    const next = removeDominoesByTotal(dominoes, total);
    const removed = dominoes.length - next.length;

    replaceDominoes(next);
    setStatus(
      removed === 0
        ? `No tiles add up to ${total}.`
        : `Removed ${removed} ${removed === 1 ? "tile" : "tiles"} totaling ${total}.`,
    );
  };

  const handleReset = () => {
    replaceDominoes(copyDominoes(DEFAULT_DOMINOES));
    setRemoveTotal("");
    setStatus("Restored the original seven tiles.");
  };

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Dominoes home">
          <span className="wordmark-mark" aria-hidden="true">
            <i />
            <i />
          </span>
          Dominoes
        </a>
        <p>Pair study № 01</p>
      </header>

      <section className="hero" id="top" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">A small exercise in order</p>
          <h1 id="page-title">Every pair,<br />plainly arranged.</h1>
          <p className="intro">
            Sort, flip and filter a classic set of dominoes.
          </p>
        </div>

        <dl className="stats" aria-label="Current set summary">
          <div>
            <dt>Tiles</dt>
            <dd>{stats.tiles.toString().padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>Double numbers</dt>
            <dd>{stats.doubles.toString().padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>Total pips</dt>
            <dd>{stats.pips.toString().padStart(2, "0")}</dd>
          </div>
        </dl>
      </section>

      <section className="workspace" aria-labelledby="collection-title">
        <div className="board-panel">
          <div className="section-heading">
            <div>
              <p className="section-index">01 / Collection</p>
              <h2 id="collection-title">Current set</h2>
            </div>
            <p className="live-status" role="status" aria-live="polite">
              {status}
            </p>
          </div>

          {dominoes.length > 0 ? (
            <div className="domino-grid" data-testid="domino-grid">
              {dominoes.map((domino, index) => (
                <DominoTile
                  key={`${domino[0]}-${domino[1]}-${index}`}
                  domino={domino}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-tiles" aria-hidden="true">
                <span />
                <span />
              </div>
              <h3>The table is clear.</h3>
              <p>Reset the collection to bring the original tiles back.</p>
              <button className="text-button" type="button" onClick={handleReset}>
                Restore collection
              </button>
            </div>
          )}
        </div>

        <aside className="control-panel" aria-labelledby="controls-title">
          <div className="section-heading compact">
            <div>
              <p className="section-index">02 / Controls</p>
              <h2 id="controls-title">Arrange the set</h2>
            </div>
          </div>

          <form className="source-form" onSubmit={handleSourceSubmit}>
            <label htmlFor="source-array">Source</label>
            <p>Enter JSON pairs. Each side can be a whole number from 0 to 6.</p>
            <textarea
              id="source-array"
              rows={5}
              spellCheck="false"
              value={sourceInput}
              aria-invalid={sourceError ? "true" : "false"}
              aria-describedby="source-help source-error"
              onChange={(event) => {
                setSourceInput(event.target.value);
                setSourceError("");
              }}
            />
            <p id="source-help" className="source-example">
              Example: [[6,1],[1,1],[3,4]]
            </p>
            <p id="source-error" className="field-error" aria-live="polite">
              {sourceError}
            </p>
            <button className="apply-source-button" type="submit">
              Apply source <span aria-hidden="true">→</span>
            </button>
          </form>

          <div className="control-group">
            <p className="control-label">Sort by pip total</p>
            <div className="button-row">
              <button type="button" onClick={() => applySort("asc")}>
                Low to high <span aria-hidden="true">↗</span>
              </button>
              <button type="button" onClick={() => applySort("desc")}>
                High to low <span aria-hidden="true">↘</span>
              </button>
            </div>
          </div>

          <div className="control-group">
            <p className="control-label">Transform</p>
            <div className="button-row">
              <button type="button" onClick={handleFlip}>
                Flip all <span aria-hidden="true">↻</span>
              </button>
              <button type="button" onClick={handleRemoveRepeated}>
                Remove repeats <span aria-hidden="true">−</span>
              </button>
            </div>
          </div>

          <form className="remove-form" onSubmit={handleRemoveTotal}>
            <label htmlFor="remove-total">Remove by total</label>
            <p>Clear every tile whose two sides add up to this value.</p>
            <div className="input-row">
              <input
                id="remove-total"
                type="number"
                min="0"
                max="12"
                step="1"
                inputMode="numeric"
                placeholder="0–12"
                value={removeTotal}
                onChange={(event) => setRemoveTotal(event.target.value)}
              />
              <button type="submit">Remove</button>
            </div>
          </form>

          <button className="reset-button" type="button" onClick={handleReset}>
            Reset original set <span aria-hidden="true">↺</span>
          </button>
        </aside>
      </section>

      <footer>
        <p>Any set. Seven small actions. One clear state.</p>
        <p>Dominoes / 2026</p>
      </footer>
    </main>
  );
}
