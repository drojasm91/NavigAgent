export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/navigation/page-header'
import { SignOutButton } from '@/components/settings/sign-out-button'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <>
      <PageHeader />
      <div className="max-w-lg mx-auto px-4 pb-24">
        <div className="space-y-6 pt-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="text-sm font-medium">{user.email}</p>
        </div>
        <SignOutButton />
        </div>
      </div>
    </>
  )
}
