import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function DashboardPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button>Download Report</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Schools", value: "24", sub: "+2 from last month" },
          { title: "Active Students", value: "1,234", sub: "+12% from last month" },
          { title: "Books Created", value: "86", sub: "+5 this week" },
          { title: "AI Generations", value: "3,456", sub: "Premium account active" },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          }
        />
        {/* Add more routes as we build them */}
        <Route
          path="*"
          element={
            <DashboardLayout>
              <div className="flex h-[50vh] items-center justify-center">
                <h1 className="text-2xl font-semibold italic text-muted-foreground">Coming Soon...</h1>
              </div>
            </DashboardLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
