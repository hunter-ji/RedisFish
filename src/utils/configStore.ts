import path from 'path'
import { remote } from 'electron'
import { writeFile, readFile, existsFile, mkdirFolder } from '@/utils/file'
import { checkIsJSON } from '@/utils/checkIsJson'

const storeFolderPath = path.join(remote.app.getPath('home'), '.myRedisClient')
const storeFilePath = path.join(remote.app.getPath('home'), '.myRedisClient/.config')

export interface configType {
  theme: number
}

export const getConfig = async (): Promise<configType> => {
  await initConfigFile()
  const result = await readFile(storeFilePath)
  if (checkIsJSON(result)) {
    return JSON.parse(result)
  } else {
    return {
      theme: 1
    }
  }
}

export const initConfigFile = async (): Promise<void> => {
  const isFolderExists = await existsFile(storeFolderPath)
  const isFileExists = await existsFile(storeFilePath)
  if (!isFolderExists) {
    await mkdirFolder(storeFolderPath)
    await writeFile(storeFilePath, JSON.stringify({}))
  } else if (isFolderExists && !isFileExists) {
    await writeFile(storeFilePath, JSON.stringify({}))
  }
}

export const setConfig = (content: configType): void => {
  writeFile(storeFilePath, JSON.stringify(content))
}
