import * as vscode from 'vscode';
import * as path from 'path';
import { getNonce, getWebviewHtml } from '../webview/content';
import { runPolycheckWorkflow } from '../workflow/polycheck';

// register the command to open the extensionw
export function registerOpenPolycheckCommand(context: vscode.ExtensionContext): vscode.Disposable{
    return vscode.commands.registerCommand('polycheck-runner.openPolycheckPanel', async (resource: vscode.Uri) => {
        if (!resource || !resource.fsPath) {
        vscode.window.showErrorMessage('No file selected.');
        return;
        }
        const filePath = resource.fsPath;

        let fileContent = '';
        try {
        const doc = await vscode.workspace.openTextDocument(resource);
        fileContent = doc.getText().replace(/\r/g, '');
        } catch (err) {
        vscode.window.showErrorMessage('Failed to read file content: ' + (err as Error).message);
        return;
        }

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
        panel.webview.html = getWebviewHtml(
            panel.webview,
            context.extensionUri,
            nonce,
            filePath,
            fileContent
        );
        console.log('DEBUG: Webview HTML set');

        // Executed after "Run" is clicked
        // panel.webview.onDidReceiveMessage(
        // message => {
        //     if (message.command === 'runPolycheck') {
        //     console.log('DEBUG: Received runPolycheck message');
        //     runPolycheckWorkflow(context, panel, filePath, message.pre, message.post);
        //     }
        // },
        // undefined,
        // context.subscriptions
        // );

        panel.webview.onDidReceiveMessage(
            async (message) => {
                console.log("DEBUG: BACKEND RECEIVED MESSAGE");
                if (message.command === 'parseRequest') {
                    try {
                        const res = await fetch('http://localhost:3000/api/parse', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(message.data)
                        });
                        const result = await res.json();
                        console.log("DEBUG: result of parse in backend:", result);
                        panel.webview.postMessage({ type: 'parseResult', result });
                    } catch (err) {
                        console.log("DEBUG: err of parse request in backend:", err);
                        const errorMessage = (err instanceof Error) ? err.message : String(err);
                        panel.webview.postMessage({ type: 'parseResult', error: errorMessage });
                    }
                }
            },
            undefined,
            context.subscriptions
        );

    });
}