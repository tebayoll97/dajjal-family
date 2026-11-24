import { notFound } from "next/navigation";
import AuthorPortal from "@/app/components/blog/AuthorPortal";
export const metadata={title:"Apply as a Blog Author",description:"Apply to contribute articles to DAJJAL FAMILY Blog.",robots:{index:false,follow:false},openGraph:{images:["/dajjalfamily_icon_192.png"]}};
export default async function BlogAuthorApplyPage({params}){const{section}=await params;if(section!=="blog")notFound();return <AuthorPortal mode="apply"/>;}
