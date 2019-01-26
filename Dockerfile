# Use minimal Apache
FROM php:7.2-apache

# Certs
ADD .certs/server.crt /etc/apache2/ssl/server.crt
ADD .certs/server.key /etc/apache2/ssl/server.key

# Apache config
ADD .deploy/apache-config.conf /etc/apache2/sites-enabled/000-default.conf

# Enabled modules
RUN a2enmod headers
RUN a2enmod ssl

# Servername config
CMD echo "ServerName www.lmanger.test" >> /etc/apache2/conf-available/servername.conf
CMD a2enconf servername

CMD service apache2 reload
CMD /usr/sbin/apache2ctl -D FOREGROUND
