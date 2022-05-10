import path from 'path'
import { remote } from 'electron'
import { writeFile, readFile, existsFile, mkdirFolder } from '@/utils/file'
import { checkIsJSON } from '@/utils/checkIsJson'

const storeFolderPath = path.join(remote.app.getPath('home'), '.myRedisClient')
const storeFilePath = path.join(remote.app.getPath('home'), '.myRedisClient/.info')

export interface tlsType {
  tlsCertFilePath: string
  tlsKeyFilePath: string
  tlsCaCertFilePath: string
  tlsCertFile: string
  tlsKeyFile: string
  tlsCaCertFile: string
}

export interface serverType {
  id: number
  name: string
  host: string
  port: number
  password: string
  children?: string[]
  tls?: tlsType
}

export const getStore = async (): Promise<serverType[]> => {
  const result = await readFile(storeFilePath)
  if (checkIsJSON(result)) {
    return JSON.parse(result)
  } else {
    return []
  }
}

export const initStoreFile = async (): Promise<void> => {
  const isFolderExists = await existsFile(storeFolderPath)
  const isFileExists = await existsFile(storeFilePath)
  if (!isFolderExists) {
    await mkdirFolder(storeFolderPath)
    await writeFile(storeFilePath, JSON.stringify([]))
  } else if (isFolderExists && !isFileExists) {
    await writeFile(storeFilePath, JSON.stringify([]))
  }
}

export const setStore = async (content: serverType[]): Promise<void> => {
  await writeFile(storeFilePath, JSON.stringify(content))
}
