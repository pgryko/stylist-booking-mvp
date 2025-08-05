'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  CreditCard,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  XCircle,
  DollarSign,
  Settings,
  RefreshCw,
} from 'lucide-react'

interface StripeAccountStatus {
  hasAccount: boolean
  accountId?: string
  status: 'not_created' | 'incomplete' | 'pending' | 'active' | 'restricted' | 'error'
  canAcceptPayments: boolean
  canReceivePayouts: boolean
  requiresAction: boolean
  requirements?: {
    currentlyDue: string[]
    eventuallyDue: string[]
    pendingVerification: string[]
  }
  payoutsEnabled?: boolean
  chargesEnabled?: boolean
  detailsSubmitted?: boolean
  error?: string
}

export function StripeConnect() {
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load account status on component mount
  useEffect(() => {
    loadAccountStatus()
  }, [])

  const loadAccountStatus = async () => {
    try {
      const response = await fetch('/api/stripe/connect/status')
      if (!response.ok) throw new Error('Failed to fetch account status')
      const data = await response.json()
      setAccountStatus(data)
    } catch (error) {
      console.error('Error loading account status:', error)
      setMessage({ type: 'error', text: 'Failed to load payment account status' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartOnboarding = async () => {
    setIsProcessing(true)
    setMessage(null)

    try {
      const response = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start onboarding')
      }

      const data = await response.json()

      // Redirect to Stripe onboarding
      window.location.href = data.url
    } catch (error) {
      console.error('Error starting onboarding:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to start onboarding',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAccessDashboard = async () => {
    setIsProcessing(true)
    setMessage(null)

    try {
      const response = await fetch('/api/stripe/connect/dashboard', {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to access dashboard')
      }

      const data = await response.json()

      // Redirect to Stripe dashboard
      window.open(data.url, '_blank')
      setMessage({ type: 'success', text: data.message || 'Opened Stripe dashboard' })
    } catch (error) {
      console.error('Error accessing dashboard:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to access dashboard',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'incomplete':
        return <Badge className="bg-orange-100 text-orange-800">Incomplete</Badge>
      case 'restricted':
        return <Badge className="bg-red-100 text-red-800">Restricted</Badge>
      case 'not_created':
        return <Badge variant="secondary">Not Set Up</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'pending':
      case 'incomplete':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'restricted':
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Loading payment settings...</span>
        </CardContent>
      </Card>
    )
  }

  if (!accountStatus) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load payment account information. Please refresh the page and try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : ''}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : ''}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Payment Account Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Account
          </CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payments from bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(accountStatus.status)}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Account Status</span>
                  {getStatusBadge(accountStatus.status)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {accountStatus.status === 'not_created' && 'No payment account connected'}
                  {accountStatus.status === 'incomplete' && 'Account setup needs to be completed'}
                  {accountStatus.status === 'pending' && 'Account verification in progress'}
                  {accountStatus.status === 'active' &&
                    'Account active and ready to receive payments'}
                  {accountStatus.status === 'restricted' &&
                    'Account has restrictions - contact support'}
                  {accountStatus.error && accountStatus.error}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={loadAccountStatus} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Capabilities */}
          {accountStatus.hasAccount && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${accountStatus.canAcceptPayments ? 'bg-green-500' : 'bg-gray-300'}`}
                />
                <span className="text-sm">Accept Payments</span>
                {accountStatus.canAcceptPayments && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${accountStatus.canReceivePayouts ? 'bg-green-500' : 'bg-gray-300'}`}
                />
                <span className="text-sm">Receive Payouts</span>
                {accountStatus.canReceivePayouts && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>
          )}

          {/* Requirements */}
          {accountStatus.requiresAction && accountStatus.requirements && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">Action Required</span>
              </div>
              {accountStatus.requirements.currentlyDue.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm text-yellow-700 font-medium">Currently Due:</p>
                  <ul className="text-sm text-yellow-700 ml-4 list-disc">
                    {accountStatus.requirements.currentlyDue.map((req) => (
                      <li key={req}>
                        {req.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {accountStatus.requirements.eventuallyDue.length > 0 && (
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Eventually Due:</p>
                  <ul className="text-sm text-yellow-700 ml-4 list-disc">
                    {accountStatus.requirements.eventuallyDue.map((req) => (
                      <li key={req}>
                        {req.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!accountStatus.hasAccount || accountStatus.status === 'incomplete' ? (
              <Button onClick={handleStartOnboarding} disabled={isProcessing} className="flex-1">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    {accountStatus.hasAccount ? 'Complete Setup' : 'Set Up Payment Account'}
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleAccessDashboard} disabled={isProcessing} className="flex-1">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Access Stripe Dashboard
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <DollarSign className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">How Payments Work</h4>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Clients pay through our secure platform</li>
                  <li>• We take a 15% platform fee from each booking</li>
                  <li>• Your earnings are transferred to your bank account weekly</li>
                  <li>• You&apos;ll receive detailed reports of all transactions</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      {accountStatus.hasAccount && accountStatus.status === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Payment Settings
            </CardTitle>
            <CardDescription>
              Manage your payment preferences and view transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">Payout Schedule</h4>
                  <p className="text-sm text-gray-600 mt-1">Weekly on Fridays</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">Platform Fee</h4>
                  <p className="text-sm text-gray-600 mt-1">15% per booking</p>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>
                  To modify payment settings, tax information, or banking details, use the
                  &quot;Access Stripe Dashboard&quot; button above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
