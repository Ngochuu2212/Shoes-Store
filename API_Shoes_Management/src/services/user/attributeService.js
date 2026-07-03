import { attributeModel } from '~/models/user/attribute/attributeModel'

const getGlobalAttributes = async () => {
  const [sizes, colors] = await Promise.all([
    attributeModel.getAllSizes(),
    attributeModel.getAllColors()
  ])

  // Format lại data cho giống hệt Frontend đang dùng
  const formattedSizes = sizes.map(item => item.size_value)

  const formattedColors = colors.map(item => ({
    name: item.color_name,
    value: item.color_name,
    hex: item.color_code
  }))

  return {
    sizes: formattedSizes,
    colors: formattedColors
  }
}

export const attributeService = {
  getGlobalAttributes
}