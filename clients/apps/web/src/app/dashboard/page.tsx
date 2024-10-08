import { getServerSideAPI } from '@/utils/api/serverside'
import { getUserOrganizations } from '@/utils/user'
import { redirect } from 'next/navigation'

export default async function Page() {
  const api = getServerSideAPI()
  const userOrganizations = await getUserOrganizations(api)

  if (userOrganizations.length === 0) {
    redirect('/dashboard/create')
  }

  redirect(`/dashboard/${userOrganizations[0].slug}`)
}
