// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, ExtensionContext, languages } from 'vscode';
import { turnOffTabby, turnOnTabby } from './Commands';
import { TabbyCompletionProvider } from './TabbyCompletionProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	console.debug("Registering Tabby provider", new Date());
	context.subscriptions.push(
		languages.registerInlineCompletionItemProvider(
			{ pattern: "**" }, new TabbyCompletionProvider()
		),
		commands.registerCommand(turnOnTabby.command, turnOnTabby.callback),
		commands.registerCommand(turnOffTabby.command, turnOffTabby.callback)
	);
}

// this method is called when your extension is deactivated
export function deactivate() {
	console.debug("Deactivating Tabby provider", new Date());
}
