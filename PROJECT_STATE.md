# PROJECT_STATE.md

Last updated: 2026-09-13

## Project

Tên project: **MoneyTrack**

Tên đang hiển thị trong ứng dụng: **CapMoney PWA**. Tên MoneyTrack trong tài liệu chưa đổi tên ứng dụng, địa chỉ hoặc khóa lưu dữ liệu.

Mục tiêu: PWA quản lý thu chi cá nhân, được phát triển dựa trên các ý tưởng giao diện và chức năng của các ứng dụng quản lý tài chính hiện đại, bao gồm những nhóm tính năng Pro trong ảnh tham chiếu của người dùng.

Đây là bản triển khai độc lập. Không kết nối hoặc mở khóa gói trả phí của ứng dụng CapMoney gốc.

---

## Current Status

Trạng thái hiện tại:

- App có thể chạy: **Có**, bằng `node serve.cjs` từ thư mục này. Cần Node.js có `node:sqlite`; môi trường đã thử là Node **24.19.0**. Bản xem thử: `http://127.0.0.1:8081/`.
- PWA installable: Có manifest, biểu tượng 192/512 và Service Worker. **Chưa xác nhận thao tác cài đặt thực tế trên iPhone/Android**.
- Offline mode: Đã thử tải lại giao diện bằng trình duyệt khi giả lập mất mạng. Các thư viện OCR/PDF/Excel chỉ được lưu đệm sau khi từng tài nguyên đã được tải trực tuyến thành công. Sổ dùng chung cần mạng.
- Storage: LocalStorage lưu sổ cá nhân; IndexedDB lưu video; SQLite lưu tài khoản đăng nhập và sổ chung; sessionStorage lưu phiên đăng nhập trên thẻ trình duyệt.
- Responsive: Có CSS thích ứng, đã xem giao diện ở kích thước kiểm tra 430 × 932. Chưa kiểm tra đầy đủ mọi kích thước và mức phóng to chữ.
- Mobile: Có vùng an toàn, thanh điều hướng dưới, biểu mẫu và chức năng camera. **Chưa thử camera, định vị, cài PWA hoặc widget trên iPhone thật**.
- Desktop: Đã chạy giao diện, thêm/xóa giao dịch, nhận diện biên lai mẫu và tạo PDF/XLSX trên trình duyệt máy tính; không có lỗi console trong các luồng đã kiểm tra.
- Backend: Có mã và kiểm tra tích hợp cục bộ; **chưa triển khai dịch vụ HTTPS công khai**.
- Pro: Không có giới hạn giao dịch theo gói. Không có hệ thống thanh toán hoặc paywall. Vẫn chịu giới hạn bộ nhớ thiết bị, dung lượng file và giới hạn kỹ thuật của máy chủ.

---

## Current File Structure

Thư mục ứng dụng thực tế: `outputs/capmoney/`, không phải gốc workspace.

```text
outputs/capmoney/
├─ PROJECT_STATE.md          # Tài liệu trạng thái chính thức
├─ README.md                 # Cách chạy và cấu hình
├─ index.html                # Khung HTML, tải các file riêng
├─ app.js                    # Giao diện và sổ thu chi cơ bản
├─ style.css                 # Giao diện gốc
├─ pro.js                    # Tính năng Pro và mở rộng giao diện
├─ ui.css              # Bố cục, biểu tượng, kính mờ, chuyển động
├─ location.js         # Định vị nhanh, điền địa chỉ và bảo vệ chỉnh sửa tay
├─ geocode.cjs         # Tra địa chỉ qua máy chủ, giới hạn/cache Nominatim
├─ profile.js          # Xử lý ảnh đại diện
├─ pro.css                   # Giao diện mở rộng, sáng/tối
├─ finance.js                # Hàm tính tiền, lịch, chia nợ, đọc số tiền
├─ media.js                  # Video và IndexedDB
├─ sharing.js                # Giao diện đăng nhập và sổ dùng chung
├─ api.cjs                   # API, phân quyền, SQLite
├─ serve.cjs                 # Máy chủ HTTP, khởi tạo API
├─ manifest.json
├─ sw.js
├─ icons/
│  ├─ icon.svg
│  ├─ icon-192.png
│  └─ icon-512.png
├─ vendor/
│  ├─ tesseract.min.js
│  ├─ worker.min.js
│  ├─ tesseract-core-lstm.wasm.js
│  ├─ tesseract-core-lstm.wasm
│  ├─ eng.traineddata
│  ├─ vie.traineddata
│  ├─ pdf-lib.min.js
│  ├─ fontkit.umd.min.js
│  ├─ exceljs.min.js
│  ├─ NotoSans-Regular.ttf
│  └─ SOURCES.json           # Nguồn tải các thư viện
└─ ios/
   ├─ CapMoneyApp.swift      # Ứng dụng WKWebView và cầu nối widget
   ├─ CapMoneyWidget.swift   # Mã WidgetKit
   └─ project.yml           # Cấu hình dự án XcodeGen
```

Các file liên quan tại gốc workspace:

```text
PROJECT_STATE.md             # Chỉ dẫn đến tài liệu chính thức
outputs/CapMoney-full-source.md
work/verify.cjs              # 14 kiểm tra nền tảng
work/test-pro.cjs            # 15 kiểm tra tài chính và API
work/test-exports.cjs        # 2 kiểm tra PDF/XLSX
work/test-recovery.cjs       # 4 kiểm tra lỗi bộ nhớ đệm/camera
work/capmoney-data/          # SQLite thực tế, KHÔNG đưa vào web tĩnh
work/api-test-*/             # Cơ sở dữ liệu thử nghiệm riêng
```

`work/server.cjs` là máy chủ tĩnh cũ ở cổng 8080; không dùng để kiểm tra sổ chung. Không chạy nhầm với `outputs/capmoney/serve.cjs` ở cổng 8081.

---

## Implemented Features

`[x]` nghĩa là đã có mã chức năng; giới hạn kiểm chứng được ghi riêng, không có nghĩa đã xác nhận trên mọi thiết bị.

- [x] Dashboard — tổng quan thu chi và lịch tháng.
- [x] Thêm giao dịch.
- [x] Sửa giao dịch.
- [x] Xóa giao dịch có xác nhận và tính lại số dư.
- [x] Thu nhập.
- [x] Chi tiêu.
- [x] Danh mục: thêm, đổi tên và cập nhật các tham chiếu.
- [x] Ví/tài khoản: số dư đầu kỳ, loại tài khoản, sắp xếp.
- [x] Chuyển tiền nội bộ và lịch sử chuyển tiền.
- [x] Thống kê tuần/tháng/năm.
- [x] Biểu đồ danh mục và chi tiêu theo ngày.
- [x] Ngân sách tháng theo danh mục hoặc toàn bộ.
- [x] Giao dịch định kỳ: ngày/tuần/tháng/năm; ghi khoản đến hạn khi mở app.
- [x] Tìm kiếm.
- [x] Lọc giao dịch theo tháng/tài khoản.
- [x] Dark mode; thêm giao diện sáng và theo hệ thống.
- [x] PWA: manifest, icon, Service Worker.
- [x] Offline support cho giao diện và tài nguyên đã lưu đệm.
- [x] Backup: JSON có thể kèm video.
- [x] Restore: nhập JSON, kiểm tra trước khi thay thế dữ liệu. Chưa kiểm tra trọn vòng khôi phục video bằng giao diện.
- [x] Ảnh hóa đơn và nhận diện chữ OCR tại thiết bị; mẫu 250.000 VND đã đọc và điền đúng số tiền.
- [x] Video tối đa 3 giây, 10 MB, lưu riêng; có mã quay và chọn file, chưa thử camera thật.
- [x] Sổ tiết kiệm: lãi đơn ước tính theo ngày thực tế/365, chặn tại ngày đáo hạn.
- [x] Hoàn tiền thẻ: ước tính theo tỷ lệ chung, chưa mô hình hóa mọi điều kiện ngân hàng.
- [x] Khoản vay và đầu tư: quản lý giá trị thủ công, tách khỏi sổ thu chi.
- [x] Bạn bè, nhóm chia tiền, chia đều có xử lý phần dư, tính bù trừ và đánh dấu đã trả.
- [x] Sổ dùng chung: tài khoản, giao dịch, ngân sách, chủ sổ/người ghi/người xem, mã mời một lần, thu hồi quyền.
- [x] Shortcut: nhận văn bản biên lai qua URL để điền trước; API khóa riêng ghi vào sổ chung và chống ghi trùng.
- [x] Xuất PDF có phông tiếng Việt và Excel XLSX thực; đã kiểm tra tạo file và đọc lại XLSX/PDF.
- [x] Gắn địa điểm/tọa độ và liên kết xem bản đồ OpenStreetMap; chưa có bản đồ tương tác nhúng trong app.
- [x] Báo cáo quy đổi tiền tệ theo tỷ giá người dùng nhập; sổ gốc vẫn là VND.
- [ ] Đăng nhập Apple vận hành thực tế: đã có mã phía web và máy chủ, còn thiếu cấu hình Apple Developer và kiểm tra đầu-cuối.
- [ ] Widget iPhone vận hành thực tế: đã có nguồn Swift và cấu hình dự án, chưa biên dịch/ký/cài.
- [ ] Cài PWA và kiểm tra đầy đủ trên iPhone thật.

---

Ảnh đại diện: có chọn/xem trước/bỏ ảnh, cắt vuông giữa ảnh về 384 × 384 JPEG. Danh sách ở Trang chủ là giao dịch theo ngày đang chọn, vẫn áp dụng bộ lọc tài khoản và tìm kiếm.

## Storage

Loại storage hiện tại:

- LocalStorage: JSON sổ cá nhân phiên bản 2, bao gồm tài khoản, giao dịch, ngân sách và các mảng Pro. Ảnh hóa đơn đang nằm trong JSON dưới dạng data URL.
- IndexedDB: database `capmoney-media`, version `1`, object store `files`. Key là `transaction.mediaId`, value là video Blob.
- Backend: SQLite qua `node:sqlite`. Đường dẫn mặc định tính từ `serve.cjs`: `../../work/capmoney-data/capmoney.sqlite`; có thể ghi đè bằng `CAPMONEY_DATA_DIR`.
- Sync: Sổ chung gọi API cùng nguồn. Nút Làm mới tải dữ liệu; ghi có số phiên bản `revision` để từ chối ghi đè bản cũ. **Không có tự đồng bộ sổ cá nhân, đồng bộ nền hoặc hàng đợi ghi ngoại tuyến**.

Trường mới trong state: `avatar` tùy chọn (JPEG/PNG/WebP data URL, giới hạn 300.000 ký tự). Bản sao lưu cũ không có trường này vẫn hợp lệ; không thay khóa storage.

Các key quan trọng:

```ini
capmoney-local-v2 = LocalStorage: sổ cá nhân, version=2
capmoney-media = IndexedDB: cơ sở dữ liệu video, version=1
files = IndexedDB object store: mediaId -> Blob
capmoney-session = sessionStorage: bearer token sổ chung, không phải dữ liệu cá nhân
capmoney-shell-v7 = CacheStorage: tài nguyên giao diện hiện tại; có thể đổi khi cập nhật ứng dụng
capmoney-complete-1 = Định danh định dạng bản sao lưu đầy đủ {format,state,media}
group.com.example.capmoney = App Group mẫu trong mã iOS, phải cấu hình thành nhóm thực
summary = UserDefaults App Group: số liệu widget
siteURL = AppStorage iOS: địa chỉ HTTPS ứng dụng
```

Không thay đổi key sổ cá nhân, cấu trúc SQLite hoặc mediaId nếu chưa có kế hoạch chuyển đổi dữ liệu. Cache giao diện không phải dữ liệu giao dịch; Service Worker chỉ xóa cache mang tiền tố `capmoney-shell-` do ứng dụng quản lý.

Các bảng SQLite: `users`, `sessions`, `books`, `members`, `invites`, `challenges`, `quickkeys`, `quickrequests`. Mật khẩu được băm với scrypt; token phiên, mã mời và khóa Shortcut được lưu dưới dạng băm.

---

## Architecture

Luồng chính của app:

```text
UI: index.html + style.css/pro.css
↓
Application Logic: app.js + pro.js + finance.js
↓
State: đối tượng state, bản sao trước khi thay đổi
↓
validate() → commit()
↓
LocalStorage (JSON) + MediaStore (IndexedDB video)

Sổ dùng chung: sharing.js → API HTTP → api.cjs → SQLite
Widget: pro.js → WKWebView message "summary" → App Group → WidgetKit
```

Thứ tự script bắt buộc trong `index.html`: `finance.js` → `media.js` → `app.js` → `pro.js` → `sharing.js`, đều dùng `defer`. Không đổi thành tải `async` tùy ý.

Các module hoặc function quan trọng:

```text
render()
- Chức năng: vẽ trang đang chọn, điều hướng, áp dụng giao diện và cập nhật widget.
- Được gọi bởi: sự kiện giao diện, luồng lưu, khởi tạo.
- Phụ thuộc: state, page, các renderHome/renderStats/renderAccounts/renderProfile.

validate(state), ensure(state), commit(next)
- Chức năng: kiểm tra dữ liệu, bổ sung trường Pro thiếu, ghi sổ rồi cập nhật state.
- Được gọi bởi: mọi luồng lưu và khôi phục.
- Phụ thuộc: LocalStorage, lược đồ v2; khóa locked khi dữ liệu cũ lỗi.

balance(accountId)
- Chức năng: số dư đầu kỳ + thu - chi - chuyển đi + chuyển đến.
- Được gọi bởi: tài khoản, tổng quan, widget.
- Phụ thuộc: accounts, transactions. Không tăng/giảm số dư lưu sẵn lần thứ hai.

transaction(), editAccount(), pendingTransaction/pendingAccount
- Chức năng: biểu mẫu cơ bản được mở rộng thêm video, tọa độ, hoàn tiền.
- Được gọi bởi: nút thêm/sửa.
- Phụ thuộc: Base, commit, MediaStore. Metadata phải được gắn trong cùng lần ghi JSON.

Finance.advance(), Finance.due(), processRecurring()
- Chức năng: lịch định kỳ, giữ ngày neo cuối tháng và chống ghi trùng bằng ID ổn định.
- Được gọi bởi: khởi động hoặc nút ghi khoản đến hạn.
- Phụ thuộc: recurring, transactions, ngày địa phương.

Finance.interest(), split(), settlements(), parseReceipt()
- Chức năng: ước tính lãi; chia tiền nguyên; bù trừ nợ; chọn số tiền biên lai.
- Được gọi bởi: các giao diện Pro tương ứng.
- Phụ thuộc: dữ liệu truyền vào; không gọi máy chủ.

MediaStore.record()/put()/get()
- Chức năng: quay tối đa 3 giây, lưu/đọc Blob.
- Được gọi bởi: biểu mẫu giao dịch và sao lưu.
- Phụ thuộc: MediaRecorder, camera được người dùng cấp quyền, IndexedDB.

exportPDF(), exportExcel(), backup(), restore()
- Chức năng: xuất báo cáo và sao lưu/khôi phục.
- Được gọi bởi: Hồ sơ → Xuất báo cáo.
- Phụ thuộc: filtered(), thư viện vendor, MediaStore; PDF/XLSX theo tháng/tài khoản đang chọn.

api(), openBook(), saveBook()
- Chức năng: đọc/ghi sổ chung, gửi phiên bản hiện có.
- Được gọi bởi: sharing.js.
- Phụ thuộc: API cùng nguồn, cloudToken, cloudBook.revision.

createAPI(directory).handle()
- Chức năng: xác thực, phân quyền, mã mời, lưu sổ, Shortcut và kiểm tra token Apple.
- Được gọi bởi: serve.cjs.
- Phụ thuộc: SQLite, crypto; Apple keys qua HTTPS nếu dùng Apple login.
```

`pro.js` lưu hàm gốc vào `Base` rồi thay thế một số hàm khai báo toàn cục. Đây là kiến trúc hiện tại, chưa chuyển sang ES modules. Khi sửa phải kiểm tra cả hàm gốc lẫn hàm mở rộng; không thêm CSS/JS dạng văn bản thô vào HTML.

---

## Important UI Components

### Dashboard

Status: Có lời chào, Pro, quét biên lai, tổng thu/chi, bộ lọc ví, lịch tháng, danh sách, tìm kiếm và thêm nhanh. Năm mục điều hướng: Trang chủ, Thống kê, Tài khoản, Ngân sách, Hồ sơ.

### Transactions

Status: Có thu/chi/chuyển, sửa và xóa. Xóa giao dịch thử nghiệm đã đưa số dư về 0. Khoản chia tiền, tiết kiệm và đầu tư không tự phát sinh bút toán cá nhân.

### Add Transaction

Status: Biểu mẫu dialog có loại, số tiền, tài khoản, danh mục, ngày, ghi chú, ảnh, video và tọa độ. Nút Lưu nằm sau trường mở rộng. OCR mẫu điền đúng 250000. Camera/định vị chưa thử trên thiết bị thật.

### Statistics

Status: Có thống kê tuần/tháng/năm; phần phân tích nâng cao vẫn dùng tháng đang chọn và được gắn nhãn riêng. Bản đồ hiện là liên kết ngoài từ tọa độ giao dịch.

### Settings

Status: Tên, danh mục, sáng/tối/hệ thống, tỷ giá báo cáo, sao lưu, xuất báo cáo, ghi chú góp ý cục bộ. Ngôn ngữ hiện cố định tiếng Việt, chưa có bộ dịch đa ngôn ngữ.

---

## Recent Changes

### 2026-09-13

- Sửa từ ảnh iPhone: GitHub Pages tra Nominatim trực tiếp, timeout chung 2 giây cho GPS + địa chỉ; không cam kết luôn có kết quả. Thêm địa điểm đã dùng. Bỏ banner Pro, widget hướng dẫn và mục sổ chung trùng; ẩn sổ chung trên github.io. Đổi Góp ý thành Ghi chú cá nhân. Bọc ô ngày và khống chế width Safari. Đã đạt 14 kiểm tra lõi, 8 vị trí hồi quy và 4 kiểm tra mới (web tĩnh, cache, địa điểm cũ, GPS treo nhả nút sau 2 giây). UI 320/430/768 px: ô ngày nằm trong khung, form không tràn; chưa xác nhận Safari/iPhone thật.

- Đợt vị trí/bố cục: khôi phục thư mục nguồn bị thiếu từ ZIP gần nhất. Thêm location.js + geocode.cjs: định vị nhanh maximumAge 30 giây/timeout 5 giây, địa chỉ Nominatim qua máy chủ, cache và giới hạn tần suất. Gom địa chỉ/tọa độ một nhóm; tách biểu tượng các chức năng Hồ sơ. Đã đạt 8 kiểm tra mô phỏng geocoder/client và 14 kiểm tra lõi. UI: 320/375/430/768/1280 px không tràn ngang, cuộn dọc, ẩn thanh cuộn, khóa/khôi phục nền; 14 mục Hồ sơ có 14 SVG khác nhau. Chưa thử GPS/địa chỉ thật trên iPhone.

- UI mới: thêm profile.js (chọn/xem trước/thu nhỏ/bỏ ảnh đại diện; state.avatar tùy chọn), ui.css (SVG đồng bộ, căn tâm nút cộng, kính mờ, chuyển cảnh và giảm chuyển động). Danh sách lọc đúng ngày và có bộ chọn ngày. Đã đạt 14 kiểm tra lõi và 5 kiểm tra mới. Trình duyệt 375 px: xác nhận chọn ảnh → xem trước → lưu → tải lại còn ảnh → bỏ ảnh mẫu; nút cộng có độ lệch tâm SVG x=0/y=0 px. Không tràn ngang ở 320 và 375 px; console không có lỗi trong luồng thử. Bộ chuyển cảnh 240 ms và chỉ báo điều hướng 300 ms; tắt chuyển động khi có yêu cầu giảm chuyển động.

- Khôi phục video: đọc/kiểm tra các video được tham chiếu trước, lưu với ID mới, chỉ đổi sổ sau khi lưu video thành công; lỗi thì thu hồi video vừa ghi. Không ghi đè video của sổ cũ. IndexedDB xử lý cả abort (`pro.js`, `media.js`). Đã đạt 6 kiểm tra khôi phục: giữ video cũ, ánh xạ ID dùng chung, rollback lỗi ghi JSON/video, thiếu video, MIME sai và tương thích sao lưu cũ.

- Đợt UI/UX: hộp thoại có Hủy, nút Xóa đúng tên cho xóa dữ liệu cá nhân, trạng thái Đang xử lý và chặn gửi lặp; lỗi được đưa vào vùng focus bàn phím (`app.js`, `style.css`). Các nút tác vụ khai báo type=button. Đã đạt 14 kiểm tra nền tảng; kiểm tra trình duyệt xác nhận Hủy/Lưu và nút quét đúng tab.

- Đợt cải tiến mới: bỏ nút quét biên lai trùng ở Hồ sơ, giữ nút Trang chủ (`pro.js`). Sổ chung giữ phiên khi lỗi mạng/máy chủ và có nút Thử lại; chỉ yêu cầu đăng nhập lại khi HTTP 401 (`sharing.js`). Đã đạt 6 kiểm tra lỗi mạng/HTTP 401/403/409/500/503.

- Thay đổi: Lỗi ghi cache không được làm mất phản hồi mạng thành công. File: `sw.js`, cache v3. Lý do: tránh lỗi tải trang khi hết dung lượng bộ nhớ đệm.
- Thay đổi: Dừng camera khi phát preview hoặc tạo bộ ghi thất bại. File: `media.js`. Lý do: tránh để camera tiếp tục chạy sau lỗi.

### 2026-09-12

- Thay đổi: Bổ sung định kỳ, chia tiền, tiết kiệm, hoàn tiền, thống kê và cài đặt. File: `finance.js`, `pro.js`, `pro.css`. Lý do: triển khai nhóm tính năng Pro trong ảnh.
- Thay đổi: Thêm OCR cục bộ, video, PDF/XLSX và sao lưu video. File: `media.js`, `pro.js`, `vendor/`. Lý do: có xử lý thực thay cho nút mô phỏng.
- Thay đổi: Thêm máy chủ SQLite, đăng nhập, quyền sổ chung, mã mời, khóa Shortcut, kiểm tra phiên bản ghi. File: `api.cjs`, `sharing.js`, `serve.cjs`. Lý do: hỗ trợ nhiều người và thiết bị.
- Thay đổi: Gắn metadata giao dịch/hoàn tiền trong cùng lần lưu JSON. File: `pro.js`. Lý do: tránh hai lần ghi gây trạng thái không đồng nhất.

---

## Known Issues

- Địa chỉ tự điền là địa chỉ gần nhất do Nominatim cung cấp, không đảm bảo có đúng số nhà/ngõ. Tra địa chỉ cần mạng: localhost dùng proxy, các host web dùng Nominatim trực tiếp với Referer origin; GitHub Pages không còn cần serve.cjs. Chưa kiểm tra thực tế nhà cung cấp hoặc GPS trên thiết bị thật. GEOCODE_URL cho phép cấu hình máy chủ Nominatim tương thích khác; proxy chỉ lưu cache tọa độ/địa chỉ trong RAM tối đa 24 giờ/200 mục, không ghi vào SQLite.
- Chế độ định vị nhanh dùng cache tối đa 30 giây, độ chính xác thường, timeout GPS 1,8 giây, deadline toàn thao tác 2 giây kể cả GPS không phản hồi; hết hạn giữ tọa độ nếu đã có, cho phép nhập/lưu. Kết quả chính xác trong 2 giây không được đảm bảo. Không cam kết tốc độ hay tương thích hoàn hảo mọi máy.

1. Chưa hoàn tất xác minh end-to-end trên iPhone: cài PWA, camera/video, Apple login và widget. Không được tuyên bố đã hoàn thành toàn bộ Pro trên iOS.
2. Đã sửa việc mất phiên khi lỗi mạng tạm thời; sổ chung chưa có tự cập nhật nền hoặc hàng đợi ngoại tuyến.
3. Video có thể còn Blob không được tham chiếu sau khi xóa giao dịch hoặc thay video. Chưa có dọn media mồ côi; restore đã dùng ID mới và rollback khi có lỗi thông thường. Vẫn chưa nguyên tử khi trình duyệt/thiết bị bị tắt đột ngột; lỗi dọn Blob có thể để lại tệp mồ côi.
4. Quy trình khôi phục cần thêm kiểm tra đầy đủ cấu trúc Pro và thử roundtrip video bằng giao diện; tránh coi các test phần lõi là kiểm chứng toàn bộ nhập dữ liệu.
5. Tiết kiệm, hoàn tiền, khoản vay/đầu tư là mô hình theo dõi thủ công/ước tính; chưa có giá thị trường trực tuyến, biểu phí và quy tắc riêng của từng ngân hàng.
6. Chưa có bản đồ tương tác nhúng, giao diện đa ngôn ngữ, xuất báo cáo sổ chung trực tiếp, hoặc hoàn tác xóa. Góp ý hiện chỉ lưu cục bộ, chưa gửi email.
7. Dữ liệu sổ cá nhân vẫn ở LocalStorage; ảnh data URL có thể làm hết dung lượng. “Không giới hạn theo gói” không đồng nghĩa dung lượng vật lý vô hạn. API sổ chung giới hạn thân yêu cầu 2 MB.
8. Service Worker cập nhật theo vòng đời mặc định, có thể chờ thẻ cũ đóng. Chưa có thông báo phiên bản mới/nhắc tải lại. Thư viện tải lần đầu cần mạng.
9. Nguồn iOS dùng App Group/bundle ID mẫu; chưa được biên dịch trên macOS. Đăng nhập Apple qua popup trong WKWebView cần kiểm tra riêng, không suy ra từ khả năng hoạt động trên trình duyệt.

---

## Do Not Break

- Dữ liệu giao dịch hiện tại và khóa `capmoney-local-v2`.
- Liên kết `mediaId` giữa giao dịch, IndexedDB và bản sao lưu.
- Công thức số dư; chuyển tiền không được tăng tổng tài sản hoặc tính vào thu/chi.
- Kiểm tra dữ liệu trước khi ghi; giữ nguyên dữ liệu hỏng thay vì ghi đè bằng sổ trắng.
- Navigation năm mục và đóng/mở dialog.
- PWA installation metadata, đường dẫn tương đối và Service Worker; không lưu cache API riêng tư.
- Responsive mobile UI, vùng an toàn và thao tác bàn phím.
- Định kỳ không ghi trùng, không trôi ngày neo 29/30/31 qua tháng ngắn.
- Chia tiền phải bảo toàn từng đồng và các khoản đã đánh dấu thanh toán.
- Quyền owner/editor/viewer, mã mời dùng một lần, thu hồi khóa và kiểm tra revision của sổ chung.
- SQLite và token phải ở máy chủ/kho riêng; không đưa cơ sở dữ liệu vào gói web tĩnh hoặc bản mã nguồn công khai.
- Không biến theo dõi tài chính thành lệnh giao dịch ngân hàng thật.

---

## Next Tasks

1. Đã sửa phân biệt lỗi mạng/lỗi xác thực. Tiếp tục kiểm tra UI đăng nhập, nhóm, ngân sách chung và xử lý xung đột từ hai thẻ.
2. Kiểm tra nhập/xuất đầy đủ video; đã thêm staging/rollback restore; tiếp tục xử lý gián đoạn đột ngột, dọn Blob mồ côi có kiểm tra tham chiếu, rà soát dữ liệu Pro nhập vào.
3. Thử trên iPhone thật: cài PWA, ngoại tuyến, quay/chọn video và Shortcuts; kiểm tra nhiều kích thước/phóng to chữ.
4. Cấu hình và triển khai máy chủ HTTPS khi người dùng chọn nơi chạy; giữ DB ngoài thư mục public và có sao lưu.
5. Có Apple Developer và macOS/Xcode: thay bundle ID/App Group, cấu hình Apple login, build/sign widget; không giả định đã chạy chỉ vì có file Swift.
6. Hoàn thiện các khoảng trống nêu trong Known Issues theo yêu cầu người dùng, rồi cập nhật tài liệu và gói mã nguồn.

Các lệnh kiểm tra hiện có (chạy tại gốc workspace):

```sh
node work/verify.cjs
node work/test-pro.cjs
node work/test-exports.cjs
node work/test-recovery.cjs
node work/test-session.cjs
node work/test-restore.cjs
node work/test-ui-refresh.cjs
node work/test-location.cjs
node work/test-static-location.cjs
```

Kết quả trong phiên: **64 kiểm tra tự động đã đạt** (14 nền tảng + 15 Pro/API + 2 xuất file + 4 xử lý lỗi + 6 phiên đăng nhập + 6 khôi phục + 5 giao diện/dữ liệu + 8 vị trí + 4 web tĩnh/timeout), cộng kiểm tra UI lưu/xóa giao dịch, OCR mẫu 250.000 VND, tạo PDF/XLSX và tải lại ngoại tuyến. Đợt mới đã kiểm tra trình duyệt: Home giữ nút quét, Hồ sơ không còn nút trùng, Hủy đóng hộp thoại, tải lại không có lỗi console. Chưa thử toàn bộ vòng khôi phục video qua giao diện. Đây không phải bộ kiểm tra bao phủ toàn bộ sản phẩm.

---

Nguồn kỹ thuật: [Nominatim Reverse](https://nominatim.org/release-docs/develop/api/Reverse/) và [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/). Không suy ra chính xác số nhà từ tọa độ; giới hạn máy chủ dưới 1 yêu cầu/giây, có nhận diện ứng dụng, attribution và cache.

Bổ sung triển khai web tĩnh: reverseAddress dùng bộ nhớ đệm trong RAM tối đa 100 địa chỉ và cách các yêu cầu trực tiếp ít nhất 1,1 giây trong thẻ. Khi triển khai đông người dùng cần proxy có giới hạn chung hoặc nhà cung cấp riêng; giới hạn theo thẻ không thay thế hạn mức toàn ứng dụng. Chưa kiểm tra kết nối Nominatim thật/CORS trên GitHub Pages trong phiên này.

## Important Decisions

### Decision 1

Quyết định: Giữ nhiều file HTML/CSS/JS riêng, không đổi sang framework trong đợt này.

Lý do: Yêu cầu rõ của người dùng và lỗi cũ từng khiến CSS hiển thị thành văn bản.

Không thay đổi trừ khi: Có nhu cầu kỹ thuật cụ thể và kế hoạch giữ nguyên hành vi/dữ liệu.

### Decision 2

Quyết định: Sổ cá nhân lưu cục bộ; sổ chung dùng máy chủ riêng và không tự tải toàn bộ dữ liệu cá nhân lên mạng.

Lý do: Giữ mô hình offline cá nhân và phạm vi chia sẻ có chủ đích.

Không thay đổi trừ khi: Người dùng yêu cầu đồng bộ cá nhân và có thiết kế xác thực, xung đột, chuyển đổi dữ liệu.

### Decision 3

Quyết định: Mọi số tiền sổ gốc là số nguyên VND. Quy đổi chỉ ở báo cáo.

Lý do: Tránh sai số thập phân và thay đổi ý nghĩa giao dịch lịch sử.

Không thay đổi trừ khi: Thiết kế sổ đa tiền tệ, quy tắc tỷ giá và migration đầy đủ.

### Decision 4

Quyết định: OCR chạy trên thiết bị; bản điền trước cần người dùng kiểm tra. Shortcut API có khóa và mã yêu cầu chống ghi trùng.

Lý do: OCR có thể đọc sai; tự động ghi phải có đích sổ và phạm vi quyền cụ thể.

Không thay đổi trừ khi: Có yêu cầu rõ về mức tự động hóa và kiểm tra đầu-cuối.

### Decision 5

Quyết định: Tên project trong tài liệu là MoneyTrack, giao diện hiện vẫn là CapMoney PWA.

Lý do: Người dùng cung cấp tên MoneyTrack trong form trạng thái, chưa yêu cầu đổi thương hiệu và key.

Không thay đổi trừ khi: Người dùng yêu cầu đổi tên giao diện; giữ dữ liệu cũ và cập nhật manifest có chủ đích.

---

## Notes For Next Codex Session

1. Đọc `AGENTS.md` nếu có tại workspace hoặc thư mục cha; trong phiên tạo tài liệu chưa tìm thấy bản file tại workspace, các hướng dẫn đã được người dùng gửi trong hội thoại.
2. Đọc file này. Đây là tài liệu chính thức; file gốc workspace chỉ là chỉ dẫn.
3. Kiểm tra project thực tế trong `outputs/capmoney/`, cấu hình và tiến trình máy chủ. Không giả định cổng 8081 còn chạy.
4. Đọc file liên quan đến yêu cầu mới nhất; chú ý lớp mở rộng `Base` trong `pro.js` và `action` trong `sharing.js`.
5. Không dựa vào lịch sử chat cũ thay cho file và kết quả kiểm tra hiện tại.
6. Sau mỗi đợt thay đổi hoàn thành (kể cả nhỏ), ghi ngay kết quả và phần còn lại vào file này, `README.md` và `outputs/CapMoney-full-source.md`.
7. Không tải lại SQLite đang có bằng dữ liệu thử. Test API dùng thư mục `work/api-test-*` riêng.
8. Không phát biểu “tất cả Pro đã hoàn tất” khi phần iOS, triển khai và các mục còn trống chưa được kiểm chứng.


