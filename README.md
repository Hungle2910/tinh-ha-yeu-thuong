# Tinh hà yêu thương 🌷

Website quà tặng 20/10 bằng tiếng Việt: bó hoa ảnh tương tác, ngân hà 3D với trái tim sao đỏ và một lá thư riêng. Có trang cấu hình tông hồng kem, khung điện thoại xem trước và chức năng xuất món quà thành một tệp HTML.

## Trải nghiệm người nhận

1. Mở trang: bó hoa xuất hiện giữa nền sao vàng–trắng lấp lánh và bướm.
2. Chạm lần đầu: sáu ảnh đầu tiên nở lên từ hoa, giữ lại để ngắm.
3. Chạm lần nữa: chuyển vào đĩa sao 3D với **10 ảnh**, trái tim hạt sao đập nhẹ và lời nhắn luân phiên.
4. Kéo ngang/dọc để đổi góc nhìn; lăn chuột hoặc chụm hai ngón để zoom. Chạm ảnh để phóng lớn.
5. Chạm phong thư bay quanh trái tim, có đuôi hồng phát sáng, rồi mở phong bì để đọc thư. Đóng thư để trở lại ngân hà.

Có nút bật/tắt nhạc, tạm dừng chuyển động, album dùng bằng bàn phím và hỗ trợ chế độ giảm chuyển động của hệ điều hành.

## Trang chỉnh sửa

Mở `/config.html` để:

- Thay ảnh bó hoa và bộ 10 ảnh kỷ niệm; sửa chú thích, xóa hoặc đổi thứ tự ảnh.
- Sửa hướng dẫn chạm hoa, dòng ngày, tiêu đề, chữ ở trái tim và các lời nhắn.
- Viết người nhận, nội dung thư, chữ ký và chọn ảnh riêng trong thư.
- Tải nhạc nền, nghe thử, chỉnh âm lượng hoặc xóa nhạc.
- Chọn font, màu chữ, màu trái tim, cỡ chữ chung và cỡ chữ riêng từng phần.
- Chỉnh tốc độ, mật độ sao; bật/tắt ngân hà, lá thư, bướm, ảnh trong hoa và các hiệu ứng.
- Xem trước **Bó hoa / Ngân hà / Lá thư** trong khung điện thoại. Tự cập nhật sau khi ngừng nhập khoảng một giây; có thể tắt để cập nhật thủ công.
- Tải món quà đã cá nhân hóa thành HTML.

## Công nghệ và yêu cầu

- JavaScript ES modules, HTML, CSS.
- Three.js và OrbitControls để dựng không gian 3D.
- Vite để chạy phát triển và build.
- IndexedDB để lưu cấu hình trên trình duyệt.
- Node.js **22.12+** (đã build bằng Node.js 24.14.1), npm và trình duyệt hiện đại hỗ trợ WebGL.

Không cần backend, tài khoản ứng dụng hoặc khóa API.

## Chạy trên máy

```bash
git clone https://github.com/Hungle2910/tinh-ha-yeu-thuong.git
cd tinh-ha-yeu-thuong
npm ci
npm run build:gift
npm run dev
```

Repo riêng tư yêu cầu tài khoản GitHub được cấp quyền khi clone. Mở địa chỉ Vite in ra, thường là:

- Món quà: `http://127.0.0.1:5173/index.html`
- Trang chỉnh sửa: `http://127.0.0.1:5173/config.html`

`build:gift` tạo template cần thiết cho nút **Tải món quà**. Sau khi sửa mã nguồn, chạy lại lệnh này trước khi xuất HTML; `npm run build` cũng tự thực hiện bước đó.

## Các lệnh

| Lệnh | Chức năng |
| --- | --- |
| `npm ci` | Cài đúng phiên bản từ lockfile |
| `npm run dev` | Chạy Vite cho phát triển |
| `npm run build:gift` | Tạo template xuất quà và HTML demo |
| `npm run build` | Tạo template và build website vào `dist/` |
| `npm run preview` | Xem bản build tại địa chỉ Vite in ra |

## Ảnh, nhạc và giới hạn

- Tối đa 10 ảnh kỷ niệm; mỗi ảnh tối đa 20 MB. Ảnh kỷ niệm được cắt giữa theo khung dọc 720 × 912 và nén JPEG.
- Chọn đúng 10 ảnh để thay cả bộ; chọn ít hơn để lấp các ô trống. Có thể thay từng ô. Sáu ô đầu được dùng trong bó hoa.
- Ô chưa tải ảnh dùng hình minh họa phong cảnh. Để có chân dung giống hình mẫu, cần thay bằng ảnh cá nhân phù hợp; ứng dụng không tự tách nền chân dung.
- Ảnh bó hoa hỗ trợ PNG, JPG, WebP; PNG trong suốt giữ được nền sao phía sau.
- Nhạc tối đa 15 MB; khả năng phát phụ thuộc định dạng được trình duyệt hỗ trợ. Nhạc bắt đầu sau thao tác chạm của người nhận.
- Tối đa 20 lời nhắn, 80 ký tự mỗi câu; thư tối đa 5.000 ký tự.
- Ảnh trong thư dùng ảnh riêng nếu có, nếu không dùng ảnh đầu tiên đã tải trong bộ ảnh.

## Lưu và xuất món quà

Cấu hình, ảnh và nhạc được lưu trong IndexedDB trên **trình duyệt và địa chỉ hiện tại**. Chúng không tự đồng bộ sang máy khác hoặc GitHub. Đổi trình duyệt, đổi cổng hay xóa dữ liệu trang có thể khiến bản lưu không còn xuất hiện.

Trong trang cấu hình, chọn **Tải món quà** để nhận `tinh-ha-danh-cho-em.html`, chứa mã, ảnh và nhạc đã chọn. Có thể mở trực tiếp hoặc đưa tệp đó lên hosting. Font Google cần Internet; khi offline dùng font dự phòng. Âm thanh vẫn cần thao tác người dùng theo chính sách trình duyệt.

Repo chứa mã nguồn và bó hoa mặc định, không chứa dữ liệu cá nhân đã lưu trong trình duyệt. Video tham chiếu, ảnh chụp kiểm tra, bản HTML xuất và thư mục build được loại khỏi Git bằng `.gitignore`.

## Build và triển khai

```bash
npm run build
npm run preview
```

Có hai cách sử dụng bản build:

1. Đưa `dist/` lên static hosting để có website và trang chỉnh sửa. Mỗi người chỉnh sửa có bản lưu riêng trên trình duyệt của họ.
2. Để chia sẻ **món quà đã cá nhân hóa**, xuất HTML trong trang cấu hình rồi dùng tệp đó làm `index.html` trên hosting hoặc gửi tệp cho người nhận.

Repo private không tự làm website triển khai thành private. Việc triển khai và quyền truy cập hosting cần được thiết lập riêng; dự án không tự tạo URL công khai. Địa chỉ localhost chỉ dùng được trên máy đang chạy.

## Cấu trúc mã nguồn

```text
index.html                Trang món quà
config.html               Trang chỉnh sửa
src/
  main.js                 Cấu hình, IndexedDB, luồng bó hoa và thư
  editor.js               Form cấu hình, upload, xem trước, xuất HTML
  planet.js               Three.js, quỹ đạo ảnh, tim sao, phong thư
  style.css               Kiểu cơ bản
  studio.css              Giao diện chỉnh sửa
  experience.css          Hiệu ứng và phong bì
  romance.css              Giao diện món quà
  journey.css              Bố cục và hiệu ứng hiện tại
  assets/
    rose-bouquet.png       Bó hoa mặc định trong suốt
    ASSETS.md              Nguồn gốc và prompt của artwork
build-gift.mjs             Đóng gói HTML độc lập
vite.config.js            Hai entry: món quà và cấu hình
package-lock.json         Khóa phiên bản dependencies
```

Các tệp tự sinh, không commit: `public/gift-template.html`, `tinh-ha.html`, `dist/`.

## Kiểm tra và lưu ý kỹ thuật

Hiện chưa có bộ test tự động. Trước khi phát hành, chạy build và kiểm tra thủ công:

- Hoa chưa hiện ảnh → chạm nở ảnh → chạm vào ngân hà.
- Xoay/zoom, mở ảnh, mở và đóng thư, tạm dừng chuyển động.
- Upload ảnh/nhạc, sửa chữ và cỡ chữ, tự lưu, tải lại trang và xem trước cả ba màn.
- Xuất HTML và mở thử; kiểm tra trên desktop và điện thoại.

Build có thể cảnh báo bundle lớn vì bó hoa được nhúng cùng mã để phục vụ xuất HTML độc lập. Số lượng ảnh, nhạc và khả năng GPU ảnh hưởng đến dung lượng và độ mượt. Khi WebGL không khả dụng, ứng dụng có album ảnh thay thế.

## Artwork

Bó hoa mặc định được tạo bằng imagegen; thông tin nguồn nằm trong [`src/assets/ASSETS.md`](src/assets/ASSETS.md). Giao diện được dựng theo tham khảo và tùy chỉnh riêng; không chứa ảnh chân dung cá nhân từ clip mẫu.
