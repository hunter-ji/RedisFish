import { createClient } from 'redis'
import { serverType } from '@/utils/store'

export const getClient = (data: serverType): any => {
  if (data.tls?.tlsCaCertFile) {
    console.log('tls : ', data)
    return createClient({
      password: data.password,
      socket: { tls: true, rejectUnauthorized: false, ca: data.tls.tlsCaCertFile, cert: data.tls.tlsCertFile, key: data.tls.tlsKeyFile, host: data.host, port: data.port }
    })
  }
  return createClient({ url: `redis://:${data.password}@${data.host}:${data.port}` })
}
