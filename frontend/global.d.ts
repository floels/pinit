// https://github.com/jefflau/jest-fetch-mock#typescript-importing
import "jest-fetch-mock";

declare module "*.module.css" {
  const styles: { [className: string]: string };
  export default styles;
}
