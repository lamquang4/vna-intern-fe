## Thư mục

FE-SAMPLE/
├── .next/  
├── app/  
│
├── libs/  
│ │
│ ├── core/ # [1] Phần dùng chung cho NHIỀU dự án
│ │ ├── components/ # Component UI chung (Button, Input, Modal, Table...)
│ │ ├── hooks/ # Custom hooks chung (useDebounce, useToggle...)
│ │ ├── models/ # Model/kiểu dữ liệu cơ bản của core
│ │ ├── services/ # Cấu hình gọi API chung (axios instance, interceptor...)
│ │ └── styles/ # Style, theme, CSS dùng chung
│ │
│ ├── shared/ # [2] Models dùng chung cho cả BE và FE
│ │ ├── core/ # Model dùng chung ở mức core
│ │ ├── tts/ # Model riêng của dự án TTS
│ │ │ ├── models/
│ │ │ │ ├── department.model.ts # Interface/type/enum của Department
│ │ │ │ └── index.ts # Export gom các model lại cho import gọn
│ │ │ └── index.ts # Export gom toàn bộ phần tts
│ │ └── index.ts # Export gom toàn bộ shared
│ │
│ └── tts/ # [3] Source của dự án (Thực tập sinh)
│ ├── components/ # Component riêng của dự án
│ ├── pages/ # Các màn hình của dự án
│ │ ├── department/
│ │ │ └── index.tsx # Màn hình quản lý Department
│ │ └── index.ts # Export gom các page
│ ├── providers/ # Context/Provider riêng (auth, theme, query...)
│ └── services/ # Gọi API riêng của dự án
│
├── node_modules/  
├── public/

## Clean code

Hạn chế if/else lồng nhau. Dùng early return hoặc tách hàm

Không dùng type any. Khai báo kiểu rõ ràng

Tái sử dụng components

Xóa console.log debug trước khi commit

Gọi setXxxError(null) lặp lại 5 lần liên tiếp (nên gom thành một state errors dạng object)
