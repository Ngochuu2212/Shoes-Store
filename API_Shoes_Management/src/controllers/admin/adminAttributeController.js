import { adminAttributeService } from '~/services/admin/adminAttributeService'

// CONTROLLER SIZES
const getSizesList = async (req, res) => {
  try {
    const result = await adminAttributeService.getSizesList()
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

const createSize = async (req, res) => {
  try {
    const result = await adminAttributeService.createSize(req.body.sizeValue)
    return res.status(201).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const updateSize = async (req, res) => {
  try {
    const result = await adminAttributeService.updateSize(Number(req.params.id), req.body.sizeValue)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const deleteSize = async (req, res) => {
  try {
    const result = await adminAttributeService.deleteSize(Number(req.params.id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

// CONTROLLER COLORS
const getColorsList = async (req, res) => {
  try {
    const result = await adminAttributeService.getColorsList()
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

const createColor = async (req, res) => {
  try {
    const { colorName, colorCode } = req.body
    const result = await adminAttributeService.createColor(colorName, colorCode)
    return res.status(201).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const updateColor = async (req, res) => {
  try {
    const { colorName, colorCode } = req.body
    const result = await adminAttributeService.updateColor(Number(req.params.id), { name: colorName, code: colorCode })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const deleteColor = async (req, res) => {
  try {
    const result = await adminAttributeService.deleteColor(Number(req.params.id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const adminAttributeController = {
  getSizesList, createSize, updateSize, deleteSize,
  getColorsList, createColor, updateColor, deleteColor
}