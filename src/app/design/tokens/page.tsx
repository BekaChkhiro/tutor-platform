const colors = {
  primary: {
    50: { hex: '#EEF1FF', label: 'primary-50' },
    100: { hex: '#DDE3FF', label: 'primary-100' },
    500: { hex: '#3D52F5', label: 'primary-500 — main brand' },
    600: { hex: '#2A3FE0', label: 'primary-600 — hover' },
    700: { hex: '#1F30B8', label: 'primary-700 — pressed' },
    900: { hex: '#0F1A6B', label: 'primary-900 — deep accent' },
  },
  accent: {
    50: { hex: '#FFF1EC', label: 'accent-50' },
    500: { hex: '#FF8A65', label: 'accent-500 — main accent' },
    600: { hex: '#F76B43', label: 'accent-600 — hover' },
  },
  neutral: {
    0: { hex: '#FFFFFF', label: 'neutral-0' },
    50: { hex: '#FAFAF7', label: 'neutral-50 — page surface' },
    100: { hex: '#F4F4EF', label: 'neutral-100 — card subtle' },
    200: { hex: '#E8E8E2', label: 'neutral-200' },
    400: { hex: '#9CA3AF', label: 'neutral-400' },
    600: { hex: '#4B5563', label: 'neutral-600' },
    900: { hex: '#1A1A1A', label: 'neutral-900 — main text' },
  },
  semantic: {
    success: { hex: '#10B981', label: 'success — booking confirmed' },
    warning: { hex: '#F59E0B', label: 'warning — expiring soon' },
    danger: { hex: '#EF4444', label: 'danger — errors only' },
  },
};

const shadows = [
  { name: 'shadow-rest', value: '0 1px 2px rgba(16,24,40,0.04)', use: 'Default card elevation' },
  { name: 'shadow-hover', value: '0 4px 12px rgba(16,24,40,0.08)', use: 'Hovered card' },
  { name: 'shadow-modal', value: '0 24px 48px rgba(16,24,40,0.16)', use: 'Modals / popovers' },
  { name: 'shadow-focus', value: '0 0 0 3px rgba(61,82,245,0.12)', use: 'Focus ring' },
];

const typography = [
  {
    token: 'display',
    size: '72px',
    lh: '1.05',
    ls: '-0.02em',
    weight: '700',
    use: 'Hero headlines',
  },
  { token: 'h1', size: '48px', lh: '1.1', ls: '-0.01em', weight: '700', use: 'Page titles' },
  { token: 'h2', size: '32px', lh: '1.2', ls: '—', weight: '600', use: 'Section headers' },
  { token: 'h3', size: '24px', lh: '1.3', ls: '—', weight: '600', use: 'Subsection' },
  { token: 'h4', size: '20px', lh: '1.4', ls: '—', weight: '600', use: 'Card titles' },
  { token: 'body-lg', size: '18px', lh: '1.6', ls: '—', weight: '400', use: 'Lead paragraphs' },
  { token: 'body', size: '16px', lh: '1.6', ls: '—', weight: '400', use: 'Default' },
  { token: 'body-sm', size: '14px', lh: '1.5', ls: '—', weight: '400', use: 'Secondary' },
  { token: 'caption', size: '13px', lh: '1.4', ls: '—', weight: '500', use: 'Meta / labels' },
];

const radii = [
  { token: 'rounded-sm', value: '6px', use: 'Badges, tags, chips' },
  { token: 'rounded', value: '10px', use: 'Buttons, inputs' },
  { token: 'rounded-card', value: '14px', use: 'Cards' },
  { token: 'rounded-modal', value: '20px', use: 'Modals, sheets' },
  { token: 'rounded-full', value: '9999px', use: 'Pills, avatars' },
];

const easing = [
  { token: 'ease-default', value: 'cubic-bezier(0.4, 0, 0.2, 1)', use: 'Standard transitions' },
  { token: 'ease-bounce', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', use: 'Playful interactions' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-h2 mb-6 border-b border-neutral-200 pb-3 font-semibold text-neutral-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ColorSwatch({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="rounded-card h-12 w-12 flex-shrink-0 border border-neutral-200"
        style={{ backgroundColor: hex }}
      />
      <div>
        <p className="text-caption font-mono font-medium text-neutral-900">{hex}</p>
        <p className="text-caption text-neutral-600">{label}</p>
      </div>
    </div>
  );
}

export default function DesignTokensPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl px-8 py-16">
        <header className="mb-16">
          <p className="text-caption text-primary-500 mb-2 font-medium tracking-widest uppercase">
            Design System
          </p>
          <h1 className="text-h1 mb-4 font-bold text-neutral-900">Token Reference</h1>
          <p className="text-body-lg text-neutral-600">
            Every visual constant in the design system. Source of truth for implementation.
          </p>
        </header>

        <Section title="Colors — Primary (Indigo)">
          <p className="text-body-sm mb-4 text-neutral-600">
            Trust, calm, action. Main brand color.
          </p>
          <div className="grid grid-cols-2 gap-x-8 md:grid-cols-3">
            {Object.values(colors.primary).map((c) => (
              <ColorSwatch key={c.hex} hex={c.hex} label={c.label} />
            ))}
          </div>
        </Section>

        <Section title="Colors — Accent (Coral)">
          <p className="text-body-sm mb-4 text-neutral-600">Warmth, energy. CTA emphasis only.</p>
          <div className="grid grid-cols-2 gap-x-8 md:grid-cols-3">
            {Object.values(colors.accent).map((c) => (
              <ColorSwatch key={c.hex} hex={c.hex} label={c.label} />
            ))}
          </div>
        </Section>

        <Section title="Colors — Neutral (Warm Grey)">
          <p className="text-body-sm mb-4 text-neutral-600">
            Not pure greys — slight warm cast throughout the scale.
          </p>
          <div className="grid grid-cols-2 gap-x-8 md:grid-cols-3">
            {Object.values(colors.neutral).map((c) => (
              <ColorSwatch key={c.hex} hex={c.hex} label={c.label} />
            ))}
          </div>
        </Section>

        <Section title="Colors — Semantic">
          <p className="text-body-sm mb-4 text-neutral-600">Status and feedback. Use sparingly.</p>
          <div className="grid grid-cols-2 gap-x-8 md:grid-cols-3">
            {Object.values(colors.semantic).map((c) => (
              <ColorSwatch key={c.hex} hex={c.hex} label={c.label} />
            ))}
          </div>
        </Section>

        <Section title="Elevation — Shadows">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {shadows.map((s) => (
              <div
                key={s.name}
                className="bg-neutral-0 rounded-card p-5"
                style={{ boxShadow: s.value }}
              >
                <p className="text-caption mb-1 font-mono font-medium text-neutral-900">{s.name}</p>
                <p className="text-caption mb-2 text-neutral-600">{s.use}</p>
                <p className="text-caption font-mono text-neutral-400">{s.value}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography Scale">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200">
                  {['Token', 'Size', 'Line-height', 'Letter-spacing', 'Weight', 'Use'].map((h) => (
                    <th key={h} className="text-caption pr-6 pb-3 font-medium text-neutral-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {typography.map((t) => (
                  <tr key={t.token} className="border-b border-neutral-100">
                    <td className="text-caption text-primary-600 py-3 pr-6 font-mono">
                      text-{t.token}
                    </td>
                    <td className="text-caption py-3 pr-6 font-mono text-neutral-900">{t.size}</td>
                    <td className="text-caption py-3 pr-6 text-neutral-600">{t.lh}</td>
                    <td className="text-caption py-3 pr-6 text-neutral-600">{t.ls}</td>
                    <td className="text-caption py-3 pr-6 text-neutral-600">{t.weight}</td>
                    <td className="text-caption py-3 pr-6 text-neutral-600">{t.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 space-y-4">
            {typography.map((t) => (
              <div key={t.token} className="flex items-baseline gap-4">
                <span className="text-caption w-20 flex-shrink-0 font-mono text-neutral-400">
                  {t.token}
                </span>
                <span
                  className="leading-none text-neutral-900"
                  style={{
                    fontSize: t.size,
                    fontWeight: t.weight,
                    letterSpacing: t.ls === '—' ? undefined : t.ls,
                  }}
                >
                  The quick brown fox
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Border Radius">
          <div className="flex flex-wrap gap-6">
            {radii.map((r) => (
              <div key={r.token} className="text-center">
                <div
                  className="bg-primary-100 border-primary-200 mb-2 h-16 w-16 border"
                  style={{ borderRadius: r.value }}
                />
                <p className="text-caption font-mono text-neutral-900">{r.token}</p>
                <p className="text-caption text-neutral-600">{r.value}</p>
                <p className="text-caption text-neutral-400">{r.use}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Transition Easing">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {easing.map((e) => (
              <div
                key={e.token}
                className="bg-neutral-0 rounded-card border border-neutral-200 p-5"
              >
                <p className="text-caption mb-1 font-mono font-medium text-neutral-900">
                  {e.token}
                </p>
                <p className="text-caption mb-2 text-neutral-600">{e.use}</p>
                <p className="text-caption font-mono text-neutral-400">{e.value}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Font Families">
          <div className="space-y-6">
            <div>
              <p className="text-caption text-primary-600 mb-1 font-mono">font-sans</p>
              <p
                className="text-body text-neutral-900"
                style={{
                  fontFamily: 'var(--font-noto-sans-georgian), var(--font-inter), sans-serif',
                }}
              >
                Noto Sans Georgian + Inter — UI text, headings, body
              </p>
              <p
                className="text-caption mt-1 text-neutral-900"
                style={{ fontFamily: 'var(--font-noto-sans-georgian)' }}
              >
                ქართული ტექსტი — Georgian script support
              </p>
            </div>
            <div>
              <p className="text-caption text-primary-600 mb-1 font-mono">font-numeric</p>
              <p
                className="text-body text-neutral-900"
                style={{
                  fontFamily: 'var(--font-inter), sans-serif',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                Inter — 1,234.56 ₾ · 09:30 AM · 24 Jan 2026
              </p>
            </div>
            <div>
              <p className="text-caption text-primary-600 mb-1 font-mono">font-mono</p>
              <p className="text-body font-mono text-neutral-900">
                JetBrains Mono — code, IDs, technical strings
              </p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
