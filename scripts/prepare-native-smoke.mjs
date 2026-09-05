// Read-only preparation. This does not launch Zotero, install an XPI, or alter a profile.
import {readFile,writeFile,mkdir,readdir,lstat} from 'node:fs/promises';
import {resolve,join,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import validate from '../packages/contracts/generated/validate-manifest.js';
const [xpiArg,engineArg,profileArg,dataArg]=process.argv.slice(2);
if(!xpiArg||!engineArg||!profileArg||!dataArg||process.argv.length!==6)throw new Error('Usage: node scripts/prepare-native-smoke.mjs <xpi> <engine-root> <new-test-profile> <new-test-data>');
const [xpi,engine,profile,data]=[xpiArg,engineArg,profileArg,dataArg].map(value=>resolve(value));
if(profile===data||profile===engine||data===engine)throw new Error('TEST_PATHS_MUST_BE_DISTINCT');
for(const path of [profile,data]){if(!isAbsolute(path))throw new Error('ABSOLUTE_TEST_PATH_REQUIRED');try{await lstat(path);throw new Error('TEST_TARGET_MUST_BE_NEW');}catch(error){if(error.code!=='ENOENT')throw error;}}
const manifest=JSON.parse(await readFile(join(engine,'engine-manifest.json'),'utf8'));if(!validate(manifest))throw new Error('INVALID_ENGINE_MANIFEST');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');const files=[];
async function walk(dir,prefix=''){for(const name of await readdir(dir)){const path=join(dir,name),s=await lstat(path);if(s.isSymbolicLink())throw new Error('REPARSE_PATH');if(s.isDirectory())await walk(path,prefix+name+'/');else if(prefix||name!=='engine-manifest.json')files.push(prefix+name);}}
await walk(engine);if(files.length!==manifest.files.length)throw new Error('PAYLOAD_FILE_SET_MISMATCH');
for(const file of manifest.files){if(!files.includes(file.path)||file.path.split('/').some(p=>!p||p==='.'||p==='..'))throw new Error('PAYLOAD_FILE_SET_MISMATCH');const bytes=await readFile(join(engine,...file.path.split('/')));if(bytes.length!==file.size||hash(bytes)!==file.sha256)throw new Error('PAYLOAD_HASH_MISMATCH');}
const receipt={created_at:new Date().toISOString(),operation:'native-smoke-preparation-only',xpi,xpi_sha256:hash(await readFile(xpi)),engine,engine_manifest_sha256:hash(await readFile(join(engine,'engine-manifest.json'))),payload_files:files.length,test_profile:profile,test_data:data,launch_requires:'Explicit profile + explicit -datadir; permitted personal helper lacks these startup arguments',native_acceptance:'NOT_VERIFIED',checks:['Confirm actual profile and data paths before fixture writes','Install this exact XPI only into authorized isolated test profile','Open Tools > Evidra; inspect local iframe CSP and denial of parent/Zotero access','Choose engine-manifest.json; verify fingerprint and explicit start consent','Create a synthetic notebook; close/reopen workspace and restart owned engine','Open reader section and second main window; close one window while engine remains owned','Verify keyboard Tab/Escape/focus restoration, both locales, 200% zoom and light/dark themes','Disable/uninstall: menus, sections, windows, listeners, heartbeat and owned child are removed','Inspect native errors for paths/secrets and save screenshots only from this actual native run']};
await mkdir('.local/task-2',{recursive:true});await writeFile('.local/task-2/native-smoke-preparation.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt,null,2));
