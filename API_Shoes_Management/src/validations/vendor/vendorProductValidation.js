import Joi from 'joi'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constants'

// 1. Kiểm duyệt khi thêm mới sản phẩm
const validateCreateProductBody = async (req, res, next) => {
  const correctCondition = Joi.object({
    categoryId: Joi.number().integer().positive().required().messages({
      'any.required': 'Danh mục sản phẩm (categoryId) là bắt buộc.'
    }),
    name: Joi.string().min(3).max(150).trim().required().messages({
      'string.empty': 'Tên sản phẩm không được để trống.',
      'string.min': 'Tên sản phẩm phải dài từ 3 ký tự trở lên.'
    }),
    description: Joi.string().max(2000).trim().optional().allow('', null),
    price: Joi.number().positive().min(1000).required().messages({
      'number.positive': 'Giá bán sản phẩm phải lớn hơn 0.',
      'number.min': 'Giá bán sản phẩm tối thiểu phải từ 1,000đ trở lên.',
      'any.required': 'Giá bán sản phẩm là bắt buộc.'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu thêm sản phẩm không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 2. Kiểm duyệt khi chỉnh sửa thông tin sản phẩm
const validateUpdateProduct = async (req, res, next) => {
  const paramCondition = Joi.object({
    id: Joi.number().integer().positive().required()
  })

  const bodyCondition = Joi.object({
    categoryId: Joi.number().integer().positive().required(),
    name: Joi.string().min(3).max(150).trim().required(),
    description: Joi.string().max(2000).trim().optional().allow('', null),
    price: Joi.number().positive().min(1000).required()
  })

  try {
    await paramCondition.validateAsync(req.params)
    await bodyCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu cập nhật sản phẩm không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 3. Kiểm duyệt ID sản phẩm trên URL (Dùng chung cho Xóa, Xem chi tiết)
const validateProductIdParam = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã định danh sản phẩm phải là định dạng số.'
    })
  })

  try {
    await correctCondition.validateAsync(req.params)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số mã sản phẩm trên URL không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 4. Kiểm duyệt dữ liệu khi thêm biến thể kho (Size, Màu, Tồn kho)
const validateCreateVariantBody = async (req, res, next) => {
  const paramCondition = Joi.object({
    id: Joi.number().integer().positive().required()
  })

  const bodyCondition = Joi.object({
    size: Joi.string().min(1).max(10).trim().required().messages({
      'string.empty': 'Kích thước (size) sản phẩm không được để trống.'
    }),
    color: Joi.string().max(30).trim().optional().allow('', null),
    stock: Joi.number().integer().min(0).required().messages({
      'number.min': 'Số lượng hàng tồn kho (stock) không được nhỏ hơn 0.',
      'any.required': 'Số lượng hàng tồn kho là thông tin bắt buộc.'
    }),
    image: Joi.any().optional().allow(null)
  })

  try {
    await paramCondition.validateAsync(req.params)
    await bodyCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu biến thể kho hàng gửi lên không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 5. Kiểm duyệt bộ lọc danh sách sản phẩm (Query Params)
const validateGetProductsFilters = async (req, res, next) => {
  const correctCondition = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    search: Joi.string().allow('', null).trim().optional(),
    categoryId: Joi.number().integer().positive().optional(),
    isActive: Joi.number().valid(0, 1).optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    sortBy: Joi.string().valid('ctime', 'oldest', 'price_asc', 'price_desc', 'sold', 'rating').optional()
  })

  try {
    await correctCondition.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số bộ lọc danh sách sản phẩm gửi lên không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 6. Kiểm duyệt khi cập nhật trạng thái hoạt động của 1 sản phẩm đơn lẻ
const validateToggleActiveSingleBody = async (req, res, next) => {
  const paramCondition = Joi.object({
    id: Joi.number().integer().positive().required()
  })

  const bodyCondition = Joi.object({
    isActive: Joi.boolean().required().messages({
      'any.required': 'Trạng thái isActive (true/false) là thông tin bắt buộc.'
    })
  })

  try {
    await paramCondition.validateAsync(req.params)
    await bodyCondition.validateAsync(req.body)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu cập nhật trạng thái hoạt động không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 7. Kiểm duyệt khi bấm checkbox cập nhật hoạt động hàng loạt
const validateToggleActiveBulkBody = async (req, res, next) => {
  const correctCondition = Joi.object({
    productIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
      'array.base': 'Danh sách mã sản phẩm phải là một mảng dữ liệu số.',
      'array.min': 'Vui lòng chọn ít nhất 1 sản phẩm để xử lý.'
    }),
    isActive: Joi.boolean().required()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu cập nhật trạng thái hàng loạt không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 8. Kiểm duyệt khi bốc checkbox xóa hàng loạt hoặc gửi khiếu nại duyệt lại
const validateProductIdsBulkBody = async (req, res, next) => {
  const correctCondition = Joi.object({
    productIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
      'array.min': 'Vui lòng tích chọn tối thiểu 1 sản phẩm để thực thi thao tác.'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Danh sách ID sản phẩm hàng loạt gửi lên không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

const validateUpdateVariantBody = async (req, res, next) => {
  const paramCondition = Joi.object({
    productId: Joi.number().integer().positive().required(),
    variantId: Joi.number().integer().positive().required()
  })

  const bodyCondition = Joi.object({
    size: Joi.string().min(1).max(10).trim().required().messages({
      'string.empty': 'Kích thước (size) không được để trống.'
    }),
    color: Joi.string().max(30).trim().optional().allow('', null),
    stock: Joi.number().integer().min(0).required().messages({
      'number.min': 'Số lượng tồn kho không được nhỏ hơn 0.',
      'any.required': 'Số lượng tồn kho là bắt buộc.'
    }),
    image: Joi.any().optional().allow(null)
  })

  try {
    await paramCondition.validateAsync(req.params)
    await bodyCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu cập nhật biến thể không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

const validateVariantIdParam = async (req, res, next) => {
  const correctCondition = Joi.object({
    productId: Joi.number().integer().positive().required(),
    variantId: Joi.number().integer().positive().required()
  })

  try {
    await correctCondition.validateAsync(req.params)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số ID biến thể không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const vendorProductValidation = {
  validateCreateProductBody,
  validateUpdateProduct,
  validateProductIdParam,
  validateCreateVariantBody,
  validateGetProductsFilters,
  validateToggleActiveSingleBody,
  validateToggleActiveBulkBody,
  validateProductIdsBulkBody,
  validateUpdateVariantBody,
  validateVariantIdParam
}