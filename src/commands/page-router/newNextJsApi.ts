import { Uri, window, InputBoxValidationSeverity, ViewColumn } from "vscode";
import { writeFile } from "fs/promises";
import { kebabCaseRegex, openFile } from "../../utilities";

export default async function (uri: Uri | undefined) {
  if (!uri) {
    window.showErrorMessage("command only for use in context menu");
    return;
  }

  const name = await window.showInputBox({
    value: "api-file",
    validateInput: (value) => {
      const kebabCase = kebabCaseRegex.test(value);
      if (!kebabCase) {
        return {
          message: "next.js apis files should be kebab-case",
          severity: InputBoxValidationSeverity.Error,
        };
      }
    },
  });

  if (!name) {
    window.showErrorMessage("api name is required");
    return;
  }

  const { fsPath } = uri;
  const apiPath = `${fsPath}/${name}.ts`;
  await writeFile(apiPath, apiComponent());
  await openFile(apiPath, { viewColumn: ViewColumn.One });
}

const apiComponent =
  () => `import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  res.end(JSON.stringify({ hello: 'world' }));
}
`;
