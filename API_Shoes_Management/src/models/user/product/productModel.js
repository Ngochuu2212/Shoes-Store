import pool from '~/config/db'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constants'

const getFlashSaleProducts = async (limit = 8) => {
  const query = `
    SELECT 
      p.id, 
      p.store_id, 
      p.category_id, 
      p.name, 
      p.slug, 
      p.description, 
      p.price, 
      p.sold, 
      p.rating_avg, 
      p.view_count, 
      p.images,
      MAX(pr.name) AS promotion_name,
      MAX(pr.discount_value) AS discount_percentage,
      ROUND(p.price * (1 - MAX(pr.discount_value) / 100), 2) AS sale_price,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pv.id, 
            'size', pv.size, 
            'color', pv.color, 
            'stock', pv.stock,
            'image', pv.image
          )
        )
        FROM product_variants pv
        WHERE pv.product_id = p.id
      ) AS variants

    FROM products p
    INNER JOIN product_promotions pp ON p.id = pp.product_id
    INNER JOIN promotions pr ON pp.promotion_id = pr.id
    WHERE p.is_active = TRUE 
      AND p.status = ? 
      AND pr.is_active = TRUE
      AND NOW() BETWEEN pr.start_date AND pr.end_date 
    GROUP BY p.id 
    ORDER BY p.view_count DESC 
    LIMIT ?
  `

  const [rows] = await pool.execute(query, [PRODUCT_MODERATION_STATUS.APPROVED, String(limit)])
  return rows
}

const getTopSellingProducts = async (limit = 8) => {
  const query = `
    SELECT 
      p.id, 
      p.store_id, 
      p.category_id, 
      p.name, 
      p.slug, 
      p.description, 
      p.price, 
      p.sold, 
      p.rating_avg, 
      p.view_count, 
      p.images,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pv.id, 
            'size', pv.size, 
            'color', pv.color, 
            'stock', pv.stock,
            'image', pv.image
          )
        )
        FROM product_variants pv
        WHERE pv.product_id = p.id
      ) AS variants

    FROM products p 
    WHERE p.is_active = TRUE 
      AND p.status = ?  
    ORDER BY p.sold DESC 
    LIMIT ?
  `
  const [rows] = await pool.execute(query, [PRODUCT_MODERATION_STATUS.APPROVED, String(limit)])
  return rows
}

const getLatestProducts = async (limit = 8) => {
  const query = `
    SELECT 
      p.id, 
      p.store_id, 
      p.category_id, 
      p.name, 
      p.slug, 
      p.description, 
      p.price, 
      p.sold, 
      p.rating_avg, 
      p.view_count, 
      p.images, 
      p.created_at,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pv.id, 
            'size', pv.size, 
            'color', pv.color, 
            'stock', pv.stock,
            'image', pv.image
          )
        )
        FROM product_variants pv
        WHERE pv.product_id = p.id
      ) AS variants

    FROM products p 
    WHERE p.is_active = TRUE 
      AND p.status = ? 
    ORDER BY p.created_at DESC 
    LIMIT ?
  `
  const [rows] = await pool.execute(query, [PRODUCT_MODERATION_STATUS.APPROVED, String(limit)])
  return rows
}

const getProductBySlug = async (slug) => {
  const query = `
    SELECT 
      p.id, 
      p.store_id, 
      p.category_id, 
      p.name, 
      p.slug, 
      p.description, 
      p.price, 
      p.sold, 
      p.rating_avg, 
      p.view_count, 
      p.images,
      -- Thông tin Category
      c.name AS category_name,
      c.slug AS category_slug,
      -- Thông tin Store
      s.name AS store_name,
      s.logo AS store_logo,
      s.rating_average AS store_rating,
      s.address AS store_address,
      s.created_at AS store_created_at,
      pr.name AS promotion_name,
      pr.discount_value AS discount_percentage
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN stores s ON p.store_id = s.id
    
    LEFT JOIN product_promotions pp ON p.id = pp.product_id
    
    LEFT JOIN promotions pr ON pp.promotion_id = pr.id 
      AND pr.is_active = TRUE 
      AND NOW() BETWEEN pr.start_date AND pr.end_date
      
    WHERE p.slug = ? 
      AND p.is_active = TRUE 
      AND p.status = ? 
    
    ORDER BY pr.discount_value DESC
    LIMIT 1
  `

  const [rows] = await pool.execute(query, [slug, PRODUCT_MODERATION_STATUS.APPROVED])
  return rows[0]
}

const getProductVariants = async (productId) => {
  const query = 'SELECT id, size, color, stock, image FROM product_variants WHERE product_id = ?'
  const [rows] = await pool.execute(query, [productId])
  return rows
}

const getRelatedProducts = async (categoryId, currentProductId, limit = 4) => {
  const query = `
    SELECT 
      p.id, 
      p.store_id, 
      p.category_id, 
      p.name, 
      p.slug, 
      p.price, 
      p.sold, 
      p.rating_avg, 
      p.images,
      (
        SELECT pr.discount_value 
        FROM promotions pr
        JOIN product_promotions pp ON pr.id = pp.promotion_id
        WHERE pp.product_id = p.id 
          AND pr.is_active = TRUE 
          AND NOW() BETWEEN pr.start_date AND pr.end_date
        ORDER BY pr.discount_value DESC
        LIMIT 1
      ) AS discount_percentage,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pv.id, 
            'size', pv.size, 
            'color', pv.color, 
            'stock', pv.stock,
            'image', pv.image
          )
        )
        FROM product_variants pv
        WHERE pv.product_id = p.id
      ) AS variants

    FROM products p 
    WHERE p.category_id = ? 
      AND p.id != ? 
      AND p.is_active = TRUE 
      AND p.status = ?  
    ORDER BY p.sold DESC, p.rating_avg DESC
    LIMIT ?
  `

  const [rows] = await pool.execute(query, [categoryId, currentProductId, PRODUCT_MODERATION_STATUS.APPROVED, String(limit)])
  return rows
}

const increaseViewCount = async (productId) => {
  await pool.execute('UPDATE products SET view_count = view_count + 1 WHERE id = ?', [productId])
}

const searchAndFilterProducts = async (filters) => {
  const { search, categorySlugs, storeIds, ratings, limit, offset, sortBy, sizes, colors, prices, isDiscounted } = filters

  let queryData = `
    SELECT 
      p.id, 
      p.store_id, 
      p.category_id, 
      p.name, 
      p.slug, 
      p.description, 
      p.price, 
      p.sold, 
      p.rating_avg, 
      p.view_count, 
      p.images,
      
      (
        SELECT pr.discount_value 
        FROM promotions pr
        JOIN product_promotions pp ON pr.id = pp.promotion_id
        WHERE pp.product_id = p.id 
          AND pr.is_active = TRUE 
          AND NOW() BETWEEN pr.start_date AND pr.end_date
        ORDER BY pr.discount_value DESC
        LIMIT 1
      ) AS discount_percentage,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pv.id, 
            'size', pv.size, 
            'color', pv.color, 
            'stock', pv.stock,
            'image', pv.image
          )
        )
        FROM product_variants pv
        WHERE pv.product_id = p.id
      ) AS variants

    FROM products p 
    WHERE p.is_active = TRUE 
      AND p.status = ? 
  `

  let queryCount = `
    SELECT COUNT(*) AS total 
    FROM products p
    WHERE p.is_active = TRUE 
      AND p.status = ? 
  `

  let whereClauses = ''
  let params = [PRODUCT_MODERATION_STATUS.APPROVED]

  if (search) {
    whereClauses += ' AND p.name LIKE ?'
    params.push(`%${search}%`)
  }

  if (categorySlugs && categorySlugs.length > 0) {
    const categoryConditions = categorySlugs.map(() => {
      return `(
        p.category_id IN (
          SELECT id FROM categories 
          WHERE slug = ? OR parent_id IN (
            SELECT id FROM categories WHERE slug = ?
          )
        )
      )`
    }).join(' OR ')

    // Mỗi slug cần được truyền 2 lần (1 cho chính nó, 1 cho parent_id)
    const flatParams = []
    categorySlugs.forEach(slug => {
      flatParams.push(slug, slug)
    })

    whereClauses += ` AND (${categoryConditions})`
    params = [...params, ...flatParams]
  }

  if (storeIds && storeIds.length > 0) {
    const placeholders = storeIds.map(() => '?').join(',')
    whereClauses += ` AND p.store_id IN (${placeholders})`
    params = [...params, ...storeIds]
  }

  // LỌC KHOẢNG GIÁ ĐA ĐIỀU KIỆN
  if (prices && prices.length > 0) {
    const priceConditions = []
    prices.forEach(p => {
      const [min, max] = p.split('-')
      if (max === 'max') {
        priceConditions.push('(p.price >= ?)')
        params.push(Number(min))
      } else {
        priceConditions.push('(p.price >= ? AND p.price <= ?)')
        params.push(Number(min), Number(max))
      }
    })
    whereClauses += ` AND (${priceConditions.join(' OR ')})`
  }
  if (ratings && ratings.length > 0) {
    const placeholders = ratings.map(() => '?').join(',')
    whereClauses += ` AND FLOOR(p.rating_avg) IN (${placeholders})`
    params = [...params, ...ratings]
  }

  // Lọc theo Size
  if (sizes && sizes.length > 0) {
    const placeholders = sizes.map(() => '?').join(',')
    whereClauses += ` AND p.id IN (SELECT product_id FROM product_variants WHERE size IN (${placeholders}))`
    params = [...params, ...sizes]
  }

  // Lọc theo Màu
  if (colors && colors.length > 0) {
    const placeholders = colors.map(() => '?').join(',')
    whereClauses += ` AND p.id IN (SELECT product_id FROM product_variants WHERE color IN (${placeholders}))`
    params = [...params, ...colors]
  }

  // Lọc sản phẩm Đang Giảm Giá
  if (isDiscounted) {
    whereClauses += ` AND p.id IN (
      SELECT pp.product_id 
      FROM product_promotions pp 
      INNER JOIN promotions pr ON pp.promotion_id = pr.id 
      WHERE pr.is_active = TRUE AND NOW() BETWEEN pr.start_date AND pr.end_date
    )`
  }

  let orderByClause = ' ORDER BY p.created_at DESC'

  switch (sortBy) {
    case 'latest':
      orderByClause = ' ORDER BY p.created_at DESC'
      break
    case 'sold_desc':
      orderByClause = ' ORDER BY p.sold DESC'
      break
    case 'views_desc':
      orderByClause = ' ORDER BY p.view_count DESC'
      break
    case 'price_asc':
      orderByClause = ' ORDER BY p.price ASC'
      break
    case 'price_desc':
      orderByClause = ' ORDER BY p.price DESC'
      break
    case 'rating_desc':
      orderByClause = ' ORDER BY p.rating_avg DESC'
      break
    case 'name_asc':
      orderByClause = ' ORDER BY p.name ASC'
      break
    default:
      orderByClause = ' ORDER BY p.created_at DESC'
  }

  queryData += whereClauses + orderByClause + ' LIMIT ? OFFSET ?'
  queryCount += whereClauses

  const [countRows] = await pool.execute(queryCount, params)
  const total = countRows[0].total

  const finalParams = [...params, String(limit), String(offset)]
  const [products] = await pool.execute(queryData, finalParams)

  // Parse variants
  const parsedProducts = products.map(product => {
    if (product.variants) {
      try {
        product.variants = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants
        product.variants = product.variants.map(variant => {
          if (variant.image && typeof variant.image === 'string') {
            try {
              variant.image = JSON.parse(variant.image)
            } catch (e) {
              variant.image = null
            }
          }
          return variant
        })
      } catch (e) {
        product.variants = []
      }
    } else {
      product.variants = []
    }
    return product
  })

  return { products: parsedProducts, total }
}

const getEmptyCartRecommendations = async (limit = 8) => {
  const query = `
    SELECT 
      p.id, p.store_id, p.category_id, p.name, p.slug, p.description, p.price, p.sold, p.rating_avg, p.images,
      (
        SELECT pr.discount_value FROM promotions pr
        JOIN product_promotions pp ON pr.id = pp.promotion_id
        WHERE pp.product_id = p.id AND pr.is_active = TRUE AND NOW() BETWEEN pr.start_date AND pr.end_date
        ORDER BY pr.discount_value DESC LIMIT 1
      ) AS discount_percentage,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pv.id, 
            'size', pv.size, 
            'color', pv.color, 
            'stock', pv.stock,
            'image', pv.image
          )
        )
        FROM product_variants pv 
        WHERE pv.product_id = p.id
      ) AS variants
    FROM products p 
    WHERE p.is_active = TRUE 
      AND p.status = ?  
    ORDER BY p.sold DESC, p.rating_avg DESC 
    LIMIT ?
  `
  const [rows] = await pool.execute(query, [PRODUCT_MODERATION_STATUS.APPROVED, String(limit)])

  // Parse variants
  return rows.map(product => {
    if (product.variants) {
      try {
        product.variants = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants
        product.variants = product.variants.map(variant => {
          if (variant.image && typeof variant.image === 'string') {
            try {
              variant.image = JSON.parse(variant.image)
            } catch (e) {
              variant.image = null
            }
          }
          return variant
        })
      } catch (e) {
        product.variants = []
      }
    } else {
      product.variants = []
    }
    return product
  })
}

const getPostCheckoutRecommendations = async (categoryIds, excludedIds, limit = 8) => {
  let query = `
    SELECT 
      p.id, p.store_id, p.category_id, p.name, p.slug, p.description, p.price, p.sold, p.rating_avg, p.images,
      (
        SELECT pr.discount_value FROM promotions pr
        JOIN product_promotions pp ON pr.id = pp.promotion_id
        WHERE pp.product_id = p.id AND pr.is_active = TRUE AND NOW() BETWEEN pr.start_date AND pr.end_date
        ORDER BY pr.discount_value DESC LIMIT 1
      ) AS discount_percentage,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pv.id, 
            'size', pv.size, 
            'color', pv.color, 
            'stock', pv.stock,
            'image', pv.image
          )
        )
        FROM product_variants pv 
        WHERE pv.product_id = p.id
      ) AS variants
    FROM products p 
    WHERE p.is_active = TRUE 
      AND p.status = ? 
      AND p.category_id IN (?)
  `

  let params = [PRODUCT_MODERATION_STATUS.APPROVED, categoryIds]

  if (excludedIds && excludedIds.length > 0) {
    query += ' AND p.id NOT IN (?)'
    params.push(excludedIds)
  }

  query += ' ORDER BY p.sold DESC, p.rating_avg DESC LIMIT ?'
  params.push(Number(limit))

  const [rows] = await pool.query(query, params)

  // Parse variants
  return rows.map(product => {
    if (product.variants) {
      try {
        product.variants = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants
        product.variants = product.variants.map(variant => {
          if (variant.image && typeof variant.image === 'string') {
            try {
              variant.image = JSON.parse(variant.image)
            } catch (e) {
              variant.image = null
            }
          }
          return variant
        })
      } catch (e) {
        product.variants = []
      }
    } else {
      product.variants = []
    }
    return product
  })
}

export const productModel = {
  getFlashSaleProducts,
  getTopSellingProducts,
  getLatestProducts,
  getProductBySlug,
  getProductVariants,
  getRelatedProducts,
  increaseViewCount,
  searchAndFilterProducts,
  getEmptyCartRecommendations,
  getPostCheckoutRecommendations
}