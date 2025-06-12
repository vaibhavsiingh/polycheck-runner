import * as vscode from 'vscode';
import { registerOpenPolycheckCommand } from './commands/openPolycheck';

// entry point
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        registerOpenPolycheckCommand(context)
    );
}

export function deactivate() {}