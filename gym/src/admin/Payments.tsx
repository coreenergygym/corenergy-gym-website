import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Payment, PaymentStatus } from '../types'

export default function Payments() {
  const [rows, setRows] = useState<Payment[]>([])
  const [filter, setFilter] = useState<PaymentStatus | 'ALL'>('ALL')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase.from('payments').select('*').order('created_at', { ascending: false })
    if (data) setRows(data as Payment[])
  }

  async function verify(payment: Payment) {
    const { error } = await supabase
      .from('payments')
      .update({ status: 'VERIFIED', verified_at: new Date().toISOString() })
      .eq('id', payment.id)
    if (error) return

    const receiptNumber = `CE-${new Date().getFullYear()}-${payment.id.slice(0, 8).toUpperCase()}`
    await supabase.from('receipts').insert({
      payment_id: payment.id,
      receipt_number: receiptNumber,
      customer_name: payment.customer_name,
      membership_or_service: 'Membership',
      amount: payment.amount,
      payment_date: new Date().toISOString(),
      transaction_reference: payment.transaction_reference,
    })

    load()
  }

  async function reject(payment: Payment) {
    await supabase.from('payments').update({ status: 'REJECTED' }).eq('id', payment.id)
    load()
  }

  const visible = rows.filter((r) => filter === 'ALL' || r.status === filter)

  return (
    <div>
      <h1 className="text-2xl text-white">Payments</h1>

      <div className="mt-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value as PaymentStatus | 'ALL')} className="input max-w-[10rem]">
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-panel text-left text-steel">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-white">{p.customer_name}</td>
                <td className="px-4 py-3 text-steel">₹{p.amount}</td>
                <td className="px-4 py-3 text-steel">{p.transaction_reference}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      p.status === 'VERIFIED'
                        ? 'bg-green-500/20 text-green-400'
                        : p.status === 'REJECTED'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-3">
                  {p.status === 'PENDING' && (
                    <>
                      <button onClick={() => verify(p)} className="text-green-400 underline">
                        Verify
                      </button>
                      <button onClick={() => reject(p)} className="text-red-400 underline">
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-steel">
                  No payments match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
