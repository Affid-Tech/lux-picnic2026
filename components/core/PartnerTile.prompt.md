Flat partners grid cell — no elevation, just a hairline border. With no logo
asset, the brand name is set as a Spectral terracotta wordmark (never a grey
placeholder chip).

```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
  <PartnerTile name="Beseda" brand />
  <PartnerTile name="LetzRoll" />
  <PartnerTile /> {/* empty name → "лого" placeholder */}
</div>
```

- `name` renders as a Spectral terracotta wordmark.
- `brand` marks the host/headline partner with a terracotta border.
- Leave `name` empty for a "лого" placeholder until real logos are dropped in.
