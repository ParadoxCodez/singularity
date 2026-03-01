import withPWA from 'next-pwa'

const pwaConfig = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
    // keep whatever was already here
}

export default pwaConfig(nextConfig)