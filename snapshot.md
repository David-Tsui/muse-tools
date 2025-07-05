# 專案快照

## 專案目錄結構

```text
├── .DS_Store
├── .nvmrc
├── Dockerfile
├── README.md
├── docker-compose.yml
├── index.html
├── package.json
├── pnpm-lock.yaml
├── src
│   ├── App.vue
│   ├── auto-imports.d.ts
│   ├── components
│   │   ├── ChordFinder.vue
│   ├── components.d.ts
│   ├── main.ts
│   └── utils
│       └── index.ts
├── tests
│   └── unit
├── tsconfig.json
├── typed-router.d.ts
└── vite.config.ts
```

## 函式清單

### src/utils/index.ts

- **memoize<T extends (...args: any[]) => any>(fn: T): T** - Memoize a function using argument serialization as cache key
- **measureExecutionTime<T extends (...args: any[]) => any>(fn: T, ...args: Parameters\<T\>): { result: ReturnType\<T\>; time: number }** - Measure execution time of a function

## 依賴清單

### muse-tools

### devDependencies

```json
{
  "@vitejs/plugin-vue": "^4.0.0",
  "@vue/test-utils": "^2.4.6",
  "jsdom": "^26.0.0",
  "typescript": "^5.0.0",
  "unplugin-auto-import": "^0.17.0",
  "unplugin-vue-components": "^0.25.0",
  "unplugin-vue-router": "^0.8.0",
  "vite": "^4.0.0",
  "vitest": "^3.0.9"
}
```

### dependencies

```json
{
  "abcjs": "^6.4.4",
  "tonal": "^5.2.1",
  "tone": "^15.0.4",
  "vue": "^3.3.0"
}
```
