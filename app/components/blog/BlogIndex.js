"use client";
import {useState} from "react";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {useLanguage} from "@/app/components/LanguageProvider";
import {Badge,Breadcrumbs,Button,EmptyState,SearchField,SectionHeader,BlogArticleCard,Pagination} from "@/app/components/ui";
export default function BlogIndex({initialArticles=[],initialCategories=[],initialPage=1,totalPages=1,totalArticles=0,initialQuery="",initialCategory="all"}){
 const {language}=useLanguage();const router=useRouter();const pathname=usePathname();
 const [query,setQuery]=useState(initialQuery);const [category,setCategory]=useState(initialCategory);const isEn=language==="en";
 const navigate=({nextQuery=query,nextCategory=category,nextPage=1}={})=>{const params=new URLSearchParams();if(nextQuery.trim())params.set("q",nextQuery.trim());if(nextCategory!=="all")params.set("category",nextCategory);if(nextPage>1)params.set("page",String(nextPage));const suffix=params.toString();router.push(suffix?pathname+"?"+suffix:pathname);};
 const submitSearch=(event)=>{event.preventDefault();navigate({nextQuery:query,nextPage:1});};
 const selectCategory=(slug)=>{setCategory(slug);navigate({nextCategory:slug,nextPage:1});};
 return <main className="ui-page df-blog-page">
  <Breadcrumbs items={[{label:isEn?"Home":"Beranda",href:"/"+language},{label:"Blog"}]}/>
  <header className="ui-page-heading df-blog-page__heading"><span className="ui-eyebrow">DAJJAL FAMILY / {isEn?"INSIGHTS & STORIES":"WAWASAN & CERITA"}</span><div className="ui-page-heading-main"><div className="ui-page-heading-copy"><h1 className="ui-heading-h1">{isEn?"DAJJAL FAMILY Blog":"Blog DAJJAL FAMILY"}</h1><p className="ui-subtitle">{isEn?"Ideas, stories, guides, and perspectives from across our digital universe.":"Gagasan, cerita, panduan, dan perspektif dari seluruh semesta digital kami."}</p></div><Badge variant="info">{isEn?"Editorial":"Ruang editorial"}</Badge></div></header>
  <section className="ui-stack df-blog-page__discovery" aria-label={isEn?"Explore articles":"Jelajahi artikel"}>
   <SectionHeader title={isEn?"Latest articles":"Artikel terbaru"} description={isEn?"Find a story by title or excerpt.":"Temukan tulisan berdasarkan judul atau ringkasan."}/>
   <div className="ui-blog-index-toolbar"><form className="ui-blog-search-form" onSubmit={submitSearch}><SearchField label={isEn?"Search articles":"Cari artikel"} placeholder={isEn?"Search by title or keyword…":"Cari judul atau kata kunci…"} value={query} onChange={e=>setQuery(e.target.value)} size="sm"/><Button type="submit" size="sm">{isEn?"Search":"Cari"}</Button></form>
    {initialCategories.length>0?<div className="ui-blog-category-filter" role="group" aria-label={isEn?"Filter by category":"Filter berdasarkan kategori"}><Button size="sm" variant={category==="all"?"primary":"secondary"} aria-pressed={category==="all"} onClick={()=>selectCategory("all")}>{isEn?"All topics":"Semua topik"}</Button>{initialCategories.map(c=><Button key={c.id} size="sm" variant={category===c.slug?"primary":"secondary"} aria-pressed={category===c.slug} onClick={()=>selectCategory(c.slug)}>{c.name}</Button>)}</div>:null}
   </div>
   <p className="ui-blog-results-count ui-text-blog-meta" aria-live="polite" aria-atomic="true">{isEn?totalArticles+" articles":totalArticles+" artikel"}{totalPages>1?" · "+(isEn?"Page":"Halaman")+" "+initialPage+"/"+totalPages:""}</p>
   {initialArticles.length>0?<div className="ui-blog-article-grid">{initialArticles.map(a=><BlogArticleCard key={a.id} article={a} locale={language}/>)}</div>:<EmptyState title={initialQuery||category!=="all"?(isEn?"No articles found":"Artikel tidak ditemukan"):(isEn?"Articles are on their way":"Artikel sedang disiapkan")} description={initialQuery||category!=="all"?(isEn?"Try another keyword or choose a different topic.":"Coba kata kunci lain atau pilih topik berbeda."):(isEn?"The first stories will appear here once published.":"Tulisan pertama akan muncul di sini setelah diterbitkan.")} action={initialQuery||category!=="all"?<Button variant="secondary" onClick={()=>{setQuery("");setCategory("all");navigate({nextQuery:"",nextCategory:"all",nextPage:1});}}>{isEn?"Clear filters":"Hapus filter"}</Button>:undefined}/>}
   {totalPages>1?<Pagination page={initialPage} totalPages={totalPages} onPageChange={(page)=>navigate({nextPage:page})} ariaLabel={isEn?"Article pages":"Halaman artikel"} previousLabel={isEn?"Previous":"Sebelumnya"} nextLabel={isEn?"Next":"Berikutnya"} pageLabel={(page)=>isEn?"Page "+page:"Halaman "+page}/>:null}
   <div className="ui-blog-author-invite"><span className="ui-text-blog-meta">{isEn?"Have something useful to share?":"Punya gagasan bermanfaat untuk dibagikan?"}</span><div className="ui-cluster"><Link className="ui-link" href={"/"+language+"/blog/author"}>{isEn?"Meet our contributors":"Kenali kontributor"}</Link><Link className="ui-link" href={"/"+language+"/blog/author/apply"}>{isEn?"Become a contributor":"Menjadi kontributor"}</Link></div></div>
  </section>
 </main>;
}
