'use client'

import { ReactNode } from 'react'
import { useRole } from '@/contexts/RoleContext'

interface RoleGateProps {
  children: ReactNode
  allowedRoles: ('contributor' | 'reader')[]
}

export default function RoleGate({ children, allowedRoles }: RoleGateProps) {
  const { role } = useRole()

  if (!role || !allowedRoles.includes(role as 'contributor' | 'reader')) {
    return null
  }

  return <>{children}</>
}