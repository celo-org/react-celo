import React from 'react';
import { isMobile } from 'react-device-detect';

import { Platform } from '../constants';
import cls from '../utils/tailwind';
import Button from './button';
import { CopyText } from './copy';
import PrettyQrCode from './qrcode';

const styles = cls({
  contentContainer: `
    tw-flex
    tw-flex-col
    tw-items-center
    tw-flex-grow
    justify-center`,
  desktopContainer: `
    tw-flex
    tw-items-center
    tw-gap-9`,
  desktopSectionName: `
    tw-text-lg
    tw-mt-4`,
  desktopButton: `
    tw-px-6
    tw-py-4
    tw-flex
    tw-flex-col
    tw-items-center
    tw-grow
    tw-rounded-md
    tw-transition
    focus:tw-outline-none
    tw-will-change-transform
    tw-scale-100
    active:tw-scale-95`,
  desktopDisclaimer: `
    tw-text-center
    tw-text-sm
    tw-pb-4`,
  mobileDisclaimer: `
    tw-text-center
    tw-text-md
    tw-pb-4`,
  desktopCopyContainer: `
    tw-flex
    tw-items-center
    tw-justify-center`,
});

export function Fallback({ uri, appName }: { uri: string; appName: string }) {
  return (
    <div data-testid="PLATFORM-SELECTOR-FALLBACK">
      <div className={styles.desktopContainer}>
        <span className={styles.desktopDisclaimer}>
          {appName} doesn't seem to support deeplinking, but you can still copy
          the wallet-connect URI to connect.
        </span>
      </div>
      <div className={styles.desktopCopyContainer}>
        <CopyText text="Copy to clipboard" payload={uri} />
      </div>
    </div>
  );
}

export function PlatformSelector({
  uri,
  platforms = [],
  onClick,
}: {
  uri: string;
  platforms: Platform[];
  onClick: (platform: Platform) => void;
}) {
  return (
    <div data-testid="PLATFORM-SELECTOR-PLATFORMS">
      <div className={styles.desktopContainer}>
        {platforms.map((platform) => (
          <button
            onClick={() => onClick(platform)}
            className={styles.desktopButton}
            key={platform}
          >
            {platform === Platform.Web ? <WebIcon /> : <DesktopIcon />}
            <div className={styles.desktopSectionName}>{platform}</div>
          </button>
        ))}
      </div>
      <div className={styles.desktopCopyContainer}>
        <CopyText text="Copy to clipboard" payload={uri} />
      </div>
    </div>
  );
}

export function NativeMobile({
  uri,
  appName,
}: {
  uri: string;
  appName: string;
}) {
  return (
    <div
      data-testid="PLATFORM-SELECTOR-NATIVE-MOBILE"
      className={styles.contentContainer}
    >
      <span className={styles.mobileDisclaimer}>
        Switching to {appName}…
        <br />
        If it doesn't open automatically, please use the button below
      </span>
      <Button as="a" href={uri} target="_blank" rel="noreferrer">
        Open in {appName}
      </Button>
    </div>
  );
}

export function QrCode({ uri }: { uri: string }) {
  return (
    <div data-testid="PLATFORM-SELECTOR-QR-CODE">
      <PrettyQrCode value={uri} size={isMobile ? 200 : 340} />
    </div>
  );
}

function WebIcon() {
  // From bootstrap
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="60"
      height="60"
      fill="#2E3338"
      className="tw-fill-current"
      viewBox="0 0 16 16"
    >
      <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855-.143.268-.276.56-.395.872.705.157 1.472.257 2.282.287V1.077zM4.249 3.539c.142-.384.304-.744.481-1.078a6.7 6.7 0 0 1 .597-.933A7.01 7.01 0 0 0 3.051 3.05c.362.184.763.349 1.198.49zM3.509 7.5c.036-1.07.188-2.087.436-3.008a9.124 9.124 0 0 1-1.565-.667A6.964 6.964 0 0 0 1.018 7.5h2.49zm1.4-2.741a12.344 12.344 0 0 0-.4 2.741H7.5V5.091c-.91-.03-1.783-.145-2.591-.332zM8.5 5.09V7.5h2.99a12.342 12.342 0 0 0-.399-2.741c-.808.187-1.681.301-2.591.332zM4.51 8.5c.035.987.176 1.914.399 2.741A13.612 13.612 0 0 1 7.5 10.91V8.5H4.51zm3.99 0v2.409c.91.03 1.783.145 2.591.332.223-.827.364-1.754.4-2.741H8.5zm-3.282 3.696c.12.312.252.604.395.872.552 1.035 1.218 1.65 1.887 1.855V11.91c-.81.03-1.577.13-2.282.287zm.11 2.276a6.696 6.696 0 0 1-.598-.933 8.853 8.853 0 0 1-.481-1.079 8.38 8.38 0 0 0-1.198.49 7.01 7.01 0 0 0 2.276 1.522zm-1.383-2.964A13.36 13.36 0 0 1 3.508 8.5h-2.49a6.963 6.963 0 0 0 1.362 3.675c.47-.258.995-.482 1.565-.667zm6.728 2.964a7.009 7.009 0 0 0 2.275-1.521 8.376 8.376 0 0 0-1.197-.49 8.853 8.853 0 0 1-.481 1.078 6.688 6.688 0 0 1-.597.933zM8.5 11.909v3.014c.67-.204 1.335-.82 1.887-1.855.143-.268.276-.56.395-.872A12.63 12.63 0 0 0 8.5 11.91zm3.555-.401c.57.185 1.095.409 1.565.667A6.963 6.963 0 0 0 14.982 8.5h-2.49a13.36 13.36 0 0 1-.437 3.008zM14.982 7.5a6.963 6.963 0 0 0-1.362-3.675c-.47.258-.995.482-1.565.667.248.92.4 1.938.437 3.008h2.49zM11.27 2.461c.177.334.339.694.482 1.078a8.368 8.368 0 0 0 1.196-.49 7.01 7.01 0 0 0-2.275-1.52c.218.283.418.597.597.932zm-.488 1.343a7.765 7.765 0 0 0-.395-.872C9.835 1.897 9.17 1.282 8.5 1.077V4.09c.81-.03 1.577-.13 2.282-.287z" />
    </svg>
  );
}

function DesktopIcon() {
  // From bootstrap
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="60"
      height="60"
      className="tw-fill-current"
      viewBox="0 0 16 16"
    >
      <path d="M0 4s0-2 2-2h12s2 0 2 2v6s0 2-2 2h-4c0 .667.083 1.167.25 1.5H11a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1h.75c.167-.333.25-.833.25-1.5H2s-2 0-2-2V4zm1.398-.855a.758.758 0 0 0-.254.302A1.46 1.46 0 0 0 1 4.01V10c0 .325.078.502.145.602.07.105.17.188.302.254a1.464 1.464 0 0 0 .538.143L2.01 11H14c.325 0 .502-.078.602-.145a.758.758 0 0 0 .254-.302 1.464 1.464 0 0 0 .143-.538L15 9.99V4c0-.325-.078-.502-.145-.602a.757.757 0 0 0-.302-.254A1.46 1.46 0 0 0 13.99 3H2c-.325 0-.502.078-.602.145z" />
    </svg>
  );
}
