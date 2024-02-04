import AppRootDir from "app-root-dir";
import path from "path";
import { getPlatform } from "./get-platform.module";
import { IS_PROD } from "Main/main";

export default function getBinaryPath(moduleName: string): string {
  return (
    IS_PROD
      ? path.join(
          AppRootDir.get(),
          `../../assets/binaries/${moduleName}/${getPlatform()}/bin`
        )
      : `${AppRootDir.get()}/assets/binaries/${moduleName}/${getPlatform()}/bin`
  );
}
