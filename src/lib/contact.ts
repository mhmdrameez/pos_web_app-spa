export const WA_NUMBER = "919446960834";
export const WA_DISPLAY = "+91 94469 60834";

export function waLink(text: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}
