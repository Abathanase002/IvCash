'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'gradient' | 'elevated'
    hover?: boolean
    glow?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', hover = false, glow = false, padding = 'md', children, ...props }, ref) => {
        const baseStyles = 'rounded-2xl transition-all duration-300'

        const variants = {
            default: 'bg-white border border-gray-100 shadow-card',
            glass: 'glass shadow-glass',
            gradient: 'bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white shadow-lg',
            elevated: 'bg-white shadow-glass-lg border border-gray-50',
        }

        const paddings = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        }

        const hoverStyles = hover ? 'hover:shadow-card-hover hover:-translate-y-1 cursor-pointer' : ''
        const glowStyles = glow ? 'shadow-glow' : ''

        return (
            <div
                ref={ref}
                className={clsx(baseStyles, variants[variant], paddings[padding], hoverStyles, glowStyles, className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

export default Card

