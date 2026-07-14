# 📑 NEW_FEATURES_DOCS.md - Tài Liệu Kiến Trúc 10 Tính Năng Mới
**Dự án:** Quản lý chi tiêu cá nhân (MERN Stack Upgrade v2.0)
**Chuẩn áp dụng:** RESTful API (kebab-case), camelCase cho biến/hàm, PascalCase cho React Component.

---

## 1. Phân Hệ Quản Lý Vay Mượn Cá Nhân (Personal Loans)
* **Mô tả:** Theo dõi các khoản tiền "Cho mượn" (LEND) và "Đang nợ" (BORROW), ghi nhận ngày hẹn trả và trạng thái hoàn thành.
* **Backend:**
  * **Model (`models/loanModel.js`):** `personName` (String), `amount` (Number), `type` (Enum: `['LEND', 'BORROW']`), `dueDate` (Date), `status` (Enum: `['PENDING', 'PAID']`, default: `PENDING`), `note` (String).
  * **Routes (`routes/loanRoutes.js`):**
    * `GET /api/loans`: Lấy danh sách vay/mượn (có lọc theo `status`, `type`).
    * `POST /api/loans`: Tạo khoản vay/mượn mới.
    * `PUT /api/loans/:id`: Cập nhật trạng thái (VD: Đã trả hết).
    * `DELETE /api/loans/:id`: Xóa khoản ghi nhớ.
* **Frontend:**
  * **Component (`components/LoanManager.jsx`):** Hiển thị 2 tab con "Tiền cho mượn" và "Tiền đang nợ". Các hàm xử lý: `fetchLoans()`, `handleCreateLoan()`, `handleToggleStatus()`.

---

## 2. Phân Hệ Quản Lý Thẻ & Vay Nợ Tổ Chức (Credit & Org Debts)
* **Mô tả:** Quản lý hạn mức và số dư nợ Thẻ tín dụng (Credit Card), các khoản vay ngân hàng và trả góp định kỳ.
* **Backend:**
  * **Model (`models/creditDebtModel.js`):** `name` (String - VD: "Thẻ Techcombank", "Vay mua xe"), `type` (Enum: `['CREDIT_CARD', 'BANK_LOAN', 'INSTALLMENT']`), `limitAmount` (Number), `currentDebt` (Number), `dueDate` (Number - Ngày chốt/trả hàng tháng), `interestRate` (Number).
  * **Routes (`routes/creditDebtRoutes.js`):**
    * `GET /api/credit-debts`: Lấy danh sách thẻ và nợ.
    * `POST /api/credit-debts`: Thêm khoản nợ/thẻ mới.
    * `PUT /api/credit-debts/:id`: Cập nhật dư nợ / hạn mức.
    * `DELETE /api/credit-debts/:id`: Xóa khoản nợ.
* **Frontend:**
  * **Component (`components/CreditDebtManager.jsx`):** Biểu đồ thanh hiển thị % sử dụng hạn mức thẻ tín dụng. Các hàm: `fetchCreditDebts()`, `handlePayDebt()`.

---

## 3. Tính Năng Heo Tiết Kiệm (Savings Goals)
* **Mô tả:** Đặt mục tiêu tích góp (mua xe, du lịch...), nạp/rút tiền vào heo và tính toán % tiến độ hoàn thành.
* **Backend:**
  * **Model (`models/savingsGoalModel.js`):** `goalName` (String), `targetAmount` (Number), `currentAmount` (Number, default: `0`), `deadline` (Date), `status` (Enum: `['IN_PROGRESS', 'COMPLETED']`).
  * **Routes (`routes/savingsGoalRoutes.js`):**
    * `GET /api/savings-goals`: Lấy toàn bộ mục tiêu.
    * `POST /api/savings-goals`: Tạo mục tiêu mới.
    * `PUT /api/savings-goals/:id/deposit`: Nạp/Rút tiền vào mục tiêu (Body: `{ amount: 500000, action: 'DEPOSIT' }`).
    * `DELETE /api/savings-goals/:id`: Xóa mục tiêu.
* **Frontend:**
  * **Component (`components/PiggyBank.jsx`):** Render các thanh Progress Bar hiển thị % đạt được. Hàm xử lý: `handleDepositMoney()`.

---

## 4. Cài Đặt Tùy Chỉnh Giao Diện (Theme Switcher)
* **Mô tả:** Chổi trạng thái Giao diện giữa Sáng (Light) / Tối (Dark) / Mặc định theo hệ thống (System).
* **Backend:** Không yêu cầu (lưu trực tiếp vào `localStorage` của trình duyệt).
* **Frontend:**
  * **Component (`components/ThemeToggle.jsx`):** Nút dropdown/switch chọn chế độ.
  * **Logic (`utils/themeContext.js`):** Hook `useTheme()` tự động gắn class `dark` vào thẻ `<html>` của Tailwind CSS dựa trên state `themeMode` (`'light' | 'dark' | 'system'`).

---

## 5. Hệ Thống Nhắc Nhở Nợ Qua Thông Báo (Notifications)
* **Mô tả:** Cảnh báo khi sắp đến hạn trả nợ vay cá nhân, thẻ tín dụng (trước 3 ngày) hoặc khi chi tiêu vượt hạn mức.
* **Backend:**
  * **Controller (`controllers/notificationController.js`):** Hàm `checkDueNotifications(req, res)` quét toàn bộ collection `Loan` và `CreditDebt` tìm các khoản có `dueDate` trong vòng 3 ngày tới.
  * **Route (`routes/notificationRoutes.js`):** `GET /api/notifications/check`.
* **Frontend:**
  * **Component (`components/NotificationBell.jsx`):** Biểu tượng chuông báo ở Header, hiện badge số lượng cảnh báo đỏ. Hiển thị Popup Toast khi click hoặc khi hệ thống vừa load.

---

## 6. Nhập / Xuất Dữ Liệu Offline (JSON Import/Export)
* **Mô tả:** Sao lưu toàn bộ dữ liệu (Transactions, Loans, Savings, Budgets) ra file `.json` xuống máy tính và phục hồi khi cần.
* **Backend:**
  * **Routes (`routes/dataTransferRoutes.js`):**
    * `GET /api/data-transfer/export`: Gom toàn bộ collections thành 1 object JSON trả về client.
    * `POST /api/data-transfer/import`: Nhận object JSON, xóa/ghi đè hoặc gộp (merge) vào DB hiện tại.
* **Frontend:**
  * **Component (`components/DataTransfer.jsx`):** 2 nút "Xuất File JSON" và "Nhập File JSON". Hàm `handleExportJSON()` dùng `Blob` để tải file, `handleImportJSON(fileReader)` để parse và gửi lên server.

---

## 7. Lịch Sử Tự Động Backup (Auto Backup Snapshots)
* **Mô tả:** Hệ thống tự động tạo bản sao lưu dữ liệu ngầm (snapshot). Giới hạn tối đa 30 bản cũ nhất sẽ bị tự động xóa (FIFO).
* **Backend:**
  * **Model (`models/backupSnapshotModel.js`):** `timestamp` (Date, default: `Date.now`), `snapshotData` (Object - chứa toàn bộ DB tại thời điểm đó), `note` (String - VD: "Auto backup before deletion").
  * **Logic Middleware:** Hàm `createSnapshot()` được gọi ngầm trước các thao tác lớn (như Import JSON hoặc xóa nhiều). Lệnh query tự động kiểm tra nếu `count() > 30` thì xé bản có `timestamp` nhỏ nhất: `BackupSnapshot.findOneAndDelete({}, { sort: { timestamp: 1 } })`.
  * **Routes (`routes/backupRoutes.js`):**
    * `GET /api/backups`: Lấy danh sách 30 lịch sử backup (chỉ lấy ID, thời gian, không lấy cục data nặng).
    * `POST /api/backups/restore/:id`: Phục hồi toàn bộ DB về thời điểm của snapshot `:id`.

---

## 8. Trường Chọn Tài Khoản / Ngân Hàng (Account Source)
* **Mô tả:** Bổ sung nguồn tiền vào giao dịch (Ví dụ: Tiền mặt, Techcombank, OCB, Momo, Cake...).
* **Backend:**
  * **Cập nhật Model (`models/transactionModel.js`):** Thêm trường `accountSource: { type: String, required: true, default: 'Tiền mặt' }`[cite: 4].
  * **Cập nhật Controller (`controllers/transactionController.js`):** Nhận thêm `accountSource` trong `req.body` khi Tạo và Cập nhật giao dịch.
* **Frontend:**
  * **Cập nhật Component của Người 1 (`TransactionForm.jsx`):** Thêm thẻ `<select name="accountSource">` với các option ngân hàng phổ biến[cite: 9].
  * **Cập nhật Component của Người 1 (`TransactionList.jsx`):** Hiển thị thêm cột "Nguồn tiền" (kèm icon ngân hàng/ví) trong bảng danh sách[cite: 9].

---

## 9. Biểu Đồ Đường (14-Day Cashflow Line Chart)
* **Mô tả:** Biểu đồ xu hướng hiển thị đường biến động Thu và Chi trong 14 ngày gần nhất.
* **Backend:**
  * **Controller (`controllers/dashboardController.js`):** Bổ sung hàm `getCashflow14Days(req, res)`[cite: 6]. Dùng MongoDB Aggregation lọc các giao dịch trong `Date.now() - 14 ngày`, `group` theo chuỗi ngày `YYYY-MM-DD` và tách tổng Thu/Chi từng ngày.
  * **Route (`routes/dashboardRoutes.js`):** `GET /api/dashboard/cashflow-14days`[cite: 6].
* **Frontend:**
  * **Component (`components/CashflowLineChart.jsx`):** Sử dụng `react-chartjs-2` (thẻ `<Line />`). Trục X là mảng 14 ngày qua, Trục Y là số tiền (Đường xanh = Thu, Đường đỏ = Chi).

---

## 10. Thuật Toán Tính "Tổng Tài Sản Thực" (Net Worth Algorithm)
* **Mô tả:** Chỉ số tài chính tổng hợp phản ánh chính xác số tiền thực tế người dùng đang sở hữu.
* **Công thức toán học:**
  `Tổng tài sản thực = (Tổng tiền các tài khoản + Tiền cho mượn + Tiền trong Heo tiết kiệm) - (Tiền đang nợ + Nợ thẻ tín dụng + Nợ trả góp)`
* **Backend:**
  * **Controller (`controllers/dashboardController.js`):** Bổ sung hàm `getNetWorth(req, res)`[cite: 6]. Dùng `Promise.all()` để tổng hợp số liệu đồng thời từ 4 models: `Transaction` (số dư các tài khoản = Thu - Chi), `Loan`, `CreditDebt`, `SavingsGoal`.
  * **Route (`routes/dashboardRoutes.js`):** `GET /api/dashboard/net-worth`[cite: 6].
* **Frontend:**
  * **Component (`components/NetWorthSummary.jsx`):** Thẻ Card nổi bật trên top Dashboard, hiển thị con số Tổng tài sản kèm mũi tên tăng/giảm so với tháng trước và nút "Xem chi tiết" (hiện Modal giải trình từng con số trong công thức).