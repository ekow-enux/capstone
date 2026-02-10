# 🔥 GNFS Multi-Role Dashboard System

A comprehensive multi-role dashboard system for Ghana National Fire Service with separate dashboards for different account types, each with specific access levels and functionalities.

## 🏗️ Architecture Overview

This system implements a role-based access control (RBAC) architecture with five distinct user roles:

- **SuperAdmin**: System-wide management and monitoring
- **Admin**: Station-level management and personnel oversight
- **Operations**: Three sub-roles (main, watchroom, crew) for operational management
- **Safety**: Compliance monitoring and safety incident management
- **PR**: Media management and public relations

## 🚀 Features

### Authentication System
- **Landing Page**: Beautiful marketing page with system overview and features
- **Auth Page**: Modern login/signup forms with role selection
- **Separate Pages**: Auth and landing pages are completely separate as per user preference
- **Auto-redirect**: Seamless navigation between auth and dashboard

### Role-Based Dashboards
- **SuperAdmin Dashboard**: System overview, all stations management, user management, audit logs
- **Admin Dashboard**: Station personnel, reports, departments, performance metrics
- **Operations Dashboards**: 
  - Main: Incident management, personnel status, dispatch management
  - Watchroom: Incoming calls, dispatch queue, coverage monitoring
  - Crew: Assigned incidents, location tracking, field operations
- **Safety Dashboard**: Safety incidents, compliance reports, audit schedules
- **PR Dashboard**: Media coverage, public announcements, campaign management

### Authentication & Authorization
- Role-based authentication with Zustand state management
- Permission-based access control
- Dashboard access restrictions based on user role
- Secure API integration with role-specific headers

### UI/UX Features
- Responsive design with Tailwind CSS
- Role-specific color schemes and branding
- Real-time notifications with react-hot-toast
- Modern component library with Lucide React icons
- Dark mode support
- Glassmorphism design elements
- Gradient backgrounds and modern animations

## 🛠️ Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Forms**: React Hook Form with Zod validation
- **Package Manager**: Bun

## 📁 Project Structure

```
├── app/
│   ├── globals.css          # Global styles with role-specific CSS variables
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main page with DashboardRouter
├── components/
│   ├── DashboardRouter.tsx  # Main router component
│   ├── auth/
│   │   └── LoginForm.tsx    # Authentication form
│   ├── dashboards/
│   │   ├── SuperAdminDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── OperationsDashboard.tsx
│   │   ├── SafetyDashboard.tsx
│   │   └── PRDashboard.tsx
│   ├── layout/
│   │   └── DashboardLayout.tsx
│   └── ui/
│       ├── MetricCard.tsx
│       └── LoadingSpinner.tsx
├── lib/
│   ├── api/
│   │   └── client.ts        # Role-based API client
│   ├── stores/
│   │   └── auth.ts          # Zustand auth store
│   ├── types/
│   │   ├── auth.ts         # Authentication types
│   │   └── dashboard.ts    # Dashboard data types
│   └── utils.ts            # Utility functions
└── package.json
```

## 🔐 Authentication System

### Demo Credentials

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| SuperAdmin | superadmin@gnfs.gov.gh | password123 | System-wide access |
| Admin | admin@gnfs.gov.gh | password123 | Station-level management |
| Operations Main | operations@gnfs.gov.gh | password123 | Operations management |
| Watchroom | watchroom@gnfs.gov.gh | password123 | Watchroom operations |
| Crew | crew@gnfs.gov.gh | password123 | Field operations |
| Safety | safety@gnfs.gov.gh | password123 | Safety management |
| PR | pr@gnfs.gov.gh | password123 | Public relations |

### Role Permissions

```typescript
// SuperAdmin
permissions: ['create', 'read', 'update', 'delete', 'manage_users', 'system_config']
dashboards: ['system_admin', 'analytics', 'user_management']

// Admin
permissions: ['read', 'update', 'manage_personnel', 'manage_reports']
dashboards: ['station_admin', 'personnel_management', 'reports_management']

// Operations Main
permissions: ['read', 'update_reports', 'assign_personnel']
dashboards: ['operations_dashboard', 'incident_management']

// Operations Watchroom
permissions: ['read', 'create_reports', 'dispatch_personnel']
dashboards: ['watchroom_dashboard', 'dispatch_management']

// Operations Crew
permissions: ['read', 'update_status', 'report_progress']
dashboards: ['crew_dashboard', 'field_operations']

// Safety
permissions: ['read', 'update_safety', 'compliance_reports']
dashboards: ['safety_dashboard', 'compliance_monitoring']

// PR
permissions: ['read', 'create_announcements', 'media_reports']
dashboards: ['pr_dashboard', 'media_management']
```

## 🎨 Role-Specific Styling

Each role has its own color scheme defined in CSS variables:

```css
/* SuperAdmin - Red theme */
--superadmin-primary: #DC2626;
--superadmin-secondary: #EA580C;
--superadmin-accent: #EAB308;

/* Admin - Blue theme */
--admin-primary: #2563EB;
--admin-secondary: #1D4ED8;
--admin-accent: #3B82F6;

/* Operations - Green theme */
--operations-primary: #16A34A;
--operations-secondary: #15803D;
--operations-accent: #22C55E;

/* Safety - Yellow theme */
--safety-primary: #EAB308;
--safety-secondary: #CA8A04;
--safety-accent: #FACC15;

/* PR - Purple theme */
--pr-primary: #8B5CF6;
--pr-secondary: #7C3AED;
--pr-accent: #A78BFA;
```

## 🔌 API Integration

The system includes a role-based API client that automatically includes user context in requests:

```typescript
// API client automatically adds role-based headers
headers: {
  'x-user-role': 'SuperAdmin',
  'x-user-sub-role': 'main', // For Operations
  'x-user-station-id': 'station-1',
  'x-user-department-id': 'dept-1'
}
```

### API Endpoints Structure

```
/api/admin/superadmin/*          # SuperAdmin endpoints
/api/admin/station/{id}/*        # Admin endpoints
/api/operations/{stationId}/*   # Operations endpoints
/api/safety/*                   # Safety endpoints
/api/pr/*                       # PR endpoints
/api/auth/*                     # Authentication endpoints
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd admin
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
bun build
bun start
```

## 📊 Dashboard Features

### SuperAdmin Dashboard
- System overview metrics (stations, personnel, users, uptime)
- All stations management table
- User management interface
- System configuration panel
- Audit logs viewer
- System health monitoring

### Admin Dashboard
- Station-specific metrics
- Personnel management
- Station reports overview
- Department management
- Station performance analytics
- Quick action buttons

### Operations Dashboards
- **Main**: Active incidents, personnel status, dispatch management
- **Watchroom**: Incoming calls, dispatch queue, coverage map
- **Crew**: Assigned incidents, location tracking, crew status

### Safety Dashboard
- Safety incident tracking
- Compliance monitoring
- Audit scheduling
- Safety personnel management
- Performance metrics

### PR Dashboard
- Media coverage tracking
- Public announcement management
- Campaign performance
- Public sentiment analysis
- Social media integration

## 🔧 Development

### Adding New Roles
1. Update `UserRole` type in `lib/types/auth.ts`
2. Add role configuration in `RoleBasedAccess` interface
3. Create new dashboard component
4. Update `DashboardRouter` to handle new role
5. Add role-specific styling

### Adding New Permissions
1. Update `Permission` type in `lib/types/auth.ts`
2. Add permission to role configurations
3. Update permission checking functions
4. Implement permission-based UI rendering

### Customizing Dashboards
1. Modify dashboard components in `components/dashboards/`
2. Update metric cards and data types
3. Add new API endpoints in `lib/api/client.ts`
4. Update role-specific styling

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.
