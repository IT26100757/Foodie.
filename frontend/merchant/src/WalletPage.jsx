import { useEffect, useMemo, useRef, useState } from 'react'
import './WalletPage.css'
import WalletReports from './WalletReports.jsx'
import { api } from './api.js'

const sriLankanBanks = ['Bank of Ceylon', 'Commercial Bank', 'Hatton National Bank', "People's Bank", 'Nations Trust Bank', 'Sampath Bank', 'Seylan Bank', 'Amana Bank']
const bankLogoCrops = {
  'bank of ceylon': { x: 168, y: 140, width: 210, height: 210 },
  'commercial bank': { x: 742, y: 153, width: 154, height: 118 },
  'hatton national bank': { x: 26, y: 515, width: 133, height: 137 },
  hnb: { x: 26, y: 515, width: 133, height: 137 },
  "people's bank": { x: 607, y: 488, width: 139, height: 135 },
  'peoples bank': { x: 607, y: 488, width: 139, height: 135 },
  'nations trust bank': { x: 7, y: 784, width: 141, height: 137 },
  'sampath bank': { x: 590, y: 805, width: 158, height: 155 },
  'seylan bank': { x: 39, y: 1038, width: 136, height: 214 },
  'amana bank': { x: 980, y: 1047, width: 97, height: 104 },
}
const money = (value) => `Rs. ${Math.abs(value).toLocaleString('en-LK')}`
const moneyWithCents = (value) => `Rs. ${Math.abs(Number(value)).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function WalletPage({ onTransactionComplete, orders = [] }) {
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [dialog, setDialog] = useState('')
  const [reportsOpen, setReportsOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [accountForm, setAccountForm] = useState({ bank: '', name: '', number: '', branch: '' })
  const [transferAmount, setTransferAmount] = useState('')
  const [transferError, setTransferError] = useState('')
  const [accountError, setAccountError] = useState('')
  const [transferBusy, setTransferBusy] = useState(false)
  const [activeTransaction, setActiveTransaction] = useState(null)
  const [selectedAccount, setSelectedAccount] = useState('')
  const [metric, setMetric] = useState('All')
  const [summaryPeriod, setSummaryPeriod] = useState('This month')
  const [chartPeriod, setChartPeriod] = useState('Last 6 months')

  const [balance,setBalance]=useState(null)
  const [commissionRate,setCommissionRate]=useState(null)
  async function refreshWallet(){const [banks,wallet,payouts,policies]=await Promise.all([api('/api/wallet/bank-accounts'),api('/api/wallet'),api('/api/wallet/transfers'),api('/api/customer/policies')]);setAccounts(banks.map(bank=>({...bank,number:'•••• '+bank.lastFour,primary:bank.primaryAccount})));setBalance(wallet);setCommissionRate(policies.commission_rate);setTransactions(payouts.map(payout=>({id:payout.transactionId,title:'Transfer to '+payout.bankName,date:new Date(payout.updatedAt).toLocaleDateString(),kind:'Transfer',amount:-Number(payout.amount),status:payout.status==='COMPLETED'?'Completed':payout.status==='FAILED'?'Failed':'Processing'})))}
  useEffect(()=>{let active=true;const refresh=()=>{if(active&&document.visibilityState!=='hidden')refreshWallet().catch(error=>setNotice(error.message))};refresh();const timer=setInterval(refresh,30000);return()=>{active=false;clearInterval(timer)}},[])
  const periodStart=new Date(new Date().getFullYear(),new Date().getMonth()-(summaryPeriod==='Last month'?1:summaryPeriod==='Last 3 months'?2:summaryPeriod==='Last 6 months'?5:0),1)
  const periodEnd=summaryPeriod==='Last month'?new Date(new Date().getFullYear(),new Date().getMonth(),1):new Date()
  const periodOrders=orders.filter(order=>order.paymentStatus==='COMPLETED'&&new Date(order.createdAt)>=periodStart&&new Date(order.createdAt)<=periodEnd)
  const gross=periodOrders.reduce((sum,order)=>sum+Number(order.subtotal)-Number(order.discount)+(order.customerAgreed?Number(order.additionalCharge):0),0)
  const fees=periodOrders.reduce((sum,order)=>sum+Number(order.serviceCharge),0)
  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(''), 4200) }
  async function addAccount(event) {
    event.preventDefault();setAccountError('')
    try {const bank=await api('/api/wallet/bank-accounts',{method:'POST',body:{...accountForm,primary:accounts.length===0}});await refreshWallet();setAccountForm({bank:'',name:'',number:'',branch:''});setSelectedAccount(String(bank.id));setDialog('');showNotice('Bank account saved securely.')}catch(error){setAccountError(error.message)}
  }
  async function requestTransfer(event) {
    event.preventDefault();if(transferBusy)return
    const account=accounts.find(item=>String(item.id)===selectedAccount) || accounts[0]
    if(!account){setTransferError('Add a bank account first.');return}
    setTransferBusy(true);setTransferError('')
    try {const result=await api('/api/wallet/transfers',{method:'POST',headers:{'Idempotency-Key':crypto.randomUUID()},body:{bankAccountId:account.id,bankName:account.bank,accountHolder:account.name,accountLastFour:account.lastFour,amount:Number(transferAmount)}});setActiveTransaction(result);onTransactionComplete?.(result);await refreshWallet();setTransferAmount('');setDialog('');showNotice('Payout request '+result.transactionId+' saved for review. No bank transfer has been executed.')}catch(error){setTransferError(error.message)}finally{setTransferBusy(false)}
  }

  function printReceipt() {
    document.body.classList.add('wallet-print-receipt')
    window.print()
    window.setTimeout(() => document.body.classList.remove('wallet-print-receipt'), 800)
  }

  return <div className="dashboard-content wallet-content">
    <div className="dashboard-heading-row wallet-heading"><div><span className="dashboard-kicker">YOUR MONEY, MADE CLEAR</span><h1>Merchant Wallet<span>.</span></h1><p>See your earnings, service charge, and settlement activity in one place.</p></div><button type="button" className="wallet-report-open" onClick={() => setReportsOpen(true)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-8h4v8M3 20h18" /></svg><span>Generate report</span></button></div>
    <section className="wallet-balance-card">
      <div className="wallet-balance-copy"><span className="wallet-overline">FOODIE BANK BALANCE <i>•</i> AVAILABLE</span><strong>{balance?moneyWithCents(balance.available):'—'}</strong><p>Available collected funds after charges and reserved payouts.</p></div>
      <div className="wallet-balance-actions"><button type="button" className="wallet-transfer-button" onClick={() => setDialog('transfer')}><span>↗</span> Transfer to bank</button><button type="button" className="wallet-transactions-link" onClick={() => document.getElementById('wallet-transactions')?.scrollIntoView({ behavior: 'smooth' })}>View transactions <span>↓</span></button></div>
      <div className="wallet-card-decoration" aria-hidden="true"><i /><i /><i /></div>
    </section>
    <div className="wallet-section-label"><div><span className="wallet-section-kicker">MONTHLY SUMMARY</span><h2>Monthly summary</h2></div><PeriodPicker label="SUMMARY PERIOD" value={summaryPeriod} options={['This month', 'Last month', 'Last 3 months', 'Last 6 months']} onChange={setSummaryPeriod} /></div>
    <div className="wallet-summary-grid">
      <article className="wallet-summary-card"><div className="wallet-summary-top"><span>Total Sales</span><i className="wallet-summary-icon sales">↗</i></div><strong>{moneyWithCents(gross)}</strong><small>Collected sales for the selected period</small></article>
      <article className="wallet-summary-card"><div className="wallet-summary-top"><span>Our Service Charge <em>{commissionRate==null?'—':Number(commissionRate)*100+'%'}</em></span><i className="wallet-summary-icon fee">%</i></div><strong>{moneyWithCents(fees)}</strong><small>Recorded service charges</small></article>
      <article className="wallet-summary-card"><div className="wallet-summary-top"><span>Net Earnings</span><i className="wallet-summary-icon net">✓</i></div><strong>{moneyWithCents(gross-fees)}</strong><small>Net collected earnings</small></article>
    </div>
    <div className="wallet-main-grid">
      <div className="wallet-left-column">
        <section className="dashboard-card wallet-analysis-card"><div className="wallet-card-heading"><div><span className="wallet-section-kicker">SALES & SETTLEMENTS</span><h2>Business Analysis</h2><p>Monthly sales, service charges, and net earnings from collected orders.</p></div><PeriodPicker label="ANALYSIS PERIOD" value={chartPeriod} options={['Last 3 months', 'Last 6 months', 'This year']} onChange={setChartPeriod} /></div>
          <div className="wallet-chart-legend"><button type="button" className={metric === 'All' || metric === 'Sales' ? 'chosen' : ''} onClick={() => setMetric(metric === 'Sales' ? 'All' : 'Sales')}><i className="legend-sales" />Sales</button><button type="button" className={metric === 'All' || metric === 'Charge' ? 'chosen' : ''} onClick={() => setMetric(metric === 'Charge' ? 'All' : 'Charge')}><i className="legend-charge" />Service charge</button><button type="button" className={metric === 'All' || metric === 'Net' ? 'chosen' : ''} onClick={() => setMetric(metric === 'Net' ? 'All' : 'Net')}><i className="legend-net" />Net earnings</button></div>

          <MonthlyWalletChart key={chartPeriod} orders={orders} chartPeriod={chartPeriod} metric={metric} />
        </section>
        <section className="dashboard-card wallet-transactions-card" id="wallet-transactions"><div className="wallet-card-heading"><div><span className="wallet-section-kicker">YOUR WALLET ACTIVITY</span><h2>Recent Transactions</h2></div></div>
          {transactions.length ? <div className="wallet-table-wrap"><table className="wallet-table"><thead><tr><th>TRANSACTION</th><th>DATE</th><th>TYPE</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>{transactions.map((item) => <tr key={item.id}><td><span className={`wallet-transaction-mark ${item.amount < 0 ? 'charge-mark' : ''}`}>{item.amount < 0 ? '−' : '+'}</span><span className="wallet-transaction-name"><b>{item.title}</b><small>{item.id}</small></span></td><td>{item.date}</td><td>{item.kind}</td><td className={item.amount < 0 ? 'negative-amount' : 'positive-amount'}>{item.amount < 0 ? '−' : '+'} {money(item.amount)}</td><td><span className={`wallet-status ${item.status === 'Completed' ? 'complete' : 'deducted'}`}><i />{item.status}</span></td></tr>)}</tbody></table></div> : <div className="wallet-chart-empty">No transactions found.</div>}
        </section>
      </div>
      <aside className="wallet-right-column">
        <section className="dashboard-card wallet-add-bank"><div className="wallet-side-title"><span className="wallet-side-icon">＋</span><div><h2>Add Bank Account</h2><p>Link an account for settlements</p></div></div><button type="button" className="wallet-add-button" onClick={() => setDialog('account')}>＋ Add a bank account</button><small>Securely manage where your funds go.</small></section>
        <section className="dashboard-card wallet-accounts"><div className="wallet-card-heading"><div><span className="wallet-section-kicker">SETTLEMENT DETAILS</span><h2>Your Bank Accounts</h2></div><button className="wallet-add-small" type="button" aria-label="Add bank account" onClick={() => setDialog('account')}>＋</button></div><div className="wallet-account-list">{accounts.length ? accounts.map((account) => <article className="wallet-account" key={account.id}><BankLogo bank={account.bank} /><span className="wallet-account-copy"><b>{account.bank}</b><small>{account.name} · {account.number}</small></span><button type="button" aria-label={`Transfer to ${account.bank}`} onClick={() => { setSelectedAccount(String(account.id)); setDialog('transfer') }}>↗</button></article>) : <div className="wallet-empty-accounts">No bank accounts added.</div>}</div><button type="button" className="wallet-manage-accounts" onClick={() => setDialog('account')}>Manage accounts <span>→</span></button></section>
        <section className="wallet-transfer-promo"><div className="wallet-promo-icon">↗</div><span className="wallet-section-kicker">QUICK SETTLEMENT</span><h2>Move your earnings</h2><p>Transfer your available balance to any linked bank account.</p><button type="button" onClick={() => setDialog('transfer')}>Transfer to bank <span>→</span></button><i className="wallet-promo-orb" /></section>
      </aside>
    </div>
    {reportsOpen && <WalletReports orders={orders} onClose={() => setReportsOpen(false)} />}
    {notice && <div className="wallet-toast" role="status">✓ <span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
    {dialog && <div className="wallet-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !transferBusy) setDialog('') }}>
      {dialog === 'processing' ? <section className="wallet-dialog wallet-processing-dialog" role="status" aria-live="polite" aria-busy="true"><div className="wallet-processing-spinner" /><span className="wallet-section-kicker">FOODIE MERCHANT WALLET</span><h2>Transfer processing</h2><p>Your transaction is being recorded and checked. Keep this window open for the result.</p><div className="wallet-processing-steps"><span className="done">✓ Request received</span><span className="active"><i /> Checking destination bank</span><span>Confirmation pending</span></div></section>
          : dialog === 'receipt' && activeTransaction ? <section className={`wallet-dialog wallet-receipt ${activeTransaction.status === 'COMPLETED' ? 'receipt-success' : 'receipt-failed'}`} role="dialog" aria-modal="true" aria-labelledby="wallet-receipt-title"><button type="button" className="wallet-dialog-close" onClick={() => setDialog('')} aria-label="Close receipt">×</button><div className="wallet-receipt-brand"><span>foodie<span>.</span></span><small>MERCHANT WALLET</small></div><h2 id="wallet-receipt-title">Transfer receipt</h2><div className="wallet-receipt-state"><span>{activeTransaction.status === 'COMPLETED' ? '✓' : '!'}</span><b>{activeTransaction.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED'}</b><strong>{moneyWithCents(activeTransaction.amount)}</strong></div><div className="wallet-receipt-section"><span>TO</span><b>{activeTransaction.bankName}</b><small>{activeTransaction.accountHolder}<br />Account ending in {activeTransaction.accountLastFour}</small></div><div className="wallet-receipt-section"><span>TRANSACTION DETAILS</span><dl><div><dt>Date</dt><dd>{new Intl.DateTimeFormat('en-LK', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(activeTransaction.updatedAt))}</dd></div><div><dt>Transaction ID</dt><dd className="wallet-receipt-id">{activeTransaction.transactionId}</dd></div><div><dt>Status</dt><dd>{activeTransaction.status === 'COMPLETED' ? 'Completed' : 'Failed'}</dd></div>{activeTransaction.failureReason && <div><dt>Reason</dt><dd>{activeTransaction.failureReason}</dd></div>}</dl></div><div className="wallet-receipt-section"><span>FUNDING SOURCE</span><b>Foodie Bank Balance</b></div><div className="wallet-receipt-actions"><button type="button" className="wallet-receipt-secondary" onClick={printReceipt}>Print receipt</button><button type="button" className="wallet-dialog-submit" onClick={() => setDialog('')}>Done</button></div></section>
              : <section className="wallet-dialog" role="dialog" aria-modal="true" aria-labelledby="wallet-dialog-title"><button type="button" className="wallet-dialog-close" onClick={() => setDialog('')} aria-label="Close">×</button><span className="wallet-section-kicker">FOODIE MERCHANT WALLET</span><h2 id="wallet-dialog-title">{dialog === 'account' ? 'Add a bank account' : 'Transfer to bank'}</h2><p>{dialog === 'account' ? 'Save an encrypted destination account.' : 'Request a payout for review; no automatic bank transfer is executed.'}</p>{dialog === 'account' ? <form onSubmit={addAccount} className="wallet-dialog-form"><label>Bank name<BankNamePicker value={accountForm.bank} onSelect={(bank) => { setAccountForm((current) => ({ ...current, bank })); setAccountError('') }} />{accountError && <small className="wallet-field-error" role="alert">{accountError}</small>}</label><label>Account holder<input required value={accountForm.name} onChange={(event) => setAccountForm({ ...accountForm, name: event.target.value })} placeholder="Name on account" /></label><label>Account number<input required inputMode="numeric" pattern="[0-9]{4,20}" minLength="4" maxLength="20" title="Enter a 4 to 20 digit account number" value={accountForm.number} onChange={(event) => setAccountForm({ ...accountForm, number: event.target.value })} placeholder="Enter account number" /></label><label>Branch<input value={accountForm.branch} onChange={(event) => setAccountForm({ ...accountForm, branch: event.target.value })} placeholder="Branch (optional)" /></label><button className="wallet-dialog-submit" type="submit">Save account</button></form> : <form onSubmit={requestTransfer} className="wallet-dialog-form"><label>Send to<BankAccountPicker accounts={accounts} selectedAccount={selectedAccount} onSelect={setSelectedAccount} /></label><label>Amount<input required type="number" min="1" step="0.01" value={transferAmount} onChange={(event) => setTransferAmount(event.target.value)} placeholder="Enter amount" /></label>{transferError && <div className="wallet-transfer-error" role="alert">{transferError}</div>}<button className="wallet-dialog-submit" type="submit" disabled={transferBusy}>Review transfer</button></form>}</section>}
    </div>}
  </div>
}



// Business Analysis: use the same collected-order fields as the wallet summary.
// Historical months require the parent to pass the corresponding orders.
const walletChartSeries = [
  { key: 'Sales', field: 'sales', label: 'Sales', color: '#ef493c' },
  { key: 'Charge', field: 'charge', label: 'Service charge', color: '#eaba4e' },
  { key: 'Net', field: 'net', label: 'Net earnings', color: '#65a87a' },
]

function MonthlyWalletChart({ orders, chartPeriod, metric }) {
  const [chartType, setChartType] = useState('line')
  const [selectedMonth, setSelectedMonth] = useState(null)

  const months = useMemo(() => {
    const now = new Date()
    const count = chartPeriod === 'Last 3 months' ? 3
        : chartPeriod === 'This year' ? now.getMonth() + 1 : 6
    const startOffset = chartPeriod === 'This year' ? -now.getMonth() : 1 - count
    const buckets = Array.from({ length: count }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() + startOffset + index, 1)
      const shortMonth = date.toLocaleDateString('en-LK', { month: 'short' })
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.getFullYear() === now.getFullYear() ? shortMonth : `${shortMonth} '${String(date.getFullYear()).slice(-2)}`,
        fullLabel: date.toLocaleDateString('en-LK', { month: 'long', year: 'numeric' }),
        sales: 0, charge: 0, net: 0,
      }
    })
    const byMonth = new Map(buckets.map((bucket) => [bucket.key, bucket]))

    for (const order of orders) {
      // The existing merchant wallet counts completed payments. Some APIs
      // expose the equivalent status as COLLECTED.
      const status = String(order.paymentStatus ?? '').toUpperCase()
      if (status !== 'COMPLETED' && status !== 'COLLECTED') continue
      const dateValue = order.paymentCollectedAt ?? order.collectedAt ?? order.paidAt ?? order.createdAt ?? order.date
      if (!dateValue) continue
      const date = new Date(dateValue)
      if (Number.isNaN(date.getTime())) continue
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const bucket = byMonth.get(key)
      if (!bucket) continue

      const number = (value) => {
        const parsed = Number(value ?? 0)
        return Number.isFinite(parsed) ? parsed : 0
      }
      const additionalAgreed = order.customerAgreed === true || order.customerAgreedToAdditionalCharges === true
      const sale = number(order.subtotal) - number(order.discount) + (additionalAgreed ? number(order.additionalCharge) : 0)
      const charge = number(order.serviceCharge)
      bucket.sales += sale
      bucket.charge += charge
      bucket.net += sale - charge
    }
    return buckets
  }, [orders, chartPeriod])

  const visible = walletChartSeries.filter((series) => metric === 'All' || metric === series.key)
  const selectedIndex = selectedMonth !== null && selectedMonth < months.length ? selectedMonth : months.length - 1
  const active = months[selectedIndex]
  const maximum = Math.max(1, ...months.flatMap((month) => visible.map((series) => month[series.field])))
  const magnitude = 10 ** Math.floor(Math.log10(maximum / 4))
  const step = Math.ceil(maximum / (4 * magnitude)) * magnitude
  const chartMaximum = step * 4

  const left = 69
  const right = 760
  const top = 22
  const bottom = 238
  const x = (index) => months.length === 1 ? (left + right) / 2 : left + (right - left) * index / (months.length - 1)
  const y = (value) => bottom - Math.max(0, value) / chartMaximum * (bottom - top)
  const compact = (value) => {
    if (value >= 1000000) return `Rs. ${(value / 1000000).toFixed(1)}m`
    if (value >= 1000) return `Rs. ${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
    return `Rs. ${Number(value.toFixed(2))}`
  }
  const barWidth = Math.min(19, (right - left) / months.length / 4)
  const barGap = 3
  const hitWidth = (right - left) / Math.max(1, months.length - 1)

  return <div style={{ marginTop: 12, minWidth: 0 }}>
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5, marginBottom: 6 }} role="group" aria-label="Chart display">
      {['line', 'bar'].map((type) => <button
          key={type}
          type="button"
          aria-pressed={chartType === type}
          onClick={() => setChartType(type)}
          style={{
            padding: '7px 13px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700,
            border: '1px solid #eee5dc',
            background: chartType === type ? '#153d30' : '#fff',
            color: chartType === type ? '#fff' : '#645d54',
          }}
      >{type === 'line' ? 'Line chart' : 'Bar chart'}</button>)}
    </div>
    <svg viewBox="0 0 800 284" role="img" aria-label={`Monthly ${chartType} chart of collected sales, service charges, and net earnings`} style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}>
      {Array.from({ length: 5 }, (_, tick) => {
        const value = chartMaximum * tick / 4
        const tickY = y(value)
        return <g key={tick}>
          <line x1={left} x2={right} y1={tickY} y2={tickY} stroke="#eee9e1" strokeDasharray="4 5" />
          <text x={left - 10} y={tickY + 4} textAnchor="end" fill="#938a80" fontSize="11">{compact(value)}</text>
        </g>
      })}
      {months.map((month, index) => <text key={month.key} x={x(index)} y="264" textAnchor="middle" fill="#80776d" fontSize="12" fontWeight={index === selectedIndex ? '700' : '400'}>{month.label}</text>)}
      {chartType === 'line' ? visible.map((series) => {
        const points = months.map((month, index) => `${x(index)},${y(month[series.field])}`).join(' ')
        const area = `M ${x(0)} ${bottom} L ${months.map((month, index) => `${x(index)} ${y(month[series.field])}`).join(' L ')} L ${x(months.length - 1)} ${bottom} Z`
        return <g key={series.key}>
          <path d={area} fill={series.color} fillOpacity="0.055" />
          <polyline points={points} fill="none" stroke={series.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {months.map((month, index) => <circle key={month.key} cx={x(index)} cy={y(month[series.field])} r={index === selectedIndex ? 5 : 3.5} fill="#fff" stroke={series.color} strokeWidth="2.5" />)}
        </g>
      }) : months.map((month, monthIndex) => visible.map((series, seriesIndex) => {
        const barX = x(monthIndex) - (visible.length * (barWidth + barGap) - barGap) / 2 + seriesIndex * (barWidth + barGap)
        const barY = y(month[series.field])
        return <rect key={`${month.key}-${series.key}`} x={barX} y={barY} width={barWidth} height={Math.max(0, bottom - barY)} rx="3" fill={series.color} />
      }))}
      {months.map((month, index) => <rect
          key={`hit-${month.key}`}
          x={x(index) - hitWidth / 2}
          y={top}
          width={hitWidth}
          height={bottom - top}
          fill="transparent"
          tabIndex="0"
          role="button"
          aria-label={`${month.fullLabel}: ${visible.map((series) => `${series.label} ${moneyWithCents(month[series.field])}`).join(', ')}`}
          onMouseEnter={() => setSelectedMonth(index)}
          onFocus={() => setSelectedMonth(index)}
          onClick={() => setSelectedMonth(index)}
          style={{ cursor: 'pointer' }}
      ><title>{`${month.fullLabel} — ${visible.map((series) => `${series.label}: ${moneyWithCents(month[series.field])}`).join(' · ')}`}</title></rect>)}
    </svg>
    {active && <div style={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '9px 17px',
      padding: '11px 12px', borderRadius: 9, background: '#faf8f4', border: '1px solid #f0ebe4',
      fontSize: 11, color: '#514a42',
    }}>
      <strong style={{ minWidth: 92 }}>{active.fullLabel}</strong>
      {visible.map((series) => <span key={series.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: series.color }} />
        {series.label}: <b>{moneyWithCents(active[series.field])}</b>
      </span>)}
    </div>}
    <p className="wallet-chart-footnote">Based on collected orders. Hover, tap, or focus a month to view its totals. Months without collected orders show zero.</p>
  </div>
}

function PeriodPicker({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const pickerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    function closeOutside(event) {
      if (!pickerRef.current?.contains(event.target)) setOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return <div className="wallet-period-picker" ref={pickerRef}>
    <button type="button" className="wallet-period" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>{value}<span className="wallet-period-chevron">⌄</span></button>
    {open && <div className="wallet-period-menu" role="listbox" aria-label={label}><span className="wallet-period-menu-label">{label}</span>{options.map((option) => <button type="button" role="option" aria-selected={value === option} className={value === option ? 'selected' : ''} key={option} onClick={() => { onChange(option); setOpen(false) }}><span>{option}</span><b>{value === option ? '✓' : ''}</b></button>)}</div>}
  </div>
}

function BankLogo({ bank }) {
  const normalizedBank = bank.trim().toLowerCase().replace(/[’‘]/g, "'")
  const crop = Object.entries(bankLogoCrops).find(([name]) => normalizedBank.includes(name))?.[1]
  const scale = crop ? 26 / Math.max(crop.width, crop.height) : 0
  const logoStyle = crop ? {
    '--bank-sheet-size': `${1080 * scale}px ${1349 * scale}px`,
    '--bank-logo-position': `-${crop.x * scale}px -${crop.y * scale}px`,
  } : undefined
  return <span className={`wallet-bank-mark ${crop ? 'has-sprite-logo' : ''}`} style={logoStyle} role="img" aria-label={`${bank} logo`}>{!crop && <span>{bank.slice(0, 1).toUpperCase()}</span>}</span>
}

function BankNamePicker({ value, onSelect }) {
  const [open, setOpen] = useState(false)
  const pickerRef = useRef(null)
  const selected = sriLankanBanks.find((bank) => bank === value)

  useEffect(() => {
    if (!open) return undefined
    function closeOutside(event) {
      if (!pickerRef.current?.contains(event.target)) setOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return <div className="wallet-bank-name-picker" ref={pickerRef}>
    <button type="button" className="wallet-bank-picker-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>{selected ? <BankLogo bank={selected} /> : <span className="wallet-bank-name-placeholder">⌕</span>}<span className="wallet-bank-picker-copy"><b>{selected || 'Choose a bank'}</b><small>{selected ? 'Sri Lankan bank' : 'Select from available banks'}</small></span><span className="wallet-period-chevron">⌄</span></button>
    {open && <div className="wallet-bank-picker-menu wallet-bank-name-menu" role="listbox" aria-label="Select a Sri Lankan bank">{sriLankanBanks.map((bank) => <button type="button" role="option" aria-selected={selected === bank} className={selected === bank ? 'selected' : ''} key={bank} onClick={() => { onSelect(bank); setOpen(false) }}><BankLogo bank={bank} /><span className="wallet-bank-picker-copy"><b>{bank}</b><small>Bank account in Sri Lanka</small></span><span className="wallet-bank-option-check">{selected === bank ? '✓' : ''}</span></button>)}</div>}
  </div>
}

function BankAccountPicker({ accounts, selectedAccount, onSelect }) {
  const [open, setOpen] = useState(false)
  const pickerRef = useRef(null)
  const selected = accounts.find((account) => String(account.id) === selectedAccount) || accounts[0]

  useEffect(() => {
    if (!open) return undefined
    function closeOutside(event) {
      if (!pickerRef.current?.contains(event.target)) setOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  if (!selected) return <div className="wallet-dialog-note">Add a bank account before transferring.</div>
  return <div className="wallet-bank-picker" ref={pickerRef}>
    <button type="button" className="wallet-bank-picker-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}><BankLogo bank={selected.bank} /><span className="wallet-bank-picker-copy"><b>{selected.bank} · {selected.number}</b><small>{selected.name}</small></span><span className="wallet-period-chevron">⌄</span></button>
    {open && <div className="wallet-bank-picker-menu" role="listbox" aria-label="Choose a bank account">{accounts.map((account) => { const selectedOption = String(account.id) === selectedAccount; return <button type="button" role="option" aria-selected={selectedOption} className={selectedOption ? 'selected' : ''} key={account.id} onClick={() => { onSelect(String(account.id)); setOpen(false) }}><BankLogo bank={account.bank} /><span className="wallet-bank-picker-copy"><b>{account.bank}</b><small>{account.name} · {account.number}</small></span><span className="wallet-bank-option-check">{selectedOption ? '✓' : ''}</span></button> })}</div>}
  </div>
}

export default WalletPage