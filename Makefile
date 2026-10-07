# DOCKER

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

build:
	docker compose up -d --build

logs:
	docker compose logs -f

ps:
	docker compose ps

# MASUK CONTAINER

bash:
	docker compose exec app bash

bash-node:
	docker compose exec node sh

bash-db:
	bash-db:
	docker compose exec mysql mysql -u root -p$$(grep MYSQL_ROOT_PASSWORD .env.docker | cut -d '=' -f2)

# ARTISAN
migrate:
	docker compose exec app php artisan migrate

fresh:
	docker compose exec app php artisan migrate:fresh --seed

seed:
	docker compose exec app php artisan db:seed

rollback:
	docker compose exec app php artisan migrate:rollback

tinker:
	docker compose exec app php artisan tinker

key:
	docker compose exec app php artisan key:generate

storage:
	docker compose exec app php artisan storage:link

routes:
	docker compose exec app php artisan route:list

# CACHE
clear:
	docker compose exec app php artisan cache:clear
	docker compose exec app php artisan config:clear
	docker compose exec app php artisan route:clear
	docker compose exec app php artisan view:clear

cache:
	docker compose exec app php artisan config:cache
	docker compose exec app php artisan route:cache
	docker compose exec app php artisan view:cache

# COMPOSER
composer-install:
	docker compose exec app composer install

composer-update:
	docker compose exec app composer update

composer-dump:
	docker compose exec app composer dump-autoload

# NODE / REACT
npm-install:
	docker compose exec node npm ci --no-audit --no-fund

dev:
	docker compose exec node npm run dev -- --host 0.0.0.0

build-assets:
	docker compose exec node npm run build

# TEST
test:
	docker compose exec app php artisan test

test-filter:
	docker compose exec app php artisan test --filter=$(filter)