floating-button-menu
<br />
nitemarket
<br />
https://github.com/nitemarket/floating-button-menu

<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Pacifico|Roboto:300,400,500,700" type="text/css">
		<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
		<link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.blue-amber.min.css" />
		<link rel="stylesheet" href="https://fastly.jsdelivr.net/gh/nitemarket/floating-button-menu/examples/public/styles/mdl-expandablefab.css" />
		<link rel="stylesheet" href="https://fastly.jsdelivr.net/gh/nitemarket/floating-button-menu/examples/public/styles/main.css" />

<div class="mdl-fab-bottom-right mdl-button--fab-expandable bottom right mdl-fab-expandable--snack">
      <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
        <i class="material-icons">more_vert</i>
      </button>
      <div class="mdl-fab-expandable--children">
        <div class="mdl-fab-expandable--child">
          <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored">
            <i class="material-icons">add</i>
          </button>
          <div class="mdl-fab-expandable--child-label"><label>Create</label></div>
        </div>
        <div class="mdl-fab-expandable--child">
          <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored">
            <i class="material-icons">search</i>
          </button>
          <div class="mdl-fab-expandable--child-label"><label>Search</label></div>
        </div>
      </div>
    </div>

    <!-- layout -->
    <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header">
      <header class="mdl-layout__header">
        <div class="mdl-layout__header-row">
          <!-- Title -->
          <span class="mdl-layout-title">Demo</span>
          <!-- Add spacer, to align navigation to the right -->
          <div class="mdl-layout-spacer"></div>
          <!-- Navigation. We hide it in small screens. -->
          <nav class="mdl-navigation mdl-layout--large-screen-only">
          </nav>
        </div>
      </header>
      <div class="mdl-layout__drawer">
        <span class="mdl-layout-title">Title</span>
        <nav class="mdl-navigation">
          <a class="mdl-navigation__link" href="/">Home</a>
        </nav>
      </div>
      <main class="mdl-layout__content">
        <div class="page-content mdl-grid">
          <div class="mdl-cell">
            <button id="showSnackbarBtn" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored">
              Show Snackbar
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- snackbar -->
    <div id="toastMessage" class="mdl-js-snackbar mdl-snackbar">
      <div class="mdl-snackbar__text"></div>
      <button class="mdl-snackbar__action" type="button"></button>
    </div>

    <script type="text/javascript" src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
    <script src="https://code.getmdl.io/1.3.0/material.min.js"></script>
    <script src="https://fastly.jsdelivr.net/gh/nitemarket/floating-button-menu/examples/public/scripts/mdl-expandablefab.js"></script>
    <script>
    $(document).ready(() => {
      nitemarket.MaterialUtils.activateExpandableFAB();

      $('#showSnackbarBtn').on('click', () => {
        nitemarket.MaterialUtils.showToastMessage("Warning! This is awesome.", "error");
      });
    });
    </script>