# Mobile Canvas Sharpness — How We Fixed the Blurry Pet

## The Problem

On mobile (iPhone and other retina devices), the Three.js WebGL canvas rendered the pet scene soft and blurry. Refreshing the page sometimes improved it. The background image inside the pet container looked low-resolution even though the assets were high quality.

Two separate causes:

1. **Wrong pixel ratio** — The renderer was created without `setPixelRatio()`, so it rendered at 1x on a 2x or 3x retina screen. CSS then upscaled the canvas to fill the container, making everything blurry.
2. **CSS filter too weak** — The canvas had `filter: contrast(1.15)` which helped on desktop but wasn't punchy enough on mobile.

---

## Fix 1 — Pixel Ratio (root cause)

In `src/main-test.js`, after `renderer.setSize()`:

```js
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

`window.devicePixelRatio` is 2 on most iPhones and 3 on Pro models. Capped at 2 to avoid the GPU cost of 3x rendering, which is rarely perceptible but doubles memory use.

This makes the canvas render at native retina resolution — the single biggest quality improvement.

---

## Fix 2 — CSS Filter Boost

In `src/assets/styles/main.css`, on `#pet-container canvas`:

```css
filter: contrast(1.25) saturate(1.1);
```

- `contrast(1.25)` — sharpens perceived edges and punches up the scene
- `saturate(1.1)` — makes the cyberpunk colors more vivid on mobile displays which tend to oversaturate anyway — this counterintuitively makes the image look more "correct"

---

## Bonus — Load-time resize fix

The renderer was also sometimes blurry on first mobile load because `offsetWidth/offsetHeight` are read before CSS media queries fully apply. Fixed by adding a forced resize on `window load`:

```js
window.addEventListener("load", () => {
  resizeRendererToContainer(renderer, camera);
  fitModelForViewport(activeModel, lastBaseScale);
});
```

This also fixed evolution effect overlays appearing in the wrong position on mobile (they use `getCatMaskData()` which projects 3D→CSS coordinates; wrong canvas dimensions meant wrong percentages).
