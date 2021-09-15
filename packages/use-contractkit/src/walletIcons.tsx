import React from 'react';

export const LEDGER: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 100 100"
    fill="#142533"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M82.9042 0.974667H37.6792V61.9862H98.7403V16.7612C98.7403 8.09847 91.6116 0.974667 82.9538 0.974667C82.9389 0.974667 82.919 0.974667 82.9042 0.974667V0.974667Z" />
    <path d="M23.5805 0.97467H15.7865C7.12876 0.97467 0 8.10343 0 16.7612V24.5552H23.5805V0.97467Z" />
    <path d="M0 38.6539H23.5805V62.2344H0V38.6539Z" />
    <path d="M75.3584 99.715H83.1524C91.8151 99.715 98.9389 92.5862 98.9389 83.9284C98.9389 83.9136 98.9389 83.8937 98.9389 83.8788V76.333H75.3584V99.715Z" />
    <path d="M37.6792 76.333H61.2597V99.9136H37.6792V76.333Z" />
    <path d="M0 76.333V84.127C0 92.7848 7.12876 99.9136 15.7865 99.9136H23.5805V76.333H0Z" />
  </svg>
);

export const ETHEREUM: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    version="1.1"
    shapeRendering="geometricPrecision"
    textRendering="geometricPrecision"
    imageRendering="optimizeQuality"
    fillRule="evenodd"
    clipRule="evenodd"
    viewBox="0 0 784.37 1277.39"
    {...props}
  >
    <g id="Layer_x0020_1">
      <metadata id="CorelCorpID_0Corel-Layer" />
      <g id="_1421394342400">
        <g>
          <polygon
            fill="#343434"
            fillRule="nonzero"
            points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54 "
          />
          <polygon
            fill="#8C8C8C"
            fillRule="nonzero"
            points="392.07,0 -0,650.54 392.07,882.29 392.07,472.33 "
          />
          <polygon
            fill="#3C3C3B"
            fillRule="nonzero"
            points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89 "
          />
          <polygon
            fill="#8C8C8C"
            fillRule="nonzero"
            points="392.07,1277.38 392.07,956.52 -0,724.89 "
          />
          <polygon
            fill="#141414"
            fillRule="nonzero"
            points="392.07,882.29 784.13,650.54 392.07,472.33 "
          />
          <polygon
            fill="#393939"
            fillRule="nonzero"
            points="0,650.54 392.07,882.29 392.07,472.33 "
          />
        </g>
      </g>
    </g>
  </svg>
);

export const PRIVATE_KEY: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    className="dark:tw-text-gray-300"
    style={{ height: '24px', width: '24px' }}
    aria-hidden="true"
    focusable="false"
    data-prefix="fas"
    data-icon="key"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    {...props}
  >
    <path
      fill="currentColor"
      d="M512 176.001C512 273.203 433.202 352 336 352c-11.22 0-22.19-1.062-32.827-3.069l-24.012 27.014A23.999 23.999 0 0 1 261.223 384H224v40c0 13.255-10.745 24-24 24h-40v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24v-78.059c0-6.365 2.529-12.47 7.029-16.971l161.802-161.802C163.108 213.814 160 195.271 160 176 160 78.798 238.797.001 335.999 0 433.488-.001 512 78.511 512 176.001zM336 128c0 26.51 21.49 48 48 48s48-21.49 48-48-21.49-48-48-48-48 21.49-48 48z"
    ></path>
  </svg>
);

export const WALLETCONNECT: React.FC<React.SVGProps<SVGSVGElement>> = (
  props
) => (
  <svg
    width="300px"
    height="185px"
    viewBox="0 0 300 185"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="walletconnect-logo-alt" fill="#3B99FC" fillRule="nonzero">
        <path
          d="M61.4385429,36.2562612 C110.349767,-11.6319051 189.65053,-11.6319051 238.561752,36.2562612 L244.448297,42.0196786 C246.893858,44.4140867 246.893858,48.2961898 244.448297,50.690599 L224.311602,70.406102 C223.088821,71.6033071 221.106302,71.6033071 219.883521,70.406102 L211.782937,62.4749541 C177.661245,29.0669724 122.339051,29.0669724 88.2173582,62.4749541 L79.542302,70.9685592 C78.3195204,72.1657633 76.337001,72.1657633 75.1142214,70.9685592 L54.9775265,51.2530561 C52.5319653,48.8586469 52.5319653,44.9765439 54.9775265,42.5821357 L61.4385429,36.2562612 Z M280.206339,77.0300061 L298.128036,94.5769031 C300.573585,96.9713 300.573599,100.85338 298.128067,103.247793 L217.317896,182.368927 C214.872352,184.763353 210.907314,184.76338 208.461736,182.368989 C208.461726,182.368979 208.461714,182.368967 208.461704,182.368957 L151.107561,126.214385 C150.496171,125.615783 149.504911,125.615783 148.893521,126.214385 C148.893517,126.214389 148.893514,126.214393 148.89351,126.214396 L91.5405888,182.368927 C89.095052,184.763359 85.1300133,184.763399 82.6844276,182.369014 C82.6844133,182.369 82.684398,182.368986 82.6843827,182.36897 L1.87196327,103.246785 C-0.573596939,100.852377 -0.573596939,96.9702735 1.87196327,94.5758653 L19.7936929,77.028998 C22.2392531,74.6345898 26.2042918,74.6345898 28.6498531,77.028998 L86.0048306,133.184355 C86.6162214,133.782957 87.6074796,133.782957 88.2188704,133.184355 C88.2188796,133.184346 88.2188878,133.184338 88.2188969,133.184331 L145.571,77.028998 C148.016505,74.6345347 151.981544,74.6344449 154.427161,77.028798 C154.427195,77.0288316 154.427229,77.0288653 154.427262,77.028899 L211.782164,133.184331 C212.393554,133.782932 213.384814,133.782932 213.996204,133.184331 L271.350179,77.0300061 C273.79574,74.6355969 277.760778,74.6355969 280.206339,77.0300061 Z"
          id="WalletConnect"
        ></path>
      </g>
    </g>
  </svg>
);

export const METAMASK: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 318.6 318.6"
    {...props}
  >
    <style type="text/css">{`
        .st0{fill:#E2761B;stroke:#E2761B;stroke-linecap:round;stroke-linejoin:round;}
        .st1{fill:#E4761B;stroke:#E4761B;stroke-linecap:round;stroke-linejoin:round;}
        .st2{fill:#D7C1B3;stroke:#D7C1B3;stroke-linecap:round;stroke-linejoin:round;}
        .st3{fill:#233447;stroke:#233447;stroke-linecap:round;stroke-linejoin:round;}
        .st4{fill:#CD6116;stroke:#CD6116;stroke-linecap:round;stroke-linejoin:round;}
        .st5{fill:#E4751F;stroke:#E4751F;stroke-linecap:round;stroke-linejoin:round;}
        .st6{fill:#F6851B;stroke:#F6851B;stroke-linecap:round;stroke-linejoin:round;}
        .st7{fill:#C0AD9E;stroke:#C0AD9E;stroke-linecap:round;stroke-linejoin:round;}
        .st8{fill:#161616;stroke:#161616;stroke-linecap:round;stroke-linejoin:round;}
        .st9{fill:#763D16;stroke:#763D16;stroke-linecap:round;stroke-linejoin:round;}
    `}</style>
    <polygon className="st0" points="274.1,35.5 174.6,109.4 193,65.8 " />
    <g>
      <polygon className="st1" points="44.4,35.5 143.1,110.1 125.6,65.8 	" />
      <polygon
        className="st1"
        points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7 	"
      />
      <polygon
        className="st1"
        points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8 	"
      />
      <polygon
        className="st1"
        points="103.6,138.2 87.8,162.1 144.1,164.6 142.1,104.1 	"
      />
      <polygon
        className="st1"
        points="214.9,138.2 175.9,103.4 174.6,164.6 230.8,162.1 	"
      />
      <polygon className="st1" points="106.8,247.4 140.6,230.9 111.4,208.1 	" />
      <polygon className="st1" points="177.9,230.9 211.8,247.4 207.1,208.1 	" />
    </g>
    <g>
      <polygon
        className="st2"
        points="211.8,247.4 177.9,230.9 180.6,253 180.3,262.3 	"
      />
      <polygon
        className="st2"
        points="106.8,247.4 138.3,262.3 138.1,253 140.6,230.9 	"
      />
    </g>
    <polygon className="st3" points="138.8,193.5 110.6,185.2 130.5,176.1 " />
    <polygon className="st3" points="179.7,193.5 188,176.1 208,185.2 " />
    <g>
      <polygon className="st4" points="106.8,247.4 111.6,206.8 80.3,207.7 	" />
      <polygon className="st4" points="207,206.8 211.8,247.4 238.3,207.7 	" />
      <polygon
        className="st4"
        points="230.8,162.1 174.6,164.6 179.8,193.5 188.1,176.1 208.1,185.2 	"
      />
      <polygon
        className="st4"
        points="110.6,185.2 130.6,176.1 138.8,193.5 144.1,164.6 87.8,162.1 	"
      />
    </g>
    <g>
      <polygon className="st5" points="87.8,162.1 111.4,208.1 110.6,185.2 	" />
      <polygon className="st5" points="208.1,185.2 207.1,208.1 230.8,162.1 	" />
      <polygon
        className="st5"
        points="144.1,164.6 138.8,193.5 145.4,227.6 146.9,182.7 	"
      />
      <polygon
        className="st5"
        points="174.6,164.6 171.9,182.6 173.1,227.6 179.8,193.5 	"
      />
    </g>
    <polygon
      className="st6"
      points="179.8,193.5 173.1,227.6 177.9,230.9 207.1,208.1 208.1,185.2 "
    />
    <polygon
      className="st6"
      points="110.6,185.2 111.4,208.1 140.6,230.9 145.4,227.6 138.8,193.5 "
    />
    <polygon
      className="st7"
      points="180.3,262.3 180.6,253 178.1,250.8 140.4,250.8 138.1,253 138.3,262.3 106.8,247.4 117.8,256.4 
	140.1,271.9 178.4,271.9 200.8,256.4 211.8,247.4 "
    />
    <polygon
      className="st8"
      points="177.9,230.9 173.1,227.6 145.4,227.6 140.6,230.9 138.1,253 140.4,250.8 178.1,250.8 180.6,253 "
    />
    <g>
      <polygon
        className="st9"
        points="278.3,114.2 286.8,73.4 274.1,35.5 177.9,106.9 214.9,138.2 267.2,153.5 278.8,140 273.8,136.4 
		281.8,129.1 275.6,124.3 283.6,118.2 	"
      />
      <polygon
        className="st9"
        points="31.8,73.4 40.3,114.2 34.9,118.2 42.9,124.3 36.8,129.1 44.8,136.4 39.8,140 51.3,153.5 103.6,138.2 
		140.6,106.9 44.4,35.5 	"
      />
    </g>
    <polygon
      className="st6"
      points="267.2,153.5 214.9,138.2 230.8,162.1 207.1,208.1 238.3,207.7 284.8,207.7 "
    />
    <polygon
      className="st6"
      points="103.6,138.2 51.3,153.5 33.9,207.7 80.3,207.7 111.4,208.1 87.8,162.1 "
    />
    <polygon
      className="st6"
      points="174.6,164.6 177.9,106.9 193.1,65.8 125.6,65.8 140.6,106.9 144.1,164.6 145.3,182.8 145.4,227.6 
	173.1,227.6 173.3,182.8 "
    />
  </svg>
);

export const CELO: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    id="Celo_Rings"
    data-name="Celo Rings"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 950 950"
    {...props}
  >
    <defs>
      <style>{`.cls-1{fill:#fbcc5c;}.cls-2{fill:#35d07f;}.cls-3{fill:#5ea33b;}`}</style>
    </defs>
    <path
      id="Bottom_Ring"
      data-name="Bottom Ring"
      className="cls-1"
      d="M375,850c151.88,0,275-123.12,275-275S526.88,300,375,300,100,423.12,100,575,223.12,850,375,850Zm0,100C167.9,950,0,782.1,0,575S167.9,200,375,200,750,367.9,750,575,582.1,950,375,950Z"
    />
    <path
      id="Top_Ring"
      data-name="Top Ring"
      className="cls-2"
      d="M575,650c151.88,0,275-123.12,275-275S726.88,100,575,100,300,223.12,300,375,423.12,650,575,650Zm0,100c-207.1,0-375-167.9-375-375S367.9,0,575,0,950,167.9,950,375,782.1,750,575,750Z"
    />
    <path
      id="Rings_Overlap"
      data-name="Rings Overlap"
      className="cls-3"
      d="M587.39,750a274.38,274.38,0,0,0,54.55-108.06A274.36,274.36,0,0,0,750,587.4a373.63,373.63,0,0,1-29.16,133.45A373.62,373.62,0,0,1,587.39,750ZM308.06,308.06A274.36,274.36,0,0,0,200,362.6a373.63,373.63,0,0,1,29.16-133.45A373.62,373.62,0,0,1,362.61,200,274.38,274.38,0,0,0,308.06,308.06Z"
    />
  </svg>
);

export const VALORA: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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

export const CHROME_EXTENSION_STORE: React.FC<React.SVGProps<SVGSVGElement>> = (
  props
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 2225.3 1921.9"
    {...props}
  >
    <path
      fill="#EEE"
      d="M1365.5 404.7H859.8a101.2 101.2 0 110-202.3h505.7a101.2 101.2 0 110 202.3zM0 0v1770.2c0 83.4 68.3 151.7 151.7 151.7h1921.9c83.4 0 151.7-68.3 151.7-151.7V0H0z"
    />
    <path
      fill="#DB4437"
      d="M1112.7 809.2a960 960 0 00-808.3 441.1v671.5h468.5l339.8-588.6h856.1a961.1 961.1 0 00-856.1-524z"
    />
    <path
      fill="#0F9D58"
      d="M304.1 1250.7a956.8 956.8 0 00-152.4 519.5c0 51.6 4.1 102.3 12 151.7h531.8l-391.4-671.2z"
    />
    <path
      fill="#FFCD40"
      d="M2073.6 1770.2a957.3 957.3 0 00-104.8-436.9h-856.1l339.8 588.6h609.1c7.9-49.4 12-100.1 12-151.7z"
    />
    <path
      fill="#F1F1F1"
      d="M1112.7 1333.3A436.8 436.8 0 00703 1921.9h94.8a349.5 349.5 0 11629.8 0h94.8a436.9 436.9 0 00-409.7-588.6z"
    />
    <path
      fill="#4285F4"
      d="M1112.7 1420.7a349.5 349.5 0 00-314.9 501.2h629.8a349.5 349.5 0 00-314.9-501.2z"
    />
    <path
      opacity=".1"
      fill="#212121"
      d="M0 0v961h2225.3V0H0zm1365.5 404.7H859.8a101.2 101.2 0 110-202.3h505.8a101.2 101.2 0 11-.1 202.3z"
    />
    <path opacity=".1" fill="#FFF" d="M0 961h2225.3v12.7H0z" />
    <path
      opacity=".1"
      fill="#231F20"
      d="M2073.6 1909.2H151.7A152.1 152.1 0 010 1757.5v12.7c0 83.4 68.3 151.7 151.7 151.7h1921.9c83.4 0 151.7-68.3 151.7-151.7v-12.7c0 83.5-68.3 151.7-151.7 151.7zM859.8 202.3h505.7a101 101 0 01100.8 94.8c.1-2.1.4-4.2.4-6.3 0-55.9-45.3-101.2-101.2-101.2H859.8A101.2 101.2 0 00759 297.1a101 101 0 01100.8-94.8z"
    />
  </svg>
);

export const CELO_DANCE: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="981px"
    height="981px"
    viewBox="0 0 981 981"
    fill="#FFFFFF"
    style={{ height: '42px', width: '42px' }}
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect id="rect" x="0" y="0" width="981" height="981" />
    <circle id="circle" cx="491.5" cy="492.5" r="490.5" />
    <g
      id="celo-dance-logo"
      transform="translate(186.000000, 133.000000)"
      fillRule="nonzero"
    >
      <path
        d="M349.163656,1.4449387 L349.304628,1.47285884 L350.685868,1.77470983 C389.228485,10.5027046 414.07897,42.1708161 424.446224,94.3965604 C433.789216,141.462517 431.593734,200.144602 417.706441,288.030601 L416.645703,294.689122 L384.305659,286.360393 L385.225205,280.586604 C398.053519,199.349284 399.668557,145.069275 390.936153,101.0792 C383.184513,62.0297841 367.551523,40.8627788 343.439933,35.2438135 L342.706672,35.0782962 L341.928883,34.9500152 C312.348086,30.3343676 279.578633,51.0726422 248.450135,97.1622967 C151.061871,242.043447 151.992334,378.820985 251.015705,510.010643 L253.195591,512.898633 L227.370986,533.028675 L225.122297,530.049532 C116.76727,386.496967 114.697919,234.034487 219.773387,77.7174089 L220.952702,75.9833192 C259.390815,19.8580126 303.430253,-6.00915158 347.603565,1.17765636 L349.163656,1.4449387 Z"
        id="路径"
        fill="#34D07F"
      />
      <polygon
        id="rol"
        fill="#34D07F"
        points="342.641587 35.0632364 342.706672 35.0782962 342.754287 35.0857764"
      />
      <path
        d="M221.888901,552.777973 C291.18123,504.138534 336.63714,442.377915 368.638271,348.754758 L369.723331,345.580287 L403.289636,353.734796 L401.987557,357.544184 C367.460991,458.5558 316.257964,528.596903 241.315131,580.952984 L238.813229,582.688315 L238.68412,582.773378 L236.844034,583.930945 C184.400832,616.775409 139.103289,632.394177 100.703193,631.269394 C70.3219369,630.379492 45.3078614,619.102372 26.7543796,598.850806 C20.6410128,592.177921 15.5364576,584.839016 11.4709437,577.043375 C10.1177919,574.448701 8.93755078,571.908825 7.93701105,569.459604 C7.67638413,568.821616 7.43481586,568.206271 7.21087601,567.610878 L6.91476291,566.806594 L6.67912632,566.138419 L6.004201,564.124707 C-4.2046692,532.567315 -0.404627315,491.973173 17.503564,451.90644 C37.5233302,407.115393 73.6755368,365.504848 124.156326,332.325375 L129.15602,329.039229 L133.253233,365.360918 L131.677279,366.627811 C89.8890189,400.220951 61.3336729,435.995188 46.269549,471.245829 C33.0391022,502.205592 30.8810915,531.558051 38.8977754,554.735478 L39.0859994,555.273258 L39.3009226,555.843554 L39.5483467,556.464551 L39.7511014,556.953274 C40.3135392,558.288039 40.9828481,559.707003 41.7507542,561.179466 C44.4472281,566.349967 47.8597813,571.255939 51.9207433,575.688576 C64.2480523,589.144126 80.5990063,596.420497 101.701262,597.038607 C132.792592,597.949307 171.898177,584.195138 218.535551,555.016156 L219.95111,554.127222 L221.888901,552.777973 Z"
        id="路径"
        fill="#F8C550"
      />
      <path
        d="M196.80185,339.367619 L192.599454,340.356845 L190.176449,306.196521 L193.22151,305.479727 C348.680804,268.885287 473.617926,302.640626 567.246843,406.791927 C593.822457,436.354214 608.859042,467.628279 611.915605,499.140614 C614.498344,525.767967 608.321946,551.658699 594.539262,573.458608 C590.941492,579.149159 586.335121,585.194663 581.826019,589.961689 C576.45178,595.643339 569.242881,601.69719 564.090876,604.962985 C502.389146,644.074966 406.756618,633.188533 285.649546,572.20821 L280.939397,569.836536 L304.859619,547.517359 L307.147024,548.669123 C413.335165,602.137404 493.641301,609.100782 545.828304,576.020071 C548.570552,574.281793 553.609962,570.017278 557.031104,566.400443 C559.928224,563.337605 563.264902,558.946602 565.679033,555.128198 C575.405432,539.744068 579.751764,521.45249 577.909019,502.454284 C575.580369,478.446537 563.611793,453.907516 541.863845,429.715449 C457.287528,335.634112 341.17028,305.38392 196.80185,339.367619 Z"
        id="路径"
        fill="#2C92F0"
      />
    </g>
  </svg>
);
