'use client'

import { useLogout } from '@/hooks'
import { CONFIG } from '@/utils/config'
import { useOutsideClick } from '@/utils/useOutsideClick'
import { LogoutOutlined } from '@mui/icons-material'
import { UserRead } from '@polar-sh/sdk'
import Link from 'next/link'
import Avatar from 'polarkit/components/ui/atoms/avatar'
import { Separator } from 'polarkit/components/ui/separator'
import { useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { useBackerRoutes } from '../Dashboard/navigation'
import { LinkItem, ListItem, Profile, TextItem } from './Navigation'

const PublicProfileDropdown = ({
  className,
  authenticatedUser,
  showAllBackerRoutes = false,
}: {
  className?: string
  authenticatedUser: UserRead | undefined
  showAllBackerRoutes?: boolean
}) => {
  const classNames = twMerge('relative', className)
  const logout = useLogout()

  const [isOpen, setOpen] = useState<boolean>(false)

  const ref = useRef(null)

  useOutsideClick([ref], () => {
    setOpen(false)
  })

  const onLogout = async () => {
    await logout()
  }

  const loggedUser = authenticatedUser

  const backerRoutes = useBackerRoutes()
  const filteredBackerRoutes = showAllBackerRoutes ? backerRoutes : []

  if (!loggedUser) {
    return <></>
  }

  return (
    <>
      <div className={classNames}>
        <div
          className={twMerge(
            'dark:border-polar-700 dark:hover:border-polar-600 relative flex flex-shrink-0 cursor-pointer flex-row items-center rounded-full border-2 border-blue-50 shadow-sm transition-colors hover:border-blue-100',
          )}
          onClick={() => setOpen(true)}
        >
          <Avatar
            className="h-9 w-9"
            name={loggedUser.username}
            avatar_url={loggedUser.avatar_url}
          />
        </div>

        {isOpen && (
          <div
            ref={ref}
            className={twMerge(
              'dark:bg-polar-900 dark:text-polar-400 dark:border-polar-700 absolute right-0 top-12 z-50 w-[300px] overflow-hidden rounded-3xl bg-white p-2 shadow-xl dark:border',
            )}
          >
            <Link
              href={`${CONFIG.FRONTEND_BASE_URL}/purchases`}
              className="w-full"
            >
              <ListItem current={true}>
                <Profile
                  name={loggedUser.username}
                  avatar_url={loggedUser.avatar_url}
                />
              </ListItem>
            </Link>

            <ul className="mt-2 flex w-full flex-col">
              {filteredBackerRoutes.map((n) => (
                <LinkItem
                  href={`${CONFIG.FRONTEND_BASE_URL}${n.link}`}
                  icon={n.icon}
                  key={n.link}
                >
                  <span className="mx-2 text-sm">{n.title}</span>
                </LinkItem>
              ))}

              <Separator className="my-2" />

              <TextItem
                onClick={onLogout}
                icon={<LogoutOutlined fontSize="small" />}
              >
                <span className="mx-2 py-2">Log out</span>
              </TextItem>
            </ul>
          </div>
        )}
      </div>
    </>
  )
}

export default PublicProfileDropdown
