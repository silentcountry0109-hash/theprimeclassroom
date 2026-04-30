import {
  sendLineFlexMessages,
  buildBookingSuccessFlex,
  buildPreClassReminderFlex,
  buildCourseCancelFlex,
} from "../line";

const LINE_USER_ID = "Uecb97d0ef5b5bfa232d24893c35bfa42";

async function main() {
  console.log("📤 發送三張 Flex Message...");

  const booking = buildBookingSuccessFlex({
    childName: "陳小明",
    date: "2026/05/03（日）",
    time: "10:00 – 11:00",
    teacher: "林老師",
    location: "台北信義分校",
    credits: 5,
  });

  const reminder = buildPreClassReminderFlex({
    childName: "陳小明",
    date: "2026/05/03（日）",
    time: "10:00 – 11:00",
    teacher: "林老師",
    location: "台北信義分校",
    hoursUntil: 2,
  });

  const cancel = buildCourseCancelFlex({
    childName: "陳小明",
    date: "2026/05/03（日）",
    time: "10:00 – 11:00",
    teacher: "林老師",
    credits: 6,
  });

  await sendLineFlexMessages(LINE_USER_ID, [booking, reminder, cancel]);

  console.log("✅ 發送完成！");
}

main().catch(console.error);
