"use client";

import { useState } from "react";
import {
  Alert, Avatar, Badge, Breadcrumbs, Button, Card, CheckboxField, Dialog,
  DropdownMenu, EmptyState, ErrorState, Pagination, RadioGroup, Skeleton,
  SwitchField, Table, Tabs, TextField, SearchField,
  Accordion, BottomNavigation, ConfirmDialog, IconButton, Link, PageHeader, ProgressBar, SectionHeader, StatCard, Tooltip,
} from "../components/ui";
import { THEME_TOKEN_MAPS } from "../theme/themeTokens";
import styles from "./ComponentWorkbench.module.css";

const themes = [
  { id: "tecno-dark", label: "TECNO · Dark", preset: "tecno", mode: "dark" },
  { id: "tecno-light", label: "TECNO · Light", preset: "tecno", mode: "light" },
  { id: "couple-dark", label: "Dajjal × Veylora · Dark", preset: "dajjal-veylora", mode: "dark" },
  { id: "couple-light", label: "Dajjal × Veylora · Light", preset: "dajjal-veylora", mode: "light" },
];

const sampleRows = [
  { id: "DF-01", name: "Design tokens", status: "Ready" },
  { id: "DF-02", name: "Component API", status: "Review" },
];

export default function ComponentWorkbench() {
  const [themeId, setThemeId] = useState("tecno-dark");
  const [checked, setChecked] = useState(true);
  const [choice, setChoice] = useState("mobile");
  const [enabled, setEnabled] = useState(true);
  const [tab, setTab] = useState("overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(2);
  const [retryCount, setRetryCount] = useState(0);
  const [itemAdded, setItemAdded] = useState(false);
  const [menuAction, setMenuAction] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progress, setProgress] = useState(68);
  const theme = themes.find((item) => item.id === themeId) || themes[0];
  const themeStyle = THEME_TOKEN_MAPS[theme.preset][theme.mode];

  const items = [
    ["Button", "Button", <Button key="button">Primary action</Button>],
    ["Card", "Card", <Card key="card" className={styles.cardSample}><strong>Card surface</strong><span>Content container</span></Card>],
    ["Badge", "Badge", <div key="badge" className={styles.inline}><Badge>Neutral</Badge><Badge variant="success">Success</Badge><Badge variant="warning">Warning</Badge></div>],
    ["Alert", "Alert", <Alert key="alert" variant="info" title="Information">Status message example.</Alert>],
    ["TextField", "TextField", <TextField key="field" label="Display name" placeholder="Enter a name" helpText="Helper text example." />],
    ["SearchField", "df-search / SearchField", <SearchField key="search" label="Search the library" name="q" placeholder="Type a keyword…" />],
    ["CheckboxField", "CheckboxField", <CheckboxField key="checkbox" label="Enable notifications" checked={checked} onChange={setChecked} />],
    ["RadioGroup", "RadioGroup", <RadioGroup key="radio" label="Preview layout" name="workbench-layout" options={[{value:"mobile",label:"Mobile"},{value:"desktop",label:"Desktop"}]} value={choice} onChange={setChoice} direction="row" />],
    ["SwitchField", "SwitchField", <SwitchField key="switch" label="Public profile" description="Controlled switch preview." checked={enabled} onChange={setEnabled} />],
    ["Dialog", "Dialog", <div key="dialog"><Button onClick={() => setDialogOpen(true)}>Open dialog</Button><Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Shared Dialog" description="Native dialog component preview." actions={<Button onClick={() => setDialogOpen(false)}>Done</Button>}>Dialog content uses the shared production component.</Dialog></div>],
    ["Breadcrumbs", "Breadcrumbs", <Breadcrumbs key="crumbs" items={[{label:"Home",href:"#"},{label:"Library",href:"#"},{label:"Current page"}]} />],
    ["Tabs", "Tabs", <Tabs key="tabs" value={tab} onChange={setTab} tabs={[{value:"overview",label:"Overview",content:<p>Overview panel content.</p>},{value:"details",label:"Details",content:<p>Details panel content.</p>}]} />],
    ["DropdownMenu", "DropdownMenu", <div key="dropdown" className={styles.stack}><DropdownMenu label="Open options"><button type="button" className="ui-dropdown-item" onClick={() => setMenuAction("Edit selected")}>Edit item</button><button type="button" className="ui-dropdown-item" onClick={() => setMenuAction("Details selected")}>View details</button></DropdownMenu>{menuAction ? <small>{menuAction}</small> : null}</div>],
    ["Skeleton", "Skeleton", <div key="skeleton" className={styles.stack}><Skeleton variant="text" width="72%" /><Skeleton variant="rect" height="2.5rem" /><Skeleton variant="circle" /></div>],
    ["EmptyState", "EmptyState", <EmptyState key="empty" title="No saved items" description="An empty state with a clear next step." action={<Button size="sm" onClick={() => setItemAdded(true)}>{itemAdded ? "Item added" : "Add item"}</Button>} />],
    ["ErrorState", "ErrorState", <div key="error" className={styles.stack}><ErrorState title="Preview error" description="A recoverable error state." onRetry={() => setRetryCount((count) => count + 1)} /><small>Retry activations: {retryCount}</small></div>],
    ["Pagination", "Pagination", <div key="pagination" className={styles.stack}><Pagination page={page} totalPages={5} onPageChange={setPage} /><small>Current page: {page}</small></div>],
    ["Table", "Table", <Table key="table" caption="Component inventory sample" columns={[{key:"id",header:"ID"},{key:"name",header:"Name"},{key:"status",header:"Status"}]} rows={sampleRows} />],
    ["Avatar", "Avatar", <div key="avatar" className={styles.inline}><Avatar name="Dajjal Family" size="sm" /><Avatar name="Prisma" size="md" /><Avatar name="Community Member" size="lg" /></div>],
    ["Link", "Link", <div key="link" className={styles.stack}><Link href="#workbench">Internal navigation link</Link><Link href="https://nextjs.org" external>External link</Link></div>],
    ["IconButton", "IconButton", <div key="icon-button" className={styles.inline}><IconButton label="Close" icon={<span aria-hidden="true">×</span>} /><IconButton label="Edit" variant="secondary" icon={<span aria-hidden="true">✎</span>} /></div>],
    ["Tooltip", "Tooltip", <div key="tooltip" className={styles.inline}><Tooltip content="Helpful contextual information"><Button variant="secondary">Focus or hover me</Button></Tooltip></div>],
    ["Accordion", "Accordion", <Accordion key="accordion" items={[{value:"one",title:"What is reusable UI?",content:"Shared components keep behavior, accessibility and visual rules consistent."},{value:"two",title:"When should I add one?",content:"When a pattern is repeated or likely to be reused across standard pages."}]} />],
    ["ProgressBar", "ProgressBar", <div key="progress" className={styles.stack}><ProgressBar label="Profile completion" value={progress} showValue /><input aria-label="Adjust progress preview" type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} /></div>],
    ["StatCard", "StatCard", <div key="stat" className="ui-stat-grid"><StatCard label="Active players" value="12,840" description="Across all servers" trend="+8.2%" /><StatCard label="Published games" value="24" description="Library total" /></div>],
    ["PageHeader", "PageHeader", <PageHeader key="page-header" eyebrow="Example page" title="Reusable page title" description="Consistent heading, description and action layout." actions={<Button size="sm">Create</Button>} />],
    ["SectionHeader", "SectionHeader", <SectionHeader key="section-header" title="Section heading" description="Supporting context for a page section." actions={<Button size="sm" variant="secondary">View all</Button>} />],
    ["ConfirmDialog", "ConfirmDialog", <div key="confirm-dialog"><Button variant="danger" onClick={() => setConfirmOpen(true)}>Open confirmation</Button><ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => setConfirmOpen(false)} title="Confirm action" description="This demonstrates the shared confirmation pattern." confirmLabel="Confirm" cancelLabel="Cancel" /></div>],
    ["BottomNavigation", "BottomNavigation", <div key="bottom-navigation" className={styles.stack}><BottomNavigation ariaLabel="Component preview navigation" items={[{key:"home",label:"Home",icon:<svg viewBox="0 0 24 24"><path d="m3 10 9-7 9 7v10H14v-7h-4v7H3z"/></svg>,active:true,onClick:()=>{}},{key:"library",label:"Library",icon:<svg viewBox="0 0 24 24"><path d="M4 5h16M4 12h16M4 19h16"/></svg>,onClick:()=>{}},{key:"favorites",label:"Favorites",icon:<svg viewBox="0 0 24 24"><path d="M20.8 8.8c0 5-8.8 10.2-8.8 10.2S3.2 13.8 3.2 8.8A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.8 2.4Z"/></svg>,onClick:()=>{}},{key:"search",label:"Search",icon:<svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>,onClick:()=>{}}]} centerAction={{label:"Play",icon:<svg viewBox="0 0 24 24"><path d="m8 5 12 7-12 7z"/></svg>,onClick:()=>{}}} /></div>],
  ];

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div><strong>29 shared React components</strong><small>Production exports · live component instances</small></div>
        <label className={styles.themeControl}>Preview theme
          <select value={themeId} onChange={(event) => setThemeId(event.target.value)}>
            {themes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
      </div>
      <div className={styles.preview} style={themeStyle} data-preview-theme={themeId}>
        <div className={styles.previewHeading}><strong>{theme.label}</strong><span>Isolated token preview · does not change visitor theme preference</span></div>
        <div className={styles.grid}>
          {items.map(([name, api, preview]) => (
            <section className={styles.item} key={name}>
              <div className={styles.itemHead}><strong>{name}</strong><code>{api}</code></div>
              <div className={styles.itemBody}>{preview}</div>
            </section>
          ))}
        </div>
      </div>
      <p className={styles.note}>This workbench mounts the same exported React components used by application pages. It is a source-level preview, not a substitute for browser QA, keyboard testing, contrast measurement, or responsive verification.</p>
    </div>
  );
}
