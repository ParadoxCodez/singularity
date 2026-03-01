'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationProgress() {
    const pathname = usePathname()
    const [loading, setLoading] = useState(false)
    const [width, setWidth] = useState(0)

    useEffect(() => {
        setLoading(true)
        setWidth(0)

        const t1 = setTimeout(() => setWidth(70), 50)
        const t2 = setTimeout(() => {
            setWidth(100)
            setTimeout(() => setLoading(false), 300)
        }, 400)

        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
        }
    }, [pathname])

    if (!loading) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none">
            <div
                className="h-full bg-purple-500 transition-all duration-300 ease-out"
                style={{
                    width: `${width}%`,
                    boxShadow: '0 0 8px rgba(124, 58, 237, 0.8)',
                }}
            />
        </div>
    )
}
