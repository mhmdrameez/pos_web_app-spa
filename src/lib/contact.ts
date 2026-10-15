export const WA_NUMBER = "917907858474";
export const WA_DISPLAY = "+91 79078 58474";

export function waLink(text: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}
