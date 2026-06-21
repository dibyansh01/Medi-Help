/**
 * Public Layout — Used for unauthenticated pages (login, signup, forgot-password).
 * No sidebar or navigation is rendered. Just a clean, minimal wrapper.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  )
}
