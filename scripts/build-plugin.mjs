import { build } from 'esbuild';
import { mkdir,copyFile,readFile,writeFile,readdir } from 'node:fs/promises';
import { join,resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const manifest=JSON.parse(await readFile('apps/zotero/manifest.json','utf8'));
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const stage=resolve('.local/task-2/build',stamp);const out=resolve('.local/task-2/dist');
await mkdir(join(stage,'content'),{recursive:true});await mkdir(out,{recursive:true});
async function copyTree(from,to){await mkdir(to,{recursive:true});for(const item of await readdir(from,{withFileTypes:true})){if(item.isDirectory())await copyTree(join(from,item.name),join(to,item.name));else if(item.isFile())await copyFile(join(from,item.name),join(to,item.name));else throw new Error('Unsupported package resource');}}
for(const file of ['bootstrap.js','manifest.json','chrome.manifest'])await copyFile(join('apps/zotero',file),join(stage,file));
await copyTree('apps/zotero/content',join(stage,'content'));await copyTree('apps/zotero/locale',join(stage,'locale'));
await copyFile('apps/zotero/src/ui/style.css',join(stage,'content/ui.css'));
const options={bundle:true,platform:'browser',target:['firefox140'],format:'iife',legalComments:'eof',metafile:true,logLevel:'info',define:{'process.env.NODE_ENV':'"production"'}};
const native=await build({...options,entryPoints:['apps/zotero/src/bootstrap/entry.ts'],outfile:join(stage,'content/native.js'),globalName:'EvidraRuntime'});
const renderer=await build({...options,entryPoints:['apps/zotero/src/ui/entry.tsx'],outfile:join(stage,'content/ui.js'),minify:true});
for(const output of [...Object.values(native.metafile.outputs),...Object.values(renderer.metafile.outputs)])if(output.imports.length)throw new Error('External runtime dependency in plugin bundle');
const licenses=[];
for(const name of ['react','react-dom','scheduler','dompurify','markdown-it','ajv']){
  const root=join('node_modules',name);const pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
  const files=(await readdir(root)).filter(n=>/^licen[cs]e(?:\.|$)/i.test(n));if(!files.length)throw new Error(`Missing license: ${name}`);
  licenses.push(`${name} ${pkg.version}\n${(await Promise.all(files.map(n=>readFile(join(root,n),'utf8')))).join('\n')}`);
}
await writeFile(join(stage,'THIRD_PARTY_NOTICES.txt'),licenses.join('\n\n================\n\n'));
const xpi=join(out,`evidra-${manifest.version}.xpi`);
execFileSync('uv',['run','--project','services/engine','--no-sync','python','scripts/package-plugin.py',stage,xpi],{stdio:'inherit'});
await writeFile(join(out,'build-receipt.json'),JSON.stringify({created_at:new Date().toISOString(),stage,xpi,sha256:createHash('sha256').update(await readFile(xpi)).digest('hex'),manifest,native: native.metafile,renderer:renderer.metafile,native_acceptance:'NOT_VERIFIED'},null,2));
console.log(`XPI: ${xpi}`);
