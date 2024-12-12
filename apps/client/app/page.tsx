import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">NCB's Eagle:</span>
            <span className="block text-blue-600">Advanced Cryptocurrency Transaction Tracing</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Empowering law enforcement agencies with cutting-edge technology to trace and analyze cryptocurrency transactions involved in drug trafficking.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Button asChild>
                <Link href="/main">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Powerful Tools for Cryptocurrency Tracing
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {[
                {
                  name: 'Advanced Analytics',
                  description: 'Utilize cutting-edge algorithms to analyze complex transaction patterns.',
                },
                {
                  name: 'Real-time Monitoring',
                  description: 'Stay updated with real-time alerts on suspicious activities.',
                },
                {
                  name: 'Comprehensive Reporting',
                  description: 'Generate detailed reports for investigations and legal proceedings.',
                },
                {
                  name: 'Secure and Compliant',
                  description: 'Built with top-tier security measures and regulatory compliance in mind.',
                },
              ].map((feature) => (
                <div key={feature.name} className="relative">
                  <dt>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

