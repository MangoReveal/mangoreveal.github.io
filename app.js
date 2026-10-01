(() => {
  "use strict";

  const CONFIG = {
    // TODO: replace with the actual Reddit post link once it's live.
    redditPostUrl: "#",
    hideUpvotePopupKey: "blackedout-hide-upvote-popup",

    standardBackgroundVideo: "./Mango/background.mp4",
    hdBackgroundVideo: "./Mango/backgroundHD.mp4",

    // TODO: set this once the Cloud Run video service is deployed,
    // e.g. "https://whos-that-pokemon-video-xxxxx.a.run.app".
    // Leave blank to keep using the in-browser recording fallback.
    videoServiceUrl: "",

    pokeApiBase: "https://pokeapi.co/api/v2",
    maxSearchResults: 50,
    maxSoundDuration: 2.5,
    searchDebounceMs: 300,

    timing: {
      blankStart: 0.88,
      blankEnd: 9.58,
      revealedStart: 9.59,
      soundStart: 9.89,
    },

    volume: {
      preview: 1,
      background: 1,
      sound: 0.5,
    },

    canvas: {
      width: 1920,
      height: 1080,
    },

    artwork: {
      defaultWidth: 470,
      defaultHeight: 470,
      centerX: 580,
      centerY: 490,
      minSize: 90,
      maxSize: 1080,
    },
  };

  const state = {
    initialized: false,
    destroyed: false,

    selectedPokemon: null,
    selectedSound: null,
    pokemonSearchResults: [],
    searchTimer: null,

    revealedImage: null,
    blankImage: null,
    revealedSource: "fallback",
    blankSource: "fallback",

    artwork: {
      x: CONFIG.artwork.centerX,
      y: CONFIG.artwork.centerY,
      width: CONFIG.artwork.defaultWidth,
      height: CONFIG.artwork.defaultHeight,

      dragging: false,
      resizing: false,
      pointerId: null,

      startPointerX: 0,
      startPointerY: 0,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
    },

    timing: {
      ...CONFIG.timing,
    },

    snip: {
      enabled: false,
      start: 5,
      end: 8.72,
    },

    exportFrameRate: 30,
    exportQuality: 6_000_000,
    sharpenEnabled: true,

    showNameText: true,

    volume: {
      ...CONFIG.volume,
      muted: false,
    },

    sound: {
      activeUrl: null,
      activeObjectUrl: null,
      activeLabel: "Default sound ready",
      activeDetail: "Used automatically when you play the reveal",
      source: "default",
      buffer: null,
      duration: 0,
      trimStart: 0,
      trimEnd: 0,
      previewElement: null,
    },

    recording: {
      mediaRecorder: null,
      stream: null,
      chunks: [],
      startedAt: 0,
      timerId: null,
    },

    previewAudio: {
      context: null,
      backgroundSource: null,
      backgroundGain: null,
      destination: null,
      connectedVideo: null,
    },

    export: {
      started: false,
      recorder: null,
      chunks: [],
      stream: null,
      audioContext: null,
      animationFrame: null,
    },

    preview: {
      animationFrame: null,
      soundTriggered: false,
    },

    objectUrls: new Set(),
    ui: {},
  };

  const $ = (selector, root = document) => root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  function cacheUi() {
    state.ui = {
      backgroundVideo: $("#backgroundVideo"),
      canvas: $("#outputCanvas"),
      canvasMessage: $("#canvasMessage"),
      centerPlayButton: $("#centerPlayButton"),

      playPauseButton: $("#playPauseButton"),
      muteButton: $("#muteButton"),
      previewVolume: $("#previewVolume"),
      timeline: $("#timeline"),
      currentTime: $("#currentTime"),
      duration: $("#duration"),
      downloadButton: $("#downloadButton"),
      editorReadyBadge: $("#editorReadyBadge"),

      advancedSettingsButton: $("#advancedSettingsButton"),
      closeAdvancedSettingsButton: $(
        "#closeAdvancedSettingsButton",
      ),
      advancedSettings: $("#advancedSettings"),

      advancedBlankStart: $("#advancedBlankStart"),
      advancedBlankEnd: $("#advancedBlankEnd"),
      advancedRevealedStart: $("#advancedRevealedStart"),
      advancedSoundStart: $("#advancedSoundStart"),

      advancedBlankStartLabel: $("#advancedBlankStartLabel"),
      advancedBlankEndLabel: $("#advancedBlankEndLabel"),
      advancedRevealedStartLabel: $(
        "#advancedRevealedStartLabel",
      ),
      advancedSoundStartLabel: $("#advancedSoundStartLabel"),

      snipEnabled: $("#snipEnabled"),
      snipStart: $("#snipStart"),
      snipEnd: $("#snipEnd"),
      snipStartLabel: $("#snipStartLabel"),
      snipEndLabel: $("#snipEndLabel"),
      snipStatus: $("#snipStatus"),

      useHdBackground: $("#useHdBackground"),
      hdBackgroundStatus: $("#hdBackgroundStatus"),

      exportFrameRate: $("#exportFrameRate"),
      exportFrameRateLabel: $("#exportFrameRateLabel"),

      exportQuality: $("#exportQuality"),
      exportQualityLabel: $("#exportQualityLabel"),
      sharpenVideo: $("#sharpenVideo"),

      backgroundVolume: $("#backgroundVolume"),
      soundVolume: $("#soundVolume"),
      backgroundVolumeLabel: $("#backgroundVolumeLabel"),
      soundVolumeLabel: $("#soundVolumeLabel"),

      advancedResetPositionButton: $(
        "#advancedResetPositionButton",
      ),
      advancedResetAllButton: $("#advancedResetAllButton"),

      pokemonSearch: $("#pokemonSearch"),
      pokemonSearchButton: $("#pokemonSearchButton"),
      pokemonResults: $("#pokemonResults"),
      loadPokemonButton: $("#loadPokemonButton"),
      pokemonLookupStatus: $("#pokemonLookupStatus"),
      pokemonName: $("#pokemonName"),
      showNameText: $("#showNameText"),

      blankImageInput: $("#blankImageInput"),
      revealedImageInput: $("#revealedImageInput"),
      regenerateSilhouetteButton: $(
        "#regenerateSilhouetteButton",
      ),
      resetPositionButton: $("#resetPositionButton"),

      pictureStatus: $("#pictureStatus"),

      soundStatus: $("#soundStatus"),

      chooseAudioButton: $("#chooseAudioButton"),
      recordAudioButton: $("#recordAudioButton"),
      audioInput: $("#audioInput"),
      recordingControls: $("#recordingControls"),
      stopRecordingButton: $("#stopRecordingButton"),
      recordingTimer: $("#recordingTimer"),

      crySelector: $("#crySelector"),
      cryPokemonLabel: $("#cryPokemonLabel"),
      cryVersion: $("#cryVersion"),
      cryStatus: $("#cryStatus"),
      previewCryButton: $("#previewCryButton"),
      useCryButton: $("#useCryButton"),

      editAudioButton: $("#editAudioButton"),
      audioEditor: $("#audioEditor"),
      audioDurationLabel: $("#audioDurationLabel"),
      audioTrimStart: $("#audioTrimStart"),
      audioTrimEnd: $("#audioTrimEnd"),
      audioTrimStartLabel: $("#audioTrimStartLabel"),
      audioTrimEndLabel: $("#audioTrimEndLabel"),
      audioTrimStatus: $("#audioTrimStatus"),
      playAudioSelectionButton: $(
        "#playAudioSelectionButton",
      ),

      pokemonTabSummary: $("#pokemonTabSummary"),
      pictureTabSummary: $("#pictureTabSummary"),
      soundTabSummary: $("#soundTabSummary"),
      timingTabSummary: $("#timingTabSummary"),

      pokemonTabState: $("#pokemonTabState"),
      pictureTabState: $("#pictureTabState"),
      soundTabState: $("#soundTabState"),
      timingTabState: $("#timingTabState"),

      workflowTabs: $$(".workflow-tab"),
      workflowPanels: $$(".workflow-panel"),
      nextButtons: $$(".workflow-next-button"),
      backButtons: $$(".workflow-back-button"),

      upvotePopup: $("#upvotePopup"),
      upvoteLink: $("#upvoteLink"),
      dismissUpvotePopup: $("#dismissUpvotePopup"),
      hideUpvotePopup: $("#hideUpvotePopup"),
    };
  }

  function setStatus(element, message, type = "") {
    if (!element) {
      return;
    }

    element.textContent = message;
    element.classList.remove(
      "is-success",
      "is-error",
      "is-loading",
    );

    if (type) {
      element.classList.add(`is-${type}`);
    }
  }

  function setCanvasMessage(message, visible = true) {
    if (!state.ui.canvasMessage) {
      return;
    }

    state.ui.canvasMessage.textContent = message;
    state.ui.canvasMessage.hidden = !visible;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function formatTime(seconds) {
    const safeSeconds = Number.isFinite(seconds)
      ? Math.max(seconds, 0)
      : 0;

    const minutes = Math.floor(safeSeconds / 60);
    const remainder = safeSeconds - minutes * 60;

    return `${String(minutes).padStart(2, "0")}:${remainder
      .toFixed(2)
      .padStart(5, "0")}`;
  }

  function formatShortTime(seconds) {
    return `${Math.max(0, seconds || 0).toFixed(2)}s`;
  }

  function formatClock(seconds) {
    const safeSeconds = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainder,
    ).padStart(2, "0")}`;
  }

  function trackObjectUrl(url) {
    if (url && url.startsWith("blob:")) {
      state.objectUrls.add(url);
    }

    return url;
  }

  function revokeObjectUrl(url) {
    if (!url || !url.startsWith("blob:")) {
      return;
    }

    URL.revokeObjectURL(url);
    state.objectUrls.delete(url);
  }

  function revokeAllObjectUrls() {
    for (const url of state.objectUrls) {
      URL.revokeObjectURL(url);
    }

    state.objectUrls.clear();
  }

  async function fetchPokeApiJson(url) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status}`,
      );
    }

    return response.json();
  }

  let cachedPokemonIndex = null;

  async function getPokemonIndex() {
    if (!cachedPokemonIndex) {
      const data = await fetchPokeApiJson(
        `${CONFIG.pokeApiBase}/pokemon?limit=2000&offset=0`,
      );

      cachedPokemonIndex = data.results || [];
    }

    return cachedPokemonIndex;
  }

  function cleanSearchQuery(value) {
    return (value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\-\s]/g, "")
      .slice(0, 40);
  }

  function normalizePokemonName(value) {
    return (value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function toDisplayName(name) {
    return String(name || "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function extractPokemonSummary(item) {
    const match = item.url.match(/\/pokemon\/(\d+)\/?$/);

    return {
      id: match ? Number(match[1]) : null,
      name: item.name,
      displayName: toDisplayName(item.name),
      url: item.url,
    };
  }

  function extractCryUrl(data, version) {
    const cries = data.cries || {};

    if (version === "legacy") {
      return cries.legacy || cries.latest || null;
    }

    return cries.latest || cries.legacy || null;
  }

  function extractPokemonDetails(data) {
    const cries = {
      latest: extractCryUrl(data, "latest"),
      legacy: extractCryUrl(data, "legacy"),
    };

    const artwork =
      data.sprites?.other?.["official-artwork"]
        ?.front_default ||
      data.sprites?.front_default ||
      null;

    return {
      id: data.id,
      name: data.name,
      displayName: toDisplayName(data.name),
      artwork,
      cries,
      availableCryVersions: Object.keys(cries).filter(
        (key) =>
          typeof cries[key] === "string" &&
          cries[key].startsWith("http"),
      ),
    };
  }

  async function searchPokemonByQuery(rawQuery) {
    const query = cleanSearchQuery(rawQuery);

    if (query.length < 2) {
      return [];
    }

    const index = await getPokemonIndex();
    const queryName = normalizePokemonName(query);
    const results = [];

    for (const item of index) {
      if (
        normalizePokemonName(item.name).includes(
          queryName,
        )
      ) {
        results.push(extractPokemonSummary(item));

        if (
          results.length >= CONFIG.maxSearchResults
        ) {
          break;
        }
      }
    }

    return results;
  }

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.crossOrigin = "anonymous";

      image.onload = () => resolve(image);
      image.onerror = () => reject(
        new Error("Image could not be loaded."),
      );
      image.src = source;
    });
  }

  function isImageUsable(image) {
    return Boolean(
      image &&
        image.complete &&
        image.naturalWidth > 0 &&
        image.naturalHeight > 0,
    );
  }

  function setUiEnabled(enabled) {
    const elements = [
      state.ui.playPauseButton,
      state.ui.centerPlayButton,
      state.ui.muteButton,
      state.ui.timeline,
    ];

    for (const element of elements) {
      if (element) {
        element.disabled = !enabled;
      }
    }
  }

  function updateEditorStatus(message) {
    if (state.ui.editorReadyBadge) {
      state.ui.editorReadyBadge.textContent = message;
    }
  }

  function switchPanel(panelId) {
    const target = document.getElementById(panelId);

    if (!target) {
      return;
    }

    for (const panel of state.ui.workflowPanels) {
      const isTarget = panel === target;

      panel.hidden = !isTarget;
      panel.classList.toggle("active", isTarget);
    }

    for (const tab of state.ui.workflowTabs) {
      const isTarget = tab.dataset.panel === panelId;

      tab.classList.toggle("active", isTarget);

      if (isTarget) {
        tab.setAttribute("aria-current", "step");
      } else {
        tab.removeAttribute("aria-current");
      }
    }

    if (window.matchMedia("(max-width: 920px)").matches) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }

    updateWorkflowSummaries();
  }

  function updateWorkflowSummaries() {
    const pokemonName =
      state.selectedPokemon?.displayName ||
      state.ui.pokemonName?.value?.trim() ||
      "Choose a Pokémon";

    state.ui.pokemonTabSummary.textContent = pokemonName;

    state.ui.pictureTabSummary.textContent =
      state.revealedImage && state.blankImage
        ? "Mystery and reveal pictures ready"
        : "Choose the pictures";

    state.ui.soundTabSummary.textContent =
      state.sound.source === "default"
        ? "Default sound ready"
        : "Custom sound selected";

    state.ui.timingTabSummary.textContent =
      state.ui.backgroundVideo?.readyState >= 1
        ? "Ready to download"
        : "Get your video";

    const statuses = [
      [
        state.ui.pokemonTabState,
        Boolean(state.selectedPokemon),
      ],
      [
        state.ui.pictureTabState,
        Boolean(state.revealedImage && state.blankImage),
      ],
      [
        state.ui.soundTabState,
        Boolean(state.sound.activeUrl),
      ],
      [
        state.ui.timingTabState,
        Boolean(state.ui.backgroundVideo?.readyState >= 1),
      ],
    ];

    for (const [element, complete] of statuses) {
      if (element) {
        element.textContent = complete ? "✓" : "•";
      }
    }
  }

  function bindWorkflowNavigation() {
    for (const tab of state.ui.workflowTabs) {
      tab.addEventListener("click", () => {
        switchPanel(tab.dataset.panel);
      });
    }

    for (const button of state.ui.nextButtons) {
      button.addEventListener("click", () => {
        switchPanel(button.dataset.nextPanel);
      });
    }

    for (const button of state.ui.backButtons) {
      button.addEventListener("click", () => {
        const previousPanel = button.dataset.previousPanel;

        if (previousPanel) {
          switchPanel(previousPanel);
        }
      });
    }
  }

  function updateSnipStatus() {
    if (!state.snip.enabled) {
      setStatus(
        state.ui.snipStatus,
        "Turn on the checkbox above to shorten the video.",
      );

      return;
    }

    const removed = Math.max(
      0,
      state.snip.end - state.snip.start,
    );

    setStatus(
      state.ui.snipStatus,
      `Removes ${removed.toFixed(2)}s (from ${
        state.snip.start.toFixed(2)
      }s to ${state.snip.end.toFixed(2)}s).`,
      "success",
    );
  }

  function normalizeSnip() {
    const duration = Number.isFinite(
      state.ui.backgroundVideo.duration,
    )
      ? state.ui.backgroundVideo.duration
      : 60;

    state.snip.start = clamp(
      state.snip.start,
      0,
      duration,
    );

    state.snip.end = clamp(
      Math.max(state.snip.start, state.snip.end),
      0,
      duration,
    );

    state.ui.snipStart.value = String(state.snip.start);
    state.ui.snipEnd.value = String(state.snip.end);

    state.ui.snipStartLabel.textContent =
      state.snip.start.toFixed(2);

    state.ui.snipEndLabel.textContent =
      state.snip.end.toFixed(2);

    updateSnipStatus();
  }

  function updateSnipControls(
    duration = state.ui.backgroundVideo.duration,
  ) {
    const safeDuration =
      Number.isFinite(duration) && duration > 0
        ? duration
        : 60;

    state.ui.snipStart.max = String(safeDuration);
    state.ui.snipEnd.max = String(safeDuration);

    normalizeSnip();
  }

  function bindSnipControls() {
    state.ui.snipEnabled.addEventListener(
      "change",
      () => {
        state.snip.enabled =
          state.ui.snipEnabled.checked;

        state.ui.snipStart.disabled =
          !state.snip.enabled;

        state.ui.snipEnd.disabled =
          !state.snip.enabled;

        updateSnipStatus();
        drawFrame();
      },
    );

    state.ui.snipStart.addEventListener(
      "input",
      () => {
        state.snip.start = Number(
          state.ui.snipStart.value,
        );

        normalizeSnip();
        drawFrame();
      },
    );

    state.ui.snipEnd.addEventListener(
      "input",
      () => {
        state.snip.end = Number(
          state.ui.snipEnd.value,
        );

        normalizeSnip();
        drawFrame();
      },
    );
  }

  function switchBackgroundVideoSource(url) {
    const video = state.ui.backgroundVideo;
    const wasPlaying = !video.paused;

    video.src = url;
    video.load();

    if (wasPlaying) {
      video.play().catch(() => {
        // Autoplay may be blocked after a manual source
        // change - not critical, the user can press play.
      });
    }
  }

  function bindVideoQualityControls() {
    state.ui.useHdBackground.addEventListener(
      "change",
      () => {
        const video = state.ui.backgroundVideo;

        if (!state.ui.useHdBackground.checked) {
          switchBackgroundVideoSource(
            CONFIG.standardBackgroundVideo,
          );

          setStatus(
            state.ui.hdBackgroundStatus,
            "Using the standard background video.",
          );

          return;
        }

        setStatus(
          state.ui.hdBackgroundStatus,
          "Loading the HD background video...",
          "loading",
        );

        const handleError = () => {
          state.ui.useHdBackground.checked = false;

          switchBackgroundVideoSource(
            CONFIG.standardBackgroundVideo,
          );

          setStatus(
            state.ui.hdBackgroundStatus,
            "backgroundHD.mp4 wasn't found - add it to the Mango folder to use this.",
            "error",
          );
        };

        video.addEventListener(
          "error",
          handleError,
          { once: true },
        );

        video.addEventListener(
          "loadedmetadata",
          () => {
            video.removeEventListener(
              "error",
              handleError,
            );

            setStatus(
              state.ui.hdBackgroundStatus,
              "Using the HD background video.",
              "success",
            );
          },
          { once: true },
        );

        switchBackgroundVideoSource(
          CONFIG.hdBackgroundVideo,
        );
      },
    );

    state.ui.exportFrameRate.addEventListener(
      "input",
      () => {
        state.exportFrameRate = Number(
          state.ui.exportFrameRate.value,
        );

        state.ui.exportFrameRateLabel.textContent =
          String(state.exportFrameRate);
      },
    );

    state.ui.exportQuality.addEventListener(
      "input",
      () => {
        const mbps = Number(
          state.ui.exportQuality.value,
        );

        state.exportQuality = mbps * 1_000_000;

        state.ui.exportQualityLabel.textContent =
          String(mbps);
      },
    );

    state.ui.sharpenVideo.addEventListener(
      "change",
      () => {
        state.sharpenEnabled =
          state.ui.sharpenVideo.checked;

        drawFrame();
      },
    );
  }

  function bindAdvancedSettings() {
    const openAdvanced = () => {
      state.ui.advancedSettings.hidden = false;
      state.ui.advancedSettingsButton.setAttribute(
        "aria-expanded",
        "true",
      );
    };

    const closeAdvanced = () => {
      state.ui.advancedSettings.hidden = true;
      state.ui.advancedSettingsButton.setAttribute(
        "aria-expanded",
        "false",
      );
    };

    state.ui.advancedSettingsButton.addEventListener(
      "click",
      () => {
        if (state.ui.advancedSettings.hidden) {
          openAdvanced();
        } else {
          closeAdvanced();
        }
      },
    );

    state.ui.closeAdvancedSettingsButton.addEventListener(
      "click",
      closeAdvanced,
    );
  }

  function bindBackgroundVideo() {
    const video = state.ui.backgroundVideo;

    video.addEventListener("loadedmetadata", () => {
      const duration = Number.isFinite(video.duration)
        ? video.duration
        : 0;

      state.ui.timeline.max = String(duration);
      state.ui.timeline.value = "0";
      state.ui.duration.textContent = formatTime(duration);

      updateTimingControls(duration);
      updateSnipControls(duration);
      updateEditorStatus("Ready");
      setCanvasMessage("", false);
      setUiEnabled(true);

      state.ui.downloadButton.disabled = false;

      updateWorkflowSummaries();
      drawFrame();
    });

    video.addEventListener("timeupdate", () => {
      if (!state.ui.timeline.matches(":active")) {
        state.ui.timeline.value = String(video.currentTime);
      }

      state.ui.currentTime.textContent = formatTime(
        video.currentTime,
      );

      drawFrame();
    });

    video.addEventListener("play", () => {
      updatePlayButton(true);

      // exportRenderLoop drives drawing during an export - it
      // calls video.play() itself, which fires this same event.
      // without this check we'd end up with both loops drawing
      // the same frame every tick for the whole export. found
      // that one by actually profiling, not fun
      if (!state.export.started) {
        startPreviewRenderLoop();
      }
    });

    video.addEventListener("pause", () => {
      updatePlayButton(false);
      stopPreviewRenderLoop();
      drawFrame();
    });

    video.addEventListener("ended", () => {
      updatePlayButton(false);
      stopPreviewRenderLoop();

      state.preview.soundTriggered = false;

      if (state.sound.previewElement) {
        state.sound.previewElement.pause();
        state.sound.previewElement.currentTime = 0;
      }

      drawFrame();
    });

    video.addEventListener("error", () => {
      updateEditorStatus("Video unavailable");

      setCanvasMessage(
        "The background video could not be loaded. Check Mango/background.mp4.",
        true,
      );
    });

    video.load();
  }

  function startPreviewRenderLoop() {
    // timeupdate fires like 4x/sec, way too choppy for a live
    // preview. rAF it is (same trick exportRenderLoop uses).
    if (state.preview.animationFrame !== null) {
      return;
    }

    const video = state.ui.backgroundVideo;

    const loop = () => {
      if (video.paused || video.ended) {
        state.preview.animationFrame = null;
        return;
      }

      // drawFrame() applies any snip skip first, so read
      // currentTime for the sound trigger after it, not before.
      drawFrame();
      maybeTriggerPokemonSound(video.currentTime);

      state.preview.animationFrame =
        requestAnimationFrame(loop);
    };

    state.preview.animationFrame =
      requestAnimationFrame(loop);
  }

  function maybeTriggerPokemonSound(currentTime) {
    if (!state.sound.previewElement) {
      return;
    }

    if (currentTime < state.timing.soundStart) {
      // Scrubbed back before the sound's start point - allow
      // it to trigger again if playback reaches soundStart.
      state.preview.soundTriggered = false;

      return;
    }

    if (state.preview.soundTriggered) {
      return;
    }

    state.preview.soundTriggered = true;

    state.sound.previewElement.currentTime = 0;
    state.sound.previewElement.volume =
      getEffectivePreviewVolume() * state.volume.sound;

    state.sound.previewElement
      .play()
      .catch(() => {});
  }

  function stopPreviewRenderLoop() {
    if (state.preview.animationFrame !== null) {
      cancelAnimationFrame(
        state.preview.animationFrame,
      );

      state.preview.animationFrame = null;
    }
  }

  const TIMING_CONTROLS = [
    [
      "advancedBlankStart",
      "advancedBlankStartLabel",
      "blankStart",
    ],
    [
      "advancedBlankEnd",
      "advancedBlankEndLabel",
      "blankEnd",
    ],
    [
      "advancedRevealedStart",
      "advancedRevealedStartLabel",
      "revealedStart",
    ],
    [
      "advancedSoundStart",
      "advancedSoundStartLabel",
      "soundStart",
    ],
  ];

  function bindTimingControls() {
    // bind once, here. updateTimingControls() gets called every
    // time the video reloads (HD toggle etc) - had listeners
    // stacking up silently before I split this out. classic.
    for (const [inputId, labelId, key] of TIMING_CONTROLS) {
      const input = state.ui[inputId];
      const label = state.ui[labelId];

      input.addEventListener("input", () => {
        state.timing[key] = Number(input.value);
        label.textContent = Number(input.value).toFixed(2);

        normalizeTiming();
        drawFrame();
      });
    }
  }

  function updateTimingControls(
    duration = state.ui.backgroundVideo.duration,
  ) {
    const safeDuration =
      Number.isFinite(duration) && duration > 0
        ? duration
        : 60;

    for (const [inputId, labelId, key] of TIMING_CONTROLS) {
      const input = state.ui[inputId];
      const label = state.ui[labelId];

      input.max = String(safeDuration);
      input.value = String(
        clamp(state.timing[key], 0, safeDuration),
      );
      label.textContent = Number(input.value).toFixed(2);
    }

    normalizeTiming();
  }

  function normalizeTiming() {
    const duration = Number.isFinite(
      state.ui.backgroundVideo.duration,
    )
      ? state.ui.backgroundVideo.duration
      : 60;

    state.timing.blankStart = clamp(
      state.timing.blankStart,
      0,
      duration,
    );

    state.timing.blankEnd = clamp(
      Math.max(
        state.timing.blankStart,
        state.timing.blankEnd,
      ),
      0,
      duration,
    );

    state.timing.revealedStart = clamp(
      Math.max(
        state.timing.blankEnd,
        state.timing.revealedStart,
      ),
      0,
      duration,
    );

    state.timing.soundStart = clamp(
      Math.max(
        state.timing.revealedStart,
        state.timing.soundStart,
      ),
      0,
      duration,
    );

    for (const [inputId, labelId, key] of TIMING_CONTROLS) {
      state.ui[inputId].value = String(state.timing[key]);
      state.ui[labelId].textContent =
        state.timing[key].toFixed(2);
    }
  }

  function updatePlayButton(isPlaying) {
    const icon = isPlaying ? "❚❚" : "▶";
    const label = isPlaying ? "Pause reveal" : "Play reveal";

    state.ui.playPauseButton.textContent = icon;
    state.ui.centerPlayButton.textContent = icon;

    state.ui.playPauseButton.setAttribute(
      "aria-label",
      label,
    );

    state.ui.centerPlayButton.setAttribute(
      "aria-label",
      label,
    );

    state.ui.playPauseButton.title = label;
    state.ui.centerPlayButton.title = label;
  }

  async function togglePreview() {
    const video = state.ui.backgroundVideo;

    if (video.paused) {
      try {
        await ensureAudioContextRunning();

        if (
          video.currentTime >= video.duration ||
          video.currentTime < 0
        ) {
          video.currentTime = 0;
        }

        if (state.sound.previewElement) {
          state.sound.previewElement.pause();
          state.sound.previewElement.currentTime = 0;
        }

        // don't fire the cry here - render loop below handles it
        // once currentTime actually hits soundStart. if we're
        // resuming past that point already, mark it triggered so
        // it doesn't play late and confuse everyone
        state.preview.soundTriggered =
          video.currentTime >= state.timing.soundStart;

        await video.play();
      } catch {
        setCanvasMessage(
          "Press Play reveal again to start the preview.",
          true,
        );
      }
    } else {
      video.pause();
      state.sound.previewElement?.pause();
    }
  }

  function bindPlaybackControls() {
    state.ui.playPauseButton.addEventListener(
      "click",
      togglePreview,
    );

    state.ui.centerPlayButton.addEventListener(
      "click",
      togglePreview,
    );

    state.ui.timeline.addEventListener("input", () => {
      state.ui.backgroundVideo.currentTime = Number(
        state.ui.timeline.value,
      );

      drawFrame();
    });

    state.ui.previewVolume.addEventListener("input", () => {
      const value = Number(
        state.ui.previewVolume.value,
      ) / 100;

      state.volume.preview = value;
      state.volume.muted = value === 0;

      applyPreviewVolume();
      updateMuteButton();
    });

    state.ui.muteButton.addEventListener("click", () => {
      state.volume.muted = !state.volume.muted;

      applyPreviewVolume();
      updateMuteButton();
    });
  }

  function getEffectivePreviewVolume() {
    return state.volume.muted
      ? 0
      : state.volume.preview;
  }

  function applyPreviewVolume() {
    const previewVolume = getEffectivePreviewVolume();

    state.ui.backgroundVideo.volume =
      previewVolume * state.volume.background;

    if (state.previewAudio.backgroundGain) {
      state.previewAudio.backgroundGain.gain.value =
        previewVolume * state.volume.background;
    }

    if (state.sound.previewElement) {
      state.sound.previewElement.volume =
        previewVolume * state.volume.sound;
    }
  }

  function updateMuteButton() {
    const volume = getEffectivePreviewVolume();
    let icon = "🔊";

    if (volume === 0) {
      icon = "🔇";
    } else if (volume < 0.35) {
      icon = "🔈";
    } else if (volume < 0.7) {
      icon = "🔉";
    }

    state.ui.muteButton.textContent = icon;

    state.ui.muteButton.setAttribute(
      "aria-label",
      volume === 0
        ? "Unmute preview"
        : "Mute preview",
    );

    state.ui.muteButton.title =
      volume === 0
        ? "Unmute preview"
        : "Mute preview";
  }

  function setupCanvas() {
    state.ui.canvas.width = CONFIG.canvas.width;
    state.ui.canvas.height = CONFIG.canvas.height;

    state.ui.canvas.addEventListener(
      "pointerdown",
      handleCanvasPointerDown,
    );

    state.ui.canvas.addEventListener(
      "pointermove",
      handleCanvasPointerMove,
    );

    state.ui.canvas.addEventListener(
      "pointerup",
      handleCanvasPointerUp,
    );

    state.ui.canvas.addEventListener(
      "pointercancel",
      handleCanvasPointerUp,
    );

    state.ui.canvas.addEventListener(
      "pointerleave",
      handleCanvasPointerUp,
    );

    state.ui.canvas.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          togglePreview();
        }
      },
    );

    state.ui.canvas.tabIndex = 0;
  }

  function getCanvasCoordinates(event) {
    const rect = state.ui.canvas.getBoundingClientRect();
    const scaleX = CONFIG.canvas.width / rect.width;
    const scaleY = CONFIG.canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function getArtworkBounds() {
    const { x, y, width, height } = state.artwork;

    return {
      left: x - width / 2,
      right: x + width / 2,
      top: y - height / 2,
      bottom: y + height / 2,
    };
  }

  function isPointInsideArtwork(point) {
    const bounds = getArtworkBounds();

    return (
      point.x >= bounds.left &&
      point.x <= bounds.right &&
      point.y >= bounds.top &&
      point.y <= bounds.bottom
    );
  }

  function isPointOnResizeHandle(point) {
    const bounds = getArtworkBounds();
    const handleSize = Math.max(
      32,
      state.artwork.width * 0.085,
    );

    return (
      point.x >= bounds.right - handleSize &&
      point.x <= bounds.right + 7 &&
      point.y >= bounds.bottom - handleSize &&
      point.y <= bounds.bottom + 7
    );
  }

  function shouldShowRevealedArtwork() {
    return (
      state.ui.backgroundVideo.currentTime >=
        state.timing.revealedStart &&
      Boolean(state.revealedImage)
    );
  }

  function handleCanvasPointerDown(event) {
    if (
      state.ui.backgroundVideo.currentTime >=
      state.timing.revealedStart
    ) {
      return;
    }

    const point = getCanvasCoordinates(event);

    if (!isPointInsideArtwork(point)) {
      return;
    }

    event.preventDefault();

    state.artwork.pointerId = event.pointerId;
    state.artwork.startPointerX = point.x;
    state.artwork.startPointerY = point.y;
    state.artwork.startX = state.artwork.x;
    state.artwork.startY = state.artwork.y;
    state.artwork.startWidth = state.artwork.width;
    state.artwork.startHeight = state.artwork.height;

    if (isPointOnResizeHandle(point)) {
      state.artwork.resizing = true;
    } else {
      state.artwork.dragging = true;
    }

    state.ui.canvas.setPointerCapture?.(event.pointerId);
    state.ui.canvas.classList.add("is-dragging");
  }

  function handleCanvasPointerMove(event) {
    if (
      event.pointerId !== state.artwork.pointerId ||
      (!state.artwork.dragging &&
        !state.artwork.resizing)
    ) {
      return;
    }

    const point = getCanvasCoordinates(event);
    const deltaX =
      point.x - state.artwork.startPointerX;
    const deltaY =
      point.y - state.artwork.startPointerY;

    if (state.artwork.dragging) {
      state.artwork.x = clamp(
        state.artwork.startX + deltaX,
        state.artwork.width / 2,
        CONFIG.canvas.width -
          state.artwork.width / 2,
      );

      state.artwork.y = clamp(
        state.artwork.startY + deltaY,
        state.artwork.height / 2,
        CONFIG.canvas.height -
          state.artwork.height / 2,
      );
    }

    if (state.artwork.resizing) {
      const size = clamp(
        state.artwork.startWidth + deltaX,
        CONFIG.artwork.minSize,
        CONFIG.artwork.maxSize,
      );

      state.artwork.width = size;
      state.artwork.height = size;

      state.artwork.x = clamp(
        state.artwork.startX,
        size / 2,
        CONFIG.canvas.width - size / 2,
      );

      state.artwork.y = clamp(
        state.artwork.startY,
        size / 2,
        CONFIG.canvas.height - size / 2,
      );
    }

    drawFrame();
  }

  function handleCanvasPointerUp(event) {
    if (
      state.artwork.pointerId !== null &&
      event.pointerId !== state.artwork.pointerId
    ) {
      return;
    }

    state.artwork.dragging = false;
    state.artwork.resizing = false;
    state.artwork.pointerId = null;

    state.ui.canvas.classList.remove("is-dragging");
  }

  function resetArtworkPosition() {
    state.artwork.x = CONFIG.artwork.centerX;
    state.artwork.y = CONFIG.artwork.centerY;
    state.artwork.width = CONFIG.artwork.defaultWidth;
    state.artwork.height = CONFIG.artwork.defaultHeight;

    drawFrame();
  }

  function drawImageContain(
    context,
    image,
    x,
    y,
    width,
    height,
  ) {
    if (!isImageUsable(image)) {
      return;
    }

    const imageRatio =
      image.naturalWidth / image.naturalHeight;
    const targetRatio = width / height;

    let drawWidth = width;
    let drawHeight = height;

    if (imageRatio > targetRatio) {
      drawHeight = width / imageRatio;
    } else {
      drawWidth = height * imageRatio;
    }

    context.drawImage(
      image,
      Math.round(x - drawWidth / 2),
      Math.round(y - drawHeight / 2),
      Math.round(drawWidth),
      Math.round(drawHeight),
    );
  }

  function drawCanvasFallback(context) {
    const gradient = context.createLinearGradient(
      0,
      0,
      CONFIG.canvas.width,
      CONFIG.canvas.height,
    );

    gradient.addColorStop(0, "#1b2029");
    gradient.addColorStop(1, "#07090e");

    context.fillStyle = gradient;
    context.fillRect(
      0,
      0,
      CONFIG.canvas.width,
      CONFIG.canvas.height,
    );

    context.fillStyle = "rgba(241, 200, 75, 0.64)";
    context.font = "700 42px system-ui";
    context.textAlign = "center";
    context.fillText(
      "Reveal Studio",
      CONFIG.canvas.width / 2,
      CONFIG.canvas.height / 2,
    );
  }

  function drawResizeHandle(context) {
    const bounds = getArtworkBounds();

    context.save();
    context.fillStyle = "rgba(241, 200, 75, 0.95)";
    context.strokeStyle = "rgba(7, 8, 12, 0.92)";
    context.lineWidth = 5;

    context.beginPath();
    context.roundRect(
      bounds.right - 30,
      bounds.bottom - 30,
      24,
      24,
      7,
    );

    context.fill();
    context.stroke();
    context.restore();
  }

  function applySnipSkip() {
    // snip = jump over a chunk of the video when we hit it.
    // everything else (blankStart/blankEnd/revealedStart/
    // soundStart) still reads currentTime like normal - they
    // have no idea this is happening, which is the whole point
    if (!state.snip.enabled) {
      return;
    }

    const video = state.ui.backgroundVideo;

    if (
      video.currentTime >= state.snip.start &&
      video.currentTime < state.snip.end
    ) {
      video.currentTime = state.snip.end;
    }
  }

  function drawFrame() {
    applySnipSkip();

    const context = state.ui.canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });

    if (!context) {
      return;
    }

    // default scaling quality is low/medium in most browsers,
    // which was adding extra blur on top of source video that's
    // already not great. bump it up, it's basically free here
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    const video = state.ui.backgroundVideo;

    if (!video.seeking) {
      context.clearRect(
        0,
        0,
        CONFIG.canvas.width,
        CONFIG.canvas.height,
      );

      if (video.readyState >= 2) {
        try {
          // sharpen = real convolution matrix, not some cheap CSS
          // trick. running it every frame during playback murders
          // older hardware for a difference you can't even see
          // while stuff's moving. keep it for paused frames +
          // exports, skip it during live scrubbing/playback
          const livePlayback =
            state.preview.animationFrame !== null &&
            !state.export.started;

          context.filter =
            state.sharpenEnabled && !livePlayback
              ? "url(#pokedexSharpen)"
              : "none";

          context.drawImage(
            video,
            0,
            0,
            CONFIG.canvas.width,
            CONFIG.canvas.height,
          );

          context.filter = "none";
        } catch {
          context.filter = "none";
          drawCanvasFallback(context);
        }
      } else {
        drawCanvasFallback(context);
      }
    }
    // mid-seek (snip jumps, mostly) the browser hasn't decoded
    // the new frame yet - clearing here flashes black for a tick.
    // just leave the canvas alone and let it freeze on the last
    // good frame til the seek actually finishes

    const revealed = shouldShowRevealedArtwork();
    const currentTime =
      state.ui.backgroundVideo.currentTime;

    const showBlank =
      !revealed &&
      currentTime >= state.timing.blankStart &&
      currentTime < state.timing.blankEnd &&
      Boolean(state.blankImage);

    const image = revealed
      ? state.revealedImage
      : showBlank
        ? state.blankImage
        : null;

    if (image) {
      drawImageContain(
        context,
        image,
        state.artwork.x,
        state.artwork.y,
        state.artwork.width,
        state.artwork.height,
      );
    }

    if (
      !revealed &&
      !state.export.started &&
      state.artwork.width > 0
    ) {
      drawResizeHandle(context);
    }

    if (revealed && state.showNameText) {
      const displayName =
        state.selectedPokemon?.displayName ||
        state.ui.pokemonName?.value?.trim();

      if (displayName) {
        drawNameCaption(context, displayName);
      }
    }
  }

  function drawNameCaption(context, name) {
    const text = `It's ${name}!`;

    context.save();

    context.font = "800 64px system-ui";
    context.textAlign = "center";
    context.textBaseline = "middle";

    const paddingX = 40;
    const paddingY = 20;
    const textWidth =
      context.measureText(text).width;
    const boxWidth = textWidth + paddingX * 2;
    const boxHeight = 64 + paddingY * 2;

    const centerX = CONFIG.canvas.width / 2;
    const centerY = CONFIG.canvas.height - 130;

    context.fillStyle = "rgba(7, 9, 14, 0.72)";
    context.beginPath();
    context.roundRect(
      centerX - boxWidth / 2,
      centerY - boxHeight / 2,
      boxWidth,
      boxHeight,
      18,
    );
    context.fill();

    context.strokeStyle = "rgba(241, 200, 75, 0.9)";
    context.lineWidth = 2;
    context.stroke();

    context.fillStyle = "#f8f4e8";
    context.fillText(text, centerX, centerY + 3);

    context.restore();
  }

  async function generateSilhouette(sourceImage) {
    if (!isImageUsable(sourceImage)) {
      return null;
    }

    const sourceCanvas = document.createElement(
      "canvas",
    );

    sourceCanvas.width = sourceImage.naturalWidth;
    sourceCanvas.height = sourceImage.naturalHeight;

    const sourceContext = sourceCanvas.getContext("2d");

    sourceContext.drawImage(
      sourceImage,
      0,
      0,
    );

    let imageData;

    try {
      imageData = sourceContext.getImageData(
        0,
        0,
        sourceCanvas.width,
        sourceCanvas.height,
      );
    } catch (error) {
      console.error(
        "getImageData failed (likely a tainted/cross-origin canvas):",
        error,
      );

      throw new Error(
        "The picture could not be prepared for the mystery silhouette.",
      );
    }

    for (
      let index = 0;
      index < imageData.data.length;
      index += 4
    ) {
      const alpha = imageData.data[index + 3];

      if (alpha > 0) {
        imageData.data[index] = 0;
        imageData.data[index + 1] = 0;
        imageData.data[index + 2] = 0;
      }
    }

    sourceContext.putImageData(
      imageData,
      0,
      0,
    );

    return await loadImage(
      sourceCanvas.toDataURL("image/png"),
    );
  }

  async function loadDefaultArtwork() {
    // defaults to Magikarp via the actual search/select flow -
    // no more depending on local placeholder files that may or
    // may not exist. that's what was causing the invisible
    // default state for like three days straight lol
    state.ui.pokemonSearch.value = "magikarp";

    await searchPokemon();
    await loadSelectedPokemon();

    if (!state.revealedImage) {
      throw new Error(
        "Magikarp could not be loaded as the default Pokémon.",
      );
    }

    if (!state.blankImage) {
      // revealed pic loaded fine, silhouette didn't - surface
      // this on the canvas itself, not the panel status text
      // (that can be hidden behind a different tab). learned
      // this one the hard way, never again
      console.error(
        "Default artwork loaded but the mystery silhouette is missing.",
      );

      setCanvasMessage(
        "The mystery silhouette could not be created. Check the browser console for details.",
        true,
      );
    }

    updateArtworkUi();
    drawFrame();
  }

  async function setRevealedArtworkFromUrl(
    url,
    displayName = "Online picture",
  ) {
    // no proxy needed - raw.githubusercontent.com (where PokéAPI
    // artwork lives) sends CORS headers, so we can just load it
    // straight and still read pixels for the silhouette
    const image = await loadImage(url);

    state.revealedImage = image;
    state.revealedSource = "online";
    state.revealedImage.alt = displayName;

    try {
      state.blankImage = await generateSilhouette(image);
      state.blankSource = "generated";
    } catch (error) {
      // silhouette failing shouldn't nuke the rest of this fn -
      // revealed pic already loaded fine, still show it
      console.error(
        "Silhouette generation failed:",
        error,
      );

      state.blankImage = null;
      state.blankSource = "generated";

      setStatus(
        state.ui.pokemonLookupStatus,
        "The mystery silhouette could not be created, but the revealed picture loaded.",
        "error",
      );
    }

    resetArtworkPosition();
    updateArtworkUi();
    drawFrame();
  }

  async function loadImageFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      throw new Error("Please choose a valid picture file.");
    }

    const objectUrl = trackObjectUrl(
      URL.createObjectURL(file),
    );

    const image = await loadImage(objectUrl);

    return {
      image,
      objectUrl,
    };
  }

  async function handleRevealedImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const { image } = await loadImageFile(file);

      state.revealedImage = image;
      state.revealedSource = "upload";
      state.revealedImage.alt = file.name;

      state.blankImage = await generateSilhouette(image);
      state.blankSource = "generated";

      resetArtworkPosition();
      updateArtworkUi();
      drawFrame();
    } catch (error) {
      setStatus(
        state.ui.pokemonLookupStatus,
        error.message ||
          "The revealed picture could not be loaded.",
        "error",
      );
    } finally {
      event.target.value = "";
    }
  }

  async function handleBlankImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const { image } = await loadImageFile(file);

      state.blankImage = image;
      state.blankSource = "upload";

      updateArtworkUi();
      drawFrame();
    } catch (error) {
      setStatus(
        state.ui.pokemonLookupStatus,
        error.message ||
          "The mystery picture could not be loaded.",
        "error",
      );
    } finally {
      event.target.value = "";
    }
  }

  async function regenerateSilhouette() {
    if (!state.revealedImage) {
      setStatus(
        state.ui.pokemonLookupStatus,
        "Choose a revealed picture first.",
        "error",
      );

      return;
    }

    try {
      state.blankImage = await generateSilhouette(
        state.revealedImage,
      );

      state.blankSource = "generated";

      updateArtworkUi();
      drawFrame();
    } catch (error) {
      setStatus(
        state.ui.pokemonLookupStatus,
        error.message ||
          "The mystery silhouette could not be created.",
        "error",
      );
    }
  }

  function updateArtworkUi() {
    if (!state.revealedImage) {
      setStatus(
        state.ui.pictureStatus,
        "Search a Pokémon or upload a picture to get started.",
      );

      return;
    }

    const revealedLabels = {
      online:
        state.selectedPokemon?.displayName ||
        "Pokémon picture loaded",
      upload: "Custom picture uploaded",
    };

    const blankLabels = {
      generated: "Silhouette made automatically",
      upload: "Custom silhouette uploaded",
    };

    const revealedText =
      revealedLabels[state.revealedSource] ||
      "Picture ready";

    if (state.blankImage) {
      setStatus(
        state.ui.pictureStatus,
        `${revealedText} — ${
          blankLabels[state.blankSource] ||
          "Silhouette ready"
        }.`,
        "success",
      );
    } else {
      setStatus(
        state.ui.pictureStatus,
        `${revealedText}, but the silhouette could not be made.`,
        "error",
      );
    }
  }

  async function searchPokemon() {
    const query = state.ui.pokemonSearch.value.trim();

    if (query.length < 2) {
      setStatus(
        state.ui.pokemonLookupStatus,
        "Enter at least two characters to search.",
        "error",
      );

      state.ui.pokemonResults.replaceChildren();
      state.ui.loadPokemonButton.disabled = true;

      return;
    }

    setStatus(
      state.ui.pokemonLookupStatus,
      "Looking for that Pokémon...",
      "loading",
    );

    try {
      state.pokemonSearchResults =
        await searchPokemonByQuery(query);

      state.ui.pokemonResults.replaceChildren();

      for (const pokemon of state.pokemonSearchResults) {
        const option = document.createElement("option");

        option.value = pokemon.name;
        option.textContent = pokemon.displayName;

        state.ui.pokemonResults.appendChild(option);
      }

      state.ui.loadPokemonButton.disabled =
        state.pokemonSearchResults.length === 0;

      if (state.pokemonSearchResults.length) {
        state.ui.pokemonResults.selectedIndex = 0;

        setStatus(
          state.ui.pokemonLookupStatus,
          `${state.pokemonSearchResults.length} result${
            state.pokemonSearchResults.length === 1
              ? ""
              : "s"
          } found.`,
          "success",
        );
      } else {
        setStatus(
          state.ui.pokemonLookupStatus,
          "No matching Pokémon found.",
          "error",
        );
      }
    } catch (error) {
      console.error("Pokémon search failed:", error);

      setStatus(
        state.ui.pokemonLookupStatus,
        error.message ||
          "The Pokémon search could not be completed.",
        "error",
      );
    }
  }

  function getSelectedPokemonName() {
    return (
      state.ui.pokemonResults.value ||
      state.ui.pokemonName.value.trim()
    );
  }

  async function loadSelectedPokemon() {
    const identifier = getSelectedPokemonName();

    if (!identifier) {
      setStatus(
        state.ui.pokemonLookupStatus,
        "Choose a Pokémon first.",
        "error",
      );

      return;
    }

    setStatus(
      state.ui.pokemonLookupStatus,
      "Loading the Pokémon picture...",
      "loading",
    );

    state.ui.loadPokemonButton.disabled = true;

    try {
      const raw = await fetchPokeApiJson(
        `${CONFIG.pokeApiBase}/pokemon/${encodeURIComponent(
          identifier,
        )}`,
      );

      state.selectedPokemon = extractPokemonDetails(raw);

      // gotta clear this or usePokemonSound() below just reuses
      // whatever's cached from the last pokemon. bit by this once
      state.selectedSound = null;

      state.ui.pokemonName.value =
        state.selectedPokemon.displayName;

      state.ui.cryPokemonLabel.textContent =
        state.selectedPokemon.displayName;

      state.ui.crySelector.hidden = false;

      if (state.selectedPokemon.artwork) {
        await setRevealedArtworkFromUrl(
          state.selectedPokemon.artwork,
          state.selectedPokemon.displayName,
        );
      }

      updateCryAvailability();

      // only auto-follow the pokemon if they haven't picked their
      // own audio - don't want to steamroll a custom upload
      if (
        state.sound.source === "default" ||
        state.sound.source === "pokemon"
      ) {
        await usePokemonSound();
      }

      setStatus(
        state.ui.pokemonLookupStatus,
        `${state.selectedPokemon.displayName} is ready.`,
        "success",
      );

      updateWorkflowSummaries();
    } catch (error) {
      console.error("Loading selected Pokémon failed:", error);

      setStatus(
        state.ui.pokemonLookupStatus,
        error.message ||
          "That Pokémon could not be loaded.",
        "error",
      );
    } finally {
      state.ui.loadPokemonButton.disabled =
        state.pokemonSearchResults.length === 0;
    }
  }

  function updateCryAvailability() {
    const available =
      state.selectedPokemon?.availableCryVersions || [];

    for (const option of state.ui.cryVersion.options) {
      option.disabled = !available.includes(option.value);
    }

    if (!available.includes(state.ui.cryVersion.value)) {
      state.ui.cryVersion.value =
        available[0] || "latest";
    }

    const hasSound = available.length > 0;

    state.ui.previewCryButton.disabled = !hasSound;
    state.ui.useCryButton.disabled = !hasSound;

    setStatus(
      state.ui.cryStatus,
      hasSound
        ? "Choose a version or use this Pokémon sound."
        : "No Pokémon sound was found.",
      hasSound ? "success" : "error",
    );
  }

  async function loadSelectedPokemonSound(
    showStatus = true,
  ) {
    if (!state.selectedPokemon) {
      return null;
    }

    const version = state.ui.cryVersion.value;

    if (showStatus) {
      setStatus(
        state.ui.cryStatus,
        "Loading Pokémon sound...",
        "loading",
      );
    }

    // already have the cry urls from when the pokemon loaded,
    // no need to fetch again - just grab the right version
    const url =
      version === "legacy"
        ? state.selectedPokemon.cries.legacy
        : state.selectedPokemon.cries.latest;

    if (!url) {
      state.selectedSound = null;

      setStatus(
        state.ui.cryStatus,
        "This Pokémon sound could not be loaded.",
        "error",
      );

      return null;
    }

    state.selectedSound = {
      pokemonId: state.selectedPokemon.id,
      pokemonName: state.selectedPokemon.name,
      displayName: state.selectedPokemon.displayName,
      version,
      url,
    };

    setStatus(
      state.ui.cryStatus,
      "Pokémon sound ready.",
      "success",
    );

    return state.selectedSound;
  }

  async function previewPokemonSound() {
    const sound =
      state.selectedSound ||
      (await loadSelectedPokemonSound());

    if (!sound?.url) {
      return;
    }

    const audio = new Audio(sound.url);

    audio.volume =
      getEffectivePreviewVolume() *
      state.volume.sound;

    try {
      await audio.play();
    } catch {
      setStatus(
        state.ui.cryStatus,
        "The Pokémon sound could not be played.",
        "error",
      );
    }
  }

  async function usePokemonSound() {
    const sound =
      state.selectedSound ||
      (await loadSelectedPokemonSound());

    if (!sound?.url) {
      return;
    }

    await setActiveSoundFromUrl(
      sound.url,
      "Pokémon sound selected",
      "Pokémon sound ready",
      "pokemon",
    );
  }

  function bindPokemonControls() {
    state.ui.pokemonSearchButton.addEventListener(
      "click",
      searchPokemon,
    );

    state.ui.pokemonSearch.addEventListener(
      "input",
      () => {
        clearTimeout(state.searchTimer);

        state.searchTimer = setTimeout(
          searchPokemon,
          CONFIG.searchDebounceMs,
        );
      },
    );

    state.ui.pokemonSearch.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          searchPokemon();
        }
      },
    );

    state.ui.pokemonResults.addEventListener(
      "change",
      () => {
        state.ui.loadPokemonButton.disabled =
          !state.ui.pokemonResults.value;
      },
    );

    state.ui.loadPokemonButton.addEventListener(
      "click",
      loadSelectedPokemon,
    );

    state.ui.pokemonName.addEventListener(
      "input",
      () => {
        updateWorkflowSummaries();
        drawFrame();
      },
    );

    state.ui.showNameText.addEventListener(
      "change",
      () => {
        state.showNameText =
          state.ui.showNameText.checked;

        drawFrame();
      },
    );
  }

  function createAudioElement(url) {
    const audio = new Audio(url);

    audio.preload = "auto";

    return audio;
  }

  async function decodeAudioUrl(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const context = new AudioContext();

    try {
      return await context.decodeAudioData(arrayBuffer);
    } finally {
      await context.close();
    }
  }

  async function setActiveSoundFromUrl(
    url,
    label,
    detail,
    source,
  ) {
    if (!url) {
      throw new Error("No sound source was provided.");
    }

    setStatus(
      state.ui.audioTrimStatus,
      "Loading sound...",
      "loading",
    );

    const audio = createAudioElement(url);

    await new Promise((resolve, reject) => {
      audio.addEventListener(
        "loadedmetadata",
        resolve,
        { once: true },
      );

      audio.addEventListener(
        "error",
        () => reject(
          new Error("The sound could not be loaded."),
        ),
        { once: true },
      );
    });

    let buffer = null;

    try {
      buffer = await decodeAudioUrl(url);
    } catch {
      buffer = null;
    }

    if (state.sound.activeObjectUrl) {
      revokeObjectUrl(state.sound.activeObjectUrl);
      state.sound.activeObjectUrl = null;
    }

    state.sound.activeUrl = url;
    state.sound.activeLabel = label;
    state.sound.activeDetail = detail;
    state.sound.source = source;
    state.sound.buffer = buffer;
    state.sound.duration = Number.isFinite(audio.duration)
      ? audio.duration
      : buffer?.duration || 0;
    state.sound.trimStart = 0;
    state.sound.trimEnd = Math.min(
      state.sound.duration,
      CONFIG.maxSoundDuration,
    );

    state.sound.previewElement =
      createAudioElement(url);

    state.sound.previewElement.preload = "auto";
    state.sound.previewElement.volume =
      getEffectivePreviewVolume() *
      state.volume.sound;

    updateSoundUi();
    updateAudioEditorUi();
    updateWorkflowSummaries();

    setStatus(
      state.ui.audioTrimStatus,
      state.sound.duration > 0
        ? "Choose the part to use, up to 2.5 seconds."
        : "Sound loaded.",
      "success",
    );
  }

  async function loadDefaultSound() {
    try {
      const raw = await fetchPokeApiJson(
        `${CONFIG.pokeApiBase}/pokemon/magikarp`,
      );

      const cryUrl = extractCryUrl(raw, "latest");

      if (!cryUrl) {
        throw new Error("No default Pokémon sound was found.");
      }

      await setActiveSoundFromUrl(
        cryUrl,
        "Magikarp sound ready",
        "Used automatically when you play the reveal",
        "default",
      );
    } catch {
      state.sound.activeUrl = null;
      state.sound.activeLabel = "No sound loaded";
      state.sound.activeDetail =
        "Choose a sound file or record a sound";
      state.sound.source = "none";

      updateSoundUi();

      setStatus(
        state.ui.audioTrimStatus,
        "Choose a sound file or record a sound.",
        "error",
      );
    }
  }

  function updateSoundUi() {
    const isCustom =
      state.sound.source !== "default" &&
      state.sound.source !== "none";

    const label = isCustom
      ? state.sound.activeLabel
      : "Default sound ready";

    const detail = isCustom
      ? state.sound.activeDetail
      : "Used automatically when you play the reveal";

    setStatus(
      state.ui.soundStatus,
      `${label} — ${detail}.`,
      state.sound.source === "none"
        ? "error"
        : "success",
    );
  }

  async function handleSoundUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const objectUrl = trackObjectUrl(
        URL.createObjectURL(file),
      );

      await setActiveSoundFromUrl(
        objectUrl,
        "Custom sound selected",
        "Sound file ready for the reveal",
        "upload",
      );

      state.sound.activeObjectUrl = objectUrl;
      updateSoundUi();
    } catch (error) {
      setStatus(
        state.ui.audioTrimStatus,
        error.message ||
          "The sound file could not be loaded.",
        "error",
      );
    } finally {
      event.target.value = "";
    }
  }

  function updateAudioEditorUi() {
    const duration = Math.max(0, state.sound.duration);
    const start = clamp(
      state.sound.trimStart,
      0,
      duration,
    );

    const end = clamp(
      Math.max(start, state.sound.trimEnd),
      start,
      duration,
    );

    state.sound.trimStart = start;
    state.sound.trimEnd = end;

    state.ui.audioDurationLabel.textContent =
      `${formatShortTime(end - start)} selected`;

    state.ui.audioTrimStart.min = "0";
    state.ui.audioTrimStart.max = String(duration);
    state.ui.audioTrimStart.value = String(start);

    state.ui.audioTrimEnd.min = "0";
    state.ui.audioTrimEnd.max = String(duration);
    state.ui.audioTrimEnd.value = String(end);

    state.ui.audioTrimStartLabel.textContent =
      start.toFixed(2);

    state.ui.audioTrimEndLabel.textContent =
      end.toFixed(2);

    const valid =
      end > start &&
      end - start <= CONFIG.maxSoundDuration;

    setStatus(
      state.ui.audioTrimStatus,
      valid
        ? "Sound selection is ready."
        : `Choose a section no longer than ${
            CONFIG.maxSoundDuration
          } seconds.`,
      valid ? "success" : "error",
    );
  }

  function handleAudioTrimInput() {
    let start = Number(
      state.ui.audioTrimStart.value,
    );

    let end = Number(
      state.ui.audioTrimEnd.value,
    );

    if (
      state.ui.audioTrimStart ===
      document.activeElement
    ) {
      end = Math.max(end, start);
    }

    if (
      state.ui.audioTrimEnd ===
      document.activeElement
    ) {
      start = Math.min(start, end);
    }

    state.sound.trimStart = start;
    state.sound.trimEnd = end;

    updateAudioEditorUi();
  }

  async function playSoundSelection() {
    if (!state.sound.activeUrl) {
      return;
    }

    const audio = createAudioElement(
      state.sound.activeUrl,
    );

    audio.volume =
      getEffectivePreviewVolume() *
      state.volume.sound;

    audio.currentTime = state.sound.trimStart;

    const stopAtEnd = () => {
      if (
        audio.currentTime >= state.sound.trimEnd
      ) {
        audio.pause();
        audio.removeEventListener(
          "timeupdate",
          stopAtEnd,
        );
      }
    };

    audio.addEventListener(
      "timeupdate",
      stopAtEnd,
    );

    try {
      await audio.play();
    } catch {
      setStatus(
        state.ui.audioTrimStatus,
        "The selected sound could not be played.",
        "error",
      );
    }
  }

  function createSelectedSoundBuffer() {
    const source = state.sound.buffer;

    if (!source) {
      return null;
    }

    const start = Math.max(
      0,
      state.sound.trimStart,
    );

    const end = Math.min(
      source.duration,
      state.sound.trimEnd,
    );

    const duration = Math.max(
      0,
      end - start,
    );

    if (
      !duration ||
      duration > CONFIG.maxSoundDuration
    ) {
      return null;
    }

    const segment = new AudioBuffer({
      numberOfChannels: source.numberOfChannels,
      length: Math.ceil(
        duration * source.sampleRate,
      ),
      sampleRate: source.sampleRate,
    });

    for (
      let channel = 0;
      channel < source.numberOfChannels;
      channel += 1
    ) {
      const sourceData = source.getChannelData(channel);
      const targetData = segment.getChannelData(channel);
      const offset = Math.floor(
        start * source.sampleRate,
      );

      for (
        let index = 0;
        index < targetData.length;
        index += 1
      ) {
        targetData[index] =
          sourceData[offset + index] || 0;
      }
    }

    return segment;
  }

  function bindSoundControls() {
    state.ui.chooseAudioButton.addEventListener(
      "click",
      () => {
        state.ui.audioInput.click();
      },
    );

    state.ui.audioInput.addEventListener(
      "change",
      handleSoundUpload,
    );

    state.ui.editAudioButton.addEventListener(
      "click",
      () => {
        const opening = state.ui.audioEditor.hidden;

        state.ui.audioEditor.hidden = !opening;

        state.ui.editAudioButton.setAttribute(
          "aria-expanded",
          String(opening),
        );
      },
    );

    state.ui.audioTrimStart.addEventListener(
      "input",
      handleAudioTrimInput,
    );

    state.ui.audioTrimEnd.addEventListener(
      "input",
      handleAudioTrimInput,
    );

    state.ui.playAudioSelectionButton.addEventListener(
      "click",
      playSoundSelection,
    );

    state.ui.cryVersion.addEventListener(
      "change",
      () => {
        loadSelectedPokemonSound(true);
      },
    );

    state.ui.previewCryButton.addEventListener(
      "click",
      previewPokemonSound,
    );

    state.ui.useCryButton.addEventListener(
      "click",
      usePokemonSound,
    );

    state.ui.recordAudioButton.addEventListener(
      "click",
      startRecording,
    );

    state.ui.stopRecordingButton.addEventListener(
      "click",
      stopRecording,
    );
  }

  function bindSoundMixControls() {
    state.ui.backgroundVolume.addEventListener(
      "input",
      () => {
        const value =
          Number(
            state.ui.backgroundVolume.value,
          ) / 100;

        state.volume.background = value;
        state.ui.backgroundVolumeLabel.textContent =
          String(Math.round(value * 100));

        applyPreviewVolume();
      },
    );

    state.ui.soundVolume.addEventListener(
      "input",
      () => {
        const value =
          Number(
            state.ui.soundVolume.value,
          ) / 100;

        state.volume.sound = value;
        state.ui.soundVolumeLabel.textContent =
          String(Math.round(value * 100));

        applyPreviewVolume();
      },
    );
  }

  async function startRecording() {
    if (
      !navigator.mediaDevices?.getUserMedia ||
      !window.MediaRecorder
    ) {
      setStatus(
        state.ui.audioTrimStatus,
        "Sound recording is not supported here.",
        "error",
      );

      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const mimeType =
        getSupportedRecordingMimeType();

      state.recording.stream = stream;
      state.recording.chunks = [];
      state.recording.startedAt = Date.now();

      state.recording.mediaRecorder =
        new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined,
        );

      state.recording.mediaRecorder.addEventListener(
        "dataavailable",
        (event) => {
          if (event.data.size > 0) {
            state.recording.chunks.push(
              event.data,
            );
          }
        },
      );

      state.recording.mediaRecorder.addEventListener(
        "stop",
        finishRecording,
        { once: true },
      );

      state.recording.mediaRecorder.start(100);

      state.ui.recordingControls.hidden = false;
      state.ui.recordAudioButton.disabled = true;
      state.ui.chooseAudioButton.disabled = true;

      updateRecordingTimer();
    } catch {
      setStatus(
        state.ui.audioTrimStatus,
        "Microphone access was not available.",
        "error",
      );
    }
  }

  function getSupportedRecordingMimeType() {
    if (!window.MediaRecorder?.isTypeSupported) {
      return "";
    }

    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];

    return (
      types.find((type) =>
        MediaRecorder.isTypeSupported(type),
      ) || ""
    );
  }

  function updateRecordingTimer() {
    clearInterval(state.recording.timerId);

    state.recording.timerId = setInterval(
      () => {
        const elapsed =
          (Date.now() -
            state.recording.startedAt) /
          1000;

        state.ui.recordingTimer.textContent =
          formatClock(elapsed);
      },
      100,
    );
  }

  function stopRecording() {
    const recorder =
      state.recording.mediaRecorder;

    if (
      !recorder ||
      recorder.state === "inactive"
    ) {
      return;
    }

    recorder.stop();
    clearInterval(state.recording.timerId);
  }

  async function finishRecording() {
    const chunks = state.recording.chunks;
    const stream = state.recording.stream;
    const recorder =
      state.recording.mediaRecorder;

    for (
      const track of stream?.getTracks?.() || []
    ) {
      track.stop();
    }

    const blob = new Blob(chunks, {
      type: recorder?.mimeType || "audio/webm",
    });

    state.recording.stream = null;
    state.recording.mediaRecorder = null;
    state.recording.chunks = [];

    state.ui.recordingControls.hidden = true;
    state.ui.recordAudioButton.disabled = false;
    state.ui.chooseAudioButton.disabled = false;

    const objectUrl = trackObjectUrl(
      URL.createObjectURL(blob),
    );

    try {
      await setActiveSoundFromUrl(
        objectUrl,
        "Custom sound selected",
        "Recorded sound ready for the reveal",
        "recording",
      );

      state.sound.activeObjectUrl = objectUrl;
      updateSoundUi();

      state.ui.audioEditor.hidden = false;
      state.ui.editAudioButton.setAttribute(
        "aria-expanded",
        "true",
      );
    } catch {
      revokeObjectUrl(objectUrl);

      setStatus(
        state.ui.audioTrimStatus,
        "The recorded sound could not be loaded.",
        "error",
      );
    }
  }

  function bindArtworkControls() {
    state.ui.resetPositionButton.addEventListener(
      "click",
      resetArtworkPosition,
    );

    state.ui.advancedResetPositionButton.addEventListener(
      "click",
      resetArtworkPosition,
    );

    state.ui.regenerateSilhouetteButton.addEventListener(
      "click",
      regenerateSilhouette,
    );

    state.ui.blankImageInput.addEventListener(
      "change",
      handleBlankImageUpload,
    );

    state.ui.revealedImageInput.addEventListener(
      "change",
      handleRevealedImageUpload,
    );

    state.ui.advancedResetAllButton.addEventListener(
      "click",
      () => {
        state.timing = {
          ...CONFIG.timing,
        };

        state.snip = {
          enabled: false,
          start: 5,
          end: 8.72,
        };

        state.ui.snipEnabled.checked = false;
        state.ui.snipStart.disabled = true;
        state.ui.snipEnd.disabled = true;

        if (state.ui.useHdBackground.checked) {
          state.ui.useHdBackground.checked = false;

          switchBackgroundVideoSource(
            CONFIG.standardBackgroundVideo,
          );

          setStatus(
            state.ui.hdBackgroundStatus,
            "Using the standard background video.",
          );
        }

        state.exportFrameRate = 30;
        state.ui.exportFrameRate.value = "30";
        state.ui.exportFrameRateLabel.textContent = "30";

        state.exportQuality = 6_000_000;
        state.ui.exportQuality.value = "6";
        state.ui.exportQualityLabel.textContent = "6";

        state.sharpenEnabled = true;
        state.ui.sharpenVideo.checked = true;

        state.volume = {
          ...CONFIG.volume,
          muted: false,
        };

        state.ui.previewVolume.value = "100";
        state.ui.backgroundVolume.value = "100";
        state.ui.soundVolume.value = "50";

        state.ui.backgroundVolumeLabel.textContent =
          "100";

        state.ui.soundVolumeLabel.textContent =
          "50";

        updateTimingControls(
          state.ui.backgroundVideo.duration,
        );

        updateSnipControls(
          state.ui.backgroundVideo.duration,
        );

        resetArtworkPosition();
        applyPreviewVolume();
        updateMuteButton();
        drawFrame();
      },
    );
  }

  function createPreviewAudioGraph() {
    const video = state.ui.backgroundVideo;

    if (
      state.previewAudio.context &&
      state.previewAudio.connectedVideo === video
    ) {
      return state.previewAudio;
    }

    const context = new AudioContext();
    const backgroundSource =
      context.createMediaElementSource(video);
    const backgroundGain = context.createGain();
    const destination =
      context.createMediaStreamDestination();

    backgroundSource.connect(backgroundGain);
    backgroundGain.connect(context.destination);
    backgroundGain.connect(destination);

    state.previewAudio = {
      context,
      backgroundSource,
      backgroundGain,
      destination,
      connectedVideo: video,
    };

    applyPreviewVolume();

    return state.previewAudio;
  }

  async function ensureAudioContextRunning() {
    const graph = createPreviewAudioGraph();

    if (graph.context.state === "suspended") {
      await graph.context.resume();
    }

    return graph;
  }

  function getCanvasStream() {
    if (!state.ui.canvas.captureStream) {
      throw new Error(
        "Video creation is not supported in this browser.",
      );
    }

    // source is nowhere near 60fps so cranking capture higher
    // just duplicates frames - bigger file, zero smoothness win.
    // slider lets people go higher anyway if they really want
    return state.ui.canvas.captureStream(
      state.exportFrameRate,
    );
  }

  function getSupportedVideoMimeType() {
    if (!window.MediaRecorder?.isTypeSupported) {
      return "";
    }

    const types = [
      "video/mp4;codecs=h264,aac",
      "video/mp4",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];

    return (
      types.find((type) =>
        MediaRecorder.isTypeSupported(type),
      ) || ""
    );
  }

  function setExportLock(locked) {
    // nothing should be touchable mid-recording - dragging the
    // pic, changing volume, whatever, all leaks straight into
    // the captured video since this is literally just recording
    // live playback. lock it down, only the recording happens
    document.body.classList.toggle(
      "export-locked",
      locked,
    );
  }

  function audioBufferToWav(buffer) {
    // quick PCM16 WAV encoder - server just needs plain WAV,
    // didn't feel like pulling in a whole library for this
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const bytesPerSample = 2;
    const blockAlign = channels * bytesPerSample;
    const dataSize = length * blockAlign;

    const arrayBuffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(arrayBuffer);

    const writeString = (offset, text) => {
      for (let i = 0; i < text.length; i += 1) {
        view.setUint8(offset + i, text.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, dataSize, true);

    const channelData = [];

    for (let c = 0; c < channels; c += 1) {
      channelData.push(buffer.getChannelData(c));
    }

    let offset = 44;

    for (let i = 0; i < length; i += 1) {
      for (let c = 0; c < channels; c += 1) {
        const sample = Math.max(
          -1,
          Math.min(1, channelData[c][i]),
        );

        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true,
        );

        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
  }

  function renderOverlayBlob(drawFn) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");

      canvas.width = CONFIG.canvas.width;
      canvas.height = CONFIG.canvas.height;

      const context = canvas.getContext("2d");

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      drawFn(context);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(
            new Error("A picture overlay could not be created."),
          );
        }
      }, "image/png");
    });
  }

  async function startServerExport() {
    if (!state.revealedImage || !state.blankImage) {
      throw new Error(
        "Choose a picture before creating the video.",
      );
    }

    const selectedSound = createSelectedSoundBuffer();

    if (!selectedSound) {
      throw new Error(
        "Choose a sound section no longer than " +
          `${CONFIG.maxSoundDuration}s before creating the video.`,
      );
    }

    const [blankBlob, revealedBlob, captionBlob, wavBlob] =
      await Promise.all([
        renderOverlayBlob((context) => {
          drawImageContain(
            context,
            state.blankImage,
            state.artwork.x,
            state.artwork.y,
            state.artwork.width,
            state.artwork.height,
          );
        }),
        renderOverlayBlob((context) => {
          drawImageContain(
            context,
            state.revealedImage,
            state.artwork.x,
            state.artwork.y,
            state.artwork.width,
            state.artwork.height,
          );
        }),
        state.showNameText
          ? renderOverlayBlob((context) => {
              const displayName =
                state.selectedPokemon?.displayName ||
                state.ui.pokemonName?.value?.trim();

              if (displayName) {
                drawNameCaption(context, displayName);
              }
            })
          : null,
        Promise.resolve(audioBufferToWav(selectedSound)),
      ]);

    const formData = new FormData();

    formData.set("blank_overlay", blankBlob, "blank.png");
    formData.set(
      "revealed_overlay",
      revealedBlob,
      "revealed.png",
    );

    if (captionBlob) {
      formData.set(
        "caption_overlay",
        captionBlob,
        "caption.png",
      );
    }

    formData.set("cry_audio", wavBlob, "cry.wav");

    formData.set(
      "blank_start",
      String(state.timing.blankStart),
    );
    formData.set("blank_end", String(state.timing.blankEnd));
    formData.set(
      "revealed_start",
      String(state.timing.revealedStart),
    );
    formData.set(
      "sound_start",
      String(state.timing.soundStart),
    );
    formData.set(
      "snip_enabled",
      String(state.snip.enabled),
    );
    formData.set("snip_start", String(state.snip.start));
    formData.set("snip_end", String(state.snip.end));
    formData.set(
      "frame_rate",
      String(state.exportFrameRate),
    );
    formData.set(
      "max_mbps",
      String(
        Math.max(
          1,
          Math.round(state.exportQuality / 1_000_000),
        ),
      ),
    );
    formData.set(
      "sharpen_enabled",
      String(state.sharpenEnabled),
    );
    formData.set(
      "use_hd_background",
      String(state.ui.useHdBackground.checked),
    );
    formData.set(
      "bg_volume",
      String(state.volume.background),
    );
    formData.set("cry_volume", String(state.volume.sound));

    updateEditorStatus("Creating");
    setExportLock(true);
    state.ui.downloadButton.disabled = true;

    try {
      const response = await fetch(
        `${CONFIG.videoServiceUrl}/create-video`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        let message =
          "The reveal video could not be created.";

        try {
          const data = await response.json();
          message = data.error || message;
        } catch {
          // Response wasn't JSON - keep the default message.
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const url = trackObjectUrl(URL.createObjectURL(blob));
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = createExportFilename("video/mp4");
      anchor.click();

      setTimeout(() => revokeObjectUrl(url), 1000);

      maybeShowUpvotePopup();
    } finally {
      state.ui.downloadButton.disabled = false;
      updateEditorStatus("Ready");
      setExportLock(false);
    }
  }

  async function startExport() {
    if (state.export.started) {
      return;
    }

    // stop it explicitly - if the preview was already playing
    // when Download got clicked, the video never actually fires
    // a fresh 'play' event (it's already playing), so the guard
    // in that listener wouldn't catch this path. belt and braces
    stopPreviewRenderLoop();

    if (!window.MediaRecorder) {
      throw new Error(
        "Video creation is not supported in this browser.",
      );
    }

    if (!state.sound.activeUrl) {
      throw new Error(
        "Choose or record a sound before creating the video.",
      );
    }

    const selectedSound =
      createSelectedSoundBuffer();

    if (!selectedSound) {
      throw new Error(
        `Choose a sound section no longer than ${
          CONFIG.maxSoundDuration
        } seconds.`,
      );
    }

    const canvasStream = getCanvasStream();
    const video = state.ui.backgroundVideo;

    // reuse the preview's audio graph instead of making a second
    // connection - a <video> can only ever have ONE
    // MediaElementSourceNode for its whole life. tried connecting
    // a second one here originally, browser was NOT having it
    // ("already connected previously to a different..."). fun one
    const previewGraph = createPreviewAudioGraph();
    const context = previewGraph.context;

    if (context.state === "suspended") {
      await context.resume();
    }

    const audioDestination =
      context.createMediaStreamDestination();

    const soundGain = context.createGain();

    previewGraph.backgroundGain.connect(
      audioDestination,
    );

    soundGain.gain.value = state.volume.sound;

    const soundSource =
      context.createBufferSource();

    soundSource.buffer = selectedSound;
    soundSource.connect(soundGain);
    soundGain.connect(audioDestination);

    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioDestination.stream.getAudioTracks(),
    ]);

    const mimeType = getSupportedVideoMimeType();

    if (!mimeType) {
      throw new Error(
        "No compatible video format is available.",
      );
    }

    const recorder = new MediaRecorder(
      combinedStream,
      {
        mimeType,
        videoBitsPerSecond: state.exportQuality,
        audioBitsPerSecond: 192_000,
      },
    );

    state.export = {
      started: true,
      recorder,
      chunks: [],
      stream: combinedStream,
      audioContext: context,
      animationFrame: null,
      soundTriggered: false,
    };

    recorder.addEventListener(
      "dataavailable",
      (event) => {
        if (event.data.size > 0) {
          state.export.chunks.push(
            event.data,
          );
        }
      },
    );

    recorder.addEventListener(
      "stop",
      async () => {
        const blob = new Blob(
          state.export.chunks,
          { type: mimeType },
        );

        const url = trackObjectUrl(
          URL.createObjectURL(blob),
        );

        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = createExportFilename(mimeType);
        anchor.click();

        setTimeout(
          () => revokeObjectUrl(url),
          1000,
        );

        try {
          soundSource.stop();
        } catch {
          // The source may already have ended.
        }

        combinedStream
          .getTracks()
          .forEach((track) => track.stop());

        // don't close context, it's the shared preview graph and
        // still needed after this - just unhook our bit of it
        try {
          previewGraph.backgroundGain.disconnect(
            audioDestination,
          );
        } catch {
          // Already disconnected.
        }

        state.export.started = false;
        state.export.recorder = null;
        state.export.chunks = [];
        state.export.stream = null;
        state.export.audioContext = null;
        state.export.animationFrame = null;
        state.export.soundTriggered = false;

        state.ui.downloadButton.disabled = false;

        updateEditorStatus("Ready");

        setExportLock(false);

        maybeShowUpvotePopup();
      },
      { once: true },
    );

    state.ui.downloadButton.disabled = true;
    updateEditorStatus("Creating");
    setExportLock(true);

    video.currentTime = 0;

    await waitForVideoSeek();

    try {
      await video.play();
    } catch {
      // The canvas continues rendering if browser playback is delayed.
    }

    recorder.start(250);

    // trigger reactively per-frame instead of pre-scheduling a
    // fixed delay - a fixed delay desyncs the second a snip skip
    // changes how much real time it takes to reach soundStart
    const soundDuration = Math.min(
      selectedSound.duration,
      CONFIG.maxSoundDuration,
    );

    state.export.animationFrame =
      requestAnimationFrame(exportRenderLoop);

    function exportRenderLoop() {
      if (!state.export.started) {
        return;
      }

      drawFrame();

      if (
        !state.export.soundTriggered &&
        video.currentTime >= state.timing.soundStart
      ) {
        state.export.soundTriggered = true;
        soundSource.start(0, 0, soundDuration);
      }

      if (
        video.ended ||
        video.currentTime >= video.duration
      ) {
        video.pause();

        cancelAnimationFrame(
          state.export.animationFrame,
        );

        if (recorder.state !== "inactive") {
          recorder.stop();
        }

        return;
      }

      state.export.animationFrame =
        requestAnimationFrame(exportRenderLoop);
    }
  }

  function waitForVideoSeek() {
    return new Promise((resolve) => {
      const video = state.ui.backgroundVideo;

      if (
        video.readyState >= 2 &&
        video.currentTime === 0
      ) {
        resolve();
        return;
      }

      video.addEventListener(
        "seeked",
        resolve,
        { once: true },
      );
    });
  }

  function createExportFilename(mimeType) {
    const name =
      state.selectedPokemon?.name ||
      state.ui.pokemonName.value.trim() ||
      "pokemon";

    const extension = mimeType.includes("mp4")
      ? "mp4"
      : "webm";

    return `${name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-reveal.${extension}`;
  }

  async function handleExport() {
    try {
      if (CONFIG.videoServiceUrl) {
        await startServerExport();
      } else {
        // no video service set up yet, fall back to the
        // in-browser recording so downloads still work
        await startExport();
      }
    } catch (error) {
      console.error("Video creation failed:", error);

      state.export.started = false;

      state.ui.downloadButton.disabled = false;

      updateEditorStatus("Ready");
      setExportLock(false);

      // show it somewhere actually visible - audioTrimStatus is
      // inside the collapsed Trim Audio panel, errors written
      // there basically vanish. download button looked broken
      // for the longest time because of this exact thing
      setCanvasMessage(
        error.message ||
          "The reveal video could not be created.",
        true,
      );
    }
  }

  function bindUpvotePopup() {
    state.ui.upvoteLink.href = CONFIG.redditPostUrl;

    const hidePopup = () => {
      state.ui.upvotePopup.hidden = true;
    };

    state.ui.dismissUpvotePopup.addEventListener(
      "click",
      () => {
        if (state.ui.hideUpvotePopup.checked) {
          try {
            localStorage.setItem(
              CONFIG.hideUpvotePopupKey,
              "1",
            );
          } catch {
            // Storage may be unavailable - not critical.
          }
        }

        hidePopup();
      },
    );

    state.ui.upvoteLink.addEventListener(
      "click",
      () => {
        try {
          localStorage.setItem(
            CONFIG.hideUpvotePopupKey,
            "1",
          );
        } catch {
          // Storage may be unavailable - not critical.
        }

        hidePopup();
      },
    );
  }

  function maybeShowUpvotePopup() {
    let hidden = false;

    try {
      hidden =
        localStorage.getItem(
          CONFIG.hideUpvotePopupKey,
        ) === "1";
    } catch {
      hidden = false;
    }

    if (!hidden) {
      state.ui.hideUpvotePopup.checked = false;
      state.ui.upvotePopup.hidden = false;
    }
  }

  function bindExportControls() {
    state.ui.downloadButton.addEventListener(
      "click",
      handleExport,
    );
  }

  async function initialize() {
    if (state.initialized) {
      return;
    }

    cacheUi();
    setupCanvas();

    bindWorkflowNavigation();
    bindAdvancedSettings();
    bindTimingControls();
    bindBackgroundVideo();
    bindPlaybackControls();
    bindPokemonControls();
    bindSoundControls();
    bindSoundMixControls();
    bindArtworkControls();
    bindExportControls();
    bindUpvotePopup();
    bindSnipControls();
    bindVideoQualityControls();

    updateMuteButton();
    updateWorkflowSummaries();
    updateArtworkUi();
    updateSoundUi();

    state.ui.previewVolume.value = String(
      Math.round(state.volume.preview * 100),
    );

    state.ui.backgroundVolume.value = String(
      Math.round(state.volume.background * 100),
    );

    state.ui.soundVolume.value = String(
      Math.round(state.volume.sound * 100),
    );

    state.ui.backgroundVolumeLabel.textContent =
      state.ui.backgroundVolume.value;

    state.ui.soundVolumeLabel.textContent =
      state.ui.soundVolume.value;

    setUiEnabled(false);
    updateEditorStatus("Loading");

    try {
      await Promise.all([
        loadDefaultArtwork(),
        loadDefaultSound(),
      ]);
    } catch {
      setCanvasMessage(
        "Some starter files could not be loaded. You can choose replacements below.",
        true,
      );
    }

    updateWorkflowSummaries();
    drawFrame();

    state.initialized = true;
  }

  function cleanup() {
    if (state.destroyed) {
      return;
    }

    state.destroyed = true;

    clearTimeout(state.searchTimer);
    clearInterval(state.recording.timerId);

    for (
      const track of
        state.recording.stream?.getTracks?.() || []
    ) {
      track.stop();
    }

    for (
      const track of
        state.export.stream?.getTracks?.() || []
    ) {
      track.stop();
    }

    if (state.export.animationFrame) {
      cancelAnimationFrame(
        state.export.animationFrame,
      );
    }

    stopPreviewRenderLoop();

    if (state.previewAudio.context) {
      state.previewAudio.context.close().catch(
        () => {},
      );
    }

    if (state.sound.activeObjectUrl) {
      revokeObjectUrl(
        state.sound.activeObjectUrl,
      );
    }

    state.sound.previewElement?.pause();
    revokeAllObjectUrls();
  }

  window.addEventListener(
    "beforeunload",
    cleanup,
  );

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true },
    );
  } else {
    initialize();
  }
})();
