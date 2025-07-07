export function getCssVarPx(elem: HTMLElement | null, varName: string, fallback = 0): number {
  if (!elem) return fallback
  const cssValue = getComputedStyle(elem).getPropertyValue(varName)
  const value = parseFloat(cssValue)

  if (isNaN(value)) {
    console.warn(`getCssVarPx: Invalid value for ${varName}: "${cssValue}". Returning fallback value: ${fallback}.`)
    return fallback
  }

  return value
}
