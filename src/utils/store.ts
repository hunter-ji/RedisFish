import path from 'path'
import { remote } from 'electron'
import { writeFile, readFile } from '@/utils/file'

const storeFilePath = path.join(remote.app.getPath('home'), '.myRedisClient')

export interface serverType {
  id: number
  name: string
  host: string
  port: number
  password: string
  children?: string[]
}

export const getStore = (): serverType[] => {
  return JSON.parse(readFile(storeFilePath))
}

export const setStore = (content: serverType[]): void => {
  writeFile(storeFilePath, JSON.stringify(content))
}
