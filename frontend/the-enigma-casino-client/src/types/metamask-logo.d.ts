declare module '@metamask/logo' {
  interface MetamaskLogoOptions {
    pxNotRatio?: boolean;
    width?: number;
    height?: number;
    followMouse?: boolean;
    slowDrift?: boolean;
  }

  interface MetamaskLogoViewer {
    container: HTMLElement;
    stopAnimation: () => void;
    startAnimation: () => void;
    setFollowMouse: (enabled: boolean) => void;
  }

  const MetaMaskLogo: (options?: MetamaskLogoOptions) => MetamaskLogoViewer;

  export default MetaMaskLogo;
}