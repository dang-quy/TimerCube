# Hướng dẫn đưa TimerCube lên GitHub bằng Git

Tài liệu này hướng dẫn tạo repository trên GitHub, đẩy mã nguồn TimerCube lên đó lần đầu và cập nhật các thay đổi về sau. Các lệnh bên dưới dùng được trong PowerShell hoặc terminal tích hợp của VS Code.

## 1. Chuẩn bị

- Cài [Git](https://git-scm.com/downloads) và đăng nhập GitHub trên trình duyệt.
- Mở terminal tại thư mục dự án TimerCube. Trong VS Code, chọn **Terminal → New Terminal**.
- Kiểm tra Git đã sẵn sàng:

  ```powershell
  git --version
  ```

Nếu terminal không nhận lệnh `git`, hãy cài Git rồi mở lại terminal.

## 2. Tạo repository trên GitHub

1. Trên GitHub, chọn **New repository**.
2. Đặt tên repository, ví dụ `timercube`.
3. Chọn **Public** hoặc **Private** tùy nhu cầu.
4. Nếu dự án đã có sẵn trên máy, nên tạo repository trống: không chọn thêm README, `.gitignore` hoặc license trên GitHub.
5. Tạo repository và sao chép URL của nó. URL thường có một trong hai dạng:

   ```text
   https://github.com/<ten-tai-khoan>/<ten-repository>.git
   git@github.com:<ten-tai-khoan>/<ten-repository>.git
   ```

HTTPS là lựa chọn đơn giản để bắt đầu. SSH yêu cầu thiết lập SSH key với GitHub trước.

## 3. Khởi tạo Git và tạo commit đầu tiên

Trong terminal tại thư mục dự án, kiểm tra trạng thái:

```powershell
git status
```

Nếu nhận được thông báo thư mục chưa phải Git repository, khởi tạo Git:

```powershell
git init -b main
```

Nếu lệnh trên không được Git phiên bản cũ hỗ trợ, dùng:

```powershell
git init
git branch -M main
```

Thêm các file dự án và tạo commit:

```powershell
git add .
git status
git commit -m "Initial commit"
```

Trước khi commit, xem lại danh sách từ `git status`. Không đưa mật khẩu, token, khóa riêng tư hoặc file chứa thông tin cá nhân vào repository.

Nếu Git yêu cầu khai báo tên và email, đặt thông tin cho repository này:

```powershell
git config user.name "Tên của bạn"
git config user.email "email@example.com"
```

Sau đó chạy lại lệnh `git commit`.

## 4. Kết nối repository GitHub và push lần đầu

Thay URL mẫu bằng URL repository của bạn:

```powershell
git remote add origin https://github.com/<ten-tai-khoan>/<ten-repository>.git
git push -u origin main
```

Nếu lệnh `git remote add` báo `origin` đã tồn tại, kiểm tra URL hiện tại:

```powershell
git remote -v
```

Nếu URL chưa đúng, cập nhật URL rồi push:

```powershell
git remote set-url origin https://github.com/<ten-tai-khoan>/<ten-repository>.git
git push -u origin main
```

Khi dùng HTTPS, GitHub có thể yêu cầu xác thực qua trình duyệt hoặc Credential Manager. Mật khẩu tài khoản GitHub thông thường không dùng thay cho xác thực Git; làm theo lời nhắc xác thực của GitHub.

## 5. Đẩy các thay đổi tiếp theo

Sau khi chỉnh sửa dự án, chạy:

```powershell
git status
git add .
git commit -m "Mô tả ngắn thay đổi"
git push
```

Ví dụ:

```powershell
git add .
git commit -m "Update usage guide"
git push
```

## Một số lỗi thường gặp

- **`Author identity unknown`**: cấu hình `user.name` và `user.email` như ở bước 3, rồi tạo commit lại.
- **`remote origin already exists`**: dùng `git remote -v` để kiểm tra; dùng `git remote set-url origin <URL>` nếu cần đổi URL.
- **`src refspec main does not match any`**: chưa có commit hoặc nhánh chưa tên `main`. Tạo commit trước, rồi chạy `git branch -M main`.
- **`Repository not found`**: kiểm tra URL, tên tài khoản, tên repository và quyền truy cập.
- **`[rejected] main -> main (non-fast-forward)`**: nhánh trên GitHub có commit mới mà máy của bạn chưa có. Nếu muốn giữ cả thay đổi trên GitHub và máy, tích hợp lịch sử remote trước rồi push lại:

  Trước tiên, `git status` để xem thay đổi trên máy. `git pull --rebase` sẽ bị từ chối nếu còn thay đổi chưa commit. Nếu muốn giữ các thay đổi đó, kiểm tra danh sách file rồi commit chúng:

  ```powershell
  git status
  git add <duong-dan-file>
  git commit -m "Mo ta thay doi"
  ```

  Lặp lại `git add` cho các file cần đưa vào commit. Chỉ dùng `git add .` nếu đã kiểm tra và muốn đưa tất cả thay đổi vào commit.

  Sau đó đồng bộ với GitHub và push:

  ```powershell
  git pull --rebase origin main
  git push -u origin main
  ```

  Nếu có conflict, mở các file được Git báo và chỉnh nội dung, sau đó chạy:

  ```powershell
  git status
  git add <duong-dan-file-da-giai-quyet>
  git rebase --continue
  git push -u origin main
  ```

  Nếu muốn hủy thao tác rebase đang dở, chạy `git rebase --abort`. Nếu Git báo hai lịch sử không liên quan, dừng lại và kiểm tra nội dung hai phía trước khi chọn cách hợp nhất. Không dùng `git push --force` để xử lý lỗi này nếu chưa chắc chắn, vì có thể ghi đè commit trên GitHub.
- **Push bị từ chối vì remote có commit sẵn**: repository GitHub có thể đã được tạo kèm README hoặc file khác. Nếu chưa có dữ liệu cần giữ trên GitHub, cách đơn giản nhất là tạo repository mới và để trống trước khi push. Nếu remote đã có nội dung cần giữ, hãy đồng bộ lịch sử trước; không ghi đè bằng force push khi chưa hiểu rõ ảnh hưởng.

## Triển khai GitHub Pages

Repository này có workflow GitHub Actions tại `.github/workflows/pages.yml`. Sau khi push lên nhánh `main`:

1. Mở **Settings → Pages** trong repository.
2. Đặt **Source** thành **GitHub Actions**.
3. Theo dõi quá trình triển khai trong tab **Actions**. Khi hoàn tất, GitHub Pages sẽ cung cấp đường dẫn trang web.
