// ============================================================
// WBDYM LIVE WEBSITE CONNECTOR
// West Bengal Dalit Yuva Manch
// ============================================================

(() => {
  const SUPABASE_URL =
    "https://oahuhywputxkncddlmol.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_Me95pbzCTvG9kFV3frVXDw_l5YpafnG";

  if (!window.supabase) {
    console.warn("Supabase library not loaded.");
    return;
  }

  const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


  // ==========================================================
  // HELPERS
  // ==========================================================

  function setText(element, value) {
    if (!element) return;

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      element.textContent = value;
    }
  }


  function setLink(element, url) {
    if (!element || !url) return;

    element.href = url;
    element.target = "_blank";
    element.rel = "noopener noreferrer";
  }


  function setImage(element, url) {
    if (!element || !url) return;

    element.src = url;
  }


  function escapeHTML(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char])
    );
  }


  // ==========================================================
  // WEBSITE SETTINGS
  // ==========================================================

  async function loadWebsiteSettings() {

    const {
      data,
      error
    } = await db
      .from("site_settings")
      .select("*")
      .eq("id", true)
      .maybeSingle();


    if (error) {
      console.warn(
        "WBDYM settings error:",
        error.message
      );

      return;
    }


    if (!data) return;


    const site = data;


    // --------------------------------------------------------
    // SITE NAME
    // --------------------------------------------------------

    document
      .querySelectorAll(
        ".site-name, .brand-name"
      )
      .forEach((element) => {

        setText(
          element,
          site.site_name
        );

      });


    // --------------------------------------------------------
    // TAGLINE
    // --------------------------------------------------------

    document
      .querySelectorAll(
        ".site-tagline, .brand-tagline"
      )
      .forEach((element) => {

        setText(
          element,
          site.tagline
        );

      });


    // --------------------------------------------------------
    // LOGO
    // --------------------------------------------------------

    if (site.logo_url) {

      document
        .querySelectorAll(
          ".brand-logo, .site-logo, header img"
        )
        .forEach((element) => {

          if (
            element.tagName === "IMG"
          ) {
            setImage(
              element,
              site.logo_url
            );
          }

        });

    }


    // ========================================================
    // HERO
    // ========================================================

    const home =
      document.querySelector("#home");


    if (home) {

      setText(
        home.querySelector(
          ".eyebrow"
        ),
        site.hero_eyebrow
      );


      setText(
        home.querySelector(
          "h1"
        ),
        site.hero_title
      );


      setText(
        home.querySelector(
          ".hero-description"
        ),
        site.hero_subtitle
      );


      const buttons =
        home.querySelectorAll(
          ".hero-buttons a"
        );


      if (buttons.length > 1) {

        setText(
          buttons[1],
          site.hero_button_text
        );


        if (
          site.hero_button_url
        ) {

          buttons[1].href =
            site.hero_button_url;

        }

      }


      // HERO IMAGE

      if (
        site.hero_image_url
      ) {

        const heroCard =
          home.querySelector(
            ".hero-card"
          );


        if (heroCard) {

          heroCard.style.backgroundImage =
            `
              linear-gradient(
                180deg,
                rgba(255,255,255,.65),
                rgba(255,255,255,.92)
              ),
              url("${site.hero_image_url}")
            `;

          heroCard.style.backgroundSize =
            "cover";

          heroCard.style.backgroundPosition =
            "center";

        }

      }

    }


    // ========================================================
    // ABOUT
    // ========================================================

    const about =
      document.querySelector(
        "#about"
      );


    if (about) {

      setText(
        about.querySelector(
          "h2"
        ),
        site.about_title
      );


      const paragraphs =
        about.querySelectorAll(
          "p"
        );


      if (paragraphs.length) {

        setText(
          paragraphs[0],
          site.about_text
        );

      }

    }


    // ========================================================
    // VISION
    // ========================================================

    const vision =
      document.querySelector(
        ".vision-text"
      );


    if (vision) {

      setText(
        vision,
        site.vision_text
      );

    }


    // ========================================================
    // MISSION
    // ========================================================

    const mission =
      document.querySelector(
        ".mission-strip p"
      );


    if (mission) {

      setText(
        mission,
        site.mission_text
      );

    }


    // ========================================================
    // CONTACT
    // ========================================================

    const contact =
      document.querySelector(
        "#contact"
      );


    if (contact) {

      const items =
        contact.querySelectorAll(
          ".contact-item"
        );


      // EMAIL

      if (items[0]) {

        const link =
          items[0].querySelector(
            "a"
          );


        if (link && site.email) {

          setText(
            link,
            site.email
          );

          link.href =
            "mailto:" +
            site.email;

        }

      }


      // PHONE

      if (items[1]) {

        const link =
          items[1].querySelector(
            "a"
          );


        if (link && site.phone) {

          setText(
            link,
            site.phone
          );

          link.href =
            "tel:" +
            site.phone.replace(
              /\s+/g,
              ""
            );

        }

      }


      // ADDRESS

      if (items[2]) {

        const address =
          items[2].querySelector(
            "p"
          );


        setText(
          address,
          site.address
        );

      }

    }


    // ========================================================
    // SOCIAL MEDIA
    // ========================================================

    document
      .querySelectorAll(
        ".social-links"
      )
      .forEach((social) => {

        const links =
          social.querySelectorAll(
            "a"
          );


        if (
          links[0] &&
          site.facebook_url
        ) {

          setLink(
            links[0],
            site.facebook_url
          );

        }


        if (
          links[1] &&
          site.instagram_url
        ) {

          setLink(
            links[1],
            site.instagram_url
          );

        }


        if (
          links[2] &&
          site.youtube_url
        ) {

          setLink(
            links[2],
            site.youtube_url
          );

        }


        if (
          links[3] &&
          site.whatsapp
        ) {

          let whatsapp =
            site.whatsapp;


          if (
            !whatsapp
              .toLowerCase()
              .startsWith(
                "http"
              )
          ) {

            whatsapp =
              "https://wa.me/" +
              whatsapp.replace(
                /\D/g,
                ""
              );

          }


          setLink(
            links[3],
            whatsapp
          );

        }

      });

  }


  // ==========================================================
  // GALLERY
  // ==========================================================

  async function loadGallery() {

    const {
      data,
      error
    } = await db
      .from("gallery")
      .select("*")
      .eq(
        "published",
        true
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


    if (error) {

      console.warn(
        "Gallery error:",
        error.message
      );

      return;
    }


    if (!data || !data.length)
      return;


    const gallery =
      document.querySelector(
        "#gallery .gallery-grid"
      );


    if (!gallery)
      return;


    gallery.innerHTML =
      data
        .map(
          (item, index) => {

            return `
              <a
                class="wbdym-gallery-photo ${
                  index === 0
                    ? "large"
                    : ""
                }"
                href="${escapeHTML(
                  item.image_url
                )}"
                target="_blank"
                rel="noopener noreferrer"
              >

                <img
                  src="${escapeHTML(
                    item.image_url
                  )}"
                  alt="${escapeHTML(
                    item.title ||
                    "WBDYM Gallery"
                  )}"
                  loading="lazy"
                >

                ${
                  item.caption
                    ? `
                      <span>
                        ${escapeHTML(
                          item.caption
                        )}
                      </span>
                    `
                    : ""
                }

              </a>
            `;

          }
        )
        .join("");


    addGalleryStyles();

  }


  // ==========================================================
  // GALLERY STYLE
  // ==========================================================

  function addGalleryStyles() {

    if (
      document.getElementById(
        "wbdym-gallery-style"
      )
    ) {
      return;
    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "wbdym-gallery-style";


    style.textContent = `

      #gallery .gallery-grid {
        display:grid;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(
              220px,
              1fr
            )
          );
        gap:18px;
      }

      .wbdym-gallery-photo {
        position:relative;
        display:block;
        min-height:220px;
        overflow:hidden;
        border-radius:18px;
        background:#eee;
      }

      .wbdym-gallery-photo.large {
        grid-row:span 2;
        min-height:460px;
      }

      .wbdym-gallery-photo img {
        width:100%;
        height:100%;
        min-height:220px;
        object-fit:cover;
        display:block;
        transition:
          transform .35s ease;
      }

      .wbdym-gallery-photo:hover img {
        transform:
          scale(1.04);
      }

      .wbdym-gallery-photo span {
        position:absolute;
        left:0;
        right:0;
        bottom:0;
        padding:16px;
        color:#fff;
        font-size:14px;
        background:
          linear-gradient(
            transparent,
            rgba(
              0,
              0,
              0,
              .75
            )
          );
      }

      @media(max-width:650px) {

        .wbdym-gallery-photo.large {
          min-height:280px;
        }

      }

    `;


    document.head.appendChild(
      style
    );

  }


  // ==========================================================
  // EVENTS
  // ==========================================================

  async function loadEvents() {

    const {
      data,
      error
    } = await db
      .from("events")
      .select("*")
      .eq(
        "published",
        true
      )
      .order(
        "event_date",
        {
          ascending: true
        }
      );


    if (error) {

      console.warn(
        "Events error:",
        error.message
      );

      return;
    }


    if (!data || !data.length)
      return;


    const container =
      document.querySelector(
        "#news .news-grid"
      );


    if (!container)
      return;


    container.innerHTML =
      data
        .map(
          (event) => {

            let date =
              null;


            if (
              event.event_date
            ) {

              date =
                new Date(
                  event.event_date +
                  "T00:00:00"
                );

            }


            const day =
              date
                ? String(
                    date.getDate()
                  ).padStart(
                    2,
                    "0"
                  )
                : "";


            const month =
              date
                ? date.toLocaleString(
                    "en-IN",
                    {
                      month:
                        "short"
                    }
                  )
                : "";


            return `

              <article
                class="news-card"
              >

                ${
                  event.image_url
                    ? `
                      <img
                        src="${escapeHTML(
                          event.image_url
                        )}"
                        alt=""
                        style="
                          width:90px;
                          height:90px;
                          object-fit:cover;
                          border-radius:12px;
                        "
                      >
                    `
                    : ""
                }

                <div
                  class="news-date"
                >

                  <strong>
                    ${day}
                  </strong>

                  <span>
                    ${month}
                  </span>

                </div>


                <div>

                  <h3>
                    ${escapeHTML(
                      event.title
                    )}
                  </h3>

                  <p>
                    ${escapeHTML(
                      event.description
                    )}
                  </p>

                  ${
                    event.location
                      ? `
                        <small>
                          ${escapeHTML(
                            event.location
                          )}
                        </small>
                      `
                      : ""
                  }

                </div>

              </article>

            `;

          }
        )
        .join("");

  }


  // ==========================================================
  // INITIALIZE
  // ==========================================================

  async function initialize() {

    try {

      await Promise.all([
        loadWebsiteSettings(),
        loadGallery(),
        loadEvents()
      ]);

    } catch (error) {

      console.warn(
        "WBDYM website dynamic content error:",
        error
      );

    }

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );

  } else {

    initialize();

  }

})();
