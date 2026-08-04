import { useMemo, useState } from "react";

const ORIGINAL = [
  [6, 1],
  [4, 3],
  [5, 1],
  [3, 4],
  [1, 1],
  [3, 4],
  [1, 2]
];

const PIPS = {
  0: [],
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9]
};

const copy = (dominoes) => dominoes.map(([left, right]) => [left, right]);
const total = ([left, right]) => left + right;
const formatSource = (dominoes) => JSON.stringify(dominoes);

function parseSource(source) {
  let value;

  try {
    value = JSON.parse(source);
  } catch {
    return {
      ok: false,
      message: "Use a valid array such as [[6,1],[1,1],[3,4]]."
    };
  }

  const valid =
    Array.isArray(value) &&
    value.every(
      (item) =>
        Array.isArray(item) &&
        item.length === 2 &&
        item.every(
          (side) => Number.isInteger(side) && side >= 0 && side <= 6
        )
    );

  return valid
    ? { ok: true, dominoes: copy(value) }
    : {
        ok: false,
        message: "Every domino needs exactly two whole numbers from 0 to 6."
      };
}

function sortDominoes(dominoes, direction) {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...dominoes].sort((a, b) => {
    const totalDifference = total(a) - total(b);
    if (totalDifference !== 0) return totalDifference * multiplier;
    if (a[0] !== b[0]) return (a[0] - b[0]) * multiplier;
    return (a[1] - b[1]) * multiplier;
  });
}

const pairKey = ([left, right]) =>
  left <= right ? `${left}:${right}` : `${right}:${left}`;

function withoutRepeatedPairs(dominoes) {
  const counts = new Map();

  dominoes.forEach((domino) => {
    const key = pairKey(domino);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return dominoes.filter((domino) => counts.get(pairKey(domino)) === 1);
}

function PipFace({ value }) {
  return (
    <span className="pip-face" aria-hidden="true">
      {PIPS[value].map((position) => {
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

function Domino({ values, index }) {
  const [left, right] = values;

  return (
    <figure
      className="domino-item"
      aria-label={`Domino ${left} and ${right}, total ${total(values)}`}
      style={{ "--tile-index": index }}
    >
      <span className="domino-tile" aria-hidden="true">
        <PipFace value={left} />
        <span className="domino-divider" />
        <PipFace value={right} />
      </span>
      <figcaption>Tile {String(index + 1).padStart(2, "0")}</figcaption>
    </figure>
  );
}

export default function App() {
  const [dominoes, setDominoes] = useState(() => copy(ORIGINAL));
  const [source, setSource] = useState(() => formatSource(ORIGINAL));
  const [sourceError, setSourceError] = useState("");
  const [removeTotal, setRemoveTotal] = useState("");
  const [status, setStatus] = useState("Showing the original set.");

  const stats = useMemo(
    () => ({
      tiles: dominoes.length,
      doubles: dominoes.filter(([left, right]) => left === right).length,
      pips: dominoes.reduce((sum, domino) => sum + total(domino), 0)
    }),
    [dominoes]
  );

  const replaceDominoes = (next) => {
    setDominoes(next);
    setSource(formatSource(next));
    setSourceError("");
  };

  const applySource = (event) => {
    event.preventDefault();
    const result = parseSource(source);

    if (!result.ok) {
      setSourceError(result.message);
      setStatus("The source array needs attention.");
      return;
    }

    replaceDominoes(result.dominoes);
    setRemoveTotal("");
    setStatus(`Loaded ${result.dominoes.length} tile${result.dominoes.length === 1 ? "" : "s"} from the source array.`);
  };

  const applySort = (direction) => {
    replaceDominoes(sortDominoes(dominoes, direction));
    setStatus(
      direction === "asc"
        ? "Sorted from the lowest total to the highest."
        : "Sorted from the highest total to the lowest."
    );
  };

  const flipAll = () => {
    replaceDominoes(dominoes.map(([left, right]) => [right, left]));
    setStatus("Flipped every tile.");
  };

  const removeRepeats = () => {
    const next = withoutRepeatedPairs(dominoes);
    const removed = dominoes.length - next.length;
    replaceDominoes(next);
    setStatus(
      removed
        ? `Removed ${removed} repeated tile${removed === 1 ? "" : "s"}.`
        : "There are no repeated pairs to remove."
    );
  };

  const removeByTotal = (event) => {
    event.preventDefault();
    const requested = Number(removeTotal);

    if (
      removeTotal.trim() === "" ||
      !Number.isInteger(requested) ||
      requested < 0 ||
      requested > 12
    ) {
      setStatus("Enter a whole-number total from 0 to 12.");
      return;
    }

    const next = dominoes.filter((domino) => total(domino) !== requested);
    const removed = dominoes.length - next.length;
    replaceDominoes(next);
    setStatus(
      removed
        ? `Removed ${removed} tile${removed === 1 ? "" : "s"} totaling ${requested}.`
        : `No tiles add up to ${requested}.`
    );
  };

  const reset = () => {
    replaceDominoes(copy(ORIGINAL));
    setRemoveTotal("");
    setStatus("Restored the original seven tiles.");
  };

  return (
    <>
      <style>{styles}</style>
      <main className="page-shell">
        <header className="site-header">
          <a className="wordmark" href="#top" aria-label="Dominoes home">
            <span className="wordmark-mark" aria-hidden="true"><i /><i /></span>
            Dominoes
          </a>
          <p>Pair study No. 01</p>
        </header>

        <section className="hero" id="top">
          <div>
            <p className="eyebrow">A small exercise in order</p>
            <h1>Every pair,<br />plainly arranged.</h1>
            <p className="intro">Sort, flip and filter a classic set of dominoes.</p>
          </div>

          <dl className="stats" aria-label="Current set summary">
            <div><dt>Tiles</dt><dd>{String(stats.tiles).padStart(2, "0")}</dd></div>
            <div><dt>Double numbers</dt><dd>{String(stats.doubles).padStart(2, "0")}</dd></div>
            <div><dt>Total pips</dt><dd>{String(stats.pips).padStart(2, "0")}</dd></div>
          </dl>
        </section>

        <section className="workspace">
          <div className="board-panel">
            <div className="section-heading">
              <div><p className="section-index">01 / Collection</p><h2>Current set</h2></div>
              <p className="live-status" role="status" aria-live="polite">{status}</p>
            </div>

            {dominoes.length ? (
              <div className="domino-grid">
                {dominoes.map((domino, index) => (
                  <Domino key={`${domino[0]}-${domino[1]}-${index}`} values={domino} index={index} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-tiles" aria-hidden="true"><span /><span /></div>
                <h3>The table is clear.</h3>
                <p>Reset the collection to bring the original tiles back.</p>
                <button className="text-button" type="button" onClick={reset}>Restore collection</button>
              </div>
            )}
          </div>

          <aside className="control-panel">
            <div className="section-heading compact">
              <div><p className="section-index">02 / Controls</p><h2>Arrange the set</h2></div>
            </div>

            <form className="source-form" onSubmit={applySource}>
              <label htmlFor="source-array">Source</label>
              <p>Enter JSON pairs. Each side can be a whole number from 0 to 6.</p>
              <textarea
                id="source-array"
                rows="5"
                spellCheck="false"
                value={source}
                aria-invalid={Boolean(sourceError)}
                onChange={(event) => {
                  setSource(event.target.value);
                  setSourceError("");
                }}
              />
              <p className="source-example">Example: [[6,1],[1,1],[3,4]]</p>
              <p className="field-error" aria-live="polite">{sourceError}</p>
              <button className="apply-source-button" type="submit">Apply source <span>&rarr;</span></button>
            </form>

            <div className="control-group">
              <p className="control-label">Sort by pip total</p>
              <div className="button-row">
                <button type="button" onClick={() => applySort("asc")}>Low to high <span>&#8599;</span></button>
                <button type="button" onClick={() => applySort("desc")}>High to low <span>&#8600;</span></button>
              </div>
            </div>

            <div className="control-group">
              <p className="control-label">Transform</p>
              <div className="button-row">
                <button type="button" onClick={flipAll}>Flip all <span>&#8635;</span></button>
                <button type="button" onClick={removeRepeats}>Remove repeats <span>&minus;</span></button>
              </div>
            </div>

            <form className="remove-form" onSubmit={removeByTotal}>
              <label htmlFor="remove-total">Remove by total</label>
              <p>Clear every tile whose two sides add up to this value.</p>
              <div className="input-row">
                <input
                  id="remove-total"
                  type="number"
                  min="0"
                  max="12"
                  step="1"
                  placeholder="0-12"
                  value={removeTotal}
                  onChange={(event) => setRemoveTotal(event.target.value)}
                />
                <button type="submit">Remove</button>
              </div>
            </form>

            <button className="reset-button" type="button" onClick={reset}>Reset original set <span>&#8634;</span></button>
          </aside>
        </section>

        <footer><p>Any set. Seven small actions. One clear state.</p><p>Dominoes / 2026</p></footer>
      </main>
    </>
  );
}

const styles = `
  :root { --paper:#f2efe8; --ink:#1b1d1b; --muted:#686a63; --line:#cbc7bc; --accent:#c9583b; --tile:#f8f6ef; --tile-edge:#d5d0c4; }
  * { box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body { margin:0; background:linear-gradient(rgba(27,29,27,.028) 1px,transparent 1px),var(--paper); background-size:100% 5rem; color:var(--ink); font-family:Arial,Helvetica,sans-serif; }
  button,input,textarea { font:inherit; }
  button { color:inherit; }
  .page-shell { width:min(1440px,100%); min-height:100vh; margin:0 auto; padding:0 5vw; }
  .site-header { display:flex; align-items:center; justify-content:space-between; min-height:78px; border-bottom:1px solid var(--line); }
  .site-header p,footer p,.section-index,.control-label,.source-form label,.remove-form label,.domino-item figcaption { font-family:monospace; text-transform:uppercase; letter-spacing:.09em; }
  .site-header p { margin:0; color:var(--muted); font-size:.68rem; }
  .wordmark { display:inline-flex; gap:.7rem; align-items:center; color:var(--ink); font-size:.92rem; font-weight:650; text-decoration:none; }
  .wordmark-mark { position:relative; display:grid; width:18px; height:28px; border:1.5px solid; border-radius:3px; }
  .wordmark-mark:after { position:absolute; top:50%; right:2px; left:2px; height:1px; background:currentColor; content:""; }
  .wordmark-mark i { width:3px; height:3px; margin:auto; border-radius:50%; background:currentColor; }
  .hero { display:grid; grid-template-columns:minmax(0,1.55fr) minmax(360px,.75fr); gap:8vw; align-items:end; padding:clamp(4.75rem,10vw,8.5rem) 0 clamp(4rem,8vw,7rem); }
  .eyebrow,.section-index { margin:0 0 1.6rem; color:var(--accent); font-family:monospace; font-size:.68rem; font-weight:650; letter-spacing:.1em; text-transform:uppercase; }
  h1 { margin:0; font-size:clamp(3.5rem,8vw,8.2rem); font-weight:520; letter-spacing:-.075em; line-height:.86; }
  .intro { max-width:510px; margin:2.3rem 0 0; color:var(--muted); font-size:clamp(1rem,1.4vw,1.18rem); line-height:1.6; }
  .stats { display:grid; grid-template-columns:repeat(3,1fr); margin:0; border-top:1px solid var(--ink); }
  .stats div { padding:1.2rem .25rem 0 0; }
  .stats dt { color:var(--muted); font-size:.72rem; }
  .stats dd { margin:.5rem 0 0; font-size:clamp(1.7rem,3vw,2.5rem); letter-spacing:-.06em; }
  .workspace { display:grid; grid-template-columns:minmax(0,1fr) minmax(290px,365px); border-top:1px solid var(--ink); border-bottom:1px solid var(--ink); }
  .board-panel { min-height:640px; padding:2.2rem clamp(1.5rem,4vw,4.2rem) 3.25rem 0; border-right:1px solid var(--ink); }
  .control-panel { padding:2.2rem 0 2.2rem clamp(1.5rem,3vw,3rem); }
  .section-heading { display:flex; gap:2rem; align-items:flex-end; justify-content:space-between; }
  .section-heading.compact { display:block; }
  .section-index { margin-bottom:.7rem; color:var(--muted); }
  .section-heading h2 { margin:0; font-size:clamp(1.65rem,2.6vw,2.35rem); font-weight:540; letter-spacing:-.045em; }
  .live-status { max-width:290px; margin:0; color:var(--muted); font-size:.78rem; line-height:1.45; text-align:right; }
  .domino-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(96px,1fr)); gap:clamp(1.6rem,3vw,3rem) clamp(1rem,2.5vw,2.25rem); align-items:start; margin-top:clamp(3rem,7vw,6.25rem); }
  .domino-item { display:grid; gap:1rem; justify-items:center; margin:0; animation:tile-in 460ms cubic-bezier(.2,.75,.2,1) both; animation-delay:calc(var(--tile-index) * 45ms); }
  .domino-tile { display:grid; width:clamp(78px,7.2vw,98px); aspect-ratio:.52; padding:clamp(.65rem,1.2vw,.9rem); border:1px solid #bbb6ab; border-radius:10px; background:var(--tile); box-shadow:0 3px 0 var(--tile-edge),0 16px 28px rgba(43,39,33,.12); transition:box-shadow 180ms,transform 180ms; }
  .domino-item:hover .domino-tile { box-shadow:0 3px 0 var(--tile-edge),0 22px 36px rgba(43,39,33,.18); transform:translateY(-6px); }
  .pip-face { display:grid; grid-template:repeat(3,1fr)/repeat(3,1fr); align-items:center; justify-items:center; min-height:0; }
  .pip { width:clamp(7px,.75vw,10px); aspect-ratio:1; border-radius:50%; background:var(--ink); }
  .domino-divider { height:1px; margin:0 -.2rem; background:#aaa69d; }
  .domino-item figcaption { color:var(--muted); font-size:.58rem; }
  .control-group,.source-form,.remove-form { margin-top:2.4rem; padding-top:1.35rem; border-top:1px solid var(--line); }
  .control-label,.source-form label,.remove-form label { display:block; margin:0 0 .9rem; font-size:.68rem; font-weight:650; }
  .source-form>p,.remove-form p { margin:-.3rem 0 1.1rem; color:var(--muted); font-size:.78rem; line-height:1.5; }
  .source-form textarea { display:block; width:100%; min-height:112px; padding:.85rem; resize:vertical; border:1px solid var(--ink); border-radius:0; background:rgba(255,255,255,.28); color:var(--ink); font-family:monospace; font-size:.74rem; line-height:1.55; }
  .source-form textarea[aria-invalid="true"] { border-color:var(--accent); }
  .source-form .source-example { margin:.7rem 0 0; font-family:monospace; font-size:.65rem; }
  .source-form .field-error { min-height:1.2rem; margin:.45rem 0 0; color:var(--accent); font-size:.72rem; }
  .button-row { display:grid; grid-template-columns:1fr 1fr; gap:.55rem; }
  .button-row button,.input-row button,.apply-source-button,.reset-button,.text-button { border:1px solid var(--ink); border-radius:0; background:transparent; cursor:pointer; transition:background 150ms,color 150ms,transform 150ms; }
  .button-row button { display:flex; min-height:58px; padding:.8rem; align-items:center; justify-content:space-between; font-size:.78rem; text-align:left; }
  .apply-source-button,.reset-button { display:flex; width:100%; min-height:52px; padding:0 1rem; align-items:center; justify-content:space-between; }
  .apply-source-button { margin-top:.55rem; }
  .button-row button:hover,.input-row button:hover,.apply-source-button:hover,.reset-button:hover { background:var(--ink); color:var(--paper); }
  button:focus-visible,input:focus-visible,textarea:focus-visible,a:focus-visible { outline:2px solid var(--accent); outline-offset:3px; }
  .input-row { display:grid; grid-template-columns:1fr auto; }
  .input-row input { min-width:0; height:52px; padding:0 .9rem; border:1px solid var(--ink); border-right:0; border-radius:0; background:rgba(255,255,255,.28); }
  .input-row button { min-width:90px; padding:0 1rem; }
  .reset-button { min-height:58px; margin-top:2.6rem; border-color:var(--accent); color:var(--accent); }
  .empty-state { display:grid; min-height:440px; place-content:center; justify-items:center; text-align:center; }
  .empty-tiles { display:flex; margin-bottom:1.5rem; }
  .empty-tiles span { width:42px; aspect-ratio:.52; border:1px dashed var(--line); border-radius:6px; transform:rotate(-8deg); }
  .empty-tiles span+span { margin-left:-8px; transform:rotate(9deg); }
  .empty-state h3 { margin:0; font-size:1.55rem; font-weight:540; }
  .empty-state p { max-width:290px; margin:.6rem 0 1.2rem; color:var(--muted); font-size:.88rem; line-height:1.5; }
  .text-button { padding:.65rem 0; border:0; border-bottom:1px solid var(--ink); }
  footer { display:flex; justify-content:space-between; padding:1.5rem 0 2.25rem; color:var(--muted); font-size:.6rem; }
  footer p { margin:0; }
  @keyframes tile-in { from { opacity:0; transform:translateY(16px); } }
  @media(max-width:980px) { .hero{grid-template-columns:1fr;gap:3.5rem}.stats{max-width:520px}.workspace{grid-template-columns:1fr}.board-panel{min-height:auto;padding-right:0;border-right:0;border-bottom:1px solid var(--ink)}.control-panel{padding:2.5rem 0 3rem}.source-form,.remove-form,.reset-button{max-width:560px} }
  @media(max-width:580px) { .page-shell{padding:0 1.15rem}.site-header{min-height:68px}.hero{padding:4rem 0 4.5rem}h1{font-size:clamp(3.25rem,17.5vw,5rem)}.stats{gap:.6rem}.section-heading{display:block}.live-status{margin-top:.8rem;text-align:left}.domino-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:1.8rem .6rem;margin-top:3.75rem}.domino-tile{width:min(100%,78px)}.button-row{grid-template-columns:1fr}footer p:first-child{display:none}footer{justify-content:flex-end} }
  @media(prefers-reduced-motion:reduce) { *,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important} }
`;
