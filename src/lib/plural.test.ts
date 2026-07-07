import { describe, it, expect } from 'vitest'
import { plural } from './plural'

const one = 'событие'
const few = 'события'
const many = 'событий'

describe('plural', () => {
  it('selects "one" for values ending in 1, except 11', () => {
    expect(plural(1, one, few, many)).toBe(one)
    expect(plural(21, one, few, many)).toBe(one)
    expect(plural(101, one, few, many)).toBe(one)
  })

  it('selects "few" for values ending in 2-4, except 12-14', () => {
    expect(plural(2, one, few, many)).toBe(few)
    expect(plural(3, one, few, many)).toBe(few)
    expect(plural(4, one, few, many)).toBe(few)
    expect(plural(22, one, few, many)).toBe(few)
  })

  it('selects "many" for values ending in 0, 5-9, and the 11-14 exception', () => {
    expect(plural(0, one, few, many)).toBe(many)
    expect(plural(5, one, few, many)).toBe(many)
    expect(plural(11, one, few, many)).toBe(many)
    expect(plural(12, one, few, many)).toBe(many)
    expect(plural(14, one, few, many)).toBe(many)
    expect(plural(18, one, few, many)).toBe(many)
  })
})
