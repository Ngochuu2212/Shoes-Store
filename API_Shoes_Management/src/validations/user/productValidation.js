import Joi from 'joi'

// 1. Kiểm duyệt dữ liệu bộ lọc, tìm kiếm và phân trang (Query Params)
const searchAndFilterProducts = async (req, res, next) => {
  const correctCondition = Joi.object({
    search: Joi.string().allow('', null).max(200).trim().optional(),

    // Chuỗi slugs danh mục và id cửa hàng cách nhau bằng dấu phẩy
    categories: Joi.string().allow('', null).trim().optional(),
    stores: Joi.string().allow('', null).trim().optional(),

    // Khoảng giá phải là số không âm
    prices: Joi.string().allow('', null).trim().optional(),

    ratings: Joi.string().allow('', null).trim().optional(),

    sizes: Joi.string().allow('', null).trim().optional(),
    colors: Joi.string().allow('', null).trim().optional(),
    // Joi tự động hiểu các chuỗi 'true'/'false' gửi qua URL là boolean
    isDiscounted: Joi.boolean().optional(),

    // Kiểm duyệt phân trang chặt chẽ
    page: Joi.number().integer().min(1).optional().default(1).messages({
      'number.integer': 'Số trang phải là số nguyên.',
      'number.min': 'Số trang tối thiểu phải bắt đầu từ trang 1.'
    }),
    limit: Joi.number().integer().min(1).max(100).optional().default(8).messages({
      'number.integer': 'Số lượng sản phẩm mỗi trang phải là số nguyên.',
      'number.min': 'Số lượng hiển thị mỗi trang tối thiểu là 1 sản phẩm.',
      'number.max': 'Hệ thống chỉ cho phép tải tối đa 100 sản phẩm mỗi trang.'
    }),

    // Ép cứng các kiểu sắp xếp hợp lệ giống hệt switch-case dưới Model
    sortBy: Joi.string()
      .valid('latest', 'sold_desc', 'views_desc', 'price_asc', 'price_desc', 'rating_desc', 'name_asc')
      .optional()
      .default('latest')
      .messages({
        'any.only': 'Chế độ sắp xếp sản phẩm (sortBy) không hợp lệ.'
      })
  })

  try {
    // Chạy kiểm duyệt req.query đầu vào từ Client gửi lên
    await correctCondition.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Bộ lọc hoặc tham số phân trang sản phẩm gửi lên không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 2. Kiểm duyệt chuỗi định danh Slug trên URL khi vào trang chi tiết sản phẩm
const getProductDetail = async (req, res, next) => {
  // ... (Phần code cũ giữ nguyên)
  const correctCondition = Joi.object({
    slug: Joi.string()
      .trim()
      .regex(/^[a-z0-9-]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Đường dẫn sản phẩm (slug) không đúng định dạng URL chuẩn của hệ thống.',
        'any.required': 'Đường dẫn sản phẩm là bắt buộc.'
      })
  })

  try {
    await correctCondition.validateAsync(req.params)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số đường dẫn sản phẩm không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const productValidation = {
  searchAndFilterProducts,
  getProductDetail
}