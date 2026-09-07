var EvidraRuntime;
var evidraLifecycle;
var evidraChrome;
function install() {}
async function startup({ rootURI }) {
  Components.utils.importGlobalProperties(['AbortController']);
  const Ci = Components.interfaces;
  const startupService = Components.classes['@mozilla.org/addons/addon-manager-startup;1'].getService(Ci.amIAddonManagerStartup);
  try {
    evidraChrome = startupService.registerChrome(Services.io.newURI(rootURI + 'manifest.json'), [['content', 'evidra', 'content/', 'contentaccessible=yes']]);
    Services.scriptloader.loadSubScript(rootURI + 'content/native.js', this);
    const plainText = html => Components.classes['@mozilla.org/parserutils;1'].getService(Ci.nsIParserUtils)
      .convertToPlainText(html, Ci.nsIDocumentEncoder.OutputRaw, 0);
    evidraLifecycle = new EvidraRuntime.Lifecycle({ Zotero, Services, IOUtils, PathUtils, ChromeUtils, Ci, crypto, fetch, setTimeout, clearTimeout, setInterval, clearInterval, plainText });
    await evidraLifecycle.startup();
  } catch (error) {
    evidraChrome?.destruct();
    evidraChrome = undefined;
    if (EvidraRuntime) EvidraRuntime.reportNativeError({ Zotero }, error);
    throw new Error('EVIDRA_STARTUP_FAILED');
  }
}
function onMainWindowLoad({ window }) { evidraLifecycle?.addWindow(window); }
function onMainWindowUnload({ window }) { evidraLifecycle?.removeWindow(window); }
async function shutdown() { try { await evidraLifecycle?.shutdown(); } finally { evidraChrome?.destruct(); evidraChrome = undefined; evidraLifecycle = undefined; EvidraRuntime = undefined; } }
async function uninstall() { await shutdown(); }
