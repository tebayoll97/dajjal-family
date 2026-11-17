"use client";
import {useEffect,useState} from "react";
import {supabaseAdminClient} from "@/lib/supabaseAdminClient";
const KEY="df_admin_profile_cache_v1:";
function read(id){try{const v=JSON.parse(window.localStorage.getItem(KEY+id)||"null");return v?.userId===id?v:null;}catch{return null;}}
function write(id){try{window.localStorage.setItem(KEY+id,JSON.stringify({userId:id,label:"Admin",updatedAt:Date.now()}));}catch{}}
function clear(id){try{if(id)window.localStorage.removeItem(KEY+id);}catch{}}
export default function useAdminAccess(){
 const [isAdmin,setIsAdmin]=useState(false);
 useEffect(()=>{
  let active=true,currentId=null;
  async function check(session){
   const id=session?.user?.id||null;if(currentId&&currentId!==id)clear(currentId);currentId=id;
   if(!session?.access_token||!id){clear(id);if(active)setIsAdmin(false);return;}
   if(active&&read(id))setIsAdmin(true);
   try{const response=await fetch("/api/admin/me",{method:"GET",headers:{Authorization:`Bearer ${session.access_token}`},cache:"no-store"});const result=await response.json();const allowed=response.ok&&result.success===true;if(allowed)write(id);else clear(id);if(active)setIsAdmin(allowed);}
   catch(error){console.error("Admin check failed:",error);clear(id);if(active)setIsAdmin(false);}
  }
  supabaseAdminClient.auth.getSession().then(({data:{session}})=>check(session));
  const {data:{subscription}}=supabaseAdminClient.auth.onAuthStateChange((event,session)=>{if(event==="SIGNED_OUT"){clear(currentId);currentId=null;setIsAdmin(false);return;}if(["SIGNED_IN","TOKEN_REFRESHED","USER_UPDATED"].includes(event))check(session);});
  return()=>{active=false;subscription.unsubscribe();};
 },[]);
 return isAdmin;
}