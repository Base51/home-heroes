import { HeroProvider } from '@/lib/hero-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <HeroProvider>
      {children}
    </HeroProvider>
  )
}
