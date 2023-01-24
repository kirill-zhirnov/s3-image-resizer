# Optimize and resize images in S3 on the fly (Crop and Thumbnail)

This is a service which generates thumbnails for S3 images in real time. 
It is a Node JS server, which fetches a source image from a S3 server, reads resize options from the URL, 
generate thumbnail and returns to a client.

The service is ready to be launched with Docker. Under the hood, it uses Imagick as a resize engine.

## Resize options

`http://localhost:3000/thumb/<local path on the S3>?mode=scale&max-size=500` - generates a thumbnail with max size 500px.

### Query params:

`mode=scale` (**required**) - Mode. Currently, it supports only one mode - `scale`.

`max-size=N` (**required**) - Where `N` is a maximum size (`INT`). The size is calculated by the greatest value of width 
or height. E.g. if the width is greater than the height - the width will be used for the size calculation.

`q=low|normal|high` - Quality. Different formats support different quality modes. If a format doesn't support a quality 
parameter - the `normal` value will be used (so you can pass it regardless of format).

`ratio=1-1|2-3|3-2|4-5|5-4|3-4|4-3|16-9|9-16` - Aspect ratio. An image will be cropped if necessary. If you want you 
can specify `pad` (see below) to use a pad resizer strategy.

`pad=1` - if the `ratio` is specified you can add the `pad` - in this case an image is scaled down to fit in a shape. 
Empty spaces are filled with `bg` color (white by default).

`bg=hex` - background color (If the `pad` strategy is used.) - HEX code - 6 symbols, e.g.: `ffffff`

`grayscale=1` - Makes an image grayscale.

`blur=N`, - Blur. N is in the range of 0-15, where 15 gets the maximum blurred effect.

## How to run with the Docker?

1. Copy `.env.example` to `.env`
2. Fill S3 credentials and **uncomment** `RUNTIME_PATH`
3. `docker compose --env-file .env -f ./.docker/compose.yml up --scale node=2 -d` - it runs service on `8080` port.
4. To update: `docker compose --env-file .env -f ./.docker/compose.yml build` - builds images, then run: `docker compose --env-file .env -f ./.docker/compose.yml up --scale node=2 -d`
5. To down: `docker compose --env-file .env -f ./.docker/compose.yml down`


## How to start locally?

1. Copy `.env.example` to `.env`
2. Fill S3 credentials.
3. Specify paths to Imagick: `IM_CONVERT` and `IM_IDENTIFY`. You might also need to adjust `PORT`.
4. Change `NODE_ENV=development`
5. Install dependencies: `yarn install`
6. `yarn dev`

## How to clear cache folder?

You might need to clear cache folder:

`node ./build/scripts/clearCache.ts --delay=<N minutes>` 

Or ts version: `npx ts-node ./src/scripts/clearCache.ts --delay=<delay>`

---

![Boundless-commerce.com](assets/logo.svg)

[Boundless-commerce.com](https://boundless-commerce.com/) - API’s First Headless E-commerce CMS: We Provide An
Admin-Side For Store Management, Powerful API, And Ready-To-Use Checkout Area.

[Free NextJS eCommerce templates](https://boundless-commerce.com/templates) - Free. Ready to use. Just clone & deploy!