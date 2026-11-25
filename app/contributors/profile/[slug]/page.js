import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ContributorPublicProfile from "@/app/components/contributors/ContributorPublicProfile";
export const revalidate=300;
async function loadProfile(slug){
 const {data:profile,error}=await supabaseAdmin.from("df_contributors").select("id,display_name,slug,bio_id,bio_en,avatar_url").eq("slug",slug).eq("status","active").eq("public_profile_enabled",true).maybeSingle();
 if(error||!profile)return null;
 const {data:rows}=await supabaseAdmin.from("df_blog_articles").select("id,slug_id,slug_en,title_id,title_en,excerpt_id,excerpt_en,cover_image_url,cover_image_alt_id,cover_image_alt_en,published_at,reading_minutes,df_blog_categories(slug,name_id,name_en)").eq("contributor_id",profile.id).eq("status","published").not("published_at","is",null).order("published_at",{ascending:false}).limit(48);
 const articles=(rows||[]).map(a=>({ ...a,title:a.title_id,excerpt:a.excerpt_id,slug:a.slug_id,cover_image_alt:a.cover_image_alt_id,category:Array.isArray(a.df_blog_categories)?a.df_blog_categories[0]:a.df_blog_categories,author:profile }));
 return {...profile,article_count:articles.length,articles};
}
export async function generateMetadata({params}){
 const {slug}=await params,locale=(await headers()).get("x-df-locale")==="en"?"en":"id",profile=await loadProfile(slug);
 if(!profile)return{title:locale==="en"?"Contributor not found":"Kontributor tidak ditemukan",robots:{index:false,follow:false}};
 const title=locale==="en"?`${profile.display_name} | DAJJAL FAMILY Contributor`:`${profile.display_name} | Kontributor DAJJAL FAMILY`;
 const description=(locale==="en"?profile.bio_en||profile.bio_id:profile.bio_id||profile.bio_en)|| (locale==="en"?"DAJJAL FAMILY contributor profile.":"Profil kontributor DAJJAL FAMILY.");
 const url=`https://dajjalfamily.com/${locale}/contributors/profile/${profile.slug}`,image=profile.avatar_url||"https://dajjalfamily.com/dajjalfamily_icon_192.png";
 return{title,description,alternates:{canonical:url,languages:{id:`https://dajjalfamily.com/id/contributors/profile/${profile.slug}`,en:`https://dajjalfamily.com/en/contributors/profile/${profile.slug}`}},openGraph:{title,description,url,siteName:"DAJJAL FAMILY",type:"profile",images:[{url:image,alt:profile.display_name}]},twitter:{card:"summary_large_image",title,description,images:[image]}};
}
export default async function ContributorPublicProfilePage({params}){const {slug}=await params,locale=(await headers()).get("x-df-locale")==="en"?"en":"id",profile=await loadProfile(slug);if(!profile)notFound();return <ContributorPublicProfile profile={profile} locale={locale}/>;}