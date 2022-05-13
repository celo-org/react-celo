/**
  This QRCode generator is inspired from
  https://github.com/rainbow-me/rainbow-button/blob/master/src/components/qrcode/QRCode.tsx
  which is registered under the MIT license
 */

import { create, QRCodeErrorCorrectionLevel } from 'qrcode';
import React, { ReactElement, useMemo } from 'react';

import { QRCodeClass } from '../global';
import cls from '../utils/tailwind';

// From https://github.com/soldair/node-qrcode#qr-code-capacity
const qrCodeCapacity: [QRCodeErrorCorrectionLevel, number][] = [
  // ['H', 1273],
  // ['Q', 1663],
  ['M', 2331],
  ['L', 2953],
];

const generateMatrix = (value: string) => {
  const bytes = Buffer.from(value).byteLength;
  let i = 0;
  while (qrCodeCapacity[i][1] <= bytes) {
    i++;
  }
  const qrcode = create(value, {
    errorCorrectionLevel: qrCodeCapacity[i][0],
  }) as QRCodeClass;
  const arr = Array.from(qrcode.modules.data);
  const sqrt = Math.sqrt(arr.length);

  return arr.reduce((rows, key, index) => {
    if (index % sqrt === 0) {
      rows.push([key]);
    } else {
      rows[rows.length - 1].push(key);
    }
    return rows;
  }, [] as number[][]);
};

const BORDER_RADIUS = 2;
const CORNER_SQUARES = 3;
const MASK_SIZE = 7;

function matrixToCorners(
  matrix: ReturnType<typeof generateMatrix>,
  size: number
) {
  const rects = [] as ReactElement<SVGRectElement>[];
  const cellSize = size / matrix.length;
  const corners = [
    [0, 0],
    [1, 0],
    [0, 1],
  ];

  for (let index = 0; index < corners.length; index++) {
    const [x, y] = corners[index];
    const x1 = (matrix.length - MASK_SIZE) * cellSize * x;
    const y1 = (matrix.length - MASK_SIZE) * cellSize * y;

    for (let i = 0; i < CORNER_SQUARES; i++) {
      rects.push(
        <rect
          className={i % 2 !== 0 ? 'tw-fill-white' : 'tw-fill-black'}
          height={cellSize * (MASK_SIZE - i * 2)}
          key={`corner-${x}-${y}-${i}`}
          rx={(i - BORDER_RADIUS - 1) * -BORDER_RADIUS + (i === 0 ? 2 : 0)} // calculated border radius for corner squares
          ry={(i - BORDER_RADIUS - 1) * -BORDER_RADIUS + (i === 0 ? 2 : 0)} // calculated border radius for corner squares
          width={cellSize * (MASK_SIZE - i * 2)}
          x={x1 + cellSize * i}
          y={y1 + cellSize * i}
        />
      );
    }
  }

  return rects;
}

function matrixToDots(matrix: ReturnType<typeof generateMatrix>, size: number) {
  const dots: ReactElement<SVGCircleElement>[] = [];
  const cellSize = size / matrix.length;
  const matrixMiddleStart = matrix.length / 2;
  const matrixMiddleEnd = matrix.length / 2 - 1;

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      const data = matrix[i][j];
      if (!data) continue;

      if (
        !(
          (i < MASK_SIZE && j < MASK_SIZE) ||
          (i > matrix.length - (MASK_SIZE + 1) && j < MASK_SIZE) ||
          (i < MASK_SIZE && j > matrix.length - (MASK_SIZE + 1))
        )
      ) {
        if (
          !(
            i > matrixMiddleStart &&
            i < matrixMiddleEnd &&
            j > matrixMiddleStart &&
            j < matrixMiddleEnd &&
            i < j &&
            j < i + 1
          )
        ) {
          dots.push(
            <circle
              cx={i * cellSize + cellSize / 2}
              cy={j * cellSize + cellSize / 2}
              className="tw-fill-black"
              key={`circle-${i}-${j}`}
              r={cellSize / 3} // calculate size of single dots
            />
          );
        }
      }
    }
  }

  return dots;
}

const styles = cls({
  container: `
    tw-border-slate-100
    tw-border
    dark:tw-border-slate-700
    tw-relative
    tw-select-none
    tw-p-5
    tw-rounded-lg
    tw-bg-white`,
});

type Props = {
  size?: number;
  value: string;
};

const PrettyQrCode = ({ size = 200, value }: Props) => {
  const matrix = useMemo(() => generateMatrix(value), [value]);
  const corners = useMemo(() => matrixToCorners(matrix, size), [size, matrix]);
  const dots = useMemo(() => matrixToDots(matrix, size), [size, matrix]);

  return (
    <div className={styles.container}>
      <svg height={size} style={{ all: 'revert' }} width={size}>
        <rect fill="transparent" height={size} width={size} />
        {corners}
        {dots}
      </svg>
    </div>
  );
};

export default PrettyQrCode;
