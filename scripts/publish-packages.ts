#!/usr/local/bin/node

/*
 * publish-packages script
 * THIS SCRIPT MUST BE RUN WITH NPM TO PUBLISH - `npm run publish-packages`
 * From the monorepo root run `yarn publish-packages`
 * You'll first be asked which version to update the sdks to.
 * You can pick major, minor, patch, a semantic version,
 * or nothing if you don't want to update the versions.
 * Then you'll be asked if you want to publish the sdks.
 * You can pick Y or N or dry-run for the same behavior as
 * `npm publish --dry-run`
 * The script will then update all the sdk packages accordingly
 * and attempt to publish them accordingly.
 * As 2FA is enabled for these packages you'll need to be ready
 * to enter 2FA codes as you are prompted.
 * (In a dry-run the 2FA codes can be anything)
 * If a package fails to update you will be prompted if you
 * want to retry.
 * You can pick Y or N.
 * Any sdk packages that are not published will be saved to
 * the `failedSDKs.json` file.
 * You will be asked to fix these packages and try again.
 * Then the script will exit.
 * If you run publish-packages and it detects a `failedSDKs.json`
 * file it will attempt again to publish those packages
 * (using the same version and possibly dry-run option) and
 * nothing else.
 * Once all packages are successfully deployed the script will
 * delete the `failedSDKs.json` file and update all other
 * packages in the monorepo that use any of the sdk packages
 * to use their `-dev` new version.
 */

import * as child_process from 'child_process';
import { green, red } from 'colors';
import * as fs from 'fs';
import * as path from 'path';
import { get, RevalidatorSchema, start } from 'prompt';
import { valid } from 'semver';

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
  // or not to publish or it will use an existing failedSDKs.json file.
  const { packages, version, publish } = await getAnswers();

  if (version && !valid(version) && !VERSIONS.includes(version)) {
    console.error(
      red(
        'Invalid version given. Version must be major, minor, patch, or a semantic version.'
      )
    );
    process.exit(1);
  }

  const shouldPublish = publish === 'Y' || publish === 'dry-run';

  if (!shouldPublish && !version) {
    console.error(red('Either a version or --publish must be given'));
    process.exit(1);
  }

  const sdkPackagePaths = findPackagePaths(
    path.join(__dirname, '..', 'packages')
  );
  const sdkJsons = sdkPackagePaths.map(readPackageJson);

  // We need all the sdkNames before we go through and update the
  // `package.json` dependencies.
  const sdkNames = sdkJsons.map(({ name }) => name);

  let newVersion: string;
  // Here we update the sdk `package.json` objects with updated
  // versions and dependencies.
  sdkJsons.forEach((json, index) => {
    if (!newVersion) {
      if (!version) {
        newVersion = removeDevSuffix(json.version);
      } else {
        newVersion = VERSIONS.includes(version)
          ? incrementVersion(removeDevSuffix(json.version), version)
          : version;
      }
    }

    json.version = newVersion;

    if (shouldPublish) {
      for (const depName in json.dependencies) {
        if (sdkNames.includes(depName)) {
          json.dependencies[depName] = newVersion;
        }
      }
      for (const depName in json.devDependencies) {
        if (sdkNames.includes(depName)) {
          json.devDependencies[depName] = newVersion;
        }
      }
    }

    writePackageJson(sdkPackagePaths[index], json);
  });

  const otpPrompt = [
    {
      name: 'otp',
      description: green(`Enter 2FA code`),
    },
  ];

  let otp = '';
  const successfulPackages: string[] = [];
  if (shouldPublish) {
    // Here we build and publish all the sdk packages
    for (let index = 0; index < sdkPackagePaths.length; index++) {
      const path = sdkPackagePaths[index];
      const packageJson = sdkJsons[index];
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

        console.log(`Publishing ${packageJson.name}@${packageJson.version}`);
        // Here you enter the 2FA code for npm
        let { newOtp } = await get<{ newOtp: string }>(otpPrompt);
        if (!newOtp) {
          newOtp = otp;
        } else {
          otp = newOtp;
        }

        // Here is the actual publishing
        child_process.execSync(
          `npm publish --access public --otp ${newOtp} ${
            publish === 'dry-run' ? '--dry-run' : ''
          }`,
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
    successfulPackages.length !== sdkNames.length
  ) {
    const failedPackages = sdkNames.filter(
      (sdkName) => !successfulPackages.includes(sdkName)
    );
    console.error(
      red(
        `The following SDK packages failed to publish ${failedPackages.join(
          ', '
        )}.`
      )
    );
    console.error(red('Creating failed packages file.'));
    fs.writeFileSync(
      path.join(__dirname, 'failedSDKs.json'),
      JSON.stringify({ packages: failedPackages, version: undefined, publish })
    );
    console.error(red(`Fix failed packages and try again.`));
    process.exit(1);
  }

  const failedJsonPath = path.join(__dirname, 'failedSDKs.json');
  if (fs.existsSync(failedJsonPath)) {
    fs.unlinkSync(failedJsonPath);
  }

  const allPackagePaths = findPackagePaths(
    path.join(__dirname, '..', 'packages')
  );

  // Finally we update all the packages across the monorepo
  // to use the most recent sdk packages.
  allPackagePaths.forEach((path) => {
    const json = readPackageJson(path);
    let packageChanged = false;
    const isSdk = sdkNames.includes(json.name);

    if (isSdk) {
      json.version = `${newVersion}-dev`;
      packageChanged = true;
    }

    for (const depName in json.dependencies) {
      if (sdkNames.includes(depName)) {
        const suffix =
          json.dependencies[depName].includes('-dev') || isSdk ? '-dev' : '';
        json.dependencies[depName] = `${newVersion}${suffix}`;
        packageChanged = true;
      }
    }
    for (const depName in json.devDependencies) {
      if (sdkNames.includes(depName)) {
        const suffix =
          json.devDependencies[depName].includes('-dev') || isSdk ? '-dev' : '';
        json.devDependencies[depName] = `${newVersion}${suffix}`;
        packageChanged = true;
      }
    }
    if (packageChanged) {
      writePackageJson(path, json);
    }
  });
})();

async function getAnswers(): Promise<Answers> {
  try {
    const json = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'failedSDKs.json')).toString()
    ) as Answers;
    console.log(
      green('Detected failed SDKs file. Attempting to republish failed SDKs.')
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
        description: green(`Should the sdks also be published? y/n/dry-run`),
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
