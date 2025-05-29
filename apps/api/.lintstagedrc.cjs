const ifStaged = (fn) => (stagedFiles) => (stagedFiles.length === 0 ? [] : fn(stagedFiles));

module.exports = {
  './(src|scripts)/**/*.{ts,js,json}': ifStaged(() => [`bunx biome --check --staged .`, `tsc --noEmit`]),
  './src/data/**/beefyCowVaults.json': ifStaged(() => [`bun run checkClms`]),
};
