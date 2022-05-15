import { notarize } from 'electron-notarize'

export const notarizing = async () => {
  return await notarize({
    appPath: 'RedFish.app', // 应用的路径 xxx.app 结尾的
    appBundleId: 'com.kuari.RedFish', // appid
    appleId: process.env.AppleID, // 苹果开发者 id
    appleIdPassword: process.env.AppleIdPassword, // 应用专用密码
    ascProvider: process.env.AscProvider // 证书提供者
  })
}
