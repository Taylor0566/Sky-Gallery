export const SupportedLanguages = ["zh-CN", "zh-TW", "en", "fr"] as const;
export type Lang = typeof SupportedLanguages[number];

const zhCN = {
  "common.brand": "天空画廊",
  "nav.draw": "绘画",
  "nav.leaderboard": "排行榜",
  "nav.search": "搜索",
  "nav.likesLeft": "今日剩余点赞",
  "share.facebook": "分享到 Facebook",
  "share.instagram": "分享到 Instagram",
  "share.x": "分享到 X",

  "search.title": "搜索作品",
  "search.placeholder": "输入作品标题或ID",
  "search.submit": "搜索",
  "search.noResults": "未找到匹配的作品",
  "error.searchFailed": "搜索失败",

  "artwork.untitled": "作品",

  "hero.title": "跃入天空，与灵感同飞",
  "hero.subtitle": "在天空画廊，创作、分享你的作品，感受自由漂浮的灵感云海。",
  "hero.cta_draw": "开始绘画",
  "hero.cta_leaderboard": "查看排行榜",

  "leaderboard.title": "天梯排行榜",
  "common.author": "作者：",
  "common.id": "ID：",
  "actions.like": "点赞",
  "actions.unlike": "取消点赞",
  "actions.close": "关闭",
  
  "comments.title": "评论",
  "comments.placeholder": "输入评论…",
  "comments.submit": "发表",
  "comments.loading": "加载评论中…",
  "comments.empty": "暂无评论",
  
  "error.commentPostFailed": "发表评论失败",
  "error.loadCommentsFailed": "加载评论失败",
  "error.network": "网络错误",
  
  "notify.liked": "已点赞",
  "notify.unliked": "已取消点赞",
};

const zhTW = {
  "common.brand": "天空畫廊",
  "nav.draw": "繪畫",
  "nav.leaderboard": "排行榜",
  "nav.search": "搜尋",
  "nav.likesLeft": "今日剩餘按讚",
  "share.facebook": "分享到 Facebook",
  "share.instagram": "分享到 Instagram",
  "share.x": "分享到 X",

  "search.title": "搜尋作品",
  "search.placeholder": "輸入作品標題或ID",
  "search.submit": "搜尋",
  "search.noResults": "未找到符合的作品",
  "error.searchFailed": "搜尋失敗",

  "artwork.untitled": "作品",

  "hero.title": "躍入天空，與靈感同飛",
  "hero.subtitle": "在天空畫廊，創作、分享你的作品，感受自由漂浮的靈感雲海。",
  "hero.cta_draw": "開始繪畫",
  "hero.cta_leaderboard": "查看排行榜",

  "leaderboard.title": "天梯排行榜",
  "common.author": "作者：",
  "common.id": "ID：",
  "actions.like": "按讚",
  "actions.unlike": "取消按讚",
  "actions.close": "關閉",
  
  "comments.title": "評論",
  "comments.placeholder": "輸入評論…",
  "comments.submit": "發表",
  "comments.loading": "載入評論中…",
  "comments.empty": "暫無評論",
  
  "error.commentPostFailed": "發表評論失敗",
  "error.loadCommentsFailed": "載入評論失敗",
  "error.network": "網路錯誤",
  
  "notify.liked": "已按讚",
  "notify.unliked": "已取消按讚",
};

const en = {
  "common.brand": "Sky Gallery",
  "nav.draw": "Draw",
  "nav.leaderboard": "Leaderboard",
  "nav.search": "Search",
  "nav.likesLeft": "Likes left today",
  "share.facebook": "Share to Facebook",
  "share.instagram": "Share to Instagram",
  "share.x": "Share to X",

  "search.title": "Search Artworks",
  "search.placeholder": "Enter title or ID",
  "search.submit": "Search",
  "search.noResults": "No matching artworks found",
  "error.searchFailed": "Search failed",

  "artwork.untitled": "Artwork",

  "hero.title": "Leap into the sky, fly with inspiration",
  "hero.subtitle": "Create and share in the Sky Gallery, where ideas freely float.",
  "hero.cta_draw": "Start Drawing",
  "hero.cta_leaderboard": "View Leaderboard",

  "leaderboard.title": "Leaderboard",
  "common.author": "Author: ",
  "common.id": "ID: ",
  "actions.like": "Like",
  "actions.unlike": "Unlike",
  "actions.close": "Close",
  
  "comments.title": "Comments",
  "comments.placeholder": "Write a comment…",
  "comments.submit": "Post",
  "comments.loading": "Loading comments…",
  "comments.empty": "No comments yet",
  
  "error.commentPostFailed": "Failed to post comment",
  "error.loadCommentsFailed": "Failed to load comments",
  "error.network": "Network error",
  
  "notify.liked": "Liked",
  "notify.unliked": "Unliked",
};

const fr = {
  "common.brand": "Galerie du ciel",
  "nav.draw": "Dessiner",
  "nav.leaderboard": "Classement",
  "nav.search": "Recherche",
  "nav.likesLeft": "J’aime restants aujourd’hui",
  "share.facebook": "Partager sur Facebook",
  "share.instagram": "Partager sur Instagram",
  "share.x": "Partager sur X",

  "search.title": "Rechercher des œuvres",
  "search.placeholder": "Saisir le titre ou l’ID",
  "search.submit": "Rechercher",
  "search.noResults": "Aucune œuvre correspondante",
  "error.searchFailed": "Échec de la recherche",

  "artwork.untitled": "Œuvre",

  "hero.title": "Bondissez dans le ciel, volez avec l’inspiration",
  "hero.subtitle": "Créez et partagez dans la Galerie du ciel, où les idées flottent librement.",
  "hero.cta_draw": "Commencer à dessiner",
  "hero.cta_leaderboard": "Voir le classement",

  "leaderboard.title": "Classement",
  "common.author": "Auteur : ",
  "common.id": "ID : ",
  "actions.like": "J’aime",
  "actions.unlike": "Ne plus aimer",
  "actions.close": "Fermer",
  
  "comments.title": "Commentaires",
  "comments.placeholder": "Écrire un commentaire…",
  "comments.submit": "Publier",
  "comments.loading": "Chargement des commentaires…",
  "comments.empty": "Aucun commentaire",
  
  "error.commentPostFailed": "Échec de la publication du commentaire",
  "error.loadCommentsFailed": "Échec du chargement des commentaires",
  "error.network": "Erreur réseau",
  
  "notify.liked": "Aimé",
  "notify.unliked": "Je n’aime plus",
};

export const translations: Record<Lang, Record<string, string>> = {
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  en,
  fr,
};

export function t(lang: Lang | string | undefined, key: string): string {
  const l = (SupportedLanguages as readonly string[]).includes(String(lang)) ? (lang as Lang) : "zh-CN";
  const dict = translations[l] || translations["zh-CN"];
  return dict[key] ?? translations["zh-CN"][key] ?? key;
}
