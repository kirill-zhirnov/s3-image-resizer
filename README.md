# S3 Image resizer

Библиотека ресайзит (и выполняет различные манипуляции) с изображениями, 
хранящимися на S3.

# Опции ресайза:

`http://localhost:3010/thumb/<Локальный путь на S3>?mode=scale&max-size=500`

Уменьшит картинку до 500px.

## Модификаторы:

`mode=scale` (required) - режим преобразования. Возможные значения: `scale`.

`max-size=N` (required) - N - максимальный размер. `max-size` считается по большему
значению ширины/высоты. Если ширина больше высоты - то для расчета берется ширина.

`q=low|normal|high` - качество. Разные форматы поддерживают разные режими качества. 
К примеру, png - только low, остальные параметры трактуются как normal.

`ratio=1-1|2-3|3-2|4-5|5-4|3-4|4-3|16-9|9-16` - соотношение сторон. Картинка обрезается,
если не помещается в пропорцию.

`pad=1` - если задано `ratio`, то вместо обрезки изображения, картинка уменьшается, 
до тех пор, пока полностью не поместится в заданную пропорцию. Лишнее место закрашивается
белым цветом, если не задан `bg`.

`bg=hex` - цвет фона - hex код без решетки, 6 символов, например: `ffffff` (см. `pad`).

`grayscale=1` - сделает изображение черно-белым.

`blur=N`, - где N от 0 до 15 - заблюрить изображение. Чем больше значение N - тем более
размыто изображение.

# Скрипты:

1. Очистка кэша изображений, к которым обращались более чем N минут назад:
`npx ts-node ./src/scripts/clearCache.ts --delay=<N в минутах>`

# Cron

```
*/30 * * * * npx ts-node ./src/scripts/clearCache.ts --delay=10
```

# How to build with the Docker?

- Билдим Имейдж:

`docker build -t media-server:node -f ./.docker/Dockerfile .`

- Проверяем, что имейдж есть в списке имейджей:

`docker images | grep media`

- Запускаем контейнер:

`docker run -it --rm -p 3010:3010 media-server:node` 

Контейнер буде доступе по адресу: http://localhost:3010

- Если нужно подключится к контейнеру:

`docker ps` - ищем нужные ID

Подключаемся:

`docker exec -it <ID> /bin/sh`

# How to start with docker compose on production?

`docker compose --env-file .env -f ./.docker/compose-prod.yml up --scale node=2 -d`
`docker compose --env-file .env -f ./.docker/compose.yml up --scale node=2 -d`

To update:

`docker compose --env-file .env -f ./.docker/compose-prod.yml build`
`docker compose --env-file .env -f ./.docker/compose.yml build`

`docker compose --env-file .env -f ./.docker/compose.yml up --scale node=2 -d`

To down:

`docker compose --env-file .env -f ./.docker/compose.yml down`

To test locally use this command:

`docker compose --env-file .env -f ./.docker/compose-prod.yml up --build --scale node=2`

You might need to set env variables `DOCKER_CACHE_VOLUME`, `RUNTIME_PATH` and `COMPOSE_PROJECT_NAME`.
