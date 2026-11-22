"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, TextField } from "../components/ui";
import ComponentWorkbench from "./ComponentWorkbench";
import ThemeToggle from "../components/ThemeToggle";
import { DialogPreview } from "../components/ui/DialogPreview";
import { ControlsPreview } from "../components/ui/ControlsPreview";
import { DataDisplayPreview } from "../components/ui/DataDisplayPreview";
import styles from "./DesignSystemClient.module.css";

const sections = [
  ["01","TYPOGRAPHY","type-heading","Text hierarchy and reading roles"],
  ["02","ACTIONS","buttons-heading","Buttons and action states"],
  ["03","FEEDBACK","feedback-heading","Status, alerts and messages"],
  ["04","FORMS","form-heading","Fields, labels and validation"],
  ["05","DIALOG","dialog-heading","Modal and confirmation patterns"],
  ["06","NAVIGATION & CONTROLS","controls-heading","Breadcrumbs, tabs and choices"],
  ["07","RESPONSIVE LAYOUT","layout-heading","Grid and responsive behavior"],
  ["08","DATA DISPLAY","data-heading","Loading, empty, error and data"],
  ["09","ICONOGRAPHY","iconography-heading","Icon roles, sizing and usage"],
  ["10","COLOR SYSTEM","color-heading","Semantic palette and status colors"],
  ["11","SPACING & SIZING","spacing-heading","Spacing scale and sizing roles"],
  ["12","SURFACES & ELEVATION","surface-heading","Surfaces, borders, radius and shadows"],
  ["13","INTERACTION STATES","states-heading","Hover, focus, active and disabled"],
  ["14","COMPONENT WORKBENCH","workbench-heading","Live previews of the shared React component inventory"],
];

const tokenColors = [
  ["Background","--df-bg"],["Surface","--df-surface"],["Raised surface","--df-surface-raised"],
  ["Overlay","--df-surface-overlay"],["Primary","--df-primary"],["Primary hover","--df-primary-hover"],
  ["Secondary","--df-secondary"],["Accent","--df-accent"],["Success","--df-success"],
  ["Warning","--df-warning"],["Danger","--df-danger"],["Info","--df-info"],
  ["Text","--df-text"],["Text secondary","--df-text-secondary"],["Text muted","--df-text-muted"],
  ["Border","--df-border"],["Focus","--df-focus"],
];

const spacing = [
  ["space-1","4px"],["space-2","8px"],["space-3","12px"],["space-4","16px"],
  ["space-5","20px"],["space-6","24px"],["space-8","32px"],["space-10","40px"],
  ["space-12","48px"],["space-16","64px"],["space-20","80px"],["space-24","96px"],
];

function Section({ id, title, headingId, description, open, onToggle, children }) {
  return (
    <section id={id} className={styles.section} aria-labelledby={headingId}>
      <button className={styles.sectionToggle} type="button" aria-expanded={open} aria-controls={id + "-content"} onClick={onToggle}>
        <span className={styles.sectionNumber}>{id}</span>
        <span className={styles.sectionHeading}>
          <span id={headingId} className={styles.sectionTitle}>{title}</span>
          <span className={styles.sectionDescription}>{description}</span>
        </span>
        <span className={styles.chevron} aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && <div id={id + "-content"} className={styles.sectionContent}>{children}</div>}
    </section>
  );
}

export default function DesignSystemClient() {
  const [expanded, setExpanded] = useState({ "01": true });
  const [showTop, setShowTop] = useState(false);
  const openCount = useMemo(() => Object.values(expanded).filter(Boolean).length, [expanded]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggle = (number) => setExpanded((current) => ({ ...current, [number]: !current[number] }));
  const jump = (number) => {
    setExpanded((current) => ({ ...current, [number]: true }));
    window.setTimeout(() => document.getElementById(number)?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  };
  const openAll = () => setExpanded(Object.fromEntries(sections.map(([n]) => [n, true])));
  const closeAll = () => setExpanded({});

  return (
    <main className={"ui-page df-design-system " + styles.page}>
      <header className={"ui-page-header ui-stack " + styles.hero}>
        <div className="ui-cluster" style={{ justifyContent: "space-between" }}>
          <Badge variant="info">Internal preview · v1.1</Badge>
          <ThemeToggle />
        </div>
        <p className="ui-eyebrow">DAJJAL FAMILY / FOUNDATION</p>
        <h1 className="ui-heading-h1">Design System</h1>
        <p className="ui-subtitle">A controlled lab for reviewing shared foundations and reusable interface components across themes and screen sizes.</p>
        <div className={styles.progress}>
          <div className={styles.progressHead}><strong>Shared component inventory</strong><span>28 / 28 shared components</span></div>
          <div className={styles.progressTrack} role="progressbar" aria-label="Shared React components inventoried" aria-valuemin="0" aria-valuemax="28" aria-valuenow="28"><span style={{ width: "100%" }} /></div>
          <small>All 28 shared React exports are inventoried. Workbench previews use the production component implementations; visual QA remains pending.</small>
        </div>
      </header>

      <nav className={styles.navigator} aria-label="Design System section navigation">
        <div className={styles.navTop}><strong>JUMP TO SECTION</strong><span>{openCount} open</span></div>
        <div className={styles.navGroups}>
          <button type="button" onClick={() => jump("01")}>01–08 <span>Existing</span></button>
          <button type="button" onClick={() => jump("09")}>09–13 <span>Foundation</span></button>
          <button type="button" onClick={() => jump("14")}>14 <span>Workbench</span></button>
          <button type="button" onClick={openAll}>Open all</button>
          <button type="button" onClick={closeAll}>Close all</button>
        </div>
        <div className={styles.navNumbers}>
          {sections.map(([number, title]) => <button type="button" key={number} onClick={() => jump(number)} aria-label={"Jump to " + number + " " + title}>{number}</button>)}
        </div>
      </nav>

      <div className={styles.sectionList}>
        <Section id="01" title="TYPOGRAPHY" headingId="type-heading" description="Text hierarchy and reading roles" open={!!expanded["01"]} onToggle={() => toggle("01")}>
          <Card className="ui-stack" style={{ padding: "var(--df-space-5)" }}>
            <h1 className="ui-heading-h1">Page heading H1</h1><h2 className="ui-heading-h2">Section heading H2</h2><h3 className="ui-heading-h3">Subsection heading H3</h3><h4 className="ui-heading-h4">Component heading H4</h4>
            <p className="ui-prose">Body copy is designed for sustained reading. The reading measure is intentionally limited so long paragraphs remain comfortable on desktop and mobile screens.</p>
            <p className="ui-caption">Caption · supporting metadata · 14px</p><p className="ui-gradient-text" style={{ fontWeight: 800 }}>One Family. Many Possibilities.</p>
          </Card>
        </Section>

        <Section id="02" title="ACTIONS" headingId="buttons-heading" description="Buttons and action states" open={!!expanded["02"]} onToggle={() => toggle("02")}>
          <Card className="ui-cluster" style={{ padding: "var(--df-space-5)" }}>
            <Button>Primary action</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Danger</Button><Button size="sm">Small</Button><Button size="lg">Large</Button><Button loading>Loading</Button><Button disabled>Disabled</Button>
          </Card>
        </Section>

        <Section id="03" title="FEEDBACK" headingId="feedback-heading" description="Status, alerts and messages" open={!!expanded["03"]} onToggle={() => toggle("03")}>
          <Card className="ui-stack" style={{ padding: "var(--df-space-5)" }}>
            <div className="ui-cluster"><Badge>Neutral</Badge><Badge variant="success">Success</Badge><Badge variant="warning">Warning</Badge><Badge variant="danger">Danger</Badge><Badge variant="info">Info</Badge></div>
            <Alert variant="info" title="Information">This is an informational message.</Alert><Alert variant="success" title="Saved">Your changes have been saved.</Alert><Alert variant="warning" title="Attention">Review this detail before continuing.</Alert><Alert variant="danger" title="Action required">An example error message with a recovery hint.</Alert>
          </Card>
        </Section>

        <Section id="04" title="FORMS" headingId="form-heading" description="Fields, labels and validation" open={!!expanded["04"]} onToggle={() => toggle("04")}>
          <Card className="ui-stack" style={{ padding: "var(--df-space-5)", maxWidth: "42rem" }}>
            <TextField label="Display name" name="displayName" placeholder="Enter a display name" helpText="This is helper text for the field."/><TextField label="Email address" name="email" type="email" placeholder="you@example.com" required/><TextField as="textarea" label="Short description" name="description" placeholder="Write a short description..."/><TextField label="Example invalid field" name="invalid" defaultValue="not-an-email" error="Please enter a valid email address."/>
            <div className="ui-cluster"><Button type="button">Example submit</Button><Button variant="secondary" type="reset">Reset</Button></div>
          </Card>
        </Section>

        <Section id="05" title="DIALOG" headingId="dialog-heading" description="Modal and confirmation patterns" open={!!expanded["05"]} onToggle={() => toggle("05")}>
          <Card className="ui-stack" style={{ padding: "var(--df-space-5)" }}><DialogPreview /></Card>
        </Section>

        <Section id="06" title="NAVIGATION & CONTROLS" headingId="controls-heading" description="Breadcrumbs, tabs and choices" open={!!expanded["06"]} onToggle={() => toggle("06")}>
          <Card className="ui-stack" style={{ padding: "var(--df-space-5)" }}><ControlsPreview /></Card>
        </Section>

        <Section id="07" title="RESPONSIVE LAYOUT" headingId="layout-heading" description="Grid and responsive behavior" open={!!expanded["07"]} onToggle={() => toggle("07")}>
          <div className="ui-grid-3">{["Gaming","Knowledge","Community"].map((item) => <Card key={item} className="ui-stack" style={{ padding: "var(--df-space-4)" }}><Badge variant="info">Category</Badge><h3 className="ui-heading-h3">{item}</h3><p className="ui-caption">Reusable card surface and spacing.</p></Card>)}</div>
        </Section>

        <Section id="08" title="DATA DISPLAY" headingId="data-heading" description="Loading, empty, error and data" open={!!expanded["08"]} onToggle={() => toggle("08")}>
          <Card className="ui-stack" style={{ padding: "var(--df-space-5)" }}><DataDisplayPreview /></Card>
        </Section>

        <Section id="09" title="ICONOGRAPHY" headingId="iconography-heading" description="Icon roles, sizing and usage" open={!!expanded["09"]} onToggle={() => toggle("09")}>
          <div className={styles.demoCard}>
            <p className={styles.demoLabel}>ICON ROLES</p>
            <div className={styles.iconGrid}>
              {[["⌂","Home"],["⚙","Settings"],["♙","Profile"],["⌕","Search"],["＋","Add"],["✓","Success"],["!","Warning"],["×","Close"],["↗","External"],["⋯","More"],["♡","Favorite"],["⌁","Community"]].map(([glyph,label]) => <div className={styles.iconSample} key={label}><span aria-hidden="true">{glyph}</span><small>{label}</small></div>)}
            </div>
            <p className={styles.demoLabel}>SIZE SCALE</p>
            <div className={styles.iconSizes}><span style={{fontSize:12}}>✦ 12</span><span style={{fontSize:16}}>✦ 16</span><span style={{fontSize:20}}>✦ 20</span><span style={{fontSize:24}}>✦ 24</span><span style={{fontSize:32}}>✦ 32</span></div>
            <p className={styles.demoNote}>Use one consistent icon family per interface. Decorative icons should be hidden from assistive technology; functional icons need an accessible label. Keep icon-only controls at least 44 × 44px.</p>
          </div>
        </Section>

        <Section id="10" title="COLOR SYSTEM" headingId="color-heading" description="Semantic palette and status colors" open={!!expanded["10"]} onToggle={() => toggle("10")}>
          <div className={styles.demoCard}>
            <p className={styles.demoLabel}>ACTIVE GLOBAL THEME TOKENS</p>
            <div className={styles.colorGrid}>{tokenColors.map(([label,token]) => <div className={styles.colorSample} key={token}><span style={{background:"var(" + token + ")"}}/><div><strong>{label}</strong><code>{token}</code></div></div>)}</div>
            <div className={styles.statusRow}>{[["Success","--df-success"],["Warning","--df-warning"],["Danger","--df-danger"],["Info","--df-info"]].map(([label,token]) => <span key={token} style={{color:"var(" + token + ")"}}>● {label}</span>)}</div>
            <p className={styles.demoNote}>Swatches read from the active semantic variables. Switch the theme above to compare Light and Dark presets. Do not assign page-specific palette values to shared components.</p>
          </div>
        </Section>

        <Section id="11" title="SPACING & SIZING" headingId="spacing-heading" description="Spacing scale and sizing roles" open={!!expanded["11"]} onToggle={() => toggle("11")}>
          <div className={styles.demoCard}>
            <p className={styles.demoLabel}>4PX BASE SPACING SCALE</p>
            <div className={styles.spacingList}>{spacing.map(([name,value]) => <div className={styles.spacingRow} key={name}><code>--df-{name}</code><span>{value}</span><i style={{width:"var(--df-" + name + ")"}}/></div>)}</div>
            <div className={styles.sizeExamples}><div><span>Compact</span><strong>36px</strong></div><div><span>Default touch</span><strong>44px</strong></div><div><span>Large</span><strong>48px</strong></div></div>
            <p className={styles.demoNote}>Prefer spacing tokens over arbitrary margins and padding. Keep interactive targets at least 44px where practical.</p>
          </div>
        </Section>

        <Section id="12" title="SURFACES & ELEVATION" headingId="surface-heading" description="Surfaces, borders, radius and shadows" open={!!expanded["12"]} onToggle={() => toggle("12")}>
          <div className={styles.demoCard}>
            <p className={styles.demoLabel}>SURFACE HIERARCHY</p>
            <div className={styles.surfaceGrid}><div style={{background:"var(--df-bg)"}}>Background<code>--df-bg</code></div><div style={{background:"var(--df-surface)"}}>Surface<code>--df-surface</code></div><div style={{background:"var(--df-surface-raised)"}}>Raised<code>--df-surface-raised</code></div><div style={{background:"var(--df-surface-overlay)"}}>Overlay<code>--df-surface-overlay</code></div></div>
            <p className={styles.demoLabel}>BORDER RADIUS & ELEVATION</p>
            <div className={styles.shapeGrid}><div style={{borderRadius:"var(--df-radius-sm)"}}>SM</div><div style={{borderRadius:"var(--df-radius-md)"}}>MD</div><div style={{borderRadius:"var(--df-radius-lg)"}}>LG</div><div style={{borderRadius:"var(--df-radius-xl)"}}>XL</div><div style={{borderRadius:"var(--df-radius-pill)"}}>PILL</div></div>
            <div className={styles.shadowGrid}><div style={{boxShadow:"var(--df-shadow-sm)"}}>Shadow SM</div><div style={{boxShadow:"var(--df-shadow-md)"}}>Shadow MD</div><div style={{boxShadow:"var(--df-shadow-lg)"}}>Shadow LG</div></div>
            <p className={styles.demoNote}>Use elevation to communicate hierarchy, not decoration. Overlay surfaces should sit above raised surfaces without introducing a new hardcoded palette.</p>
          </div>
        </Section>

        <Section id="13" title="INTERACTION STATES" headingId="states-heading" description="Hover, focus, active and disabled" open={!!expanded["13"]} onToggle={() => toggle("13")}>
          <div className={styles.demoCard}>
            <p className={styles.demoLabel}>INTERACTIVE PREVIEW</p>
            <div className={styles.stateControls}><button type="button" className={styles.statePrimary}>Default / Hover</button><button type="button" className={styles.stateSecondary}>Secondary</button><button type="button" className={styles.stateDisabled} disabled>Disabled</button><a href="#13" className={styles.stateLink}>Focus me with Tab</a></div>
            <p className={styles.demoNote}>Use pointer hover, keyboard Tab, click/press, and disabled states. Focus must remain visible and must not rely on color alone. Reduced-motion preferences are respected.</p>
          </div>
        </Section>

        <Section id="14" title="COMPONENT WORKBENCH" headingId="workbench-heading" description="Live previews of all shared React components" open={!!expanded["14"]} onToggle={() => toggle("14")}>
          <ComponentWorkbench />
        </Section>
      </div>

      <footer className={styles.footer}>Internal QA route · noindex · not a production approval.</footer>
      {showTop && <button type="button" className={styles.backTop} onClick={() => window.scrollTo({top:0,behavior:"smooth"})} aria-label="Back to top">↑ <span>TOP</span></button>}
    </main>
  );
}
