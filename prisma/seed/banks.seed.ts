import prisma from "@/core/db/prisma"

// prisma/seed/banks.seed.ts
export const seedBanks = async () => {
  const banks = [
    {
      id: "3ae7d064-a8af-49f0-b0f2-2ef79161eaf8",
      short_code: 'KBANK',
      name_th: 'ธนาคารกสิกรไทย',
      name_en: 'Kasikorn Bank',
      logo_url: '/icons/banks/KBANK.png'
    },
    {
      id: "a6bdf19b-b96e-43e5-bd9e-2c35d8279199",
      short_code: 'SCB',
      name_th: 'ธนาคารไทยพาณิชย์',
      name_en: 'Siam Commercial Bank',
      logo_url: '/icons/banks/SCB.png'
    },
    {
      id: "d84ef8d8-a594-47ff-92db-1aed7f499720",
      short_code: 'KTB',
      name_th: 'ธนาคารกรุงไทย',
      name_en: 'Krungthai Bank',
      logo_url: '/icons/banks/KTB.png'
    },
    {
      id: "89f6bf41-a792-4c9f-aa4d-f0bc6bd3c23a",
      short_code: 'BBL',
      name_th: 'ธนาคารกรุงเทพ',
      name_en: 'Bangkok Bank',
      logo_url: '/icons/banks/BBL.png'
    },
    {
      id: "55597dcf-8cb1-43bf-a10a-d60f4de91110",
      short_code: 'BAY',
      name_th: 'ธนาคารกรุงศรีอยุธยา',
      name_en: 'Bank of Ayudhya',
      logo_url: '/icons/banks/BAY.png'
    },
    {
      id: "708f4727-2c84-4523-956e-ae723d04dfa7",
      short_code: 'TTB',
      name_th: 'ธนาคารทหารไทยธนชาต',
      name_en: 'TMBThanachart Bank',
      logo_url: '/icons/banks/TTB.png'
    },
    {
      id: "59d42f3f-976b-457f-9b42-875e75a0fdce",
      short_code: 'GSB',
      name_th: 'ธนาคารออมสิน',
      name_en: 'Government Savings Bank',
      logo_url: '/icons/banks/GSB.png'
    },
    {
      id: "52d37f20-6d37-4d58-a8a0-2c05b79670bd",
      short_code: 'BAAC',
      name_th: 'ธ.ก.ส.',
      name_en: 'Bank for Agriculture and Agricultural Cooperatives',
      logo_url: '/icons/banks/BAAC.png'
    },
    {
      id: "388e6096-d9fa-4654-8e08-8eacee8d9b2e",
      short_code: 'CIMB',
      name_th: 'ธนาคารซีไอเอ็มบี ไทย',
      name_en: 'CIMB Thai Bank',
      logo_url: '/icons/banks/CIMB.png'
    },
    {
      id: "b4653007-d6ea-4e37-b813-51e5c6e62e43",
      short_code: 'UOB',
      name_th: 'ธนาคารยูโอบี',
      name_en: 'United Overseas Bank (Thai)',
      logo_url: '/icons/banks/UOB.png'
    },
    {
      id: "e2cb66af-2b0b-456a-89f6-9f05193155a0",
      short_code: 'ICBC',
      name_th: 'ธนาคารไอซีบีซี (ไทย)',
      name_en: 'ICBC Thai',
      logo_url: '/icons/banks/ICBC.png'
    },
    {
      id: "fedecaeb-6e6d-40a6-9cdb-fee7df61e5c7",
      short_code: 'CITI',
      name_th: 'ธนาคารซิตี้แบงก์',
      name_en: 'Citibank Thailand',
      logo_url: '/icons/banks/CITI.png'
    },
    {
      id: "e7a6a927-23c4-4ecf-a24a-0399dd253d79",
      short_code: 'LHB',
      name_th: 'ธนาคารแลนด์ แอนด์ เฮ้าส์',
      name_en: 'Land and Houses Bank',
      logo_url: '/icons/banks/LHB.png'
    },
    {
      id: "e43ed020-a844-46a0-ac22-f1c570d31398",
      short_code: 'HSBC',
      name_th: 'ธนาคารเอชเอสบีซี ประเทศไทย',
      name_en: 'HSBC Thailand',
      logo_url: '/icons/banks/HSBC.png'
    },
    {
      id: "2d8a400e-de80-4220-9755-9b1936e40f01",
      short_code: 'IBANK',
      name_th: 'ธนาคารอิสลามแห่งประเทศไทย',
      name_en: 'Islamic Bank of Thailand',
      logo_url: '/icons/banks/IBANK.png'
    },
    {
      id: "2dbb347e-0e86-4056-b169-b60c6c183e8c",
      short_code: 'TCRB',
      name_th: 'ธนาคารไทยเครดิตเพื่อรายย่อย',
      name_en: 'Thai Credit Retail Bank',
      logo_url: '/icons/banks/TCRB.png'
    },
    {
      id: "b84b5665-6d16-45b7-83a8-b6dfbce48fc8",
      short_code: 'TISCO',
      name_th: 'ธนาคารทิสโก้',
      name_en: 'TISCO Bank',
      logo_url: '/icons/banks/TISCO.png'
    },
    {
      id: "c6b2b083-e148-4920-b4de-1cb017d70fed",
      short_code: 'GHB',
      name_th: 'ธนาคารอาคารสงเคราะห์',
      name_en: 'Government Housing Bank',
      logo_url: '/icons/banks/GHB.png'
    },
    {
      id: "ae742362-ec33-4966-8d60-238b1d7c6881",
      short_code: 'KKP',
      name_th: 'ธนาคารเกียรตินาคินภัทร',
      name_en: 'Kiatnakin Phatra Bank',
      logo_url: '/icons/banks/KKP.png'
    },
    {
      id: "c0b0ed3a-b98c-42e6-ac31-1e854ceacedf",
      short_code: 'PromptPay',
      name_th: 'พร้อมเพย์ (PromptPay)',
      name_en: 'PromptPay',
      logo_url: '/icons/banks/PromptPay.png'
    },
    {
      id: "25efee2e-0266-439a-9926-1f2985e0fed2",
      short_code: 'TrueMoney',
      name_th: 'ทรูมันนี่ วอลเล็ท',
      name_en: 'TrueMoney Wallet',
      logo_url: '/icons/banks/TrueMoney.png'
    }
  ]

  for (const bank of banks) {
    await prisma.bank.upsert({
      where: { short_code: bank.short_code },
      update: {},
      create: bank
    })
  }

  console.log(`✅ Seeded ${banks.length} banks`)
}
