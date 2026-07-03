import { vendorStoreService } from '~/services/vendor/vendorStoreService.js'

const registerStore = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { name, bio, address } = req.body

    let logoUrl = null
    let bannerUrl = null

    // Đọc file ảnh trường logo nếu có từ Cloudinary
    if (req.files?.['logo']?.[0]) {
      const logoObj = {
        public_id: req.files['logo'][0].filename,
        secure_url: req.files['logo'][0].path
      }
      logoUrl = JSON.stringify(logoObj)
    }

    // Đọc file ảnh trường banner nếu có từ Cloudinary
    if (req.files?.['banner']?.[0]) {
      const bannerObj = {
        public_id: req.files['banner'][0].filename,
        secure_url: req.files['banner'][0].path
      }
      bannerUrl = JSON.stringify(bannerObj)
    }

    const result = await vendorStoreService.registerStore(userId, {
      name,
      bio,
      logo: logoUrl,
      banner: bannerUrl,
      address
    })

    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý đăng ký cửa hàng: ${error.message}` })
  }
}

const getStoreProfile = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const result = await vendorStoreService.getStoreProfile(userId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải profile shop: ${error.message}` })
  }
}

const updateStoreProfile = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { name, bio, address } = req.body

    let logoObj = null
    let bannerObj = null

    // Nếu có up logo mới qua Cloudinary
    if (req.files?.['logo']?.[0]) {
      logoObj = {
        public_id: req.files['logo'][0].filename,
        secure_url: req.files['logo'][0].path
      }
    }

    // Nếu có up banner mới qua Cloudinary
    if (req.files?.['banner']?.[0]) {
      bannerObj = {
        public_id: req.files['banner'][0].filename,
        secure_url: req.files['banner'][0].path
      }
    }

    const updatedData = await vendorStoreService.updateStoreProfile(userId, {
      name,
      bio,
      address,
      logo: logoObj,
      banner: bannerObj
    })

    return res.status(200).json({
      message: 'Cập nhật thông tin cửa hàng thành công!',
      store: updatedData
    })
  } catch (error) {
    return res.status(500).json({ message: `Lỗi cập nhật profile shop: ${error.message}` })
  }
}

const checkStoreRegistrationStatus = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const result = await vendorStoreService.checkStoreRegistrationStatus(userId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi kiểm tra trạng thái cửa hàng: ${error.message}` })
  }
}

export const vendorStoreController = {
  registerStore,
  getStoreProfile,
  updateStoreProfile,
  checkStoreRegistrationStatus
}