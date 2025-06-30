import * as vscode from 'vscode';

// create the webview of the "Side panel"
export function getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri, nonce: string, filePath: string, fileContent: string ): string {
  const esc = filePath.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
       :root {
      --bg: var(--vscode-editor-background, #ffffff);
      --fg: #000000;
      --input-bg: var(--vscode-input-background, #f3f3f3);
      --input-fg: #000000;
      --input-border: var(--vscode-input-border, #cccccc);
      --widget-bg: var(--vscode-editor-widget-background, #f3f3f3);
      --widget-border: var(--vscode-editorWidget-border, #dddddd);
      --button-bg: var(--vscode-button-background, #007acc);
      --button-fg: #ffffff;
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
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      border-bottom: 1px solid var(--widget-border);
      padding-bottom: 4px;
    }
    #filePath {
      font-style: italic;
      color: var(--vscode-descriptionForeground, gray);
      margin-top: -8px;
      margin-bottom: 12px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    label {
      font-weight: bold;
      font-size: 0.9rem;
    }
    textarea {
      width: 100%;
      min-height: 80px;
      resize: vertical;
      padding: 8px;
      font-family: var(--vscode-editor-font-family, monospace);
      background-color: var(--input-bg);
      color: whitesmoke
      border: 1px solid var(--input-border);
      border-radius: 4px;
    }
    button {
      align-self: flex-start;
      padding: 8px 16px;
      font-size: 1rem;
      background-color: var(--button-bg);
      color: #ffffff;
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
      background-color: var(--vscode-editor-background, #1e1e1e);
      
      border: 1px solid var(--vscode-editorWidget-border, #3c3c3c);
      border-radius: 4px;
      padding: 8px;
      white-space: pre-wrap;
      max-height: 120px;
      overflow-y: auto;
      font-family: var(--vscode-editor-font-family, monospace);
    }
    #allResults {
      background-color: var(--widget-bg);
      border: 1px solid var(--widget-border);
      border-radius: 4px;
      padding: 12px;
    }
    #allResults h3 {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      font-weight: 500;
    }
    #solverResults {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }
    .solver-item {
      background-color: var(--bg);
      border: 1px solid var(--input-border);
      border-radius: 4px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .solver-item strong {
      font-size: 0.9rem;
    }
    .solver-item {
      background-color: var(--bg);
      border: 1px solid var(--input-border);
      border-radius: 4px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: background-color 0.2s ease;
    }

    .solver-item.success {
      background-color: rgb(132, 244, 87);
      color: #1f4200;
    }

    /* Error = red background, white text */
    .solver-item.error {
      background-color: rgb(222, 82, 82);
      color: #ffffff;
    }

    /* Neutral = pale yellow background, dark-brown text */
    .solver-item.neutral {
      background-color: rgb(246, 237, 192);
      color: #5a4a00;
    }

    .solver-item pre {
      margin: 0;
      background: none;
      border: none;
      padding: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    @media (max-width: 600px) {
      body {
        padding: 8px;
        gap: 12px;
      }
      button {
        width: 100%;
        text-align: center;
      }
      #solverResults {
        grid-template-columns: 1fr;
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
  <div id="allResults">
    <h3>Solver Results</h3>
    <div id="solverResults">
      <div id="item-smtAltErgo" class="solver-item "><strong>SMTLib AltErgo:</strong> <pre id="res-smtAltErgo">Pending…</pre></div>
      <div id="item-cvc5" class="solver-item"><strong>SMTLib CVC5:</strong> <pre id="res-cvc5">Pending…</pre></div>
      <div id="item-smtZ3" class="solver-item"><strong>SMTLib Z3:</strong> <pre id="res-smtZ3">Pending…</pre></div>
      <div id="item-altErgoSingle" class="solver-item"><strong>AltErgoSingle:</strong> <pre id="res-altErgoSingle">Pending…</pre></div>
      <div id="item-mona" class="solver-item"><strong>Mona:</strong> <pre id="res-mona">Pending…</pre></div>
    </div>
  </div>
<script>
  const fileText = ${JSON.stringify(fileContent)};
  const vscode = acquireVsCodeApi();
  const output = document.getElementById('output');
  const runBtn = document.getElementById('runBtn');
  const preTA = document.getElementById('preText');
  const postTA = document.getElementById('postText');

   function resetSolverItems() {
      document.querySelectorAll('.solver-item').forEach(item => {
        item.classList.remove('success', 'error', 'neutral');
        const pre = item.querySelector('pre');
        pre.textContent = 'Pending…';
      });
    }


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
    resetSolverItems();
    runBtn.disabled = true;
    output.textContent = 'Verifying…';
    vscode.postMessage({
      command: 'useSolvers',
      data: {
        program: fileText,
        precond: preTA.value,
        postcond: postTA.value
      }
    });
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
    else  if(msg.type === 'solverResult'){
      if (msg.error){
          output.textContent = 'Running Solvers failed: ' + msg.error;
          return;
      }
      if (!msg.solverId) {
        output.textContent = 'Unknown solver responded';
        return;
      }

      const item = document.getElementById("item-"+msg.solverId);
      const pre  = document.getElementById("res-"+msg.solverId);
      console.log("msg","res-"+msg.solverId);
      console.log(item)
      // clear previous state
      item.classList.remove('success', 'error', 'neutral');

      const answer = msg.result.answer;
      if (answer === 'Unsat') {
        pre.textContent = "✅ " +answer;
        item.classList.add('success');
      } else if (answer === 'Sat') {
        pre.textContent = "❌ "+answer;
        item.classList.add('error');
      } else if (answer === 'Unknown') {
        pre.textContent = "🤷 "+answer;
        item.classList.add('neutral');
      } else {
        pre.textContent = "🪲 "+answer;
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