import * as vscode from 'vscode';

// create the webview of the "Side panel"
export function getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri, nonce: string, filePath: string): string {
  const esc = filePath.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
  <style>
    /* Use VS Code theme variables when available */
    :root {
      --bg: var(--vscode-editor-background, #ffffff);
      --fg: var(--vscode-editor-foreground, #000000);
      --input-bg: var(--vscode-input-background, #f3f3f3);
      --input-fg: var(--vscode-input-foreground, #000000);
      --input-border: var(--vscode-input-border, #cccccc);
      --widget-bg: var(--vscode-editor-widget-background, #f3f3f3);
      --widget-border: var(--vscode-editorWidget-border, #dddddd);
      --button-bg: var(--vscode-button-background, #007acc);
      --button-fg: var(--vscode-button-foreground, #ffffff);
      --button-hover-bg: var(--vscode-button-hoverBackground, #005a9e);
      --accent: var(--vscode-focusBorder, #007acc);
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: var(--bg);
      color: var(--fg);
      font-family: var(--vscode-editor-font-family, sans-serif);
      box-sizing: border-box;
    }
    body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    h2 {
      margin: 0 0 8px 0;
      font-size: 1.25rem;
      font-weight: 500;
    }
    #filePath {
      font-style: italic;
      color: var(--vscode-descriptionForeground, gray);
      margin-bottom: 12px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    label {
      font-weight: bold;
    }
    textarea {
      width: 95%;
      min-height: 80px;
      resize: vertical;
      padding: 8px;
      font-family: var(--vscode-editor-font-family, monospace);
      background-color: var(--input-bg);
      color: var(--input-fg);
      border: 1px solid var(--input-border);
      border-radius: 4px;
    }
    button {
      align-self: flex-start;
      padding: 8px 16px;
      font-size: 1rem;
      font-family: var(--vscode-editor-font-family, sans-serif);
      background-color: var(--button-bg);
      color: var(--button-fg);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    button:hover {
      background-color: var(--button-hover-bg);
    }
    button:focus {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    #output {
      /* Use the editor background and foreground for better contrast */
      background-color: var(--vscode-editor-background, #1e1e1e);
      color: var(--vscode-editor-foreground, #d4d4d4);
      border: 1px solid var(--vscode-editorWidget-border, #3c3c3c);
      border-radius: 4px;
      padding: 8px;
      white-space: pre-wrap;
      max-height: 200px;
      overflow-y: auto;
      font-family: var(--vscode-editor-font-family, monospace);
    }
    /* Responsive adjustments */
    @media (max-width: 600px) {
      body {
        padding: 8px;
        gap: 12px;
      }
      button {
        width: 100%;
        text-align: center;
      }
    }
  </style>
  <title>Polycheck Runner</title>
</head>
<body>
  <h2>Run Polycheck</h2>
  <div id="filePath">File: ${esc}</div>
  <div class="field">
    <label for="preText">Pre-condition:</label>
    <textarea id="preText" rows="4" placeholder="Enter pre-condition"></textarea>
  </div>
  <div class="field">
    <label for="postText">Post-condition:</label>
    <textarea id="postText" rows="4" placeholder="Enter post-condition"></textarea>
  </div>
  <button id="runBtn">Run</button>
  <pre id="output"></pre>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    console.log('Webview script loaded');
    const btn = document.getElementById('runBtn');
    if (!btn) console.error('runBtn not found');
    else btn.addEventListener('click', () => {
      console.log('Run clicked');
      const pre = document.getElementById('preText')?.value || '';
      const post = document.getElementById('postText')?.value || '';
      vscode.postMessage({ command: 'runPolycheck', pre, post });
      document.getElementById('output').textContent = 'Running...';
    });
    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'result') document.getElementById('output').textContent = msg.output;
    });
  </script>
</body>
</html>`;
}


export function getNonce() {
  return Array.from({ length: 32 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 62))).join('');
}
