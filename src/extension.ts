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
  // pages
  context.subscriptions.push(
    commands.registerCommand(
      "vscode-templates-react.newNextJsPage",
      newNextJsPage
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "vscode-templates-react.newNextJsApi",
      newNextJsApi
    )
  );
  extensionAppRouter(context);
}

export function deactivate() {}
