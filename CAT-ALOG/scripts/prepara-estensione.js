'use strict';

/*
 * Prepara l'estensione di VS Code da mettere nell'installer:
 * copia la logica dell'app (lib/) dentro vscode-extension/lib e crea build/cat-alog.vsix.
 * Così l'estensione funziona anche sul PC di chi ha solo l'app installata.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const ext = path.join(root, 'vscode-extension');
const dest = path.join(ext, 'lib');

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(path.join(root, 'lib'), dest, { recursive: true });

const vsce = path.join(root, 'node_modules', '@vscode', 'vsce', 'vsce');
const out = path.join(root, 'build', 'cat-alog.vsix');
execFileSync(process.execPath, [vsce, 'package', '--allow-missing-repository', '--skip-license', '-o', out], { cwd: ext, stdio: 'inherit' });
console.log('Estensione pronta: ' + out);
