import { describe, it, expect } from 'vitest'
import { getDaypart } from './time'

describe('getDaypart', () => {
  it('buckets start times at and before 12:00 as morning', () => {
    expect(getDaypart('00:00')).toBe('morning')
    expect(getDaypart('10:00')).toBe('morning')
    expect(getDaypart('12:00')).toBe('morning')
  })

  it('buckets start times after 12:00 and at/before 15:00 as day', () => {
    expect(getDaypart('12:01')).toBe('day')
    expect(getDaypart('13:00')).toBe('day')
    expect(getDaypart('15:00')).toBe('day')
  })

  it('buckets start times after 15:00 as evening', () => {
    expect(getDaypart('15:01')).toBe('evening')
    expect(getDaypart('16:00')).toBe('evening')
    expect(getDaypart('23:59')).toBe('evening')
  })
})
