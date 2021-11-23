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
