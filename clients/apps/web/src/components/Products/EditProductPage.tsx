import revalidate from '@/app/actions'
import {
  useBenefits,
  useUpdateProduct,
  useUpdateProductBenefits,
} from '@/hooks/queries'
import { setValidationErrors } from '@/utils/api/errors'
import {
  BenefitPublicInner,
  Organization,
  Product,
  ProductUpdate,
  ResponseError,
  SubscriptionTierType,
  ValidationError,
} from '@polar-sh/sdk'
import { useRouter } from 'next/navigation'
import Button from 'polarkit/components/ui/atoms/button'
import ShadowBox from 'polarkit/components/ui/atoms/shadowbox'
import { Form } from 'polarkit/components/ui/form'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { isPremiumArticlesBenefit } from '../Benefit/utils'
import { DashboardBody } from '../Layout/DashboardLayout'
import { ConfirmModal } from '../Modal/ConfirmModal'
import { useModal } from '../Modal/useModal'
import DashboardTopbar from '../Navigation/DashboardTopbar'
import ProductBenefitsForm from './ProductBenefitsForm'
import ProductForm, { ProductFullMediasMixin } from './ProductForm'

export interface EditProductPageProps {
  organization: Organization
  product: Product
}

export const EditProductPage = ({
  organization,
  product,
}: EditProductPageProps) => {
  const router = useRouter()
  const isFreeTier = product.type === SubscriptionTierType.FREE
  const benefits = useBenefits(organization.id)
  const organizationBenefits = useMemo(
    () => benefits.data?.items ?? [],
    [benefits],
  )

  const [enabledBenefitIds, setEnabledBenefitIds] = useState<
    BenefitPublicInner['id'][]
  >(product.benefits.map((benefit) => benefit.id) ?? [])

  const form = useForm<ProductUpdate & ProductFullMediasMixin>({
    defaultValues: {
      ...product,
      medias: product.medias.map((media) => media.id),
      full_medias: product.medias,
    },
  })

  const [isLoading, setLoading] = useState(false)

  const { handleSubmit, setError } = form

  const updateProduct = useUpdateProduct(organization?.id)
  const updateBenefits = useUpdateProductBenefits(organization.id)

  const onSubmit = useCallback(
    async (productUpdate: ProductUpdate & ProductFullMediasMixin) => {
      try {
        setLoading(true)
        const { full_medias, ...productUpdateRest } = productUpdate
        await updateProduct.mutateAsync({
          id: product.id,
          body: {
            ...productUpdateRest,
            medias: full_medias.map((media) => media.id),
          },
        })
        await updateBenefits.mutateAsync({
          id: product.id,
          body: {
            benefits: enabledBenefitIds,
          },
        })

        revalidate(`products:${organization.id}:recurring`)
        revalidate(`products:${organization.id}:one_time`)

        router.push(`/dashboard/${organization.slug}/products`)
      } catch (e) {
        setLoading(false)
        if (e instanceof ResponseError) {
          const body = await e.response.json()
          if (e.response.status === 422) {
            const validationErrors = body['detail'] as ValidationError[]
            setValidationErrors(validationErrors, setError)
          }
        }
      }
    },
    [
      organization,
      product,
      enabledBenefitIds,
      updateProduct,
      updateBenefits,
      setError,
      router,
    ],
  )

  const onSelectBenefit = useCallback(
    (benefit: BenefitPublicInner) => {
      setEnabledBenefitIds((benefitIds) => [...benefitIds, benefit.id])
    },
    [setEnabledBenefitIds],
  )

  const onRemoveBenefit = useCallback(
    (benefit: BenefitPublicInner) => {
      setEnabledBenefitIds((benefits) =>
        benefits.filter((b) => b !== benefit.id),
      )
    },
    [setEnabledBenefitIds],
  )

  const enabledBenefits = useMemo(
    () =>
      organizationBenefits.filter((benefit) =>
        enabledBenefitIds.includes(benefit.id),
      ),
    [organizationBenefits, enabledBenefitIds],
  )

  const benefitsAdded = useMemo(
    () =>
      enabledBenefits.filter(
        (benefit) => !product.benefits.some(({ id }) => id === benefit.id),
      ),
    [enabledBenefits, product],
  )

  const benefitsRemoved = useMemo(
    () =>
      product.benefits.filter(
        (benefit) => !enabledBenefits.some(({ id }) => id === benefit.id),
      ),
    [enabledBenefits, product],
  )

  const {
    isShown: isArchiveModalShown,
    hide: hideArchiveModal,
    show: showArchiveModal,
  } = useModal()

  const handleArchiveProduct = useCallback(async () => {
    await updateProduct.mutateAsync({
      id: product.id,
      body: { is_archived: true },
    })

    revalidate(`products:${organization.id}:recurring`)
    revalidate(`products:${organization.id}:one_time`)

    router.push(`/dashboard/${organization.slug}/products`)
  }, [product, updateProduct, organization, router])

  return (
    <>
      <DashboardTopbar title="Edit Product" hideSubNav />
      <DashboardBody className="flex flex-col">
        <div className="flex w-full max-w-xl flex-col gap-y-12">
          <div className="flex flex-col gap-y-8">
            <Form {...form}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-y-6"
              >
                <ProductForm
                  organization={organization}
                  update={true}
                  isFreeTier={isFreeTier}
                />
              </form>
            </Form>
            <ProductBenefitsForm
              className="w-full"
              organization={organization}
              organizationBenefits={organizationBenefits.filter(
                (benefit) =>
                  // Hide not selectable benefits unless they are already enabled
                  (benefit.selectable ||
                    enabledBenefits.some((b) => b.id === benefit.id)) &&
                  // Hide premium articles benefit on free tier
                  (!isFreeTier || !isPremiumArticlesBenefit(benefit)),
              )}
              benefits={enabledBenefits}
              onSelectBenefit={onSelectBenefit}
              onRemoveBenefit={onRemoveBenefit}
            />
            {(benefitsAdded.length > 0 || benefitsRemoved.length > 0) && (
              <div className="rounded-2xl bg-yellow-50 p-8 px-4 py-3 text-sm text-yellow-500 dark:bg-yellow-950">
                Existing customers will immediately{' '}
                {benefitsAdded.length > 0 && (
                  <>
                    get access to{' '}
                    {benefitsAdded
                      .map((benefit) => benefit.description)
                      .join(', ')}
                  </>
                )}
                {benefitsRemoved.length > 0 && (
                  <>
                    {benefitsAdded.length > 0 && ' and '}lose access to{' '}
                    {benefitsRemoved
                      .map((benefit) => benefit.description)
                      .join(', ')}
                  </>
                )}
                .
              </div>
            )}
            {!isFreeTier && (
              <>
                <ShadowBox className="flex flex-col gap-6 p-6">
                  <div className="flex flex-col gap-y-2">
                    <h3 className="text-sm font-medium">Archive Product</h3>
                    <p className="dark:text-polar-500 text-sm text-gray-500">
                      Archiving a product will not affect its current customers,
                      only prevent new subscribers and purchases.
                    </p>
                  </div>
                  <Button
                    className="self-start"
                    variant="destructive"
                    onClick={showArchiveModal}
                    size="sm"
                  >
                    Archive
                  </Button>
                </ShadowBox>
                <ConfirmModal
                  title="Archive Product"
                  description="Archiving a product will not affect its current customers, only prevent new subscribers and purchases."
                  onConfirm={handleArchiveProduct}
                  isShown={isArchiveModalShown}
                  hide={hideArchiveModal}
                  destructiveText="Archive"
                  destructive
                />
              </>
            )}
          </div>
          <div className="flex flex-row items-center gap-2">
            <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
              Save Product
            </Button>
          </div>
        </div>
      </DashboardBody>
    </>
  )
}
