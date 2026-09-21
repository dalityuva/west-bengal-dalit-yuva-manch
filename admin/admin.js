// ============================================================
// WBDYM ADMIN PANEL
// West Bengal Dalit Yuva Manch
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ==========================================================
  // SUPABASE CONFIG
  // ==========================================================

  const CONFIG = window.WBDYM_CONFIG || {};

  const SUPABASE_URL = CONFIG.SUPABASE_URL;

  const SUPABASE_KEY =
    CONFIG.SUPABASE_ANON_KEY ||
    CONFIG.SUPABASE_PUBLISHABLE_KEY;

  let db = null;

  if (
    SUPABASE_URL &&
    SUPABASE_KEY &&
    window.supabase &&
    typeof window.supabase.createClient === "function"
  ) {
    db = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );
  }

  // ==========================================================
  // HELPERS
  // ==========================================================

  const $ = (selector) =>
    document.querySelector(selector);

  const $$ = (selector) =>
    Array.from(document.querySelectorAll(selector));

  function escapeHTML(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        })[char]
    );
  }

  function showToast(message) {
    const toast = $("#toast");

    if (!toast) {
      alert(message);
      return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }

  function showLoginMessage(message) {
    const box = $("#msg");

    if (box) {
      box.textContent = message || "";
      box.style.display = message ? "block" : "none";
    }
  }

  function setLoginLoading(loading) {
    const button = $('#loginForm button[type="submit"]');

    if (!button) return;

    button.disabled = loading;
    button.textContent = loading
      ? "Signing in..."
      : "Sign in";
  }

  function isConfigured() {
    if (!window.supabase) {
      showLoginMessage(
        "Supabase library could not load. Please refresh the page."
      );
      return false;
    }

    if (!SUPABASE_URL || !SUPABASE_KEY || !db) {
      showLoginMessage(
        "Supabase configuration is missing. Please check admin-config.js."
      );
      return false;
    }

    return true;
  }

  // ==========================================================
  // DEFAULT WEBSITE DATA
  // ==========================================================

  const DEFAULT_SITE = {
    id: true,

    site_name:
      "West Bengal Dalit Yuva Manch",

    short_name:
      "WBDYM",

    tagline:
      "Empowering Youth • Building an Equal Tomorrow",

    logo_url: "",

    hero_eyebrow:
      "YOUTH • EQUALITY • OPPORTUNITY",

    hero_title:
      "Empowering Youth. Building a Better Tomorrow.",

    hero_subtitle:
      "West Bengal Dalit Yuva Manch is a youth-focused social organisation promoting education, sports, skills, awareness and community development.",

    hero_button_text:
      "Join Our Movement",

    hero_button_url:
      "#get-involved",

    hero_image_url: "",

    about_title:
      "About West Bengal Dalit Yuva Manch",

    about_text:
      "West Bengal Dalit Yuva Manch is a youth-focused community initiative working toward education, empowerment, awareness and inclusive development.",

    vision_text:
      "A society where every young person has the opportunity to learn, grow, participate and lead.",

    mission_text:
      "Turning ideas, energy and determination into meaningful community initiatives.",

    email: "",

    phone: "",

    whatsapp: "",

    address:
      "West Bengal, India",

    facebook_url: "",

    instagram_url: "",

    youtube_url: "",

    donate_url: ""
  };

  // ==========================================================
  // AUTH
  // ==========================================================

  async function getCurrentUser() {
    if (!db) return null;

    const result =
      await db.auth.getUser();

    if (result.error) {
      console.error(
        "getCurrentUser:",
        result.error
      );
      return null;
    }

    return result.data?.user || null;
  }

  async function verifyAdmin(user) {
    if (!user || !db) {
      return false;
    }

    try {
      const {
        data,
        error
      } = await db
        .from("admin_users")
        .select("role,email")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "Admin verification error:",
          error
        );

        showLoginMessage(
          "Admin verification failed: " +
            error.message
        );

        return false;
      }

      if (!data) {
        await db.auth.signOut();

        showLoginMessage(
          "This account is not authorised as an admin."
        );

        return false;
      }

      if (
        !["admin", "editor"].includes(
          String(data.role).toLowerCase()
        )
      ) {
        await db.auth.signOut();

        showLoginMessage(
          "This account does not have admin permission."
        );

        return false;
      }

      return true;

    } catch (error) {
      console.error(error);

      showLoginMessage(
        "Admin verification error: " +
          error.message
      );

      return false;
    }
  }

  async function startAdmin() {
    if (!isConfigured()) {
      return;
    }

    try {
      const {
        data,
        error
      } = await db.auth.getSession();

      if (error) {
        console.error(error);

        showLoginMessage(
          error.message
        );

        return;
      }

      const session = data?.session;

      if (!session) {
        $("#login")?.classList.remove(
          "hidden"
        );

        $("#app")?.classList.add(
          "hidden"
        );

        return;
      }

      const valid =
        await verifyAdmin(
          session.user
        );

      if (!valid) {
        $("#login")?.classList.remove(
          "hidden"
        );

        $("#app")?.classList.add(
          "hidden"
        );

        return;
      }

      openAdmin(session);

    } catch (error) {
      console.error(
        "Admin startup error:",
        error
      );

      showLoginMessage(
        "Unable to start admin panel: " +
          error.message
      );
    }
  }

  function openAdmin(session) {
    $("#login")?.classList.add(
      "hidden"
    );

    $("#app")?.classList.remove(
      "hidden"
    );

    if ($("#adminEmail")) {
      $("#adminEmail").textContent =
        session?.user?.email || "";
    }

    loadWebsite();
    refreshDashboard();
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  $("#loginForm")?.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      showLoginMessage("");

      if (!isConfigured()) {
        return;
      }

      const email =
        $("#email")?.value
          ?.trim() || "";

      const password =
        $("#password")?.value || "";

      if (!email || !password) {
        showLoginMessage(
          "Please enter email and password."
        );
        return;
      }

      setLoginLoading(true);

      try {
        const {
          data,
          error
        } =
          await db.auth.signInWithPassword({
            email,
            password
          });

        if (error) {
          console.error(
            "Login error:",
            error
          );

          showLoginMessage(
            error.message ||
              "Login failed."
          );

          return;
        }

        if (!data?.user) {
          showLoginMessage(
            "Login failed. No user session was returned."
          );

          return;
        }

        const valid =
          await verifyAdmin(
            data.user
          );

        if (!valid) {
          return;
        }

        showLoginMessage("");

        openAdmin(
          data.session
        );

      } catch (error) {
        console.error(
          "Login exception:",
          error
        );

        showLoginMessage(
          "Login error: " +
            error.message
        );

      } finally {
        setLoginLoading(false);
      }
    }
  );

  // ==========================================================
  // FORGOT PASSWORD
  // ==========================================================

  $("#forgot")?.addEventListener(
    "click",
    async () => {
      if (!isConfigured()) return;

      const email =
        $("#email")?.value
          ?.trim() || "";

      if (!email) {
        showLoginMessage(
          "Enter your admin email first."
        );

        return;
      }

      try {
        const {
          error
        } =
          await db.auth.resetPasswordForEmail(
            email,
            {
              redirectTo:
                window.location.href
            }
          );

        if (error) {
          showLoginMessage(
            error.message
          );
        } else {
          showLoginMessage(
            "Password reset email sent."
          );
        }

      } catch (error) {
        showLoginMessage(
          error.message
        );
      }
    }
  );

  // ==========================================================
  // LOGOUT
  // ==========================================================

  $("#logout")?.addEventListener(
    "click",
    async () => {
      if (!db) return;

      await db.auth.signOut();

      window.location.reload();
    }
  );

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  $$("nav button").forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          $$("nav button").forEach(
            (item) => {
              item.classList.remove(
                "active"
              );
            }
          );

          button.classList.add(
            "active"
          );

          $$(".tab").forEach(
            (section) => {
              section.classList.remove(
                "active"
              );
            }
          );

          const tabName =
            button.dataset.tab;

          const target =
            $("#" + tabName);

          if (target) {
            target.classList.add(
              "active"
            );
          }

          if ($("#title")) {
            $("#title").textContent =
              button.textContent
                .replace(
                  /^[^A-Za-z0-9]+/,
                  ""
                )
                .trim();
          }

          if (
            tabName === "events"
          ) {
            loadEvents();
          }

          if (
            tabName === "gallery"
          ) {
            loadGallery();
          }

          if (
            tabName === "members"
          ) {
            loadMembers();
          }

          if (
            tabName === "messages"
          ) {
            loadMessages();
          }
        }
      );
    }
  );

  // ==========================================================
  // FORM HELPERS
  // ==========================================================

  function setFormValues(
    formSelector,
    data
  ) {
    const form =
      $(formSelector);

    if (!form) return;

    Object.keys(data || {}).forEach(
      (key) => {
        const field =
          form.elements[key];

        if (!field) return;

        field.value =
          data[key] ?? "";
      }
    );
  }

  function collectWebsiteData() {
    const data = {
      id: true
    };

    const forms = [
      $("#siteForm"),
      $("#contentForm"),
      $("#contactFormAdmin")
    ];

    forms.forEach((form) => {
      if (!form) return;

      Array.from(
        form.elements
      ).forEach((field) => {
        if (!field.name) return;

        data[field.name] =
          String(
            field.value ?? ""
          ).trim();
      });
    });

    return data;
  }

  // ==========================================================
  // WEBSITE SETTINGS
  // ==========================================================

  async function loadWebsite() {
    if (!db) return;

    try {
      const {
        data,
        error
      } = await db
        .from("site_settings")
        .select("*")
        .eq("id", true)
        .maybeSingle();

      if (error) {
        console.error(
          "Website settings:",
          error
        );

        showToast(
          "Unable to load website settings."
        );

        return;
      }

      const site =
        data || DEFAULT_SITE;

      setFormValues(
        "#siteForm",
        site
      );

      setFormValues(
        "#contentForm",
        site
      );

      setFormValues(
        "#contactFormAdmin",
        site
      );

    } catch (error) {
      console.error(error);

      showToast(
        "Unable to load website settings."
      );
    }
  }

  // ==========================================================
  // STORAGE UPLOAD
  // ==========================================================

  async function uploadImage(
    file,
    folder
  ) {
    if (!file || !db) {
      return null;
    }

    if (
      !file.type ||
      !file.type.startsWith(
        "image/"
      )
    ) {
      showToast(
        "Please select an image file."
      );

      return null;
    }

    const maxSize =
      8 * 1024 * 1024;

    if (file.size > maxSize) {
      showToast(
        "Image must be smaller than 8 MB."
      );

      return null;
    }

    const extension =
      (
        file.name
          .split(".")
          .pop() ||
        "jpg"
      )
        .toLowerCase()
        .replace(
          /[^a-z0-9]/g,
          ""
        ) || "jpg";

    const unique =
      typeof crypto !==
        "undefined" &&
      crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now();

    const filename =
      `${folder}/${Date.now()}-${unique}.${extension}`;

    try {
      const {
        error
      } =
        await db.storage
          .from("site-media")
          .upload(
            filename,
            file,
            {
              cacheControl:
                "3600",
              upsert: false
            }
          );

      if (error) {
        console.error(error);

        showToast(
          "Image upload failed: " +
            error.message
        );

        return null;
      }

      const {
        data
      } =
        db.storage
          .from("site-media")
          .getPublicUrl(
            filename
          );

      return data?.publicUrl ||
        null;

    } catch (error) {
      console.error(error);

      showToast(
        "Image upload failed: " +
          error.message
      );

      return null;
    }
  }

  // ==========================================================
  // FILE SELECTION
  // ==========================================================

  $("#logoFile")?.addEventListener(
    "change",
    () => {
      const file =
        $("#logoFile")
          ?.files?.[0];

      if ($("#logoStatus")) {
        $("#logoStatus").textContent =
          file
            ? file.name
            : "No new file selected.";
      }
    }
  );

  $("#heroImageFile")?.addEventListener(
    "change",
    () => {
      const file =
        $("#heroImageFile")
          ?.files?.[0];

      if (
        $("#heroImageStatus")
      ) {
        $("#heroImageStatus").textContent =
          file
            ? file.name
            : "No new file selected.";
      }
    }
  );

  // ==========================================================
  // SAVE WEBSITE
  // ==========================================================

  $("#saveSite")?.addEventListener(
    "click",
    async () => {
      if (!db) return;

      const data =
        collectWebsiteData();

      const logoFile =
        $("#logoFile")
          ?.files?.[0];

      if (logoFile) {
        const logoURL =
          await uploadImage(
            logoFile,
            "logo"
          );

        if (logoURL) {
          data.logo_url =
            logoURL;
        }
      }

      const heroFile =
        $("#heroImageFile")
          ?.files?.[0];

      if (heroFile) {
        const heroURL =
          await uploadImage(
            heroFile,
            "hero"
          );

        if (heroURL) {
          data.hero_image_url =
            heroURL;
        }
      }

      try {
        const {
          error
        } =
          await db
            .from("site_settings")
            .upsert(
              data,
              {
                onConflict:
                  "id"
              }
            );

        if (error) {
          console.error(error);

          showToast(
            "Save failed: " +
              error.message
          );

          return;
        }

        if ($("#logoFile")) {
          $("#logoFile").value =
            "";
        }

        if (
          $("#heroImageFile")
        ) {
          $("#heroImageFile").value =
            "";
        }

        if ($("#logoStatus")) {
          $("#logoStatus").textContent =
            "Saved.";
        }

        if (
          $("#heroImageStatus")
        ) {
          $("#heroImageStatus").textContent =
            "Saved.";
        }

        await loadWebsite();

        showToast(
          "Website, contact and social details saved."
        );

      } catch (error) {
        console.error(error);

        showToast(
          "Save failed: " +
            error.message
        );
      }
    }
  );

  // ==========================================================
  // RESET WEBSITE
  // ==========================================================

  $("#resetSite")?.addEventListener(
    "click",
    async () => {
      if (!db) return;

      const confirmed =
        window.confirm(
          "Reset homepage content to the default WBDYM content?"
        );

      if (!confirmed) return;

      try {
        const {
          error
        } =
          await db
            .from("site_settings")
            .upsert(
              DEFAULT_SITE,
              {
                onConflict:
                  "id"
              }
            );

        if (error) {
          showToast(
            "Reset failed: " +
              error.message
          );

          return;
        }

        await loadWebsite();

        showToast(
          "Homepage defaults restored."
        );

      } catch (error) {
        showToast(
          error.message
        );
      }
    }
  );

  // ==========================================================
  // EVENTS
  // ==========================================================

  function eventEditor(event = {}) {
    return `
      <div class="item"
           data-id="${escapeHTML(
             event.id || ""
           )}">

        <div class="row">

          <label>
            Title
            <input
              class="event-title"
              value="${escapeHTML(
                event.title
              )}"
            >
          </label>

          <label>
            Date
            <input
              class="event-date"
              type="date"
              value="${escapeHTML(
                event.event_date
              )}"
            >
          </label>

          <label>
            Location
            <input
              class="event-location"
              value="${escapeHTML(
                event.location
              )}"
            >
          </label>

        </div>

        <div class="upload-inline">

          <label>
            Image URL
            <input
              class="event-image"
              value="${escapeHTML(
                event.image_url
              )}"
            >
          </label>

          <label>
            Upload event image
            <input
              class="event-file"
              type="file"
              accept="image/*"
            >
          </label>

        </div>

        <label>
          Description
          <textarea
            class="event-description"
          >${escapeHTML(
            event.description
          )}</textarea>
        </label>

        <label class="check">

          <input
            class="event-published"
            type="checkbox"
            ${
              event.published !== false
                ? "checked"
                : ""
            }
          >

          Published

        </label>

        ${
          event.image_url
            ? `
              <img
                class="preview"
                src="${escapeHTML(
                  event.image_url
                )}"
                alt="Event image"
              >
            `
            : ""
        }

        <div class="actions">

          <button
            class="danger delete-event"
            type="button"
          >
            Delete
          </button>

          <button
            class="save-event"
            type="button"
          >
            Save event
          </button>

        </div>

      </div>
    `;
  }

  async function loadEvents() {
    if (!db || !$("#eventsList"))
      return;

    try {
      const {
        data,
        error
      } =
        await db
          .from("events")
          .select("*")
          .order(
            "event_date",
            {
              ascending: true
            }
          );

      if (error) {
        console.error(error);
        return;
      }

      if (!data?.length) {
        $("#eventsList").innerHTML =
          `
          <div class="card">
            No events yet.
          </div>
        `;

        return;
      }

      $("#eventsList").innerHTML =
        data
          .map(eventEditor)
          .join("");

    } catch (error) {
      console.error(error);
    }
  }

  $("#addEvent")?.addEventListener(
    "click",
    () => {
      $("#eventsList")
        ?.insertAdjacentHTML(
          "afterbegin",
          eventEditor({})
        );
    }
  );

  $("#eventsList")?.addEventListener(
    "click",
    async (event) => {
      const item =
        event.target.closest(
          ".item"
        );

      if (!item) return;

      // DELETE
      if (
        event.target.classList.contains(
          "delete-event"
        )
      ) {
        const id =
          item.dataset.id;

        if (!id) {
          item.remove();
          return;
        }

        if (
          !window.confirm(
            "Delete this event?"
          )
        ) {
          return;
        }

        const {
          error
        } =
          await db
            .from("events")
            .delete()
            .eq("id", id);

        if (error) {
          showToast(
            error.message
          );
          return;
        }

        showToast(
          "Event deleted."
        );

        await loadEvents();
        await refreshDashboard();

        return;
      }

      // SAVE
      if (
        event.target.classList.contains(
          "save-event"
        )
      ) {
        let imageURL =
          item.querySelector(
            ".event-image"
          )?.value
            ?.trim() || "";

        const file =
          item.querySelector(
            ".event-file"
          )?.files?.[0];

        if (file) {
          const uploaded =
            await uploadImage(
              file,
              "events"
            );

          if (uploaded) {
            imageURL =
              uploaded;
          }
        }

        const record = {
          title:
            item.querySelector(
              ".event-title"
            )?.value
              ?.trim() || "",

          event_date:
            item.querySelector(
              ".event-date"
            )?.value ||
            null,

          location:
            item.querySelector(
              ".event-location"
            )?.value
              ?.trim() || "",

          image_url:
            imageURL,

          description:
            item.querySelector(
              ".event-description"
            )?.value
              ?.trim() || "",

          published:
            item.querySelector(
              ".event-published"
            )?.checked ??
            true
        };

        let response;

        if (item.dataset.id) {
          response =
            await db
              .from("events")
              .update(record)
              .eq(
                "id",
                item.dataset.id
              );
        } else {
          response =
            await db
              .from("events")
              .insert(record);
        }

        if (response.error) {
          showToast(
            response.error.message
          );

          return;
        }

        showToast(
          "Event saved successfully."
        );

        await loadEvents();
        await refreshDashboard();
      }
    }
  );

  // ==========================================================
  // GALLERY
  // ==========================================================

  function galleryEditor(
    image = {}
  ) {
    return `
      <div
        class="item"
        data-id="${escapeHTML(
          image.id || ""
        )}"
      >

        <div class="row">

          <label>
            Title
            <input
              class="gallery-title"
              value="${escapeHTML(
                image.title
              )}"
            >
          </label>

          <label>
            Image URL
            <input
              class="gallery-image"
              value="${escapeHTML(
                image.image_url
              )}"
            >
          </label>

          <label>
            Upload photo
            <input
              class="gallery-file"
              type="file"
              accept="image/*"
            >
          </label>

        </div>

        <label>
          Caption
          <input
            class="gallery-caption"
            value="${escapeHTML(
              image.caption
            )}"
          >
        </label>

        <label class="check">

          <input
            class="gallery-published"
            type="checkbox"
            ${
              image.published !== false
                ? "checked"
                : ""
            }
          >

          Published

        </label>

        ${
          image.image_url
            ? `
              <img
                class="preview"
                src="${escapeHTML(
                  image.image_url
                )}"
                alt="Gallery image"
              >
            `
            : ""
        }

        <div class="actions">

          <button
            class="danger delete-gallery"
            type="button"
          >
            Delete
          </button>

          <button
            class="save-gallery"
            type="button"
          >
            Save image
          </button>

        </div>

      </div>
    `;
  }

  async function loadGallery() {
    if (!db || !$("#galleryList"))
      return;

    try {
      const {
        data,
        error
      } =
        await db
          .from("gallery")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false
            }
          );

      if (error) {
        console.error(error);
        return;
      }

      if (!data?.length) {
        $("#galleryList").innerHTML =
          `
          <div class="card">
            No gallery images yet.
          </div>
        `;

        return;
      }

      $("#galleryList").innerHTML =
        data
          .map(galleryEditor)
          .join("");

    } catch (error) {
      console.error(error);
    }
  }

  $("#addGallery")?.addEventListener(
    "click",
    () => {
      $("#galleryList")
        ?.insertAdjacentHTML(
          "afterbegin",
          galleryEditor({})
        );
    }
  );

  $("#galleryList")?.addEventListener(
    "click",
    async (event) => {
      const item =
        event.target.closest(
          ".item"
        );

      if (!item) return;

      // DELETE
      if (
        event.target.classList.contains(
          "delete-gallery"
        )
      ) {
        const id =
          item.dataset.id;

        if (!id) {
          item.remove();
          return;
        }

        if (
          !window.confirm(
            "Delete this gallery image?"
          )
        ) {
          return;
        }

        const {
          error
        } =
          await db
            .from("gallery")
            .delete()
            .eq("id", id);

        if (error) {
          showToast(
            error.message
          );
          return;
        }

        showToast(
          "Gallery image deleted."
        );

        await loadGallery();
        await refreshDashboard();

        return;
      }

      // SAVE
      if (
        event.target.classList.contains(
          "save-gallery"
        )
      ) {
        let imageURL =
          item.querySelector(
            ".gallery-image"
          )?.value
            ?.trim() || "";

        const file =
          item.querySelector(
            ".gallery-file"
          )?.files?.[0];

        if (file) {
          const uploaded =
            await uploadImage(
              file,
              "gallery"
            );

          if (uploaded) {
            imageURL =
              uploaded;
          }
        }

        if (!imageURL) {
          showToast(
            "Please upload a photo or enter an image URL."
          );

          return;
        }

        const record = {
          title:
            item.querySelector(
              ".gallery-title"
            )?.value
              ?.trim() || "",

          image_url:
            imageURL,

          caption:
            item.querySelector(
              ".gallery-caption"
            )?.value
              ?.trim() || "",

          published:
            item.querySelector(
              ".gallery-published"
            )?.checked ??
            true
        };

        let response;

        if (item.dataset.id) {
          response =
            await db
              .from("gallery")
              .update(record)
              .eq(
                "id",
                item.dataset.id
              );
        } else {
          response =
            await db
              .from("gallery")
              .insert(record);
        }

        if (response.error) {
          showToast(
            response.error.message
          );

          return;
        }

        showToast(
          "Gallery image saved."
        );

        await loadGallery();
        await refreshDashboard();
      }
    }
  );

  // ==========================================================
  // MEMBERS
  // ==========================================================

  async function loadMembers() {
    if (!db || !$("#membersTable"))
      return;

    try {
      const {
        data,
        error
      } =
        await db
          .from("members")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false
            }
          );

      if (error) {
        console.error(error);
        return;
      }

      if (!data?.length) {
        $("#membersTable").innerHTML =
          `
          <tr>
            <td colspan="5">
              No members yet.
            </td>
          </tr>
        `;

        return;
      }

      $("#membersTable").innerHTML =
        data
          .map(
            (member) => `
              <tr>

                <td>
                  ${escapeHTML(
                    member.name
                  )}
                </td>

                <td>
                  ${escapeHTML(
                    member.email
                  )}
                </td>

                <td>
                  ${escapeHTML(
                    member.phone
                  )}
                </td>

                <td>
                  ${escapeHTML(
                    member.district
                  )}
                </td>

                <td>
                  ${escapeHTML(
                    member.status
                  )}
                </td>

              </tr>
            `
          )
          .join("");

    } catch (error) {
      console.error(error);
    }
  }

  // ==========================================================
  // CONTACT MESSAGES
  // ==========================================================

  async function loadMessages() {
    if (
      !db ||
      !$("#messagesList")
    ) {
      return;
    }

    try {
      const {
        data,
        error
      } =
        await db
          .from("contact_messages")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false
            }
          );

      if (error) {
        console.error(error);
        return;
      }

      if (!data?.length) {
        $("#messagesList").innerHTML =
          `
          <div class="card">
            No contact messages yet.
          </div>
        `;

        return;
      }

      $("#messagesList").innerHTML =
        data
          .map(
            (message) => `
              <div class="item">

                <h3>
                  ${escapeHTML(
                    message.subject ||
                    "Contact Message"
                  )}
                </h3>

                <p>
                  <strong>
                    ${escapeHTML(
                      message.name
                    )}
                  </strong>

                  ·

                  ${escapeHTML(
                    message.email
                  )}
                </p>

                <p>
                  ${escapeHTML(
                    message.message
                  )}
                </p>

              </div>
            `
          )
          .join("");

    } catch (error) {
      console.error(error);
    }
  }

  // ==========================================================
  // DASHBOARD COUNTS
  // ==========================================================

  async function getCount(
    table
  ) {
    if (!db) return 0;

    try {
      const {
        count,
        error
      } =
        await db
          .from(table)
          .select(
            "id",
            {
              count: "exact",
              head: true
            }
          );

      if (error) {
        console.error(
          table,
          error
        );

        return 0;
      }

      return count || 0;

    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  async function refreshDashboard() {
    if (!db) return;

    const [
      events,
      gallery,
      members,
      messages
    ] =
      await Promise.all([
        getCount("events"),
        getCount("gallery"),
        getCount("members"),
        getCount(
          "contact_messages"
        )
      ]);

    if ($("#eventCount")) {
      $("#eventCount").textContent =
        events;
    }

    if ($("#galleryCount")) {
      $("#galleryCount").textContent =
        gallery;
    }

    if ($("#memberCount")) {
      $("#memberCount").textContent =
        members;
    }

    if ($("#messageCount")) {
      $("#messageCount").textContent =
        messages;
    }

    await loadEvents();
    await loadGallery();
    await loadMembers();
    await loadMessages();
  }

  // ==========================================================
  // CHANGE PASSWORD
  // ==========================================================

  $("#passForm")?.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      if (!db) return;

      const password =
        $("#newPass")?.value ||
        "";

      const confirmPassword =
        $("#confirmPass")?.value ||
        "";

      if (
        password !==
        confirmPassword
      ) {
        showToast(
          "Passwords do not match."
        );

        return;
      }

      if (password.length < 8) {
        showToast(
          "Password must be at least 8 characters."
        );

        return;
      }

      try {
        const {
          error
        } =
          await db.auth.updateUser({
            password
          });

        if (error) {
          showToast(
            error.message
          );

          return;
        }

        event.target.reset();

        showToast(
          "Password changed successfully."
        );

      } catch (error) {
        showToast(
          error.message
        );
      }
    }
  );

  // ==========================================================
  // SEND RESET EMAIL
  // ==========================================================

  $("#sendReset")?.addEventListener(
    "click",
    async () => {
      if (!db) return;

      const user =
        await getCurrentUser();

      if (!user?.email) {
        showToast(
          "Admin email not found."
        );

        return;
      }

      try {
        const {
          error
        } =
          await db.auth.resetPasswordForEmail(
            user.email,
            {
              redirectTo:
                window.location.href
            }
          );

        if (error) {
          showToast(
            error.message
          );

          return;
        }

        showToast(
          "Password reset email sent."
        );

      } catch (error) {
        showToast(
          error.message
        );
      }
    }
  );

  // ==========================================================
  // AUTH STATE
  // ==========================================================

  if (db) {
    db.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "SIGNED_OUT"
        ) {
          $("#login")?.classList.remove(
            "hidden"
          );

          $("#app")?.classList.add(
            "hidden"
          );
        }
      }
    );
  }

  // ==========================================================
  // START
  // ==========================================================

  startAdmin();

});
