import Link from 'next/link'
import { Pill } from 'polarkit/components/ui/atoms'
import { twMerge } from 'tailwind-merge'
import { RouteWithActive } from './navigation'

export interface NavigationContainerProps {
  routes: RouteWithActive[]
  title?: string
  dummyRoutes?: {
    title: string
    icon: React.ReactElement
  }[]
}

export const NavigationContainer = ({
  title,
  routes,
  dummyRoutes,
}: NavigationContainerProps) => {
  return (
    <div className="mx-8 flex flex-col gap-y-4">
      {title && (
        <span
          className="dark:text-polar-500 text-xxs uppercase tracking-widest text-gray-400"
          style={{
            fontFeatureSettings: `'ss02'`,
          }}
        >
          {title}
        </span>
      )}
      <div className="flex flex-col gap-y-3">
        <div className="flex flex-col gap-y-3">
          {routes.map((route) => {
            return (
              <Link
                key={route.link}
                className={twMerge(
                  'flex flex-row items-center gap-x-3 rounded-lg transition-colors',
                  route.isActive
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'dark:text-polar-500 dark:hover:text-polar-200 text-gray-600 hover:text-blue-500',
                )}
                href={route.link}
              >
                {'icon' in route && route.icon ? (
                  <span
                    className={twMerge(
                      'flex flex-col items-center justify-center rounded-full bg-transparent text-[18px]',
                      route.isActive ? 'dark:text-blue-400' : 'bg-transparent',
                    )}
                  >
                    {route.icon}
                  </span>
                ) : undefined}
                <span className="text-sm font-medium">{route.title}</span>
              </Link>
            )
          })}
        </div>
        {dummyRoutes && (
          <div className="flex flex-col gap-y-3">
            {dummyRoutes.map((route) => {
              return (
                <div
                  key={route.title}
                  className={twMerge(
                    'dark:text-polar-600 flex cursor-default flex-row items-center justify-between gap-x-3 rounded-lg text-gray-400 transition-colors',
                  )}
                >
                  <span className="flex flex-row items-center gap-x-3">
                    {'icon' in route && route.icon ? (
                      <span
                        className={twMerge(
                          'flex flex-col items-center justify-center rounded-full bg-transparent text-[18px]',
                        )}
                      >
                        {route.icon}
                      </span>
                    ) : undefined}
                    <span className="text-sm font-medium">{route.title}</span>
                  </span>
                  <Pill className="self-end px-2 py-1" color="gray">
                    Coming Soon
                  </Pill>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
