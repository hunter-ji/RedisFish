import * as fs from 'fs'
import { encrypt, decrypt } from '@/utils/cipherCode'

export const writeFile = async (path: string, content: string): Promise<void> => {
  const encryptContent = await encrypt(content)
  fs.writeFileSync(path, encryptContent)
}

export const appendFile = async (path: string, content: string): Promise<void> => {
  const encryptContent = await encrypt(content)
  fs.appendFileSync(path, encryptContent)
}

export const readFile = async (path: string): Promise<string> => {
  const content = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' })
  return await decrypt(content)
}

export const existsFile = async (path: string): Promise<boolean> => {
  return fs.existsSync(path)
}

export const mkdirFolder = async (path: string): Promise<void> => {
  fs.mkdirSync(path)
}
