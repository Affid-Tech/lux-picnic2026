The canonical way to label a program category. Colours are fixed per category — never swap them.

```jsx
<CategoryTag category="it" />           {/* → "IT", blue */}
<CategoryTag category="kids" size="sm" /> {/* inside an EventCard */}
```

- `category`: `general` | `it` | `kids` | `games`
- `size`: `md` (default, hero/filters) | `sm` (event cards)
- `label`: override text; defaults to the category's Russian name.
- Import `CATEGORIES` for the raw colour map when building custom bits.
