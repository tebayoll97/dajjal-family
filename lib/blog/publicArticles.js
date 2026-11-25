import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
const PUBLIC_SELECT="id,slug_id,slug_en,title_id,title_en,excerpt_id,excerpt_en,cover_image_url,cover_image_alt_id,cover_image_alt_en,published_at,reading_minutes,df_blog_categories(slug,name_id,name_en),df_blog_contributors(display_name)";
export async function getPublishedArticles({locale="id",limit=24}={}){const {data,error}=await supabaseAdmin.from("df_blog_articles").select(PUBLIC_SELECT).eq("status","published").not("published_at","is",null).order("published_at",{ascending:false}).limit(Math.min(Math.max(Number(limit)||24,1),48));if(error){console.error("Blog listing query failed:",error);return [];}return(data||[]).map(a=>({...a,title:locale==="en"?a.title_en||a.title_id:a.title_id,excerpt:locale==="en"?a.excerpt_en||a.excerpt_id:a.excerpt_id,cover_image_alt:locale==="en"?a.cover_image_alt_en||a.cover_image_alt_id:a.cover_image_alt_id,slug:locale==="en"?a.slug_en||a.slug_id:a.slug_id,category:Array.isArray(a.df_blog_categories)?a.df_blog_categories[0]:a.df_blog_categories,author:Array.isArray(a.df_blog_contributors)?a.df_blog_contributors[0]:a.df_blog_contributors}));}
export async function getPublishedArticleBySlug(slug,locale="id"){const column=locale==="en"?"slug_en":"slug_id";const {data,error}=await supabaseAdmin.from("df_blog_articles").select(`${PUBLIC_SELECT},content_id,content_en,meta_title_id,meta_title_en,meta_description_id,meta_description_en`).eq("status","published").not("published_at","is",null).eq(column,slug).maybeSingle();if(error){console.error("Blog article query failed:",error);return null;}if(!data)return null;return{...data,title:locale==="en"?data.title_en||data.title_id:data.title_id,excerpt:locale==="en"?data.excerpt_en||data.excerpt_id:data.excerpt_id,cover_image_alt:locale==="en"?data.cover_image_alt_en||data.cover_image_alt_id:data.cover_image_alt_id,content:locale==="en"?data.content_en||data.content_id:data.content_id,slug:locale==="en"?data.slug_en||data.slug_id:data.slug_id,category:Array.isArray(data.df_blog_categories)?data.df_blog_categories[0]:data.df_blog_categories,author:Array.isArray(data.df_blog_contributors)?data.df_blog_contributors[0]:data.df_blog_contributors};}
export async function getBlogCategories(locale="id"){const {data,error}=await supabaseAdmin.from("df_blog_categories").select("id,slug,name_id,name_en,description_id,description_en").eq("is_active",true).order("sort_order",{ascending:true});if(error){console.error("Blog categories query failed:",error);return [];}return(data||[]).map(c=>({...c,name:locale==="en"?c.name_en||c.name_id:c.name_id}));}
export async function getBlogArticleNavigationData(locale="id",currentArticleId=null){
  const [recentResult,categoriesResult]=await Promise.all([
    supabaseAdmin.from("df_blog_articles").select("id,slug_id,slug_en,title_id,title_en,published_at").eq("status","published").not("published_at","is",null).order("published_at",{ascending:false}).limit(12),
    supabaseAdmin.from("df_blog_categories").select("id,slug,name_id,name_en").eq("is_active",true).order("sort_order",{ascending:true})
  ]);
  if(recentResult.error)console.error("Blog recent posts query failed:",recentResult.error);
  if(categoriesResult.error)console.error("Blog category navigation query failed:",categoriesResult.error);
  const categoryRows=categoriesResult.data||[];
  const categories=await Promise.all(categoryRows.map(async row=>{
    const {count,error}=await supabaseAdmin.from("df_blog_articles").select("id",{count:"exact",head:true}).eq("status","published").not("published_at","is",null).eq("category_id",row.id);
    if(error)console.error("Blog category count query failed:",error);
    return {...row,name:locale==="en"?row.name_en||row.name_id:row.name_id,article_count:count||0};
  }));
  const recent=(recentResult.data||[]).filter(row=>row.id!==currentArticleId).slice(0,3).map(row=>({...row,slug:locale==="en"?row.slug_en||row.slug_id:row.slug_id,title:locale==="en"?row.title_en||row.title_id:row.title_id}));
  return {recentPosts:recent,categories};
}
