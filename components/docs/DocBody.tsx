import type { ReactNode } from "react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import type { Components } from "react-markdown"

function DocAnchor({
  href,
  children,
}: {
  href?: string
  children?: ReactNode
}) {
  if (!href) return <>{children}</>
  const className = "font-medium text-primary underline underline-offset-2"
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }
  const external = href.startsWith("http://") || href.startsWith("https://")
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  )
}

const COMPONENTS: Components = {
  a: ({ href, children }) => <DocAnchor href={href}>{children}</DocAnchor>,
  code: ({ className, children, ...props }) => {
    if (className) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className="rounded bg-muted px-1 py-0.5 text-sm" {...props}>
        {children}
      </code>
    )
  },
}

export function DocBody({ content }: { content: string }) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
