import { adminAttributeModel } from '~/models/admin/attribute/adminAttributeModel'

const getSizesList = async () => {
  return await adminAttributeModel.getAllSizes()
}

const createSize = async (value) => {
  const isExist = await adminAttributeModel.checkSizeExist(value)
  if (isExist) throw new Error(`Mã kích cỡ Size [${value}] đã tồn tại trên hệ thống khung chuẩn sàn rồi!`)

  const newId = await adminAttributeModel.createSize(value)
  return { message: 'Thêm mới kích cỡ size chuẩn sàn thành công!', sizeId: newId }
}

const updateSize = async (id, value) => {
  const current = await adminAttributeModel.getSizeDetailById(id)
  if (!current) throw new Error('Kích cỡ yêu cầu cập nhật không tồn tại.')

  const isExist = await adminAttributeModel.checkSizeExist(value, id)
  if (isExist) throw new Error(`Giá trị kích cỡ [${value}] đã bị trùng với một cấu hình size khác!`)

  // Nếu giá trị size thay đổi, phải check xem size cũ đã có ai xài chưa để tránh gãy data Vendor
  if (current.size_value !== value) {
    const isUsed = await adminAttributeModel.checkSizeUsedInVariants(current.size_value)
    if (isUsed) throw new Error(`Không thể đổi tên kích cỡ! Giá trị size [${current.size_value}] hiện đã phát sinh biến thể sản phẩm dưới các gian hàng.`)
  }

  await adminAttributeModel.updateSize(id, value)
  return { message: 'Cập nhật giá trị kích cỡ thành công!' }
}

const deleteSize = async (id) => {
  const current = await adminAttributeModel.getSizeDetailById(id)
  if (!current) throw new Error('Kích cỡ mục tiêu không tồn tại.')

  const isUsed = await adminAttributeModel.checkSizeUsedInVariants(current.size_value)
  if (isUsed) throw new Error(`Bảo mật hệ thống chặn hành động! Kích cỡ [${current.size_value}] đang dính líu đến kho hàng sản phẩm toàn sàn, không thể xóa bỏ.`)

  await adminAttributeModel.deleteSize(id)
  return { message: 'Đã xóa bỏ kích cỡ size thành công khỏi bộ khung chuẩn.' }
}

const getColorsList = async () => {
  return await adminAttributeModel.getAllColors()
}

const createColor = async (name, code) => {
  const isExist = await adminAttributeModel.checkColorExist(name)
  if (isExist) throw new Error(`Màu sắc [${name}] đã tồn tại trong danh mục hệ thống rồi!`)

  const newId = await adminAttributeModel.createColor(name, code)
  return { message: 'Thêm mới màu sắc chuẩn sàn thành công!', colorId: newId }
}

const updateColor = async (id, { name, code }) => {
  const current = await adminAttributeModel.getColorDetailById(id)
  if (!current) throw new Error('Màu sắc yêu cầu cập nhật không tồn tại.')

  const isExist = await adminAttributeModel.checkColorExist(name, id)
  if (isExist) throw new Error(`Tên màu sắc [${name}] đã bị trùng lặp!`)

  if (current.color_name !== name) {
    const isUsed = await adminAttributeModel.checkColorUsedInVariants(current.color_name)
    if (isUsed) throw new Error(`Không thể đổi tên màu sắc! Màu [${current.color_name}] hiện đã phát sinh biến thể sản phẩm dưới các gian hàng.`)
  }

  await adminAttributeModel.updateColor(id, name, code)
  return { message: 'Cập nhật thông tin màu sắc chuẩn sàn thành công!' }
}

const deleteColor = async (id) => {
  const current = await adminAttributeModel.getColorDetailById(id)
  if (!current) throw new Error('Màu sắc mục tiêu không tồn tại.')

  const isUsed = await adminAttributeModel.checkColorUsedInVariants(current.color_name)
  if (isUsed) throw new Error(`Bảo mật hệ thống chặn hành động! Màu sắc [${current.color_name}] đang dính líu đến kho hàng sản phẩm toàn sàn, không thể xóa bỏ.`)

  await adminAttributeModel.deleteColor(id)
  return { message: 'Đã xóa bỏ màu sắc thành công khỏi bộ khung chuẩn.' }
}

export const adminAttributeService = {
  getSizesList, createSize, updateSize, deleteSize,
  getColorsList, createColor, updateColor, deleteColor
}