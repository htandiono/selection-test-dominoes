import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished dominoes workspace", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();

  assert.match(html, /<title>Dominoes — Sort, flip &amp; filter<\/title>/i);
  assert.match(html, /Every pair,/);
  assert.match(html, /plainly arranged\./);
  assert.match(html, /Current set/);
  assert.match(html, /Arrange the set/);
  assert.match(html, />Source</);
  assert.match(html, /Apply source/);
  assert.match(html, /Double numbers/);
  assert.match(html, /Remove repeats/);
  assert.match(html, /Remove by total/);
  assert.match(html, /Reset original set/);
  assert.equal((html.match(/data-domino="true"/g) ?? []).length, 7);
});

test("ships finished metadata and no disposable starter preview", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /property="og:image" content="http:\/\/localhost\/og\.png"/i);
  assert.match(html, /name="twitter:card" content="summary_large_image"/i);
  assert.doesNotMatch(html, /codex-preview/i);
  assert.doesNotMatch(html, /react-loading-skeleton/i);
  assert.doesNotMatch(html, /Your site is taking shape/i);
});
