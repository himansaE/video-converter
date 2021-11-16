import { CSSProperties } from "react";

function cssClass(...classList: String[]): string {
  return classList.join(" ");
}
function cssVariable(vars: object) {
  return vars as CSSProperties;
}

export { cssClass, cssVariable };
