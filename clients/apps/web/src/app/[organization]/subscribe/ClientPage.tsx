'use client'

import LogoIcon from '@/components/Brand/LogoIcon'
import CheckoutButton from '@/components/Products/CheckoutButton'
import SubscriptionTierCard from '@/components/Subscriptions/SubscriptionTierCard'
import SubscriptionTierRecurringIntervalSwitch from '@/components/Subscriptions/SubscriptionTierRecurringIntervalSwitch'
import { hasRecurringInterval } from '@/components/Subscriptions/utils'
import { useAuth } from '@/hooks'
import { useRecurringInterval } from '@/hooks/products'
import { organizationPageLink } from '@/utils/nav'
import { ListResourceProduct, Organization } from '@polar-sh/sdk'
import Link from 'next/link'
import Avatar from 'polarkit/components/ui/atoms/avatar'
import Button from 'polarkit/components/ui/atoms/button'
import { useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'

export default function ClientPage({
  organization,
  products,
}: {
  organization: Organization
  products: ListResourceProduct
}) {
  const [selectedTierIndex, selectTierIndex] = useState(0)
  const { userOrganizations: orgs } = useAuth()

  const shouldRenderSubscribeButton = useMemo(
    () => !orgs.map((o) => o.id).includes(organization.id),
    [organization, orgs],
  )

  const highlightedTiers = useMemo(() => {
    return products.items.filter((tier) => tier.is_highlighted) ?? []
  }, [products])
  const [recurringInterval, setRecurringInterval, hasBothIntervals] =
    useRecurringInterval(highlightedTiers)

  const selectedTier = useMemo(
    () => highlightedTiers[selectedTierIndex],
    [highlightedTiers, selectedTierIndex],
  )

  return (
    <div className="flex w-full flex-col items-center gap-y-16 py-16">
      <div className="flex flex-row items-center justify-center">
        <a href="/">
          <LogoIcon className="text-blue-500 dark:text-blue-400" size={40} />
        </a>
      </div>
      <div className="flex flex-col items-center gap-y-6 text-center">
        <Link href={organizationPageLink(organization)}>
          <Avatar
            className="h-16 w-16"
            avatar_url={organization.avatar_url}
            name={organization.name}
          />
        </Link>
        <div className="flex flex-col items-center gap-y-2">
          <h3 className="text-2xl">Thank you for your subscription</h3>
          <p className="dark:text-polar-500 text-lg text-gray-500">
            Consider subscribing to a paid tier to support {organization.name}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-y-12">
        {hasBothIntervals && (
          <SubscriptionTierRecurringIntervalSwitch
            recurringInterval={recurringInterval}
            onChange={setRecurringInterval}
          />
        )}
        <div className="flex max-w-5xl flex-row flex-wrap gap-8">
          {highlightedTiers
            .filter(hasRecurringInterval(recurringInterval))
            .map((tier, index) => (
              <div
                className={twMerge(
                  'rounded-4xl flex w-full cursor-pointer flex-col transition-shadow md:w-[300px]',
                  selectedTierIndex === index
                    ? 'shadow-2xl grayscale-0'
                    : 'grayscale hover:grayscale-0',
                )}
                key={tier.id}
                onClick={() => selectTierIndex(index)}
              >
                <SubscriptionTierCard
                  className={twMerge(
                    'h-full w-full self-stretch',
                    selectedTierIndex === index && 'border-transparent',
                  )}
                  subscriptionTier={tier}
                  recurringInterval={recurringInterval}
                />
              </div>
            ))}
        </div>
      </div>
      <div className="flex w-48 flex-col items-center gap-y-4">
        {selectedTier &&
          shouldRenderSubscribeButton &&
          (selectedTier.type === 'free' ? (
            <Link className="w-full" href={organizationPageLink(organization)}>
              <Button fullWidth>Subscribe</Button>
            </Link>
          ) : (
            <CheckoutButton
              organization={organization}
              product={selectedTier}
              recurringInterval={recurringInterval}
              checkoutPath="/api/checkout"
              variant="default"
            >
              Subscribe
            </CheckoutButton>
          ))}
        <Link href={organizationPageLink(organization)}>
          <Button variant="ghost">Skip</Button>
        </Link>
      </div>
    </div>
  )
}
