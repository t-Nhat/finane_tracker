# TÀI LIỆU GHI CHÚ & GIẢI THÍCH CODE - NGƯỜI 2 (MODULE THỐNG KÊ & CẢNH BÁO)
*Nhánh Git quản lý: `feature/chart-dashboard`*

---

File: models/budgetModel.js | Hàm: (Mongoose Schema Definition) | Dòng: 3-6
Ghi chú: Định nghĩa schema cho Ngân sách theo yêu cầu bắt buộc gồm `limitAmount` (dạng Number) để lưu số tiền giới hạn và `month` (dạng String, YYYY-MM) để làm định danh duy nhất cho ngân sách từng tháng.

File: controllers/dashboardController.js | Hàm: getMonthlyStats | Dòng: 14-21
Ghi chú: Sử dụng phương thức `Transaction.aggregate()` của Mongoose kết hợp stage `$match` theo khoảng thời gian và stage `$group` theo field `type` để tính tổng tiền thu/chi trực tiếp dưới tầng cơ sở dữ liệu, tối ưu hiệu năng thay vì kéo toàn bộ data về dùng vòng lặp JavaScript.

File: controllers/dashboardController.js | Hàm: getMonthlyStats | Dòng: 26-29
Ghi chú: Duyệt qua kết quả trả về từ Mongoose aggregate để gán giá trị chính xác vào 2 biến chuẩn `totalIncome` và `totalExpense` theo đúng convention chung của team trước khi trả về JSON Response chuẩn.

File: controllers/dashboardController.js | Hàm: getCategoryDataForChart | Dòng: 49-56
Ghi chú: Lọc ra các giao dịch có `type: 'Chi'`, sau đó gom nhóm theo `category` và cộng dồn `amount`. Việc xử lý này giúp chuẩn bị cấu trúc dữ liệu thô chuẩn bị cho Chart.js.

File: controllers/dashboardController.js | Hàm: getCategoryDataForChart | Dòng: 58-59
Ghi chú: Sử dụng `map()` để bóc tách array object từ MongoDB thành 2 mảng riêng biệt: `labels` (chứa tên các hạng mục) và `values` (chứa tổng tiền tương ứng), tuân thủ tuyệt đối định dạng data đầu vào của Chart.js.

File: controllers/budgetController.js | Hàm: setBudget | Dòng: 8-12
Ghi chú: Sử dụng phương thức `findOneAndUpdate` của Mongoose với tham số `{ upsert: true, new: true }`. Logic này đảm bảo nếu tháng đó chưa có hạn mức thì sẽ tự động tạo mới (insert), nếu đã có thì tiến hành cập nhật (update) mức hạn mức mới.

File: controllers/budgetController.js | Hàm: checkBudgetAlert | Dòng: 36-47
Ghi chú: Query lại bảng Transaction để tính tổng chi tiêu `totalExpense` trong tháng hiện tại bằng `aggregate`, sau đó đem so sánh với `limitAmount` từ collection Budget.

File: controllers/budgetController.js | Hàm: checkBudgetAlert | Dòng: 49-52
Ghi chú: Viết logic `if (totalExpense > limitAmount)` để xác định biến boolean `isExceeded` và tính toán số tiền vượt mức `exceededBy` (= totalExpense - limitAmount), đóng gói đúng cấu trúc JSON giao tiếp BE-FE.

File: components/BudgetSetting.jsx | Hàm: handleSubmit | Dòng: 9-17
Ghi chú: Gọi API `POST /api/budget` theo chuẩn kebab-case. Chuyển đổi `limitAmount` sang kiểu Number trước khi gửi lên Backend và hiển thị `message` từ JSON Response trả về để người dùng biết kết quả thao tác.

File: components/DashboardChart.jsx | Hàm: fetchChartData | Dòng: 19-33
Ghi chú: Gắn dữ liệu `labels` và `values` nhận được từ API `GET /api/dashboard/chart-data` vào state `chartData` với format chuẩn của thư viện `react-chartjs-2`, bao gồm cả việc định nghĩa mảng màu sắc `backgroundColor` cho biểu đồ tròn.

File: components/DashboardChart.jsx | Hàm: (Render Component) | Dòng: 46-52
Ghi chú: Render component `<Pie />` từ thư viện `react-chartjs-2` để vẽ biểu đồ tròn, có xử lý lỗi hiển thị (fallback UI) khi mảng `labels` rỗng (chưa có dữ liệu chi tiêu).

File: components/BudgetAlert.jsx | Hàm: useEffect | Dòng: 22-24
Ghi chú: Thiết lập `setInterval` gọi API `GET /api/budget/check` định kỳ mỗi 10 giây (và dọn dẹp interval bằng `clearInterval` khi unmount component) để thực hiện tính năng kiểm tra theo thời gian thực mỗi khi giao dịch được Người 1 cập nhật mới.

File: components/BudgetAlert.jsx | Hàm: (Render Component) | Dòng: 29-36
Ghi chú: Áp dụng kỹ thuật Conditional Rendering. Chỉ render thẻ `<div className="alert-danger">` với style nền đỏ chữ trắng (theo yêu cầu UI) khi và chỉ khi biến state `alertData.isExceeded === true`.