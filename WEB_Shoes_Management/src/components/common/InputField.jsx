import React from 'react'
import { Field, FieldLabel, FieldDescription } from '~/components/ui/field'
import { Input } from '~/components/ui/input'

export const InputField = React.forwardRef(({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  icon: Icon,
  ...props
}, ref) => {
  return (
    <Field className="w-full">
      <FieldLabel className="text-sm font-bold text-gray-700">
        {label}
      </FieldLabel>

      <div className="relative mt-1.5">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            <Icon size={18} />
          </div>
        )}

        {/* Sử dụng Input chuẩn của Shadcn */}
        <Input
          ref={ref}
          name={name}
          type={type}
          placeholder={placeholder}
          className={`w-full bg-gray-50 border rounded-xl py-6 text-sm transition-all duration-300 outline-none
            ${Icon ? 'pl-11 pr-4' : 'px-4'}
            ${error
      ? 'border-red-500 focus-visible:ring-red-500/20 focus-visible:border-red-500'
      : 'border-gray-200 focus-visible:ring-[#e94560]/20 focus-visible:border-brand-primary'
    }`}
          {...props}
        />
      </div>

      {/* Hiển thị lỗi dùng luôn FieldDescription */}
      {error && (
        <FieldDescription className="text-xs text-red-500 font-medium pl-1 mt-1.5 animate-fadeIn">
          {error.message}
        </FieldDescription>
      )}
    </Field>
  )
})

InputField.displayName = 'InputField'