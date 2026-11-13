import type { ButtonHTMLAttributes, ReactNode } from 'react'
export function ActionButton({children,variant='',className='',...props}: ButtonHTMLAttributes<HTMLButtonElement> & {variant?: 'primary'|'secondary'|''; children: ReactNode}) {
 return <button type="button" {...props} className={`action-button ${variant} ${className}`}>{children}</button>
}
