import { type ExtensionContext } from "vscode";
import extensionNextJS from "./extensionNextJS";
import extensionReactComponent from "./extensionReactComponent";
import extensionReactContext from "./extensionReactContext";

export function activate(context: ExtensionContext) {
  extensionReactComponent(context);
  extensionReactContext(context);
  extensionNextJS(context);
}

export function deactivate() {}
