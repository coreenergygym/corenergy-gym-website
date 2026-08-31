import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { GymSettings, Receipt } from '../types'

export default function Receipts() {
  const [rows, setRows] = useState<Receipt[]>([])
  const [settings, setSettings] = useState<GymSettings | null>(null)
  const [printing, setPrinting] = useState<Receipt | null>(null)

  useEffect(() => {
    supabase.from('receipts').select('*').order('created_at', { ascending: false }).then(({ data }) => data && setRows(data as Receipt[]))
    supabase.from('gym_settings').select('*').maybeSingle().then(({ data }) => data && setSettings(data as GymSettings))
  }, [])

  if (printing) {
    return <ReceiptPrintView receipt={printing} settings={settings} onClose={() => setPrinting(null)} />
  }

  return (
    <div>
      <h1 className="text-2xl text-white">Receipts</h1>
      <p className="mt-1 text-sm text-steel/70">Generated automatically whenever a payment is verified.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-panel text-left text-steel">
            <tr>
              <th className="px-4 py-3">Receipt #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-white">{r.receipt_number}</td>
                <td className="px-4 py-3 text-steel">{r.customer_name}</td>
                <td className="px-4 py-3 text-steel">₹{r.amount}</td>
                <td className="px-4 py-3 text-steel">{new Date(r.payment_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setPrinting(r)} className="text-volt underline">
                    View / Print
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-steel">
                  No receipts yet — verify a payment to generate one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReceiptPrintView({ receipt, settings, onClose }: { receipt: Receipt; settings: GymSettings | null; onClose: () => void }) {
  return (
    <div>
      <div className="mb-4 flex gap-3 print:hidden">
        <button onClick={onClose} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-white">
          Back
        </button>
        <button onClick={() => window.print()} className="rounded-full bg-volt px-5 py-2.5 text-sm font-semibold text-white">
          Print / Save as PDF
        </button>
      </div>

      <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-8 text-black print:border-0 print:shadow-none">
        <h2 className="text-2xl font-bold">{settings?.gym_name || 'CoreNergy The Gym'}</h2>
        {settings?.address && <p className="text-sm text-gray-600">{settings.address}</p>}
        <div className="my-6 border-t border-gray-300" />

        <h3 className="text-lg font-semibold">Payment Receipt</h3>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Receipt Number" value={receipt.receipt_number} />
          <Row label="Customer Name" value={receipt.customer_name} />
          <Row label="Membership / Service" value={receipt.membership_or_service} />
          <Row label="Amount Paid" value={`₹${receipt.amount}`} />
          <Row label="Payment Date" value={new Date(receipt.payment_date).toLocaleDateString()} />
          <Row label="Transaction Reference" value={receipt.transaction_reference} />
          <Row label="Status" value="VERIFIED" />
        </dl>

        <div className="mt-8 border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
          Thank you for training with {settings?.gym_name || 'CoreNergy The Gym'}.
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
