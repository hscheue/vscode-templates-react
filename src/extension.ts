import { commands, type ExtensionContext } from "vscode";
import newReactListReducerContext from "./commands/react/newReactListReducerContext";
import newReactStateContext from "./commands/react/newReactStateContext";
import extensionAppRouter from "./extensionAppRouter";
import extensionReactComponent from "./extensionReactComponent";

export function activate(context: ExtensionContext) {
  extensionReactComponent(context);

  context.subscriptions.push(
    commands.registerCommand(
      "vscode-templates-react.newReactListReducerContext",
      newReactListReducerContext
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "vscode-templates-react.newReactStateContext",
      newReactStateContext
    )
  );

  extensionAppRouter(context);
}

export function deactivate() {}
