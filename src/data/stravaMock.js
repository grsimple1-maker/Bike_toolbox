// Моковые данные — структура 1:1 с реальным Strava API
export const ATHLETE = {
  id: 12345678,
  firstname: 'Алексей',
  lastname: 'Rider',
  city: 'Semey',
  country: 'Kazakhstan',
  profile: null,
  stats: {
    all_ride_totals: { count: 187, distance: 4823000, moving_time: 682400, elevation_gain: 38200 },
    ytd_ride_totals:  { count: 43,  distance: 1124000, moving_time: 158600, elevation_gain: 8900 },
    recent_ride_totals: { count: 8, distance: 198000,  moving_time: 27800,  elevation_gain: 1420 },
  }
}

// Последние 20 активностей
const now = Date.now()
const DAY = 86400000

export const ACTIVITIES = [
  { id: 1, name: 'Утренняя покатушка', type: 'Ride', distance: 32400, moving_time: 4320, elapsed_time: 4600, total_elevation_gain: 210, average_speed: 7.5, max_speed: 12.3, average_heartrate: 142, max_heartrate: 168, average_watts: 187, start_date: new Date(now - 1*DAY).toISOString(), achievement_count: 2, kudos_count: 14 },
  { id: 2, name: 'Вечерний шоссе',     type: 'Ride', distance: 58700, moving_time: 6840, elapsed_time: 7200, total_elevation_gain: 380, average_speed: 8.58, max_speed: 14.1, average_heartrate: 155, max_heartrate: 178, average_watts: 224, start_date: new Date(now - 3*DAY).toISOString(), achievement_count: 5, kudos_count: 23 },
  { id: 3, name: 'MTB в лесу',         type: 'Ride', distance: 24100, moving_time: 5400, elapsed_time: 5900, total_elevation_gain: 520, average_speed: 4.46, max_speed: 9.8,  average_heartrate: 161, max_heartrate: 182, average_watts: 198, start_date: new Date(now - 5*DAY).toISOString(), achievement_count: 1, kudos_count: 8  },
  { id: 4, name: 'Темп-интервалы',     type: 'Ride', distance: 41200, moving_time: 4200, elapsed_time: 4350, total_elevation_gain: 140, average_speed: 9.81, max_speed: 15.2, average_heartrate: 168, max_heartrate: 185, average_watts: 261, start_date: new Date(now - 7*DAY).toISOString(), achievement_count: 8, kudos_count: 31 },
  { id: 5, name: 'Восстановление',     type: 'Ride', distance: 18900, moving_time: 3600, elapsed_time: 3720, total_elevation_gain: 80,  average_speed: 5.25, max_speed: 8.4,  average_heartrate: 118, max_heartrate: 138, average_watts: 134, start_date: new Date(now - 9*DAY).toISOString(), achievement_count: 0, kudos_count: 5  },
  { id: 6, name: 'Длинная воскресная', type: 'Ride', distance: 97300, moving_time: 13200,elapsed_time:13800, total_elevation_gain: 820, average_speed: 7.37, max_speed: 13.6, average_heartrate: 148, max_heartrate: 172, average_watts: 201, start_date: new Date(now -11*DAY).toISOString(), achievement_count: 3, kudos_count: 42 },
  { id: 7, name: 'Спринты',            type: 'Ride', distance: 28600, moving_time: 3000, elapsed_time: 3200, total_elevation_gain: 95,  average_speed: 9.53, max_speed: 17.8, average_heartrate: 172, max_heartrate: 191, average_watts: 289, start_date: new Date(now -13*DAY).toISOString(), achievement_count: 11,kudos_count: 27 },
  { id: 8, name: 'Гравел-приключение', type: 'Ride', distance: 74500, moving_time: 10800,elapsed_time:11400, total_elevation_gain: 1240,average_speed: 6.89, max_speed: 11.2, average_heartrate: 152, max_heartrate: 176, average_watts: 211, start_date: new Date(now -16*DAY).toISOString(), achievement_count: 4, kudos_count: 38 },
  { id: 9, name: 'Городская прогулка', type: 'Ride', distance: 15200, moving_time: 2700, elapsed_time: 3100, total_elevation_gain: 45,  average_speed: 5.63, max_speed: 9.1,  average_heartrate: 121, max_heartrate: 141, average_watts: 142, start_date: new Date(now -18*DAY).toISOString(), achievement_count: 0, kudos_count: 9  },
  { id:10, name: 'Клубный выезд',      type: 'Ride', distance: 86400, moving_time: 9600, elapsed_time:10200, total_elevation_gain: 610, average_speed: 9.0,  max_speed: 14.8, average_heartrate: 158, max_heartrate: 180, average_watts: 238, start_date: new Date(now -21*DAY).toISOString(), achievement_count: 6, kudos_count: 55 },
  { id:11, name: 'Утро вторника',      type: 'Ride', distance: 27300, moving_time: 3480, elapsed_time: 3600, total_elevation_gain: 160, average_speed: 7.84, max_speed: 11.9, average_heartrate: 144, max_heartrate: 165, average_watts: 195, start_date: new Date(now -23*DAY).toISOString(), achievement_count: 1, kudos_count: 12 },
  { id:12, name: 'Горная вылазка',     type: 'Ride', distance: 52100, moving_time: 8400, elapsed_time: 9000, total_elevation_gain: 1680,average_speed: 6.2,  max_speed: 10.4, average_heartrate: 163, max_heartrate: 186, average_watts: 226, start_date: new Date(now -26*DAY).toISOString(), achievement_count: 7, kudos_count: 49 },
]

// Статистика по неделям (последние 8 недель)
export const WEEKLY_STATS = [
  { week: '7 нед. назад', distance: 89, time: 720,  rides: 3 },
  { week: '6 нед. назад', distance: 134, time: 980,  rides: 4 },
  { week: '5 нед. назад', distance: 67,  time: 540,  rides: 2 },
  { week: '4 нед. назад', distance: 198, time: 1440, rides: 5 },
  { week: '3 нед. назад', distance: 156, time: 1140, rides: 4 },
  { week: '2 нед. назад', distance: 221, time: 1680, rides: 6 },
  { week: 'Прошлая',      distance: 183, time: 1320, rides: 5 },
  { week: 'Эта неделя',   distance: 91,  time: 660,  rides: 3 },
]

// Личные рекорды
export const RECORDS = [
  { name: 'Макс. скорость',    value: '67.3', unit: 'км/ч', icon: '⚡', date: '12 мар 2025' },
  { name: 'Самая длинная',     value: '142',  unit: 'км',   icon: '📏', date: '3 авг 2024'  },
  { name: 'Макс. набор/день',  value: '2840', unit: 'м',    icon: '⛰️', date: '15 июл 2024' },
  { name: 'Лучший FTP',        value: '312',  unit: 'Вт',   icon: '💪', date: '1 окт 2024'  },
  { name: 'Самая быстрая 10км',value: '18:42',unit: '',     icon: '🏁', date: '22 апр 2025' },
]
