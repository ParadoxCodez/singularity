import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://singularity.vercel.app'

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/auth'],
                disallow: ['/habits', '/journal', '/spending', '/analytics', '/settings'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
