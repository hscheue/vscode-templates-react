import {
  ExtensionContext,
  InputBoxOptions,
  InputBoxValidationSeverity,
  Uri,
  ViewColumn,
  commands,
  window,
} from "vscode";
import { mkdir, writeFile } from "fs/promises";
import {
  kebabCaseRegex,
  openFile,
  toUpperCamelCase,
  toLowerCamelCase,
} from "./utilities";

export default function extensionAppRouter(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(
      "vscode-templates-react.app-router.page",
      appRouter("page")
    ),
    commands.registerCommand(
      "vscode-templates-react.app-router.route",
      appRouter("route")
    )
  );
}

function appRouter(type: "route" | "page") {
  return async (uri: Uri | undefined) => {
    if (!uri) {
      window.showErrorMessage("command only for use in context menu");
      return;
    }

    const name = await window.showInputBox({
      value: "component-name",
      validateInput: validatePageInput,
    });

    if (!name) {
      window.showErrorMessage("component name is required");
      return;
    }

    const { fsPath } = uri;
    const componentDirPath = `${fsPath}/${name}`;
    const componentName = name.split("/").at(-1);

    if (!componentName) {
      window.showErrorMessage("last segment missing");
      return;
    }

    if (type === "page") {
      await mkdir(componentDirPath, { recursive: true });
      await mkdir(`${componentDirPath}/_components`);
      await mkdir(`${componentDirPath}/_lib`);

      const pagePath = `${componentDirPath}/page.tsx`;
      // should we share this with layout.tsx?
      const scssPath = `${componentDirPath}/page.module.scss`;

      await writeFile(pagePath, pageComponent(componentName));
      await writeFile(scssPath, scssModule(componentName));

      await openFile(pagePath, { viewColumn: ViewColumn.One });
      await openFile(scssPath, { viewColumn: ViewColumn.Two });
      return;
    }

    if (type === "route") {
      await mkdir(componentDirPath, { recursive: true });
      const routePath = `${componentDirPath}/route.ts`;
      await writeFile(routePath, routeComponent());
      return;
    }
  };
}

// TODO: convert [dynamic] segments into second argument { params }: { params?: { segment?: boolean } }
const routeComponent =
  () => `import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    basePath: request.nextUrl.searchParams.toString(),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ body });
}
`;

const pageComponent = (name: string) =>
  `import styles from './page.module.scss';

export default async function ${toUpperCamelCase(name)}() {
  return (
    <div className={styles.${toLowerCamelCase(toUpperCamelCase(name))}}>
      <h1>${toUpperCamelCase(name)}</h1>
    </div>
  );
}
`;

const scssModule = (name: string) =>
  `.${toLowerCamelCase(toUpperCamelCase(name))} { 
  color: inherit; 
}
`;

/**
 * Validate each segment to be kebab case
 * TODO: Additional next.js validation: _folder, (folder), etc
 */
const validatePageInput: InputBoxOptions["validateInput"] = (value) => {
  const validSegments = value
    .split("/")
    .every((segment) => kebabCaseRegex.test(segment));

  if (!validSegments) {
    return {
      message: "next.js pages should be kebab-case",
      severity: InputBoxValidationSeverity.Error,
    };
  }
};
