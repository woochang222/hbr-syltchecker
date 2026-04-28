import { readdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const TEST_ROOTS = ['scripts', 'src']
const TEST_ISOLATION_FLAG = '--test-isolation'

const toSlashPath = filePath => filePath.split(path.sep).join('/')

const walkTestFiles = async (rootDir, currentDir, files) => {
  const entries = await readdir(currentDir, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = path.join(currentDir, entry.name)

    if (entry.isDirectory()) {
      await walkTestFiles(rootDir, entryPath, files)
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.test.js')) {
      files.push(toSlashPath(path.relative(rootDir, entryPath)))
    }
  }
}

export const collectTestFiles = async (rootUrl = new URL('../', import.meta.url)) => {
  const rootDir = fileURLToPath(rootUrl)
  const files = []

  for (const testRoot of TEST_ROOTS) {
    await walkTestFiles(rootDir, path.join(rootDir, testRoot), files)
  }

  return files.sort()
}

export const supportsTestIsolation = () => {
  return process.allowedNodeEnvironmentFlags.has(TEST_ISOLATION_FLAG)
}

export const buildNodeTestArgs = (
  files,
  { supportsTestIsolation: canDisableTestIsolation = supportsTestIsolation() } = {}
) => {
  const args = ['--test']

  if (canDisableTestIsolation) {
    args.push('--test-isolation=none')
  }

  return [...args, ...files]
}

export const runTests = async () => {
  const files = await collectTestFiles()

  if (files.length === 0) {
    console.error('No test files found.')
    return 1
  }

  const result = spawnSync(
    process.execPath,
    buildNodeTestArgs(files),
    { stdio: 'inherit' }
  )

  if (result.error) {
    console.error(result.error.message)
    return 1
  }

  return result.status ?? 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await runTests()
}
