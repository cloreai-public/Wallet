/** @type {import('next').NextConfig} */

module.exports = {
  basePath: '',
  distDir: 'out',
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '**',
      },
    ],
    unoptimized: true,
  },
  output: 'export',
  crossOrigin: 'anonymous',
  swcMinify: false,
  transpilePackages: [
    '@ionic/react',
    '@ionic/core',
    '@stencil/core',
    'ionicons',
  ],
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      config.optimization.minimize = false;
    }
    // config.externals = {
    //   argon2: 'commonjs argon2',
    // };

    return config;
  },
};
