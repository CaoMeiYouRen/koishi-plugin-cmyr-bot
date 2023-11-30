import fs from 'fs'
import path from 'path'
import { defineConfig } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import { visualizer } from 'rollup-plugin-visualizer'
import replace from '@rollup/plugin-replace'
import dts from 'rollup-plugin-dts'
import alias from '@rollup/plugin-alias'

const { dependencies, peerDependencies, name } = JSON.parse(fs.readFileSync('./package.json'))

const upperFirst = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '')

function camelCase(str) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => (index === 0
            ? letter.toLowerCase()
            : letter.toUpperCase()),
        )
        .replace(/-|\s+/g, '')
}

const sourceMap = true

const external = Object.keys({ ...dependencies, ...peerDependencies }) // 默认不打包 dependencies, peerDependencies
const outputName = upperFirst(camelCase(name))// 导出的模块名称 PascalCase
const env = process.env
const __PROD__ = env.NODE_ENV === 'production'
const __DEV__ = env.NODE_ENV === 'development'
const __ANALYZER__ = Boolean(env.ANALYZER)
function getPlugins({ isBrowser = false, isMin = false, isDeclaration = false }) {
    const plugins = []
    plugins.push(
        nodeResolve({
            browser: isBrowser,
            preferBuiltins: true,
        }),
    )
    plugins.push(
        typescript({
            tsconfig: 'tsconfig.json',
            module: 'esnext',
            target: 'es2019', // node >= 12
            declaration: isDeclaration,
            sourceMap,
        }),
    )
    plugins.push(
        alias({
            entries: [
                { find: '@', replacement: path.resolve('./src') },
            ],
        }),
    )
    plugins.push(
        commonjs({
            sourceMap,
        }),
    )
    plugins.push(
        json({}),
    )
    plugins.push(
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'env.NODE_ENV': JSON.stringify(env.NODE_ENV),
            preventAssignment: true,
        }),
    )
    if (isMin) {
        plugins.push(
            terser({
                module: true,
            }),
        )
    }
    if (__ANALYZER__) {
        plugins.push(
            // analyzer({

            // }),
            visualizer({
                filename: 'temp/stats.html',
                open: true,
            }),
        )
    }
    return plugins
}

export default defineConfig([
    {
        input: 'src/index.ts', // 生成类型文件
        output: {
            dir: 'dist',
            format: 'esm',
            name: outputName,
            // sourcemap: sourceMap,
        },
        plugins: [dts()],
    },
    {
        input: 'src/index.ts',
        external,
        output: [
            {
                file: 'dist/index.js', // 生成 cjs
                format: 'cjs',
                name: outputName,
                sourcemap: sourceMap,
            },
            {
                file: 'dist/index.mjs', // 生成 esm
                format: 'esm',
                name: outputName,
                sourcemap: sourceMap,
            },
        ],
        plugins: getPlugins({
            isBrowser: false,
            isDeclaration: false,
            isMin: false,
        }),
    },
])
