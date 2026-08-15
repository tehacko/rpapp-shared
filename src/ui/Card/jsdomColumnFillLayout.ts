/**
 * jsdom does not run a layout engine (offsetHeight / getBoundingClientRect stay 0).
 * This harness resolves a minimal column-flex / percentage-height tree from a
 * definite parent size so tests can assert measured fill / footer pin.
 */

export interface JsdomLayoutBox {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

function installMeasuredBox(el: HTMLElement, box: JsdomLayoutBox): void {
  const right = box.left + box.width;
  const bottom = box.top + box.height;
  Object.defineProperty(el, 'offsetHeight', {
    configurable: true,
    get: () => box.height,
  });
  Object.defineProperty(el, 'offsetWidth', {
    configurable: true,
    get: () => box.width,
  });
  Object.defineProperty(el, 'clientHeight', {
    configurable: true,
    get: () => box.height,
  });
  Object.defineProperty(el, 'clientWidth', {
    configurable: true,
    get: () => box.width,
  });
  el.getBoundingClientRect = (): DOMRect =>
    ({
      x: box.left,
      y: box.top,
      top: box.top,
      left: box.left,
      width: box.width,
      height: box.height,
      right,
      bottom,
      toJSON: () => ({
        x: box.left,
        y: box.top,
        top: box.top,
        left: box.left,
        width: box.width,
        height: box.height,
        right,
        bottom,
      }),
    }) as DOMRect;
}

function parseCssLength(value: string, percentBase: number): number | null {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === 'auto') {
    return null;
  }
  if (trimmed.endsWith('%')) {
    const pct = Number.parseFloat(trimmed);
    return Number.isFinite(pct) ? (percentBase * pct) / 100 : null;
  }
  if (trimmed.endsWith('px')) {
    const px = Number.parseFloat(trimmed);
    return Number.isFinite(px) ? px : null;
  }
  const raw = Number.parseFloat(trimmed);
  return Number.isFinite(raw) ? raw : null;
}

function parseAspectRatioHeight(aspectRatio: string, widthPx: number): number | null {
  const match = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(aspectRatio.trim());
  if (!match) {
    return null;
  }
  const w = Number.parseFloat(match[1] ?? '');
  const h = Number.parseFloat(match[2] ?? '');
  if (!(w > 0) || !(h > 0)) {
    return null;
  }
  return widthPx * (h / w);
}

function isFlexColumn(cs: CSSStyleDeclaration): boolean {
  return (
    cs.display === 'flex' &&
    (cs.flexDirection === 'column' || cs.flexDirection === 'column-reverse')
  );
}

function resolveBaseHeight(
  el: HTMLElement,
  cs: CSSStyleDeclaration,
  parentHeight: number,
  parentWidth: number,
): number {
  const aspectH = parseAspectRatioHeight(cs.aspectRatio || '', parentWidth);
  if (aspectH !== null) {
    return aspectH;
  }
  const explicit = parseCssLength(cs.height, parentHeight);
  if (explicit !== null) {
    return explicit;
  }
  if (el.classList.contains('h-full')) {
    return parentHeight;
  }
  const grow = Number.parseFloat(cs.flexGrow || '0') || 0;
  if (grow > 0) {
    return 0;
  }
  // Intrinsic stub for text/controls when jsdom reports no layout.
  return el.tagName === 'BUTTON' ? 40 : 20;
}

function layoutFlexColumnChildren(parent: HTMLElement, box: JsdomLayoutBox): void {
  const children = Array.from(parent.children).filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );
  if (children.length === 0) {
    return;
  }

  type Plan = {
    el: HTMLElement;
    grow: number;
    base: number;
    marginTopAuto: boolean;
  };

  const plans: Plan[] = children.map((el) => {
    const cs = getComputedStyle(el);
    return {
      el,
      grow: Number.parseFloat(cs.flexGrow || '0') || 0,
      base: resolveBaseHeight(el, cs, box.height, box.width),
      marginTopAuto: cs.marginTop === 'auto',
    };
  });

  let used = plans.reduce((sum, plan) => sum + plan.base, 0);
  let free = box.height - used;
  const growSum = plans.reduce(
    (sum, plan) => (plan.grow > 0 ? sum + plan.grow : sum),
    0,
  );

  if (growSum > 0 && free > 0) {
    for (const plan of plans) {
      if (plan.grow > 0) {
        plan.base += free * (plan.grow / growSum);
      }
    }
    free = 0;
  }

  const autoMarginCount = plans.filter((plan) => plan.marginTopAuto).length;
  const autoMargin = autoMarginCount > 0 && free > 0 ? free / autoMarginCount : 0;

  let y = box.top;
  for (const plan of plans) {
    if (plan.marginTopAuto) {
      y += autoMargin;
    }
    applyJsdomColumnFillLayout(plan.el, {
      top: y,
      left: box.left,
      width: box.width,
      height: plan.base,
    });
    y += plan.base;
  }
}

/**
 * Install measured boxes for `root` and descendants using flex-column / % height rules.
 */
export function applyJsdomColumnFillLayout(
  root: HTMLElement,
  box: JsdomLayoutBox,
): void {
  installMeasuredBox(root, box);
  const cs = getComputedStyle(root);
  const children = Array.from(root.children).filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );

  if (children.length === 0) {
    return;
  }

  if (isFlexColumn(cs)) {
    layoutFlexColumnChildren(root, box);
    return;
  }

  for (const child of children) {
    const childCs = getComputedStyle(child);
    const height = resolveBaseHeight(child, childCs, box.height, box.width);
    applyJsdomColumnFillLayout(child, {
      top: box.top,
      left: box.left,
      width: box.width,
      height: height > 0 ? height : box.height,
    });
  }
}

/** Resolve definite parent size then fill the subtree (parent itself is measured). */
export function applyJsdomColumnFillFromParent(
  parent: HTMLElement,
  widthPx: number,
  heightPx: number,
): void {
  applyJsdomColumnFillLayout(parent, {
    top: 0,
    left: 0,
    width: widthPx,
    height: heightPx,
  });
}
