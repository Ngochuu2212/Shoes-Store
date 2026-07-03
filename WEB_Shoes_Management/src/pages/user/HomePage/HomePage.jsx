import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { productService } from '~/services/user/productService'
import { HeroSection } from '~/pages/user/HomePage/HeroSection'
import { ProductSection } from '~/components/user/ProductSection'

export const HomePage = () => {
  const [data, setData] = useState({ flashSale: [], topSelling: [], latest: [] })

  useEffect(() => {
    productService.getHomepageProducts().then(res => {
      setData(res)
    })
  }, [])

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="app-container mx-auto px-3 sm:px-4 md:px-6 flex flex-col gap-6 sm:gap-8 md:gap-10 pb-10">

        {/* Hero Section - Luôn hiển thị trên cùng */}
        <div className="w-full flex-shrink-0">
          <HeroSection />
        </div>

        {/* Flash Sale */}
        {data.flashSale?.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={sectionVariants}
            className="w-full"
          >
            <ProductSection
              title="Săn Sale Chớp Nhoáng"
              products={data.flashSale}
              icon="zap"
            />
          </motion.div>
        )}

        {/* Top Selling */}
        {data.topSelling?.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={sectionVariants}
            className="w-full"
          >
            <ProductSection
              title="Sản Phẩm Bán Chạy"
              products={data.topSelling}
              icon="trending"
            />
          </motion.div>
        )}

        {/* Latest Products */}
        {data.latest?.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={sectionVariants}
            className="w-full"
          >
            <ProductSection
              title="Sản Phẩm Mới"
              products={data.latest}
              icon="clock"
            />
          </motion.div>
        )}

      </main>
    </div>
  )
}