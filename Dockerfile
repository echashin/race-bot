# Установка базового образа Node.js
FROM node:22-alpine

# Создание директории приложения
WORKDIR /usr/src/app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка приложения (если требуется)
RUN npm run build

# Порт, который будет использоваться
EXPOSE 3000

# Команда для запуска приложения
CMD ["npm", "run", "start:prod"]