<link
            rel="stylesheet"
            href="http://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
        />
        <link rel="stylesheet" href="https://fastly.jsdelivr.net/gh/FrDH/mmenu-js/demo/css/demo.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/mmenu-js/9.3.0/mmenu.min.css" />

        <style>
            .mm-wrapper--sidebar-expanded.mm-wrapper--opened #header a {
                display: none;
            }

            .mm-navbar--tabs span {
                display: inline-block;
                margin-inline-start: 8px;
            }

            @media (max-width: 450px) {
                .mm-navbar--tabs span {
                    display: none;
                }
            }
        </style>

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
                <div id="panel-menu">
                    <ul>
                        <li>
                            <a href="#/">Home</a>
                            <input type="checkbox" class="mm-toggle" />
                        </li>
                        <li>
                            <span>About us</span>
                            <ul>
                                <li><a href="#/">History</a></li>
                                <li>
                                    <span>The team</span>
                                    <ul>
                                        <li><a href="#/">Management</a></li>
                                        <li><a href="#/">Sales</a></li>
                                        <li><a href="#/">Development</a></li>
                                    </ul>
                                </li>
                                <li><a href="#/">Our address</a></li>
                            </ul>
                        </li>
                        <li><a href="#/">Contact</a></li>

                        <li class="Divider">Other demos</li>
                        <li><a href="default.html">Default demo</a></li>
                        <li><a href="onepage.html">One page demo</a></li>
                    </ul>
                </div>

                <ul id="panel-account" data-mm-title="Account">
                    <li><a href="#/">My profile</a></li>
                    <li><a href="#/">Privacy settings</a></li>
                    <li><a href="#/">Activity</a></li>
                    <li><a href="#/">Sign out</a></li>
                </ul>

                <div id="panel-cart" data-mm-title="Shopping cart">
                    <p style="text-align: center; padding-top: 30px">
                        Your shoppingcart is empty.<br />
                        <a href="#/">Continue shopping.</a>
                    </p>
                </div>
            </nav>
        </div>

        <!-- mmenu scripts -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/mmenu-js/9.3.0/mmenu.min.js"></script>
        <script>
            new Mmenu(
                document.querySelector("#menu"),
                {
                    theme: "white",
                    setSelected: {
                        hover: true,
                        parent: true,
                    },
                    counters: {
                        add: true,
                    },
                    searchfield: {
                        add: true,
                        placeholder: "Search menu items",
                        splash: "<p>What are you looking for?</p>",
                        title: "Search",
                    },
                    iconbar: {
                        use: "(min-width: 450px)",
                        top: [
                            '<a href="#/"><span class="fa fa-home"></span></a>',
                        ],
                        bottom: [
                            '<a href="#/"><span class="fa fa-twitter"></span></a>',
                            '<a href="#/"><span class="fa fa-facebook"></span></a>',
                            '<a href="#/"><span class="fa fa-youtube"></span></a>',
                        ],
                    },
                    iconPanels: {
                        add: true,
                        visible: 1,
                    },
                    sidebar: {
                        collapsed: {
                            use: "(min-width: 768px)",
                        },
                        expanded: {
                            use: "(min-width: 1024px)",
                            initial: "closed",
                        },
                    },
                    navbars: [
                        {
                            content: ["searchfield"],
                        },
                        {
                            type: "tabs",
                            content: [
                                '<a href="#panel-menu"><i class="fa fa-bars"></i> <span>Menu</span></a>',
                                '<a href="#panel-account"><i class="fa fa-user"></i> <span>Account</span></a>',
                                '<a href="#panel-cart"><i class="fa fa-shopping-cart"></i> <span>Cart</span></a>',
                            ],
                        },
                        {
                            content: ["prev", "breadcrumbs", "close"],
                        },
                        {
                            position: "bottom",
                            content: [
                                '<a href="https://mmenujs.com/wordpress-plugin" target="_blank">WordPress plugin</a>',
                            ],
                        },
                    ],
                },
                {
                    searchfield: {
                        cancel: true,
                        clear: true,
                    },
                }
            );

            document.addEventListener("click", function (evnt) {
                var anchor = evnt.target.closest('a[href="#/"]');
                if (anchor) {
                    alert("Thank you for clicking, but that's a demo link.");
                    evnt.preventDefault();
                }
            });
        </script>