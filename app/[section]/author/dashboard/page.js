import { notFound } from "next/navigation";
import AuthorPortal from "@/app/components/blog/AuthorPortal";
export const metadata={title:"Blog Author Dashboard",description:"Manage your DAJJAL FAMILY Blog drafts and published articles.",robots:{index:false,follow:false},openGraph:{images:["/dajjalfamily_icon_192.png"]}};
export default async function BlogAuthorDashboardPage({params}){const{section}=await params;if(section!=="blog")notFound();return <AuthorPortal mode="dashboard"/>;}
