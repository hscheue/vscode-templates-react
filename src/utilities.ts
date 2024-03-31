import { TextDocumentShowOptions, window, workspace } from "vscode";

export async function openFile(
  path: string,
  options?: TextDocumentShowOptions
) {
  await workspace
    .openTextDocument(path)
    .then((doc) => window.showTextDocument(doc, options));
}

export const kebabCaseRegex = /^([a-z][a-z0-9]*)(-[a-z0-9]+)*$/;

export const upperCamelCaseRegex = /^[A-Z][a-zA-Z0-9]+$/;

export function toUpperCamelCase(input: string): string {
  return input
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join("");
}

export function toLowerCamelCase(input: string): string {
  const upperCamelCase = toUpperCamelCase(input);
  return upperCamelCase.slice(0, 1).toLowerCase() + upperCamelCase.slice(1);
}
