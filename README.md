# Blog API

RESTful API untuk aplikasi blog yang dibangun dengan NestJS, TypeORM, dan PostgreSQL. Mengimplementasikan autentikasi JWT, role-based access control, dan fitur CRUD lengkap untuk posts, categories, dan comments.

## 🚀 Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator + class-transformer
- **Password Hashing**: Argon2
- **Package Manager**: pnpm

## ✨ Features

### Authentication & Authorization

- ✅ JWT-based authentication (Access Token + Refresh Token)
- ✅ Role-based access control (Admin, Author, Reader)
- ✅ Multiple access levels dengan guard dan decorator
- ✅ Public routes untuk content yang bisa diakses tanpa auth

### Database

- ✅ PostgreSQL dengan TypeORM
- ✅ Relational database dengan multiple relations:
  - User → Posts (OneToMany)
  - User → Comments (OneToMany)
  - Category → Posts (OneToMany)
  - Post → Comments (OneToMany)
- ✅ Transaction support untuk operasi multi-table
- ✅ Auto-generate slug untuk posts dan categories

### API Features

- ✅ CRUD operations untuk Posts, Categories, Comments
- ✅ Pagination dengan query parameters
- ✅ Search functionality untuk posts
- ✅ Filter posts by category, author, published date
- ✅ Comment management dengan pagination
- ✅ Consistent JSON response format
- ✅ Global validation dengan error handling

## 📁 Project Structure

```
src/
├── auth/              # Authentication module
│   ├── guards/        # Auth guards (JWT, Roles)
│   ├── strategies/    # Passport strategies
│   └── dto/           # Auth DTOs
├── users/             # User management
├── posts/             # Post management
├── categories/        # Category management
├── comments/          # Comment management
├── common/            # Shared utilities
│   ├── decorators/    # Custom decorators
│   ├── filters/       # Exception filters
│   ├── interceptors/  # Response interceptors
│   └── dto/           # Shared DTOs (pagination, etc)
└── config/            # Configuration files
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- pnpm

### Steps

1. **Clone repository**

```bash
git clone <repository-url>
cd blog-api-test
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Setup environment variables**
   Buat file `.env` di root project:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/blog_db

# JWT
JWT_ACCESS_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret

# Server
PORT=3000
FRONTEND_URL=http://localhost:3001
```

4. **Run database migrations**
   Database akan auto-sync (synchronize: true) saat development.

5. **Start application**

```bash
# Development
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

## 📡 API Endpoints Overview

### Authentication

- `POST /auth/register` - Register user (role optional via query param)
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout (requires refresh token)
- `POST /auth/refresh` - Refresh access token

### Posts

- `GET /posts` - Get all posts (public)
- `GET /posts/:id` - Get post by ID
- `GET /posts/search?q=keyword` - Search posts
- `GET /posts/category/:categoryId` - Get posts by category
- `GET /posts/:id/comments?page=1&limit=10` - Get comments with pagination
- `POST /posts` - Create post (Author, Admin only)
- `PUT /posts/:id` - Update post (Author, Admin only)
- `DELETE /posts/:id` - Delete post (Author, Admin only)

### Categories

- `GET /categories` - Get all categories (public)
- `GET /categories/:slug` - Get category by slug
- `POST /categories` - Create category (Admin only)
- `PUT /categories/:id` - Update category (Admin only)
- `DELETE /categories/:id` - Delete category (Admin only)

### Comments

- `GET /posts/:id/comments` - Get comments for a post (paginated)
- `POST /posts/:id/comments` - Create comment (authenticated users)
- `PUT /comments/:id` - Update comment (owner only)
- `DELETE /comments/:id` - Delete comment (owner only)

## 🔐 Role-Based Access Control

- **READER**: Can read posts, create comments
- **AUTHOR**: Can create/edit/delete own posts + reader permissions
- **ADMIN**: Full access to all resources + manage categories

## 📝 Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Resource created successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/endpoint"
}
```

## 📚 API Documentation

Postman Collection tersedia sebagai referensi untuk testing semua endpoint API.

### Menggunakan Postman Collection

1. **Import Collection**
   - Buka Postman
   - Klik "Import" → Pilih file `API_DOCS.postman_collection.json`
   - Collection akan ter-import dengan semua endpoint yang tersedia

2. **Setup Environment Variables**
   Buat environment di Postman dengan variabel berikut:

   ```
   base_url = http://localhost:3000
   access_token = (akan di-set otomatis setelah login)
   refresh_token = (akan di-set otomatis setelah login)
   post_id = (akan di-set otomatis setelah create post)
   category_id = (akan di-set otomatis setelah create category)
   comment_id = (akan di-set otomatis setelah create comment)
   ```

3. **Collection Structure**
   - **AUTH**: Register, Login, Logout, Refresh Token
   - **Categories**: CRUD operations untuk categories
   - **Posts**: CRUD operations, search, filter untuk posts
   - **Comments**: CRUD operations untuk comments

4. **Auto-token Management**
   Collection sudah dikonfigurasi untuk otomatis menyimpan `access_token` dan `refresh_token` setelah login/register, sehingga tidak perlu set manual untuk request berikutnya.

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 📦 Scripts

- `pnpm run start:dev` - Start in development mode with watch
- `pnpm run build` - Build for production
- `pnpm run start:prod` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Format code with Prettier

## 🔧 Development

### Key Features Implementation

1. **Authentication Flow**
   - Access token: 15 minutes expiry
   - Refresh token: 7 days expiry
   - Refresh tokens stored hashed in database

2. **Transaction Support**
   - Implemented in post creation for multi-table operations

3. **Slug Generation**
   - Auto-generated from title/name
   - Handles duplicates with counter suffix

4. **Pagination**
   - Query-based pagination with optional parameters
   - Default: page=1, limit=10

## 📄 License

UNLICENSED
