FROM ruby:3.1-slim
WORKDIR /site
RUN apt-get update && apt-get install -y build-essential
COPY Gemfile* ./
RUN bundle install
EXPOSE 4000
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0"]
