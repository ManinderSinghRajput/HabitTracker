export const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayStr = () => fmtDate(new Date());

export const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const daysBetween = (a: Date, b: Date) =>
  Math.round((+b - +a) / 86400000);

export const startOfWeek = (d: Date, firstDay: 0 | 1 = 1) => {
  const r = new Date(d);
  const diff = (r.getDay() - firstDay + 7) % 7;
  r.setDate(r.getDate() - diff);
  r.setHours(0, 0, 0, 0);
  return r;
};

export const sameDay = (a: Date, b: Date) => fmtDate(a) === fmtDate(b);

export const weekdayShort = (d: Date) =>
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];

export const monthShort = (d: Date) =>
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
    d.getMonth()
  ];

export const longDate = (d: Date) =>
  `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()]}`;

export const fullDate = (d: Date) =>
  `${d.getDate()} ${['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()]} ${d.getFullYear()}`;
