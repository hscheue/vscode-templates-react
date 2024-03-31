import { Uri, window, InputBoxValidationSeverity, ViewColumn } from "vscode";
import { writeFile } from "fs/promises";
import { openFile, upperCamelCaseRegex } from "../../utilities";

export default async function (uri: Uri | undefined) {
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
  await writeFile(tsxPath, contextComponent(name));
  await openFile(tsxPath, { viewColumn: ViewColumn.One });
}

function contextComponent(name: string) {
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
