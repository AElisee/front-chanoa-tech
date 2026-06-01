import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth-server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AuthInitializer from '@/components/AuthInitializer'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login?redirect=/admin')
  if (user.role !== 'admin') redirect('/')

  return (
    <div className="flex min-h-screen">
      <AuthInitializer />
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
    </div>
  )
}
