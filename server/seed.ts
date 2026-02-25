import { db } from "./db";
import { franchises, coaches, faqs, successStories, timeSlots } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  try {
    const [existing] = await db
      .select({ count: sql<number>`count(*)` })
      .from(franchises);

    if (Number(existing.count) > 0) {
      return;
    }

    console.log("Seeding database...");

    const insertedFranchises = await db
      .insert(franchises)
      .values([
        {
          name: "質數數學 大安教室",
          address: "復興南路二段 100 號 3 樓",
          city: "台北市",
          district: "大安區",
          phone: "02-2700-1234",
          description: "位於捷運科技大樓站旁，交通便利，環境明亮舒適。",
          maxSeats: 5,
          isActive: true,
        },
        {
          name: "質數數學 信義教室",
          address: "忠孝東路五段 68 號 5 樓",
          city: "台北市",
          district: "信義區",
          phone: "02-2760-5678",
          description: "位於信義商圈核心，提供安靜專注的學習空間。",
          maxSeats: 5,
          isActive: true,
        },
        {
          name: "質數數學 板橋教室",
          address: "文化路一段 200 號 2 樓",
          city: "新北市",
          district: "板橋區",
          phone: "02-2952-9012",
          description: "鄰近板橋火車站，寬敞舒適的學習環境。",
          maxSeats: 5,
          isActive: true,
        },
        {
          name: "質數數學 中壢教室",
          address: "中山路 120 號 4 樓",
          city: "桃園市",
          district: "中壢區",
          phone: "03-4250-3456",
          description: "桃園地區首間加盟教室，設備全新完善。",
          maxSeats: 5,
          isActive: true,
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
          franchiseId: insertedFranchises[1].id,
        },
        {
          name: "李美玲",
          bio: "專精應用題解析，教學風格溫柔有耐心，深受家長和學生喜愛。",
          specialties: ["應用題解析", "文字題"],
          isCertified: true,
          rating: 4.9,
          reviewCount: 31,
          franchiseId: insertedFranchises[2].id,
        },
        {
          name: "黃建宏",
          bio: "幾何與空間概念教學專家，善於利用教具和視覺化工具讓抽象變具體。",
          specialties: ["幾何概念", "空間思維"],
          isCertified: true,
          rating: 4.6,
          reviewCount: 15,
          franchiseId: insertedFranchises[3].id,
        },
      ])
      .returning();

    await db.insert(faqs).values([
      {
        question: "質數數學的上課方式是什麼？",
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
          "所有老師均需通過總部的嚴格培訓課程，包含教學方法、兒童心理學、認知轉譯技巧等。通過考核後才能獲得「質數數學認證老師」資格。",
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
          "您可以透過我們的平台搜尋可用時段並線上預約。若需取消，請於上課前 24 小時前操作，即可將堂數退回家庭錢包。",
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
          "小明以前看到數學就排斥，上了質數數學後，陳老師用積木和遊戲帶他理解乘法概念，現在他居然會主動說要練習數學！成績也從 65 分進步到 92 分。",
        tags: ["成績進步", "學習態度改善"],
        isActive: true,
      },
      {
        studentName: "小華",
        parentName: "張爸爸",
        grade: 5,
        testimonial:
          "張老師真的很厲害，他能用小華聽得懂的方式解釋分數和小數的概念。以前小華最怕這個單元，現在反而成了他最有自信的部分。非常感謝質數數學！",
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
          "小傑每週最期待的就是去質數數學上課！老師會用很多有趣的教具，讓他在玩中學。回家後還會自己翻課本複習，這是以前不可能的事。",
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
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
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

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
