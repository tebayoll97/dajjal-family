import "server-only";
import { validateEditorial } from "./editorialContent";
const MODEL="gemini-3.1-flash-lite";
export async function translateEditorialContent(document,sourceLocale){
 const doc=validateEditorial(document),targetLocale=sourceLocale==="id"?"en":"id";
 const translatable=[];
 doc.blocks.forEach((b,i)=>{if(["paragraph","heading","quote"].includes(b.type))translatable.push({path:[i,"text"],text:b.text});if(b.type==="list")b.items.forEach((text,j)=>translatable.push({path:[i,"items",j],text}));if(b.type==="button"||b.type==="link")translatable.push({path:[i,"label"],text:b.label});if(b.type==="image"){translatable.push({path:[i,"alt"],text:b.alt});translatable.push({path:[i,"caption"],text:b.caption});}if(b.type==="table"){b.headers.forEach((text,j)=>translatable.push({path:[i,"headers",j],text}));b.rows.forEach((row,r)=>row.forEach((text,c)=>translatable.push({path:[i,"rows",[r,c]],text})));}});
 const entries=translatable.filter(x=>x.text.trim());if(!entries.length)return doc;
 const key=process.env.GEMINI_API_KEY;if(!key)throw new Error("TRANSLATION_NOT_CONFIGURED");
 const source=sourceLocale==="id"?"Indonesian":"English",target=targetLocale==="id"?"Indonesian":"English";
 const response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+MODEL+":generateContent",{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({systemInstruction:{parts:[{text:"Translate only the supplied text values from "+source+" to "+target+". Return JSON {translations:[string,...]} in the exact input order. Preserve names, factual meaning, URLs if present in text, and tone. Do not summarize or add facts."}]},contents:[{role:"user",parts:[{text:JSON.stringify({translations:entries.map(x=>x.text)})}]}],generationConfig:{responseMimeType:"application/json",temperature:0.1,maxOutputTokens:12000}}),signal:AbortSignal.timeout(45000),cache:"no-store"});
 const payload=await response.json().catch(()=>null);if(!response.ok)throw new Error("TRANSLATION_FAILED");
 const raw=payload?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("").trim();let result;try{result=JSON.parse(raw)}catch{throw new Error("TRANSLATION_FAILED")}
 if(!Array.isArray(result?.translations)||result.translations.length!==entries.length||result.translations.some((x)=>typeof x!=="string"||!x.trim()))throw new Error("TRANSLATION_FAILED");
 const output=structuredClone(doc);entries.forEach((entry,i)=>{const [bi,field,ii]=entry.path;if(field==="items"||field==="headers")output.blocks[bi][field][ii]=result.translations[i];else if(field==="rows")output.blocks[bi].rows[ii[0]][ii[1]]=result.translations[i];else output.blocks[bi][field]=result.translations[i];});
 const sourceCode=doc.blocks.filter(b=>b.type==="code").map(b=>b.code),targetCode=output.blocks.filter(b=>b.type==="code").map(b=>b.code);if(JSON.stringify(sourceCode)!==JSON.stringify(targetCode))throw new Error("TRANSLATION_FAILED");
 return validateEditorial(output);
}
