import * as child_process from 'child_process';
import { green, red, yellow } from 'colors';
import * as path from 'path';
import { get, RevalidatorSchema, start } from 'prompt';
import { valid } from 'semver';

import { findPackagePaths, readPackageJson } from './utils';

void (async function () {
  start();
  const prompts: RevalidatorSchema[] = [
    {
      name: 'version',
      description: green('Which sdk version do you want to deprecate?'),
    },
    {
      name: 'message',
      description: green('Reason for deprecation:'),
    },
  ];
  const { version, message } = await get<{ version: string; message: string }>(
    prompts
  );
  if (!valid(version)) {
    console.error(red('Invalid version'));
    process.exit(1);
  }
  const sdkPackagePaths = findPackagePaths(
    path.join(__dirname, '..', 'packages', 'sdk')
  );
  const sdkJsons = sdkPackagePaths.map(readPackageJson);
  const otpPrompt = [
    {
      name: 'newOtp',
      description: green(`Enter 2FA code`),
    },
  ];

  let otp = '';
  for (const sdkJson of sdkJsons) {
    let { newOtp } = await get<{ newOtp: string }>(otpPrompt);
    if (!newOtp) {
      newOtp = otp;
    } else {
      otp = newOtp;
    }
    const buffer = child_process.execSync(
      `npm info ${sdkJson.name} versions --json`
    );
    const versions = JSON.parse(buffer.toString()) as string[];
    if (!versions.includes(version)) {
      console.log(
        yellow(`Version ${version} does not exist for ${sdkJson.name}.`)
      );
    } else {
      try {
        child_process.execSync(
          `npm deprecate ${sdkJson.name}@${version} '${message}' --otp ${newOtp}`
        );
        console.log(
          green(`${sdkJson.name}@${version} deprecated with message ${message}`)
        );
      } catch (e) {
        console.error(
          red(`${sdkJson.name} failed to deprecate version ${version}.`)
        );
        console.error(e);
      }
    }
  }
})();
