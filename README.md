

## Cấu trúc

moneymanager-pwa/

├── index.html
├── style.css
├── app.js
├── manifest.json
├── sw.js
├── icon-192.svg
├── icon-512.svg
└── README.md

## Chạy

PWA cần chạy qua HTTP/HTTPS để Service Worker hoạt động.

Không nên mở trực tiếp:

file:///...

Có thể dùng:

- VS Code Live Server
- XAMPP
- Node.js
- GitHub Pages
- Netlify
- Vercel

## Chức năng

### Trang chủ

- Ngày / tháng
- Lịch giao dịch
- Thu nhập
- Chi tiêu
- Wallet
- Bank
- Thêm giao dịch
- Tìm kiếm
- Ẩn/hiện số dư

### Thống kê

- Tuần
- Tháng
- Năm
- Tổng số dư
- Tổng thu nhập
- Tổng chi tiêu
- Danh mục
- Bản đồ

### Tài khoản

- Wallet
- Bank
- Thêm tài khoản
- Chỉnh sửa
- Xóa
- Sắp xếp
- Chuyển tiền
- Lịch sử chuyển tiền
- Sổ tiết kiệm

### Khoản vay

- Thêm khoản vay
- Số tiền vay
- Lãi suất
- Ngày đến hạn
- Số dư còn lại

### Đầu tư

- SJC
- BTC
- ETH
- Thêm khoản đầu tư
- Cập nhật giá

### Ngân sách

- Tạo ngân sách
- Hạn mức
- Theo dõi mức sử dụng

### Hồ sơ

- Tổng quan
- Bạn bè
- Nhóm
- Chia tiền
- Giao dịch chia sẻ
- Giao dịch định kỳ
- Cài đặt
- Danh mục
- Ngôn ngữ
- Giao diện
- Tiền tệ
- Xuất dữ liệu
- Nhập dữ liệu

### CapMoney Pro

- Giao dịch không giới hạn
- Nhiều loại tài khoản
- Chia sẻ với người thân
- Lưu chuyển khoản siêu tốc
- Video 3 giây
- Thống kê nâng cao
- Danh mục tùy chỉnh
- Widget
- Xuất dữ liệu

## Lưu dữ liệu

Dữ liệu hiện được lưu trên thiết bị bằng:

localStorage

Key:

capmoney-data

## Backup

Có thể vào:

Cài đặt
→ Xuất dữ liệu

để tạo file JSON backup.

## Import

Cài đặt
→ Nhập dữ liệu

để khôi phục dữ liệu.

## Lưu ý

Các chức năng cần server thực tế như:

- Apple Sign In
- Đồng bộ tài khoản
- Chia sẻ dữ liệu nhiều người
- API ngân hàng
- OCR hóa đơn
- API giá vàng
- API crypto
- Thanh toán Pro

cần backend/API riêng.
