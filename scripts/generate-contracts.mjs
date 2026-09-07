import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import openapiTS, { astToString } from 'openapi-typescript';
import Ajv2020 from 'ajv/dist/2020.js';
import standaloneCode from 'ajv/dist/standalone/index.js';
import { build } from 'esbuild';
execFileSync('uv', ['run', '--project', 'services/engine', '--no-sync', 'python', 'scripts/export-contracts.py'], {stdio:'inherit'});
const schema=JSON.parse(await readFile('packages/contracts/generated/openapi.json','utf8'));
await writeFile('packages/contracts/generated/api.ts',astToString(await openapiTS(schema)));
const manifest=JSON.parse(await readFile('packages/contracts/generated/engine-manifest.schema.json','utf8'));
const ajv=new Ajv2020({code:{source:true,esm:true},allErrors:false});
const compiled=await build({stdin:{contents:standaloneCode(ajv,ajv.compile(manifest)),resolveDir:process.cwd(),sourcefile:'validate-manifest.generated.js'},bundle:true,write:false,format:'esm',platform:'browser',target:['firefox140'],legalComments:'eof'});
await writeFile('packages/contracts/generated/validate-manifest.js',compiled.outputFiles[0].text);
await writeFile('packages/contracts/generated/validate-manifest.d.ts',`import type { components } from './api';\nexport default function validate(value:unknown):value is components['schemas']['EngineManifest'];\n`);
const selection=JSON.parse(await readFile('packages/contracts/generated/selection.schema.json','utf8'));
const selectionCompiled=await build({stdin:{contents:standaloneCode(ajv,ajv.compile(selection)),resolveDir:process.cwd(),sourcefile:'validate-selection.generated.js'},bundle:true,write:false,format:'esm',platform:'browser',target:['firefox140'],legalComments:'eof'});
await writeFile('packages/contracts/generated/validate-selection.js',selectionCompiled.outputFiles[0].text);
await writeFile('packages/contracts/generated/validate-selection.d.ts',`import type { components } from './api';\nexport default function validate(value:unknown):value is components['schemas']['SelectionSpec'];\n`);
const documents=JSON.parse(await readFile('packages/contracts/generated/document-command.schema.json','utf8'));
const documentAjv=new Ajv2020({code:{source:true,esm:true},allErrors:false});
// Pydantic's discriminator mapping is an annotation; the complete oneOf validates every command.
documentAjv.addKeyword('discriminator');
const documentCompiled=await build({stdin:{contents:standaloneCode(documentAjv,documentAjv.compile(documents)),resolveDir:process.cwd(),sourcefile:'validate-document-command.generated.js'},bundle:true,write:false,format:'esm',platform:'browser',target:['firefox140'],legalComments:'eof'});
await writeFile('packages/contracts/generated/validate-document-command.js',documentCompiled.outputFiles[0].text);
await writeFile('packages/contracts/generated/validate-document-command.d.ts',`import type { components } from './api';\nexport default function validate(value:unknown):value is components['schemas']['DocumentCommand'];\n`);
for (const name of ['conversation', 'provider', 'matrix', 'job', 'research', 'mcp', 'export']) {
    const commands = JSON.parse(await readFile(`packages/contracts/generated/${name}-command.schema.json`, 'utf8'));
    const validator = new Ajv2020({code:{source:true,esm:true},allErrors:false});
    validator.addKeyword('discriminator');
    validator.addFormat('date', /^\d{4}-\d{2}-\d{2}$/);
    validator.addFormat('password', true); // OpenAPI annotation; SecretWrite bounds validate the value.
    const compiled = await build({stdin:{contents:standaloneCode(validator,validator.compile(commands)),resolveDir:process.cwd(),sourcefile:`validate-${name}-command.generated.js`},bundle:true,write:false,format:'esm',platform:'browser',target:['firefox140'],legalComments:'eof'});
    await writeFile(`packages/contracts/generated/validate-${name}-command.js`,compiled.outputFiles[0].text);
    await writeFile(`packages/contracts/generated/validate-${name}-command.d.ts`,`import type { components } from './api';\nexport default function validate(value:unknown):value is components['schemas']['${name[0].toUpperCase()+name.slice(1)}Command'];\n`);
}
console.log('Generated OpenAPI and TypeScript from Pydantic (no service startup).');
