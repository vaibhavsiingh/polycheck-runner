import * as vscode from 'vscode';
import * as path from 'path';
import { getNonce, getWebviewHtml } from '../webview/content';
import { runPolycheckWorkflow } from '../workflow/polycheck';

// register the command to open the extensionw
export function registerOpenPolycheckCommand(context: vscode.ExtensionContext): vscode.Disposable{
    return vscode.commands.registerCommand('project1.openPolycheckPanel', (resource: vscode.Uri) => {
        if (!resource || !resource.fsPath) {
        vscode.window.showErrorMessage('No file selected.');
        return;
        }
        const filePath = resource.fsPath;

        // Create the webview panel beside the active editor
        const panel = vscode.window.createWebviewPanel(
        'polycheckPanel',                // internal identifier
        `Polycheck: ${path.basename(filePath)}`, // title including filename
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, 'media'))
            ]
        }
        );

        console.log('DEBUG: Webview panel created');
        const nonce = getNonce();
        panel.webview.html = getWebviewHtml(panel.webview, context.extensionUri, nonce, filePath);
        console.log('DEBUG: Webview HTML set');

        // Executed after "Run" is clicked
        panel.webview.onDidReceiveMessage(
        message => {
            if (message.command === 'runPolycheck') {
            console.log('DEBUG: Received runPolycheck message');
            runPolycheckWorkflow(context, panel, filePath, message.pre, message.post);
            }
        },
        undefined,
        context.subscriptions
        );
    });
}