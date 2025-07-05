import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ChordFinder from './ChordFinder.vue'

describe('ChordFinder', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(ChordFinder)
  })

  it('renders input and updates chordInput', async () => {
    const input = wrapper.find('input[type="text"]')
    expect(input.exists()).toBe(true)
    await input.setValue('Cmaj7')
    expect((wrapper.vm as any).chordInput).toBe('Cmaj7')
  })

  it('shows chord notes after input', async () => {
    const input = wrapper.find('input[type="text"]')
    await input.setValue('Cmaj7')
    // simulate input event
    await input.trigger('input')
    // Wait for DOM update
    await wrapper.vm.$nextTick()
    const notes = wrapper.find('p')
    expect(notes.text()).toMatch(/Notes:/)
  })

  it('shows advanced chords after input', async () => {
    const input = wrapper.find('input[type="text"]')
    await input.setValue('Cmaj7')
    await input.trigger('input')
    await wrapper.vm.$nextTick()
    const adv = wrapper.find('.chord-recommendations')
    expect(adv.exists()).toBe(true)
  })

  it('can select root octave', async () => {
    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios.length).toBeGreaterThan(0)
    await radios[1].setValue()
    expect((wrapper.vm as any).rootOctave).toBe(3)
  })

  it('adds recent chords', async () => {
    const input = wrapper.find('input[type="text"]')
    await input.setValue('Cmaj7')
    await input.trigger('input')
    await wrapper.vm.$nextTick()
    expect((wrapper.vm as any).recentChords.length).toBeGreaterThan(0)
  })
})
