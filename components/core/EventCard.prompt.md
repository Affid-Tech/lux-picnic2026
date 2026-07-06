The atom of the day agenda. Stack in a `flex column` with `gap:12px`.

```jsx
<EventCard
  time="13:00" duration="1 ч"
  title="IT-панель: карьера в эмиграции"
  location="Сцена А · 4 спикера"
  category="it"
/>
```

- `time` renders in Spectral serif; `duration` is the small mono-ish label under it.
- `category` colours the embedded `<CategoryTag size="sm">`.
- Card = cream surface, hairline border, hard 2px offset shadow (--shadow-card), radius-lg.
