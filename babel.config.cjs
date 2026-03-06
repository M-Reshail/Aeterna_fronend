module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    // Transform import.meta.env for Jest (Vite uses this, Jest doesn't support it natively)
    function transformImportMeta() {
      return {
        visitor: {
          MetaProperty(path) {
            if (
              path.node.meta.name === 'import' &&
              path.node.property.name === 'meta'
            ) {
              path.replaceWithSourceString(
                JSON.stringify({
                  env: {
                    VITE_API_URL: 'http://localhost:8000',
                    VITE_WS_URL: 'http://localhost:8000',
                    MODE: 'test',
                    DEV: false,
                    PROD: false,
                  },
                })
              );
            }
          },
        },
      };
    },
  ],
};
