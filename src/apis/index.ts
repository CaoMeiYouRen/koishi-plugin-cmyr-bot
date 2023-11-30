import { ajax } from '../utils/ajax'

export interface ResponseDto {

    /**
   * 响应状态码
   *
   * @type {number}
   */
    statusCode?: number
    /**
   * 消息说明
   *
   * @type {string}
   */
    message?: string
    /**
   * 状态码>=400时的http status
   *
   * @type {string}
   */
    error?: string

    /**
   * 错误堆栈
   *
   * @type {string}
   */
    stack?: string
    /**
   * 返回的数据
   *
   * @type {any}
   */
    data?: any
}

export interface RobotCommand {
    id: string
    accessToken: string
    command: string
    imageType?: 'link' | 'html' | 'markdown' | 'cqCode'
    [k: string]: any
}

export async function robotRun(requestData: RobotCommand): Promise<ResponseDto> {
    const { id, accessToken, command, imageType } = requestData
    return ajax({
        url: `https://robot.cmyr.ltd/api/robot/run/${id}`,
        method: 'POST',
        headers: {
            'access-token': accessToken,
        },
        data: {
            command,
            imageType,
        },
        timeout: 60 * 1000,
    })
}

interface Trigger {
    _id: string
    name: string
    type: string
    priority: number
    command: string
    desp: string
    action: string
    user: string
    createdAt: string
    updatedAt: string
    id: string
}
interface RobotMeta {
    _id: string
    name: string
    triggers: Trigger[]
    user: string
    createdAt: string
    updatedAt: string
    enable: boolean
    id: string
}

export interface RobotMetaData {
    id: string
    accessToken: string
}

export async function getRobotMeta(requestData: RobotMetaData) {
    const { id, accessToken } = requestData
    return ajax<RobotMeta>({
        url: `https://robot.cmyr.ltd/api/robot/meta/${id}`,
        method: 'GET',
        headers: {
            'access-token': accessToken,
        },
    })
}
