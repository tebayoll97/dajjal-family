"use client";
import {useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {usePathname} from "next/navigation";
import {stripLocalePrefix,withLocalePrefix} from "@/lib/localePath";
import {useLanguage} from "./LanguageProvider";
import NavigationProfileCard from "./NavigationProfileCard";
import NavigationIcon from "./NavigationIcon";
import { SvgIcon } from "./ui";
import ContactCenterNavIndicator from "./ContactCenterNavIndicator";
import useAdminAccess from "./useAdminAccess";
import {getNavigationGroups,getAdminNavigationGroup,getNavigationLabels} from "@/lib/navigationConfig";
export default function GlobalSidebar(){
 const pathname=stripLocalePrefix(usePathname()||"/");const {language}=useLanguage();const t=getNavigationLabels(language);
 const isAdmin=useAdminAccess();const [openGroup,setOpenGroup]=useState(null);
 const groups=[...getNavigationGroups(language),...(isAdmin?[getAdminNavigationGroup(language)]:[])];
 const active=route=>{if(route==="/")return pathname==="/";if(pathname===route)return true;const hasMoreSpecific=groups.some(group=>group.items.some(item=>item.route!==route&&item.route.startsWith(route+"/")&&(pathname===item.route||pathname.startsWith(item.route+"/"))));return pathname.startsWith(route+"/")&&!hasMoreSpecific;};
 const activeGroupId=groups.find(group=>group.items.some(item=>active(item.route)))?.id||null;
 return <aside className="df-global-sidebar">
  <Link href={withLocalePrefix("/",language)} className="df-global-sidebar-brand"><Image className="df-global-sidebar-mark" src="/dajjalfamily_icon_192.png" alt="" width={42} height={42}/><span><strong>DAJJAL FAMILY</strong><small>ONE FAMILY. MANY POSSIBILITIES.</small></span></Link>
  <div className="df-global-sidebar-profile"><NavigationProfileCard/></div>
  <section className="df-global-sidebar-group"><p className="df-global-sidebar-heading">{language==="en"?"MAIN MENU":"MENU UTAMA"}</p>
   <nav aria-label={language==="en"?"Main menu":"Menu utama"}>
    <Link className="df-global-sidebar-home" href={withLocalePrefix("/",language)} aria-current={active("/")?"page":undefined}><NavigationIcon name="home"/><span>{t.home}</span></Link>
    {groups.map(group=>{const expanded=openGroup===null?activeGroupId===group.id:openGroup===group.id;const id=`df-sidebar-group-${group.id}`;return <section className="df-global-sidebar-nav-group" key={group.id}>
     <button type="button" className="df-global-sidebar-trigger" aria-expanded={expanded} aria-controls={id} onClick={()=>setOpenGroup(current=>current===group.id?null:group.id)}><NavigationIcon name={group.icon}/><span>{group.label}</span><svg className={`df-global-sidebar-chevron${expanded?" is-expanded":""}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button>
     <div id={id} className="df-global-sidebar-submenu" data-expanded={expanded} aria-hidden={!expanded} inert={!expanded}>{group.items.map(item=><Link key={item.route} href={withLocalePrefix(item.route,language)} aria-current={active(item.route)?"page":undefined}><span className="df-global-sidebar-item-label">{item.icon==="palette"?<SvgIcon name="palette" size={16}/>:item.route==="/admin/contact-center"?<NavigationIcon name="message"/>:null}{item.label}</span>{item.route==="/admin/contact-center"?<ContactCenterNavIndicator mode="admin"/>:null}{active(item.route)&&<span className="df-global-sidebar-active" aria-hidden="true">●</span>}</Link>)}</div>
    </section>;})}
   </nav>
  </section>
  <div className="df-global-sidebar-bottom"><div className="df-global-sidebar-card"><span>{language==="en"?"THE DF PROMISE":"JANJI DF"}</span><strong>One Family.<br/>Many Possibilities.</strong><p>{language==="en"?"A growing digital universe built around ideas, experiences, and people.":"Semesta digital yang terus berkembang, dibangun dari gagasan, pengalaman, dan manusia."}</p></div><div className="df-global-sidebar-card"><span>{language==="en"?"A WORLD OF POSSIBILITIES":"DUNIA PENUH KEMUNGKINAN"}</span><p>{language==="en"?"Explore ideas, experiences, and projects made to grow.":"Jelajahi gagasan, pengalaman, dan proyek yang terus berkembang."}</p></div><small>DAJJALFAMILY.COM</small></div>
 </aside>;
}