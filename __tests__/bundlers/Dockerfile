# Chrome 141 with the app in <APP>/dist/ served on port 8000, see README.md. Same Chrome as the HTML tests' grid
# (selenium/node-chrome:141.0), in the single-container "standalone" variant: WebDriver on port 4444, noVNC on port 7900.
#
# Usage: docker build --build-arg APP=<esbuild | vite | webpack4 | webpack5> .

FROM selenium/standalone-chrome:141.0@sha256:2315640266fa3a4a28c3023fa8edd190ca7f6b827810c2f9bd3b75cb88198cff

ARG APP

COPY --chown=seluser ${APP}/dist/ /home/seluser/app/
COPY report.js /home/seluser/app/__runner/

# Injects report.js before the app's scripts.
RUN sed -i 's|<head>|&<script src="/__runner/report.js"></script>|i' /home/seluser/app/index.html

COPY <<EOF /etc/supervisor/conf.d/app.conf
[program:app]
command=python3 -m http.server --directory /home/seluser/app 8000
EOF
