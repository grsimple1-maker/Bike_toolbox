# Деплой BikeWrench на Vercel

## Способ 1 — через GitHub (рекомендуется)

### Шаг 1: Залить на GitHub
```bash
cd bike-toolbox
git init
git add .
git commit -m "initial commit"
```
Зайди на github.com → New repository → назови `bike-toolbox` → Create
```bash
git remote add origin https://github.com/ТВО_ИМЯПОЛЬЗОВАТЕЛЯ/bike-toolbox.git
git branch -M main
git push -u origin main
```

### Шаг 2: Подключить Vercel
1. Зайди на **vercel.com** → Sign up (через GitHub)
2. Нажми **"Add New Project"**
3. Выбери репозиторий `bike-toolbox`
4. Vercel сам определит что это Vite проект
5. Настройки оставь по умолчанию:
   - Framework: **Vite**
   - Build command: `npm run build`
   - Output dir: `dist`
6. Нажми **Deploy**

Через ~30 секунд сайт живёт на `https://bike-toolbox-xxx.vercel.app`

---

## Способ 2 — через Vercel CLI (без GitHub)

```bash
# Установи Vercel CLI
npm install -g vercel

# В папке проекта
cd bike-toolbox
vercel

# Следуй инструкциям:
# ? Set up and deploy? → Y
# ? Which scope? → твой аккаунт
# ? Link to existing project? → N
# ? Project name → bike-toolbox
# ? Directory → ./
# → Detected Vite framework, автоматически
```

Готово — получишь ссылку вида `https://bike-toolbox.vercel.app`

---

## Свой домен (необязательно)

1. В Vercel → Project Settings → Domains
2. Добавь домен типа `bikewrench.app`
3. Vercel покажет DNS записи — добавь их у регистратора
4. Через 5-10 минут сайт доступен по своему домену

Домен можно купить на **namecheap.com** (~$10/год для .app)

---

## Обновление сайта

После изменений в коде:
```bash
# Если через GitHub:
git add .
git commit -m "обновление"
git push
# Vercel автоматически передеплоит за ~30 сек

# Если через CLI:
vercel --prod
```

---

## Проверь перед деплоем

```bash
npm run build   # должно собраться без ошибок
npm run preview # открой localhost:4173 и проверь всё
```
