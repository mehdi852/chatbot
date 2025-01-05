import BaseSection from './BaseSection'
import Image from 'next/image'

export default function Hero({ 
  title, 
  subtitle, 
  primaryButton, 
  secondaryButton, 
  image 
}) {
  return (
    <BaseSection className="bg-gray-100">
      <div className="text-center">
        {title && (
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
          {primaryButton && (
            <button className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700">
              {primaryButton.text}
            </button>
          )}
          {secondaryButton && (
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50">
              {secondaryButton.text}
            </button>
          )}
        </div>
        {image && (
          <div className="relative">
            <Image 
              src={image.src} 
              width={image.width || 1000}
              height={image.height || 600}
              alt={image.alt || ''}
              className="rounded-lg shadow-xl mx-auto"
              style={{
                width: '100%',
                height: 'auto'
              }}
            />
          </div>
        )}
      </div>
    </BaseSection>
  )
}
