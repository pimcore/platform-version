# Nginx Configuration

Nginx is a popular alternative to Apache for hosting Pimcore and generally delivers strong performance. This section provides working Nginx configurations for development and production environments.

## Configuration

Below is the configuration for an Nginx server (the `server` block only; the `http` block can use defaults as long as `mime.types` are included).

Assumptions - adjust these to match your environment:

- Pimcore is installed at `/var/www/pimcore`; the document root is `/var/www/pimcore/public`.
- Log files are written to `/var/log/nginx`. To co-locate them with Pimcore logs, use `/var/www/pimcore/var/log`.
- PHP-FPM listens on the socket `/var/run/php/pimcore.sock`. Update the `server` directive in the `upstream` block if your setup differs.
- Before changing the order of `location` blocks, read [Understanding Nginx Server and Location Block Selection Algorithms](https://www.digitalocean.com/community/tutorials/understanding-nginx-server-and-location-block-selection-algorithms).
- Asset expiration is set to 14 days; adjust `expires` directives as needed.
- Assets are stored locally, not on a remote storage like S3 or GCS. If they are remote, see the Assets section in the configuration below.

### Development Environment

The following configuration is intended for development only. It is not appropriate for production and should not be exposed to public access.

```nginx
# mime types are already covered in nginx.conf
#include mime.types;

upstream php-pimcore {
    server unix:/var/run/php/pimcore.sock;
}

map $args $static_page_root {
    default                                 /var/tmp/pages;
    "~*(^|&)pimcore_editmode=true(&|$)"     /var/nonexistent;
    "~*(^|&)pimcore_preview=true(&|$)"      /var/nonexistent;
    "~*(^|&)pimcore_version=[^&]+(&|$)"     /var/nonexistent;
}

map $uri $static_page_uri {
    default                                 $uri;
    "/"                                     /%home;
}

server {
    listen 80;
    listen [::]:80;
    server_name YOURPROJECT.local;
    root /var/www/pimcore/public;
    index index.php;

    # Filesize depending on your data
    client_max_body_size 100m;

    # It is recommended to seclude logs per virtual host
    access_log  /var/log/access.log;
    error_log   /var/log/error.log error;

    # Protected Assets
    #
    ### 1. Option - Restricting access to certain assets completely
    #
    # location ~ ^/protected/.* {
    #   return 403;
    # }
    # location ~ ^/var/.*/protected(.*) {
    #   return 403;
    # }
    #
    # location ~ ^/cache-buster\-[\d]+/protected(.*) {
    #   return 403;
    # }
    #
    ### 2. Option - Checking permissions before delivery
    #
    # rewrite ^(/protected/.*) /index.php$is_args$args last;
    #
    # location ~ ^/var/.*/protected(.*) {
    #   return 403;
    # }
    #
    # location ~ ^/cache-buster\-[\d]+/protected(.*) {
    #   return 403;
    # }

    # Pimcore Head-Link Cache-Busting
    rewrite ^/cache-buster-(?:\d+)/(.*) /$1 last;

    # Stay secure
    #
    # a) don't allow PHP in folders allowing file uploads
    location ~* /var/assets/.*\.php(/|$) {
        return 404;
    }
    # b) Prevent clients from accessing hidden files (starting with a dot)
    # Access to `/.well-known/` is allowed.
    # https://www.mnot.net/blog/2010/04/07/well-known
    # https://tools.ietf.org/html/rfc5785
    location ~* /\.(?!well-known/) {
        deny all;
        log_not_found off;
        access_log off;
    }
    # c) Prevent clients from accessing backup/config/source files
    location ~* (?:\.(?:bak|conf(ig)?|dist|fla|in[ci]|log|psd|sh|sql|sw[op])|~)$ {
        deny all;
    }

    # Some Admin Modules need this:
    # Server Info, Opcache
    location ~* ^/admin/external {
        rewrite .* /index.php$is_args$args last;
    }

    # Thumbnails
    location ~* .*/(image|video)-thumb__\d+__.* {
        try_files /var/tmp/thumbnails$uri /index.php;
        expires 2w;
        access_log off;
        add_header Cache-Control "public";
    }

    # Assets
    # Still use an allowlist approach to prevent each and every missing asset to go through the PHP Engine.
    # If you are using remote storages like S3 or Google Cloud Storage, this doesn't work. You either deactivate it and handle it in PHP
    # or redirect these suffixes directly to your CDN URL. Additionally you should configure the frontend url prefixes accordingly, see: File Storage Setup
    location ~* ^(?!/admin|/asset/webdav)(.+?)\.((?:css|js)(?:\.map)?|jpe?g|gif|png|svgz?|eps|exe|gz|zip|mp\d|m4a|ogg|ogv|webp|webm|pdf|docx?|xlsx?|pptx?)$ {
        try_files /var/assets$uri $uri =404;
        expires 2w;
        access_log off;
        log_not_found off;
        add_header Cache-Control "public";
    }

    location / {
        error_page 404 /meta/404;
        try_files $static_page_root$static_page_uri.html $uri /index.php$is_args$args;
    }

    # Use this location when the installer has to be run
    # location ~ /(index|install)\.php(/|$) {
    #
    # Use this after initial install is done:
    location ~ ^/index\.php(/|$) {
        send_timeout 1800;
        fastcgi_read_timeout 1800;
        # regex to split $uri to $fastcgi_script_name and $fastcgi_path_info
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        # Check that the PHP script exists before passing it
        try_files $fastcgi_script_name =404;
        # include fastcgi.conf if needed
        include fastcgi.conf;
        # Bypass the fact that try_files resets $fastcgi_path_info
        # see: http://trac.nginx.org/nginx/ticket/321
        set $path_info $fastcgi_path_info;
        fastcgi_param PATH_INFO $path_info;

        # Activate these, if using Symlinks and opcache
        # fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        # fastcgi_param DOCUMENT_ROOT $realpath_root;

        fastcgi_pass php-pimcore;
        # Prevents URIs that include the front controller. This will 404:
        # http://domain.tld/index.php/some-path
        # Remove the internal directive to allow URIs like this
        internal;
    }

    # PHP-FPM Status and Ping
    location /fpm- {
        access_log off;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        location /fpm-status {
            allow 127.0.0.1;
            # add additional IP's or Ranges
            deny all;
            fastcgi_pass php-pimcore;
        }
        location /fpm-ping {
            fastcgi_pass php-pimcore;
        }
    }
    # nginx Status
    # see: https://nginx.org/en/docs/http/ngx_http_stub_status_module.html
    location /nginx-status {
        allow 127.0.0.1;
        deny all;
        access_log off;
        stub_status;
    }
}
```

### Production Environment

The following configuration provides a secure base for production hosting. Adapt it to your setup and preferences.

```nginx
# mime types are already covered in nginx.conf
#include mime.types;

upstream php-pimcore {
    server unix:/var/run/php/pimcore.sock;
}

map $args $static_page_root {
    default                                 /var/tmp/pages;
    "~*(^|&)pimcore_editmode=true(&|$)"     /var/nonexistent;
    "~*(^|&)pimcore_preview=true(&|$)"      /var/nonexistent;
    "~*(^|&)pimcore_version=[^&]+(&|$)"     /var/nonexistent;
}

map $uri $static_page_uri {
    default                                 $uri;
    "/"                                     /%home;
}

server {
    listen 80;
    listen [::]:80;

    server_name YOURPROJECT.local;

    root /var/www/pimcore/public;

    # Accept .well-known for ACME challenges (e.g. Let's Encrypt)
    # Everything else redirects to HTTPS
    location ~* /\.well-known/ {
      try_files $uri /;
    }

    location / {
       return 301 https://$host$request_uri;
    }
}

# SSL configuration as recommended as "intermediate" by Mozilla
# See: https://ssl-config.mozilla.org/

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name YOURPROJECT.local;

    root /var/www/pimcore/public;
    index index.php;

    # SSL Certificate and Key
    ssl_certificate   /etc/letsencrypt/live/YOURPROJECT.local/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOURPROJECT.local/privkey.pem;

    # Verify security afterwards with https://ssllabs.com
    ### SSL Configuration
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozSSL:10m;  # about 40000 sessions
    ssl_session_tickets off;

    # Generate DH parameters:
    # curl https://ssl-config.mozilla.org/ffdhe2048.txt > /etc/ssl/dhparam.pem
    ssl_dhparam /etc/ssl/dhparam.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS (ngx_http_headers_module is required) (63072000 seconds)
    add_header Strict-Transport-Security "max-age=63072000" always;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;

    # Verify chain of trust of OCSP response using Root CA and Intermediate certs
    ssl_trusted_certificate /etc/ssl/letsencrypt.ca-bundle.pem;

    # Replace with the IP address of your resolver
    resolver 127.0.0.1;
    ### SSL Configuration

    # HTTP security headers
    # Verify security with https://securityheaders.com/
    server_tokens off;

    # Set CSP - evaluate and adjust for your application
    add_header Content-Security-Policy "default-src 'self';" always;

    # Referrer Policy
    add_header Referrer-Policy same-origin;

    # Permissions Policy
    add_header Permissions-Policy "geolocation=(), midi=(), sync-xhr=(), microphone=(), camera=(), magnetometer=(), gyroscope=(), fullscreen=(self), payment=()";

    # set X-Frame-Options
    add_header X-Frame-Options "SAMEORIGIN" always;

    # set Xss-Protection
    add_header X-Xss-Protection "1; mode=block" always;

    # X-Content-Type-Options
    add_header X-Content-Type-Options "nosniff" always;
    ### HTTP Header security

    # Filesize depending on your data
    client_max_body_size 100m;

    # It is recommended to seclude logs per virtual host
    access_log  /var/log/access.log;
    error_log   /var/log/error.log error;

    # Protected Assets
    #
    ### 1. Option - Restricting access to certain assets completely
    #
    # location ~ ^/protected/.* {
    #   return 403;
    # }
    # location ~ ^/var/.*/protected(.*) {
    #   return 403;
    # }
    #
    # location ~ ^/cache-buster\-[\d]+/protected(.*) {
    #   return 403;
    # }
    #
    ### 2. Option - Checking permissions before delivery
    # rewrite ^(/protected/.*) /index.php$is_args$args last;
    #
    # location ~ ^/var/.*/protected(.*) {
    #  return 403;
    # }
    #
    # location ~ ^/cache-buster\-[\d]+/protected(.*) {
    #  return 403;
    # }

    # Pimcore Head-Link Cache-Busting
    rewrite ^/cache-buster-(?:\d+)/(.*) /$1 last;

    # Stay secure
    #
    # a) don't allow PHP in folders allowing file uploads
    location ~* /var/assets/.*\.php(/|$) {
        return 404;
    }
    # b) Prevent clients from accessing hidden files (starting with a dot)
    location ~* /\.(?!well-known/) {
        deny all;
        log_not_found off;
        access_log off;
    }
    # c) Prevent clients from accessing backup/config/source files
    location ~* (?:\.(?:bak|conf(ig)?|dist|fla|in[ci]|log|psd|sh|sql|sw[op])|~)$ {
        deny all;
    }

    # Some Admin Modules need this:
    location ~* ^/admin/external {
        rewrite .* /index.php$is_args$args last;
    }

    # Thumbnails
    location ~* .*/(image|video)-thumb__\d+__.* {
        try_files /var/tmp/thumbnails$uri /index.php;
        expires 2w;
        access_log off;
        add_header Cache-Control "public";
    }

    # Assets
    location ~* ^(?!/admin|/asset/webdav)(.+?)\.((?:css|js)(?:\.map)?|jpe?g|gif|png|svgz?|eps|exe|gz|zip|mp\d|m4a|ogg|ogv|webp|webm|pdf|docx?|xlsx?|pptx?)$ {
        try_files /var/assets$uri $uri =404;
        expires 2w;
        access_log off;
        log_not_found off;
        add_header Cache-Control "public";
    }

    location / {
        error_page 404 /meta/404;
        try_files $static_page_root$static_page_uri.html $uri /index.php$is_args$args;
    }

    # Use this location when the installer has to be run
    # location ~ /(index|install)\.php(/|$) {
    #
    # Use this after initial install is done:
    location ~ ^/index\.php(/|$) {
        send_timeout 1800;
        fastcgi_read_timeout 1800;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        try_files $fastcgi_script_name =404;
        include fastcgi.conf;
        set $path_info $fastcgi_path_info;
        fastcgi_param PATH_INFO $path_info;

        # Activate these, if using Symlinks and opcache
        # fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        # fastcgi_param DOCUMENT_ROOT $realpath_root;

        # Mitigate https://httpoxy.org/ vulnerabilities
        fastcgi_param HTTP_PROXY "";

        fastcgi_pass php-pimcore;
        internal;
    }

    # PHP-FPM Status and Ping
    location /fpm- {
        access_log off;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        location /fpm-status {
            allow 127.0.0.1;
            deny all;
            fastcgi_pass php-pimcore;
        }
        location /fpm-ping {
            fastcgi_pass php-pimcore;
        }
    }
    # nginx Status
    location /nginx-status {
        allow 127.0.0.1;
        deny all;
        access_log off;
        stub_status;
    }
}
```

### Thumbnail Generation Overload Protection

If your application has pages with many images processed by an image pipeline, on-demand thumbnail generation can overload the server due to too many parallel PHP processes, especially with large source images.

Extend the Nginx configuration above to use [Nginx rate-limiting](https://www.nginx.com/blog/rate-limiting-nginx/) for protection against this scenario.

**Step 1: Create a Zone**

Add the following to the `http` section of your Nginx config:

```nginx
# Zone to limit Pimcore on-demand image generation
limit_req_zone $server_name zone=imggen:1M rate=5r/s;
```

This defines a zone called `imggen` using the [$server_name](http://nginx.org/en/docs/http/ngx_http_core_module.html#var_server_name) as key and allows 5 requests per second. Adjust the rate to match your server's capacity.

**Step 2: Replace the Thumbnail Location Block**

```nginx
    # Pimcore on-demand thumbnail generation with rate-limit
    location ~* .*/(image|video)-thumb__\d+__.* {
        try_files /var/tmp/thumbnails$uri @imggen;
        expires 2w;
        access_log off;
        add_header Cache-Control "public";
    }
    location @imggen {
        limit_req zone=imggen burst=15;
        try_files /var/tmp/thumbnails$uri /index.php;
        expires 2w;
        access_log off;
        add_header Cache-Control "public";
    }
```

This configuration queues up to 15 requests before rejecting additional ones with HTTP 429. The queue is drained at the rate defined in step 1.
