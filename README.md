## Middleware

```ts
app.use(
  routeTrafficsMiddleware({
    concurrency: 6,
    maxQueue: 10000,
    excludes: ['/status'],
    logDumpInterval: '1m',
    unlockTime: '10m',
    logDump: dump => {...},
    logDumpExtras: {
      base: () => ({}),
      pressure: () => ({}),
      visit: req => ({ user: req.user || null })
    },
  })
)
```

## Status

```ts
$routeTraffic.status.getStatus()
```
