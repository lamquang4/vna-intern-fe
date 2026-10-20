## Thư mục

libs/

├── core/ ← CHỈ FE, dùng chung cho MỌI dự án FE

│ ├── models/ chứa type/interface/enum chỉ dùng phía FE và dùng chung cho nhiều dự án

│ │ └── component.model.ts ← SelectOption, TableColumn<T>

│ ├── hooks/ ← custom hook dùng lại được, không phụ thuộc nghiệp vụ

│ │ └── useDebounce.ts

│ ├── services/ ← cấu hình giao tiếp HTTP dùng chung

│ │ └── axiosInstance.ts ← axiosInstance + axiosPublic

│ ├── utils/ ← hàm tiện ích

│ │ └── validators.ts ← validatePhone/Password/Otp

│ │ └── jwtUtil.ts

│ │ └── cookieUtil.ts

│ ├── constants/ ← hằng số dùng chung

│ │ └── limits.ts ← OTP_LENGTH, MAX_PASSWORD_LENGTH

│

├── shared/ ← FE + BE cùng dùng, đảm bảo 2 phía luôn khớp contract

│ └── core/ ← chung cho MỌI dự án

│ │ ├── models/

│ │ │ ├── common.model.ts ← ApiResponse, PageResponse, ErrorResponse

│ └── tts/ ← chung FE + BE, nhưng CHỈ cho dự án tts

│ │ ├── models/

│ │ │ ├── enums.ts ← UserRole

│ │ │ ├── auth.model.ts ← LoginRequest, LoginResponse, ApiResponse...

│ │ ├── schemas/ Zod schema

│ │ │ ├── auth.schema.ts ← loginSchema, registerSchema, verifyOtpSchema...

│

└── tts/ source riêng của dự án tts

│ └── assets/ logo, banner, nền

│ └── components/ component chỉ dự án này dùng

│ └── services/

│ │ │ ├── apis/

│ │ │ │ ├── authApi.ts

│ │ │ │ ├── productApi.ts

│ └── hooks

│ │ ├── useAuth.ts ← useLogin, useRegister, useLogout...

│ └── providers/ các providers

│ │ ├── QueryProvider.tsx

## Clean code

Hạn chế if/else lồng nhau. Dùng early return hoặc tách hàm

Không dùng type any. Khai báo kiểu rõ ràng

Tái sử dụng components

Xóa console.log debug trước khi commit

Gọi setXxxError(null) lặp lại 5 lần liên tiếp (nên gom thành một state errors dạng object)
