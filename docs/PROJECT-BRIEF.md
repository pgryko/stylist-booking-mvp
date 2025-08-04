# Project Brief: The Independent Studio MVP

**Project:** The Independent Studio - Competition Stylist Platform  
**Version:** 1.0 (for MVP)  
**Date:** August 4, 2024

## 1. Introduction & Vision

### 1.1. The Opportunity & Project Goal

The current business model for hair and makeup services at major dance competitions is dominated by a few large studios. These studios book floor space and act as gatekeepers, charging high commission fees to the artists who work for them. This creates a high barrier to entry for talented, independent stylists and inflates costs for dancers.

The goal of this project is to build a Minimum Viable Product (MVP) for The Independent Studio, a premium online marketplace that disrupts this model. Our platform will connect independent stylists directly with dancers, providing artists with access to major events at a fairer commission rate, and offering dancers a seamless, stress-free booking experience.

### 1.2. Brand Vision

The Independent Studio is founded on the principles of Trust, Confidence, and Elegance. Our mission is to eliminate the stress and uncertainty of competition preparation for dancers. We provide a seamless, reliable platform where they can book a verified, elite artist with complete confidence. For stylists, we offer a merit-based community that provides access, fair compensation, and the freedom to focus on their craft.

## 2. Core User Personas

The platform must serve four distinct user groups:

**The Dancer (Client)**: Needs a reliable, easy way to find and book a high-quality, verified stylist for a specific competition. They value trust, convenience, and seeing a portfolio of work. Their goal is to look and feel beautiful and confident, with minimal stress.

**The Stylist (Vendor)**: A skilled professional who wants access to a steady stream of clients at competitions without the hassle of marketing and administration. They value fair commission rates and a simple way to manage their schedule.

**The Event Organiser**: Needs assurance that all vendors at their event are professional, reliable, and enhance the competition's prestige. They want a single, trusted point of contact to handle the entire hair and makeup operation, reducing their administrative burden.

**The Platform Admin (You)**: Needs a functional backend to manage the entire marketplace: vetting stylists, creating events, liaising with organisers, overseeing bookings, and ensuring smooth operations.

## 3. MVP User Experience (UX) & Feature Set

The MVP will focus on the core functionality required to run a successful pilot program.

### 3.1. Dancer Journey (The Booking Flow)

1. **Homepage**: Clean, minimalist landing page with the headline "The Independent Studio. Competition beauty, simplified." and a single call-to-action button: "Find Your Event".
2. **Event Selection**: A simple, visual list of upcoming competitions. The dancer selects their event.
3. **Stylist Gallery**: A grid of available, verified stylists for that event. Each stylist is shown with a professional headshot, name, and specialty (e.g., "Ballroom Hair Specialist").
4. **Stylist Profile**: A detailed page showing the stylist's portfolio (photo gallery), bio, and a list of services with fixed prices and durations (e.g., "Competition Makeup - 60 mins - $150").
5. **Booking & Checkout**:
   - After selecting a service, a calendar view shows available time slots for that stylist only during the event days.
   - The dancer selects a time slot.
   - A final checkout page summarizes the booking and securely captures payment via credit card.
6. **Confirmation**: A success page and an automated confirmation email are sent to the dancer with all appointment details. The page and email must include "Add to Calendar" buttons (for Google Calendar, Apple iCal, etc.).

### 3.2. Stylist Journey (Management Dashboard)

1. **Login**: Secure login to their personal dashboard.
2. **Daily Schedule View**: This is the primary view for stylists. It must be mobile-friendly and provide a clear, chronological timeline of their day's appointments. Each appointment block must show:
   - Time Slot (e.g., 9:00 AM - 10:00 AM)
   - Client Name
   - Service Booked (e.g., "Competition Makeup")
   - Client Contact Number
3. **Calendar Sync**: The dashboard must feature a prominent button allowing the stylist to "Export Schedule to Calendar" so they can sync all their bookings for an event to their personal calendar.
4. **Payouts View**: A separate tab showing "Pending Payouts" and "Payout History."

### 3.3. Admin Journey (Backend Control Panel)

The Admin backend must be functional for managing the entire marketplace.

1. **Event Management**: Ability to CREATE, UPDATE, and DELETE events (name, date, location).
2. **Stylist Management**:
   - Ability to CREATE stylist profiles (upload photos, write bios, add services/prices).
   - A crucial "Verify Stylist" checkbox. A stylist is not visible on the site until this is checked.
3. **Availability Management**: The core of the backend logic. For a selected event, the admin must be able to:
   - Assign verified stylists to the event.
   - For each assigned stylist, set their working hours for each day of the event (e.g., "Jane Doe, Saturday, 8:00 AM - 5:00 PM"). The system will use this to auto-generate available time slots.
4. **Booking Overview**: A view to see all confirmed bookings across all events.

### 3.4. Event Organiser Journey (Confidence & Oversight)

For the MVP, the organiser's journey is primarily offline, facilitated by the Platform Admin using the backend tools. The goal is to provide them with confidence and reduce their workload.

1. **Partnership (Offline)**: The Platform Admin establishes a relationship and agreement with the organiser.
2. **Vendor List Provision (Platform-Enabled)**: A key deliverable. The Platform Admin will use the backend to export a simple data file (e.g., CSV) containing a list of all confirmed, verified stylists attending the event. This data will include names and specialties, which the admin can then use to manually create a professional document for the organiser.
3. **Single Point of Contact (Operational)**: The organiser is assured they have a single point of contact (the Platform Admin) for any questions or issues related to the hair and makeup services, eliminating the need for them to manage multiple independent artists.

## 4. Technical & Backend Requirements

### 4.1. Technology Stack (Recommendation)

- **Frontend**: React / Next.js (for a fast, modern user experience).
- **Backend**: Node.js (Next.js) or Python (Django) (robust for handling API requests and business logic).
- **Database**: PostgreSQL (reliable and scalable).

### 4.2. Payment Integration (Crucial Requirement)

- **Processor**: Must use Stripe Connect. It is specifically designed for marketplaces and handles the required payment flow.
- **Payment Flow**:
  1. Dancer pays the full amount to the platform at the time of booking.
  2. Funds are held in escrow by Stripe Connect.
  3. **Payment Release Logic**: Payout to the stylist is initiated 3-5 business days after the event concludes. This is contingent on a simple, automated verification step (e.g., an email to the dancer asking if the service was completed satisfactorily, with a 48-hour window to report issues).
  4. The payout will be the total booking fee minus the platform's 25% commission.

### 4.3. Database Schema (High-Level)

The database must include tables for:

- **Users** (for all roles: Dancer, Stylist, Admin). Must include a phone number field for contact purposes.
- **StylistProfiles** (portfolio, bio, linked to a User)
- **Events** (name, date, location)
- **Services** (name, price, duration, linked to a Stylist)
- **Bookings** (links User, Stylist, Event, Service, time slot, payment status)
- **Availability** (links a Stylist to an Event with specific working hours)

### 4.4. Data Handling & Security

All user data, especially passwords and personal information, must be securely stored and handled. Implement standard security best practices.

### 4.5. Legal & Regional Compliance (MVP)

This section outlines technical requirements needed to comply with laws in our target markets.

#### 4.5.1. European Union (EU)

**GDPR Compliance**:

- **User Registration**: Must include an explicit, unticked checkbox for users to agree to our Terms of Service and Privacy Policy.
- **Data Access/Deletion**: The backend must support the ability to export or permanently delete a user's data upon request. While a fully automated frontend for this is a Stage 2 feature, the backend logic must exist for the admin to perform this manually.

**DAC7 Tax Reporting**:

- **Data Collection**: The StylistProfiles table must be extended to securely store additional required fields for EU stylists: Full Name, Address, Tax Identification Number (TIN), and Bank Account Details (IBAN).
- **Earnings Aggregation**: The backend must have a function to aggregate the total earnings for each stylist per calendar year to facilitate DAC7 reporting.

#### 4.5.2. United States (USA)

**Worker Classification**: The language used throughout the platform (UI copy, emails) must consistently refer to stylists as independent "artists," "professionals," or "vendors," never "employees." This is a product-wide requirement.

**1099-K Tax Reporting**:

- **Earnings Tracking**: The backend logic for earnings aggregation (similar to DAC7) must be in place for US stylists to facilitate 1099-K reporting for those who earn over the federal threshold.

**Work Permit Verification**:

- **Admin Functionality**: The StylistProfiles section in the admin backend must include a separate, admin-controlled checkbox: "US Work Permit Verified."
- **Booking Logic**: The system must prevent an admin from assigning a stylist to a US-based event unless this box is checked. This is a critical risk-management feature.

### 4.6. Calendar Integration (MVP)

**Implementation**: The most cost-effective method for the MVP is to generate a universal .ics file. This file format is compatible with Google Calendar, Apple Calendar, Outlook, and most other calendar applications.

**Functionality**:

- **For Dancers**: The confirmation page/email will contain a link to download an .ics file for their specific appointment.
- **For Stylists**: The dashboard will have a button to download a single .ics file containing all their confirmed bookings for a selected event.

## 5. Graphic Design & UI Elements

The visual identity must be premium, clean, and minimalist.

- **Logo**: An elegant wordmark for "The Independent Studio." The design should be clean and professional, perhaps using a strong, classic font.
- **Color Palette**: Primary colors should be deep charcoal and off-white/soft gray. A single, sophisticated accent color (e.g., muted gold or dusty rose) should be used sparingly for buttons and highlights.
- **Typography**:
  - **Headlines**: An elegant Serif font (e.g., Playfair Display, Cormorant Garamond).
  - **Body Text & UI Elements**: A clean, highly legible Sans-serif font (e.g., Inter, Lato).
- **Imagery**: Professional, high-quality photos are essential for stylist portfolios. The site design should accommodate these gracefully.

## 6. Stage 2: Post-MVP Roadmap

These features are essential for long-term growth but are not to be included in the MVP build to keep initial costs low.

- **Ratings & Reviews System**: Allow dancers to rate and review stylists after a completed appointment.
- **Stylist Self-Service**: Allow stylists to manage their own profiles, services, and general availability.
- **In-App Messaging**: A secure channel for dancers and stylists to communicate post-booking.
- **Advanced Search & Filtering**: Allow dancers to filter stylists by specialty, price, etc.
- **Organizer Portal**: A dedicated, secure portal for event organizers to view confirmed vendor lists for their event, access a single point of contact, and manage their partnership with The Independent Studio.
