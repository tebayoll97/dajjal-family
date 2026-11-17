const labels={
 en:{home:"Home",games:"Gaming",knowledge:"Knowledge",blog:"Blog",tools:"Tools",digitalProducts:"Digital Products",business:"Business",community:"Community",settings:"Settings",universe:"Family Universe",gameLibrary:"Game Library",mamahNgamuk:"Mamah Ngamuk",runJump:"Run & Jump",admin:"Admin",adminUsers:"User Management",weddingGallery:"Wedding Gallery",weddingEvent:"Wedding Event Time",guestbook:"Guestbook Messages"},
 id:{home:"Beranda",games:"Gaming",knowledge:"Pengetahuan",blog:"Blog",tools:"Alat",digitalProducts:"Produk Digital",business:"Bisnis",community:"Komunitas",settings:"Pengaturan",universe:"Universe Keluarga",gameLibrary:"Perpustakaan Game",mamahNgamuk:"Mamah Ngamuk",runJump:"Lari & Lompat",admin:"Admin",adminUsers:"Manajemen Pengguna",weddingGallery:"Galeri Pernikahan",weddingEvent:"Waktu Acara Undangan",guestbook:"Pesan Guestbook"}
};
export function getNavigationGroups(language="id"){
 const t=labels[language]||labels.id;
 return [
 {id:"gaming",label:t.games,icon:"games",items:[{label:t.gameLibrary,route:"/games",icon:"games"},{label:t.mamahNgamuk,route:"/games/mamah-ngamuk",icon:"games"},{label:t.runJump,route:"/games/run-jump",icon:"games"}]},
 {id:"knowledge",label:t.knowledge,icon:"blog",items:[{label:t.knowledge,route:"/knowledge",icon:"blog"}]},
 {id:"blog",label:t.blog,icon:"blog",items:[{label:t.blog,route:"/blog",icon:"blog"}]},
 {id:"tools",label:t.tools,icon:"products",items:[{label:t.digitalProducts,route:"/digital-products",icon:"products"},{label:t.business,route:"/business",icon:"universe"},{label:t.community,route:"/community",icon:"universe"},{label:t.settings,route:"/settings",icon:"profile"}]},
 {id:"universe",label:t.universe,icon:"universe",items:[{label:t.universe,route:"/df",icon:"universe"}]}
 ];
}
export function getAdminNavigationGroup(language="id"){
 const t=labels[language]||labels.id;
 return {id:"admin",label:t.admin,icon:"profile",items:[{label:t.admin,route:"/admin",icon:"profile"},{label:t.adminUsers,route:"/admin/players",icon:"profile"},{label:t.weddingGallery,route:"/admin/wedding-gallery",icon:"universe"},{label:t.weddingEvent,route:"/admin/wedding-event",icon:"universe"},{label:t.guestbook,route:"/admin/wedding-guestbook",icon:"blog"}]};
}
export function getNavigationLabels(language="id"){return labels[language]||labels.id;}
