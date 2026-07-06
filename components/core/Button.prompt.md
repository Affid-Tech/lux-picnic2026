One primary CTA per screen (terracotta fill); `secondary` for supporting actions.

```jsx
<Button variant="primary" fullWidth onClick={register}>Регистрация</Button>
<Button variant="secondary">Программа</Button>
```

- `variant`: `primary` (terracotta) | `secondary` (bordered cream)
- `fullWidth`: stretch to container
- Radius is medium (12px), not a pill — pills are reserved for CategoryTag.
