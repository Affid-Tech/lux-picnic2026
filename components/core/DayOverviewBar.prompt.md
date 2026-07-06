The one-glance shape of the day. Segment `flex` should be proportional to each block's duration.

```jsx
<DayOverviewBar
  segments={[
    { category: 'general', flex: 2 },
    { category: 'it',      flex: 2 },
    { category: 'kids',    flex: 1 },
    { category: 'games',   flex: 2 },
    { category: 'general', flex: 1 },
  ]}
  ticks={[11, 13, 15, 17, 19]}
/>
```

- `height`: 16px (default, tactile) or ~6px for the airy modern treatment.
- Segments use the fixed category colours; don't recolour them.
