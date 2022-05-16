// eslint-disable-next-line @typescript-eslint/no-var-requires
const Components = require('unplugin-vue-components/webpack')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = {
  productionSourceMap: false,
  configureWebpack: {
    plugins: [
      Components({
        resolvers: [ElementPlusResolver()]
      })
    ]
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      disableMainProcessTypescript: false,
      mainProcessTypeChecking: false,
      build: {
        productName: 'RedFish',
        appId: 'com.kuari.RedFish',
        copyright: '© Kuari 2022',
        afterSign: 'build/notarize.js',
        publish: [
          {
            provider: 'github', // 打包上传到github
            owner: 'Kuari', // 仓库所有者
            repo: 'RedFish', // 仓库名称
            releaseType: 'release' // 上传到github的版本类型（draft:草稿，prerelease:提前发行版，release:发行版）
          }
        ],
        nsis: {
          oneClick: false,
          allowElevation: true,
          allowToChangeInstallationDirectory: true,
          installerIcon: 'build/icon.ico',
          uninstallerIcon: 'build/icon.ico',
          installerHeaderIcon: 'build/icon.ico',
          createDesktopShortcut: true,
          createStartMenuShortcut: true,
          shortcutName: 'RedFish'
        },
        win: {
          icon: 'build/icon.ico',
          requestedExecutionLevel: 'requireAdministrator',
          target: [
            {
              target: 'nsis'
            }
          ]
        },
        dmg: {
          contents: [
            {
              x: 410,
              y: 150,
              type: 'link',
              path: '/Applications'
            },
            {
              x: 130,
              y: 150,
              type: 'file'
            }
          ]
        },
        mas: {
          icon: 'build/icon.icns',
          hardenedRuntime: true,
          entitlements: 'electron-builder/entitlements.mas.plist',
          entitlementsInherit: 'electron-builder/entitlements.mas.plist'
        },
        mac: {
          target: [
            {
              target: 'dmg',
              arch: 'universal'
            }
          ],
          icon: 'build/icon.icns',
          hardenedRuntime: true,
          entitlements: 'electron-builder/entitlements.plist',
          entitlementsInherit: 'electron-builder/entitlements.plist',
          provisioningProfile: 'electron-builder/comalibabaslobs.provisionprofile'
        },
        linux: {
          icon: 'build/icon.ico'
        }
      }
    },
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableLegacy: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true
    }
  }
}
