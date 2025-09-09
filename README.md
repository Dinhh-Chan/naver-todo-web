# AnyF Time Manager

**Smart Time Management Tool for Vietnamese University Students**

AnyF Time Manager là một ứng dụng quản lý thời gian thông minh được thiết kế đặc biệt cho sinh viên đại học Việt Nam. Ứng dụng sử dụng AI để giúp quản lý lớp học, dự án nhóm, công việc part-time và các nhiệm vụ hàng ngày một cách hiệu quả.

## 🚀 Tính năng chính

### ✅ CRUD Operations
- **Create**: Tạo task mới với đầy đủ thông tin (tiêu đề, mô tả, độ ưu tiên, thời hạn, thời gian ước tính)
- **Read**: Xem task trong nhiều chế độ khác nhau (List, Kanban, Calendar, Analytics)
- **Update**: Chỉnh sửa task, thay đổi trạng thái, cập nhật thời gian
- **Delete**: Xóa task thông qua button hoặc drag-and-drop

### 🎯 3 Chế độ xem dữ liệu
1. **List View**: Danh sách task với tìm kiếm và lọc
2. **Kanban Board**: Bảng Kanban với drag-and-drop giữa các cột
3. **Calendar View**: Lịch với analytics và biểu đồ
4. **Analytics Dashboard**: Phân tích chi tiết với AI insights

### 🤖 AI-Powered Features
- **Task Prioritization**: AI tự động sắp xếp độ ưu tiên dựa trên deadline và pattern
- **Smart Suggestions**: Gợi ý thời gian ước tính, category, và deadline
- **Productivity Insights**: Phân tích pattern làm việc và đưa ra lời khuyên
- **Procrastination Factor**: Tính toán hệ số trì hoãn dựa trên thời gian thực tế vs ước tính
- **Optimal Scheduling**: Gợi ý thời gian tối ưu để làm task

### 💾 Persistent Storage
- **Primary**: localStorage để lưu trữ dữ liệu local
- **Optional**: Firebase integration để đồng bộ cloud (có thể bật/tắt)
- **Sync Status**: Hiển thị trạng thái đồng bộ dữ liệu

### 🎨 UI/UX Features
- **Dark/Light Theme**: Chuyển đổi theme tự động theo hệ thống
- **Responsive Design**: Tối ưu cho mọi thiết bị
- **Vietnamese Language**: Giao diện tiếng Việt
- **Accessibility**: Hỗ trợ keyboard navigation và ARIA labels
- **Smart Notifications**: Thông báo thông minh về deadline và productivity
- **Left Sidebar**: Panel bên trái với Quick Add, Filters, AI Tips, Settings
- **AI Auto-Schedule Modal**: Giao diện đẹp để AI tự động lên lịch

## 📊 Data Model

```typescript
interface Task {
  id: string
  title: string
  description?: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "completed"
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  category?: string
  tags?: string[]
  estimatedTime?: number // in minutes
  actualTime?: number // in minutes
  procrastinationFactor?: number // AI-calculated
  completedAt?: Date
  startedAt?: Date
}
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Next.js 14
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts for analytics
- **Date Handling**: date-fns
- **State Management**: React hooks
- **Storage**: localStorage + Firebase (optional)
- **AI Engine**: Custom JavaScript-based AI logic

## 🚀 Cài đặt và chạy

1. **Clone repository**:
```bash
git clone <repository-url>
cd time-manager
```

2. **Cài đặt dependencies**:
```bash
npm install
# hoặc
pnpm install
```

3. **Chạy development server**:
```bash
npm run dev
# hoặc
pnpm dev
```

4. **Mở trình duyệt**: http://localhost:3000

## 📱 Demo Data

Ứng dụng tự động tạo 25+ sample tasks để demo các tính năng:
- Tasks với các độ ưu tiên khác nhau
- Tasks quá hạn và sắp đến hạn
- Tasks đã hoàn thành với thời gian thực tế
- Đa dạng categories: Study, Assignment, Exam, Meeting, Personal, Career

## 🎯 Hackathon Requirements

### ✅ Core Requirements
- [x] **Full CRUD operations** trên Task data type
- [x] **Persistent storage** với localStorage và Firebase
- [x] **3+ different views** của cùng dữ liệu (List, Kanban, Calendar, Analytics)
- [x] **Time/date handling** với date-fns
- [x] **20+ items support** với sample data và performance optimization
- [x] **Single-page application** với React/Next.js

### ✅ AI Integration
- [x] **Task Prioritization**: AI algorithm sắp xếp độ ưu tiên
- [x] **Smart Suggestions**: Gợi ý thông minh khi tạo task
- [x] **Productivity Insights**: Phân tích pattern và đưa ra insights
- [x] **Procrastination Analysis**: Tính toán hệ số trì hoãn
- [x] **Optimal Scheduling**: Gợi ý thời gian tối ưu

### ✅ Advanced Features
- [x] **Drag-and-drop** trong Kanban view
- [x] **Analytics dashboard** với charts và metrics
- [x] **Theme switching** (dark/light mode)
- [x] **Vietnamese localization**
- [x] **Responsive design**
- [x] **Performance optimization** cho 20+ items
- [x] **Left Sidebar** với Quick Add, Filters, AI Tips, Settings
- [x] **Smart Notifications** với AI insights
- [x] **AI Auto-Schedule Modal** với giao diện đẹp
- [x] **Advanced Filtering** với search và multiple criteria
- [x] **Real-time AI Suggestions** trong Quick Add

## 🔧 Configuration

### Firebase Setup (Optional)
Để bật Firebase sync, cập nhật `lib/firebase-config.ts`:
```typescript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
}

// Set isEnabled to true
private static isEnabled = true
```

## 📈 Performance

- **Virtualized lists** cho large datasets
- **Lazy loading** components
- **Memoized calculations** cho analytics
- **Optimized re-renders** với React.memo
- **Efficient state management** với custom hooks

## 🎨 Design Inspiration

- **Todoist/Any.do**: Clean task management interface
- **Trello/Asana**: Kanban board với drag-and-drop
- **Notion**: Flexible views và analytics dashboard
- **Material Design**: Modern UI components và animations

## 📝 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 👥 Team

**AnyF Team** - NAVER Vietnam AI Hackathon 2024

---

**AnyF Time Manager** - Quản lý thời gian thông minh cho sinh viên Việt Nam! 🎓✨
