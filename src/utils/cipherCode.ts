import crypto from 'crypto'

const algorithm = 'aes-128-cbc'

export const encrypt = async (data: string): Promise<string> => {
  const password = crypto.randomBytes(16).toString('hex') // password是用于生产密钥的密码
  const salt = crypto.randomBytes(16).toString('hex') // 生成盐值
  const iv = crypto.randomBytes(8).toString('hex') // 初始化向量

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 16, (err, derivedKey) => {
      if (err) {
        reject(err)
      } else {
        const cipher = crypto.createCipheriv(algorithm, derivedKey, iv)

        // 加密数据
        let cipherText = cipher.update(data, 'utf8', 'hex')
        cipherText += cipher.final('hex')
        cipherText += (password + salt + iv)

        resolve(cipherText)
      }
    })
  })
}

export const decrypt = async (cipherText: string): Promise<string> => {
  const iv = cipherText.slice(-16) // 获取初始化向量
  const salt = cipherText.slice(-48, -16) // 获取盐值
  const password = cipherText.slice(-80, -48) // 获取密钥密码
  const data = cipherText.slice(0, -80) // 获取密文

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 16, (err, derivedKey) => {
      if (err) {
        reject(err)
      } else {
        const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv)

        // 解密数据
        let txt = decipher.update(data, 'hex', 'utf8')
        txt += decipher.final('utf8')

        resolve(txt)
      }
    })
  })
}
