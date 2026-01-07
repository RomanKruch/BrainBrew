export function getMorningGreeting(): string {
  const now = new Date();

  const days = [
    'неділя',
    'понеділок',
    'вівторок',
    'середа',
    'четвер',
    'пʼятниця',
    'субота',
  ];

  const months = [
    'січня',
    'лютого',
    'березня',
    'квітня',
    'травня',
    'червня',
    'липня',
    'серпня',
    'вересня',
    'жовтня',
    'листопада',
    'грудня',
  ];

  const dayName = days[now.getDay()];
  const day = now.getDate();
  const month = months[now.getMonth()];

  return `<b>Доброго ранку!</b> Сьогодні ${dayName}, ${day} ${month}.\n\n`;
}
