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
  useReducer,
  type Dispatch,
  type PropsWithChildren,
} from 'react';

export type ${upper} = {
  id: string;
};

type State = ${upper}[];

type Action =
  | { type: 'added'; id: string }
  | { type: 'changed'; ${lower}: ${upper} }
  | { type: 'deleted'; id: string };

type Reducer = (state: State, action: Action) => State;

const ${upper}Context = createContext<State | null>(null);

const ${upper}DispatchContext = createContext<Dispatch<Action> | null>(null);

export function ${upper}Provider({ children }: PropsWithChildren) {
  const [${lower}, dispatch] = useReducer<Reducer>(${lower}Reducer, initial${upper});

  return (
    <${upper}Context.Provider value={${lower}}>
      <${upper}DispatchContext.Provider value={dispatch}>
        {children}
      </${upper}DispatchContext.Provider>
    </${upper}Context.Provider>
  );
}

export function use${upper}(): State {
  const context = useContext(${upper}Context);
  if (context === null) throw Error('Missing Provider: ${upper}Provider');
  return context;
}

export function use${upper}Dispatch(): Dispatch<Action> {
  const context = useContext(${upper}DispatchContext);
  if (context === null) throw Error('Missing Provider: ${upper}Provider');
  return context;
}

const ${lower}Reducer: Reducer = (${lower}, action) => {
  switch (action.type) {
    case 'added': {
      return [
        ...${lower},
        {
          id: window.crypto.randomUUID(),
        },
      ];
    }
    case 'changed': {
      return ${lower}.map((item) => {
        if (item.id === action.${lower}.id) {
          return action.${lower};
        } else {
          return item;
        }
      });
    }
    case 'deleted': {
      return ${lower}.filter((t) => t.id !== action.id);
    }
    default: {
      // @ts-expect-error unknown action type
      throw Error('Unknown action: ' + action.type);
    }
  }
};

const initial${upper} = [{ id: '0' }, { id: '1' }, { id: '2' }];
`;
}

function toLowerCamelCase(input: string): string {
  return input.slice(0, 1).toLowerCase() + input.slice(1);
}

function removeTrailingContext(input: string): string {
  return input.replace(/Context$/, "");
}
