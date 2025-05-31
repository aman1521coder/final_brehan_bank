import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { name: "Jan", logins: 400, transactions: 240 },
  { name: "Feb", logins: 300, transactions: 139 },
  { name: "Mar", logins: 200, transactions: 980 },
  { name: "Apr", logins: 278, transactions: 390 },
  { name: "May", logins: 189, transactions: 480 },
  { name: "Jun", logins: 239, transactions: 380 },
  { name: "Jul", logins: 349, transactions: 430 },
]

interface CustomerActivityProps {
  className?: string
}

export function CustomerActivity({ className }: CustomerActivityProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Customer Activity</CardTitle>
        <CardDescription>Customer logins and transactions over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="logins" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="transactions" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
