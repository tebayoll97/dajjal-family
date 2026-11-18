export const COUPLE_CONTENT_DEFAULTS={
 id:{subtitle:"Dua dunia, satu cerita yang terus berlanjut. ❤️",intro:"Setiap pasangan punya cerita. Ini adalah ruang kecil untuk menyimpan perjalanan kalian.",male_role:"THE ONE",male_description:"Ceritakan sedikit tentang dirinya.",female_role:"THE ONE",female_description:"Ceritakan sedikit tentang dirinya.",story_title:"Cerita Kita",story_text:"Tuliskan bagaimana cerita kalian dimulai dan kenangan yang ingin terus diingat.",signature:"Dua hati, satu cerita, dan banyak halaman yang masih menunggu untuk ditulis. ❤️",anniversary_label:"PERJALANAN KITA"},
 en:{subtitle:"Two worlds, one story that keeps unfolding. ❤️",intro:"Every couple has a story. This is your little space to preserve the journey.",male_role:"THE ONE",male_description:"Tell a little about him.",female_role:"THE ONE",female_description:"Tell a little about her.",story_title:"Our Story",story_text:"Write how your story began and the memories you want to keep.",signature:"Two hearts, one story, and many pages still waiting to be written. ❤️",anniversary_label:"OUR JOURNEY"}
};
export const COUPLE_CONTENT_KEYS=Object.keys(COUPLE_CONTENT_DEFAULTS.id);
export const COUPLE_PRIMARY_MEDIA_SLOTS=["cover","male_portrait","female_portrait"];
export const COUPLE_GALLERY_SLOTS=Array.from({length:6},(_,i)=>`gallery_${i+1}`);
export const COUPLE_MEDIA_SLOTS=[...COUPLE_PRIMARY_MEDIA_SLOTS,...COUPLE_GALLERY_SLOTS];
export function coupleDriveImage(fileId,size=1600){return fileId?`https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${size}`:"";}
