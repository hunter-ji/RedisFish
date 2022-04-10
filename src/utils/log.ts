import path from 'path'
import { remote } from 'electron'
import { appendFile, readFile } from '@/utils/file'

export const setLog = async (serverName: string, dbNumber: number, command: string, createAt: string): Promise<void> => {
  const storeFilePath = path.join(remote.app.getPath('home'), `.myRedisClient/.${serverName}_${dbNumber}log`)

  await appendFile(storeFilePath, `${createAt} - ${command}`)
}

export const readLog = async (serverName: string, dbNumber: number): Promise<void> => {
  const storeFilePath = path.join(remote.app.getPath('home'), `.myRedisClient/.${serverName}_${dbNumber}log`)

  const res = await readFile(storeFilePath)
  console.log(res)
}
