import Joi from 'joi'
import { APPEAL_STATUS } from '~/utils/constants'

const handleAppeal = async (req, res, next) => {
  const correctCondition = Joi.object({
    status: Joi.string().required().valid(APPEAL_STATUS.APPROVED, APPEAL_STATUS.REJECTED).messages({
      'any.only': 'Trạng thái phê duyệt đơn không hợp lệ trên hệ thống!',
      'string.empty': 'Vui lòng chọn trạng thái phê duyệt!'
    }),
    managerNote: Joi.string().allow('', null).max(500).trim().optional().messages({
      'string.max': 'Ghi chú phản hồi không được vượt quá 500 ký tự!'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })

    if (req.body.status === APPEAL_STATUS.REJECTED) {
      if (!req.body.managerNote || req.body.managerNote.trim() === '') {
        return res.status(400).json({
          message: 'Vui lòng nhập lý do từ chối đơn cứu xét!'
        })
      }
      // Kiểm tra độ dài tối thiểu cho reject
      if (req.body.managerNote.trim().length < 5) {
        return res.status(400).json({
          message: 'Lý do từ chối phải có ít nhất 5 ký tự!'
        })
      }
    }

    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

export const managerAppealValidation = {
  handleAppeal
}