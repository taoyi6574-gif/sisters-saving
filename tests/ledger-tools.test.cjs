const test=require('node:test');
const assert=require('node:assert/strict');
const T=require('../ledger-tools.js');
test('mixed markdown bullets and amount-only indented items',()=>{
 const result=T.parseText('- 11.1\n  - 2地铁\n  * 9.9面包\n- 10.31\n  - 8.29\n  * 88（年卡）',2026);
 assert.deepEqual(result.errors,[]);assert.equal(result.items.length,4);assert.equal(result.items[2].date,'2026-10-31');assert.equal(result.items[2].amount,8.29);assert.equal(result.items[2].note,'');assert.equal(result.items[3].note,'（年卡）');
});
test('valid dates, missing dates and invalid precision',()=>{
 assert.equal(T.parseText('- 2.29\n  - 1水',2026).errors.length,2);
 assert.equal(T.parseText('- 2.29\n  - 1水',2024).errors.length,0);
 for(const row of ['1.234水','-2退款','1e3','Infinity','999999999999999999999水'])assert(T.parseText('- 11.1\n  '+row,2026).errors.length>0,row);
 assert(T.parseText('  - 2地铁',2026).errors.length>0);
});
test('year controls and explicit full dates',()=>{
 const source='- 1.1\n  - 1水\n- 12.31\n  - 2水';
 assert.equal(T.parseText(source,2026).items[1].date,'2025-12-31');assert.equal(T.parseText(source,2026,'same').items[1].date,'2026-12-31');
 assert.equal(T.parseText('- 12.31\n  - 2水\n- 1.1\n  - 1水',2026,'ascending').items[1].date,'2027-01-01');
 assert.equal(T.parseText('- 2024-02-29\n  - 1水',2026).items[0].date,'2024-02-29');
});
test('old and unknown categories are preserved as secondary labels',()=>{
 for(const old of ['breakfast','lunch','dinner','snack','social']){assert.deepEqual(T.cats({cat:old}),['food']);assert.equal(T.secondary({cat:old}).food,old)}
 for(const old of ['entertainment','other','unknown_old']){assert.deepEqual(T.cats({cat:old}),['daily']);assert.equal(T.secondary({cat:old}).daily,old)}
});
test('multiple categories, fixed priority and exact integer cents',()=>{
 const entry={cat:'shopping',categories:['shopping','collectible','fixed','shopping'],subcategories:{shopping:'shopping',collectible:'collectible',fixed:'fixed'}};
 assert.deepEqual(T.cats(entry),['shopping','collectible','fixed']);assert(T.has(entry,'fixed'));assert.equal(T.legacyCat(T.cats(entry),entry.subcategories),'fixed');assert.equal(T.cents('0.10')+T.cents('0.20'),30);assert.equal(T.cents('1.234'),null);
});
test('source identity distinguishes profiles and repeated identical items',()=>{
 const e={date:'2026-11-01',amount:2,note:'地铁'};
 assert.notEqual(T.textKey('me',e,1),T.textKey('sis',e,1));assert.notEqual(T.textKey('me',e,1),T.textKey('me',e,2));
});
