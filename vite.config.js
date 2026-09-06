import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, posix, relative, sep } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })

// Emits dist/sw.js from src/service-worker.js with this build's real asset list
// baked in, versioned by a hash of their contents so a new build replaces the
// old cache. Audio is streamed rather than cached, the CMS is its own page, and
// 404.html only exists for GitHub Pages' server-side fallback.
function serviceWorker() {
  const excluded = /^(404\.html$|media\/|admin\/)/
  let config

  return {
    name: 'melodybox-service-worker',
    apply: 'build',
    configResolved(resolved) {
      config = resolved
    },
    closeBundle() {
      const outDir = join(config.root, config.build.outDir)
      const files = walk(outDir)
        .map((file) => relative(outDir, file).split(sep).join(posix.sep))
        .filter((file) => !excluded.test(file))
        .sort()

      const template = readFileSync(join(config.root, 'src/service-worker.js'), 'utf8')

      const hash = createHash('sha256').update(template)
      files.forEach((file) => hash.update(file).update(readFileSync(join(outDir, file))))

      const source = template
        .replaceAll('__VERSION__', hash.digest('hex').slice(0, 12))
        .replaceAll('__PRECACHE__', JSON.stringify(files.map((file) => config.base + file)))
        .replaceAll('__SHELL__', config.base + 'index.html')

      writeFileSync(join(outDir, 'sw.js'), source)
    },
  }
}

// With history routing (no # in URLs) the base must be an absolute path.
// Locally it's '/'; the GitHub Actions workflow passes VITE_BASE=/<repo-name>/
// so the site works at https://<user>.github.io/<repo>/.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss(), serviceWorker()],
})
