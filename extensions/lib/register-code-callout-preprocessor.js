'use strict'

module.exports = function registerCodeCalloutPreprocessor(registry) {
  registry.preprocessor(function () {
    this.process(function (doc, reader) {
      reader.lines = rewriteCodeCalloutBlocks(reader.getLines()).reverse()
      return reader
    })
  })
}

function rewriteCodeCalloutBlocks(lines) {
  const output = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const calloutSpec = parseCodeCalloutAttributeLine(line)
    if (!calloutSpec) {
      output.push(line)
      continue
    }

    const nextLine = lines[index + 1]
    const fence = isBlockFence(nextLine)
    if (!fence) {
      output.push(line)
      continue
    }

    const blockLines = []
    let endIndex = index + 2
    while (endIndex < lines.length && lines[endIndex] !== fence) {
      blockLines.push(lines[endIndex])
      endIndex += 1
    }

    if (endIndex >= lines.length) {
      output.push(line)
      continue
    }

    output.push(nextLine)
    output.push(...injectCalloutsIntoLines(blockLines, calloutSpec))
    output.push(lines[endIndex])
    index = endIndex
  }

  return output
}

function parseCodeCalloutAttributeLine(line) {
  const normalized = String(line || '').trim()
  if (!normalized.startsWith('[') || !normalized.endsWith(']')) return null
  const inner = normalized.slice(1, -1)
  const match = inner.match(/(?:^|,)\s*code\.callout\s*=\s*(?:"([^"]+)"|([^,\]]+))\s*(?:,|$)/)
  if (!match) return null
  const spec = (match[1] || match[2] || '').trim()
  const lineNumbers = parseLineSpec(spec)
  return lineNumbers.length ? lineNumbers : null
}

function isBlockFence(line) {
  const normalized = String(line || '').trim()
  return /^(?:----|....)$/.test(normalized) ? normalized : null
}

function injectCalloutsIntoLines(lines, lineNumbers) {
  const targets = new Map(lineNumbers.map((lineNumber, index) => [lineNumber - 1, index + 1]))
  return lines.map((line, index) => {
    const calloutNumber = targets.get(index)
    if (!calloutNumber) return line
    return `${line} <${calloutNumber}>`
  })
}

function parseLineSpec(spec) {
  const normalized = String(spec || '').trim()
  if (!normalized) return []
  const lines = new Set()
  for (const part of normalized.split(',')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const range = trimmed.match(/^(\d+)\s*-\s*(\d+)$/)
    if (range) {
      const start = Number.parseInt(range[1], 10)
      const end = Number.parseInt(range[2], 10)
      if (Number.isNaN(start) || Number.isNaN(end)) continue
      const from = Math.min(start, end)
      const to = Math.max(start, end)
      for (let line = from; line <= to; line += 1) lines.add(line)
      continue
    }
    const line = Number.parseInt(trimmed, 10)
    if (!Number.isNaN(line)) lines.add(line)
  }
  return Array.from(lines).sort((a, b) => a - b)
}
