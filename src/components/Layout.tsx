import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './layoutComponents/Footer'
import MockDataBanner from './MockDataBanner'

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <MockDataBanner />
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
