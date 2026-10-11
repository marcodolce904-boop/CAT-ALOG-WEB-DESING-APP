'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { EventEmitter } = require('events');
const I = require('../lib/integrazioni');

const tmp = () => fs.mkdtempSync(path.join(process.env.TEST_TMPDIR || os.tmpdir(), 'catalogo-int-'));

test('integrazioni: Claude Desktop usa l\'eseguibile dell\'app in modalità Node (non serve Node.js)', () => {
  const dir = tmp();
  const cfg = path.join(dir, 'claude_desktop_config.json');
  fs.writeFileSync(cfg, JSON.stringify({ mcpServers: { altro: { command: 'x' } } }));
  const server = path.join(__dirname, '..', 'mcp', 'server.js');
  const r = I.collegaClaudeDesktop({ execPath: 'C:\\Users\\me\\AppData\\Local\\Programs\\CAT-ALOG\\CAT-ALOG.exe', serverJs: server, config: cfg });
  assert.equal(r.length, 1);
  const j = JSON.parse(fs.readFileSync(cfg, 'utf8'));
  assert.deepEqual(j.mcpServers['cat-alog'], { command: 'C:\\Users\\me\\AppData\\Local\\Programs\\CAT-ALOG\\CAT-ALOG.exe', args: [server], env: { ELECTRON_RUN_AS_NODE: '1' } });
  assert.ok(j.mcpServers.altro, 'gli altri server restano');
  fs.writeFileSync(cfg, '{ rotto');
  assert.throws(() => I.collegaClaudeDesktop({ execPath: 'x', serverJs: server, config: cfg }), (e) => e.irreparabile === true);
  I.collegaClaudeDesktop({ execPath: 'x', serverJs: server, config: cfg, forza: true });
  assert.ok(JSON.parse(fs.readFileSync(cfg, 'utf8')).mcpServers['cat-alog']);
});

test('integrazioni: trova VS Code e installa il pacchetto, con messaggi chiari', async () => {
  const env = { PATH: 'C:\\a;C:\\b', LOCALAPPDATA: 'C:\\L', ProgramFiles: 'C:\\PF' };
  const c = I.codeCandidates({ platform: 'win32', env });
  assert.ok(c.includes(path.join('C:\\b', 'code.cmd')));
  assert.ok(c.includes(path.join('C:\\L', 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd')));
  const solo = path.join('C:\\L', 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd');
  assert.equal(I.findCode({ platform: 'win32', env, exists: (p) => p === solo }), solo);
  assert.equal(I.findCode({ platform: 'win32', env, exists: () => false }), null);

  const dir = tmp();
  const vsix = path.join(dir, 'cat-alog.vsix');
  fs.writeFileSync(vsix, 'x');
  assert.match((await I.installaVsix({ vsix: path.join(dir, 'manca.vsix'), code: 'code' })).messaggio, /non c'è/);
  assert.match((await I.installaVsix({ vsix, exists: () => false, env: { PATH: '' }, platform: 'win32' })).messaggio, /Non trovo VS Code/);

  const calls = [];
  const fakeSpawn = (exitCode) => (cmd, args, opts) => {
    calls.push({ cmd, args, opts });
    const ch = new EventEmitter();
    ch.stdout = new EventEmitter();
    ch.stderr = new EventEmitter();
    setImmediate(() => { ch.stderr.emit('data', 'errore finto'); ch.emit('close', exitCode); });
    return ch;
  };
  const ok = await I.installaVsix({ vsix, code: 'C:\\VS Code\\bin\\code.cmd', platform: 'win32', spawn: fakeSpawn(0) });
  assert.equal(ok.ok, true);
  assert.deepEqual(calls[0].args, ['--install-extension', '"' + vsix + '"', '--force']);
  assert.equal(calls[0].cmd, '"C:\\VS Code\\bin\\code.cmd"', 'percorso con spazi tra virgolette');
  assert.equal(calls[0].opts.shell, true);
  const ko = await I.installaVsix({ vsix, code: 'code', platform: 'linux', spawn: fakeSpawn(1) });
  assert.equal(ko.ok, false);
  assert.match(ko.messaggio, /errore finto/);
});

test('installer: configurazione Windows completa (un solo file, italiano, collegamenti, licenza, estensione inclusa)', () => {
  const pkg = require('../package.json');
  const b = pkg.build;
  assert.equal(b.win.target[0].target, 'nsis');
  assert.equal(b.nsis.oneClick, false);
  assert.equal(b.nsis.createDesktopShortcut, 'always');
  assert.equal(b.nsis.createStartMenuShortcut, true);
  assert.deepEqual(b.nsis.installerLanguages, ['it_IT']);
  assert.ok(fs.existsSync(path.join(__dirname, '..', b.nsis.license)), 'file di licenza');
  assert.ok(b.files.includes('mcp/server.js'), 'connettore dentro l\'app');
  assert.deepEqual(b.extraResources, [{ from: 'build/cat-alog.vsix', to: 'cat-alog.vsix' }]);
  assert.ok(pkg.dependencies['@modelcontextprotocol/sdk'] && pkg.dependencies.zod, 'dipendenze del connettore incluse');
  assert.match(pkg.scripts['dist:win'], /prepara-estensione/);
  assert.equal(b.publish, null);
});
