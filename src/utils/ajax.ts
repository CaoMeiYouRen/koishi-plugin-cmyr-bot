export type Method =
  | 'GET'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'PURGE'
  | 'LINK'
  | 'UNLINK'

export interface AjaxConfig {
    url: string
    query?: Record<string, string>
    data?: Record<string, unknown>
    method?: Method
    headers?: Record<string, string>
    baseURL?: string
    timeout?: number
}

/**
 * fetch 接口封装
 * @param config
 * @returns
 */
export async function ajax<T = any>(config: AjaxConfig): Promise<T> {
    try {
        const { url, query = {}, data = {}, method = 'GET', headers = {}, baseURL, timeout = 10000 } = config
        const _url = new URL(baseURL ? baseURL + url : url, baseURL)
        const _query = new URLSearchParams(query)
        _url.searchParams.forEach((value, key) => {
            _query.append(key, value)
        })
        _url.search = _query.toString()
        const _method = method.toUpperCase()
        const body = ['GET', 'HEAD'].includes(_method) ? null : JSON.stringify(data)
        return Promise.race([
            fetch(_url.toString(), {
                method: _method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
                body,
            }).then((resp) => resp.json()),
            new Promise<void>((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error('Ajax timeout!'))
                }, timeout)
            }),
        ])
    } catch (error) {
        console.error(error)
        throw error
    }
}
