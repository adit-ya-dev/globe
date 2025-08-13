"use client"

import dynamic from 'next/dynamic'

// Dynamic import for Earth Globe
const RealisticEarthHero = dynamic(
  () => import('./component/RealisticEarthGlobe'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }
)

// About Section Component
function AboutSection() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-black to-slate-900 text-white py-20">
      <div className="container mx-auto px-6 lg:px-12">
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-12">
          About Our Mission
        </h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-gray-300 mb-6">
              We are exploring the boundaries of space technology and Earth observation
              to create a better future for humanity.
            </p>
            <p className="text-lg text-gray-300 mb-6">
              Our advanced satellite systems provide real-time data about our planet,
              helping scientists, researchers, and policymakers make informed decisions.
            </p>
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors">
              Learn More
            </button>
          </div>
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  🌍
                </div>
                <div>
                  <h3 className="font-semibold text-xl">Global Coverage</h3>
                  <p className="text-gray-400">24/7 Earth monitoring</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  🛰️
                </div>
                <div>
                  <h3 className="font-semibold text-xl">Satellite Network</h3>
                  <p className="text-gray-400">500+ satellites in orbit</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  📊
                </div>
                <div>
                  <h3 className="font-semibold text-xl">Data Analytics</h3>
                  <p className="text-gray-400">Real-time processing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Features Section Component
function FeaturesSection() {
  const features = [
    {
      title: "Climate Monitoring",
      description: "Track global climate patterns and changes in real-time",
      icon: "🌡️",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Ocean Analysis",
      description: "Monitor ocean temperatures, currents, and marine ecosystems",
      icon: "🌊",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Urban Planning",
      description: "Support city development with detailed geographical data",
      icon: "🏙️",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Agriculture",
      description: "Optimize crop yields with precision agriculture insights",
      icon: "🌾",
      color: "from-green-500 to-lime-500"
    }
  ]

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white py-20">
      <div className="container mx-auto px-6 lg:px-12">
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-12">
          Our Capabilities
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:border-white/20 transition-all"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative z-10">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Stats Section Component
function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 to-black text-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl lg:text-5xl font-bold text-blue-400">195</div>
            <div className="text-gray-400 mt-2">Countries Covered</div>
          </div>
          <div>
            <div className="text-4xl lg:text-5xl font-bold text-green-400">500+</div>
            <div className="text-gray-400 mt-2">Active Satellites</div>
          </div>
          <div>
            <div className="text-4xl lg:text-5xl font-bold text-purple-400">10TB</div>
            <div className="text-gray-400 mt-2">Daily Data</div>
          </div>
          <div>
            <div className="text-4xl lg:text-5xl font-bold text-orange-400">24/7</div>
            <div className="text-gray-400 mt-2">Monitoring</div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Contact Section Component
function ContactSection() {
  return (
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold mb-8">
          Get Started Today
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join us in exploring and protecting our planet with cutting-edge satellite technology
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors">
            Contact Sales
          </button>
          <button className="px-8 py-3 border border-white/20 hover:bg-white/10 rounded-full transition-colors">
            View Documentation
          </button>
        </div>
      </div>
    </section>
  )
}

// Main Page Component
export default function Home() {
  return (
    <main className="overflow-x-hidden">
      {/* Hero Section with Earth Globe */}
      <RealisticEarthHero />
      
      {/* About Section */}
      <AboutSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Contact Section */}
      <ContactSection />
    </main>
    <section>hi</section>
  )
}