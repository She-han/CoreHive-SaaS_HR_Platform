# =========================================================================
# Stage 1: Build the React Application
# =========================================================================
# Official Node.js 22 (LTS version) Alpine image එක use කරනවා.
# 'alpine' image එක lightweight නිසා build stage එකේ size එක අඩුයි.
FROM node:22-alpine AS build
LABEL maintainer="She-han <shehan@corehive.lk>"

# Application එකේ working directory එක set කරනවා
WORKDIR /app

# මුලින්ම package.json සහ package-lock.json (හෝ yarn.lock/pnpm-lock.yaml) copy කරනවා.
# මේකෙන් dependency layer එක cache වෙන නිසා, source code change උනාට build එක speed up වෙනවා.
COPY package*.json ./

# 'npm ci' use කරනවා production builds සඳහා.
# මේක 'npm install' වලට වඩා වේගවත් සහ package-lock.json එකට අනුවම dependencies install කරන නිසා reliable.
RUN npm ci

# Source code එකේ ඉතුරු ටික copy කරනවා
COPY . .

# Vite production build එක create කරනවා.
# VITE_API_BASE_URL එක build time එකේදී set කරන්න පුළුවන්.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# =========================================================================
# Stage 2: Serve the application with Nginx
# =========================================================================
# Lightweight Nginx image එකක් use කරනවා final image size එක ගොඩක් අඩු කරගන්න.
FROM nginx:1.27.0-alpine

# Security Best Practice: Nginx default user එක use කරනවා.
# www-data user එකට permission දෙන්න custom config එකක් use කරමු.

# Build stage එකෙන් build කරපු files Nginx server එකේ default folder එකට copy කරනවා
COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx configuration file එක copy කරනවා (React Router handle කරන්න)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Container එක run වෙන්න ඕනේ port එක (Nginx default port)
EXPOSE 80

# Nginx server එක non-daemon mode එකේ start කරනවා.
# Docker containers වලට foreground process එකක් විදියට run වෙන එක වඩා හොඳයි.
CMD ["nginx", "-g", "daemon off;"]