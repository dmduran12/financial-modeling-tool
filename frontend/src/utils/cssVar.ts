export function getCssVar(name: string, element: HTMLElement = document.documentElement): string {
  const value = getComputedStyle(element).getPropertyValue(name);
  return value.trim();
}

