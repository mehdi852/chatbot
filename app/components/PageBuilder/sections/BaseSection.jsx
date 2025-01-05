export default function BaseSection({ children, className = '', ...props }) {
  return (
    <section className={`py-20 px-4 md:px-6 ${className}`} {...props}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  )
}
