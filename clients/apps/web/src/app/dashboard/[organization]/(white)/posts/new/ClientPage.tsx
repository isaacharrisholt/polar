'use client'

import { PostEditor } from '@/components/Feed/PostEditor'
import DashboardTopbar from '@/components/Navigation/DashboardTopbar'
import { useCreateArticle } from '@/hooks/queries'
import { MaintainerOrganizationContext } from '@/providers/maintainerOrganization'
import { useStore } from '@/store'
import { captureEvent } from '@/utils/posthog'
import { ArticleCreate } from '@polar-sh/sdk'
import { redirect, useRouter } from 'next/navigation'
import Button from 'polarkit/components/ui/atoms/button'
import { Tabs } from 'polarkit/components/ui/atoms/tabs'
import { useContext, useEffect, useState } from 'react'

const ClientPage = () => {
  const { organization: org } = useContext(MaintainerOrganizationContext)
  const [tab, setTab] = useState('edit')

  const {
    formDrafts: { ArticleCreate: savedFormValues },
    saveDraft,
    clearDraft,
  } = useStore()

  const [localArticle, setLocalArticle] = useState<
    Pick<ArticleCreate, 'title' | 'body'>
  >({
    title: '',
    body: '',
    ...(savedFormValues ? savedFormValues : {}),
  })

  useEffect(() => {
    const pagehideListener = () => {
      saveDraft('ArticleCreate', localArticle)
    }
    window.addEventListener('pagehide', pagehideListener)
    return () => window.removeEventListener('pagehide', pagehideListener)
  }, [localArticle, saveDraft])

  const router = useRouter()
  const create = useCreateArticle()

  const titleLength = localArticle.title.length
  const bodyLength = localArticle.body?.length ?? 0
  const canCreate = titleLength > 0 && bodyLength > 0

  const createAndRedirect = async (extraPath?: string) => {
    if (!canCreate) {
      return
    }

    const created = await create.mutateAsync({
      ...localArticle,
      organization_id: org.id,
    })

    clearDraft('ArticleCreate')

    router.replace(
      `/dashboard/${created.organization.slug}/posts/${created.slug}${extraPath ?? ''}`,
    )
  }

  const handleContinue = async () => {
    await createAndRedirect()
  }

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 's') {
          e.preventDefault()
          captureEvent('posts:create_cmd_s:create')
          handleContinue()
        }
        if (e.key === 'p') {
          e.preventDefault()
          captureEvent('posts:create_cmd_p:view')
          setTab('preview')
        }
      }
    }

    window.addEventListener('keydown', keyHandler)

    return () => {
      window.removeEventListener('keydown', keyHandler)
    }
  }, [handleContinue])

  const onTabChange = async (tab: string) => {
    setTab(tab)

    if (tab === 'settings') {
      if (!canCreate) {
        return
      }

      captureEvent('posts:create_publish_tab:create')

      await createAndRedirect('#settings')
    } else if (tab === 'edit') {
      captureEvent('posts:create_tab_edit:view')
    } else if (tab === 'preview') {
      captureEvent('posts:create_tab_preview:view')
    }
  }

  if (!org) {
    return null
  }

  if (!org.feature_settings?.articles_enabled) {
    return redirect(`/dashboard/${org.slug}/posts`)
  }

  return (
    <Tabs className="flex flex-col" value={tab} onValueChange={onTabChange}>
      <DashboardTopbar title="Create Post" marginBottom={false}>
        <Button
          onClick={() => {
            captureEvent('posts:create_save_button:create')
            handleContinue()
          }}
          disabled={localArticle.title.length < 1}
          loading={create.isPending}
        >
          Save
        </Button>
      </DashboardTopbar>
      <PostEditor
        disabled={create.isPending}
        canCreate={canCreate}
        title={localArticle.title}
        body={localArticle.body || ''}
        onTitleChange={(title) => setLocalArticle((a) => ({ ...a, title }))}
        onBodyChange={(body) => setLocalArticle((a) => ({ ...a, body }))}
        previewProps={{
          article: {
            ...localArticle,
            body: localArticle.body || '',
            published_at: null,
            organization: org,
            byline: {
              name: org.name,
              avatar_url: org.avatar_url,
            },
            slug: 'preview',
            is_preview: false,
          },
          isSubscriber: true,
          showShare: false,
          hasPaidArticlesBenefit: true,
          isAuthor: true,
        }}
      />
    </Tabs>
  )
}

export default ClientPage
