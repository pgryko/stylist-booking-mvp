import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StylistProfileClient } from '@/components/stylists/stylist-profile-client'

interface StylistProfilePageProps {
  params: Promise<{
    id: string
  }>
}

// Server-side data fetching
async function getStylist(id: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stylists/${id}`,
      {
        cache: 'no-store', // Always get fresh data for profiles
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching stylist:', error)
    throw error
  }
}

export default async function StylistProfilePage({ params }: StylistProfilePageProps) {
  const { id } = await params

  if (!id) {
    notFound()
  }

  const stylist = await getStylist(id)

  if (!stylist) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StylistProfileClient stylist={stylist} />
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: StylistProfilePageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const stylist = await getStylist(id)

    if (!stylist) {
      return {
        title: 'Stylist Not Found | The Independent Studio',
        description: 'The requested stylist profile could not be found.',
      }
    }

    const title = `${stylist.displayName} - ${stylist.specialty} | The Independent Studio`
    const description = stylist.bio
      ? `${stylist.bio.substring(0, 155)}...`
      : `Professional ${stylist.specialty.toLowerCase()} with ${stylist.yearsExperience || 'extensive'} years of experience in dance competitions.`

    return {
      title,
      description,
      keywords: `${stylist.displayName}, ${stylist.specialty}, dance stylist, competition hair, makeup artist`,
      openGraph: {
        title,
        description,
        type: 'profile',
        images: stylist.profileImageUrl
          ? [
              {
                url: stylist.profileImageUrl,
                width: 400,
                height: 400,
                alt: `${stylist.displayName}'s profile photo`,
              },
            ]
          : [],
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: stylist.profileImageUrl ? [stylist.profileImageUrl] : [],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Stylist Profile | The Independent Studio',
      description: 'View professional stylist profile and book services for dance competitions.',
    }
  }
}
