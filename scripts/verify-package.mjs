// Exercise the same production package verifier used before native launch.
import { build } from 'esbuild';
import { mkdtemp, readFile, writeFile, readdir, stat, lstat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const root=resolve(process.argv[2]);
const temp=await mkdtemp(join(tmpdir(),'evidra-verify-'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
try {
    const modulePath=join(temp,'verify.mjs');
    await build({entryPoints:['apps/zotero/src/bootstrap/engine.ts'],outfile:modulePath,bundle:true,platform:'node',format:'esm',logLevel:'silent'});
    const {verifyPackage}=await import(pathToFileURL(modulePath).href);
    const io={join,readJson:async p=>JSON.parse(await readFile(p,'utf8')),hashText:async text=>hash(Buffer.from(text)),hashFile:async p=>({sha256:hash(await readFile(p)),size:(await stat(p)).size}),listFiles:async root=>{
        const files=[];
        async function walk(dir,prefix='') {for(const name of await readdir(dir)){const path=join(dir,name),info=await lstat(path);if(info.isSymbolicLink())throw new Error('UNSAFE_PAYLOAD_PATH');if(info.isDirectory())await walk(path,prefix+name+'/');else if(info.isFile()){if(prefix||name!=='engine-manifest.json')files.push(prefix+name);}else throw new Error('UNSAFE_PAYLOAD_PATH');}}
        await walk(root);return files;
    }};
    const result=await verifyPackage(root,io);
    const denials=[];
    if(process.argv.includes('--exercise-rejection')) {
        const manifestPath=join(root,'engine-manifest.json'),original=await readFile(manifestPath);
        try {
            await writeFile(manifestPath,'{corrupt');
            try {await verifyPackage(root,io);throw new Error('CORRUPTED_MANIFEST_ACCEPTED');}
            catch(error){if(error.message!=='INVALID_ENGINE_MANIFEST')throw error;denials.push(error.message);}
        } finally {await writeFile(manifestPath,original);}
        const file=join(root,result.manifest.files.find(file=>file.path.endsWith('.txt')).path),bytes=await readFile(file);
        try {
            await writeFile(file,Buffer.concat([bytes,Buffer.from('corrupt')]));
            try {await verifyPackage(root,io);throw new Error('CORRUPTED_PAYLOAD_ACCEPTED');}
            catch(error){if(error.message!=='PAYLOAD_HASH_MISMATCH')throw error;denials.push(error.message);}
        } finally {await writeFile(file,bytes);}
        if((await verifyPackage(root,io)).fingerprint!==result.fingerprint)throw new Error('RESTORED_PACKAGE_DIFFERS');
    }
    console.log(JSON.stringify({status:'VERIFIED',root,fingerprint:result.fingerprint,files:result.manifest.files.length,denials}));
} finally {await rm(temp,{recursive:true,force:true});}
