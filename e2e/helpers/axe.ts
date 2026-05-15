import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

export interface AxeScanOptions {
  /** Restrict scan to a CSS selector. */
  include?: string | string[];
  /** Exclude a CSS selector from the scan. */
  exclude?: string | string[];
  /** Override the default tag set (wcag2a, wcag2aa, wcag21a, wcag21aa). */
  tags?: string[];
  /** Disable specific rules (e.g. third-party widget noise). */
  disableRules?: string[];
}

const DEFAULT_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * Run axe-core against the page and assert no critical violations.
 *
 * Returns the full result so callers can additionally assert on `serious`,
 * `moderate`, or `minor` levels when stricter coverage is wanted.
 */
export async function scanForA11yViolations(page: Page, options: AxeScanOptions = {}) {
  let builder = new AxeBuilder({ page }).withTags(options.tags ?? DEFAULT_TAGS);

  if (options.include) builder = builder.include(options.include);
  if (options.exclude) builder = builder.exclude(options.exclude);
  if (options.disableRules?.length) builder = builder.disableRules(options.disableRules);

  const result = await builder.analyze();
  const critical = result.violations.filter((v) => v.impact === 'critical');

  expect(critical, formatViolations(critical, 'critical')).toEqual([]);

  return result;
}

function formatViolations(
  violations: { id: string; help: string; nodes: unknown[] }[],
  level: string,
): string {
  if (violations.length === 0) return `No ${level} accessibility violations`;
  return `Found ${violations.length} ${level} a11y violation(s):\n${violations
    .map((v) => `  • [${v.id}] ${v.help} (${v.nodes.length} node(s))`)
    .join('\n')}`;
}
