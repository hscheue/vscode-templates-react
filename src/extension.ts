import { type ExtensionContext } from "vscode";
import extensionAppRouter from "./extensionAppRouter";
import extensionReactComponent from "./extensionReactComponent";
import extensionReactContext from "./extensionReactContext";

export function activate(context: ExtensionContext) {
  extensionReactComponent(context);
  extensionReactContext(context);
  extensionAppRouter(context);
}

export function deactivate() {}
