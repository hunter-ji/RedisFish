import path from 'path'
import { remote } from 'electron'
import { writeFile, readFile, existsFile, mkdirFolder } from '@/utils/file'
import { checkIsJSON } from '@/utils/checkIsJson'

const storeFolderPath = path.join(remote.app.getPath('home'), '.myRedisClient')
const storeFilePath = path.join(remote.app.getPath('home'), '.myRedisClient/.config')

export interface configType {
  theme: number // 1 light 2 dark 3 auto
  isVideoShow: number
  language: number // 1 zh 2 en 3 auto
  keyMenuStatus: number // 1 group 2 filter
  keyMenuFilterSymbol: number // 1 : 2 _ 3 - 4 # 5 = 6 +
  keyMenuFilterSymbolStr: string
}

export const getConfig = async (): Promise<configType> => {
  await initConfigFile()
  const result = await readFile(storeFilePath)
  if (checkIsJSON(result)) {
    return JSON.parse(result)
  } else {
    return {
      theme: 3,
      isVideoShow: 1,
      language: 3,
      keyMenuStatus: 1,
      keyMenuFilterSymbol: 1,
      keyMenuFilterSymbolStr: ':'
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

export const transKeyMenuFilterSymbol = (keyMenuFilterSymbol: number): string => {
  switch (keyMenuFilterSymbol) {
    case 1:
      return ':'
    case 2:
      return '_'
    case 3:
      return '-'
    case 4:
      return '#'
    case 5:
      return '='
    case 6:
      return '+'
    default:
      return ':'
  }
}
