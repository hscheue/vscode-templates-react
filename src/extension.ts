import { commands, type ExtensionContext } from "vscode";
import newReactListReducerContext from "./commands/react/newReactListReducerContext";
import newNextJsPage from "./commands/page-router/newNextJsPage";
import newNextJsApi from "./commands/page-router/newNextJsApi";
import newReactStateContext from "./commands/react/newReactStateContext";
import extensionAppRouter from "./extensionAppRouter";
import extensionReactComponent from "./extensionReactComponent";

export function activate(context: ExtensionContext) {
  extensionReactComponent(context);

  context.subscriptions.push(
    commands.registerCommand(
      "react-tools.newReactListReducerContext",
      newReactListReducerContext
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "react-tools.newReactStateContext",
      newReactStateContext
    )
  );
  // pages
  context.subscriptions.push(
    commands.registerCommand("react-tools.newNextJsPage", newNextJsPage)
  );
  context.subscriptions.push(
    commands.registerCommand("react-tools.newNextJsApi", newNextJsApi)
  );
  extensionAppRouter(context);
}

export function deactivate() {}
