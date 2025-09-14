import * as vscode from 'vscode';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('routeCheck.checkSingleLink', checkSingleLink),
    vscode.commands.registerCommand('routeCheck.checkLinksInFile', checkLinksInFile)
  );
}

async function checkSingleLink() {
//   const url = await vscode.window.showInputBox({ prompt: 'Enter a URL to check' });
//   if (!url) {
//     vscode.window.showWarningMessage('No URL provided.');
//     return;
//   }
let url = await vscode.window.showInputBox({ prompt: 'Enter a URL to check' });
if (!url) {
  vscode.window.showWarningMessage('No URL provided.');
  return;
}
url = normalizeUrl(url);

if (!isValidUrl(url)) {
  vscode.window.showErrorMessage('❌ Invalid URL format.');
  return;
}


  try {
    const response = await axios.get(url);
    vscode.window.showInformationMessage(`✅ ${url} is alive! Status: ${response.status}`);
  } catch (err: any) {
    vscode.window.showErrorMessage(`❌ ${url} is broken or unreachable. ${err.message}`);
  }
}

// async function checkLinksInFile() {
//   const fileUris = await vscode.window.showOpenDialog({
//     canSelectMany: false,
//     filters: { 'Text Files': ['txt'] },
//     openLabel: 'Select file containing links'
//   });

//   if (!fileUris || fileUris.length === 0) {
//     vscode.window.showWarningMessage('No file selected.');
//     return;
//   }

//   const format = await vscode.window.showQuickPick(['text', 'csv', 'json'], {
//     placeHolder: 'Select output format'
//   });

//   if (!format) {
//     vscode.window.showWarningMessage('No format selected.');
//     return;
//   }

//   const filePath = fileUris[0].fsPath;
//   let urls: string[];

//   try {
//     const fileContent = fs.readFileSync(filePath, 'utf-8');
//     urls = fileContent.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
//   } catch (err: any) {
//     vscode.window.showErrorMessage(`❌ Failed to read the file: ${err.message}`);
//     return;
//   }

//   const output = vscode.window.createOutputChannel('Link Checker');
//   output.clear();
//   output.show(true);
//   output.appendLine(`🔍 Checking ${urls.length} links...\n`);

//   const results = await Promise.all(urls.map(async (url) => {
//     try {
//       const res = await axios.get(url);
//       return { url, status: res.status, ok: true };
//     } catch (error: any) {
//       return { url, status: error?.response?.status || 'error', ok: false };
//     }
//   }));

//   let report = '';

//   switch (format) {
//     case 'csv':
//       report = 'URL,Status\n' + results.map(r => `${r.url},${r.status}`).join('\n');
//       break;
//     case 'json':
//       report = JSON.stringify(results, null, 2);
//       break;
//     case 'text':
//     default:
//       report = results.map(r => `${r.ok ? '✅' : '❌'} ${r.url} - ${r.status}`).join('\n');
//       break;
//   }

//   output.appendLine(report);

//   try {
//     const reportFileName = `link-report.${format === 'text' ? 'txt' : format}`;
//     const reportFilePath = path.join(path.dirname(filePath), reportFileName);
//     fs.writeFileSync(reportFilePath, report);
//     vscode.window.showInformationMessage(`✅ Link check complete. Report saved to: ${reportFilePath}`);
//   } catch (err: any) {
//     vscode.window.showErrorMessage(`❌ Could not write report file: ${err.message}`);
//   }
// }

function normalizeUrl(url: string): string {
  if (!/^https?:\/\//i.test(url)) {
    return 'https://' + url;
  }
  return url;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeUrl(url));
    return !!parsed.hostname && parsed.hostname.includes('.');
  } catch {
    return false;
  }
}


async function checkLinksInFile() {
  const fileUris = await vscode.window.showOpenDialog({
    canSelectMany: false,
    filters: { 'Text Files': ['txt'] },
    openLabel: 'Select file containing links'
  });

  if (!fileUris || fileUris.length === 0) {
    vscode.window.showWarningMessage('No file selected.');
    return;
  }

  const format = await vscode.window.showQuickPick(['text', 'csv', 'json'], {
    placeHolder: 'Select output format'
  });

  if (!format) {
    vscode.window.showWarningMessage('No format selected.');
    return;
  }

  const runInParallel = await vscode.window.showQuickPick(['Yes', 'No'], {
    placeHolder: 'Run link checks in parallel?'
  });

  const filePath = fileUris[0].fsPath;
  let urls: string[];

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
	urls = fileContent
     .split(/\r?\n/)
     .map(line => normalizeUrl(line.trim()))
     .filter(url => isValidUrl(url));

    // urls = fileContent.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
  } catch (err: any) {
    vscode.window.showErrorMessage(`❌ Failed to read the file: ${err.message}`);
    return;
  }

  const output = vscode.window.createOutputChannel('Route Check');
  output.clear();
  output.show(true);
  output.appendLine(`🔍 Checking ${urls.length} links (${runInParallel === 'Yes' ? 'parallel' : 'sequential'})...\n`);

  const checkLink = async (url: string) => {
    try {
      const res = await axios.get(url);
      return { url, status: res.status, ok: true };
    } catch (error: any) {
      return { url, status: error?.response?.status || 'error', ok: false };
    }
  };

  let results: { url: string; status: number | string; ok: boolean }[] = [];

  if (runInParallel === 'Yes') {
    results = await Promise.all(urls.map(url => checkLink(url)));
  } else {
    for (const url of urls) {
      const result = await checkLink(url);
      results.push(result);
    }
  }

  let report = '';

  switch (format) {
    case 'csv':
      report = 'URL,Status\n' + results.map(r => `${r.url},${r.status}`).join('\n');
      break;
    case 'json':
      report = JSON.stringify(results, null, 2);
      break;
    case 'text':
    default:
      report = results.map(r => `${r.ok ? '✅' : '❌'} ${r.url} - ${r.status}`).join('\n');
      break;
  }

  output.appendLine(report);

  try {
    const reportFileName = `link-report.${format === 'text' ? 'txt' : format}`;
    const reportFilePath = path.join(path.dirname(filePath), reportFileName);
    fs.writeFileSync(reportFilePath, report);
    vscode.window.showInformationMessage(`✅ Link check complete. Report saved to: ${reportFilePath}`);
  } catch (err: any) {
    vscode.window.showErrorMessage(`❌ Could not write report file: ${err.message}`);
  }
}


export function deactivate() {}
