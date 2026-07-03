import js from '@eslint/js'
import globals from 'globals'

export default [
  // Bỏ qua các thư mục không cần kiểm tra lỗi
  { ignores: ['node_modules', 'dist'] },

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module', // Bật tính năng cho phép dùng câu lệnh import/export
      globals: {
        ...globals.node, // Định nghĩa các biến môi trường của Node.js (process, __dirname,...)
        ...globals.es2021 // Hỗ trợ các cú pháp Javascript mới nhất
      }
    },
    rules: {
      ...js.configs.recommended.rules,

      // Các quy tắc bắt lỗi và Clean Code chuẩn chỉnh cho Backend
      'no-console': 1, // Cảnh báo khi dùng console.log (giữ cho code production sạch)
      'no-lonely-if': 1, // Cảnh báo nếu dùng if trong block else một cách thừa thãi
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }], // Cảnh báo biến không dùng (bỏ qua biến có dấu _ phía trước)
      'no-trailing-spaces': 1, // Không cho phép có khoảng trắng thừa ở cuối dòng
      'no-multi-spaces': 1, // Không cho phép viết nhiều khoảng trắng liên tiếp
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }], // Tối đa chỉ được trống 1 dòng liên tiếp

      // Quy tắc định dạng code (Stylistic)
      'space-before-blocks': ['error', 'always'], // Bắt buộc có khoảng trắng trước dấu mở ngoặc nhọn {
      'object-curly-spacing': ['error', 'always'], // Bắt buộc cách khoảng trong ngoặc nhọn: { user } thay vì {user}
      'indent': ['warn', 2, { SwitchCase: 1 }], // Thụt lề chuẩn 2 khoảng trắng (2 spaces)
      'semi': ['error', 'never'], // Chuẩn đét KHÔNG sử dụng dấu chấm phẩy (;) ở cuối câu
      'quotes': ['error', 'single'], // Bắt buộc sử dụng nháy đơn ('') cho chuỗi string
      'array-bracket-spacing': ['error', 'never'], // Không khoảng trắng sát rìa mảng: [1, 2] thay vì [ 1, 2 ]
      'keyword-spacing': ['error', { before: true, after: true }], // Khoảng trắng xung quanh các từ khóa if, else, switch
      'comma-dangle': ['error', 'never'], // Không để dấu phẩy thừa ở phần tử cuối cùng của mảng/object
      'comma-spacing': ['error', { before: false, after: true }], // Dấu phẩy sát ký tự trước, cách ký tự sau
      'arrow-spacing': ['error', { before: true, after: true }] // Khoảng trắng xung quanh arrow function () => {}
    }
  }
]