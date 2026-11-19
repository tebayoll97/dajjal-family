const labels={
 en:{home:"Home",games:"Gaming",knowledge:"Knowledge",blog:"Blog",tools:"Tools",digitalProducts:"Digital Products",business:"Business",community:"Community",universe:"Family Universe",gameLibrary:"Game Library",mamahNgamuk:"Mamah Ngamuk",runJump:"Run & Jump",admin:"Admin",adminUsers:"User Management",contactCenter:"Contact Center",helpCenter:"Help Center",support:"Support",weddingGallery:"Wedding Gallery",weddingEvent:"Wedding Event Time",guestbook:"Guestbook Messages",coupleProfile:"Couple Profile",weddingInvitation:"Anak Dajjal's Wedding",eventBadge:"Event",editThemePreset:"Edit Theme Preset"},
 id:{home:"Beranda",games:"Gaming",knowledge:"Pengetahuan",blog:"Blog",tools:"Alat",digitalProducts:"Produk Digital",business:"Bisnis",community:"Komunitas",universe:"Universe Keluarga",gameLibrary:"Perpustakaan Game",mamahNgamuk:"Mamah Ngamuk",runJump:"Lari & Lompat",admin:"Admin",adminUsers:"Manajemen Pengguna",contactCenter:"Contact Center",helpCenter:"Pusat Bantuan",support:"Dukungan",weddingGallery:"Galeri Pernikahan",weddingEvent:"Waktu Acara Undangan",guestbook:"Pesan Guestbook",coupleProfile:"Profil Couple",weddingInvitation:"Pernikahan Anak Dajjal",eventBadge:"Acara",editThemePreset:"Edit Preset Tema"}
};
export function getNavigationGroups(language="id"){
 const t=labels[language]||labels.id;
 return [
 {id:"gaming",label:t.games,icon:"games",items:[{label:t.gameLibrary,route:"/games",icon:"games"},{label:t.mamahNgamuk,route:"/games/mamah-ngamuk",icon:"games"},{label:t.runJump,route:"/games/run-jump",icon:"games"}]},
 {id:"knowledge",label:t.knowledge,icon:"blog",items:[{label:t.knowledge,route:"/knowledge",icon:"blog"}]},
 {id:"blog",label:t.blog,icon:"blog",items:[{label:t.blog,route:"/blog",icon:"blog"}]},
 {id:"tools",label:t.tools,icon:"products",items:[{label:t.digitalProducts,route:"/digital-products",icon:"products"},{label:t.business,route:"/business",icon:"universe"},{label:t.community,route:"/community",icon:"universe"}]},
 {id:"support",label:t.support,icon:"message",items:[{label:t.helpCenter,route:"/help",icon:"blog"},{label:t.contactCenter,route:"/contact-center",icon:"message"}]},
 {id:"universe",label:t.universe,icon:"universe",items:[{label:t.universe,route:"/df",icon:"universe"},{label:t.coupleProfile,route:"/df/couple",icon:"universe"},{label:t.weddingInvitation,route:"/df/wedding-anak-dajjal",icon:"universe",badge:t.eventBadge}]}
 ];
}
export function getAdminNavigationGroup(language="id"){
 const t=labels[language]||labels.id;
 return {id:"admin",label:t.admin,icon:"profile",items:[{label:t.admin,route:"/admin",icon:"profile"},{label:t.adminUsers,route:"/admin/players",icon:"profile"},{label:t.contactCenter,route:"/admin/contact-center",icon:"blog"},{label:t.weddingGallery,route:"/admin/wedding-gallery",icon:"universe"},{label:t.weddingEvent,route:"/admin/wedding-event",icon:"universe"},{label:t.guestbook,route:"/admin/wedding-guestbook",icon:"blog"},{label:t.editThemePreset,route:"/admin/theme",icon:"profile"}]};
}
export function getNavigationLabels(language="id"){return labels[language]||labels.id;}
