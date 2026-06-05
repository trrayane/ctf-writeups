FROM php:8.1-apache

# Install PHP extensions
RUN apt-get update && apt-get install -y \
        libonig-dev \
        libzip-dev \
        zip \
    && docker-php-ext-install pdo pdo_mysql mysqli \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache modules
RUN a2enmod rewrite headers

# Copy Apache vhost (build context = bankruptme/ root)
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Deploy application files
COPY --chown=www-data:www-data config /var/www/config
COPY --chown=www-data:www-data src    /var/www/src
COPY --chown=www-data:www-data public /var/www/html

# PHP hardening
RUN { \
    echo "display_errors = Off"; \
    echo "log_errors = On"; \
    echo "expose_php = Off"; \
    echo "session.cookie_httponly = 1"; \
    echo "session.use_strict_mode = 1"; \
} >> /usr/local/etc/php/php.ini

EXPOSE 80
