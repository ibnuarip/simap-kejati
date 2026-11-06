.PHONY: up down restart build logs logs-app ps bash bash-node bash-db artisan migrate fresh seed rollback tinker key storage routes wayfinder clear cache composer-install composer-update composer-dump lint format types test test-filter test-pest npm-install npm-dev npm-build npm-check npm-types share
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

build:
	docker compose up -d --build

logs:
	docker compose logs -f

logs-app:
	docker compose logs -f app

ps:
	docker compose ps

# ==========================================
# MASUK CONTAINER (SHELL)
# ==========================================
bash:
	docker compose exec app sh

bash-node:
	docker compose exec node sh

bash-db:
	docker compose exec mysql sh -c 'mysql -u root -p$$(grep MYSQL_ROOT_PASSWORD .env.docker | cut -d "=" -f2)'

# ==========================================
# ARTISAN & DATABASE
# ==========================================
artisan:
	docker compose exec app php artisan $(cmd)

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

wayfinder:
	docker compose exec app php artisan wayfinder:generate --with-form

# ==========================================
# CACHE MANAGEMENT
# ==========================================
clear:
	docker compose exec app php artisan cache:clear
	docker compose exec app php artisan config:clear
	docker compose exec app php artisan route:clear
	docker compose exec app php artisan view:clear
	docker compose exec app php artisan event:clear

cache:
	docker compose exec app php artisan config:cache
	docker compose exec app php artisan route:cache
	docker compose exec app php artisan view:cache
	docker compose exec app php artisan event:cache

# ==========================================
# COMPOSER (BACKEND)
# ==========================================
composer-install:
	docker compose exec app composer install

composer-update:
	docker compose exec app composer update

composer-dump:
	docker compose exec app composer dump-autoload

# ==========================================
# QUALITY & TESTING (PHP)
# ==========================================
lint:
	docker compose exec app composer lint:check

format:
	php vendor/bin/pint --parallel

format-check:
	php vendor/bin/pint --parallel --test

types:
	docker compose exec app composer types:check

test:
	php vendor/bin/pest

test-filter:
	php vendor/bin/pest --filter=$(filter)


# ==========================================
# NODE / REACT / FRONTEND
# ==========================================
npm-install:
	docker compose exec node npm ci --no-audit --no-fund

npm-dev:
	docker compose exec node npm run dev

npm-build:
	docker compose exec node npm run build

npm-check:
	docker compose exec node npm run check

npm-types:
	docker compose exec node npm run types:check

# ==========================================
# TEST MOBILE
# ==========================================
share:
	cloudflared tunnel --url http://localhost:8080	