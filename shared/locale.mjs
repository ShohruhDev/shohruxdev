export function localeOf(path){return /^\/uz(?:\/|$)/.test(path)?'uz':'ru'}
export function localePath(path,locale){
 const clean=path.replace(/^\/uz(?=\/|[?#]|$)/,'')||'/';
 if(clean==='/admin'||clean.startsWith('/admin/'))return clean;
 if(clean.startsWith('/feed.xml'))return locale==='uz'?'/feed.xml?lang=uz':'/feed.xml';
 return locale==='uz'?'/uz'+(clean==='/'?'':clean):clean;
}
export function localizePost(post,locale){
 const {translations,...base}=post;
 if(locale==='uz'&&!translations?.uz)return null;
 const {title,description,category,content,answer,faq,readTime,sources,...metadata}=base;
 return {...(locale==='uz'?{...metadata,...translations.uz}:base),locale,availableLocales:translations?.uz?['ru','uz']:['ru']};
}
