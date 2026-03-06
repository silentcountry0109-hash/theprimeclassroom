import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function simulate() {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    console.log("Cleaning up previous simulation data...");
    await client.query(`
      DELETE FROM credit_transactions WHERE parent_id LIKE 'sim-parent-%'
    `);
    await client.query(`
      DELETE FROM credit_balances WHERE parent_id LIKE 'sim-parent-%'
    `);
    await client.query(`
      DELETE FROM credit_purchases WHERE parent_id LIKE 'sim-parent-%'
    `);
    await client.query(`
      DELETE FROM bookings WHERE parent_id LIKE 'sim-parent-%'
    `);
    await client.query(`
      DELETE FROM time_slots WHERE franchise_id = 9
        AND date >= '2026-02-01' AND date <= '2026-02-28'
        AND coach_id IN (13, 14, 23)
        AND booked_seats > 0
        AND id NOT IN (SELECT slot_id FROM bookings WHERE parent_id NOT LIKE 'sim-parent-%')
    `);
    await client.query(`
      DELETE FROM children WHERE parent_id LIKE 'sim-parent-%'
    `);
    console.log("Cleanup complete.");

    const coachRows = await client.query(
      "SELECT id, name, compensation_type, compensation_amount FROM coaches WHERE id IN (13, 14, 23)"
    );
    const coachMap = new Map(coachRows.rows.map((c: any) => [c.id, c]));
    console.log("Coaches:", coachRows.rows.map((c: any) => `${c.name} (${c.compensation_type} $${c.compensation_amount})`).join(", "));

    const parentIds: string[] = [];
    const childIds: number[] = [];

    const studentNames = [
      "王小明", "李小華", "張雅婷", "陳建宏", "林怡君",
      "黃柏翰", "劉美玲", "吳宗翰", "蔡佳蓉", "許家豪",
      "鄭雨涵", "楊承恩", "周子晴", "徐浩宇", "蕭心怡",
      "高文彬", "潘雅琪", "曹俊傑", "葉思妤", "魏冠廷",
    ];

    for (let i = 1; i <= 8; i++) {
      const parentId = `sim-parent-${i}`;
      const username = `sim-parent${i}`;

      const existing = await client.query("SELECT id FROM users WHERE id = $1", [parentId]);
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO users (id, username, password_hash, first_name, email, role)
           VALUES ($1, $2, $3, $4, $5, 'parent')`,
          [parentId, username, "$2b$10$placeholder", `模擬家長${i}`, `sim${i}@test.tw`]
        );
      }
      parentIds.push(parentId);

      const childCount = 2 + Math.floor(Math.random() * 2);
      for (let j = 0; j < childCount; j++) {
        const nameIdx = (i - 1) * 3 + j;
        const name = studentNames[nameIdx % studentNames.length];
        const grade = 1 + Math.floor(Math.random() * 6);
        const gender = Math.random() > 0.5 ? "male" : "female";
        const code = `2026${String(i).padStart(2, "0")}${String(j + 10).padStart(2, "0")}${String(Math.floor(Math.random() * 9000) + 1000)}`;

        const res = await client.query(
          `INSERT INTO children (parent_id, name, gender, grade, school, student_code)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [parentId, name, gender, grade, "模擬國小", code]
        );
        childIds.push(res.rows[0].id);
      }
    }
    console.log(`Created ${parentIds.length} parents, ${childIds.length} children`);

    const coachIds = [13, 14, 23];
    const sessionTimes = [
      { start: "09:00", end: "10:00" },
      { start: "10:30", end: "11:30" },
      { start: "14:00", end: "15:00" },
      { start: "15:30", end: "16:30" },
    ];

    const workingDays: string[] = [];
    for (let d = 1; d <= 28; d++) {
      const date = new Date(2026, 1, d);
      const dow = date.getDay();
      if (dow !== 0 && dow !== 6) {
        workingDays.push(`2026-02-${String(d).padStart(2, "0")}`);
      }
    }
    const selectedDays = workingDays.slice(0, 20);
    console.log(`Working days: ${selectedDays.length}`);

    let totalSlots = 0;
    let totalBookings = 0;
    let totalCreditsUsed = 0;

    for (const coachId of coachIds) {
      const coach = coachMap.get(coachId);

      for (const day of selectedDays) {
        const sessionsToday = 2 + Math.floor(Math.random() * 2);
        const todaySessions = sessionTimes.slice(0, sessionsToday);

        for (const session of todaySessions) {
          const maxSeats = 5;
          const studentCount = 2 + Math.floor(Math.random() * 4);

          const slotRes = await client.query(
            `INSERT INTO time_slots (franchise_id, coach_id, date, start_time, end_time, max_seats, booked_seats, is_active)
             VALUES (9, $1, $2, $3, $4, $5, $6, true) RETURNING id`,
            [coachId, day, session.start, session.end, maxSeats, studentCount]
          );
          const slotId = slotRes.rows[0].id;
          totalSlots++;

          const shuffled = [...childIds].sort(() => Math.random() - 0.5);
          const selectedStudents = shuffled.slice(0, studentCount);

          for (const childId of selectedStudents) {
            const childRow = await client.query("SELECT parent_id FROM children WHERE id = $1", [childId]);
            const parentId = childRow.rows[0].parent_id;

            const bookingRes = await client.query(
              `INSERT INTO bookings (slot_id, child_id, parent_id, status)
               VALUES ($1, $2, $3, 'completed') RETURNING id`,
              [slotId, childId, parentId]
            );
            const bookingId = bookingRes.rows[0].id;
            totalBookings++;
            totalCreditsUsed++;
          }
        }
      }
      console.log(`Coach ${coach.name}: slots created`);
    }

    console.log(`Total: ${totalSlots} slots, ${totalBookings} bookings`);

    const creditPerParent: Record<string, number> = {};
    const bookingRows = await client.query(
      `SELECT b.id, b.parent_id FROM bookings b
       JOIN time_slots ts ON b.slot_id = ts.id
       WHERE ts.franchise_id = 9 AND ts.date >= '2026-02-01' AND ts.date <= '2026-02-28'
       AND b.status = 'completed' AND b.parent_id LIKE 'sim-parent-%'`
    );

    for (const row of bookingRows.rows) {
      creditPerParent[row.parent_id] = (creditPerParent[row.parent_id] || 0) + 1;
    }

    const purchaseMap: Record<string, { purchaseId: number; balanceId: number }> = {};

    for (const [parentId, credits] of Object.entries(creditPerParent)) {
      const finalAmount = credits * 600;

      const purchaseRes = await client.query(
        `INSERT INTO credit_purchases (parent_id, package_id, credits, original_amount, discount_amount, final_amount, payment_status, payment_method)
         VALUES ($1, NULL, $2, $3, 0, $4, 'paid', 'simulation') RETURNING id`,
        [parentId, credits, finalAmount, finalAmount]
      );
      const purchaseId = purchaseRes.rows[0].id;

      const balanceRes = await client.query(
        `INSERT INTO credit_balances (parent_id, purchase_id, original_credits, remaining_credits, expires_at)
         VALUES ($1, $2, $3, 0, '2027-02-28') RETURNING id`,
        [parentId, purchaseId, credits]
      );
      const balanceId = balanceRes.rows[0].id;

      purchaseMap[parentId] = { purchaseId, balanceId };
    }

    for (const row of bookingRows.rows) {
      const { balanceId } = purchaseMap[row.parent_id];

      await client.query(
        `INSERT INTO credit_transactions (parent_id, type, credits, balance_id, booking_id, description)
         VALUES ($1, 'deduct', -1, $2, $3, '模擬課程扣除 1 堂')`,
        [row.parent_id, balanceId, row.id]
      );
    }

    console.log(`Created credit purchases and ${bookingRows.rows.length} deduction transactions`);

    await client.query("COMMIT");

    console.log("\n=== 模擬結果摘要 ===");
    console.log(`時段數: ${totalSlots}`);
    console.log(`預約數: ${totalBookings}`);
    console.log(`總課消: ${totalBookings} 堂`);
    console.log(`總營收: $${totalBookings * 600}`);

    for (const coachId of coachIds) {
      const coach = coachMap.get(coachId);
      const coachBookings = await client.query(
        `SELECT COUNT(*) as cnt FROM bookings b
         JOIN time_slots ts ON b.slot_id = ts.id
         WHERE ts.coach_id = $1 AND ts.date >= '2026-02-01' AND ts.date <= '2026-02-28'
         AND b.status = 'completed'`,
        [coachId]
      );
      const lessons = parseInt(coachBookings.rows[0].cnt);
      const revenue = lessons * 600;
      let pay: number;
      if (coach.compensation_type === "fixed") {
        pay = coach.compensation_amount * lessons;
      } else {
        pay = revenue * coach.compensation_amount / 100;
      }
      console.log(`${coach.name}: ${lessons} 堂, 營收 $${revenue}, 薪資 $${pay}`);
    }

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

simulate().then(() => {
  console.log("\nDone!");
  process.exit(0);
}).catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
