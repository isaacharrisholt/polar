import LogoIcon from '@/components/Brand/LogoIcon'
import { Article } from '@polar-sh/sdk'

const generatePostOGFallbackPath = (slug: string, maxInt: number) => {
  let sum = 0
  for (let i = 0; i < slug.length; i++) {
    sum += slug.charCodeAt(i)
  }
  return `${sum % maxInt}.jpg`
}

const imageBaseURL = 'https://polar.sh/assets/posts/og'

const OpenGraphImageArticle = (props: { article: Article }) => {
  const { article } = props

  return (
    <div
      style={{
        position: 'relative',
        height: 630,
        width: 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '24px',
        background: 'white',
        backgroundImage: `url(${imageBaseURL}/${generatePostOGFallbackPath(
          article.slug,
          7,
        )})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        padding: '64px',
      }}
    >
      <div style={{ display: 'flex' }}>
        <LogoIcon size={82} />
      </div>
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          whiteSpace: 'pre-wrap',
          fontWeight: 600,
          fontSize: '64px',
          lineHeight: '1.4em',
        }}
      >
        {article.title}
      </span>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          fontSize: '32px',
          gap: '24px',
        }}
      >
        {article.byline.avatar_url ? (
          <img
            src={article.byline.avatar_url}
            height={48}
            width={48}
            style={{
              height: 48,
              width: 48,
              borderRadius: 48,
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              height: 48,
              width: 48,
              borderRadius: 48,
              flexShrink: 0,
              background: 'black',
              color: 'white',
            }}
          >
            {article.byline.name[0].toUpperCase()}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          {article.byline.name}
        </div>
      </div>
    </div>
  )
}

export default OpenGraphImageArticle
