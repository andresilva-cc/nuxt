import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { isWindows } from 'std-env'
import { $fetch, getBrowser, setup, url } from '@nuxt/test-utils'

const isWebpack =
  process.env.TEST_BUILDER === 'webpack' ||
  process.env.TEST_BUILDER === 'rspack'

const isDev = process.env.TEST_ENV === 'dev'

await setup({
  rootDir: fileURLToPath(new URL('../fixtures/spa-loader', import.meta.url)),
  dev: isDev,
  server: true,
  browser: true,
  setupTimeout: (isWindows ? 360 : 120) * 1000,
  nuxtConfig: {
    builder: isWebpack ? 'webpack' : 'vite',
    spaLoadingTemplate: true,
    experimental: {
      spaLoadingTemplateLocation: 'within',
    },
  },
})

describe('spaLoadingTemplateLocation flag is set to `within`', () => {
  it('shoul be render loader inside appTag', async () => {
    const html = await $fetch<string>('/spa')
    expect(html.replace(/[\n\r]+/g, '')).toContain(
      `<div id="__nuxt"><div data-testid="loader">loading...</div></div>`,
    )
  })

  it.skipIf(isDev)('spa-loader does not appear while the app is mounting', async () => {
    const browser = await getBrowser()
    const page = await browser.newPage({})
    await page.goto(url('/spa'), { waitUntil: 'domcontentloaded' })

    const loader = page.getByTestId('loader')
    expect(await loader.isHidden()).toBeTruthy()

    await page.close()
  }, 60_000)
})
