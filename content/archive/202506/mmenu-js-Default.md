<link type="text/css" rel="stylesheet" href="https://fastly.jsdelivr.net/gh/FrDH/mmenu-js/demo/css/demo.css" />
        <link type="text/css" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/mmenu-js/9.3.0/mmenu.min.css" />

<div id="page">
            <div id="header">
                <a href="#menu"><span></span></a>
                Demo
            </div>
            <div id="content">
                <h1>This is a demo.</h1>
                <p>Click the menu icon to open the menu.</p>
            </div>
            <nav id="menu">
                <ul>
                    <li><a href="#/">Home</a></li>
                    <li>
                        <span>About us</span>
                        <ul>
                            <li><a href="#/">History</a></li>
                            <li>
                                <span>The team</span>
                                <ul>
                                    <li>
                                        <a href="#/">Management</a>
                                    </li>
                                    <li>
                                        <a href="#/">Sales</a>
                                    </li>
                                    <li>
                                        <a href="#/">Development</a>
                                    </li>
                                </ul>
                            </li>
                            <li><a href="#/">Our address</a></li>
                        </ul>
                    </li>
                    <li><a href="#/">Contact</a></li>

                    <li class="Divider">Other demos</li>
                    <li><a href="advanced.html">Advanced demo</a></li>
                    <li><a href="onepage.html">One page demo</a></li>
                </ul>
            </nav>
        </div>

        <!-- mmenu scripts -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/mmenu-js/9.3.0/mmenu.min.js"></script>
        <script>
            new Mmenu(document.querySelector("#menu"));

            document.addEventListener("click", function (evnt) {
                var anchor = evnt.target.closest('a[href="#/"]');
                if (anchor) {
                    alert("Thank you for clicking, but that's a demo link.");
                    evnt.preventDefault();
                }
            });
        </script>