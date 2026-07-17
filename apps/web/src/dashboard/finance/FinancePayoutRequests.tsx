import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePayoutRequests, useUpdatePayoutRequestStatus } from '@/hooks/usePayoutRequests'

const statusVariant: Record<string, any> = {
  PENDING: 'secondary',
  APPROVED: 'success',
  REJECTED: 'destructive',
  PROCESSING: 'secondary',
  COMPLETED: 'success',
  CANCELLED: 'outline',
}

const FinancePayoutRequests: React.FC = () => {
  const { data = [], isLoading, refetch } = usePayoutRequests({ status: 'PENDING', limit: 50 })
  const updateStatus = useUpdatePayoutRequestStatus()

  const handleApprove = async (id: string) => {
    await updateStatus.mutateAsync({ body: { status: 'APPROVED' }, urlParams: { id } } as any)
    refetch()
  }
  const handleReject = async (id: string) => {
    await updateStatus.mutateAsync({ body: { status: 'REJECTED' }, urlParams: { id } } as any)
    refetch()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((req: any) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.user?.name}</TableCell>
                    <TableCell>
                      {req.amount} {req.currency}
                    </TableCell>
                    <TableCell>{req.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[req.status] || 'secondary'}>{req.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleReject(req.id)}>Reject</Button>
                      <Button size="sm" onClick={() => handleApprove(req.id)}>Approve</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default FinancePayoutRequests