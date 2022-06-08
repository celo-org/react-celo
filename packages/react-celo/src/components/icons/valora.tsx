import React from 'react';

const VALORA: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 256 256"
    {...props}
  >
    <defs>
      <radialGradient
        id="f"
        cx="33.9%"
        cy="6.9%"
        r="38.6%"
        fx="33.9%"
        fy="6.9%"
        gradientTransform="rotate(68.4 .4 .1) scale(1 1.748)"
      >
        <stop offset="0%" stopColor="#00E09D" />
        <stop offset="23.1%" stopColor="#00E09D" stopOpacity=".9" />
        <stop offset="100%" stopColor="#3BEB9F" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        id="g"
        cx="102.2%"
        cy="53.7%"
        r="43.7%"
        fx="102.2%"
        fy="53.7%"
        gradientTransform="matrix(.67893 .7342 -.9508 .87921 .8 -.7)"
      >
        <stop offset="0%" stopColor="#19CF7A" />
        <stop offset="100%" stopColor="#82D148" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        id="h"
        cx="57.9%"
        cy="99.8%"
        r="34.6%"
        fx="57.9%"
        fy="99.8%"
        gradientTransform="matrix(-.193 -.981 1.271 -.25 -.6 1.8)"
      >
        <stop offset="0%" stopColor="#F79A0F" />
        <stop offset="31.7%" stopColor="#F4A227" stopOpacity=".9" />
        <stop offset="100%" stopColor="#E6C832" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        id="j"
        cx="61.3%"
        cy="39.9%"
        r="17.9%"
        fx="61.3%"
        fy="39.9%"
        gradientTransform="matrix(.6046 .79653 -1.17647 .893 .7 -.4)"
      >
        <stop offset="0%" stopColor="#73D444" />
        <stop offset="33.5%" stopColor="#73D444" stopOpacity=".5" />
        <stop offset="100%" stopColor="#73D444" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        id="k"
        cx="90.1%"
        cy="45.1%"
        r="34.2%"
        fx="90.1%"
        fy="45.1%"
        gradientTransform="rotate(93.3 .9 .4) scale(1 .878)"
      >
        <stop offset="0%" stopColor="#00CF5C" />
        <stop offset="35.1%" stopColor="#00CF5C" stopOpacity=".8" />
        <stop offset="62.8%" stopColor="#00D05B" stopOpacity=".3" />
        <stop offset="100%" stopColor="#00D05B" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        id="l"
        cx="16%"
        cy="11.7%"
        r="52.9%"
        fx="16%"
        fy="11.7%"
        gradientTransform="matrix(.642 .767 -1.29 1.08 .2 -.1)"
      >
        <stop offset="0%" stopColor="#FFF" stopOpacity=".7" />
        <stop offset="84.6%" stopColor="#FFF" stopOpacity=".1" />
        <stop offset="100%" stopColor="#FFF" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="c" x1="46.5%" x2="67.4%" y1="55.3%" y2="32.9%">
        <stop offset="0%" stopColor="#35D07F" stopOpacity="0" />
        <stop offset="100%" stopColor="#00D063" />
      </linearGradient>
      <linearGradient id="d" x1="47.3%" x2="76.6%" y1="98%" y2="16%">
        <stop offset="0%" stopColor="#F8CD0C" />
        <stop offset="29.2%" stopColor="#F2CE27" />
        <stop offset="100%" stopColor="#86D23C" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="e" x1=".3%" x2="64.5%" y1="54.9%" y2="18.9%">
        <stop offset="0%" stopColor="#FDEB3F" />
        <stop offset="100%" stopColor="#FBC74B" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="i" x1="23.2%" x2="27.7%" y1="8.2%" y2="24.2%">
        <stop offset="0%" stopColor="#39E2A4" />
        <stop offset="100%" stopColor="#67E290" stopOpacity="0" />
      </linearGradient>
      <path id="b" d="M-82-82h420v420H-82z" />
      <path
        id="m"
        d="M142.2 206.2c6.8-53.5 31.9-83.9 69.7-111.5l-19.3-25.6c-24.8 19-51.8 46.1-64.3 83.4C118 122 96.7 95.3 62.3 69L42 95.3c43 30.7 64.6 65.1 70.5 111h29.6z"
      />
      <clipPath id="a">
        <path d="M166.7 0c25.7 0 38.6 0 52.4 4.4a54.4 54.4 0 0132.5 32.5c4.4 13.8 4.4 26.7 4.4 52.4v77.4c0 25.7 0 38.6-4.4 52.4a54.4 54.4 0 01-32.5 32.5c-13.8 4.4-26.7 4.4-52.4 4.4H89.3c-25.7 0-38.6 0-52.4-4.4a54.4 54.4 0 01-32.5-32.5C0 205.3 0 192.4 0 166.7V89.3c0-25.7 0-38.6 4.4-52.4A54.4 54.4 0 0136.9 4.4C50.7 0 63.6 0 89.3 0h77.4z" />
      </clipPath>
      <filter
        id="n"
        width="140%"
        height="149.6%"
        x="-20%"
        y="-21.2%"
        filterUnits="objectBoundingBox"
      >
        <feOffset dy="5" in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur
          in="shadowOffsetOuter1"
          result="shadowBlurOuter1"
          stdDeviation="10.5"
        />
        <feColorMatrix
          in="shadowBlurOuter1"
          result="shadowMatrixOuter1"
          values="0 0 0 0 0.0454666095 0 0 0 0 0.692623415 0 0 0 0 0.418861661 0 0 0 0.1 0"
        />
        <feOffset dy="1" in="SourceAlpha" result="shadowOffsetOuter2" />
        <feGaussianBlur
          in="shadowOffsetOuter2"
          result="shadowBlurOuter2"
          stdDeviation="2.5"
        />
        <feColorMatrix
          in="shadowBlurOuter2"
          result="shadowMatrixOuter2"
          values="0 0 0 0 0.100878734 0 0 0 0 0.550724638 0 0 0 0 0.389331606 0 0 0 0.07 0"
        />
        <feMerge>
          <feMergeNode in="shadowMatrixOuter1" />
          <feMergeNode in="shadowMatrixOuter2" />
        </feMerge>
      </filter>
    </defs>
    <g clipPath="url(#a)">
      <rect width={10} height={10} fill="red" />
      <use fill="#35D07F" xlinkHref="#b" />
      <use fill="url(#c)" xlinkHref="#b" fillOpacity=".8" />
      <use fill="url(#d)" xlinkHref="#b" />
      <use fill="url(#e)" xlinkHref="#b" />
      <use fill="url(#f)" xlinkHref="#b" />
      <use fill="url(#g)" xlinkHref="#b" />
      <use fill="url(#h)" xlinkHref="#b" />
      <use fill="url(#i)" xlinkHref="#b" />
      <use fill="url(#j)" xlinkHref="#b" fillOpacity=".6" />
      <use fill="url(#k)" xlinkHref="#b" />
      <path fill="url(#l)" fillOpacity=".5" d="M-100-100h455v455h-455z" />
      <use xlinkHref="#m" filter="url(#n)" />
      <use fill="#FFF" xlinkHref="#m" />
    </g>
  </svg>
);
export default VALORA;
