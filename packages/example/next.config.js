module.exports = {
  target: 'serverless',
  webpack: (config, { webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      child_process: false,
      readline: false,
      // TODO need workaround for https://github.com/celo-org/celo-monorepo/issues/8269
      // fallbacks don't seem to work. For now just manually placed file in node_modules
    };
    config.plugins.push(new webpack.IgnorePlugin(/^electron$/));
    return config;
  },

  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/',
      },
    ];
  },
};
