import path from 'path'
import { remote } from 'electron'
import { existsFile } from '@/utils/file'
import fs from 'fs'

const genFilePath = async (serverName: string, dbNumber: string): Promise<string> => {
  return path.join(remote.app.getPath('home'), `.myRedisClient/.${serverName}_${dbNumber}.log`)
}

export const initLogFile = async (serverName: string, dbNumber: string): Promise<void> => {
  const storeFilePath = await genFilePath(serverName, dbNumber)
  const isFileExists = await existsFile(storeFilePath)
  if (!isFileExists) {
    await fs.writeFileSync(storeFilePath, '')
  }
}

export const clearLog = async (serverName: string, dbNumber: string): Promise<void> => {
  const storeFilePath = await genFilePath(serverName, dbNumber)
  fs.writeFileSync(storeFilePath, '')
}

export const setLog = async (serverName: string, dbNumber: string, command: string, createAt: string): Promise<void> => {
  const storeFilePath = await genFilePath(serverName, dbNumber)
  await fs.appendFileSync(storeFilePath, `\r\n${createAt}###${command}`)
}

export const readLog = async (serverName: string, dbNumber: string): Promise<string[]> => {
  const storeFilePath = await genFilePath(serverName, dbNumber)
  const data = fs.readFileSync(storeFilePath, { encoding: 'utf8', flag: 'r' })
  return data.split('\r\n').filter((item: string) => item && item.length)
}
