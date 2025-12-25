'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, iconPosition = 'left', type = 'text', ...props }, ref) => {
        const hasIcon = !!icon

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {hasIcon && iconPosition === 'left' && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={type}
                        className={clsx(
                            'w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl',
                            'text-gray-900 placeholder-gray-400',
                            'transition-all duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                            'hover:border-gray-300',
                            hasIcon && iconPosition === 'left' && 'pl-12',
                            hasIcon && iconPosition === 'right' && 'pr-12',
                            error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
                            className
                        )}
                        {...props}
                    />
                    {hasIcon && iconPosition === 'right' && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {icon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input

