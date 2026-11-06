# THỰC TẬP CÔNG TY VNA GROUP - FRONTEND

![](docs/images/ui1.png)

![](docs/images/ui2.png)

## Công nghệ sử dụng

| Nhóm            | Thư viện                                                                        |
| --------------- | ------------------------------------------------------------------------------- |
| Framework       | Next.js 16, React 19                                                            |
| Data fetching   | Axios, TanStack React Query                                                     |
| Form & validate | React Hook Form, Zod                                                            |
| Xác thực        | js-cookie,jwt-decode                                                            |
| Giao diện       | Tailwind CSS, clsx, tailwind-merge, lucide-react, next-themes                   |
| Tiện ích khác   | react-datepicker, date-fns, react-hot-toast, react-spinners, docx-preview, nuqs |

## Tổng quan hệ thống

### Authentication

Hệ thống sử dụng JWT với Access Token và Refresh Token để xác thực người dùng và duy trì phiên đăng nhập.

- Access Token: dùng để xác thực các API yêu cầu đăng nhập.
- Refresh Token: dùng để cấp lại cặp token mới khi Access Token hết hạn hoặc sắp hết hạn.
- Cả hai token được lưu trong cookie để `proxy.ts` có thể đọc và xử lý xác thực ở phía server.

**Xử lý Axios**

Việc gọi API được chia thành hai instance:

- `axiosPublic`: sử dụng cho các API không yêu cầu xác thực.
- `axiosInstance`: sử dụng cho các API yêu cầu xác thực, tự động gắn header `Authorization: Bearer <accessToken>`.

**Cơ chế tự động làm mới token**

- Refresh chủ động: Trước khi gửi request, nếu Access Token sắp hết hạn thì hệ thống gọi API refresh trước.
- Refresh bị động: Khi nhận lỗi `401`, hệ thống refresh token và gửi lại request tối đa một lần.
- Refresh Token Rotation: Mỗi lần refresh, backend trả về cặp token mới, frontend cập nhật lại cả hai token.
- Chia sẻ refresh giữa các request: Khi nhiều request cùng cần refresh, hệ thống chỉ thực hiện một lần gọi API; các request còn lại chờ kết quả.
- Đồng bộ nhiều tab: Sử dụng Web Locks API để tránh nhiều tab cùng refresh token. Tab khác có thể sử dụng token mới sau khi tab đang giữ lock hoàn tất.
- Xử lý lỗi: Tự động đăng xuất khi refresh token hết hạn, bị backend từ chối hoặc request gửi lại vẫn nhận lỗi `401`. Lỗi mạng hoặc timeout khi refresh không tự động đăng xuất người dùng.

### Phân quyền theo vai trò

Hệ thống có 2 vai trò là Sở và Doanh nghiệp. Mỗi vai trò có nhóm route riêng, việc chặn truy cập chéo vai trò được xử lý trong `proxy.ts`.

`proxy.ts` đọc `accessToken` và `refreshToken` từ cookie, giải mã để lấy vai trò của người dùng, sau đó điều hướng theo từng trường hợp:

- Chưa đăng nhập, truy cập route yêu cầu xác thực: chuyển về `/`.
- Đã đăng nhập, truy cập route không thuộc quyền của vai trò hiện tại: chuyển về `/account`.
- Đã đăng nhập, truy cập trang công khai như đăng nhập hoặc quên mật khẩu: chuyển về `/account`.

### Chức năng chính

| Nhóm chức năng           | Hành động                           |
| ------------------------ | ----------------------------------- |
| **Xác thực**             | Đăng nhập                           |
|                          | Đăng xuất                           |
|                          | Khôi phục mật khẩu                  |
|                          | Thay đổi mật khẩu                   |
|                          | Thay đổi email                      |
|                          | Khởi tạo mật khẩu                   |
|                          | Xác thực email bằng OTP             |
| **Quản lý người dùng**   | Lấy danh sách người dùng            |
|                          | Thêm người dùng                     |
|                          | Cập nhật người dùng                 |
|                          | Xóa nhiều người dùng                |
|                          | Bật/tắt trạng thái tài khoản        |
|                          | Xem thông tin người dùng chi tiết   |
| **Quản lý doanh nghiệp** | Lấy danh sách doanh nghiệp          |
|                          | Đăng ký doanh nghiệp                |
|                          | Thêm doanh nghiệp                   |
|                          | Cập nhật doanh nghiệp               |
|                          | Xóa doanh nghiệp                    |
|                          | Xem thông tin doanh nghiệp chi tiết |

## Cấu trúc thư mục

```text
libs/
├── core/                         # Thành phần dùng chung phía FE
│   ├── models/                   # Type, interface, enum dùng chung
│   │   └── component.model.ts
│   ├── hooks/                    # Custom hooks không phụ thuộc nghiệp vụ
│   │   └── useDebounce.ts
│   ├── services/                 # Cấu hình giao tiếp HTTP
│   │   └── axiosInstance.ts
│   ├── utils/                    # Các hàm tiện ích
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── jwtUtil.ts
│   │   └── cookieUtil.ts
│   └── constants/                # Các hằng số dùng chung
│       └── limits.ts
│
├── shared/                       # Thành phần chia sẻ FE và BE
│   ├── core/                     # Thành phần dùng chung mọi dự án
│   │   └── models/
│   │       └── common.model.ts
│   └── tts/                      # Thành phần riêng của dự án TTS
│       ├── models/
│       │   ├── auth.model.ts
│       │   └── params.model.ts
│       └── schemas/              # Zod schemas dùng chung
│           └── auth.schema.ts
│
└── tts/                          # Source code riêng của dự án
    ├── assets/                   # Logo, banner, hình nền
    ├── components/               # Components theo nghiệp vụ
    ├── services/
    │   └── apis/
    │       ├── authApis.ts
    │       └── enterpriseApis.ts
    ├── hooks/                    # Custom hooks theo nghiệp vụ
    │   └── useAuth.ts
    └── providers/
        ├── QueryProvider.tsx
        ├── AppProvider.tsx
        └── ToastProvider.tsx
```
