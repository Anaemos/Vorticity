import { fetchAllResults } from '@/lib/data'
import Header from '@/components/Header'
import SummaryBar from '@/components/SummaryBar'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const data = await fetchAllResults()

  // find the latest data_through date across all results
  const dates     = data.map(d => d.data_through).filter(Boolean).sort()
  const dataThrough = dates[dates.length - 1] ?? undefined

  return (
    <>
      <Header dataThrough={dataThrough} />
      <SummaryBar data={data} />
      <DashboardClient data={data} />
    </>
  )
}