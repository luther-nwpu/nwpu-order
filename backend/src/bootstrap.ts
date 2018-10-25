import * as tsConfigPaths from 'tsconfig-paths'
tsConfigPaths.register({
    baseUrl: './dist',
    paths: require('../tsconfig.json').compilerOptions.paths
})
