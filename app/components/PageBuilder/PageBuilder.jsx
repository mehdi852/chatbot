'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'

// Import your section components
const componentMap = {
  hero: dynamic(() => import('./sections/Hero')),
  features: dynamic(() => import('./sections/Features')),
  testimonials: dynamic(() => import('./sections/Testimonials')),
  pricing: dynamic(() => import('./sections/Pricing')),
  // Add more section types as needed
}

export default function PageBuilder({ data }) {
  const sections = useMemo(() => {
    if (!data?.sections) return []
    
    return data.sections.map((section, index) => {
      const Component = componentMap[section.type]
      if (!Component) return null

      return (
        <Component 
          key={`${section.type}-${index}`}
          {...section.props}
        />
      )
    })
  }, [data])

  return (
    <div className="page-builder">
      {sections}
    </div>
  )
}
