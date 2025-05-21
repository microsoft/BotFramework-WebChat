import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import type { Options } from './options'

const postfixRE = /[#?].*$/s
function cleanUrl(url: string): string {
  return url.replace(postfixRE, '')
}

export async function transformCss(
  id: string,
  code: string,
  options: Options['options'],
): Promise<{ code: string; map?: string }> {
  const filename = cleanUrl(id)
  const { transform } = await import('lightningcss')
  const res = transform({
    ...options,
    filename,
    code: Buffer.from(code),
  })
  return {
    code: res.code.toString(),
    map: 'map' in res ? res.map?.toString() : undefined,
  }
}

export async function transformCssModule(
  id: string,
  options: Options['options'],
): Promise<{ code: string; map?: string; exports: string; id: string }> {
  const actualId = id.replace(/\?css_module$/, '')
  const code = await readFile(actualId, 'utf-8')
  const filename = cleanUrl(actualId)
  const { transform } = await import('lightningcss')
  const res = transform({
    cssModules: true,
    ...options,
    filename,
    code: Buffer.from(code),
  })
  const compiledId = actualId
    .replaceAll('\\', '/')
    .replace(/\.module\.css$/, '.module_built.css')

  const classes = Object.fromEntries(
    Object.entries(res.exports ?? {}).map(([key, value]) => [key, value.name]),
  )
  let exports = `const classes = ${JSON.stringify(classes)}\nexport default classes\n`
  const i = 0
  for (const key of Object.keys(classes)) {
    const sanitizedKey = `_${key.replaceAll(/\W/g, '_')}${i}`
    exports +=
      `\nconst ${sanitizedKey} = classes[${JSON.stringify(key)}]\n` +
      `export { ${sanitizedKey} as ${JSON.stringify(key)} }\n`
  }

  return {
    code: res.code.toString(),
    map: 'map' in res ? res.map?.toString() : undefined,
    id: compiledId,
    exports,
  }
}
