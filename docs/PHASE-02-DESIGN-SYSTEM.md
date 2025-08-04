# Phase 2: Design System & Core UI Components

## 📋 Phase Overview

**Status:** 0% Complete  
**Duration:** 4 weeks  
**Team Size:** 1-2 developers + 1 designer (optional)  
**Business Value:** Professional user experience foundation for all interfaces

## 🎯 Phase Goals

- Create cohesive visual identity for The Independent Studio
- Build reusable component library for rapid development
- Establish accessibility standards (WCAG 2.1 AA compliance)
- Implement responsive design patterns for mobile-first experience
- Set up component documentation with Storybook

## 🎨 Design System Foundation

### Brand Identity & Visual Direction

**Target Aesthetic:** Professional, elegant, trustworthy  
**Industry Context:** Dance competitions, beauty services, luxury experiences  
**User Personas:** Professional dancers (16-25), experienced stylists (25-45), event organizers (30-50)

### Color Palette

```css
/* Primary Colors - Deep purples and elegant blues */
--color-primary-50: #f5f3ff; /* Light purple background */
--color-primary-100: #ede9fe; /* Subtle purple tint */
--color-primary-500: #8b5cf6; /* Main brand purple */
--color-primary-600: #7c3aed; /* Hover states */
--color-primary-700: #6d28d9; /* Active states */
--color-primary-900: #4c1d95; /* Dark text on light backgrounds */

/* Secondary Colors - Gold accents for premium feel */
--color-secondary-200: #fef3c7; /* Light gold background */
--color-secondary-400: #fbbf24; /* Gold accents */
--color-secondary-500: #f59e0b; /* Main gold */
--color-secondary-600: #d97706; /* Hover gold */

/* Neutral Colors - Modern grays */
--color-neutral-50: #fafafa; /* Page backgrounds */
--color-neutral-100: #f5f5f5; /* Card backgrounds */
--color-neutral-200: #e5e5e5; /* Borders */
--color-neutral-400: #a3a3a3; /* Placeholder text */
--color-neutral-600: #525252; /* Secondary text */
--color-neutral-700: #404040; /* Primary text */
--color-neutral-900: #171717; /* High contrast text */

/* Semantic Colors */
--color-success-500: #10b981; /* Success states */
--color-warning-500: #f59e0b; /* Warning states */
--color-error-500: #ef4444; /* Error states */
--color-info-500: #3b82f6; /* Info states */
```

### Typography Scale

```css
/* Font Families */
--font-primary: 'Inter', system-ui, sans-serif; /* Main UI font */
--font-display: 'Playfair Display', serif; /* Headings and brand */
--font-mono: 'JetBrains Mono', monospace; /* Code and technical */

/* Type Scale (1.25 ratio) */
--text-xs: 0.75rem; /* 12px - Labels, captions */
--text-sm: 0.875rem; /* 14px - Small text */
--text-base: 1rem; /* 16px - Body text */
--text-lg: 1.125rem; /* 18px - Large body */
--text-xl: 1.25rem; /* 20px - Small headings */
--text-2xl: 1.5rem; /* 24px - Section headings */
--text-3xl: 1.875rem; /* 30px - Page headings */
--text-4xl: 2.25rem; /* 36px - Hero headings */
--text-5xl: 3rem; /* 48px - Display headings */
```

### Spacing & Layout

```css
/* Spacing Scale (0.25rem = 4px base) */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */

/* Container Sizes */
--container-sm: 640px; /* Small screens */
--container-md: 768px; /* Medium screens */
--container-lg: 1024px; /* Large screens */
--container-xl: 1280px; /* Extra large screens */
--container-2xl: 1536px; /* 2X large screens */
```

## 🧩 Core Component Library

### 1. Button Component

**Priority:** 🔥 CRITICAL  
**Effort:** 4-6 hours

**Variants:**

- `primary` - Main call-to-action buttons
- `secondary` - Secondary actions
- `outline` - Less prominent actions
- `ghost` - Minimal styling for navigation
- `destructive` - Delete/cancel actions

**Sizes:**

- `sm` - Small buttons (32px height)
- `md` - Default buttons (40px height)
- `lg` - Large buttons (48px height)

**States:**

- Default, hover, active, disabled, loading

**Technical Implementation:**

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Variant and size classes using cva (class-variance-authority)
  const buttonClasses = cn(baseClasses, getVariantClasses(variant), getSizeClasses(size), className);

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner className="mr-2" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
```

### 2. Input Component

**Priority:** 🔥 CRITICAL  
**Effort:** 4-6 hours

**Types:**

- Text, email, password, number, tel, url
- Textarea for multi-line input
- File upload with drag-and-drop

**Features:**

- Label integration
- Error state handling
- Help text support
- Icon integration (prefix/suffix)
- Validation state indicators

### 3. Card Component

**Priority:** 🔥 HIGH  
**Effort:** 3-4 hours

**Variants:**

- Default card with subtle shadow
- Elevated card with pronounced shadow
- Outline card with border
- Interactive card with hover states

**Sections:**

- Header with optional actions
- Content area
- Footer with actions

### 4. Modal/Dialog Component

**Priority:** 📊 HIGH  
**Effort:** 6-8 hours

**Features:**

- Backdrop click to close
- Escape key handling
- Focus management
- Size variants (sm, md, lg, xl, full)
- Animation support

### 5. Navigation Components

**Priority:** 🔥 CRITICAL  
**Effort:** 8-10 hours

**Components:**

- Header navigation with user menu
- Sidebar navigation for dashboards
- Breadcrumb navigation
- Pagination component
- Tab navigation

### 6. Form Components

**Priority:** 🔥 HIGH  
**Effort:** 6-8 hours

**Components:**

- Form wrapper with validation
- Field groups and sections
- Checkbox and radio groups
- Select dropdown with search
- Date/time picker integration

## 📱 Responsive Design Strategy

### Breakpoint System

```css
/* Mobile First Approach */
/* xs: 0px - 639px (default) */
/* sm: 640px+ */
/* md: 768px+ */
/* lg: 1024px+ */
/* xl: 1280px+ */
/* 2xl: 1536px+ */
```

### Layout Patterns

- **Mobile:** Single column, stacked navigation
- **Tablet:** Two-column grid, collapsible sidebar
- **Desktop:** Multi-column layouts, persistent navigation

### Touch Targets

- Minimum 44px touch targets on mobile
- Adequate spacing between interactive elements
- Swipe gestures for mobile navigation

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance

- **Color Contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **Screen Reader Support:** Proper ARIA labels and semantic HTML
- **Focus Management:** Visible focus indicators and logical tab order

### Implementation Guidelines

```typescript
// Example accessible button implementation
<button
  type="button"
  aria-label="Delete stylist profile"
  aria-describedby="delete-help-text"
  className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
>
  Delete Profile
</button>
<span id="delete-help-text" className="sr-only">
  This action cannot be undone
</span>
```

## 📚 Component Documentation Strategy

### Storybook Integration

- Interactive component playground
- Documentation for each component variant
- Accessibility testing integration
- Visual regression testing
- Design token documentation

### Documentation Structure

```
stories/
├── foundations/
│   ├── Colors.stories.tsx
│   ├── Typography.stories.tsx
│   └── Spacing.stories.tsx
├── components/
│   ├── Button.stories.tsx
│   ├── Input.stories.tsx
│   └── Card.stories.tsx
└── patterns/
    ├── Forms.stories.tsx
    ├── Navigation.stories.tsx
    └── DataDisplay.stories.tsx
```

## 🎭 Component Testing Strategy

### Unit Testing

- Component rendering tests
- Interaction testing (click, focus, keyboard)
- Accessibility testing with jest-axe
- Snapshot testing for visual regression

### Integration Testing

- Form submission workflows
- Navigation interactions
- Modal/dialog behavior
- Responsive behavior testing

## 📋 Task Breakdown

### Week 1: Design System Foundation

**Focus:** Design tokens, color system, typography  
**Deliverables:**

- [ ] Custom Tailwind configuration with design tokens
- [ ] Typography components and utilities
- [ ] Color palette implementation
- [ ] Spacing and layout utilities
- [ ] Storybook setup and initial documentation

### Week 2: Core Interactive Components

**Focus:** Button, Input, Form components  
**Deliverables:**

- [ ] Button component with all variants
- [ ] Input components (text, textarea, file)
- [ ] Form validation integration
- [ ] Basic form layouts and patterns
- [ ] Component testing suite

### Week 3: Layout & Navigation Components

**Focus:** Cards, modals, navigation  
**Deliverables:**

- [ ] Card component with variants
- [ ] Modal/Dialog component
- [ ] Header navigation with authentication
- [ ] Sidebar navigation for dashboards
- [ ] Responsive layout patterns

### Week 4: User Interface Screens

**Focus:** Registration, profiles, dashboards  
**Deliverables:**

- [ ] User registration forms (dancer/stylist)
- [ ] Profile management interfaces
- [ ] Dashboard layout templates
- [ ] Mobile responsive optimizations
- [ ] Accessibility audit and fixes

## 🎯 Phase 2 Success Criteria

### Technical Metrics

- [ ] 90%+ UI consistency score across components
- [ ] WCAG 2.1 AA compliance verified
- [ ] 95%+ test coverage for components
- [ ] <100ms component render time
- [ ] Zero accessibility violations in automated testing

### User Experience Metrics

- [ ] Mobile usability score >85%
- [ ] Component reusability rate >80%
- [ ] Designer-developer handoff efficiency improved 50%
- [ ] User interface Net Promoter Score >7

### Development Metrics

- [ ] Component development time reduced 40%
- [ ] Storybook documentation coverage 100%
- [ ] Design system adoption rate 95%
- [ ] Bug reports related to UI/UX <5% of total

## 🔄 Integration with Phase 3

### Handoff Preparation

- All components documented in Storybook
- Design patterns established for event listings
- Search and filtering component patterns ready
- Mobile-first responsive patterns validated

### Phase 3 Dependencies

- Card components for event display
- Form components for event creation
- Navigation components for event browsing
- Modal components for event details

---

**Previous Phase:** [Phase 1: Foundation & Infrastructure](./PHASE-01-FOUNDATION.md)  
**Next Phase:** Phase 3: Event Management System
