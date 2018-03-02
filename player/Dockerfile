FROM ubuntu
MAINTAINER Xavier Blanc <blancxav@gmail.com>

# Git 
RUN apt-get update -y \
	&& apt-get install git -y 
	
# Install node
RUN apt-get update -y \
	&& apt-get install curl -y
RUN curl -o /usr/local/bin/n https://raw.githubusercontent.com/visionmedia/n/master/bin/n
RUN chmod +x /usr/local/bin/n
RUN n stable

# Installing the packages needed to run Headless Nightmare
RUN apt-get install -y \
  xvfb \
  x11-xkb-utils \
  xfonts-100dpi \
  xfonts-75dpi \
  xfonts-scalable \
  xfonts-cyrillic \
  x11-apps \
  clang \
  libdbus-1-dev \
  libgtk2.0-dev \
  libnotify-dev \
  libgnome-keyring-dev \
  libgconf2-dev \
  libasound2-dev \
  libcap-dev \
  libcups2-dev \
  libxtst-dev \
  libxss1 \
  libnss3-dev \
  gcc-multilib \
  g++-multilib

RUN mkdir /tmp/run
WORKDIR /tmp/run
RUN mkdir screen
COPY player/index.js .
COPY player/Player.js .
COPY player/testNightmare.js .
COPY player/package.json .
RUN npm install

ENV DEBUG=nightmare*

CMD xvfb-run -a --server-args='-screen 0 1024x768x24' node ./index.js --mongo=mongo --rabbit=rabbit
