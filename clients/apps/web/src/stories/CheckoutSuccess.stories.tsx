import { PolarQueryClientProvider } from '@/app/providers'
import CheckoutSuccess from '@/components/Checkout/CheckoutSuccess'
import { UserContextProvider } from '@/providers/auth'
import { org } from '@/utils/testdata'
import type { Meta, StoryObj } from '@storybook/react'
const meta: Meta<typeof CheckoutSuccess> = {
  title: 'Organisms/CheckoutSuccess',
  component: CheckoutSuccess,
  tags: ['autodocs'],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  render: (args) => {
    return (
      <UserContextProvider user={undefined} userOrganizations={[]}>
        <PolarQueryClientProvider>
          <CheckoutSuccess {...args} />
        </PolarQueryClientProvider>
      </UserContextProvider>
    )
  },
}

export default meta

type Story = StoryObj<typeof CheckoutSuccess>

export const Default: Story = {
  args: {
    organization: org,
    checkout: {
      id: 'sub_1J5X2t2eZvKYlo2C2QqQ2Q2Q',
      customer_email: null,
      customer_name: null,
      product_price: {
        id: '123',
        created_at: '2021-10-01T00:00:00Z',
        modified_at: null,
        is_archived: false,
        price_amount: 500,
        price_currency: 'usd',
        type: 'recurring',
        recurring_interval: 'month',
      },
      product: {
        id: 'sub_tier_1J5X2t2eZvKYlo2C2QqQ2Q2Q',
        name: 'Free',
        type: 'free',
        benefits: [
          {
            id: 'benefit_1J5X2t2eZvKYlo2C2QqQ2Q2Q',
            description: 'Supporter',
            deletable: true,
            selectable: true,
            created_at: '2021-10-08T11:17:14.000Z',
            modified_at: null,
            type: 'custom',
            organization_id: '123',
          },
        ],
        prices: [
          {
            id: '123',
            created_at: '2021-10-01T00:00:00Z',
            modified_at: null,
            is_archived: false,
            price_amount: 500,
            price_currency: 'usd',
            type: 'recurring',
            recurring_interval: 'month',
          },
        ],
        medias: [],
        description: 'Free',
        created_at: '2021-10-08T11:17:14.000Z',
        modified_at: null,
        is_archived: false,
        is_highlighted: false,
        is_recurring: true,
        organization_id: '123',
      },
    },
  },
}
