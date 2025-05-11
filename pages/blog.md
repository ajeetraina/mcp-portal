---
layout: default
title: MCP Blog
permalink: /blog/
---

<link rel="stylesheet" href="{{ '/assets/css/blog-list.css' | relative_url }}">

<section class="page-header">
  <div class="container">
    <h1 class="page-title">{{ page.title }}</h1>
    <p class="page-description">Latest news, tutorials, and insights about Model Context Protocol</p>
  </div>
</section>

<section class="container">
  <div class="blog-list">
    {% for post in site.posts %}
    <div class="blog-item">
      {% if post.featured_image %}
      <div class="blog-item-image">
        <a href="{{ post.url | relative_url }}">
          <img src="{{ post.featured_image | relative_url }}" alt="{{ post.title }}">
        </a>
      </div>
      {% endif %}
      
      <div class="blog-item-content">
        <h2 class="blog-item-title">
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h2>
        
        <div class="blog-item-meta">
          {% if post.author %}
          <span class="blog-item-author">
            <i class="fas fa-user"></i> {{ post.author }}
          </span>
          {% endif %}
          
          {% if post.date %}
          <span class="blog-item-date">
            <i class="fas fa-calendar-alt"></i> {{ post.date | date: "%B %d, %Y" }}
          </span>
          {% endif %}
          
          {% if post.categories and post.categories.size > 0 %}
          <span class="blog-item-categories">
            <i class="fas fa-folder"></i>
            {% for category in post.categories %}
            <span class="category">{{ category }}</span>{% unless forloop.last %}, {% endunless %}
            {% endfor %}
          </span>
          {% endif %}
        </div>
        
        <div class="blog-item-excerpt">
          {% if post.excerpt %}
          {{ post.excerpt | strip_html | truncatewords: 50 }}
          {% endif %}
        </div>
        
        <a href="{{ post.url | relative_url }}" class="blog-item-read-more">
          Read More <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
    {% endfor %}
  </div>
</section>