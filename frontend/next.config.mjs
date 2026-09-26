const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_BUILD_DIR ?? '.next',
  async headers() {
    return [{
      source: '/proposal/:token',
      headers: [
        { key: 'Cache-Control', value: 'private, no-store' },
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
      ],
    }]
  },
}

export default nextConfig
