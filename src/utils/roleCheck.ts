export const isContributor = (role: string | null): boolean => role === 'contributor'
export const isReader = (role: string | null): boolean => role === 'reader'
export const canAccessCMS = (role: string | null): boolean => isContributor(role) 