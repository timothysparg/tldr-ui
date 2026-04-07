# Clipboard Refactor Plan

## Goal

Move clipboard handling to a progressive-enhancement model:

- the AsciiDoc converter emits final code-block structure and explicit copy metadata
- the browser script becomes a small delegated click handler with transient success feedback

## Plan

### 1. Make the converter the source of truth for code-block markup

Status: In progress

- Keep rendering final `code-header` markup in the AsciiDoc extension.
- Ensure console literal blocks are emitted in final listing-style form during conversion.
- Add explicit button metadata:
  - `type="button"`
  - `aria-label="Copy code"`
  - `data-copy-mode="raw|console"`

### 2. Push copy semantics into HTML instead of runtime inference

- Status: Implemented

- For normal code blocks, mark buttons with `data-copy-mode="raw"`.
- For console blocks, mark buttons with `data-copy-mode="console"`.
- Add `data-copy-text` so the browser does not need to parse most code text at runtime.

### 3. Simplify the browser script to delegated behavior only

Status: Implemented

- Replace the page-load scan in `src/js/06-copy-to-clipboard.js` with one delegated click listener on `document` or `article`.
- On click:
  - find the nearest `.copy-button`
  - find the associated `code` element in the same block
  - read `data-copy-mode`
  - generate the copy payload from the code text
  - call `navigator.clipboard.writeText(...)`

### 4. Remove runtime DOM mutation

Status: Implemented

- Delete logic that:
  - scans `article pre.highlight, article .literalblock pre`
  - rewrites console literal blocks into listing blocks
  - inserts fallback `code-header` markup
- After this change, if a block is copyable, it should already have final markup from the converter.

### 5. Keep success feedback lightweight and explicit

Status: Implemented

- Short term: keep the current icon text swap from `content_copy` to `done`.
- Also toggle a short-lived state class like `is-copied` on the button for styling hooks.
- Longer term: consider moving more of the success-state visuals into CSS.

### 6. Verify the emitted markup contract

- Each copyable block should have:
  - `.code-header`
  - `.copy-button`
  - `type="button"`
  - `title="Copy to clipboard"`
  - `aria-label="Copy code"`
  - `data-copy-mode`
- The associated code element should remain easy to resolve relative to the button.

## File Changes

- `extensions/lib/code-block-ui.js`
  - add button attributes and copy metadata
  - make console blocks fully final at render time
- `extensions/lib/html5-converter.js`
  - continue routing console literal blocks through the final rendering path
- `src/js/06-copy-to-clipboard.js`
  - replace preprocessing loop with delegated click handling
  - keep only copy-text extraction and success feedback

## Implementation Order

1. Update converter output and metadata. Implemented.
2. Refactor the JS to delegated click handling. Done.
3. Remove DOM mutation and fallback code. Done.
4. Verify preview and console-block copy behavior. Pending.
5. Optionally decide whether any remaining runtime parsing is still worth keeping. Pending.

## Expected Result

The browser code becomes small and idiomatic:

- one listener
- explicit metadata
- no structural DOM rewrites
- converter owns markup
- client owns interaction
