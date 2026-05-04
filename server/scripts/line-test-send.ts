import {
  sendLineFlexMessages,
  buildBookingSuccessFlex,
  buildRecurringBookingFlex,
  buildCourseCancelFlex,
  buildPreClassReminderFlex,
  buildManualBookingFlex,
  buildContactBookFlex,
} from "../line";

const LINE_USER_ID = "Uecb97d0ef5b5bfa232d24893c35bfa42";

(async () => {
  console.log("\n📨 正在發送所有通知情境（Flex Message 版本）…\n");

  const messages = [
    buildBookingSuccessFlex({
      childName: "陳小明",
      date: "2026/05/03（日）",
      time: "10:00–11:00",
      teacher: "林老師",
      location: "台北信義分校",
      credits: 5,
    }),
    buildRecurringBookingFlex({
      childName: "陳小明",
      totalCount: 3,
      slots: ["2026/05/03 10:00–11:00", "2026/05/10 10:00–11:00", "2026/05/17 10:00–11:00"],
      moreCount: 0,
      credits: 3,
    }),
    buildCourseCancelFlex({
      childName: "陳小明",
      date: "2026/05/03（日）",
      time: "10:00–11:00",
      teacher: "林老師",
      credits: 6,
    }),
    buildPreClassReminderFlex({
      childName: "陳小明",
      date: "2026/05/03",
      time: "10:00–11:00",
      teacher: "林老師",
      location: "台北信義分校",
      hoursUntil: 2,
    }),
    buildManualBookingFlex({
      childName: "陳小明",
      date: "2026/05/10（日）",
      time: "14:00–15:00",
      teacher: "林老師",
      location: "台北信義分校",
    }),
    buildContactBookFlex({
      childName: "陳小明",
      teacher: "林老師",
      date: "2026/05/03",
    }),
  ];

  await sendLineFlexMessages(LINE_USER_ID, messages);
  console.log("\n✅ 全部完成（共 6 種通知情境）");
})();
