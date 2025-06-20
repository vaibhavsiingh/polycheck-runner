import * as vscode from 'vscode';

// create the webview of the "Side panel"
export function getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri, nonce: string, filePath: string, fileContent: string ): string {
  const esc = filePath.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
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
      --button-disabled-bg: rgba(0, 122, 204, 0.4);
      --button-disabled-fg: rgba(255, 255, 255, 0.4);
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
    button:disabled {
      background-color: var(--button-disabled-bg);
      color: var(--button-disabled-fg);
      cursor: not-allowed;
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
<script>
  const fileText = ${JSON.stringify(fileContent)};
  const vscode = acquireVsCodeApi();
  const output = document.getElementById('output');
  const runBtn = document.getElementById('runBtn');
  const preTA = document.getElementById('preText');
  const postTA = document.getElementById('postText');

  let parseTimer;
  console.log("DEBUG: Reached Script");

  async function doParse() {
    console.log("DEBUG: Called doParse");
    runBtn.disabled = true;
    output.textContent = 'Parsing…';
    vscode.postMessage({
      command: 'parseRequest',
      data: {
        program: fileText,
        precond: preTA.value,
        postcond: postTA.value
      }
    });
  }


  function scheduleParse() {
    clearTimeout(parseTimer);
    parseTimer = setTimeout(doParse, 300);
  }

  // 1) parse on load
  window.addEventListener('load', doParse);

  // 2) live parse on edits
  preTA.addEventListener('input', scheduleParse);
  postTA.addEventListener('input', scheduleParse);

  // 3) run verification
  runBtn.addEventListener('click', async () => {
    runBtn.disabled = true;
    output.textContent = 'Verifying…';
    const endpoint = 'http://localhost:3000/api/solver/Mona/verify';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program: fileText,
          precond: preTA.value,
          postcond: postTA.value
        })
      });

      const result = await res.json();

      if (result.answer && result.solverUsed) {
        output.textContent =
          "Solver: " + result.solverUsed + "<br><br>Result:<br>" + result.answer;
      } else {
        output.textContent = 'Unexpected response:<br>' + JSON.stringify(result, null, 2);
      }

    } catch (e) {
      output.textContent = 'Verification failed: ' + e.message;
    } finally {
      runBtn.disabled = false;
    }
  });

  window.addEventListener('message', (event) => {
    const msg = event.data;
    console.log("DEBUG: Received return message");
    if (msg.type === 'parseResult') {
      console.log("DEBUG: Received return message of correct type");
      const result = msg.result;
      if (msg.error) {
        output.textContent = 'Parse failed: ' + msg.error;
      } else {
        const msgs = [];
        if (result.parseErrProg) msgs.push('Program Error: ' + result.parseErrProg);
        if (result.parseErrPre) msgs.push('Precondition Error: ' + result.parseErrPre);
        if (result.parseErrPost) msgs.push('Postcondition Error: ' + result.parseErrPost);

        output.textContent = msgs.length > 0 ? msgs.join('\\n') : '✓ No parse errors';
        runBtn.disabled = msgs.length > 0;
        console.log("DEBUG: msgs:", msgs, msgs.length);
      }
    }
  });

</script>

</body>
</html>`;
}


export function getNonce() {
  return Array.from({ length: 32 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 62))).join('');
}
