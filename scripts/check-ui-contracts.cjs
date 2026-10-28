'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const patterns=[
 ['native popup selector',/<(?:select|datalist)\b/i],
 ['programmatic popup selector',/createElement\s*\(\s*['"](?:select|datalist)['"]/i],
 ['custom popup selector',/\brole\s*=\s*['"]combobox['"]/i],
 ['popup choice list',/\baria-haspopup\s*=\s*['"]listbox['"]/i]
];
const errors=[];
for(const file of fs.readdirSync(root)){
 if(!/\.(?:html|js)$/.test(file))continue;
 const source=fs.readFileSync(path.join(root,file),'utf8');
 source.split(/\r?\n/).forEach((line,index)=>{
  for(const [name,pattern] of patterns)if(pattern.test(line))errors.push(file+':'+(index+1)+' contains a '+name);
 });
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log('UI contracts passed: application sources contain no dropdown selectors.');
