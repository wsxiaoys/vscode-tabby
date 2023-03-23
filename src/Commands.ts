import { ConfigurationTarget, workspace } from "vscode";

const configuration = workspace.getConfiguration();
const target = ConfigurationTarget.Global;

function setExtensionStatus(enabled: boolean) {
    console.debug("Setting tabby state to", enabled);
    configuration.update('tabby.enabled', enabled, target, false).then(console.error);
}

export type Command = { command: string, callback: (...args: any[]) => any, thisArg?: any };

export const turnOnTabby: Command = {
    command: "tabby.enable",
    callback: () => setExtensionStatus(true)
};

export const turnOffTabby: Command = {
    command: "tabby.disable",
    callback: () => setExtensionStatus(false)
};
