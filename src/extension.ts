import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getInjectedScript } from './script';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'code-glow.enableGlow',
    async () => {
      const appDir = path.dirname(vscode.env.appRoot);
      const base = path.join(appDir, 'app', 'out', 'vs', 'code');
      const electronBase = 'electron-sandbox';
      const htmlFile = path.join(
        base,
        electronBase,
        'workbench',
        'workbench.html',
      );
      const templateFile = path.join(
        base,
        electronBase,
        'workbench',
        'glow.js',
      );

      // 创建注入脚本
      const scriptContent = getInjectedScript();

      // 写入脚本文件
      fs.writeFileSync(templateFile, scriptContent);

      // 修改 workbench.html
      const html = fs.readFileSync(htmlFile, 'utf-8');
      if (!html.includes('glow.js')) {
        const output = html.replace(
          '</html>',
          `<script src="glow.js"></script></html>`,
        );
        fs.writeFileSync(htmlFile, output, 'utf-8');
      }

      vscode.window.showInformationMessage(
        'Glow effect enabled. Please reload VS Code.',
      );
      vscode.commands.executeCommand('workbench.action.reloadWindow');
    },
  );

  context.subscriptions.push(disposable);
}
