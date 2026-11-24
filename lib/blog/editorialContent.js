const VERSION = 1;
const LANGUAGES = new Set(["text","html","css","javascript","typescript","json","jsx","tsx","python","sql","bash","yaml","markdown"]);
const TAGS = new Set(["p","h2","h3","h4","strong","b","em","i","u","s","ul","ol","li","blockquote","pre","code","a","img","figure","figcaption","hr","br","table","thead","tbody","tr","th","td","div","span"]);
const VOID = new Set(["img","hr","br"]);
const ATTRS = { a:["href","title","data-df-button","data-df-embed"], img:["src","alt","title","width","height"], code:["class"], pre:["class"], th:["colspan","rowspan"], td:["colspan","rowspan"], "*":[] };
const id = () => "b_" + Math.random().toString(36).slice(2,10);
const safeUrl = (value, image=false) => { try { const u=new URL(value); return (u.protocol==="https:" && (image || !["javascript:","data:"].includes(u.protocol))) ? u.toString() : ""; } catch { return ""; } };
export function emptyEditorial(){ return {version:VERSION,blocks:[{id:id(),type:"paragraph",text:""}]}; }
export function normalizeEditorial(value){
 if(value && typeof value==="object" && value.version===VERSION && Array.isArray(value.blocks)) return validateEditorial(value);
 if(typeof value!=="string") throw new Error("INVALID_EDITORIAL");
 const trimmed=value.trim();
 if(!trimmed) return {version:VERSION,blocks:[]};
 try { const parsed=JSON.parse(trimmed); if(parsed?.version===VERSION) return validateEditorial(parsed); } catch {}
 if(trimmed.includes("<") && /<\/?[a-z][\s\S]*>/i.test(trimmed)) return parseEditorialHtml(trimmed);
 return {version:VERSION,blocks:trimmed.split(/\n\s*\n/).map(text=>({id:id(),type:"paragraph",text:text.trim()})).filter(b=>b.text)};
}
export function validateEditorial(doc){
 if(!doc || doc.version!==VERSION || !Array.isArray(doc.blocks) || doc.blocks.length>120 || JSON.stringify(doc).length>60000) throw new Error("INVALID_EDITORIAL");
 const blocks=doc.blocks.map((b)=>{
  if(!b || typeof b!=="object") throw new Error("INVALID_EDITORIAL");
  const base={id:typeof b.id==="string"&&/^[a-zA-Z0-9_-]{1,48}$/.test(b.id)?b.id:id()};
  const text=(v,max=12000)=>{if(typeof v!=="string"||v.length>max)throw new Error("INVALID_EDITORIAL");return v;};
  if(b.type==="paragraph"||b.type==="heading"||b.type==="quote") return {...base,type:b.type,...(b.type==="heading"?{level:[2,3,4].includes(Number(b.level))?Number(b.level):2}:{}),text:text(b.text)};
  if(b.type==="code"){const code=text(b.code,20000),language=LANGUAGES.has(b.language)?b.language:"text";return {...base,type:"code",language,code};}
  if(b.type==="list"){if(!Array.isArray(b.items)||b.items.length>80)throw new Error("INVALID_EDITORIAL");return {...base,type:"list",ordered:Boolean(b.ordered),items:b.items.map(x=>text(x,1000))};}
  if(b.type==="image"){const src=safeUrl(b.src,true);if(!src)throw new Error("INVALID_EDITORIAL");return {...base,type:"image",src,alt:text(b.alt||"",300),caption:text(b.caption||"",500)};}
  if(b.type==="button"||b.type==="link"){const href=safeUrl(b.href);if(!href)throw new Error("INVALID_EDITORIAL");return {...base,type:b.type,href,label:text(b.label,160)};}
  if(b.type==="embed"){let videoId=typeof b.videoId==="string"?b.videoId:"";if(!videoId){const u=safeUrl(b.url);if(!u||!/^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{6,}/i.test(u))throw new Error("INVALID_EDITORIAL");videoId=new URL(u).hostname.includes("youtu.be")?new URL(u).pathname.slice(1):new URL(u).searchParams.get("v");}if(!/^[\w-]{6,}$/.test(videoId))throw new Error("INVALID_EDITORIAL");return {...base,type:"embed",provider:"youtube",videoId};}
  if(b.type==="table"){if(!Array.isArray(b.headers)||!Array.isArray(b.rows)||b.headers.length<1||b.headers.length>8||b.rows.length>30||b.rows.some(r=>!Array.isArray(r)||r.length!==b.headers.length))throw new Error("INVALID_EDITORIAL");return {...base,type:"table",headers:b.headers.map(x=>text(x,160)),rows:b.rows.map(r=>r.map(x=>text(x,500)))};}
  if(b.type==="divider") return {...base,type:"divider"};
  throw new Error("INVALID_EDITORIAL");
 });
 const ids=new Set(); for(const b of blocks){if(ids.has(b.id))throw new Error("INVALID_EDITORIAL");ids.add(b.id);}
 return {version:VERSION,blocks};
}
export function parseEditorialHtml(html){
 if(typeof html!=="string"||html.length>60000)throw new Error("FIELD_TOO_LONG");
 html=html.replace(/<!doctype[^>]*>/i,"").replace(/<\/?(?:html|body)(?:\s[^>]*)?>/gi,"");
 if(/<(script|style|iframe|object|embed|svg|math|form|input|video|audio)\b|\son[a-z]+\s*=|javascript\s*:/i.test(html))throw new Error("UNSAFE_HTML");
 const root={tag:"root",attrs:{},children:[]},stack=[root],tokens=html.match(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g)||[];
 for(const token of tokens){
  if(token.startsWith("<!--"))continue;
  if(!token.startsWith("<")){stack[stack.length-1].children.push({tag:"#text",text:token,children:[]});continue;}
  const closing=/^<\//.test(token),m=token.match(/^<\/?\s*([a-z0-9]+)/i);if(!m)throw new Error("UNSAFE_HTML");
  const tag=m[1].toLowerCase();if(!TAGS.has(tag))throw new Error("UNSAFE_HTML");
  if(closing){let at=-1;for(let i=stack.length-1;i>0;i--)if(stack[i].tag===tag){at=i;break;}if(at<0)throw new Error("UNSAFE_HTML");stack.length=at;continue;}
  const attrs={};for(const match of token.matchAll(/([a-z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)){const key=match[1].toLowerCase();if(!(ATTRS[tag]||ATTRS["*"]).includes(key))throw new Error("UNSAFE_HTML");attrs[key]=decodeEntities(match[2]??match[3]??"");}
  const node={tag,attrs,children:[]};stack[stack.length-1].children.push(node);if(!VOID.has(tag)&&!/^<[^>]*\/>$/.test(token))stack.push(node);
 }
 if(stack.length!==1)throw new Error("UNSAFE_HTML");
 const textOf=node=>node.tag==="#text"?decodeEntities(node.text):node.children.map(textOf).join("");
 const blocks=[];
 for(const node of root.children){
  if(node.tag==="#text"){const text=textOf(node).trim();if(text)blocks.push({type:"paragraph",text});continue;}
  if(["p","h2","h3","h4","blockquote"].includes(node.tag)){const text=textOf(node).trim();if(text)blocks.push({type:node.tag==="blockquote"?"quote":node.tag.startsWith("h")?"heading":"paragraph",...(node.tag.startsWith("h")?{level:Number(node.tag.slice(1))}:{}),text});continue;}
  if(node.tag==="pre"){const code=node.children.find(x=>x.tag==="code");if(!code)throw new Error("UNSAFE_HTML");const cls=code.attrs.class||"",lang=(cls.match(/language-([a-z0-9+-]+)/i)||[])[1]||"text";blocks.push({type:"code",language:LANGUAGES.has(lang.toLowerCase())?lang.toLowerCase():"text",code:textOf(code)});continue;}
  if(node.tag==="ul"||node.tag==="ol"){blocks.push({type:"list",ordered:node.tag==="ol",items:node.children.filter(x=>x.tag==="li").map(textOf)});continue;}
  if(node.tag==="img"){const src=safeUrl(node.attrs.src,true);if(!src)throw new Error("UNSAFE_HTML");blocks.push({type:"image",src,alt:node.attrs.alt||"",caption:node.attrs.title||""});continue;}
  if(node.tag==="a"){const href=safeUrl(node.attrs.href);if(!href)throw new Error("UNSAFE_HTML");if(node.attrs["data-df-embed"]==="youtube"){const u=new URL(href),videoId=u.hostname.includes("youtu.be")?u.pathname.slice(1):u.searchParams.get("v");if(!videoId||!/^[\w-]{6,}$/.test(videoId))throw new Error("UNSAFE_HTML");blocks.push({type:"embed",provider:"youtube",videoId});continue;}const label=textOf(node).trim();if(label)blocks.push({type:node.attrs["data-df-button"]!==undefined?"button":"link",href,label});continue;}
  if(node.tag==="table"){const trs=[];const walk=n=>{if(n.tag==="tr")trs.push(n);else n.children.forEach(walk)};walk(node);const headers=trs[0]?.children.filter(x=>x.tag==="th"||x.tag==="td").map(textOf)||[];const rows=trs.slice(1).map(tr=>tr.children.filter(x=>x.tag==="th"||x.tag==="td").map(textOf));if(headers.length)blocks.push({type:"table",headers,rows});continue;}
  if(node.tag==="hr"){blocks.push({type:"divider"});continue;}
  if(node.tag==="figure"){const img=node.children.find(x=>x.tag==="img"),caption=node.children.find(x=>x.tag==="figcaption");if(img){const src=safeUrl(img.attrs.src,true);if(!src)throw new Error("UNSAFE_HTML");blocks.push({type:"image",src,alt:img.attrs.alt||"",caption:caption?textOf(caption):""});}continue;}
  if(["div","span","strong","b","em","i","u","s"].includes(node.tag)){const text=textOf(node).trim();if(text)blocks.push({type:"paragraph",text});continue;}
  throw new Error("UNSAFE_HTML");
 }
 return validateEditorial({version:VERSION,blocks:blocks.map(b=>({id:id(),...b}))});
}
function decodeEntities(s){return String(s).replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,"&").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)||0xfffd));}
export function editorialToText(doc){return doc.blocks.map(b=>b.type==="paragraph"||b.type==="heading"||b.type==="quote"?b.text:b.type==="list"?b.items.join(" "):b.type==="button"||b.type==="link"?b.label:b.type==="image"?b.caption:b.type==="table"?[...b.headers,...b.rows.flat()].join(" "):"").filter(Boolean).join(" ");}
export function editorialToHtml(doc){
 return doc.blocks.map(b=>{const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 switch(b.type){case"paragraph":return "<p>"+esc(b.text)+"</p>";case"heading":return "<h"+b.level+">"+esc(b.text)+"</h"+b.level+">";case"quote":return "<blockquote>"+esc(b.text)+"</blockquote>";case"code":return "<pre><code class=\"language-"+b.language+"\">"+esc(b.code)+"</code></pre>";case"list":return "<"+(b.ordered?"ol":"ul")+">"+b.items.map(x=>"<li>"+esc(x)+"</li>").join("")+"</"+(b.ordered?"ol":"ul")+">";case"image":return '<img src="'+esc(b.src)+'" alt="'+esc(b.alt)+'" title="'+esc(b.caption)+'">';case"button":case"link":return '<a href="'+esc(b.href)+'"'+(b.type==="button"?' data-df-button="true"':"")+">"+esc(b.label)+"</a>";case"embed":return '<a data-df-embed="youtube" href="https://youtu.be/'+b.videoId+'">YouTube video</a>';case"table":return "<table><thead><tr>"+b.headers.map(x=>"<th>"+esc(x)+"</th>").join("")+"</tr></thead><tbody>"+b.rows.map(r=>"<tr>"+r.map(x=>"<td>"+esc(x)+"</td>").join("")+"</tr>").join("")+"</tbody></table>";case"divider":return "<hr>";default:return"";}
 }).join("\n");
}
