import React from 'react'
import { cn } from '@/lib/utils'

export function Button({ className, variant = 'default', ...props }) {
  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        variant === 'default' && "bg-primary text-primary-foreground",
        className
      )} 
      {...props} 
    />
  )
}