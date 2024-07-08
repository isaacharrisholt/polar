'use client'

import { PolarMenu } from '@/app/[organization]/(sidebar)/LayoutPolarMenu'
import { useClientSideLoadedUser } from '@/hooks/docs'
import { useListAdminOrganizations } from '@/hooks/queries'
import { Skeleton } from 'polarkit/components/ui/skeleton'

const UserMenu = () => {
  const { user, loaded } = useClientSideLoadedUser()
  const { data: organizations } = useListAdminOrganizations(
    loaded && user !== undefined,
  )

  if (!loaded) {
    return (
      <div className="flex h-9 flex-row items-center gap-x-6">
        <div className="relative flex w-max flex-shrink-0 flex-row items-center justify-between gap-x-6">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <PolarMenu
      authenticatedUser={user}
      userAdminOrganizations={organizations?.items ?? []}
    />
  )
}

export default UserMenu