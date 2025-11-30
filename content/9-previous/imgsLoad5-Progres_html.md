```html

<button id="add">Add images</button>
<button id="reset">Reset</button>
<div id="status">
  <progress max="7" value="0"></progress>
</div>
<div id="image-container"></div>

<script>
let container = document.querySelector('#image-container');
let statusElem = document.querySelector('#status');
let progressElem = document.querySelector('progress');

let loadedImageCount, imageCount;

document.querySelector('#add').onclick = function() {
  // add new images
  let fragment = getItemsFragment();
  container.insertBefore( fragment, container.firstChild );
  // use ImagesLoaded
  let imgLoad = imagesLoaded( container );
  imgLoad.on( 'progress', onProgress );
  imgLoad.on( 'always', onAlways );
  // reset progress counter
  imageCount = imgLoad.images.length;
  resetProgress();
  progressElem.setAttribute( 'value', 0 );
};

// reset container
document.querySelector('#reset').onclick = function() {
  container.innerHTML = '';
};

// -----  ----- //

function resetProgress() {
  statusElem.style.opacity = 1;
  loadedImageCount = 0;
  progressElem.setAttribute( 'max', imageCount );
}

function updateProgress( value ) {
}

// triggered after each item is loaded
function onProgress( imgLoad, image ) {
  // change class if the image is loaded or broken
  image.img.parentNode.className = image.isLoaded ? '' : 'is-broken';
  // update progress element
  loadedImageCount++;
  progressElem.setAttribute( 'value', loadedImageCount );
}

// hide status when done
function onAlways() {
  statusElem.style.opacity = 0;
}

// -----  ----- //

// return doc fragment with
function getItemsFragment() {
  let fragment = document.createDocumentFragment();
  for ( let i = 0; i < 7; i++ ) {
    let item = getImageItem();
    fragment.appendChild( item );
  }
  return fragment;
}

// return an <li> with a <img> in it
function getImageItem() {
  let item = document.createElement('li');
  item.className = 'is-loading';
  let img = document.createElement('img');
  let size = Math.random() * 3 + 1;
  let width = Math.random() * 110 + 100;
  width = Math.round( width * size );
  let height = Math.round( 140 * size );
  let rando = Math.ceil( Math.random() * 1000 );
  // 10% chance of broken image src
  // random parameter to prevent cached images
  let src = rando < 100 ? `//foo/broken-${rando}.jpg` :
    // use picsum.photos for great random images
    `https://picsum.photos/${width}/${height}/?${rando}`;
  img.src = src;
  img.addEventListener('mouseup', () => {
    Fancybox.fromNodes(
      Array.from(document.querySelectorAll('li>img')),
      {
        // Your custom options
      }
);

  });
  item.append( img );
  return item;
}
</script>
<style>
body {
  font-family: sans-serif;
}

#image-container img {
  max-height: 140px;
}

li {
  height: 140px;
  min-width: 100px;
  display: block;
  float: left;
  list-style: none;
  margin: 0 5px 5px 0;
  background-color: black;
  background-position: center center;
  background-repeat: no-repeat;
}

li img,
#status {
  -webkit-transition: opacity 0.4s;
     -moz-transition: opacity 0.4s;
      -ms-transition: opacity 0.4s;
          transition: opacity 0.4s;
}

li.is-loading {
  background-color: black;
  background-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/loading.gif');
}

li.is-broken {
  background-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/broken.png');
  background-color: #be3730;
  width: 120px;
}

li.is-loading img,
li.is-broken img {
  opacity: 0;
}

.buttons { margin-bottom: 1.0em; }

button {
  font-size: 18px;
  padding: 0.4em 0.8em;
  font-family: sans-serif;
}

#status {
  opacity: 0;
  position: fixed;
  right: 20px;
  top: 20px;
  background: hsla( 0, 0%, 0%, 0.8);
  padding: 20px;
  border-radius: 10px;
  z-index: 2; /* over other stuff */
}
</style>
<script src="https://unpkg.com/imagesloaded@5/imagesloaded.pkgd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js"></script>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css"
/>

```