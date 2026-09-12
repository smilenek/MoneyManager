# MoneyTrack / CapMoney PWA

Cập nhật: 2026-09-13. Xem **PROJECT_STATE.md** trong cùng thư mục để biết trạng thái, kiến trúc, giới hạn và việc cần làm.

## Chạy tại máy

Cần Node.js hỗ trợ node:sqlite; đã thử với Node 24.19.0. Từ thư mục chứa file này:

```sh
node serve.cjs
```

Mở http://127.0.0.1:8081/. Địa chỉ chỉ dùng trên máy đang chạy máy chủ. Không nhấp đúp index.html nếu muốn dùng API, PWA hoặc ngoại tuyến.

Không cần cài npm để chạy. Các thư viện web đã nằm trong vendor/. Giữ nguyên cấu trúc và các file hỗ trợ của Tesseract.

## Các nhóm tính năng

Thu/chi/chuyển tiền; danh mục; tài khoản; ngân sách; thống kê; lịch định kỳ; tiết kiệm và hoàn tiền ước tính; khoản vay/đầu tư thủ công; nhóm chia tiền; OCR nhận diện biên lai trên thiết bị; video; PDF/XLSX/CSV; sao lưu JSON kèm video; đăng nhập và sổ dùng chung có phân quyền.

Các tính năng không bị khóa theo gói Pro. Dung lượng vẫn phụ thuộc thiết bị và giới hạn file được hiển thị trong giao diện. Chi tiết đã kiểm chứng và chưa hoàn tất nằm trong PROJECT_STATE.md.

## Dữ liệu và máy chủ

- Sổ cá nhân dùng LocalStorage khóa capmoney-local-v2. Video ở IndexedDB capmoney-media/files.
- Sổ chung dùng SQLite. Mặc định dữ liệu nằm tại ../../work/capmoney-data tính từ thư mục ứng dụng. Đặt CAPMONEY_DATA_DIR thành đường dẫn riêng nếu đóng gói/triển khai nơi khác.
- PORT mặc định 8081; HOST mặc định 127.0.0.1.
- Khi triển khai, đặt PUBLIC_ORIGIN bằng nguồn HTTPS thực tế (không có dấu / cuối), cấu hình máy chủ HTTPS phía trước và lưu DB ngoài thư mục được phục vụ công khai.
- Không dùng GitHub Pages đơn lẻ cho API sổ chung. Có thể phục vụ phần cá nhân tĩnh nhưng các chức năng máy chủ sẽ không hoạt động.
- Không tự đồng bộ sổ cá nhân lên máy chủ. Người dùng tạo hoặc tham gia từng sổ chung.
- Chưa triển khai máy chủ công khai trong phiên này.

## Apple, Shortcuts và widget

Apple login cần APPLE_CLIENT_ID và APPLE_REDIRECT_URI hợp lệ từ tài khoản Apple Developer, HTTPS và kiểm tra đầu-cuối. Không điền bí mật vào JavaScript phía trình duyệt.

Shortcuts có hai luồng: mở URL ?receipt=TEXT đã mã hóa để điền trước giao dịch cá nhân; hoặc gửi JSON đến api/quick với khóa riêng của sổ chung. Hướng dẫn nằm trong giao diện Quét biên lai và Sổ dùng chung. Mã yêu cầu requestId phải ổn định khi thử lại cùng một lần ghi, mới cho giao dịch mới.

Thư mục ios/ chứa nguồn ứng dụng WKWebView và WidgetKit. Trên macOS có Xcode/XcodeGen: thay com.example.capmoney và group.com.example.capmoney bằng định danh đã đăng ký ở cả Swift và project.yml; cấu hình Signing Team; chạy xcodegen generate trong ios/; mở dự án sinh ra, build và cài lên thiết bị. Nhập địa chỉ HTTPS của web khi mở ứng dụng. Widget hiển thị dữ liệu lần mở gần nhất, không đọc trực tiếp LocalStorage của Safari. Mã iOS chưa được biên dịch hoặc thử trong môi trường Windows này.

Tài liệu đối chiếu:
- https://developer.apple.com/documentation/widgetkit/creating-a-widget-extension
- https://developer.apple.com/documentation/signinwithapplerestapi
- https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- https://github.com/naptha/tesseract.js/blob/master/docs/api.md

## Cải tiến gần nhất

Thêm ảnh đại diện (xem trước, cắt vuông tự động, lưu/bỏ ảnh), danh sách theo ngày, bộ biểu tượng SVG, căn giữa nút cộng và hiệu ứng kính mờ/chuyển cảnh có chế độ giảm chuyển động.

Bỏ quét biên lai trùng ở Hồ sơ, giữ ở Trang chủ. Hộp thoại có Hủy, xác nhận Xóa và trạng thái xử lý. Sổ chung giữ phiên khi mạng lỗi. Khôi phục video dùng ID mới và thu hồi phần nhập khi lưu thất bại; chưa bảo đảm nguyên tử khi thiết bị tắt đột ngột.

## Kiểm chứng

52 kiểm tra tự động đã đạt trong phiên (chi tiết ở PROJECT_STATE.md). Trình duyệt đã thử thêm/xóa giao dịch, nhận diện mẫu 250.000 VND, tạo PDF/XLSX và tải lại giao diện khi giả lập mất mạng. Chưa thử quay camera, định vị, cài đặt PWA hay Apple/widget trên iPhone thật. Các thư viện Pro cần được tải thành công trước khi dùng ngoại tuyến.
