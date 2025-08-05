'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Loader2,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Clock,
  Calendar,
  Users,
  Zap,
  Target,
} from 'lucide-react'

interface Service {
  id: string
  name: string
  price: number
}

interface PricingRule {
  id: string
  serviceId: string
  name: string
  description?: string
  ruleType: string
  modifierType: string
  modifierValue: number
  priority: number
  isActive: boolean
  conditions: Record<string, unknown>
  service: Service
  createdAt: string
  updatedAt: string
}

interface PricingRuleForm {
  serviceId: string
  name: string
  description: string
  ruleType: string
  modifierType: string
  modifierValue: number
  priority: number
  isActive: boolean
  conditions: Record<string, unknown>
}

const RULE_TYPES = [
  { value: 'TIME_BASED', label: 'Time-Based', icon: Clock, description: 'Peak hours, weekends' },
  {
    value: 'ADVANCE_BOOKING',
    label: 'Advance Booking',
    icon: Calendar,
    description: 'Early bird discounts/premiums',
  },
  {
    value: 'EVENT_BASED',
    label: 'Event-Based',
    icon: Target,
    description: 'Event type/size modifiers',
  },
  { value: 'SEASONAL', label: 'Seasonal', icon: Calendar, description: 'Seasonal adjustments' },
  {
    value: 'GROUP_SIZE',
    label: 'Duration-Based',
    icon: Users,
    description: 'Booking duration modifiers',
  },
  {
    value: 'DEMAND_BASED',
    label: 'Demand-Based',
    icon: Zap,
    description: 'Based on availability/demand',
  },
]

const MODIFIER_TYPES = [
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'FIXED_AMOUNT', label: 'Fixed Amount' },
]

export function PricingManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [selectedService, setSelectedService] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null)
  const [formData, setFormData] = useState<PricingRuleForm>({
    serviceId: '',
    name: '',
    description: '',
    ruleType: 'TIME_BASED',
    modifierType: 'PERCENTAGE',
    modifierValue: 0,
    priority: 0,
    isActive: true,
    conditions: {},
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load services and pricing rules
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load services
        const servicesResponse = await fetch('/api/dashboard/services')
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json()
          setServices(servicesData.services)
          if (servicesData.services.length > 0) {
            setSelectedService(servicesData.services[0].id)
          }
        }

        // Load pricing rules
        await loadPricingRules()
      } catch (error) {
        console.error('Error loading data:', error)
        setMessage({ type: 'error', text: 'Failed to load pricing data' })
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [loadPricingRules])

  // Load pricing rules when service changes
  useEffect(() => {
    if (selectedService) {
      loadPricingRules()
    }
  }, [selectedService, loadPricingRules])

  const loadPricingRules = useCallback(async () => {
    try {
      const url = selectedService
        ? `/api/dashboard/pricing-rules?serviceId=${selectedService}`
        : '/api/dashboard/pricing-rules'

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch pricing rules')
      const data = await response.json()
      setPricingRules(data.pricingRules)
    } catch (error) {
      console.error('Error loading pricing rules:', error)
      setMessage({ type: 'error', text: 'Failed to load pricing rules' })
    }
  }, [selectedService])

  const handleAddRule = () => {
    setFormData({
      serviceId: selectedService,
      name: '',
      description: '',
      ruleType: 'TIME_BASED',
      modifierType: 'PERCENTAGE',
      modifierValue: 0,
      priority: 0,
      isActive: true,
      conditions: {},
    })
    setEditingRule(null)
    setShowAddDialog(true)
  }

  const handleEditRule = (rule: PricingRule) => {
    setFormData({
      serviceId: rule.serviceId,
      name: rule.name,
      description: rule.description || '',
      ruleType: rule.ruleType,
      modifierType: rule.modifierType,
      modifierValue: rule.modifierValue,
      priority: rule.priority,
      isActive: rule.isActive,
      conditions: rule.conditions,
    })
    setEditingRule(rule)
    setShowAddDialog(true)
  }

  const handleSubmitRule = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      let response
      if (editingRule) {
        response = await fetch(`/api/dashboard/pricing-rules/${editingRule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        response = await fetch('/api/dashboard/pricing-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save pricing rule')
      }

      setMessage({
        type: 'success',
        text: editingRule
          ? 'Pricing rule updated successfully!'
          : 'Pricing rule created successfully!',
      })
      setShowAddDialog(false)
      loadPricingRules()
    } catch (error) {
      console.error('Error saving pricing rule:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save pricing rule',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRule = async (rule: PricingRule) => {
    if (!confirm(`Are you sure you want to delete the pricing rule "${rule.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/dashboard/pricing-rules/${rule.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete pricing rule')
      }

      setMessage({ type: 'success', text: 'Pricing rule deleted successfully!' })
      loadPricingRules()
    } catch (error) {
      console.error('Error deleting pricing rule:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete pricing rule',
      })
    }
  }

  const getRuleTypeIcon = (ruleType: string) => {
    const ruleConfig = RULE_TYPES.find((type) => type.value === ruleType)
    const Icon = ruleConfig?.icon || TrendingUp
    return <Icon className="h-4 w-4" />
  }

  const formatModifierValue = (modifierType: string, modifierValue: number) => {
    if (modifierType === 'PERCENTAGE') {
      const percentage = modifierValue * 100
      return `${percentage > 0 ? '+' : ''}${percentage}%`
    } else {
      return `${modifierValue > 0 ? '+' : ''}$${Math.abs(modifierValue)}`
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading pricing configuration...</span>
      </div>
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

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Dynamic Pricing
              </CardTitle>
              <CardDescription>
                Create pricing rules that automatically adjust your service prices based on demand,
                timing, and other factors
              </CardDescription>
            </div>
            <Button onClick={handleAddRule} disabled={!selectedService}>
              <Plus className="h-4 w-4 mr-2" />
              Add Pricing Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {services.length > 0 ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="service-select">Select Service</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a service to manage pricing" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{service.name}</span>
                          <span className="text-sm text-gray-500 ml-2">${service.price}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to create services first before setting up pricing rules. Go to the
                Services section to add your services.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Pricing Rules List */}
      {selectedService && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Rules</CardTitle>
            <CardDescription>
              Active pricing rules for the selected service. Rules are applied in priority order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pricingRules.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing rules yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first pricing rule to start using dynamic pricing
                </p>
                <Button onClick={handleAddRule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Pricing Rule
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {pricingRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getRuleTypeIcon(rule.ruleType)}
                          <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        </div>
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">Priority: {rule.priority}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-medium ${rule.modifierValue >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatModifierValue(rule.modifierType, rule.modifierValue)}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => handleEditRule(rule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteRule(rule)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {rule.description && (
                      <p className="text-sm text-gray-600 mt-2">{rule.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Service: {rule.service.name}</span>
                      <span>Type: {RULE_TYPES.find((t) => t.value === rule.ruleType)?.label}</span>
                      <span>Created: {new Date(rule.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Rule Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}</DialogTitle>
            <DialogDescription>
              Configure when and how this pricing rule should adjust your service price.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitRule} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule-name">Rule Name *</Label>
                <Input
                  id="rule-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Weekend Premium"
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority (0-100)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, priority: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe when this rule applies..."
                rows={2}
              />
            </div>

            {/* Rule Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule-type">Rule Type *</Label>
                <Select
                  value={formData.ruleType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, ruleType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RULE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="modifier-type">Modifier Type *</Label>
                <Select
                  value={formData.modifierType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, modifierType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODIFIER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="modifier-value">
                  Modifier Value *
                  {formData.modifierType === 'PERCENTAGE' ? ' (0.15 = 15%)' : ' (USD)'}
                </Label>
                <Input
                  id="modifier-value"
                  type="number"
                  step="0.01"
                  value={formData.modifierValue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      modifierValue: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder={formData.modifierType === 'PERCENTAGE' ? '0.15' : '25.00'}
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="is-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <Label htmlFor="is-active">Rule is active</Label>
              </div>
            </div>

            {/* Preview */}
            {formData.modifierValue !== 0 && selectedService && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Preview</h4>
                <div className="text-sm text-blue-800">
                  {(() => {
                    const selectedServiceObj = services.find((s) => s.id === selectedService)
                    if (!selectedServiceObj) return null

                    const basePrice = selectedServiceObj.price
                    const newPrice =
                      formData.modifierType === 'PERCENTAGE'
                        ? basePrice * (1 + formData.modifierValue)
                        : basePrice + formData.modifierValue

                    return (
                      <div className="flex items-center space-x-4">
                        <span>Base price: ${basePrice}</span>
                        <span>→</span>
                        <span className={newPrice >= basePrice ? 'text-green-700' : 'text-red-700'}>
                          New price: ${Math.round(newPrice * 100) / 100}
                        </span>
                        <span className="text-xs">
                          ({newPrice >= basePrice ? '+' : ''}$
                          {Math.round((newPrice - basePrice) * 100) / 100})
                        </span>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingRule ? (
                  'Update Rule'
                ) : (
                  'Create Rule'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
