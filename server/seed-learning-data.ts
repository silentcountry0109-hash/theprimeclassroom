import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedLearningData() {
  const client = await pool.connect();
  try {
    console.log("Seeding learning data...");

    // Clean up previous seed data (contact books linked to seed bookings)
    await client.query("DELETE FROM contact_books WHERE booking_id IN (SELECT b.id FROM bookings b JOIN time_slots ts ON b.slot_id = ts.id WHERE ts.date LIKE 'seed-%')");
    await client.query("DELETE FROM bookings WHERE slot_id IN (SELECT id FROM time_slots WHERE date LIKE 'seed-%')");
    await client.query("DELETE FROM time_slots WHERE date LIKE 'seed-%'");
    // Also clean contact books for existing bookings that we previously seeded
    await client.query("DELETE FROM contact_books WHERE internal_notes = 'seed-learning-data'");
    await client.query("DELETE FROM children WHERE name IN ('王小安','王小宇','李小花','李大明')");

    // Fetch existing textbooks by grade
    const textbooksResult = await client.query(
      "SELECT id, grade, unit_code, unit_name FROM textbooks WHERE is_active = true ORDER BY grade, sort_order"
    );
    const textbooks = textbooksResult.rows;
    const tbByGrade: Record<number, typeof textbooks> = {};
    for (const tb of textbooks) {
      if (!tbByGrade[tb.grade]) tbByGrade[tb.grade] = [];
      tbByGrade[tb.grade].push(tb);
    }

    // Fetch quizzes
    const quizzesResult = await client.query(
      "SELECT id, textbook_id, quiz_name, total_score FROM textbook_quizzes WHERE is_active = true ORDER BY sort_order"
    );
    const quizzesByTb: Record<number, any[]> = {};
    for (const q of quizzesResult.rows) {
      if (!quizzesByTb[q.textbook_id]) quizzesByTb[q.textbook_id] = [];
      quizzesByTb[q.textbook_id].push(q);
    }

    // Create new children
    const newChildren = [
      { name: "王小安", grade: 2, parentId: "parent-parent1", school: "台北市大安區幸安國小" },
      { name: "王小宇", grade: 5, parentId: "parent-parent1", school: "台北市大安區幸安國小" },
      { name: "李小花", grade: 1, parentId: "parent-parent2", school: "台北市信義區信義國小" },
      { name: "李大明", grade: 4, parentId: "parent-parent2", school: "台北市信義區信義國小" },
    ];

    const childIds: Record<string, number> = {};
    for (const child of newChildren) {
      const codeNum = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      const result = await client.query(
        `INSERT INTO children (name, grade, parent_id, school, gender, student_code) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [child.name, child.grade, child.parentId, child.school, child.name.includes("花") ? "female" : "male", `2026030${codeNum}`]
      );
      childIds[child.name] = result.rows[0].id;
      console.log(`Created child: ${child.name} (id=${result.rows[0].id}, grade=${child.grade})`);
    }

    // All students to create learning data for
    const students = [
      { childId: 1, name: "測試小孩E2E", grade: 3, parentId: "parent-parent1", existingBookings: [8, 9, 10, 11, 32] },
      { childId: 12, name: "測試小明", grade: 3, parentId: "parent-parent1", existingBookings: [31] },
      { childId: childIds["王小安"], name: "王小安", grade: 2, parentId: "parent-parent1", existingBookings: [] },
      { childId: childIds["王小宇"], name: "王小宇", grade: 5, parentId: "parent-parent1", existingBookings: [] },
      { childId: childIds["李小花"], name: "李小花", grade: 1, parentId: "parent-parent2", existingBookings: [] },
      { childId: childIds["李大明"], name: "李大明", grade: 4, parentId: "parent-parent2", existingBookings: [] },
    ];

    const coachId = 14; // 陳志明
    const franchiseId = 9;

    const lessonDates = [
      "2026-02-10", "2026-02-12", "2026-02-14", "2026-02-17", "2026-02-19",
      "2026-02-21", "2026-02-24", "2026-02-26", "2026-02-28",
      "2026-03-03", "2026-03-05",
    ];

    const progressTemplates = [
      "課本 P.{p1}-{p2}，完成例題練習",
      "進度順利，完成課本 P.{p1}-{p2}",
      "複習前次單元 + 新進度 P.{p1}-{p2}",
      "課本 P.{p1}-{p2}，學生理解良好",
      "課本 P.{p1}-{p2}，需加強練習",
    ];

    const homeworkTemplates = [
      "練習本 P.{p1}-{p2}",
      "習作 P.{p1}-{p2}，明天交",
      "複習今日單元，完成學習單",
      "練習本 P.{p1}-{p2} 奇數題",
      "預習下一單元 P.{p1}-{p2}",
    ];

    const remarkTemplates = [
      "學生上課專注，理解力佳",
      "今天表現進步，值得鼓勵",
      "計算速度有提升，但需注意粗心",
      "概念理解良好，應用題需多練習",
      "學習態度認真，建議每天練習 15 分鐘",
      "今日小考表現不錯，繼續保持",
      "學生在此單元有明顯進步",
      "需要加強基礎運算，建議回家多練",
    ];

    function randInt(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function pickRandom<T>(arr: T[]): T {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function fillTemplate(template: string): string {
      const p1 = randInt(10, 80);
      return template.replace("{p1}", p1.toString()).replace("{p2}", (p1 + randInt(4, 12)).toString());
    }

    let totalContactBooks = 0;

    for (const student of students) {
      const gradeTextbooks = tbByGrade[student.grade] || [];
      if (gradeTextbooks.length === 0) {
        console.log(`No textbooks for grade ${student.grade}, skipping ${student.name}`);
        continue;
      }

      const numLessons = student.existingBookings.length > 0
        ? Math.min(student.existingBookings.length, 5)
        : randInt(7, 10);

      let bookingIds: number[] = [];

      // Use existing bookings first
      if (student.existingBookings.length > 0) {
        // Check which ones already have contact books
        const existingCb = await client.query(
          "SELECT booking_id FROM contact_books WHERE child_id = $1",
          [student.childId]
        );
        const existingBookingIds = new Set(existingCb.rows.map((r: any) => r.booking_id));
        bookingIds = student.existingBookings.filter(id => !existingBookingIds.has(id));
      }

      // Create additional slots + bookings if needed
      const additionalNeeded = numLessons - bookingIds.length;
      if (additionalNeeded > 0) {
        for (let i = 0; i < additionalNeeded; i++) {
          const date = lessonDates[i % lessonDates.length];
          const startHour = 9 + (i % 4) * 2;
          const startTime = `${startHour.toString().padStart(2, "0")}:00`;
          const endTime = `${(startHour + 1).toString().padStart(2, "0")}:00`;

          // Create time slot
          const slotResult = await client.query(
            `INSERT INTO time_slots (franchise_id, coach_id, date, start_time, end_time, max_seats, booked_seats, is_active)
             VALUES ($1, $2, $3, $4, $5, 5, 1, true) RETURNING id`,
            [franchiseId, coachId, `seed-${date}-${student.childId}-${i}`, startTime, endTime]
          );
          const slotId = slotResult.rows[0].id;

          // Create booking
          const bookingResult = await client.query(
            `INSERT INTO bookings (slot_id, child_id, parent_id, status)
             VALUES ($1, $2, $3, 'completed') RETURNING id`,
            [slotId, student.childId, student.parentId]
          );
          bookingIds.push(bookingResult.rows[0].id);
        }
      }

      // Create contact books for each booking
      for (let i = 0; i < bookingIds.length && i < numLessons; i++) {
        const bookingId = bookingIds[i];
        const textbook = gradeTextbooks[i % gradeTextbooks.length];
        const quizzes = quizzesByTb[textbook.id] || [];
        const lessonDate = lessonDates[i % lessonDates.length];

        const hasQuiz = Math.random() > 0.25; // 75% chance of having a quiz
        let quizScore: number | null = null;
        let quizTotal: number | null = 100;

        if (hasQuiz && quizzes.length > 0) {
          quizScore = randInt(65, 100);
          if (quizScore >= 90) quizScore = randInt(90, 100);
          else if (quizScore >= 80) quizScore = randInt(78, 92);
          else quizScore = randInt(65, 82);
        } else {
          quizTotal = null;
        }

        const lessonUnit = `${textbook.unit_code} ${textbook.unit_name}`;
        const progress = fillTemplate(pickRandom(progressTemplates));
        const homework = fillTemplate(pickRandom(homeworkTemplates));
        const remarks = pickRandom(remarkTemplates);

        await client.query(
          `INSERT INTO contact_books (booking_id, coach_id, child_id, lesson_date, lesson_unit, lesson_progress, quiz_score, quiz_total, homework, teacher_remarks, internal_notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [bookingId, coachId, student.childId, lessonDate, lessonUnit, progress, quizScore, quizTotal, homework, remarks, "seed-learning-data"]
        );
        totalContactBooks++;
      }

      console.log(`Created ${Math.min(bookingIds.length, numLessons)} contact books for ${student.name} (grade ${student.grade})`);
    }

    console.log(`\nDone! Created ${newChildren.length} new students and ${totalContactBooks} contact book entries.`);
  } catch (error) {
    console.error("Error seeding learning data:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedLearningData();
