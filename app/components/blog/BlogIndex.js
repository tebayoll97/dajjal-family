"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {useLanguage} from "@/app/components/LanguageProvider";
import {Badge,Breadcrumbs,Button,EmptyState,SearchField,SectionHeader,BlogArticleCard} from "@/app/components/ui";
export default function BlogIndex({initialArticles=[],initialCategories=[]}){
 const {language}=useLanguage();const [query,setQuery]=useState("");const [category,setCategory]=useState("all");const isEn=language==="en";
 const articles=useMemo(()=>{const q=query.trim().toLocaleLowerCase(language==="id"?"id-ID":"en-US");return initialArticles.filter(a=>{const searchable=[a.title,a.excerpt,a.author?.display_name,a.category?.name].filter(Boolean).join(" ").toLocaleLowerCase(language==="id"?"id-ID":"en-US");return(!q||searchable.includes(q))&&(category==="all"||a.category?.slug===category);});},[initialArticles,query,category,language]);
 return <main className="ui-page df-blog-page">
  <Breadcrumbs items={[{label:isEn?"Home":"Beranda",href:`/${language}`},{label:"Blog"}]}/>
  <header className="ui-page-heading df-blog-page__heading"><span className="ui-eyebrow">DAJJAL FAMILY / {isEn?"INSIGHTS & STORIES":"WAWASAN & CERITA"}</span><div className="ui-page-heading-main"><div className="ui-page-heading-copy"><h1 className="ui-heading-h1">{isEn?"DAJJAL FAMILY Blog":"Blog DAJJAL FAMILY"}</h1><p className="ui-subtitle">{isEn?"Ideas, stories, guides, and perspectives from across our digital universe.":"Gagasan, cerita, panduan, dan perspektif dari seluruh semesta digital kami."}</p></div><Badge variant="info">{isEn?"Editorial":"Ruang editorial"}</Badge></div></header>
  <section className="ui-stack df-blog-page__discovery" aria-label={isEn?"Explore articles":"Jelajahi artikel"}>
   <SectionHeader title={isEn?"Latest articles":"Artikel terbaru"} description={isEn?"Find a story by title, topic, or contributor.":"Temukan tulisan berdasarkan judul, topik, atau penulis."}/>
   <div className="ui-blog-index-toolbar"><SearchField label={isEn?"Search articles":"Cari artikel"} placeholder={isEn?"Search by title or keyword…":"Cari judul atau kata kunci…"} value={query} onChange={e=>setQuery(e.target.value)} size="sm"/>
    {initialCategories.length>0?<div className="ui-blog-category-filter" role="group" aria-label={isEn?"Filter by category":"Filter berdasarkan kategori"}><Button size="sm" variant={category==="all"?"primary":"secondary"} aria-pressed={category==="all"} onClick={()=>setCategory("all")}>{isEn?"All topics":"Semua topik"}</Button>{initialCategories.map(c=><Button key={c.id} size="sm" variant={category===c.slug?"primary":"secondary"} aria-pressed={category===c.slug} onClick={()=>setCategory(c.slug)}>{c.name}</Button>)}</div>:null}
   </div>
   <p className="ui-blog-results-count ui-text-blog-meta" aria-live="polite" aria-atomic="true">{isEn?`${articles.length} articles`:`${articles.length} artikel`}</p>
   {articles.length>0?<div className="ui-blog-article-grid">{articles.map(a=><BlogArticleCard key={a.id} article={a} locale={language}/>)}</div>:<EmptyState title={query||category!=="all"?(isEn?"No articles found":"Artikel tidak ditemukan"):(isEn?"Articles are on their way":"Artikel sedang disiapkan")} description={query||category!=="all"?(isEn?"Try another keyword or choose a different topic.":"Coba kata kunci lain atau pilih topik berbeda."):(isEn?"The first stories will appear here once published.":"Tulisan pertama akan muncul di sini setelah diterbitkan.")}/>}
   <div className="ui-blog-author-invite"><span className="ui-text-blog-meta">{isEn?"Have something useful to share?":"Punya gagasan bermanfaat untuk dibagikan?"}</span><Link className="ui-link" href={`/${language}/blog/author/apply`}>{isEn?"Become a contributor":"Menjadi kontributor"}</Link></div>
  </section>
 </main>;
}
