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
import { kebabCaseRegex, openFile, toUpperCamelCase } from "./utilities";

export default function extensionNextJS(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(
      "vscode-templates-react.next-js.page",
      nextJS("page")
    ),
    commands.registerCommand(
      "vscode-templates-react.next-js.route",
      nextJS("route")
    )
  );
}

function nextJS(type: "route" | "page") {
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

    const componentName = name.split("/").at(-1);
    const componentDirPath = `${fsPath}/${name}`;
    const propsPath = componentDirPath
      .split("app", 2)?.[1]
      .replace(/\/\(.*\)/g, "");

    if (!componentName) {
      window.showErrorMessage("last segment missing");
      return;
    }

    await mkdir(componentDirPath, { recursive: true });

    if (type === "page") {
      const pagePath = `${componentDirPath}/page.tsx`;

      await writeFile(pagePath, pageComponent(componentName, propsPath));

      await openFile(pagePath, { viewColumn: ViewColumn.One });
      return;
    }

    if (type === "route") {
      const routePath = `${componentDirPath}/route.ts`;

      await writeFile(routePath, routeComponent(propsPath));

      await openFile(routePath, { viewColumn: ViewColumn.One });
      return;
    }
  };
}

// TODO: convert [dynamic] segments into second argument { params }: { params?: { segment?: boolean } }
const routeComponent = (
  propsPath: string
) => `import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  props: RouteContext<'${propsPath}'>,
) {
  const params = await props.params;

  return NextResponse.json({
    basePath: request.nextUrl.searchParams.toString(),
  });
}

export async function POST(
  request: NextRequest,
  props: RouteContext<'${propsPath}'>,
) {
  const params = await props.params;

  const body = await request.json();
  return NextResponse.json({ body });
}

export const dynamic = 'force-dynamic';
`;

const pageComponent = (name: string, propsPath: string) =>
  `import { Metadata } from 'next';

export default async function ${toUpperCamelCase(name)}(
  props: PageProps<'${propsPath}'>,
) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  return (
    <div>
      <h1>${toUpperCamelCase(name)}</h1>
    </div>
  );
}

export const metadata: Metadata = {
  title: '',
  description: '',
  alternates: {
    canonical: '',
  },
};
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
