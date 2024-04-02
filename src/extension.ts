import { type ExtensionContext } from "vscode";
import extensionNextJS from "./extensionNextJS";
import extensionReactComponent from "./extensionReactComponent";
import extensionReactContext from "./extensionReactContext";
import extensionReactReducer from "./extensionReactReducer";

export function activate(context: ExtensionContext) {
  extensionReactComponent(context);
  extensionReactContext(context);
  extensionReactReducer(context);
  extensionNextJS(context);
}

export function deactivate() {}
