import { db } from "./db";
import { franchises, coaches, faqs, successStories, timeSlots, creditPackages, promotions, couponCodes, creditPurchases, creditBalances, creditTransactions } from "@shared/schema";
import { users } from "@shared/models/auth";
import { sql, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  try {
    const [existing] = await db
      .select({ count: sql<number>`count(*)` })
      .from(franchises);

    if (Number(existing.count) > 0) {
      await seedAccounts();
      await seedCreditData();
      return;
    }

    console.log("Seeding database...");

    const insertedFranchises = await db
      .insert(franchises)
      .values([
        {
          name: "質數教室 大安教室",
          address: "復興南路二段 100 號 3 樓",
          city: "台北市",
          district: "大安區",
          phone: "02-2700-1234",
          description: "位於捷運科技大樓站旁，交通便利，環境明亮舒適。擁有獨立教學區與等候區，讓家長安心、孩子專心。",
          maxSeats: 5,
          isActive: true,
          tags: ["家長好評推薦", "年度績優校區"],
          rating: 4.9,
          reviewCount: 86,
          nearbySchools: ["大安國小", "建安國小", "幸安國小", "金華國小"],
        },
        {
          name: "質數教室 信義教室",
          address: "忠孝東路五段 68 號 5 樓",
          city: "台北市",
          district: "信義區",
          phone: "02-2760-5678",
          description: "位於信義商圈核心，提供安靜專注的學習空間。教室設備新穎，採用最新教學教具。",
          maxSeats: 5,
          isActive: true,
          tags: ["成績進步快速"],
          rating: 4.7,
          reviewCount: 53,
          nearbySchools: ["信義國小", "光復國小", "興雅國小", "博愛國小"],
        },
        {
          name: "質數教室 中山教室",
          address: "南京東路二段 88 號 4 樓",
          city: "台北市",
          district: "中山區",
          phone: "02-2531-7890",
          description: "鄰近捷運松江南京站，步行 3 分鐘即達。溫馨的學習環境，老師親切有耐心。",
          maxSeats: 5,
          isActive: true,
          tags: ["家長好評推薦"],
          rating: 4.8,
          reviewCount: 62,
          nearbySchools: ["中山國小", "長安國小", "吉林國小"],
        },
        {
          name: "質數教室 板橋教室",
          address: "文化路一段 200 號 2 樓",
          city: "新北市",
          district: "板橋區",
          phone: "02-2952-9012",
          description: "鄰近板橋火車站，寬敞舒適的學習環境。是新北市最早成立的質數教室。",
          maxSeats: 5,
          isActive: true,
          tags: ["年度績優校區", "成績進步快速"],
          rating: 4.8,
          reviewCount: 74,
          nearbySchools: ["板橋國小", "中山國小", "文化國小", "海山國小"],
        },
        {
          name: "質數教室 永和教室",
          address: "中正路 50 號 3 樓",
          city: "新北市",
          district: "永和區",
          phone: "02-2921-4567",
          description: "靠近頂溪捷運站，交通方便。教室環境溫馨，適合孩子長時間專注學習。",
          maxSeats: 5,
          isActive: true,
          tags: ["家長好評推薦"],
          rating: 4.6,
          reviewCount: 38,
          nearbySchools: ["永和國小", "秀朗國小", "頂溪國小"],
        },
        {
          name: "質數教室 中壢教室",
          address: "中山路 120 號 4 樓",
          city: "桃園市",
          district: "中壢區",
          phone: "03-4250-3456",
          description: "桃園地區首間加盟教室，設備全新完善。提供免費停車位，接送方便。",
          maxSeats: 5,
          isActive: true,
          tags: ["成績進步快速"],
          rating: 4.7,
          reviewCount: 41,
          nearbySchools: ["中壢國小", "新明國小", "中原國小", "自立國小"],
        },
        {
          name: "質數教室 桃園教室",
          address: "中正路 300 號 2 樓",
          city: "桃園市",
          district: "桃園區",
          phone: "03-3360-7890",
          description: "位於桃園火車站商圈，生活機能便利。教室空間寬敞，學習氛圍佳。",
          maxSeats: 5,
          isActive: true,
          tags: ["家長好評推薦", "年度績優校區"],
          rating: 4.9,
          reviewCount: 57,
          nearbySchools: ["桃園國小", "東門國小", "建國國小"],
        },
        {
          name: "質數教室 西屯教室",
          address: "臺灣大道三段 500 號 6 樓",
          city: "台中市",
          district: "西屯區",
          phone: "04-2350-1234",
          description: "台中旗艦教室，位於七期商圈，設備最新，教學品質領先。",
          maxSeats: 5,
          isActive: true,
          tags: ["年度績優校區", "家長好評推薦"],
          rating: 4.8,
          reviewCount: 68,
          nearbySchools: ["惠來國小", "西屯國小", "永安國小", "上石國小"],
        },
      ])
      .returning();

    const insertedCoaches = await db
      .insert(coaches)
      .values([
        {
          name: "林佳慧",
          bio: "擁有 10 年國小數學教學經驗，擅長以生活化的方式引導學生理解抽象概念。",
          specialties: ["高年級數學", "資優培訓"],
          isCertified: true,
          rating: 4.9,
          reviewCount: 28,
          franchiseId: insertedFranchises[0].id,
        },
        {
          name: "陳志明",
          bio: "前國小數學科任教師，專注於低年級數學啟蒙，善於建立孩子的數學自信。",
          specialties: ["低年級啟蒙", "數感培養"],
          isCertified: true,
          rating: 4.8,
          reviewCount: 35,
          franchiseId: insertedFranchises[0].id,
          compensationType: "fixed",
          compensationAmount: 250,
        },
        {
          name: "王雅琪",
          bio: "數學系畢業，熱愛教學，擅長用遊戲化的方式讓孩子愛上數學。",
          specialties: ["數學思維", "邏輯訓練"],
          isCertified: true,
          rating: 4.7,
          reviewCount: 19,
          franchiseId: insertedFranchises[1].id,
        },
        {
          name: "張育銘",
          bio: "深耕課綱研究，能精準對接學校進度，幫助學生在校成績顯著提升。",
          specialties: ["課綱對接", "升學準備"],
          isCertified: true,
          rating: 4.8,
          reviewCount: 42,
          franchiseId: insertedFranchises[2].id,
        },
        {
          name: "李美玲",
          bio: "專精應用題解析，教學風格溫柔有耐心，深受家長和學生喜愛。",
          specialties: ["應用題解析", "文字題"],
          isCertified: true,
          rating: 4.9,
          reviewCount: 31,
          franchiseId: insertedFranchises[3].id,
        },
        {
          name: "黃建宏",
          bio: "幾何與空間概念教學專家，善於利用教具和視覺化工具讓抽象變具體。",
          specialties: ["幾何概念", "空間思維"],
          isCertified: true,
          rating: 4.6,
          reviewCount: 15,
          franchiseId: insertedFranchises[5].id,
        },
        {
          name: "周雨蓁",
          bio: "擅長啟發式教學，引導孩子自己發現數學規律，培養獨立思考能力。",
          specialties: ["啟發式教學", "數學探索"],
          isCertified: true,
          rating: 4.7,
          reviewCount: 22,
          franchiseId: insertedFranchises[4].id,
        },
        {
          name: "吳承翰",
          bio: "曾獲全國數學教育創新獎，教學活潑生動，深受學生喜愛。",
          specialties: ["創意教學", "數學遊戲"],
          isCertified: true,
          rating: 4.9,
          reviewCount: 48,
          franchiseId: insertedFranchises[6].id,
        },
        {
          name: "許靜宜",
          bio: "專注於數學學習障礙輔導，能為每位孩子量身打造學習方案。",
          specialties: ["學習輔導", "補救教學"],
          isCertified: true,
          rating: 4.8,
          reviewCount: 33,
          franchiseId: insertedFranchises[7].id,
        },
      ])
      .returning();

    await db.insert(faqs).values([
      {
        question: "質數教室的上課方式是什麼？",
        answer:
          "我們採用一對一至一對五的小班制個別指導模式。每位老師在同一時段最多指導 5 位學生，每位學生都有獨立的學習進度和教材，老師會依據每位學生的狀態給予個別指導。",
        category: "關於課程",
        sortOrder: 1,
        isActive: true,
      },
      {
        question: "一堂課多長時間？",
        answer:
          "標準課程為每堂 60 分鐘。我們建議每週至少上課 1-2 次，以維持穩定的學習節奏。",
        category: "關於課程",
        sortOrder: 2,
        isActive: true,
      },
      {
        question: "可以先試聽嗎？",
        answer:
          "當然可以！我們提供免費的適性診斷課程，讓老師了解孩子的學習狀態，同時也讓孩子體驗我們的教學方式。請透過首頁的預約功能來安排試聽。",
        category: "關於課程",
        sortOrder: 3,
        isActive: true,
      },
      {
        question: "費用如何計算？",
        answer:
          "我們採用堂數制，家長可依需求購買課程堂數存入家庭錢包，再分配給孩子使用。不同地區的費用可能略有差異，詳細費用請聯繫各分校。",
        category: "關於費用",
        sortOrder: 4,
        isActive: true,
      },
      {
        question: "退費政策是什麼？",
        answer:
          "未使用的課程堂數可隨時申請退費，我們會依照剩餘堂數比例計算退費金額。已上完的課程不在退費範圍內。",
        category: "關於費用",
        sortOrder: 5,
        isActive: true,
      },
      {
        question: "老師的資格要求是什麼？",
        answer:
          "所有老師均需通過總部的嚴格培訓課程，包含教學方法、兒童心理學、認知轉譯技巧等。通過考核後才能獲得「質數教室認證老師」資格。",
        category: "關於老師",
        sortOrder: 6,
        isActive: true,
      },
      {
        question: "可以更換老師嗎？",
        answer:
          "可以的。如果您覺得老師與孩子的學習風格不太契合，可以隨時透過平台更換到同教室的其他老師，或搜尋其他教室的老師。",
        category: "關於老師",
        sortOrder: 7,
        isActive: true,
      },
      {
        question: "如何預約和取消課程？",
        answer:
          "您可以透過我們的平台搜尋可用時段並線上預約。若需取消，必須在課程開始前 4 小時透過系統操作取消，取消後堂數會退回家庭錢包。若超過此期限（即課程開始前不足 4 小時），系統仍會扣除點數計費，無法退回堂數，敬請留意。",
        category: "關於預約",
        sortOrder: 8,
        isActive: true,
      },
    ]);

    await db.insert(successStories).values([
      {
        studentName: "小明",
        parentName: "王媽媽",
        grade: 3,
        testimonial:
          "小明以前看到數學就排斥，上了質數教室後，陳老師用積木和遊戲帶他理解乘法概念，現在他居然會主動說要練習數學！成績也從 65 分進步到 92 分。",
        tags: ["成績進步", "學習態度改善"],
        isActive: true,
      },
      {
        studentName: "小華",
        parentName: "張爸爸",
        grade: 5,
        testimonial:
          "張老師真的很厲害，他能用小華聽得懂的方式解釋分數和小數的概念。以前小華最怕這個單元，現在反而成了他最有自信的部分。非常感謝質數教室！",
        tags: ["概念突破", "專業老師"],
        isActive: true,
      },
      {
        studentName: "小美",
        parentName: "陳媽媽",
        grade: 4,
        testimonial:
          "從 70 分到穩定 95 分以上，只花了三個月。林老師不只教數學，更教小美如何思考和分析問題。這種能力會受用一輩子。",
        tags: ["成績大幅提升", "思維訓練"],
        isActive: true,
      },
      {
        studentName: "小傑",
        parentName: "李媽媽",
        grade: 2,
        testimonial:
          "小傑每週最期待的就是去質數教室上課！老師會用很多有趣的教具，讓他在玩中學。回家後還會自己翻課本複習，這是以前不可能的事。",
        tags: ["學習動機", "低年級"],
        isActive: true,
      },
      {
        studentName: "小芳",
        parentName: "黃爸爸",
        grade: 6,
        testimonial:
          "升國中前的數學準備讓我們很放心。張老師不只幫小芳鞏固基礎，還預先引導了國中的代數概念。現在小芳對升學充滿信心。",
        tags: ["升學準備", "超前學習"],
        isActive: true,
      },
    ]);

    const today = new Date();
    const slotData = [];
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);
      const dateStr = date.toISOString().split("T")[0];

      for (const franchise of insertedFranchises) {
        const franchiseCoaches = insertedCoaches.filter(
          (c) => c.franchiseId === franchise.id
        );

        const times = [
          { start: "09:00", end: "10:00" },
          { start: "10:30", end: "11:30" },
          { start: "14:00", end: "15:00" },
          { start: "15:30", end: "16:30" },
          { start: "17:00", end: "18:00" },
          { start: "19:00", end: "20:00" },
        ];

        for (let t = 0; t < times.length; t++) {
          const coach =
            franchiseCoaches.length > 0
              ? franchiseCoaches[t % franchiseCoaches.length]
              : null;
          const bookedSeats = Math.floor(Math.random() * 4);

          slotData.push({
            franchiseId: franchise.id,
            coachId: coach?.id || null,
            date: dateStr,
            startTime: times[t].start,
            endTime: times[t].end,
            maxSeats: 5,
            bookedSeats,
            isActive: true,
          });
        }
      }
    }

    await db.insert(timeSlots).values(slotData);

    const [existingAdmin] = await db.select().from(users).where(eq(users.username, "admin"));
    if (!existingAdmin) {
      const hash = await bcrypt.hash("admin123", 10);
      await db.insert(users).values({
        id: "hq-admin-001",
        email: "admin@primemath.tw",
        firstName: "系統",
        lastName: "管理員",
        role: "admin",
        username: "admin",
        passwordHash: hash,
      });
      console.log("Default admin account created (username: admin)");
    }

    const franchiseAccounts = [
      { username: "daan", name: "大安", franchise: insertedFranchises[0] },
      { username: "xinyi", name: "信義", franchise: insertedFranchises[1] },
      { username: "zhongshan", name: "中山", franchise: insertedFranchises[2] },
      { username: "banqiao", name: "板橋", franchise: insertedFranchises[3] },
      { username: "yonghe", name: "永和", franchise: insertedFranchises[4] },
      { username: "zhongli", name: "中壢", franchise: insertedFranchises[5] },
      { username: "taoyuan", name: "桃園", franchise: insertedFranchises[6] },
      { username: "xitun", name: "西屯", franchise: insertedFranchises[7] },
    ];

    for (const acct of franchiseAccounts) {
      const [existing] = await db.select().from(users).where(eq(users.username, acct.username));
      if (!existing) {
        const hash = await bcrypt.hash("prime123", 10);
        await db.insert(users).values({
          id: `franchise-admin-${acct.username}`,
          email: `${acct.username}@primemath.tw`,
          firstName: acct.name,
          lastName: "主任",
          role: "franchise_admin",
          franchiseId: acct.franchise.id,
          username: acct.username,
          passwordHash: hash,
        });
      }
    }
    console.log("Franchise admin accounts created");

    await seedAccounts();
    await seedCreditData();

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

async function seedAccounts() {
  const parentAccounts = [
    { username: "parent1", firstName: "王小明", email: "parent1@primemath.tw" },
    { username: "parent2", firstName: "李美華", email: "parent2@primemath.tw" },
    { username: "parent3", firstName: "張大偉", email: "parent3@primemath.tw" },
  ];
  for (const acct of parentAccounts) {
    const [existing] = await db.select().from(users).where(eq(users.username, acct.username));
    if (!existing) {
      const hash = await bcrypt.hash("parent123", 10);
      await db.insert(users).values({
        id: `parent-${acct.username}`,
        email: acct.email,
        firstName: acct.firstName,
        role: "parent",
        username: acct.username,
        passwordHash: hash,
      });
      console.log(`Parent account created: ${acct.username}`);
    }
  }
}

async function seedCreditData() {
  const [existingPkg] = await db
    .select({ count: sql<number>`count(*)` })
    .from(creditPackages);

  if (Number(existingPkg.count) > 0) {
    return;
  }

  console.log("Seeding credit packages, promotions, and coupon codes...");

  const insertedPackages = await db.insert(creditPackages).values([
    {
      name: "體驗方案",
      credits: 1,
      price: 350,
      expiryDays: 30,
      description: "適合初次體驗，1 堂課感受質數教室的教學品質",
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "基礎方案",
      credits: 10,
      price: 3000,
      expiryDays: 180,
      description: "入門首選，10 堂課建立穩固的數學基礎",
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "標準方案",
      credits: 20,
      price: 5600,
      expiryDays: 365,
      description: "最受歡迎方案，20 堂課系統性提升數學能力",
      isActive: true,
      sortOrder: 3,
    },
    {
      name: "精英方案",
      credits: 50,
      price: 12500,
      expiryDays: 365,
      description: "長期學習計畫，50 堂課全面打造數學實力",
      isActive: true,
      sortOrder: 4,
    },
  ]).returning();

  const today = new Date();
  const startDate = today.toISOString().split("T")[0];
  const endDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  await db.insert(promotions).values([
    {
      name: "春季優惠",
      description: "春季限定 85 折優惠，適用於基礎方案以上",
      discountType: "percentage",
      discountValue: 15,
      startDate,
      endDate,
      applicablePackageIds: [insertedPackages[1].id, insertedPackages[2].id, insertedPackages[3].id],
      isActive: true,
    },
  ]);

  await db.insert(couponCodes).values([
    {
      code: "WELCOME100",
      discountType: "fixed",
      discountValue: 100,
      maxUses: 100,
      currentUses: 0,
      minPurchaseAmount: 1000,
      validFrom: startDate,
      validUntil: endDate,
      isActive: true,
    },
  ]);

  const parentUsernames = ["parent1", "parent2", "parent3"];
  for (const username of parentUsernames) {
    const [parentUser] = await db.select().from(users).where(eq(users.username, username));
    if (!parentUser) continue;

    const expiresAt = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000);

    const [purchase] = await db.insert(creditPurchases).values({
      parentId: parentUser.id,
      packageId: insertedPackages[1].id,
      credits: 10,
      originalAmount: 3000,
      discountAmount: 0,
      finalAmount: 3000,
      paymentMethod: "manual",
      paymentStatus: "paid",
      expiresAt,
    }).returning();

    const [balance] = await db.insert(creditBalances).values({
      parentId: parentUser.id,
      purchaseId: purchase.id,
      originalCredits: 10,
      remainingCredits: 10,
      expiresAt,
    }).returning();

    await db.insert(creditTransactions).values({
      parentId: parentUser.id,
      type: "purchase",
      credits: 10,
      balanceId: balance.id,
      purchaseId: purchase.id,
      description: "基礎方案 - 手動加點（測試資料）",
    });

    console.log(`Added 10 test credits for ${username}`);
  }

  console.log("Credit system seed data created successfully!");
}
