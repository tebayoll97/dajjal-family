export const COUPLE_CONTENT_DEFAULTS = {
  id: {
    subtitle: "Dua elemen berbeda, tapi kok selalu ingin berdekatan? ❤️",
    intro: "Setiap pasangan punya cerita. Ini adalah ruang kecil untuk menyimpan perjalanan kalian.",
    identity_label: "IDENTITAS PASANGAN",
    male_role: "THE ONE",
    male_description: "Ceritakan sedikit tentang dirinya.",
    female_role: "THE ONE",
    female_description: "Ceritakan sedikit tentang dirinya.",
    anniversary_label: "PERJALANAN KITA",
    gallery_eyebrow: "OUR LITTLE WORLD",
    gallery_title: "Kumpulan momen yang nggak akan terlupakan. ❤️",
    gallery_intro: "Dari tingkah konyol sampai momen manis, semuanya punya cerita sendiri.",
    gallery_label: "KENANGAN KITA",
    story_eyebrow: "OUR LITTLE STORY",
    story_title: "Dua dunia, satu cerita yang terus berlanjut. ❤️",
    story_text: "Ceritakan bagaimana perjalanan kalian dimulai, tawa yang dibagikan, dan kenangan yang ingin terus disimpan.",
    signature: "Dua hati, satu cerita, dan masih banyak halaman yang belum ditulis. ❤️",
  },
  en: {
    subtitle: "Two different elements, yet why do they always want to be close? ❤️",
    intro: "Every couple has a story. This is your little space to preserve the journey.",
    identity_label: "THE COUPLE",
    male_role: "THE ONE",
    male_description: "Tell a little about him.",
    female_role: "THE ONE",
    female_description: "Tell a little about her.",
    anniversary_label: "OUR JOURNEY",
    gallery_eyebrow: "OUR LITTLE WORLD",
    gallery_title: "A collection of moments worth remembering. ❤️",
    gallery_intro: "From silly moments to sweet memories, every picture has a story.",
    gallery_label: "OUR LITTLE MOMENTS",
    story_eyebrow: "OUR LITTLE STORY",
    story_title: "Two worlds, one story that keeps unfolding. ❤️",
    story_text: "Tell how your journey began, the laughter you shared, and the memories you want to keep.",
    signature: "Two hearts, one story, and many pages still waiting to be written. ❤️",
  },
};
export const COUPLE_CONTENT_KEYS = Object.keys(COUPLE_CONTENT_DEFAULTS.id);
export const COUPLE_PRIMARY_MEDIA_SLOTS = ["cover", "male_portrait", "female_portrait"];
export const COUPLE_GALLERY_SLOTS = Array.from({ length: 6 }, (_, index) => `gallery_${index + 1}`);
export const COUPLE_MEDIA_SLOTS = [...COUPLE_PRIMARY_MEDIA_SLOTS, ...COUPLE_GALLERY_SLOTS];
export function coupleDriveImage(fileId, size = 1600) {
  return fileId ? `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}` : "";
}
