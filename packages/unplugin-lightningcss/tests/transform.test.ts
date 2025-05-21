import { resolve } from 'node:path'
import { rollupBuild, testFixtures } from '@sxzz/test-utils'
import css from 'rollup-plugin-css-only'
import { describe, expect, it } from 'vitest'
import LightningCSS from '../src/rollup'

describe('transform', async () => {
  await testFixtures(
    ['tests/fixtures/*.css'],
    async (args, id) =>
      (
        await rollupBuild(id, [
          LightningCSS({
            options: {
              minify: true,
              targets: {
                ie: 11,
              },
            },
          }),
          css(),
        ])
      ).snapshot,
    { cwd: resolve(__dirname, '..'), promise: true },
  )
})

describe('CSS Modules', () => {
  it('should transform CSS Modules', async () => {
    const entry = resolve(__dirname, './css-module-fixture/index.js')
    const { snapshot } = await rollupBuild(entry, [
      LightningCSS({
        options: {
          minify: true,
          targets: {
            ie: 11,
          },
          cssModules: {
            pattern: 'dummy_[local]',
          },
        },
      }),
      css(),
    ])
    expect(snapshot).toMatchSnapshot()
  })
})
