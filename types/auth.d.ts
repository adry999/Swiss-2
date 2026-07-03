declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'sales_manager'
    sellerId: string | null
  }
}

export {}
