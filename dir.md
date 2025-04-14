simple-stock-api/
├── src/
│   ├── main.ts                     # entry point (เช่น Elysia server)
│   ├── modules/                   # grouped by domain (feature-first)
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.schema.ts        # zod schemas (validate input/output)
│   │   │   └── auth.routes.ts        # ถ้าแยก router ออกจาก controller
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.schema.ts
│   │   ├── products/
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   └── product.schema.ts
│   │   ├── payment-methods/
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.service.ts
│   │   │   └── payment.schema.ts
│   │   └── ...                     # other features (stock, order, etc.)
│
│   ├── core/                      # ส่วนกลาง reusable
│   │   ├── config/                # env/config loader
│   │   │   └── index.ts
│   │   ├── db/                    # prisma client & hooks
│   │   │   └── prisma.ts
│   │   ├── errors/                # custom error classes or factory
│   │   └── utils/                 # misc helper functions
│
│   ├── types/                     # global/shared types & interfaces
│   │   └── index.ts
│   └── middleware/               # global middlewares, auth, logging
│       └── auth.middleware.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/                       # static file (uploads, logos, etc.)
│   └── uploads/
│
├── .env
├── docker-compose.yaml
├── package.json
└── tsconfig.json