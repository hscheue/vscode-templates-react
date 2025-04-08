import {
  Uri,
  window,
  InputBoxValidationSeverity,
  ViewColumn,
  ExtensionContext,
  commands,
} from "vscode";
import { writeFile } from "fs/promises";
import { openFile, upperCamelCaseRegex } from "./utilities";

export default function extensionReactContext(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(
      "vscode-templates-react.react-context.props",
      reactContext("props")
    ),
    commands.registerCommand(
      "vscode-templates-react.react-context.props-and-setter",
      reactContext("props-and-setter")
    )
  );
}

function reactContext(type: "props" | "props-and-setter") {
  return async (uri: Uri | undefined) => {
    if (!uri) {
      window.showErrorMessage("command only for use in context menu");
      return;
    }

    const name = await window.showInputBox({
      value: "NameContext",
      validateInput: (value) => {
        const upperCamelCase = upperCamelCaseRegex.test(value);
        const endsWithContext = /Context$/.test(value);
        if (!upperCamelCase) {
          return {
            message: "react context should be UpperCamelCase",
            severity: InputBoxValidationSeverity.Error,
          };
        }
        if (!endsWithContext) {
          return {
            message: 'react context should end with "Context"',
            severity: InputBoxValidationSeverity.Error,
          };
        }
      },
    });

    if (!name) {
      window.showErrorMessage("context name is required");
      return;
    }

    const { fsPath } = uri;
    const tsxPath = `${fsPath}/${name}.tsx`;

    if (type === "props") {
      await writeFile(tsxPath, propsContext(name));
      await openFile(tsxPath, { viewColumn: ViewColumn.One });
      return;
    }

    if (type === "props-and-setter") {
      await writeFile(tsxPath, propsAndSetterContext(name));
      await openFile(tsxPath, { viewColumn: ViewColumn.One });
      return;
    }
  };
}

function propsContext(name: string) {
  const upper = removeTrailingContext(name);
  const lower = toLowerCamelCase(upper);

  return `import {
  createContext,
  useContext,
  type PropsWithChildren,
} from 'react';

export type ${upper} = Record<string | number, unknown>;

const ${upper}Context = createContext<${upper} | null>(null);

export function ${upper}Provider({ ${lower}, children }: PropsWithChildren<{ ${lower}: ${upper} }>) {    
  return (
    <${upper}Context.Provider value={${lower}}>
      {children}
    </${upper}Context.Provider>
  );
}

export function use${upper}(): ${upper} {
  const context = useContext(${upper}Context);
  if (!context) throw Error('Missing Provider: ${upper}Provider');
  return context;
}
`;
}

function propsAndSetterContext(name: string) {
  const upper = removeTrailingContext(name);
  const lower = toLowerCamelCase(upper);

  return `import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';

export type ${upper} = Record<string | number, unknown>;

const ${upper}Context = createContext<${upper} | null>(null);

const ${upper}SetStateContext = createContext<Dispatch<
  SetStateAction<${upper}>
> | null>(null);

export function ${upper}Provider({ children }: PropsWithChildren) {
  const [${lower}, set${upper}] = useState<${upper}>({});

  return (
    <${upper}Context.Provider value={${lower}}>
      <${upper}SetStateContext.Provider value={set${upper}}>
        {children}
      </${upper}SetStateContext.Provider>
    </${upper}Context.Provider>
  );
}

export function use${upper}(): ${upper} {
  const context = useContext(${upper}Context);
  if (!context) throw Error('Missing Provider: ${upper}Provider');
  return context;
}

export function use${upper}SetState(): Dispatch<SetStateAction<${upper}>> {
  const context = useContext(${upper}SetStateContext);
  if (context === null) throw Error('Missing Provider: ${upper}Provider');
  return context;
}
`;
}

function toLowerCamelCase(input: string): string {
  return input.slice(0, 1).toLowerCase() + input.slice(1);
}

function removeTrailingContext(input: string): string {
  return input.replace(/Context$/, "");
}
