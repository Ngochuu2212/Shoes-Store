import Joi from 'joi'

// 1. Validate luồng TẠO MỚI danh mục (POST)
const createCategory = async (req, res, next) => {
  const correctCondition = Joi.object({
    parentId: Joi.number().integer().positive().allow(null, '').optional().messages({
      'number.base': 'Mã số danh mục cha (Parent ID) phải là một con số!'
    }),
    name: Joi.string().required().min(2).max(100).trim().messages({
      'string.empty': 'Tên danh mục sản phẩm không được để trống!',
      'string.min': 'Tên danh mục phải có độ dài ít nhất từ 2 ký tự trở lên!'
    }),
    description: Joi.string().allow('', null).max(500).trim().messages({
      'string.max': 'Mô tả danh mục không được vượt quá 500 ký tự!'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

// 2. Validate luồng CẬP NHẬT danh mục (PUT)
const updateCategory = async (req, res, next) => {
  const correctCondition = Joi.object({
    parentId: Joi.number().integer().positive().allow(null, '').optional(),
    name: Joi.string().required().min(2).max(100).trim().messages({
      'string.empty': 'Tên danh mục cập nhật không được để trống!'
    }),
    description: Joi.string().allow('', null).max(500).trim()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

// 3. Validate TOGGLE TRẠNG THÁI danh mục (PATCH)
const toggleCategoryStatus = async (req, res, next) => {
  const correctCondition = Joi.object({
    isActive: Joi.boolean().required().messages({
      'boolean.base': 'Trạng thái isActive phải là true hoặc false!',
      'any.required': 'Vui lòng cung cấp trạng thái isActive!'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

export const adminCategoryValidation = {
  createCategory,
  updateCategory,
  toggleCategoryStatus
}