## Middleware

```ts
app.use(
  routeTrafficsMiddleware({
    concurrency: 6,
    maxQueue: 10000,
    unlockTimeout: '1m',
    forceCloseTimeout: '10m',
    excludes: ['/status'],
    bypass: ['/bypass'],
    bypassSecret: '**********',
    logDump: dump => {...},
    logDumpInterval: '1m',
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

### How Bypass Header Work

- Set `bypassSecret` in opts
- Create bypass headers using `routeTrafficsBypassHeaders()`
- It will generate a header object like `{ trafficbypass: "***" }`
- Requests with these headers will be bypass the queue
