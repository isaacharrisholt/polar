import LogoIcon from '@/components/Brand/LogoIcon'
import { organizationPageLink } from '@/utils/nav'
import Link from 'next/link'
import Avatar from 'polarkit/components/ui/atoms/avatar'
import Button from 'polarkit/components/ui/atoms/button'
import { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'
import SubscribeNowWithModal from '../Subscriptions/SubscribeNowWithModal'
import { RenderArticle } from './Markdown/markdown'
import PostPaywall from './PostPaywall'
import Share from './Posts/Share'

interface LongformPostProps {
  article: RenderArticle
  isSubscriber: boolean
  hasPaidArticlesBenefit: boolean
  showShare: boolean
  isAuthor: boolean
}

export default function LongformPost({
  article,
  isSubscriber,
  hasPaidArticlesBenefit,
  showShare,
  isAuthor,
  children,
}: React.PropsWithChildren<LongformPostProps>) {
  const shouldRenderPaywall = article.is_preview

  const showNonSubscriberUpsell =
    !isAuthor && !isSubscriber && !shouldRenderPaywall

  const showSubscriberUpsell =
    !isAuthor &&
    isSubscriber &&
    !hasPaidArticlesBenefit &&
    !showNonSubscriberUpsell &&
    !shouldRenderPaywall

  const publishedDate = useMemo(
    () => (article.published_at ? new Date(article.published_at) : undefined),
    [article],
  )
  const publishedDateText = useMemo(
    () =>
      publishedDate
        ? new Date() > publishedDate
          ? publishedDate.toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : `Scheduled on ${publishedDate.toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}`
        : 'Unpublished',
    [publishedDate],
  )

  return (
    <article className="w-full max-w-2xl">
      <header className="flex flex-col items-center gap-y-8 pb-4 md:pb-16 md:pt-4">
        <div className="hidden md:flex">
          <LogoIcon className="text-blue-500 dark:text-blue-400" size={40} />
        </div>
        <div>
          <time
            className="dark:text-polar-500 text-gray-500"
            dateTime={publishedDate?.toISOString()}
          >
            {publishedDateText}
          </time>
        </div>
        <div>
          <h1 className="text-center text-2xl !font-semibold !leading-relaxed [text-wrap:balance] md:text-3xl lg:text-4xl">
            {article.title}
          </h1>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-row items-center gap-x-3">
            <Avatar
              className="h-8 w-8"
              avatar_url={article.byline.avatar_url}
              name={article.byline.name}
            />
            <h3 className="text-md dark:text-white">{article.byline.name}</h3>
          </div>
        </div>
      </header>

      <div>
        <div
          className={twMerge(
            'prose dark:prose-invert',
            'dark:prose-pre:bg-polar-800 prose-pre:bg-gray-100 prose-pre:rounded-2xl',
            'dark:prose-headings:text-polar-50 prose-headings:font-medium prose-p:text-gray-800 dark:prose-p:text-polar-200 dark:prose-strong:text-polar-50 dark:prose-strong:font-medium',
            'prose-img:rounded-2xl prose-img:drop-shadow-none lg:prose-img:drop-shadow-2xl',
            ' prose-a:text-blue-500 hover:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300 dark:prose-a:text-blue-400 prose-a:no-underline',
            'mb-8 w-full max-w-none space-y-16 leading-loose tracking-[0.015rem]',
          )}
        >
          {children}
        </div>
      </div>

      <footer>
        {shouldRenderPaywall && (
          <div>
            <PostPaywall article={article} isSubscriber={isSubscriber} />
          </div>
        )}

        {showNonSubscriberUpsell ? (
          <UpsellNonSubscriber article={article} />
        ) : null}

        {showSubscriberUpsell ? (
          <UpsellFreeSubscriberToPaid article={article} />
        ) : null}

        {showShare ? <Share className="my-8 flex" article={article} /> : null}
      </footer>
    </article>
  )
}

const UpsellNonSubscriber = ({ article }: { article: RenderArticle }) => (
  <div className="flex flex-col gap-y-16">
    <div className="dark:bg-polar-800 rounded-4xl flex flex-col items-center gap-y-6 bg-gray-100 p-8 py-12 md:px-16 ">
      <Avatar
        className="h-12 w-12"
        avatar_url={article.organization.avatar_url}
        name={article.organization.name}
      />
      <h2 className="text-center text-xl font-medium">
        Subscribe to {article.organization.name}
      </h2>
      <p className="dark:text-polar-300 text-center text-gray-500">
        {article.organization?.bio
          ? article.organization?.bio
          : `Support ${article.organization.name} by subscribing to their work and get access to exclusive content.`}
      </p>

      <SubscribeNowWithModal
        organization={article.organization}
        isSubscriber={false}
      >
        Subscribe
      </SubscribeNowWithModal>
    </div>
  </div>
)

const UpsellFreeSubscriberToPaid = ({
  article,
}: {
  article: RenderArticle
}) => (
  <div className="flex flex-col gap-y-16">
    <div className="dark:bg-polar-800 rounded-4xl flex flex-col items-center gap-y-6 bg-gray-100 p-8 py-12 md:px-16 ">
      <Avatar
        className="h-12 w-12"
        avatar_url={article.organization.avatar_url}
        name={article.organization.name}
      />
      <h2 className="text-xl font-medium">
        Upgrade your subscription to {article.organization.name}
      </h2>
      <p className="dark:text-polar-300 text-center text-gray-500">
        {article.organization?.bio
          ? article.organization?.bio
          : `Support ${article.organization.name} by subscribing to their work and get access to exclusive content.`}
      </p>
      <Link href={organizationPageLink(article.organization)}>
        <Button className="mt-4">Upgrade</Button>
      </Link>
    </div>
  </div>
)
