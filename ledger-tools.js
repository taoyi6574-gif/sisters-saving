/* Shared category and text-import rules; no storage writes. */
(function(root){
'use strict';
const categories=[['food','饮食','🍱'],['transport','交通','🚇'],['shopping','网购','🛒'],['tea','奶茶','🧋'],['fixed','固定开支','🏠'],['daily','日用品','🧴'],['collectible','周边盲盒','🧸']];
const subs={food:[['food_other','未细分'],['breakfast','早餐'],['lunch','午餐'],['dinner','晚餐'],['snack','零食/水果'],['social','聚餐/社交']],transport:[['transport','日常交通'],['travel','出行/住宿']],shopping:[['shopping','网购']],tea:[['tea','奶茶/咖啡']],fixed:[['fixed','固定支出']],daily:[['daily','日用品'],['entertainment','娱乐'],['service','生活服务'],['other','其他']],collectible:[['collectible','周边/盲盒']]};
const legacy={};for(const [parent,children] of Object.entries(subs))for(const [key] of children)legacy[key]=parent;
function cats(e){const given=Array.isArray(e.categories)?e.categories.filter(k=>categories.some(c=>c[0]===k)):[];return [...new Set(given.length?given:[legacy[e.cat]|| (categories.some(c=>c[0]===e.cat)?e.cat:'daily')])]}
function secondary(e){const out={};for(const c of cats(e)){const v=e.subcategories?.[c];if(typeof v==='string'&&v)out[c]=v;else if(legacy[e.cat]===c||(!legacy[e.cat]&&c==='daily'&&e.cat))out[c]=e.cat;else out[c]=subs[c][0][0]}return out}
function has(e,c){return cats(e).includes(c)}
function label(e){const secondaryKeys=secondary(e);return cats(e).map(c=>{const name=categories.find(x=>x[0]===c)[1],sub=subs[c].find(x=>x[0]===secondaryKeys[c])?.[1]||secondaryKeys[c];return name+(sub&&sub!==name?' / '+sub:'')}).join(' · ')}
function legacyCat(cs,ss){const primary=cs.includes('fixed')?'fixed':cs.includes('collectible')?'collectible':cs.includes('tea')?'tea':cs.find(c=>c!=='shopping')||cs[0];return ss[primary]||subs[primary][0][0]}
function cents(raw){const s=String(raw).trim();if(!/^\d+(?:\.\d{1,2})?$/.test(s))return null;const [w,f='']=s.split('.'),n=Number(w)*100+Number(f.padEnd(2,'0'));return Number.isSafeInteger(n)?n:null}
function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const [y,m,d]=value.split('-').map(Number);if(y<1900||y>9999||m<1||m>12||d<1)return false;return d<=new Date(y,m,0).getDate()}
function parseText(text,year,order='descending'){
 const lines=String(text).replace(/\r\n?/g,'\n').split('\n'),items=[],errors=[],headers=[];let active=null,y=Number(year),lastMonth=null;
 if(!Number.isInteger(y)||y<1900||y>9999)return {items,errors:[{line:0,message:'年份应为 1900—9999 的整数'}],headers};
 const records=lines.map((line,i)=>{const expanded=line.replace(/\t/g,'    '),indent=expanded.match(/^ */)[0].length,body=expanded.trim().replace(/^[-*•]\s+/, '').trim();return {line:i+1,indent,body,raw:line}}).filter(x=>x.body);
 const base=records.length?Math.min(...records.map(x=>x.indent)):0;
 for(const row of records){const dateMatch=row.body.match(/^(?:(\d{4})[.\/-])?(\d{1,2})[.\/-](\d{1,2})$/);if(dateMatch&&(row.indent===base||dateMatch[1])){const m=Number(dateMatch[2]),d=Number(dateMatch[3]);if(dateMatch[1])y=Number(dateMatch[1]);else if(lastMonth!==null){if(order==='descending'&&lastMonth<=3&&m>=10)y--;if(order==='ascending'&&lastMonth>=10&&m<=3)y++}const date=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;if(!validDate(date)){errors.push({line:row.line,message:'日期无效：'+row.body});active=null;continue}active=date;lastMonth=m;headers.push({line:row.line,date});continue}
 const match=row.body.match(/^[¥￥]?\s*(\d+(?:\.\d{1,2})?)(?![\d.])\s*(?:元\s*)?(.*)$/);
 if(!active){errors.push({line:row.line,message:'这笔账单前缺少有效日期标题'});continue}
 if(!match||cents(match[1])===null||/^[¥￥]?\s*\d+(?:\.\d+)?[eE][+-]?\d+/.test(row.body)){errors.push({line:row.line,message:'无法识别金额，请使用非负数字、最多两位小数'});continue}
 items.push({line:row.line,date:active,amount:cents(match[1])/100,note:match[2].trim(),raw:row.raw});
 }
 return {items,errors,headers};
}
function normalText(s){return String(s||'').normalize('NFKC').trim().replace(/\s+/g,' ')}
function textKey(user,item,ordinal){return JSON.stringify([user,item.date,cents(Number(item.amount).toFixed(2)),normalText(item.note),ordinal])}
const api={categories,subs,legacy,cats,secondary,has,label,legacyCat,cents,validDate,parseText,normalText,textKey};root.LedgerTools=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
