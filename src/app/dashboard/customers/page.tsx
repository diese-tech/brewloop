import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { demoLoyaltyAccounts } from "@/lib/demo-data";

export default function DashboardCustomersPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Customer capture
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Customers</h1>
      <Card className="mt-8 bg-card/90">
        <CardHeader>
          <CardTitle>Recent customers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoLoyaltyAccounts.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email || customer.phone}</TableCell>
                  <TableCell className="font-mono">{customer.visits}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Rewards member</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
