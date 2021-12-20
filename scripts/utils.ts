import * as fs from 'fs';
import * as path from 'path';

export type PackageJson = {
  name: string;
  version: string;
  dependencies: { [key: string]: string };
  devDependencies: { [key: string]: string };
};

export const VERSIONS = ['major', 'minor', 'patch'];
export const DONT_OPEN = ['node_modules', 'src', 'lib', 'example'];

export function findPackagePaths(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .reduce<string[]>((packageJsons, dirent) => {
      if (dirent.isDirectory() && !DONT_OPEN.includes(dirent.name)) {
        return [...packageJsons, ...findPackagePaths(`${dir}/${dirent.name}`)];
      }
      if (dirent.name === 'package.json') {
        return [...packageJsons, path.join(dir, dirent.name)];
      }
      return packageJsons;
    }, []);
}

export function incrementVersion(version: string, command: string): string {
  const index = VERSIONS.indexOf(command);
  return version
    .split('.')
    .map((v, i) => (i === index ? parseInt(v) + 1 : i > index ? 0 : v))
    .join('.');
}

export function removeDevSuffix(version: string): string {
  return version.endsWith('-dev') ? version.slice(0, 5) : version;
}

export function readPackageJson(filePath: string): PackageJson {
  return JSON.parse(fs.readFileSync(filePath).toString()) as PackageJson;
}

export function writePackageJson(
  filePath: string,
  properties: Partial<PackageJson>
): void {
  const packageJson = readPackageJson(filePath);
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        ...packageJson,
        ...properties,
      },
      null,
      2
    )
  );
}
