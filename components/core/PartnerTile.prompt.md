Flat partners grid cell — no elevation, just a hairline border.

```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
  <PartnerTile name="Beseda" brand />
  <PartnerTile /> {/* placeholder "лого" */}
</div>
```

- `brand` marks the host/headline partner (terracotta text).
- Leave `name` empty for a placeholder until real logos are dropped in.
