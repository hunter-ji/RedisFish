import path from 'path'
import { remote } from 'electron'
import { existsFile } from '@/utils/file'
import fs from 'fs'
import { serverTabType } from '@/store/modules/serverList'

const genFilePath = async (serverTab: serverTabType): Promise<string> => {
  return path.join(remote.app.getPath('home'), `.myRedisClient/.${serverTab.name}_${serverTab.db}.log`)
}

export const initLogFile = async (serverTab: serverTabType): Promise<void> => {
  const storeFilePath = await genFilePath(serverTab)
  const isFileExists = await existsFile(storeFilePath)
  if (!isFileExists) {
    await fs.writeFileSync(storeFilePath, '')
  }
}

export const clearLog = async (serverTab: serverTabType): Promise<void> => {
  const storeFilePath = await genFilePath(serverTab)
  fs.writeFileSync(storeFilePath, '')
}

export const setLog = async (serverTab: serverTabType, command: string, createAt: string): Promise<void> => {
  const storeFilePath = await genFilePath(serverTab)
  await fs.appendFileSync(storeFilePath, `\r\n${createAt}###${command}`)
}

export const readLog = async (serverTab: serverTabType): Promise<string[]> => {
  const storeFilePath = await genFilePath(serverTab)
  const data = fs.readFileSync(storeFilePath, { encoding: 'utf8', flag: 'r' })
  return data.split('\r\n').filter((item: string) => item && item.length)
}
