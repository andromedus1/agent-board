import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

/** Resolve npm-created symlinks and URL escaping before identifying a CLI entry. */
export function isMain(moduleUrl: string, argvEntry: string | undefined): boolean {
  if (argvEntry === undefined) return false;
  try {
    return moduleUrl === pathToFileURL(realpathSync(argvEntry)).href;
  } catch {
    return false;
  }
}
