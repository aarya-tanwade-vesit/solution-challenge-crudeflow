/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // Dev-friendly API proxy: lets the browser call same-origin `/api/v1/*`
    // while Next forwards to the backend (avoids CORS + IPv6 localhost issues).
    const backendOrigin = process.env.CRUDEFLOW_BACKEND_ORIGIN || 'http://127.0.0.1:8000'

    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
