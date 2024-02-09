import AppRootDir from "app-root-dir";
import path from "path";
import { getPlatform } from "./get-platform.module";

const IS_PROD = process.env.NODE_ENV === 'production';
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
