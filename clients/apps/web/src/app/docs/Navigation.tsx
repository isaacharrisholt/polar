'use client'

import { usePathname } from 'next/navigation'
import { sections } from './APINavigation'
import { NaviagtionItem } from './NavigationItem'

export const Navigation = () => {
  const pathname = usePathname()

  const shouldRenderOverviewSections = pathname.includes('/docs/overview')
  const shouldRenderAPISections = pathname.includes('/docs/api-reference/')

  return (
    <div className="flex flex-col gap-y-8">
      {shouldRenderOverviewSections && (
        <>
          <OverviewSections />
          <FAQSections />
        </>
      )}
      {shouldRenderAPISections && <APISections />}
    </div>
  )
}

const OverviewSections = () => {
  return (
    <>
      <div className="flex flex-col">
        <NaviagtionItem href="/docs/overview/introduction">
          Introduction
        </NaviagtionItem>
        <NaviagtionItem href="/docs/overview/funding">
          Issue Funding
        </NaviagtionItem>
        <NaviagtionItem href="/docs/overview/donations">
          Donations
        </NaviagtionItem>
        <NaviagtionItem href="/docs/overview/benefits">Benefits</NaviagtionItem>
        <NaviagtionItem href="/docs/overview/subscriptions">
          Subscriptions
        </NaviagtionItem>
        <NaviagtionItem href="/docs/overview/newsletters">
          Newsletters
        </NaviagtionItem>
        <NaviagtionItem href="/docs/overview/ads">Ads</NaviagtionItem>
        <NaviagtionItem href="/docs/overview/payments-taxes">
          Payments & Taxes
        </NaviagtionItem>
      </div>
    </>
  )
}

const FAQSections = () => {
  return (
    <div className="flex flex-col gap-y-4">
      <h2 className="font-medium">FAQ</h2>
      <div className="flex flex-col">
        <NaviagtionItem href="/docs/overview/faq/overview">
          Overview
        </NaviagtionItem>
        <NaviagtionItem href="/docs/overview/faq/for-maintainers">
          For Maintainers
        </NaviagtionItem>
        <NaviagtionItem href="/docs/overview/faq/for-backers">
          For Backers
        </NaviagtionItem>
        <NaviagtionItem href="/docs/overview/faq/for-contributors">
          For Contributors
        </NaviagtionItem>
      </div>
    </div>
  )
}

const APISections = () => {
  return (
    <>
      {sections.map((section) => (
        <div key={section.name} className="flex flex-col gap-y-4">
          <h2 className="font-medium capitalize">{section.name}</h2>
          <div className="flex flex-col">
            {section.endpoints.map((endpoint) => (
              <NaviagtionItem
                key={endpoint.path + endpoint.method}
                className="text-sm"
                href={`/docs/api-reference/${endpoint.path}/${endpoint.method}`}
                active={(pathname) =>
                  pathname.includes(`${endpoint.path}/${endpoint.method}`)
                }
              >
                <div className="flex w-full flex-row items-center justify-between gap-x-4">
                  {endpoint.name}
                  <span className="dark:bg-polar-800 rounded-sm bg-gray-200/50 px-1.5 py-0 font-mono text-[10px] font-normal uppercase">
                    {endpoint.method}
                  </span>
                </div>
              </NaviagtionItem>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}