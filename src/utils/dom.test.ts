import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getCssVarPx } from './dom'

describe('getCssVarPx', () => {
  let elem: HTMLElement

  beforeEach(() => {
    elem = document.createElement('div')
    document.body.appendChild(elem)
  })

  afterEach(() => {
    document.body.removeChild(elem)
  })

  it('returns the correct value when css var is a valid px', () => {
    elem.style.setProperty('--test-var', '42px')
    // mock getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (name: string) => elem.style.getPropertyValue(name),
    } as any)
    expect(getCssVarPx(elem, '--test-var')).toBe(42)
  })

  it('returns fallback when css var is not a number', () => {
    elem.style.setProperty('--test-var', 'calc(10px + 2px)')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (name: string) => elem.style.getPropertyValue(name),
    } as any)
    expect(getCssVarPx(elem, '--test-var', 99)).toBe(99)
  })

  it('returns fallback when element is null', () => {
    expect(getCssVarPx(null, '--test-var', 7)).toBe(7)
  })

  it('returns fallback and warns when css var is invalid', () => {
    elem.style.setProperty('--test-var', 'abc')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (name: string) => elem.style.getPropertyValue(name),
    } as any)
    expect(getCssVarPx(elem, '--test-var', 5)).toBe(5)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
