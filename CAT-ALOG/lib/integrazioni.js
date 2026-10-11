'use strict';

/*
 * Integrazioni dell'app installata, senza bisogno di Node.js sul PC:
 * - Claude Desktop: il connettore gira con lo stesso CAT-ALOG.exe in modalità Node (ELECTRON_RUN_AS_NODE=1);
 * - VS Code: l'estensione (file .vsix compreso nell'installer) si installa con il comando «code».
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const desktop = require('../mcp/installa-desktop');

/* Collega il connettore a Claude Desktop. execPath = l'eseguibile dell'app, serverJs = mcp/server.js (anche dentro app.asar). */
function collegaClaudeDesktop(o) {
  const r = desktop.install({
    serverJs: o.serverJs,
    nodePath: o.execPath,
    serverEnv: { ELECTRON_RUN_AS_NODE: '1' },
    forza: !!o.forza,
    platform: o.platform,
    env: o.env,
    home: o.home,
    config: o.config
  });
  return r.map(function (x) {
    return { file: x.file, creato: x.creato, copia: x.copia, riparato: x.riparato, ripartito: x.ripartito };
  });
}

/* Dove può essere il comando di VS Code. */
function codeCandidates(o) {
  const opts = o || {};
  const platform = opts.platform || process.platform;
  const env = opts.env || process.env;
  const out = [];
  const pathDirs = String(env.PATH || env.Path || '').split(platform === 'win32' ? ';' : ':').filter(Boolean);
  const nomi = platform === 'win32' ? ['code.cmd', 'code-insiders.cmd'] : ['code', 'code-insiders'];
  pathDirs.forEach(function (d) { nomi.forEach(function (n) { out.push(path.join(d, n)); }); });
  if (platform === 'win32') {
    const local = env.LOCALAPPDATA || '';
    const pf = env.ProgramFiles || 'C:\\Program Files';
    if (local) out.push(path.join(local, 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd'));
    out.push(path.join(pf, 'Microsoft VS Code', 'bin', 'code.cmd'));
    if (local) out.push(path.join(local, 'Programs', 'Microsoft VS Code Insiders', 'bin', 'code-insiders.cmd'));
  } else if (platform === 'darwin') {
    out.push('/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code');
    out.push('/usr/local/bin/code');
  } else {
    out.push('/usr/bin/code', '/snap/bin/code');
  }
  return out;
}

function findCode(o) {
  const exists = (o && o.exists) || function (p) { try { return fs.statSync(p).isFile(); } catch (e) { return false; } };
  return codeCandidates(o).find(exists) || null;
}

/* Installa il .vsix in VS Code. Ritorna una promessa con { ok, messaggio }. */
function installaVsix(o) {
  const vsix = o.vsix;
  const code = o.code || findCode(o);
  if (!vsix || !fs.existsSync(vsix)) return Promise.resolve({ ok: false, messaggio: 'Il pacchetto dell\'estensione non c\'è in questa installazione.' });
  if (!code) return Promise.resolve({ ok: false, messaggio: 'Non trovo VS Code. Installalo da https://code.visualstudio.com e riprova.' });
  const win32 = (o.platform || process.platform) === 'win32';
  const q = function (x) { return win32 ? '"' + x + '"' : x; };
  const run = o.spawn || spawn;
  return new Promise(function (resolve) {
    let out = '';
    let fatto = false;
    const fine = function (r) { if (!fatto) { fatto = true; resolve(r); } };
    let child;
    try {
      child = run(q(code), ['--install-extension', q(vsix), '--force'], { shell: win32, windowsHide: true });
    } catch (e) {
      return fine({ ok: false, messaggio: 'Non riesco ad avviare VS Code: ' + e.message });
    }
    if (child.stdout) child.stdout.on('data', function (d) { out += d; });
    if (child.stderr) child.stderr.on('data', function (d) { out += d; });
    child.on('error', function (e) { fine({ ok: false, messaggio: 'Non riesco ad avviare VS Code: ' + e.message }); });
    child.on('close', function (c) {
      fine(c === 0
        ? { ok: true, messaggio: 'Estensione installata. Riavvia VS Code: a sinistra compare l\'icona del gatto.' }
        : { ok: false, messaggio: 'VS Code ha risposto con un errore: ' + out.trim().slice(-300) });
    });
  });
}

module.exports = { collegaClaudeDesktop, codeCandidates, findCode, installaVsix };
