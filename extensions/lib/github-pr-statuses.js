'use strict'

const fs = require('fs-extra')
const ospath = require('path')
const { unified } = require('unified')
const rehypeParse = require('rehype-parse').default
const rehypeStringify = require('rehype-stringify').default
const { visit } = require('unist-util-visit')

const DEFAULT_CACHE_TTL = 60 * 60 * 1000
const DEFAULT_CONCURRENCY = 4

function createGithubPrStatusEnricher(config = {}) {
  const enabled = Boolean(config.enabled)
  const cacheDir = ospath.resolve(config.projectRoot || process.cwd(), config.cacheDir || 'build/github-pr-statuses')
  const cacheTtl = Number.isFinite(Number(config.cacheTtl)) ? Number(config.cacheTtl) * 1000 : DEFAULT_CACHE_TTL
  const token = process.env[config.tokenEnv || 'GITHUB_TOKEN']
  const entries = new Map()
  const pending = new Map()

  async function prepareFromTexts(texts, { log = () => {} } = {}) {
    if (!enabled) return
    const pulls = new Map()
    texts.forEach((text) => {
      extractGithubPullRequests(text).forEach((pull) => pulls.set(pull.key, pull))
    })
    if (!pulls.size) return
    if (!token) {
      log('GitHub PR status enrichment is using unauthenticated requests; set GITHUB_TOKEN in CI for reliable builds.')
    }
    const queue = Array.from(pulls.values())
    await runWithConcurrency(queue, DEFAULT_CONCURRENCY, async (pull) => {
      const status = await getStatus(pull, log)
      if (status) entries.set(pull.key, status)
    })
  }

  async function getStatus(pull, log) {
    if (entries.has(pull.key)) return entries.get(pull.key)
    if (pending.has(pull.key)) return pending.get(pull.key)
    const request = resolveStatus(pull, log).finally(() => pending.delete(pull.key))
    pending.set(pull.key, request)
    return request
  }

  async function resolveStatus(pull, log) {
    const cached = await readCache(cacheDir, pull.key)
    if (cached && Date.now() - cached.fetchedAt < cacheTtl) return cached.status
    try {
      const response = await fetch(`https://api.github.com/repos/${pull.owner}/${pull.repo}/pulls/${pull.number}`, {
        headers: {
          Accept: 'application/vnd.github+json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'User-Agent': 'tldr-ui-github-pr-statuses',
        },
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      const status = toStatus(await response.json())
      await writeCache(cacheDir, pull.key, status)
      return status
    } catch (err) {
      if (cached) {
        log(`using stale cached GitHub PR status for ${pull.key}: ${err.message}`)
        return cached.status
      }
      log(`skipping GitHub PR status for ${pull.key}: ${err.message}`)
      return null
    }
  }

  function enrich(html) {
    if (!enabled || !entries.size) return html
    const processor = unified().use(rehypeParse, { fragment: true }).use(rehypeStringify)
    const tree = processor.parse(html)
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || node.tagName !== 'a' || typeof index !== 'number') return
      const pull = parseGithubPullRequest(node.properties && node.properties.href)
      const status = pull && entries.get(pull.key)
      if (!status || hasStatusBadge(parent.children, index)) return
      parent.children.splice(index + 1, 0, { type: 'text', value: ' ' }, statusBadge(status))
    })
    return processor.stringify(tree)
  }

  return { enrich, prepareFromTexts }
}

function extractGithubPullRequests(text) {
  const pulls = []
  const matcher = /https:\/\/github\.com\/[^\s["'<]+\/pull\/\d+(?:[^\s"'<]*)?/g
  for (const value of String(text || '').match(matcher) || []) {
    const pull = parseGithubPullRequest(value)
    if (pull) pulls.push(pull)
  }
  return pulls
}

function parseGithubPullRequest(value) {
  try {
    const url = new URL(String(value || ''))
    if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') return null
    const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?$/)
    if (!match) return null
    const [, owner, repo, number] = match
    return { owner, repo, number, key: `${owner}/${repo}#${number}` }
  } catch {
    return null
  }
}

function toStatus(pull) {
  if (pull.merged_at) return 'merged'
  if (pull.draft) return 'draft'
  return pull.state === 'open' ? 'open' : 'closed'
}

function statusBadge(status) {
  return {
    type: 'element',
    tagName: 'span',
    properties: { className: ['pr-status', status] },
    children: [{ type: 'text', value: status[0].toUpperCase() + status.slice(1) }],
  }
}

function hasStatusBadge(children, index) {
  return children.slice(index + 1).some((node) => {
    if (node.type === 'text' && !node.value.trim()) return false
    return node.type === 'element' && node.tagName === 'span' && node.properties?.className?.includes('pr-status')
  })
}

async function readCache(cacheDir, key) {
  try {
    return await fs.readJson(ospath.join(cacheDir, `${encodeURIComponent(key)}.json`))
  } catch {
    return null
  }
}

async function writeCache(cacheDir, key, status) {
  await fs.outputJson(ospath.join(cacheDir, `${encodeURIComponent(key)}.json`), {
    fetchedAt: Date.now(),
    status,
  })
}

async function runWithConcurrency(values, concurrency, worker) {
  const queue = [...values]
  await Promise.all(
    Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      while (queue.length) await worker(queue.shift())
    })
  )
}

module.exports = { createGithubPrStatusEnricher, extractGithubPullRequests, parseGithubPullRequest, toStatus }
