'use client'

import { Article } from '@polar-sh/sdk'
import { Input, ShadowBoxOnMd } from 'polarkit/components/ui/atoms'
import { Checkbox } from 'polarkit/components/ui/checkbox'
import { useCallback, useMemo, useState } from 'react'
import { AudiencePicker } from './AudiencePicker'
import { PublishSummary } from './PublishSummary'
import { PublishingTimePicker } from './PublishingTimePicker'

interface PublishModalContentProps {
  article: Article
}

export const PublishSettings = ({ article }: PublishModalContentProps) => {
  const [paidSubscribersOnly, setPaidSubscribersOnly] = useState(
    article.paid_subscribers_only ?? false,
  )
  const [sendEmail, setSendEmail] = useState(article.notify_subscribers)
  const [publishAt, setPublishAt] = useState<Date | undefined>(
    article.published_at ? new Date(article.published_at) : undefined,
  )
  const [slug, setSlug] = useState<string>(article.slug)

  const onChangeSendEmail = (checked: boolean) => {
    setSendEmail(checked)
  }

  const onChangePublishAt = (v: Date | undefined) => {
    setPublishAt(v)
  }

  const formatAndSetSlug = useCallback(
    (slug: string) => {
      setSlug(slug.replace(/[^a-zA-Z0-9]/g, '-').replaceAll('--', '-'))
    },
    [setSlug],
  )

  const isPublished = useMemo(
    () =>
      article.published_at
        ? new Date(article.published_at) <= new Date()
        : false,
    [article],
  )

  return (
    <>
      <ShadowBoxOnMd className="flex w-2/3 flex-shrink-0 flex-col gap-y-8">
        <>
          {!isPublished && (
            <PublishingTimePicker
              publishAt={publishAt}
              article={article}
              onChange={onChangePublishAt}
            />
          )}
          <AudiencePicker
            paidSubscribersOnly={paidSubscribersOnly}
            onChange={setPaidSubscribersOnly}
          />
          {!article.notifications_sent_at && (
            <>
              <div className="flex flex-col gap-y-4">
                <div className="flex flex-col gap-y-2">
                  <span className="font-medium">Email</span>
                  <p className="text-polar-500 dark:text-polar-500 text-sm">
                    Sent to subscribers when a post is published
                  </p>
                </div>
                <div className="flex flex-col gap-y-4">
                  <div className="flex flex-row items-center gap-x-2">
                    <Checkbox
                      checked={sendEmail}
                      onCheckedChange={(checked) =>
                        onChangeSendEmail(Boolean(checked))
                      }
                    />
                    <span className="text-sm">
                      Send post as email to subscribers
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col  gap-2">
              <span className="font-medium">Slug</span>
              <p className="text-polar-500 dark:text-polar-500 text-sm">
                Change the slug of the article. The slug is used in public URLs.
              </p>
            </div>

            <Input
              type="text"
              value={slug}
              onChange={(e) => formatAndSetSlug(e.target.value)}
              className="font-mono"
              maxLength={64}
            />
          </div>
        </>
      </ShadowBoxOnMd>
      <PublishSummary
        article={{
          ...article,
          paid_subscribers_only: paidSubscribersOnly,
          published_at: publishAt ? publishAt.toISOString() : undefined,
          notify_subscribers: sendEmail,
          slug,
        }}
        isPublished={
          article.published_at
            ? new Date(article.published_at) <= new Date()
            : false
        }
      />
    </>
  )
}