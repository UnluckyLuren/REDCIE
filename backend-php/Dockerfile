FROM php:8.3-fpm-alpine

# 1. Dependencias del sistema y herramientas de compilación (autoconf, gcc, make)
RUN apk add --no-cache \
    $PHPIZE_DEPS \
    linux-headers \
    libzip-dev \
    oniguruma-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    icu-dev

# 2. Instalar extensiones nativas de PHP
RUN docker-php-ext-install \
    pdo_mysql \
    zip \
    mbstring \
    intl \
    bcmath \
    opcache

# 3. Compilar e instalar Redis para PHP
RUN pecl install redis && docker-php-ext-enable redis

# 4. Habilitar sodium (para Argon2 nativo en PHP 8.3)
RUN docker-php-ext-enable sodium

# 5. Limpiar dependencias de compilación para aligerar la imagen final
RUN apk del $PHPIZE_DEPS linux-headers

# 6. Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# 8. Copiar archivos de dependencias e instalarlas
COPY composer.json composer.lock* ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

# 9. Copiar el resto del código
COPY . .

# 10. Permisos para Nginx/PHP-FPM
RUN chown -R www-data:www-data /var/www/public \
    && chmod -R 755 /var/www/public

EXPOSE 9000
CMD ["php-fpm"]
