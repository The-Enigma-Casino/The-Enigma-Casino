import { useState } from "react";
import styles from "./MachineComponent.module.css";

const GachaponMachine = () => {
  const [isMaskActive, setIsMaskActive] = useState(false);
  const [isSwitchActive, setIsSwitchActive] = useState(false);
  const [isEggActive, setIsEggActive] = useState(false);
  const [winner, setWinner] = useState("");
  const [lotteryList, setLotteryList] = useState<string[]>([]);

  const colors = ["#E5A0B9", "#F3D478", "#9DCFE0", "#B9AED4"];
  const [currentColor, setCurrentColor] = useState(colors[0]);

  const handleSwitchClick = () => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setCurrentColor(randomColor);
    setIsSwitchActive(true);
    setTimeout(() => setIsSwitchActive(false), 700);
    setIsEggActive(true);
  };

  const handleEggClick = () => {
    if (!lotteryList.length) {
      setWinner("Ganaste 😎");
      setIsMaskActive(true);
      return;
    }
    const luckyNum = Math.floor(Math.random() * lotteryList.length);
    const selectedWinner = lotteryList[luckyNum];
    setWinner(selectedWinner);
    setLotteryList((prev) => prev.filter((_, i) => i !== luckyNum));
    setIsEggActive(false);
    setIsMaskActive(true);
  };

  const handleMaskClick = () => {
    setIsMaskActive(false);
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.mask} ${isMaskActive ? styles.active : ""}`}
        onClick={handleMaskClick}
      >
        <div className={styles.winner}>{winner}</div>
        <svg viewBox="0 0 439 215" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M295.5 14.0103C400.3 15.2103 429.167 117.51 430.5 168.51C338.1 208.51 207.667 185.177 154 168.51C157.5 116.51 190.7 12.8103 295.5 14.0103Z" fill="white" stroke="#531028" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M99.1013 198.787C-10.8987 165.987 1.26801 68.7865 21.1013 24.2865C152.701 -28.5135 247.268 59.6199 278.101 110.287C264.268 153.453 209.101 231.587 99.1013 198.787Z"
            fill={currentColor}
          />
          <path d="M21.1013 24.2865C1.26801 68.7865 -10.8987 165.987 99.1013 198.787C209.101 231.587 264.268 153.453 278.101 110.287M21.1013 24.2865C152.701 -28.5135 247.268 59.6199 278.101 110.287M21.1013 24.2865C44.6013 69.2865 128.901 149.487 278.101 110.287" stroke="#531028" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className={styles.gachapon}>
        <svg
          className={`${styles.switch} ${isSwitchActive ? styles.active : ""}`}
          viewBox="0 0 154 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onClick={handleSwitchClick}
        >
          <circle
            cx="76.5828"
            cy="77.7004"
            r="43.5"
            transform="rotate(-45 76.5828 77.7004)"
            fill="#C6D2D5"
            stroke="#57162F"
            strokeWidth="10"
          />
          <path
            d="M32.7422 110.934C30.399 108.591 30.399 104.792 32.7422 102.449L101.732 33.4592C104.075 31.1161 107.874 31.1161 110.217 33.4592L120.117 43.3587C122.46 45.7018 122.46 49.5008 120.117 51.844L51.127 120.834C48.7838 123.177 44.9848 123.177 42.6417 120.834L32.7422 110.934Z"
            fill="#C6D2D5"
            stroke="#57162F"
            strokeWidth="10"
          />
        </svg>

        <svg
          className={styles.machine}
          viewBox="0 0 617 979" fill="none" xmlns="http://www.w3.org/2000/svg">

          <circle cx="308.5" cy="388.5" r="302" fill="#DEECF3" stroke="#5A1830" stroke-width="13" />
          <path d="M308.5 5.14625C274.1 2.74625 257.833 30.4796 254 44.6462H361C357.833 32.4796 342.9 7.54625 308.5 5.14625Z" fill="#DF736C" stroke="#5A1832" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M105 902L112.5 646H511.5L519 894.5L105 902Z" fill="#DF736C" stroke="#57162F" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M517.219 611C345.719 677.5 173.552 639.5 101.219 611C88.219 623.5 102.552 645 111.219 647.5C354.219 724.5 490.719 656.5 517.219 639C538.419 625 526.052 614.5 517.219 611Z" fill="#DF736C" stroke="#57162F" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M524.709 850.027C329.109 940.027 159.542 887.527 99.2088 850.027C71.2088 859.227 79.8755 895.194 87.7088 912.027C291.309 1022.43 476.875 958.027 544.209 912.027C549.009 860.827 533.209 849.36 524.709 850.027Z" fill="#DF736C" stroke="#57162F" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M364.5 892.246C320.5 833.846 278.5 867.912 263 892.246V952.746C263 961.246 276.5 972.246 314 973.246C344 974.046 360.167 959.912 364.5 952.746V892.246Z" fill="#C7D2D5" stroke="#57162F" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
          <g  className={styles.egg}>
            <circle className={styles.eggColor} cx="313.5" cy="885.5" r="40.5" fill="#F3D478" stroke="#57172F" stroke-width="10" />
            <path d="M323.599 925.513C291.223 932.027 279.261 908.229 274.125 897.882C326.587 906.466 345.102 886.898 352.345 874.125C357.085 887.153 357.344 918.724 323.599 925.513Z" fill="white" stroke="#531028" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
          </g>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M243.412 860.068C266.912 827.568 327.812 782.068 383.412 860.068V943.568C379.188 952.287 363.761 967.867 332.925 972.391C350.339 968.419 360.249 959.122 363.5 953.746V893.246C319.5 834.846 277.5 868.912 262 893.246V953.746C262 960.44 270.374 968.685 292.25 972.374C254.704 968.395 247.653 956.911 244.35 951.532C244.007 950.973 243.704 950.48 243.412 950.068C242.797 949.201 242.998 923.309 243.203 897.032C243.307 883.748 243.412 870.365 243.412 860.068Z" fill="#DF736C" />
          <path d="M383.412 860.068H388.412C388.412 859.027 388.087 858.013 387.483 857.166L383.412 860.068ZM243.412 860.068L239.36 857.138C238.743 857.991 238.412 859.016 238.412 860.068H243.412ZM383.412 943.568L387.911 945.748C388.241 945.068 388.412 944.323 388.412 943.568H383.412ZM332.925 972.391L331.813 967.516C329.195 968.113 327.516 970.671 328.01 973.31C328.504 975.949 330.994 977.727 333.651 977.338L332.925 972.391ZM363.5 953.746L367.779 956.333C368.251 955.552 368.5 954.658 368.5 953.746H363.5ZM363.5 893.246H368.5C368.5 892.16 368.147 891.104 367.493 890.237L363.5 893.246ZM262 893.246L257.783 890.559C257.272 891.362 257 892.294 257 893.246H262ZM292.25 972.374L291.723 977.347C294.41 977.631 296.836 975.73 297.204 973.054C297.571 970.377 295.746 967.893 293.082 967.444L292.25 972.374ZM244.35 951.532L248.611 948.915L248.611 948.915L244.35 951.532ZM243.412 950.068L239.334 952.961L239.334 952.961L243.412 950.068ZM243.203 897.032L238.204 896.993L243.203 897.032ZM387.483 857.166C373.209 837.14 358.331 824.672 343.421 818.025C328.457 811.353 313.786 810.693 300.27 813.754C273.513 819.814 251.489 840.364 239.36 857.138L247.463 862.998C258.834 847.272 279.01 828.822 302.478 823.507C314.074 820.881 326.523 821.439 339.349 827.158C352.23 832.901 365.814 843.995 379.34 862.97L387.483 857.166ZM388.412 943.568V860.068H378.412V943.568H388.412ZM333.651 977.338C365.817 972.619 382.84 956.218 387.911 945.748L378.912 941.388C375.536 948.356 361.705 963.115 332.199 967.444L333.651 977.338ZM334.037 977.265C352.617 973.028 363.748 962.999 367.779 956.333L359.221 951.159C356.751 955.244 348.061 963.81 331.813 967.516L334.037 977.265ZM368.5 953.746V893.246H358.5V953.746H368.5ZM367.493 890.237C356.138 875.165 344.642 865.697 333.3 860.622C321.888 855.516 310.902 854.983 300.908 857.356C281.205 862.033 265.896 877.823 257.783 890.559L266.217 895.932C273.604 884.335 287.045 870.925 303.217 867.085C311.161 865.2 319.893 865.579 329.216 869.75C338.608 873.953 348.862 882.126 359.507 896.254L367.493 890.237ZM257 893.246V953.746H267V893.246H257ZM257 953.746C257 959.316 260.461 964.391 266.066 968.291C271.706 972.215 280.05 975.387 291.419 977.305L293.082 967.444C282.573 965.672 275.793 962.877 271.777 960.083C267.726 957.264 267 954.87 267 953.746H257ZM240.089 954.148C241.926 957.14 245.037 962.148 252.924 966.788C260.616 971.313 272.531 975.312 291.723 977.347L292.777 967.402C274.424 965.457 264.04 961.725 257.994 958.169C252.143 954.727 250.076 951.303 248.611 948.915L240.089 954.148ZM239.334 952.961C239.51 953.21 239.72 953.547 240.089 954.148L248.611 948.915C248.293 948.399 247.898 947.75 247.489 947.174L239.334 952.961ZM238.204 896.993C238.101 910.124 237.999 923.189 238 933.079C238 938.019 238.026 942.203 238.092 945.219C238.125 946.719 238.168 947.985 238.227 948.932C238.257 949.394 238.294 949.862 238.349 950.274C238.375 950.473 238.417 950.754 238.488 951.056C238.506 951.132 238.693 952.058 239.334 952.961L247.489 947.174C247.858 947.694 248.031 948.158 248.089 948.32C248.165 948.531 248.206 948.695 248.224 948.772C248.26 948.924 248.268 949.007 248.262 948.962C248.252 948.887 248.232 948.684 248.208 948.304C248.161 947.566 248.121 946.462 248.09 945.002C248.026 942.099 248 938.004 248 933.078C247.999 923.236 248.101 910.217 248.203 897.071L238.204 896.993ZM238.412 860.068C238.412 870.341 238.307 883.702 238.204 896.993L248.203 897.071C248.307 883.794 248.412 870.389 248.412 860.068H238.412Z" fill="#57162F" />
          <path d="M234.569 45C154.169 61.4 136.736 111.167 138.069 134C289.669 155.6 427.236 143 477.069 134C486.669 79.2 418.069 51.8333 382.569 45H234.569Z" fill="#DF736C" stroke="#5A1730" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
          <svg x="55" y="350" width="495" height="284" viewBox="0 0 495 284" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="138" cy="217" r="47" fill="white" stroke="#57172F" stroke-width="10" />
            <path d="M149.542 262.73C112.54 270.174 98.8693 242.975 93 231.151C152.957 240.961 174.117 218.598 182.394 204C187.812 218.889 188.108 254.97 149.542 262.73Z" fill="#9DCFE0" stroke="#531028" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="113" cy="119" r="47" fill="#9DCFE0" stroke="#57172F" stroke-width="10" />
            <path d="M124.542 164.73C87.5401 172.174 73.8693 144.975 68 133.151C127.957 142.961 149.117 120.598 157.394 106C162.812 120.889 163.108 156.97 124.542 164.73Z" fill="white" stroke="#531028" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="424.89" cy="105.89" r="47" transform="rotate(-87.8779 424.89 105.89)" fill="white" stroke="#57172F" stroke-width="10" />
            <path d="M471.015 96.0494C477.085 133.301 449.398 145.955 437.365 151.383C449.388 91.8302 427.824 69.857 413.543 61.045C428.622 56.1822 464.689 57.2225 471.015 96.0494Z" fill="#B9AFD4" stroke="#531028" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="273.068" cy="79.0678" r="47" transform="rotate(-71.051 273.068 79.0678)" fill="#F3D478" stroke="#57172F" stroke-width="10" />
            <path d="M320.067 83.0013C315.093 120.415 284.929 124.513 271.84 126.225C300.587 72.702 286.307 45.4272 275.188 32.8583C291.03 32.5691 325.252 44.0055 320.067 83.0013Z" fill="white" stroke="#531028" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="70.4229" cy="178.423" r="47" transform="rotate(151.74 70.4229 178.423)" fill="white" stroke="#57172F" stroke-width="10" />
            <path d="M38.605 143.609C67.6712 119.532 92.5905 137.016 103.359 144.651C45.9036 164.4 37.8548 194.116 37.4758 210.893C25.6539 200.343 8.30974 168.703 38.605 143.609Z" fill="#F3D478" stroke="#531028" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="356.635" cy="68.6351" r="47" transform="rotate(113.957 356.635 68.6351)" fill="white" stroke="#57172F" stroke-width="10" />
            <path d="M310.159 60.6136C318.38 23.777 348.787 22.3282 361.975 21.7657C328.665 72.5742 340.51 100.992 350.489 114.483C334.682 113.388 301.589 99.0079 310.159 60.6136Z" fill="#E5A0B9" stroke="#531028" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="172" cy="146" r="47" fill="#E5A0B9" stroke="#57172F" stroke-width="10" />
            <path d="M183.542 191.73C146.54 199.174 132.869 171.975 127 160.151C186.957 169.961 208.117 147.598 216.394 133C221.812 147.889 222.108 183.97 183.542 191.73Z" fill="white" stroke="#531028" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="437.998" cy="167.998" r="47" transform="rotate(-5.8118 437.998 167.998)" fill="#E5A0B9" stroke="#57172F" stroke-width="10" />
            <path d="M454.111 212.324C418.054 223.477 401.699 197.803 394.662 186.634C455.305 190.322 474.091 165.93 480.847 150.57C487.745 164.834 491.693 200.699 454.111 212.324Z" fill="white" stroke="#531028" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="209" cy="81" r="47" fill="white" stroke="#57172F" stroke-width="10" />
            <path d="M220.542 126.73C183.54 134.174 169.869 106.975 164 95.1514C223.957 104.961 245.117 82.5975 253.394 68C258.812 82.8895 259.108 118.97 220.542 126.73Z" fill="#B9AFD4" stroke="#531028" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="341" cy="146" r="47" fill="white" stroke="#57172F" stroke-width="10" />
            <path d="M352.542 191.73C315.54 199.174 301.869 171.975 296 160.151C355.957 169.961 377.117 147.598 385.394 133C390.812 147.889 391.108 183.97 352.542 191.73Z" fill="#9DCFE0" stroke="#531028" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="261.391" cy="163.026" r="47" transform="rotate(-115.664 261.391 163.026)" fill="white" stroke="#57172F" stroke-width="10" />
            <path d="M297.611 132.818C320.346 162.945 301.751 187.047 293.636 197.458C276.51 139.167 247.189 129.78 230.447 128.642C241.521 117.31 273.914 101.417 297.611 132.818Z" fill="#B9AFD4" stroke="#531028" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="224" cy="230" r="47" fill="#B9AFD4" stroke="#57172F" stroke-width="10" />
            <path d="M235.542 275.73C198.54 283.174 184.869 255.975 179 244.151C238.957 253.961 260.117 231.598 268.394 217C273.812 231.889 274.108 267.97 235.542 275.73Z" fill="white" stroke="#531028" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="384.423" cy="217.058" r="47" transform="rotate(-71.051 384.423 217.058)" fill="white" stroke="#57172F" stroke-width="10" />
            <path d="M431.422 220.991C426.448 258.405 396.284 262.503 383.195 264.215C411.942 210.692 397.662 183.417 386.543 170.848C402.385 170.559 436.607 181.996 431.422 220.991Z" fill="#F3D478" stroke="#531028" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="302" cy="229.635" r="47" fill="white" stroke="#57172F" stroke-width="10" />
            <path d="M313.542 275.365C276.54 282.809 262.869 255.61 257 243.786C316.957 253.596 338.117 231.233 346.394 216.635C351.812 231.524 352.108 267.605 313.542 275.365Z" fill="#E5A0B9" stroke="#531028" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </svg>

        <g
          className={`${styles.egg} ${isEggActive ? styles.active : ""}`}
          onClick={handleEggClick}
        >
          <circle
            className={styles.eggColor}
            cx="313.5"
            cy="885.5"
            r="40.5"
            fill={currentColor}
            stroke="#57172F"
            strokeWidth="10"
          />
          <path
            d="M323.599 925.513C291.223 932.027 279.261 908.229 274.125 897.882C326.587 906.466 345.102 886.898 352.345 874.125C357.085 887.153 357.344 918.724 323.599 925.513Z"
            fill="white"
            stroke="#531028"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </div>
    </div>
  );
};

export default GachaponMachine;
