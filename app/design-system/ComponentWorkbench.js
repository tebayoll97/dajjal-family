"use client";

import { useState } from "react";
import {
  Alert, Avatar, Badge, Breadcrumbs, Button, Card, CheckboxField, Dialog, FeedbackDialog,
  DropdownMenu, EmptyState, ErrorState, Pagination, RadioGroup, Skeleton,
  SwitchField, Table, Tabs, TextField, SearchField,
  Accordion, BottomNavigation, ConfirmDialog, EditorialByline, IconButton, Link, PageHeader, ProgressBar, SectionHeader, StatCard, Tooltip, VerificationState, BlogArticleNavigation, BlogArticleCard, ContactChannelCard, SvgIcon,
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
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [progress, setProgress] = useState(68);
  const theme = themes.find((item) => item.id === themeId) || themes[0];
  const themeStyle = THEME_TOKEN_MAPS[theme.preset][theme.mode];

  const items = [
    ["SvgIcon", "SvgIcon · semantic modern SVG line icon", <div key="svg-icon" className={styles.inline}><SvgIcon name="home" size={20}/><SvgIcon name="search" size={20}/><SvgIcon name="settings" size={20}/><SvgIcon name="log-out" size={20}/><SvgIcon name="palette" size={20}/><SvgIcon name="layers" size={20}/><SvgIcon name="undo" size={20}/><SvgIcon name="redo" size={20}/><span>One shared icon API</span></div>],
    ["Button", "Button · 02 Action states", <div key="button" className={styles.stack}>
      <div className={styles.inline}><Button>Primary action</Button><Button variant="secondary">Secondary</Button><Button size="sm">Small</Button><Button size="lg">Large</Button></div>
      <div className={styles.inline}><Button loading>Loading</Button><Button disabled>Disabled</Button></div><Button wide>Full-width action</Button>
    </div>],
    ["Card", "Card", <Card key="card" className={styles.cardSample}><strong>Card surface</strong><span>Content container</span></Card>],
    ["ContactChannelCard", "ContactChannelCard · WhatsApp / Telegram", <div key="contact-channel" className={styles.stack}><ContactChannelCard channel="whatsapp" locale="id" href="https://wa.me/6285141320943" /><ContactChannelCard channel="telegram" locale="id" href="https://t.me/dajjalf4mily" /></div>],
    ["Badge", "Badge", <div key="badge" className={styles.inline}><Badge>Neutral</Badge><Badge variant="success">Success</Badge><Badge variant="warning">Warning</Badge></div>],
    ["Alert", "Alert", <Alert key="alert" variant="info" title="Information">Status message example.</Alert>],
    ["TextField", "TextField", <TextField key="field" label="Display name" placeholder="Enter a name" helpText="Helper text example." />],
    ["SearchField", "df-search / SearchField", <SearchField key="search" label="Search the library" name="q" placeholder="Type a keyword…" />],
    ["CheckboxField", "CheckboxField", <CheckboxField key="checkbox" label="Enable notifications" checked={checked} onChange={setChecked} />],
    ["RadioGroup", "RadioGroup", <RadioGroup key="radio" label="Preview layout" name="workbench-layout" options={[{value:"mobile",label:"Mobile"},{value:"desktop",label:"Desktop"}]} value={choice} onChange={setChoice} direction="row" />],
    ["SwitchField", "SwitchField", <SwitchField key="switch" label="Public profile" description="Controlled switch preview." checked={enabled} onChange={setEnabled} />],
    ["Dialog", "Dialog", <div key="dialog"><Button onClick={() => setDialogOpen(true)}>Open dialog</Button><Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Shared Dialog" description="Native dialog component preview." actions={<Button onClick={() => setDialogOpen(false)}>Done</Button>}>Dialog content uses the shared production component.</Dialog></div>],
    ["Breadcrumbs", "Breadcrumbs", <Breadcrumbs key="crumbs" items={[{label:"Home",href:"#"},{label:"Library",href:"#"},{label:"Current page"}]} />],
    ["EditorialByline", "EditorialByline", <EditorialByline key="editorial-byline" author="Tebayoll" date="25 November 2026" dateTime="2026-11-25" locale="en" />],
    ["Tabs", "Tabs", <Tabs key="tabs" value={tab} onChange={setTab} tabs={[{value:"overview",label:"Overview",content:<p>Overview panel content.</p>},{value:"details",label:"Details",content:<p>Details panel content.</p>}]} />],
    ["DropdownMenu", "DropdownMenu", <div key="dropdown" className={styles.stack}><DropdownMenu label="Open options"><button type="button" className="ui-dropdown-item" onClick={() => setMenuAction("Edit selected")}>Edit item</button><button type="button" className="ui-dropdown-item" onClick={() => setMenuAction("Details selected")}>View details</button></DropdownMenu>{menuAction ? <small>{menuAction}</small> : null}</div>],
    ["VerificationState", "VerificationState · reusable admin and user session checks", <div key="verification" className={styles.stack}><VerificationState variant="admin" /><VerificationState variant="user" /></div>],
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
    ["FeedbackDialog", "FeedbackDialog · action feedback with dismiss button", <div key="feedback-dialog"><Button onClick={() => setFeedbackOpen(true)}>Show success feedback</Button><FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} title="Changes saved" message="Your changes have been saved successfully." closeLabel="Close" /></div>],
    ["ConfirmDialog", "ConfirmDialog", <div key="confirm-dialog"><Button variant="danger" onClick={() => setConfirmOpen(true)}>Open confirmation</Button><ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => setConfirmOpen(false)} title="Confirm action" description="This demonstrates the shared confirmation pattern." confirmLabel="Confirm" cancelLabel="Cancel" /></div>],
    ["BottomNavigation", "BottomNavigation · Floating dock", <div key="bottom-navigation" className={styles.stack}><BottomNavigation ariaLabel="Component preview navigation" items={[{key:"home",label:"Home",icon:<svg viewBox="0 0 24 24"><path d="m3 10 9-7 9 7v10H14v-7h-4v7H3z"/></svg>,active:true,onClick:()=>{}},{key:"music",label:"Music",icon:<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>,onClick:()=>{}},{key:"favorites",label:"Favorites",icon:<svg viewBox="0 0 24 24"><path d="M20.8 8.8c0 5-8.8 10.2-8.8 10.2S3.2 13.8 3.2 8.8A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.8 2.4Z"/></svg>,onClick:()=>{}},{key:"search",label:"Search",icon:<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>,onClick:()=>{}}]} centerAction={{label:"Play",icon:<svg viewBox="0 0 24 24"><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>,onClick:()=>{}}} /></div>],
    ["BlogArticleNavigation", "BlogArticleNavigation · Recent Posts + Categories", <BlogArticleNavigation key="blog-navigation" locale="en" recentPosts={[{id:"a",slug:"getting-started",title:"Getting Started with DAJJAL FAMILY",published_at:"2026-11-24"},{id:"b",slug:"community-guide",title:"Community Guide",published_at:"2026-11-22"},{id:"c",slug:"gaming-news",title:"Gaming News",published_at:"2026-11-20"}]} categories={[{id:"1",slug:"guides-tutorials",name:"Guides & Tutorials",article_count:12},{id:"2",slug:"gaming",name:"Gaming",article_count:8},{id:"3",slug:"community",name:"Community",article_count:4}]}/>],
    ["BlogArticleCard", "BlogArticleCard · compact responsive editorial card", <BlogArticleCard key="blog-article-card" locale="en" article={{id:"preview",slug:"building-a-digital-universe",title:"Building a Digital Universe, One Useful Idea at a Time",excerpt:"A compact editorial card with localized category, summary and publication details.",cover_image_url:null,published_at:"2026-11-24",reading_minutes:5,category:{slug:"insights",name:"Insights"},author:{display_name:"DAJJAL FAMILY"}}}/>],
    ["KaraokeLyrics", "KaraokeLyrics · Portal overlay", <div key="karaoke" className={styles.stack}><strong>Production overlay · opened from Music Library</strong><small>Requires a published track ID and active HTMLAudioElement. Renders in document.body; Escape/Close preserves playback; transcript follows audio time; font scaling is controlled.</small><small>Full-screen responsive surface · safe-area aware · reduced-motion compatible.</small></div>],
  ];

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div><strong>36 shared React components</strong><small>Production exports · live component instances</small></div>
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
