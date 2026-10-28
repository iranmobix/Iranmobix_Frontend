import type {
  PanelTicketApi,
  PanelTicketStatus,
} from "../types/panel-ticket.types";
const statuses: PanelTicketStatus[] = [
  "processing",
  "answered",
  "resolved",
  "suspended",
  "closed",
];
export const panelTicketsMock: PanelTicketApi[] = statuses.map(
  (status, index) => ({
    id: "sample-ticket-" + (index + 1),
    code: String(145456 + index),
    title: "مشکل در پرداخت",
    message: "هنگام پرداخت سفارش با مشکل مواجه شده‌ام. لطفاً راهنمایی کنید.",
    created_at: "2025-08-19T12:00:00+03:30",
    status,
    attachment: null,
    messages: [
      {
        id: "customer-" + index,
        author: "customer",
        author_name: "زهرا جان نثاری",
        body: "بنده امروز ساعت حدود ۱۴:۳۰ مبلغ سفارش را از طریق درگاه بانک پرداخت کردم، اما از حساب بانکی‌ام کسر شده ولی سفارش در پنل کاربری هنوز وضعیت پرداخت‌نشده نمایش داده می‌شود. لطفاً پیگیری کنید.\n\nشماره سفارش: ۱۰۴۳۲\nمبلغ پرداختی: ۵۰۰٬۰۰۰ تومان\n\nلطفاً موضوع را بررسی کنید و در صورت امکان وضعیت سفارش را تأیید کنید تا مبلغ به حساب برنگردد.",
        sent_at: "2025-08-19T14:35:00+03:30",
        attachment: null,
      },
      {
        id: "support-" + index,
        author: "support",
        author_name: "کارشناس — محدثه امینی",
        body: "با سلام و وقت بخیر سرکار خانم جان نثاری\n\nبابت این مشکل عذرخواهی می‌کنیم و از صبوری شما سپاسگزاریم.\n\nبا بررسی اولیه مشخص شد تراکنش با موفقیت ثبت شده است، اما به دلیل تأخیر در دریافت تأییدیه از درگاه، وضعیت سفارش هنوز به‌روزرسانی نشده است. تیم پشتیبانی در حال پیگیری موضوع است.\n\nدر صورتی که مبلغ به حساب شما برگشت داده نشود، وضعیت سفارش پس از تأیید نهایی اصلاح خواهد شد. لطفاً تا پایان بررسی، از پرداخت مجدد خودداری کنید.\n\nبا احترام\nواحد پشتیبانی مشتریان",
        sent_at: "2025-08-19T14:45:00+03:30",
        attachment: null,
      },
    ],
  }),
);
