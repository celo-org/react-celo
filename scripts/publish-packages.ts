#!/usr/local/bin/node

/*
 * publish-packages script
 * THIS SCRIPT MUST BE RUN WITH NPM TO PUBLISH - `npm run publish-packages`
 * From the monorepo root run `yarn publish-packages`
 * You'll first be asked which version to update to.
 * You can pick major, minor, patch, a semantic version,
 * or nothing if you don't want to update the versions.
 * Then you'll be asked if you want to publish.
 * You can pick Y or N or dry-run for the same behavior as
 * `npm publish --dry-run`
 * The script will then update all the packages accordingly
 * and attempt to publish them accordingly.
 * As 2FA is enabled for these packages you'll need to be ready
 * to enter 2FA codes as you are prompted.
 * (In a dry-run the 2FA codes can be anything)
 * If a package fails to update you will be prompted if you
 * want to retry.
 * You can pick Y or N.
 * Any packages that are not published will be saved to
 * the `failedPublish.json` file.
 * You will be asked to fix these packages and try again.
 * Then the script will exit.
 * If you run publish-packages and it detects a `failedPublish.json`
 * file it will attempt again to publish those packages
 * (using the same version and possibly dry-run option) and
 * nothing else.
 * Once all packages are successfully deployed the script will
 * delete the `failedPublish.json` file and update all other
 * packages that use any of the packages to use their `-dev`version.
 */

import * as child_process from 'child_process';
import { green, red } from 'colors';
import * as fs from 'fs';
import * as path from 'path';
import { get, RevalidatorSchema, start } from 'prompt';
import { valid, prerelease } from 'semver';
import {
  findPackagePaths,
  incrementVersion,
  readPackageJson,
  removeDevSuffix,
  VERSIONS,
  writePackageJson,
} from './utils';

type Answers = {
  packages: string[];
  version: string;
  publish: string;
};

// This is an async IIFE so that we can use `aync/await`
void (async function () {
  start();

  // `getAnswers` will either prompt the user for a version and whether
  // or not to publish or it will use an existing failedPublish.json file.
  const { packages, version, publish } = await getAnswers();

  if (version && !valid(version) && !VERSIONS.includes(version)) {
    console.error(
      red(
        'Invalid version given. Version must be major, minor, patch, or a semantic version.'
      )
    );
    process.exit(1);
  }

  const shouldPublish =
    publish.toLowerCase() === 'y' || publish.toLowerCase() === 'dry-run';

  if (!shouldPublish && !version) {
    console.error(red('Either a version or --publish must be given'));
    process.exit(1);
  }

  let tag = 'latest';
  const prereleaseArr = prerelease(version);
  if (prereleaseArr) {
    tag = (prereleaseArr[0] + '').trim();

    if (!['alpha', 'beta', 'canary', 'rc'].includes(tag)) {
      const errorPrompt = [
        {
          name: 'confirmTag',
          description: red(
            `Unknown prerelease keyword given, do you really want to publish ${version} with tag ${tag}? Y/N`
          ),
        },
      ];
      const { confirmTag } = await get(errorPrompt);
      if (confirmTag !== 'Y') {
        process.exit(1);
      }
    }
  }

  const packagePaths = findPackagePaths(path.join(__dirname, '..', 'packages'));
  const packageJsons = packagePaths.map(readPackageJson);

  // We need all the names before we go through and update the
  // `package.json` dependencies.
  const packageNames = packageJsons.map(({ name }) => name);

  const currentVersion = removeDevSuffix(packageJsons[0].version);

  let newVersion: string;
  if (!version) {
    newVersion = currentVersion;
  } else {
    newVersion = VERSIONS.includes(version)
      ? incrementVersion(currentVersion, version)
      : version;
  }
  // Here we update the `package.json` objects with updated
  // versions and dependencies.
  packageJsons.forEach((json, index) => {
    json.version = newVersion;

    if (shouldPublish) {
      for (const depName in json.dependencies) {
        if (packageNames.includes(depName)) {
          json.dependencies[depName] = newVersion;
        }
      }
      for (const depName in json.devDependencies) {
        if (packageNames.includes(depName)) {
          json.devDependencies[depName] = newVersion;
        }
      }
    }

    writePackageJson(packagePaths[index], json);
  });

  const otpPrompt = [
    {
      name: 'otp',
      description: green(`Enter 2FA code`),
    },
  ];

  const successfulPackages: string[] = [];
  if (shouldPublish) {
    // Here we build and publish all the packages
    for (let index = 0; index < packagePaths.length; index++) {
      const path = packagePaths[index];
      const packageJson = packageJsons[index];
      if (packages.length && !packages.includes(packageJson.name)) {
        console.log(`Skipping ${packageJson.name}`);
        successfulPackages.push(packageJson.name);
        continue;
      }
      const packageFolderPath = path.replace('package.json', '');
      try {
        console.log(`Building ${packageJson.name}`);
        child_process.execSync('yarn build', {
          cwd: packageFolderPath,
          stdio: 'ignore',
        });

        console.info(
          `Publishing ${packageJson.name}@${packageJson.version} tagged as ${tag}...`
        );
        // Here you enter the 2FA code for npm
        let { otp } = await get<{ otp: string }>(otpPrompt);
        if (!otp) {
          console.error(red('OTP is required. Can be anything for dry run'));
        }

        // Here is the actual publishing
        child_process.execSync(
          `npm publish --access public --otp ${otp} ${
            publish === 'dry-run' ? '--dry-run' : ''
          } --tag ${tag}`,
          { cwd: packageFolderPath, stdio: 'ignore' }
        );
        successfulPackages.push(packageJson.name);
      } catch (e) {
        const errorPrompt = [
          {
            name: 'retry',
            description: red(
              `${packageJson.name} failed to publish. Error message: ${
                (e as Error).message
              } Retry? Y/N`
            ),
          },
        ];
        const { retry } = await get(errorPrompt);
        if (retry === 'Y') {
          index--;
        }
      }
    }
  }

  // This means some packages were not successfully published
  // but some were published so we need to track the failed ones
  // to keep them in sync.
  if (
    successfulPackages.length &&
    successfulPackages.length !== packageNames.length
  ) {
    const failedPackages = packageNames.filter(
      (name) => !successfulPackages.includes(name)
    );
    console.error(
      red(
        `The following packages failed to publish ${failedPackages.join(', ')}.`
      )
    );
    console.error(red('Creating failed packages file.'));
    fs.writeFileSync(
      path.join(__dirname, 'failedPackages.json'),
      JSON.stringify({ packages: failedPackages, version: undefined, publish })
    );
    console.error(red(`Fix failed packages and try again.`));
    process.exit(1);
  }

  const failedJsonPath = path.join(__dirname, 'failedPackages.json');
  if (fs.existsSync(failedJsonPath)) {
    fs.unlinkSync(failedJsonPath);
  }

  const allPackagePaths = findPackagePaths(
    path.join(__dirname, '..', 'packages')
  );

  const newDevVersion = getNewDevVersion(newVersion);

  // Finally we update all the packages across the monorepo
  // to use the most recent packages.
  allPackagePaths.forEach((path) => {
    const json = readPackageJson(path);

    json.version = `${newVersion}-dev`;

    for (const depName in json.dependencies) {
      if (packageNames.includes(depName)) {
        const versionUpdate = json.dependencies[depName].includes('-dev')
          ? `${newDevVersion}-dev`
          : newVersion;
        json.dependencies[depName] = versionUpdate;
      }
    }
    for (const depName in json.devDependencies) {
      if (packageNames.includes(depName)) {
        const versionUpdate = json.devDependencies[depName].includes('-dev')
          ? `${newDevVersion}-dev`
          : newVersion;
        json.devDependencies[depName] = versionUpdate;
      }
    }
    writePackageJson(path, json);
  });
})();

async function getAnswers(): Promise<Answers> {
  try {
    const json = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'failedPublish.json')).toString()
    ) as Answers;
    console.log(
      green('Detected failed publish file. Attempting to republish.')
    );
    return json;
  } catch (e) {
    const prompts: RevalidatorSchema[] = [
      {
        name: 'version',
        description: green(
          `Specify a version: major, minor, patch, a semantic version number, or nothing`
        ),
      },
      {
        name: 'publish',
        description: green(
          `Should the packages also be published? y/n/dry-run`
        ),
        default: 'dry-run',
      },
    ];
    const { version, publish }: { version: string; publish: string } =
      await get(prompts);

    return {
      version,
      publish,
      packages: [],
    };
  }
}

function getNewDevVersion(version: string) {
  const versionArray = version.split('.');
  const bump = Number(versionArray[2]) + 1;
  if (isNaN(bump)) return version;
  versionArray[2] = `${bump}`;
  return versionArray.join('.');
}
