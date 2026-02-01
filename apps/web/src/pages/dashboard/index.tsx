import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Users, Building2, BookOpen, TrendingUp, ArrowUpRight } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function DashboardPage() {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('dashboard.totalSchools'),
      value: "2",
      sub: t('dashboard.sinceLaunch'),
      icon: Building2,
      trend: "+2"
    },
    {
      title: t('dashboard.activeStudents'),
      value: "0",
      sub: t('dashboard.waitingEnrollment'),
      icon: Users,
      trend: "0"
    },
    {
      title: t('dashboard.booksCreated'),
      value: "0",
      sub: t('dashboard.noBooks'),
      icon: BookOpen,
      trend: "0"
    },
    {
      title: t('dashboard.generationCredit'),
      value: t('dashboard.unlimited'),
      sub: t('dashboard.enterprisePlan'),
      icon: Sparkles,
      trend: "Premium"
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h2>
        <div className="flex items-center space-x-2">
          <Button size="sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            {t('dashboard.insights')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {stat.trend !== "0" && <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />}
                {stat.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>{t('dashboard.schoolGrowth')}</CardTitle>
            <CardDescription>
              {t('dashboard.schoolGrowthDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg m-6 mt-0">
            {t('dashboard.analyticsComingSoon')}
          </CardContent>
        </Card>

        <Card className="col-span-3 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
            <CardDescription>
              {t('dashboard.recentActivityDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
               <div className="flex items-center">
                 <div className="ml-4 space-y-1">
                   <p className="text-sm font-medium leading-none text-muted-foreground italic">{t('dashboard.noRecentActivity')}</p>
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
