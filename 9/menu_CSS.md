/*
```css
*/

/* Craig @qrayg
https://github.com/craigerskine/css-menu

nav */
.nav-menu,.nav-menu ul,.nav-menu li,.nav-menu a { margin: 0; padding: 0; line-height: normal; list-style: none; display: block; position: relative; }
.nav-menu ul { opacity: 0; position: absolute; bottom: 100%; right: -9999px; z-index: 999; -webkit-transition: opacity .3s; transition: opacity .3s; }
.nav-menu li:hover > ul { right: 0; opacity: 1; z-index: 1000; }
.nav-menu ul li:hover > ul { bottom: 0; right: 100%; }
.nav-menu li { cursor: default; float: left; white-space: nowrap; }
.nav-menu ul li { float: none; }

/* sub width */
.nav-menu ul { min-width: 12em; -webkit-box-shadow: 2px 2px 2px rgba(0,0,0,0.25); box-shadow: 2px 2px 2px rgba(0,0,0,0.25); }

/* center */
.nav-center { float: right; right: 50%; }
.nav-center > li { left: 50%; }

/* root */
.nav-menu a {
  padding: 0 10px;
  color: #5BC0DE;
  font-weight: normal;
  font-size: 16px;
  line-height: 44px;
  text-decoration: none;
}

/* root: active */
.nav-menu > li > .nav-active { background-color: rgba(0,0,0,0.05); }

/* root: hover/persistence */
.nav-menu a:hover,.nav-menu a:focus,.nav-menu li:hover a {
  background: #555;
  color: #FFF;
}

/* 2 */
.nav-menu li li a,.nav-menu li:hover li a {
  padding: 8px 10px;
  background: #555;
  color: #FFF;
  font-size: 14px;
  line-height: normal;
}

/* 2: hover/persistence */
.nav-menu li:hover li a:hover,.nav-menu li:hover li a:focus,.nav-menu li:hover li:hover a {
  background: #444;
}

/* 3 */
.nav-menu li:hover li:hover li a {
  background: #444;
}

/* 3: hover/persistence */
.nav-menu li:hover li:hover li a:hover,.nav-menu li:hover li:hover li a:focus,.nav-menu li:hover li:hover li:hover a {
  background: #333;
}

/* 4 */
.nav-menu li:hover li:hover li:hover li a {
  background: #333;
}

/* 4: hover */
.nav-menu li:hover li:hover li:hover li a:hover,.nav-menu li:hover li:hover li:hover li a:focus {
  background: #222;
}

/* vertical */
.nav-vertical { max-width: 220px; }
.nav-vertical ul { top: 0; right: -9999px; }
.nav-vertical li { width: 100%; float: none; }
.nav-vertical li:hover > ul { left: 100%; }

/*
```
*/