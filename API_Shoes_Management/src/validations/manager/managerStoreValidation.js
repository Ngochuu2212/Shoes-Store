import Joi from 'joi'

// 1. Kiểm duyệt bộ lọc danh sách gian hàng toàn sàn (Query Params)
const validateGetStoresFilters = async (req, res, next) => {
  const correctCondition = Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(10),
    search: Joi.string().allow('', null).trim().optional(),
    is_active: Joi.number().valid(0, 1).optional().allow('', null),
    startDate: Joi.string().isoDate().optional(),
    endDate: Joi.string().isoDate().optional()
  })

  try {
    await correctCondition.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số bộ lọc danh sách cửa hàng không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 2. Kiểm duyệt ID trên URL (Dùng cho xem chi tiết, phê duyệt đơn lẻ)
const validateStoreIdParam = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã định danh cửa hàng phải là định dạng số.'
    })
  })

  try {
    await correctCondition.validateAsync(req.params)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Tham số mã cửa hàng trên URL không đúng định dạng.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 3. Kiểm duyệt khi PHÊ DUYỆT hàng loạt hoặc đơn lẻ (Tích chọn mảng ID)
const validateApproveStoresBody = async (req, res, next) => {
  const correctCondition = Joi.object({
    storeIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
      'array.base': 'Danh sách mã cửa hàng phải là một mảng dữ liệu số.',
      'array.min': 'Vui lòng tích chọn tối thiểu 1 cửa hàng để phê duyệt.'
    })
  })

  try {
    // Nếu gọi từ route đơn lẻ, tự động gom id từ params bọc vào mảng storeIds ở body
    if (req.params.id) {
      req.body.storeIds = [Number(req.params.id)]
    }
    await correctCondition.validateAsync(req.body)
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu xác nhận phê duyệt cửa hàng không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 4. Kiểm duyệt khi TỪ CHỐI ĐĂNG KÝ hoặc PHẠT KHÓA SHOP (Bắt buộc kèm lý do văn bản)
const validateRejectOrBanStoresBody = async (req, res, next) => {
  const correctCondition = Joi.object({
    storeIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
      'array.min': 'Vui lòng chọn tối thiểu 1 cửa hàng để thực hiện thao tác.'
    }),
    reason: Joi.string().min(5).max(500).trim().required().messages({
      'string.empty': 'Bắt buộc phải nhập lý do phản hồi chi tiết cho chủ gian hàng.',
      'string.min': 'Nội dung lý do phản hồi phải dài từ 5 ký tự trở lên để đảm bảo tính minh bạch.'
    })
  })

  try {
    if (req.params.id) {
      req.body.storeIds = [Number(req.params.id)]
    }
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu từ chối hoặc xử phạt cửa hàng không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const managerStoreValidation = {
  validateGetStoresFilters,
  validateStoreIdParam,
  validateApproveStoresBody,
  validateRejectOrBanStoresBody
}