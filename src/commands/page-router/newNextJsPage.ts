import { Uri, window, InputBoxValidationSeverity, ViewColumn } from "vscode";
import { mkdir, writeFile } from "fs/promises";
import { kebabCaseRegex, openFile } from "../../utilities";

export default async function (uri: Uri | undefined) {
  if (!uri) {
    window.showErrorMessage("command only for use in context menu");
    return;
  }

  const name = await window.showInputBox({
    value: "page-name",
    validateInput: (value) => {
      const kebabCase = kebabCaseRegex.test(value);
      if (!kebabCase) {
        return {
          message: "next.js pages should be kebab-case",
          severity: InputBoxValidationSeverity.Error,
        };
      }
    },
  });

  if (!name) {
    window.showErrorMessage("component name is required");
    return;
  }

  const { fsPath } = uri;
  const pageDirPath = `${fsPath}/${name}`;
  await mkdir(pageDirPath);
  const pagePath = `${pageDirPath}/index.tsx`;
  const scssPath = `${pageDirPath}/index.module.scss`;
  await writeFile(pagePath, pageComponent(name));
  await writeFile(scssPath, scssModule(name));
  await openFile(pagePath, { viewColumn: ViewColumn.One });
  await openFile(scssPath, { viewColumn: ViewColumn.Two });
}

const pageComponent = (name: string) =>
  `import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
} from 'next';
import styles from './${name}.module.scss';

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
  return {
    props: {},
  } satisfies GetServerSidePropsResult<Record<string, unknown>>;
};

export default function ${toUpperCase(name)}({}: InferGetServerSidePropsType<
  typeof getServerSideProps
>) {
  return (
    <div className={styles.${toLowerCamelCase(toUpperCase(name))}}>
      <h1>${toUpperCase(name)}</h1>
    </div>
  );
}
`;

const scssModule = (name: string) =>
  `.${toLowerCamelCase(toUpperCase(name))} { 
  color: inherit; 
}
`;

function toLowerCamelCase(input: string): string {
  return input.slice(0, 1).toLowerCase() + input.slice(1);
}

function toUpperCase(input: string): string {
  return input
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join("");
}
