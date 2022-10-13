module.exports = {
  webpack: (config, { webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      child_process: false,
      readline: false,
    };
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^electron$/ })
    );
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
