---
title: 雏得
parent: 5🔥
---
title: 雏得
parent: Utilities
<div class="side-bar">
  <div class="site-header" role="banner">
    <a href="{{ site.title }}" class="site-title lh-tight">{% include title.html %}</a>
    <button id="menu-button" class="site-button btn-reset" aria-label="Toggle menu" aria-pressed="false">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><use xlink:href="#svg-menu"></use></svg>
    </button>
  </div>
<blockquote class="warning">
        A page has the same title as its parent page or one of its ancestral pages!<br>
        This causes an incorrect link in the main navigation panel.<br>
        Page title: <code>{{ page.title }}</code>, location: <code>{{ page.path }}</code>.
      </blockquote>