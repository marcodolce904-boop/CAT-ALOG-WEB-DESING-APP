# Installare CAT-ALOG (Windows)

> Versione **1.1.0 BETA**, di prova e sperimentale.

## Per chi usa l'app: un solo file

1. Scarica **`CAT-ALOG-Setup-1.1.0.exe`**. È l'unico file che serve: dentro c'è già tutto (programma, motore, estensione per VS Code, connettore per Claude). **Non serve installare Node.js né altro.**
2. Fai doppio clic sul file.
3. Se Windows mostra **«PC protetto»**: clicca **Ulteriori informazioni → Esegui comunque**. Succede perché l'installer non ha una firma digitale a pagamento.
4. Segui le schermate (in italiano):
   - leggi e **accetta** le informazioni sulla versione beta;
   - scegli **per chi** installare (solo per te va benissimo) e la **cartella** (puoi lasciare quella proposta);
   - clicca **Installa**, poi **Fine**: l'app si apre da sola.
5. Trovi **CAT-ALOG** sul **Desktop** e nel **menu Start**, con l'icona del gatto.
6. Alla prima apertura c'è una breve **guida di benvenuto**. Da lì (o in seguito da **Impostazioni → Integrazioni**) puoi, con un clic:
   - **Collegare Claude Desktop** (poi chiudi Claude del tutto e riaprilo: compare lo strumento «cat-alog»);
   - **Installare l'estensione per VS Code** (serve VS Code già installato; poi riavvia VS Code).

### I tuoi dati

- Stanno in `Documenti\Catalogo MD`. **Non vengono toccati** da aggiornamenti, reinstallazioni o disinstallazione.
- Fai ogni tanto un backup: **Impostazioni → Crea backup ZIP…**.

### Aggiornare

Installa il nuovo `CAT-ALOG-Setup-<versione>.exe` sopra quello vecchio: i dati restano.

### Disinstallare

**Impostazioni di Windows → App → App installate → CAT-ALOG (BETA) → Disinstalla.** I dati in `Documenti\Catalogo MD` restano: se vuoi, cancellali a mano.

### Se qualcosa non va

| Problema | Cosa fare |
|---|---|
| «PC protetto» | Ulteriori informazioni → Esegui comunque |
| L'app non si apre | Riavvia il PC e riprova; se continua, reinstalla sopra (i dati restano) |
| Claude non vede «cat-alog» | Chiudi Claude Desktop **del tutto** (icona vicino all'orologio → Esci) e riaprilo |
| «Non trovo VS Code» | Installa VS Code da https://code.visualstudio.com, poi ripremi il pulsante |

---

## Per chi sviluppa: creare l'installer

Serve **Node.js** (LTS) solo su questo PC, non su quello di chi installa.

1. Doppio clic su **`CREA-INSTALLER.bat`** (installa i componenti, esegue i test, prepara l'estensione VS Code e crea l'installer).
2. Il risultato è **un solo file**: `dist\CAT-ALOG-Setup-<versione>.exe`.
3. Per una nuova versione cambia `version` in `package.json` e rilancia.

Comandi equivalenti: `npm install`, `npm test`, `npm run dist:win`. Per provare senza installare: `AVVIA.bat` (oppure `npm start`).
