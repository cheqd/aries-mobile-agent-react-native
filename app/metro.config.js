const path = require('path');
const escape = require('escape-string-regexp')
const exclusionList = require('metro-config/src/defaults/exclusionList')
const packageDirs = [
  path.resolve(__dirname, '../core'),
]

const watchFolders = [
  ...packageDirs,
];

const extraExclusionlist = []
const extraNodeModules = {}

for (const packageDir of packageDirs) {
  const pak = require(path.join(packageDir, 'package.json'))
  const modules = Object.keys({
    ...pak.peerDependencies, ...pak.devDependencies
  })
  extraExclusionlist.push(...modules.map((m) => path.join(packageDir, 'node_modules', m)))
  
  modules.reduce((acc, name) => {
    acc[name] = path.join(__dirname, 'node_modules', name)
    return acc
  }, extraNodeModules)
}
console.dir(extraExclusionlist)
console.dir(extraNodeModules)
const { getDefaultConfig } = require('metro-config')
module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig()
  const metroConfig = {
    projectRoot: path.resolve(__dirname, './'),
    /*resetCache: true,*/
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      blacklistRE: exclusionList(extraExclusionlist.map((m) => new RegExp(`^${escape(m)}\\/.*$`))),
      extraNodeModules: {
        ...extraNodeModules,
        buffer: path.resolve(__dirname, '/node_modules/buffer'),
        stream: path.resolve(__dirname, '/node_modules/stream-browserify'),
      },
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg', 'cjs'],
      resolveRequest: (context, moduleName, platform) => {
        if(moduleName == 'crypto') {
            return {
                filePath: __dirname + '/node_modules/@cosmjs/crypto/build/index.js',
                type: 'sourceFile',
              };
        }

        if(moduleName == 'strtok3') {
            return {
                filePath: __dirname + '/node_modules/strtok3/lib/index.js',
                type: 'sourceFile',
              };
        }

        if(moduleName == 'strtok3/core') {
            return {
                filePath: __dirname + '/node_modules/strtok3/lib/core.js',
                type: 'sourceFile',
              };
        }

        if(moduleName == 'token-types') {
            return {
                filePath: __dirname + '/node_modules/token-types/lib/index.js',
                type: 'sourceFile',
              };
        }

        return require('metro-resolver').resolve({
            ...context,
            resolveRequest:undefined
          },moduleName,platform);
      }
    },
    watchFolders,
  };
  // eslint-disable-next-line no-console
  //console.dir(metroConfig)
  return metroConfig
})()