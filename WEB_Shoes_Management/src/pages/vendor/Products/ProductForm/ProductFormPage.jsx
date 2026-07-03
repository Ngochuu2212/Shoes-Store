import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider, useFieldArray } from 'react-hook-form'
import { toast } from 'react-toastify'
import { FiSave, FiArrowLeft, FiCheck } from 'react-icons/fi'
import { motion } from 'framer-motion'

import { vendorProductApiService } from '~/services/vendor/vendorProductApiService'
import { categoryService } from '~/services/user/categoryService'
import { attributeService } from '~/services/user/attributeService'

import { BasicInfoSection } from './BasicInfoSection'
import { VariantsSection } from './VariantsSection'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ProductFormPage = () => {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  usePageTitle(
    isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới',
    isEditMode ? 'Cập nhật thông tin sản phẩm' : 'Tạo sản phẩm mới và cấu hình biến thể'
  )

  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [flatCategories, setFlatCategories] = useState([])
  const [attributes, setAttributes] = useState({ sizes: [], colors: [] })

  const [editingVariantIndex, setEditingVariantIndex] = useState(null)
  const [isAddingVariant, setIsAddingVariant] = useState(false)

  const methods = useForm({
    defaultValues: {
      name: '',
      categoryId: '',
      price: '',
      description: '',
      variants: []
    }
  })

  const { control, getValues, reset, setValue, formState: { errors } } = methods
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants'
  })

  const flattenCategories = (categories, level = 0) => {
    let result = []
    categories.forEach(category => {
      result.push({
        ...category,
        level,
        displayName: level > 0 ? '└ ' + '  '.repeat(level) + category.name : category.name
      })
      if (category.children && category.children.length > 0) {
        result = result.concat(flattenCategories(category.children, level + 1))
      }
    })
    return result
  }

  const findCategoryById = (categories, id) => {
    for (const cat of categories) {
      if (cat.id === id) return cat
      if (cat.children) {
        const found = findCategoryById(cat.children, id)
        if (found) return found
      }
    }
    return null
  }

  // Hàm reload dữ liệu sản phẩm
  const reloadProductData = async () => {
    if (!isEditMode || !id) return

    try {
      setLoading(true)
      const data = await vendorProductApiService.getProductDetail(id)

      reset({
        name: data.name,
        categoryId: data.category_id,
        price: data.price,
        description: data.description,
        variants: data.variants || []
      })
    } catch (error) {
      toast.error('Không thể tải lại dữ liệu sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([
      categoryService.getAllCategories(),
      attributeService.getGlobalAttributes()
    ]).then(([cats, attrs]) => {
      setCategories(cats)
      setFlatCategories(flattenCategories(cats))
      setAttributes(attrs)
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (isEditMode) {
      setLoading(true)
      vendorProductApiService.getProductDetail(id).then(data => {
        reset({
          name: data.name,
          categoryId: data.category_id,
          price: data.price,
          description: data.description,
          variants: data.variants || []
        })
      }).catch(() => {
        toast.error('Không tải được thông tin sản phẩm')
        navigate('/vendor/products')
      }).finally(() => setLoading(false))
    }
  }, [id, isEditMode, reset, navigate, categories])

  // Bắt đầu thêm biến thể mới
  const handleAddVariant = () => {
    // Kiểm tra nếu đang có biến thể trống thì không cho thêm
    const variants = getValues('variants')
    if (variants.length > 0) {
      const lastVariant = variants[variants.length - 1]
      if (!lastVariant.size) {
        toast.warning('Vui lòng hoàn thành biến thể hiện tại trước khi thêm mới!')
        return
      }
    }

    append({
      size: '',
      color: '',
      stock: 0,
      image: null,
      imageFile: null,
      imagePreview: null
    })
    setIsAddingVariant(true)
    setEditingVariantIndex(fields.length)
  }

  // Bắt đầu sửa biến thể
  const handleEditVariant = (index) => {
    setEditingVariantIndex(index)
    setIsAddingVariant(false)
  }

  // Hủy chỉnh sửa biến thể
  const handleCancelEditVariant = () => {
    const variants = getValues('variants')

    // Nếu đang thêm mới (isAddingVariant) và biến thể cuối cùng chưa có dữ liệu
    if (isAddingVariant && variants.length > 0) {
      const lastVariant = variants[variants.length - 1]
      // Nếu chưa có size và stock = 0 hoặc undefined thì xóa
      if (!lastVariant.size) {
        remove(variants.length - 1)
      }
    }

    setEditingVariantIndex(null)
    setIsAddingVariant(false)
  }

  // Xóa biến thể
  const handleDeleteVariant = async (index) => {
    const variants = getValues('variants')
    const variant = variants[index]

    if (variant.id) {
      try {
        setLoading(true)
        await vendorProductApiService.deleteVariant(id, variant.id)
        toast.success('Xóa biến thể thành công!')
        await reloadProductData()
      } catch (error) {
        toast.error(error.message || 'Xóa biến thể thất bại!')
      } finally {
        setLoading(false)
      }
    } else {
      remove(index)
      toast.success('Đã xóa biến thể khỏi danh sách!')
    }
  }

  const validateVariants = (variants) => {
    if (!variants || variants.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 biến thể cho sản phẩm!')
      return false
    }

    // Kiểm tra từng biến thể có đủ thông tin không
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i]
      if (!variant.size) {
        toast.error(`Biến thể #${i + 1} chưa chọn kích cỡ (Size)!`)
        return false
      }
      if (variant.stock === undefined || variant.stock === null || variant.stock < 0) {
        toast.error(`Biến thể #${i + 1} chưa nhập số lượng tồn kho!`)
        return false
      }
    }

    return true
  }

  const handleUpdateExistingVariants = async (productId, variants) => {
    // Lọc ra các variant đã có id (đã tồn tại trong DB)
    const existingVariants = variants.filter(variant => variant.id)

    for (const variant of existingVariants) {
      // Kiểm tra xem variant này có thay đổi ảnh không
      const hasImageChange = variant.imageFile instanceof File

      // Kiểm tra xem có thay đổi thông tin khác không
      const hasInfoChange = variant.size || variant.color || variant.stock !== undefined

      // Nếu không có thay đổi gì thì bỏ qua
      if (!hasImageChange && !hasInfoChange) continue

      const formData = new FormData()
      formData.append('size', variant.size)
      formData.append('color', variant.color || '')
      formData.append('stock', variant.stock)

      // Nếu có ảnh mới thì append vào formData
      if (hasImageChange) {
        formData.append('image', variant.imageFile)
      }

      try {
        await vendorProductApiService.updateVariant(productId, variant.id, formData)
      } catch (error) {
        console.error(`Lỗi cập nhật biến thể #${variant.id}:`, error)
        throw new Error(`Không thể cập nhật biến thể ${variant.size}: ${error.message}`)
      }
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)

      if (!validateVariants(data.variants)) {
        setLoading(false)
        return
      }

      const payload = {
        name: data.name,
        categoryId: data.categoryId,
        price: data.price,
        description: data.description || ''
      }

      if (isEditMode) {
        // 1. Cập nhật product
        await vendorProductApiService.updateProduct(id, payload)

        // 2. Cập nhật các biến thể đã có (có id) - kèm ảnh
        await handleUpdateExistingVariants(id, data.variants)

        // 3. Tạo các biến thể mới (chưa có id)
        const newVariants = data.variants.filter(variant => !variant.id)
        if (newVariants.length > 0) {
          for (const variant of newVariants) {
            const variantFormData = new FormData()
            variantFormData.append('size', variant.size)
            variantFormData.append('color', variant.color || '')
            variantFormData.append('stock', variant.stock)
            if (variant.imageFile instanceof File) {
              variantFormData.append('image', variant.imageFile)
            }
            await vendorProductApiService.createVariant(id, variantFormData)
          }
        }

        toast.success('Cập nhật sản phẩm thành công!')
        navigate('/vendor/products')
      } else {
        // Tạo product mới
        const resProduct = await vendorProductApiService.createProduct(payload)
        const newProductId = resProduct.insertId

        // Tạo variants (tất cả đều là mới)
        if (data.variants && data.variants.length > 0 && newProductId) {
          for (const variant of data.variants) {
            const variantFormData = new FormData()
            variantFormData.append('size', variant.size)
            variantFormData.append('color', variant.color || '')
            variantFormData.append('stock', variant.stock)
            if (variant.imageFile instanceof File) {
              variantFormData.append('image', variant.imageFile)
            }
            await vendorProductApiService.createVariant(newProductId, variantFormData)
          }
        }

        toast.success('Thêm sản phẩm thành công!')
        navigate('/vendor/products')
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/vendor/products')}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-2xl hover:border-brand-primary hover:text-brand-primary transition-colors duration-300 shadow-sm cursor-pointer"
          >
            <FiArrowLeft size={20} />
          </motion.button>
          <div>
            <h2 className="text-2xl font-black text-brand-primary tracking-tight">{isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
            <p className="text-xs font-bold text-gray-400 mt-1">Hệ thống Quản lý Danh mục hàng hóa</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100">
          <FiCheck size={16} />
          <span className="text-xs font-bold">{isEditMode ? 'Đang cập nhật thông tin' : 'Thiết lập thông tin và cấu hình biến thể'}</span>
        </div>
      </motion.div>

      {loading && isEditMode && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-gray-400 animate-pulse">Đang tải dữ liệu sản phẩm...</span>
        </div>
      )}

      {!loading && (
        <FormProvider {...methods}>
          <form className="space-y-6 flex flex-col">
            <BasicInfoSection categories={flatCategories} />

            <VariantsSection
              attributes={attributes}
              fields={fields}
              remove={remove}
              editingIndex={editingVariantIndex}
              isAddingVariant={isAddingVariant}
              onAddVariant={handleAddVariant}
              onEditVariant={handleEditVariant}
              onUpdateVariant={() => {}} // Không cần
              onDeleteVariant={handleDeleteVariant}
              onCancelEdit={handleCancelEditVariant}
            />

            {/* Cảnh báo nếu chưa có biến thể */}
            {fields.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <FiCheck className="text-amber-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-700">Yêu cầu: Phải có ít nhất 1 biến thể</p>
                  <p className="text-xs text-amber-600">Vui lòng thêm phân loại kích cỡ (Size) và tồn kho cho sản phẩm.</p>
                </div>
              </motion.div>
            )}

            {/* Nút Lưu chính */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="flex justify-end pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={methods.handleSubmit(onSubmit)}
                disabled={loading}
                className="flex items-center gap-2 bg-brand-primary hover:bg-[#c73652] text-white px-10 py-4 rounded-2xl font-black text-sm transition-all duration-100 shadow-lg shadow-brand-primary/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span> : <FiSave size={18} />}
                {isEditMode ? 'LƯU THAY ĐỔI' : 'TẠO SẢN PHẨM'}
              </motion.button>
            </motion.div>

          </form>
        </FormProvider>
      )}
    </div>
  )
}