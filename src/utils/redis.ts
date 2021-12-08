import { createClient } from 'redis'
import { serverType } from '@/utils/store'

export const getClient = (data: serverType): any => {
  console.log('redis url : ', `redis://:${data.password}@${data.host}:${data.port}`)
  return createClient({ url: `redis://:${data.password}@${data.host}:${data.port}` })
}
