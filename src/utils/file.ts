import * as fs from 'fs'

export const writeFile = (path: string, content: string): void => {
  fs.writeFileSync(path, content)
}

export const appendFile = (path: string, content: string): void => {
  fs.appendFileSync(path, content)
}

export const readFile = (path: string): string => {
  return fs.readFileSync(path, {
    encoding: 'utf8',
    flag: 'r'
  })
}
