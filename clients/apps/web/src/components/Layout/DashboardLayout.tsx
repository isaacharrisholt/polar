'use client'

import LogoIcon from '@/components/Brand/LogoIcon'
import { useAuth } from '@/hooks/auth'
import { useProducts } from '@/hooks/queries'
import { MaintainerOrganizationContext } from '@/providers/maintainerOrganization'
import { CloseOutlined, ShortTextOutlined } from '@mui/icons-material'
import { Organization, Repository } from '@polar-sh/sdk'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Button from 'polarkit/components/ui/atoms/button'
import {
  PropsWithChildren,
  Suspense,
  UIEventHandler,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { twMerge } from 'tailwind-merge'
import { CommandPaletteTrigger } from '../CommandPalette/CommandPaletteTrigger'
import MaintainerNavigation from '../Dashboard/DashboardNavigation'
import { DashboardProvider, useDashboard } from '../Dashboard/DashboardProvider'
import MaintainerRepoSelection from '../Dashboard/MaintainerRepoSelection'
import DashboardProfileDropdown from '../Navigation/DashboardProfileDropdown'
import { BrandingMenu } from './Public/BrandingMenu'

const ProductsUpsell = ({ organization }: { organization: Organization }) => {
  return (
    <div className="dark:from-polar-800 dark:to-polar-800 mx-6 flex flex-row gap-y-8 rounded-3xl bg-gradient-to-r from-blue-200 to-blue-400 p-6 text-white">
      <div className="flex w-full flex-col gap-y-6">
        <h3 className="leading-normal [text-wrap:balance]">
          Kickstart your business by selling products
        </h3>
        <Link href={`/dashboard/${organization.slug}/products/new`}>
          <Button className="self-start" size="sm">
            <div className="flex flex-row items-center gap-2">
              <span>Create a product</span>
            </div>
          </Button>
        </Link>
      </div>
    </div>
  )
}

const DashboardSidebar = () => {
  const [scrollTop, setScrollTop] = useState(0)
  const { currentUser } = useAuth()

  const orgContext = useContext(MaintainerOrganizationContext)
  const currentOrg = orgContext.organization
  const { showCommandPalette } = useDashboard()

  const handleScroll: UIEventHandler<HTMLDivElement> = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const shouldRenderUpperBorder = useMemo(() => scrollTop > 0, [scrollTop])

  const upperScrollClassName = shouldRenderUpperBorder
    ? 'border-b dark:border-b-polar-700 border-b-gray-200'
    : ''

  const products = useProducts(currentOrg.id)
  const nonFreeProducts = products.data?.items.filter(
    (product) => product.type !== 'free',
  )

  if (!currentUser) {
    return <></>
  }

  return (
    <aside
      className={twMerge(
        'dark:bg-polar-900 rounded-4xl flex h-full w-full flex-shrink-0 flex-col justify-between gap-y-4 overflow-y-auto bg-white md:w-[320px] md:overflow-y-visible',
      )}
    >
      <div className="flex h-full flex-col">
        <div className={upperScrollClassName}>
          <div className="relative z-10 mt-5 hidden translate-x-0 flex-row items-center justify-between space-x-2 pl-7 pr-8 md:flex">
            <BrandingMenu />
          </div>
          <div className="mb-4 mt-8 flex px-6">
            <DashboardProfileDropdown />
          </div>
        </div>

        <div
          className="flex w-full flex-grow flex-col gap-y-12 py-8 md:h-full md:justify-between md:overflow-y-auto"
          onScroll={handleScroll}
        >
          <div className="flex flex-col gap-y-12">
            <MaintainerNavigation />
            {currentOrg && (nonFreeProducts?.length ?? 0) < 1 && (
              <ProductsUpsell organization={currentOrg} />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex px-8">
              <CommandPaletteTrigger
                title="API & Documentation"
                className="w-full cursor-text"
                onClick={showCommandPalette}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

const DashboardLayout = (props: PropsWithChildren<{ className?: string }>) => {
  const { organization } = useContext(MaintainerOrganizationContext)
  return (
    <DashboardProvider organization={organization}>
      <div className="relative flex h-full w-full flex-col md:flex-row md:p-4">
        <MobileNav />
        <div className="hidden md:flex">
          <DashboardSidebar />
        </div>
        <div
          className={twMerge(
            'relative flex h-full w-full translate-x-0 flex-row overflow-hidden pt-8 md:pt-0',
            props.className,
          )}
        >
          {/* On large devices, scroll here. On small devices the _document_ is the only element that should scroll. */}
          <main className="relative w-full md:overflow-auto">
            <Suspense>{props.children}</Suspense>
          </main>
        </div>
      </div>
    </DashboardProvider>
  )
}

export default DashboardLayout

const MobileNav = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  const header = (
    <div className="dark:bg-polar-900 fixed left-0 right-0 top-0 flex flex-row items-center justify-between bg-white px-2 py-4 sm:px-3 md:px-4">
      <a
        href="/"
        className="flex-shrink-0 items-center font-semibold text-blue-500 dark:text-blue-400"
      >
        <LogoIcon className="h-10 w-10" />
      </a>

      <div
        className="dark:text-polar-200 flex flex-row items-center justify-center text-gray-700"
        onClick={() => setMobileNavOpen((toggle) => !toggle)}
      >
        {mobileNavOpen ? <CloseOutlined /> : <ShortTextOutlined />}
      </div>
    </div>
  )

  return (
    <div className="dark:bg-polar-900 relative z-10 flex flex-row items-center justify-between space-x-2 bg-white px-4 py-5 sm:px-6 md:hidden md:px-8">
      {mobileNavOpen ? (
        <div className="relative flex h-full w-full flex-col">
          <div className="fixed inset-0 z-10 flex h-full flex-col">
            <div className="dark:bg-polar-900 relative z-10 flex flex-row items-center justify-between space-x-2 bg-white px-4 pt-5 sm:px-6 md:hidden md:px-8">
              {header}
            </div>
            <div className="flex h-full flex-col overflow-y-auto pt-8">
              <DashboardSidebar />
            </div>
          </div>
        </div>
      ) : (
        header
      )}
    </div>
  )
}

export const RepoPickerHeader = (props: {
  currentRepository?: Repository
  repositories: Repository[]
  children?: React.ReactNode
}) => {
  const onSubmit = () => {}

  return (
    <>
      <form
        className="dark:border-polar-700 flex flex-row items-center justify-between space-x-4 space-y-0 bg-transparent"
        onSubmit={onSubmit}
      >
        <MaintainerRepoSelection
          current={props.currentRepository}
          repositories={props.repositories}
        />
        {props.children}
      </form>
    </>
  )
}

export const DashboardHeader = (props: { children?: React.ReactNode }) => {
  return (
    <div className={twMerge('sticky left-[300px] right-0 top-20 z-10')}>
      {props.children}
    </div>
  )
}

export const DashboardBody = (props: {
  children?: React.ReactNode
  className?: string
}) => {
  return (
    <div
      className={twMerge(
        'relative mx-auto max-w-screen-xl px-4 pb-6 sm:px-6 md:px-16',
        props.className,
      )}
    >
      {props.children}
    </div>
  )
}

export const DashboardPaddingX = (props: {
  children?: React.ReactNode
  className?: string
}) => {
  return (
    <div className={twMerge('px-4 sm:px-6 md:px-8', props.className)}>
      {props.children}
    </div>
  )
}
