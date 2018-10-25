const path = require('path')
let prod = process.env.NODE_ENV === 'production'

module.exports = {
    wpyExt: '.wpy',
    eslint: true,
    cliLogs: !prod,
    build: {
    },
    resolve: {
        alias: {
            '@': path.join(__dirname, 'src')
        },
        aliasFields: ['wepy', 'weapp'],
        modules: ['node_modules']
    },
    compilers: {
        less: {
            compress: prod
        },

        /* sass: {
        outputStyle: 'compressed'
        }, */

        babel: {
            sourceMap: true,
            presets: [
                'env'
            ],
            plugins: [
                'transform-class-properties',
                'transform-decorators-legacy',
                'transform-object-rest-spread',
                'transform-export-extensions'
            ]
        }
    },
    plugins: {
    },
    appConfig: {
        noPromiseAPI: ['createSelectorQuery'],
        serverHost: 'www.npu2015303320.top',
        appId: 'wx64b908a4f8bd6f6e',
        appKey: 'c73e5ad1a0c7b1218ad0d8b8707d866c'
    }
}

if (prod) {
    // 压缩sass
    // module.exports.compilers['sass'] = {outputStyle: 'compressed'}

    // 压缩js
    module.exports.plugins = {
        uglifyjs: {
            filter: /\.js$/,
            config: {
            }
        },
        imagemin: {
            filter: /\.(jpg|png|jpeg)$/,
            config: {
                jpg: {
                    quality: 80
                },
                png: {
                    quality: 80
                }
            }
        }
    }
}
