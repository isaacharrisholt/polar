'use client'

import {
  useProductAudience,
  useRecurringBillingLabel,
  useRecurringProductPrice,
} from '@/hooks/products'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DragIndicatorOutlined } from '@mui/icons-material'
import {
  Product,
  ProductPriceRecurringInterval,
  SubscriptionTierType,
} from '@polar-sh/sdk'
import Markdown from 'markdown-to-jsx'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from 'polarkit/components/ui/atoms/card'
import { Separator } from 'polarkit/components/ui/separator'
import { Skeleton } from 'polarkit/components/ui/skeleton'
import { formatCurrencyAndAmount } from 'polarkit/lib/money'
import { MouseEventHandler, useCallback, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { resolveBenefitIcon } from '../Benefit/utils'
import { markdownOpts } from '../Feed/Markdown/markdown'
import SubscriptionGroupIcon from './SubscriptionGroupIcon'
import { getSubscriptionColorByType } from './utils'

export interface SubscriptionTierCardProps {
  subscriptionTier: Partial<Product> & { type: SubscriptionTierType }
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'small'
  isEditing?: boolean
  draggable?: ReturnType<typeof useSortable>
  recurringInterval?: ProductPriceRecurringInterval
}

const hexToRGBA = (hex: string, opacity: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16,
      )}, ${opacity})`
    : ''
}

const SubscriptionTierCard: React.FC<SubscriptionTierCardProps> = ({
  subscriptionTier,
  children,
  className,
  variant = 'default',
  isEditing = false,
  draggable,
  recurringInterval = ProductPriceRecurringInterval.MONTH,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const subscriptionColor = getSubscriptionColorByType(subscriptionTier.type)
  const [shineActive, setShineActive] = useState(false)

  const audience = useProductAudience(subscriptionTier.type)
  const price = useRecurringProductPrice(subscriptionTier, recurringInterval)
  const recurringBillingLabel = useRecurringBillingLabel(
    price ? price.recurring_interval : null,
  )

  const style = {
    '--var-bg-color': hexToRGBA(subscriptionColor, 0.2),
    '--var-border-color': hexToRGBA(subscriptionColor, 0.2),
    '--var-muted-color': hexToRGBA(subscriptionColor, 0.7),
    '--var-fg-color': subscriptionColor,
    '--var-dark-glow-color': hexToRGBA(subscriptionColor, 0.05),
    '--var-dark-border-color': hexToRGBA(subscriptionColor, 0.15),
    '--var-dark-muted-color': hexToRGBA(subscriptionColor, 0.5),
    '--var-dark-fg-color': subscriptionColor,
    ...(draggable
      ? {
          transform: CSS.Transform.toString(draggable.transform),
          transition: draggable.transition,
        }
      : {}),
  } as React.CSSProperties

  const onMouseMove: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (containerRef.current) {
        const { x, y } = containerRef.current.getBoundingClientRect()
        containerRef.current.style.setProperty('--x', String(e.clientX - x))
        containerRef.current.style.setProperty('--y', String(e.clientY - y))
      }
    },
    [containerRef],
  )

  const onMouseEnter = useCallback(() => {
    setShineActive(true)
  }, [setShineActive])

  const onMouseLeave = useCallback(() => {
    setShineActive(false)
  }, [setShineActive])

  const variantStyles = {
    default: {
      name: 'text-lg',
      card: 'p-8 min-h-[400px]',
      priceLabel: 'text-5xl !font-[200]',
      description: 'text-sm',
      footer: 'mt-4',
    },
    small: {
      name: 'text-md',
      card: 'p-6 min-h-[360px]',
      priceLabel: 'text-4xl !font-[200]',
      description: 'text-sm',
      footer: 'mt-none',
    },
  }

  return (
    <Card
      ref={(v) => {
        if (draggable) {
          draggable.setNodeRef(v)
        }

        containerRef.current = v
      }}
      id={subscriptionTier.name}
      className={twMerge(
        'dark:bg-polar-900 rounded-4xl relative flex flex-col gap-y-6 overflow-hidden border-none hover:bg-gray-50',
        draggable?.isDragging && 'opacity-30',
        variantStyles[variant]['card'],
        className,
      )}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    >
      <Shine active={shineActive} />
      <CardHeader className="grow gap-y-6 p-0">
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-row items-center justify-between">
            <span className="dark:text-polar-500 text-xs text-gray-500">
              {audience}
            </span>
            {draggable && (
              <span
                ref={draggable.setDraggableNodeRef}
                className="cursor-grab"
                {...draggable.attributes}
                {...draggable.listeners}
              >
                <DragIndicatorOutlined
                  className={twMerge('dark:text-polar-600 text-gray-400')}
                  fontSize="small"
                />
              </span>
            )}
          </div>
          <div className="flex justify-between">
            <h3
              className={twMerge(
                'truncate font-medium',
                variantStyles[variant]['name'],
              )}
            >
              {subscriptionTier.name ? (
                subscriptionTier.name
              ) : (
                <Skeleton className="inline-block h-4 w-[150px] bg-[var(--var-muted-color)] dark:bg-[var(--var-dark-muted-color)]" />
              )}
            </h3>
            <SubscriptionGroupIcon
              className="h-8! w-8! ml-2 text-2xl"
              type={subscriptionTier.type}
            />
          </div>
        </div>
        <div className="flex flex-col gap-y-8 text-[--var-fg-color] dark:text-[--var-dark-fg-color]">
          <div className={variantStyles[variant]['priceLabel']}>
            {price ? (
              <>
                {formatCurrencyAndAmount(
                  price.price_amount,
                  price.price_currency,
                  0,
                )}
                <span className="dark:text-polar-500 ml-2 text-xl font-normal text-gray-500">
                  {recurringBillingLabel}
                </span>
              </>
            ) : (
              '$0'
            )}
          </div>

          {subscriptionTier.description ? (
            <div
              className={twMerge(
                variantStyles[variant].description,
                'prose dark:prose-invert prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-h5:text-md prose-h6:text-sm dark:prose-headings:text-polar-50 dark:text-polar-300 max-h-64 max-w-4xl overflow-hidden text-gray-800',
              )}
            >
              <Markdown
                options={{
                  ...markdownOpts,
                  overrides: {
                    ...markdownOpts.overrides,
                    a: (props) => (
                      <a {...props} rel="noopener noreferrer nofollow" />
                    ),
                  },
                }}
              >
                {subscriptionTier.description}
              </Markdown>
            </div>
          ) : (
            <>
              {isEditing ? (
                <>
                  <div className="flex flex-col gap-2">
                    <Skeleton className="inline-block h-2 w-full bg-[var(--var-muted-color)] dark:bg-[var(--var-dark-muted-color)]" />
                    <Skeleton className="inline-block h-2 w-full bg-[var(--var-muted-color)] dark:bg-[var(--var-dark-muted-color)]" />
                    <Skeleton className="inline-block h-2 w-full bg-[var(--var-muted-color)] dark:bg-[var(--var-dark-muted-color)]" />
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </CardHeader>

      {(subscriptionTier.benefits?.length ?? 0) > 0 &&
        subscriptionTier.description && (
          <Separator className="dark:bg-polar-700 bg-gray-200" />
        )}
      <CardContent className="flex h-full grow flex-col gap-y-2 p-0">
        {subscriptionTier.benefits?.map((benefit) => (
          <div
            key={benefit.id}
            className="flex flex-row items-start text-[--var-fg-color] dark:text-[--var-dark-fg-color]"
          >
            <span className="flex h-6 w-6 shrink-0 flex-row items-center justify-center rounded-full bg-[--var-border-color] text-[14px] dark:bg-[--var-dark-border-color]">
              {resolveBenefitIcon(benefit, 'inherit')}
            </span>
            <span className="ml-3 text-sm leading-relaxed">
              {benefit.description}
            </span>
          </div>
        ))}
      </CardContent>
      {children && (
        <CardFooter
          className={twMerge(
            'flex w-full flex-row p-0',
            variantStyles[variant].footer,
          )}
        >
          {children}
        </CardFooter>
      )}
    </Card>
  )
}

export default SubscriptionTierCard

const Shine = ({ active = false }: { active: boolean }) => {
  return (
    <div
      style={{
        content: '',
        top: `calc(var(--y, 0) * 1px - 400px)`,
        left: `calc(var(--x, 0) * 1px - 400px)`,
        background: `radial-gradient(var(--var-dark-glow-color), #ffffff00 70%)`,
      }}
      className={twMerge(
        'pointer-events-none absolute h-[800px] w-[800px] opacity-0 transition-opacity duration-300',
        active && 'dark:opacity-100',
      )}
    />
  )
}
