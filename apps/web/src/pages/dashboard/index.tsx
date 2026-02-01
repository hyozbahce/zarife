import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Users, Building2, BookOpen, TrendingUp, ArrowUpRight } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    { 
      title: "Total Schools", 
      value: "2", 
      sub: "+100% since start", 
      icon: Building2,
      trend: "+2"
    },
    { 
      title: "Active Students", 
      value: "0", 
      sub: "Waiting for enrollment", 
      icon: Users,
      trend: "0"
    },
    { 
      title: "Books Created", 
      value: "0", 
      sub: "No books yet", 
      icon: BookOpen,
      trend: "0"
    },
    { 
      title: "Generation Credit", 
      value: "Unlimited", 
      sub: "Enterprise Plan", 
      icon: Sparkles,
      trend: "Premium"
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <div className="flex items-center space-x-2">
          <Button size="sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            Insights
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
            <CardTitle>School Growth</CardTitle>
            <CardDescription>
              Onboarding status across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg m-6 mt-0">
            Analytics visualization coming soon...
          </CardContent>
        </Card>
        
        <Card className="col-span-3 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
               <div className="flex items-center">
                 <div className="ml-4 space-y-1">
                   <p className="text-sm font-medium leading-none text-muted-foreground italic">No recent activity found.</p>
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
