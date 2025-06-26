---
layout: page
title: Reddit Feed Documentation
---

# Reddit Feed Aggregator Documentation

The Reddit Feed Aggregator is a feature that allows you to view conversations from multiple subreddits in a single unified page. It uses Reddit's RSS feeds to fetch and display posts in a clean, unified interface.

## How It Works

The Reddit Feed Aggregator works by:

1. Fetching RSS feeds from specified subreddits
2. Parsing the XML data
3. Displaying posts in chronological order (newest first)
4. Allowing filtering by subreddit

## Features

### Subreddit Filtering

You can filter posts by subreddit using the sidebar navigation. Click on any subreddit name to show only posts from that community, or select "All Subreddits" to view combined content.

### Display Options

The feed supports two viewing modes:

- **Card View**: Shows detailed post information including content previews
- **Compact View**: Shows just titles and basic metadata for a more condensed experience

### Auto-Refresh

The feed can automatically refresh at intervals you specify:

- Disabled (manual refresh only)
- Every 1 minute
- Every 5 minutes (default)
- Every 10 minutes
- Every 30 minutes

You can also manually refresh the feed at any time by clicking the "Refresh Now" button.

## Included Subreddits

The default configuration includes these technology-related subreddits:

- r/docker
- r/programming
- r/kubernetes
- r/devops
- r/golang
- r/python
- r/aws
- r/cloudcomputing
- r/opensource
- r/javascript

## Limitations

Please note the following limitations:

- Reddit RSS feeds typically only include the most recent posts (usually around 25 posts per subreddit)
- Due to CORS restrictions, feeds are fetched through a proxy service
- Content may be slightly delayed compared to viewing directly on Reddit
- Some media content (images, videos) is not included in the RSS feeds

## Customizing the Feed

To customize which subreddits are displayed in your feed, you can edit the `pages/reddit-feed.md` file:

```yaml
---
layout: rss-feed-page
title: Reddit Feed Aggregator
description: A single-page view of conversations from your favorite subreddits
subreddits: ["docker", "programming", "kubernetes", "devops", "golang", "python", "aws", "cloudcomputing", "opensource", "javascript"]
limit: 25
---
```

Edit the `subreddits` array to add or remove communities based on your interests. The `limit` parameter controls the maximum number of posts displayed at once.

## Troubleshooting

### Feed Not Loading

If the feed fails to load, check the following:

1. Ensure you have an active internet connection
2. Verify that the CORS proxy service is functioning
3. Check if Reddit is accessible from your location
4. Try refreshing the page or using the "Refresh Now" button

### Missing Content

If you notice that some posts are missing or incomplete:

1. Remember that Reddit RSS feeds only include the most recent posts
2. Some post content may be truncated in the feed
3. For complete content, use the "View on Reddit" link to see the original post

## Privacy Considerations

The Reddit Feed Aggregator respects your privacy:

- All content is loaded client-side in your browser
- No user data is stored or tracked
- No Reddit authentication is required to view public posts

## Technical Implementation

The Reddit Feed Aggregator is implemented using:

- Vanilla JavaScript for feed fetching and rendering
- The Reddit public RSS feeds
- A CORS proxy for cross-origin requests
- Custom CSS for the responsive layout

The code is designed to be lightweight and fast, without requiring external JavaScript libraries or frameworks.
