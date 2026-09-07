# Native Windows onedir only. Models are never build inputs.
from pathlib import Path
from PyInstaller.utils.hooks import collect_data_files, collect_submodules, copy_metadata

root = Path(SPECPATH).parent
datas = [(str(root / 'services/engine/src/evidra/storage/migrations'), 'evidra/storage/migrations')]
datas += collect_data_files('pypdfium2') + collect_data_files('pypdfium2_raw')
datas += copy_metadata('mcp', recursive=True)
hidden = ['win32timezone', 'keyring.backends.Windows'] + collect_submodules('mcp')
a = Analysis([str(root / 'scripts/engine-launcher.py')],
    pathex=[str(root / 'services/engine/src')],
    binaries=[], datas=datas, hiddenimports=hidden, hookspath=[], hooksconfig={},
    runtime_hooks=[], excludes=[], noarchive=False, optimize=0)
pyz = PYZ(a.pure)
exe = EXE(pyz, a.scripts, [], exclude_binaries=True, name='evidra-engine',
    debug=False, bootloader_ignore_signals=False, strip=False, upx=False,
    console=True, disable_windowed_traceback=False)
coll = COLLECT(exe, a.binaries, a.datas, strip=False, upx=False, name='evidra-engine')
