import prisma from "@/core/db/prisma"

export const seedRoles = async () => {
  const roles = [
    // Super Admin roles
    {
      id: '18872063-2cd8-42dc-af38-2041502f131f',
      code: 'super_admin_owner',
      name: 'System Administrator',
      scope: 'SUPER_ADMIN',
      description: 'ผู้ดูแลระบบหลักทั้งหมด',
    },
    {
      id: '4118d919-54a8-4d4f-8999-963ccc6b770f',
      code: 'super_admin_staff',
      name: 'System Staff',
      scope: 'SUPER_ADMIN',
      description: 'พนักงานระบบที่มีสิทธิเฉพาะส่วน',
    },

    // Company roles
    {
      id: '6f400dd4-3aa7-4074-bc3c-1ab3f5f54d77',
      code: 'company_owner',
      name: 'Company Owner',
      scope: 'COMPANY',
      description: 'เจ้าของบริษัท มีสิทธิ์สูงสุด',
    },
    {
      id: '9881b0e5-cd68-4380-91a1-41b8f2781f3f',
      code: 'company_admin',
      name: 'Company Admin',
      scope: 'COMPANY',
      description: 'จัดการข้อมูลทุกอย่างภายในบริษัท',
    },
    {
      id: 'b36f8387-31ad-4947-a1cb-2bde947f7b60',
      code: 'company_staff',
      name: 'Company Staff',
      scope: 'COMPANY',
      description: 'ทำรายการต่างๆ ได้',
    }
  ]

  for (const role of roles) {
    const roleExists = await prisma.role.findFirst({
      where: {
        code: role.code,
        scope: role.scope
      }
    })

    if (!roleExists) {
      await prisma.role.upsert({
        where: {
          code_scope_company_id: {
            code: role.code,
            scope: role.scope,
            company_id: role.id
          }
        },
        update: {},
        create: {
          id: role.id,
          code: role.code,
          name: role.name,
          scope: role.scope,
          description: role.description
        },
      })
    }

  }

  console.log(`✅ Seeded ${roles.length} roles`)
}
