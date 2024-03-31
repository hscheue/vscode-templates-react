import {
  Uri,
  window,
  InputBoxValidationSeverity,
  ViewColumn,
  ExtensionContext,
  commands,
} from "vscode";
import { writeFile } from "fs/promises";
import {
  kebabCaseRegex,
  openFile,
  toLowerCamelCase,
  toUpperCamelCase,
  upperCamelCaseRegex,
} from "./utilities";

export default function extensionReactComponent(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(
      "vscode-templates-react.react-component.component",
      reactComponent("component")
    ),
    commands.registerCommand(
      "vscode-templates-react.react-component.component-scss",
      reactComponent("component-scss")
    )
  );
}

function reactComponent(type: "component" | "component-scss") {
  return async (uri: Uri | undefined) => {
    if (!uri) {
      window.showErrorMessage("command only for use in context menu");
      return;
    }

    const name = await window.showInputBox({
      value: "ComponentName",
      validateInput: (value) => {
        const camelCase = upperCamelCaseRegex.test(value);
        if (!camelCase) {
          return {
            message: "react components should be UpperCamelCase",
            severity: InputBoxValidationSeverity.Error,
          };
        }
      },
    });

    if (!name) {
      window.showErrorMessage("component name is required");
      return;
    }

    if (type === "component") {
      const { fsPath } = uri;
      const tsxPath = `${fsPath}/${name}.tsx`;
      await writeFile(tsxPath, reactTemplate(name));
      await openFile(tsxPath, { viewColumn: ViewColumn.One });
      return;
    }

    if (type === "component-scss") {
      const { fsPath } = uri;
      const tsxPath = `${fsPath}/${name}.tsx`;
      const scssPath = `${fsPath}/${name}.module.scss`;
      await writeFile(tsxPath, reactScssTemplate(name));
      await writeFile(scssPath, scssTemplate(name));
      await openFile(tsxPath, { viewColumn: ViewColumn.One });
      await openFile(scssPath, { viewColumn: ViewColumn.Two });
      return;
    }
  };
}

// TODO: make default without children and add children variant
const reactTemplate = (name: string) =>
  `export default function ${name}() {
  return <div></div>;
}
`;

const reactScssTemplate = (name: string) =>
  `import styles from './${name}.module.scss';

export default function ${name}() {
  return <div className={styles.${toLowerCamelCase(name)}}></div>;
}
`;

const scssTemplate = (name: string) =>
  `.${toLowerCamelCase(name)} { 
  color: inherit; 
}
`;
