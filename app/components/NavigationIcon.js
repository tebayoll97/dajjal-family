"use client";
export default function NavigationIcon({ name, className = "" }) {
 const common={width:20,height:20,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":true,focusable:"false",className};
 const paths={
 profile:<><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.3 3.1-5 7-5s6.3 1.7 7 5"/></>,
 home:<><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
 games:<><path d="M6 8h12a4 4 0 0 1 3.8 5l-1 3.2a2.5 2.5 0 0 1-4.1 1.1L14 15h-4l-2.7 2.3a2.5 2.5 0 0 1-4.1-1.1l-1-3.2A4 4 0 0 1 6 8Z"/><path d="M7 11v4M5 13h4M16.5 12h.01M19 14h.01"/></>,
 blog:<><path d="M5 3h10l4 4v14H5z"/><path d="M14 3v5h5M8 12h8M8 16h8"/></>,
 products:<><path d="M4 8h16l-1.5 12h-13z"/><path d="M9 8a3 3 0 0 1 6 0"/><path d="M9 12v2M15 12v2"/></>,
 universe:<><circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
 message:<><path d="M20.5 11.5a8 8 0 0 1-8 8H6l-3 2v-7.5a8 8 0 1 1 17.5-2.5Z"/><path d="M8 10.5h8M8 14h5"/></>
 };
 return <svg {...common}>{paths[name]||paths.blog}</svg>;
}