import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { execFile } from 'child_process';

//  writing pre/post files and invoking the main binary. 
export function runPolycheckWorkflow(
  context: vscode.ExtensionContext,
  panel: vscode.WebviewPanel,
  filePath: string,
  preContent: string,
  postContent: string
) {

  // 1) write temp files
  const tmpDir = os.tmpdir();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1e6);
  const preFile = path.join(tmpDir, `poly_pre_${timestamp}_${random}.txt`);
  const postFile = path.join(tmpDir, `poly_post_${timestamp}_${random}.txt`);
  try {
    fs.writeFileSync(preFile, preContent, 'utf8');
    fs.writeFileSync(postFile, postContent, 'utf8');
    console.log(`DEBUG: Temp files: ${preFile}, ${postFile}`);
  } catch (e) {
    const err = (e as Error).message;
    console.error(`DEBUG: Failed to write temp files: ${err}`);
    panel.webview.postMessage({ type: 'result', output: `Error writing files: ${err}` });
    return;
  }

  // 2) determine and run binary with [original, preFile, postFile]
  const platform = process.platform;
  let binName: string;
  if (platform === 'win32') {
    binName = 'polycheck.exe';
  }
  else if (platform === 'darwin') {
    binName = 'temp-macos';  // temporary for now
  }
  else if (platform === 'linux') {
    binName = 'temp-linux'; // temporary for now
  }
  else {
    const msg = `Platform ${platform} not supported.`;
    panel.webview.postMessage({ type: 'result', output: msg });
    cleanup(preFile, postFile);
    return;
  }

  const binPath = path.join(context.extensionPath, 'bin', binName);
  const args = ["-i",filePath,"-b",preFile, "-a",postFile]; // args
  console.log(`DEBUG: Running: ${binPath} ${args.join(' ')}`);


  vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: `Polycheck on ${path.basename(filePath)}` }, () => {
    return new Promise<void>(resolve => {
      execFile(binPath, args, (err, stdout, stderr) => { // executing the file here
        let out = "";
        if (err) {
          out += `Error: ${err.message}\n`;
          if (stderr) {
            out += `stderr:\n${stderr.trim()}\n`;
          }
          panel.webview.postMessage({ type: 'result', output: out });
          cleanup(preFile, postFile);
          resolve();
          return;
        }
        out += `Output:\n${stdout.trim()}\n`;
        panel.webview.postMessage({ type: 'result', output: out });
        cleanup(preFile, postFile);
        resolve();
      });
    });
  });
}

function cleanup(...files: string[]) {
  files.forEach(f => {
    fs.unlink(f, err => {
      if (err) {
        console.error(`DEBUG: Cleanup error for ${f}: ${err.message}`);
      }
      else {
        console.log(`DEBUG: Deleted ${f}`);
      }
    });
  });
}

