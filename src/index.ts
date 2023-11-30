import { Context, Schema, h, Logger } from 'koishi'
import { CQ } from 'go-cqwebsocket'
import { msgTags } from 'go-cqwebsocket/out/tags'
import { robotRun } from './apis'

export const name = 'cmyr-bot'

const logger = new Logger(name)

export interface Config {
    // prefix?: string
    robotId: string
    accessToken: string
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Config: Schema<Config> = Schema.object({
    robotId: Schema.string().required().description('机器人 ID'),
    accessToken: Schema.string().required().description('访问令牌。从个人中心获取'),
    // prefix: Schema.string().description('触发前缀').default('cmyr'),
}).description('草梅机器人配置')

export function apply(ctx: Context, config: Config) {
    // write your plugin here
    ctx.command('cmyrbot <command:text>', '运行草梅机器人平台的命令')
        .alias('cmyr-bot')
        .alias('cmyr')
        .action(async (_, command) => {
            const resp = await robotRun({
                id: config.robotId,
                accessToken: config.accessToken,
                command,
                imageType: 'cqCode',
            })
            const text = resp.data || '返回结果为空！请检查输入的指令'
            logger.info('返回结果为："%s"', text)
            const cqcodes = CQ.parse(text) as msgTags[]
            return h('message', cqcodes.map((e) => {
                switch (e.tagName) {
                    case 'text':
                        return e.text
                    case 'image':
                        return h('image', { url: e.url || e.file })
                    default:
                        logger.info('未匹配到消息类型：%s', e.tagName)
                        logger.debug('消息内容：%o', e)
                        return null
                }
            }).filter(Boolean))
        })

}
