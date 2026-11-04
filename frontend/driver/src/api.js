// Session-cookie API client shared in behavior; each portal remains independently buildable.
export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const method = (options.method || 'GET').toUpperCase()
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const response = await fetch('/api/csrf', { credentials: 'include' })
    if (!response.ok) throw new Error('Unable to establish a secure session. Please sign in again.')
    const csrf = await response.json()
    headers.set(csrf.headerName, csrf.token)
  }
  return fetch(path, { ...options, method, headers, credentials: 'include', cache: 'no-store' })
}
export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {})
  let body = options.body
  if (body != null && !(body instanceof FormData) && typeof body !== 'string') { headers.set('Content-Type', 'application/json'); body = JSON.stringify(body) }
  const response = await apiFetch(path, { ...options, body, headers })
  const text = await response.text()
  let value
  try { value = text ? JSON.parse(text) : null } catch { value = text }
  if (!response.ok) { const error = new Error(value?.detail || value?.message || (response.status === 401 ? 'Please sign in.' : `Request failed (${response.status}).`)); error.status = response.status; throw error }
  return value
}
export function accountView(account) { return { ...account, identifier: account.email, displayName: [account.firstName, account.lastName].filter(Boolean).join(' ') } }
export function profileView(account) { return { name: [account.firstName, account.lastName].filter(Boolean).join(' '), email: account.email, phone: account.phone || '', address1: account.address1 || '', address2: account.address2 || '', address3: account.address3 || '', city: account.city || '', postalCode: account.postalCode || '', photo: account.photo || '' } }
export async function signIn(email, password, role) {
 const account=await api('/api/auth/login',{method:'POST',body:{email,password}})
 if(account.role!==role){await api('/api/auth/logout',{method:'POST'});throw new Error(`Use a ${role.toLowerCase()} account for this portal.`)}
 return account
}

const emailVerification = typeof window==='undefined'?null:new URLSearchParams(window.location.search).get('emailToken')
if(emailVerification) api('/api/account/email/verify',{method:'POST',body:{token:emailVerification}}).then(()=>{window.alert('Email verified. Sign in with your new email address.');window.location.replace('/')}).catch(error=>window.alert(error.message+' Sign in to the existing account, then reopen the verification link.'))
