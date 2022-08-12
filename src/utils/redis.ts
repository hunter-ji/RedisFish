import { createClient } from 'redis'
import { serverType } from '@/utils/store'
import { serverTabType } from '@/store/modules/serverList'

export const getClient = (data: serverType): any => {
  if (data.tls?.tlsCaCertFile) {
    return createClient({
      password: data.password,
      socket: { tls: true, rejectUnauthorized: false, ca: data.tls.tlsCaCertFile, cert: data.tls.tlsCertFile, key: data.tls.tlsKeyFile, host: data.host, port: data.port }
    })
  }
  return createClient({ url: `redis://:${data.password}@${data.host}:${data.port}` })
}

export const getClientWithDB = (data: serverTabType): any => {
  const databaseExp = /\d+/.exec(data.db)
  const database = Number(databaseExp?.[0])
  if (data.tls?.tlsCaCertFile) {
    return createClient({
      password: data.password,
      database: database,
      socket: { tls: true, rejectUnauthorized: false, ca: data.tls.tlsCaCertFile, cert: data.tls.tlsCertFile, key: data.tls.tlsKeyFile, host: data.host, port: data.port }
    })
  }
  return createClient({ url: `redis://:${data.password}@${data.host}:${data.port}`, database: database })
}
