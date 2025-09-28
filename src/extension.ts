import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as HTMLParser from 'node-html-parser';
import { getInjectedScript } from './script';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'code-glow.enableGlow',
    async () => {
      const appDir = path.dirname(vscode.env.appRoot);
      const base = path.join(appDir, 'app', 'out', 'vs', 'code');

      const electronSandboxExists = fs.existsSync(
        path.join(base, 'electron-sandbox'),
      );

      /**
       * Determine whether to use `electron-sandbox` or `electron-browser`
       * based on the existence of the `electron-sandbox` directory.
       * This ensures compatibility with different VSCode versions.
       * The VSCode's source code organization has changed since 2025 Jun 7.
       * https://github.com/microsoft/vscode/wiki/Source-Code-Organization/_compare/2a134087edd2fe82b7e051cb7ed97082c7c7a2ca
       */
      const electronBase = electronSandboxExists
        ? 'electron-sandbox'
        : 'electron-browser';

      const htmlFile = path.join(
        base,
        electronBase,
        'workbench',
        'workbench.html',
      );

      // write `code-glow.js`
      const jsFile = path.join(base, electronBase, 'workbench', 'code-glow.js');
      const scriptContent = getInjectedScript();
      fs.writeFileSync(jsFile, scriptContent);

      // modify `workbench.html`
      const html = fs.readFileSync(htmlFile, 'utf-8');
      const root = HTMLParser.parse(html);
      const head = root.querySelector('head');
      const scriptElement = root.querySelector('script[src="code-glow.js"]');

      if (scriptElement) {
        scriptElement.remove();
      }

      if (head) {
        head.appendChild(
          HTMLParser.parse(`<script src="code-glow.js"></script>`).firstChild!,
        );
        fs.writeFileSync(htmlFile, root.toString(), 'utf-8');
        vscode.window
          .showInformationMessage('Glow effect enabled.', {
            title: 'Restart editor to complete',
          })
          .then(() => {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
          });
      } else {
        vscode.window.showInformationMessage('Glow effect enable failed!', {
          title: 'cannot find <head> tag in workbench.html!',
        });
      }
    },
  );

  const disableDisposable = vscode.commands.registerCommand(
    'code-glow.disableGlow',
    async () => {
      const appDir = path.dirname(vscode.env.appRoot);
      const base = path.join(appDir, 'app', 'out', 'vs', 'code');

      const electronSandboxExists = fs.existsSync(
        path.join(base, 'electron-sandbox'),
      );

      /**
       * Determine whether to use `electron-sandbox` or `electron-browser`
       * based on the existence of the `electron-sandbox` directory.
       * This ensures compatibility with different VSCode versions.
       * The VSCode's source code organization has changed since 2025 Jun 7.
       * https://github.com/microsoft/vscode/wiki/Source-Code-Organization/_compare/2a134087edd2fe82b7e051cb7ed97082c7c7a2ca
       */
      const electronBase = electronSandboxExists
        ? 'electron-sandbox'
        : 'electron-browser';

      const htmlFile = path.join(
        base,
        electronBase,
        'workbench',
        'workbench.html',
      );
      const jsFile = path.join(base, electronBase, 'workbench', 'code-glow.js');

      // remove `code-glow.js`
      if (fs.existsSync(jsFile)) {
        fs.unlinkSync(jsFile);
      }

      // modify `workbench.html`
      const html = fs.readFileSync(htmlFile, 'utf-8');
      const root = HTMLParser.parse(html);
      const scriptElement = root.querySelector('script[src="code-glow.js"]');

      if (scriptElement) {
        scriptElement.remove();
        fs.writeFileSync(htmlFile, root.toString(), 'utf-8');
      }

      vscode.window
        .showInformationMessage('Glow effect disabled.', {
          title: 'Restart editor to activate',
        })
        .then(() => {
          vscode.commands.executeCommand('workbench.action.reloadWindow');
        });
    },
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(disableDisposable);
}
