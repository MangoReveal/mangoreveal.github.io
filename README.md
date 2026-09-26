<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#080a0f">

  <title>Who's That Pokémon?</title>

  <meta
    name="description"
    content="Make a dramatic Who's That Pokémon? style reveal video with a mystery silhouette and a Pokémon cry. Unofficial fan project, not affiliated with Nintendo, Game Freak, or The Pokémon Company.">

  <link
    rel="icon"
    type="image/png"
    sizes="16x16"
    href="./Mango/Assets/Extras/icon-16.png">

  <link
    rel="icon"
    type="image/png"
    sizes="32x32"
    href="./Mango/Assets/Extras/icon-32.png">

  <link
    rel="icon"
    type="image/png"
    sizes="48x48"
    href="./Mango/Assets/Extras/icon-48.png">

  <link
    rel="icon"
    type="image/png"
    sizes="192x192"
    href="./Mango/Assets/Extras/icon-192.png">

  <link
    rel="apple-touch-icon"
    sizes="180x180"
    href="./Mango/Assets/Extras/icon-180.png">

  <link
    rel="shortcut icon"
    href="./Mango/Assets/Extras/favicon.ico">

  <meta
    property="og:title"
    content="Who's That Pokémon? Reveal Video Maker">

  <meta
    property="og:description"
    content="Make a dramatic Who's That Pokémon? style reveal video. Unofficial fan project, not affiliated with Nintendo, Game Freak, or The Pokémon Company.">

  <meta
    property="og:image"
    content="./Mango/Assets/Extras/icon-512.png">

  <link rel="stylesheet" href="style.css">
</head>

<body>
  <svg
    width="0"
    height="0"
    style="position: absolute; overflow: hidden;"
    aria-hidden="true">
    <defs>
      <!--
        Gentle unsharp-mask style sharpen. Boosts edge contrast
        to help claw back perceived crispness from soft/old
        source footage - it cannot invent real detail, only make
        existing edges read more clearly. Kept mild since
        sharpening also amplifies noise/grain, which old footage
        already has plenty of.
      -->
      <filter id="pokedexSharpen" x="-10%" y="-10%" width="120%" height="120%">
        <feConvolveMatrix
          order="3"
          kernelMatrix="0 -0.5 0 -0.5 3 -0.5 0 -0.5 0"
          divisor="1"
          bias="0"
          edgeMode="duplicate"
          preserveAlpha="true">
        </feConvolveMatrix>
      </filter>
    </defs>
  </svg>

  <main class="app-shell">
    <header class="app-header">
      <div class="brand-lockup">
        <div class="brand-mark" aria-hidden="true">
          <span class="brand-mark-inner"></span>
        </div>

        <div>
          <h1>Who's That Pokémon?</h1>
          <p class="subtitle">
            Make a dramatic reveal, add a ridiculous sound,
            and pretend this is extremely official.
          </p>
        </div>
      </div>

      <div class="header-actions">
        <span class="header-status">
          <span class="header-status-dot"></span>
          Ready to make a reveal
        </span>

        <button
          id="advancedSettingsButton"
          class="advanced-toggle"
          type="button"
          aria-expanded="false"
          aria-controls="advancedSettings">
          Fine-tune video
          <span class="advanced-toggle-icon" aria-hidden="true">+</span>
        </button>
      </div>
    </header>

    <section
      id="advancedSettings"
      class="advanced-settings"
      hidden
      aria-label="Fine-tune video">

      <div class="advanced-settings-header">
        <div>
          <p class="eyebrow">Optional controls</p>
          <h2>Fine-tune video</h2>
        </div>

        <button
          id="closeAdvancedSettingsButton"
          class="icon-button"
          type="button"
          aria-label="Close fine-tune video panel">
          ×
        </button>
      </div>

      <div class="advanced-grid">
        <section class="advanced-card">
          <h3>Reveal timing</h3>

          <label for="advancedBlankStart">
            BlackedOut picture starts:
            <span id="advancedBlankStartLabel">0.88</span>s
          </label>

          <input
            id="advancedBlankStart"
            type="range"
            min="0"
            max="60"
            step="0.01"
            value="0.88">

          <label for="advancedBlankEnd">
            BlackedOut picture ends:
            <span id="advancedBlankEndLabel">9.58</span>s
          </label>

          <input
            id="advancedBlankEnd"
            type="range"
            min="0"
            max="60"
            step="0.01"
            value="9.58">

          <label for="advancedRevealedStart">
            Reveal starts:
            <span id="advancedRevealedStartLabel">9.59</span>s
          </label>

          <input
            id="advancedRevealedStart"
            type="range"
            min="0"
            max="60"
            step="0.01"
            value="9.59">

          <label for="advancedSoundStart">
            Sound starts:
            <span id="advancedSoundStartLabel">9.89</span>s
          </label>

          <input
            id="advancedSoundStart"
            type="range"
            min="0"
            max="60"
            step="0.01"
            value="9.89">
        </section>

        <section class="advanced-card">
          <h3>Sound levels</h3>

          <label for="backgroundVolume">
            Background video volume:
            <span id="backgroundVolumeLabel">100</span>%
          </label>

          <input
            id="backgroundVolume"
            type="range"
            min="0"
            max="100"
            step="1"
            value="100">

          <label for="soundVolume">
            Pokémon sound volume:
            <span id="soundVolumeLabel">50</span>%
          </label>

          <input
            id="soundVolume"
            type="range"
            min="0"
            max="100"
            step="1"
            value="50">

          <p class="advanced-help">
            Adjust the background video and Pokémon sound separately.
          </p>
        </section>

        <section class="advanced-card">
          <h3>Picture placement</h3>

          <div class="placement-readout">
            <span>Automatic placement</span>
            <strong>Left burst region</strong>
          </div>

          <button
            id="advancedResetPositionButton"
            class="secondary-button full-width"
            type="button">
            Reset picture position
          </button>

          <button
            id="advancedResetAllButton"
            class="text-button full-width"
            type="button">
            Reset all fine-tuning
          </button>
        </section>

        <section class="advanced-card">
          <h3>Shorten video</h3>

          <p class="advanced-help">
            Cut out a boring middle section to make the video
            shorter. Everything else - the BlackedOut picture,
            reveal, and sound - stays timed exactly as set above;
            this just skips over the cut section during playback.
          </p>

          <label class="checkbox-row" for="snipEnabled">
            <input id="snipEnabled" type="checkbox">
            <span>Cut out a section to shorten the video</span>
          </label>

          <label for="snipStart">
            Cut start:
            <span id="snipStartLabel">5.00</span>s
          </label>

          <input
            id="snipStart"
            type="range"
            min="0"
            max="60"
            step="0.01"
            value="5"
            disabled>

          <label for="snipEnd">
            Cut end:
            <span id="snipEndLabel">8.72</span>s
          </label>

          <input
            id="snipEnd"
            type="range"
            min="0"
            max="60"
            step="0.01"
            value="8.72"
            disabled>

          <div id="snipStatus" class="inline-status">
            Turn on the checkbox above to shorten the video.
          </div>
        </section>

        <section class="advanced-card">
          <h3>Video quality</h3>

          <p class="advanced-help">
            If you have a sharper source clip, add it to the
            Mango folder as <code>backgroundHD.mp4</code> and
            turn this on to use it instead of the standard
            background video.
          </p>

          <label class="checkbox-row" for="useHdBackground">
            <input id="useHdBackground" type="checkbox">
            <span>Use HD background video</span>
          </label>

          <div id="hdBackgroundStatus" class="inline-status">
            Using the standard background video.
          </div>

          <label for="exportFrameRate">
            Download frame rate:
            <span id="exportFrameRateLabel">30</span> fps
          </label>

          <input
            id="exportFrameRate"
            type="range"
            min="15"
            max="60"
            step="1"
            value="30">

          <p class="advanced-help">
            Higher looks smoother but makes a bigger file. 24-30
            is the usual range for video; go higher only if you
            need extra-smooth motion.
          </p>

          <label for="exportQuality">
            Download quality:
            <span id="exportQualityLabel">6</span> Mbps
          </label>

          <input
            id="exportQuality"
            type="range"
            min="2"
            max="20"
            step="1"
            value="6">

          <p class="advanced-help">
            More bitrate gives the recorder more room to work
            with, which helps most on grainy or soft source
            footage. It can't add detail that isn't there, but it
            avoids piling extra compression damage on top.
          </p>

          <label class="checkbox-row" for="sharpenVideo">
            <input id="sharpenVideo" type="checkbox" checked>
            <span>Sharpen picture (helps soft/old source video)</span>
          </label>
        </section>
      </div>
    </section>

    <div class="app-layout">
      <section class="editor-column">
        <article class="editor-card">
          <div class="editor-card-header">
            <div class="editor-card-heading">
              <span class="pokedex-lens" aria-hidden="true">
                <span class="pokedex-lens-shine"></span>
              </span>

              <span class="pokedex-lights" aria-hidden="true">
                <span class="pokedex-light pokedex-light-red"></span>
                <span class="pokedex-light pokedex-light-yellow"></span>
                <span class="pokedex-light pokedex-light-green"></span>
              </span>
            </div>
          </div>

          <div class="video-editor">
            <video
              id="backgroundVideo"
              preload="metadata"
              playsinline>
              <source
                src="./Mango/background.mp4"
                type="video/mp4">
            </video>

            <canvas
              id="outputCanvas"
              aria-label="Pokémon reveal preview">
            </canvas>

            <div id="canvasMessage" class="canvas-message">
              Loading your reveal preview...
            </div>

            <button
              id="centerPlayButton"
              class="center-play-button"
              type="button"
              title="Play reveal"
              aria-label="Play reveal"
              disabled>
              ▶
            </button>
          </div>

          <div class="editor-toolbar">
            <button
              id="playPauseButton"
              class="toolbar-icon-button"
              type="button"
              title="Play reveal"
              aria-label="Play reveal"
              disabled>
              ▶
            </button>

            <button
              id="muteButton"
              class="toolbar-icon-button"
              type="button"
              title="Mute preview"
              aria-label="Mute preview"
              disabled>
              🔊
            </button>

            <div class="volume-control">
              <label class="visually-hidden" for="previewVolume">
                Preview volume
              </label>

              <input
                id="previewVolume"
                type="range"
                min="0"
                max="100"
                step="1"
                value="100"
                aria-label="Preview volume">
            </div>

            <span id="currentTime" class="time-label">
              00:00.00
            </span>

            <input
              id="timeline"
              type="range"
              min="0"
              max="0"
              value="0"
              step="0.001"
              disabled
              aria-label="Move through reveal preview">

            <span id="duration" class="time-label">
              00:00.00
            </span>
          </div>

          <div class="editor-hint">
            <span class="hint-icon" aria-hidden="true">✦</span>
            <span>
              Pause the preview to move the picture.
              Drag its corner to resize it.
            </span>
          </div>
        </article>
      </section>

      <aside class="workflow-column">
        <nav class="workflow-nav" aria-label="Reveal setup">
          <button
            class="workflow-tab active"
            type="button"
            data-panel="pokemonPanel"
            aria-current="step">
            <span class="workflow-tab-icon">⌕</span>

            <span class="workflow-tab-copy">
              <strong>Pokémon</strong>
              <small id="pokemonTabSummary">
                Choose a Pokémon
              </small>
            </span>

            <span id="pokemonTabState" class="workflow-tab-state">•</span>
          </button>

          <button
            class="workflow-tab"
            type="button"
            data-panel="picturePanel">
            <span class="workflow-tab-icon">✦</span>

            <span class="workflow-tab-copy">
              <strong>Picture</strong>
              <small id="pictureTabSummary">
                Choose the pictures
              </small>
            </span>

            <span id="pictureTabState" class="workflow-tab-state">•</span>
          </button>

          <button
            class="workflow-tab"
            type="button"
            data-panel="soundPanel">
            <span class="workflow-tab-icon">♪</span>

            <span class="workflow-tab-copy">
              <strong>Sound</strong>
              <small id="soundTabSummary">
                Pick the Pokémon sound
              </small>
            </span>

            <span id="soundTabState" class="workflow-tab-state">•</span>
          </button>

          <button
            class="workflow-tab"
            type="button"
            data-panel="timingPanel">
            <span class="workflow-tab-icon">⇩</span>

            <span class="workflow-tab-copy">
              <strong>Download</strong>
              <small id="timingTabSummary">
                Get your video
              </small>
            </span>

            <span id="timingTabState" class="workflow-tab-state">•</span>
          </button>
        </nav>

        <section
          id="pokemonPanel"
          class="workflow-panel active"
          aria-labelledby="pokemonPanelTitle">

          <div class="workflow-panel-header">
            <div>
              <p class="eyebrow">Choose your star</p>
              <h2 id="pokemonPanelTitle">Pokémon</h2>
            </div>

            <span class="panel-number">01</span>
          </div>

          <label for="pokemonSearch">Search for a Pokémon</label>

          <div class="search-row">
            <input
              id="pokemonSearch"
              class="text-input"
              type="search"
              placeholder="Try Pikachu or Bulbasaur..."
              autocomplete="off">

            <button
              id="pokemonSearchButton"
              class="secondary-button"
              type="button">
              Find Pokémon
            </button>
          </div>

          <select
            id="pokemonResults"
            class="pokemon-results"
            size="5"
            aria-label="Pokémon search results">
          </select>

          <button
            id="loadPokemonButton"
            class="primary-button full-width"
            type="button"
            disabled>
            Use this Pokémon
          </button>

          <div
            id="pokemonLookupStatus"
            class="inline-status"
            role="status"
            aria-live="polite">
            Search for a Pokémon or choose a picture manually.
          </div>

          <label for="pokemonName">Name shown in video</label>

          <input
            id="pokemonName"
            class="text-input"
            type="text"
            value="Pikachu"
            maxlength="40"
            autocomplete="off">

          <label class="checkbox-row" for="showNameText">
            <input
              id="showNameText"
              type="checkbox"
              checked>

            <span>
              Show the name as on-screen text
              (e.g. "It's Pikachu!") when revealed
            </span>
          </label>

          <div class="workflow-navigation">
            <button
              class="secondary-button workflow-back-button"
              type="button"
              disabled>
              Back
            </button>

            <button
              class="primary-button workflow-next-button"
              type="button"
              data-next-panel="picturePanel">
              Choose pictures
            </button>
          </div>
        </section>

        <section
          id="picturePanel"
          class="workflow-panel"
          aria-labelledby="picturePanelTitle"
          hidden>

          <div class="workflow-panel-header">
            <div>
              <p class="eyebrow">Set the composition</p>
              <h2 id="picturePanelTitle">Picture</h2>
            </div>

            <span class="panel-number">02</span>
          </div>

          <p class="section-help">
            Upload the picture — the BlackedOut silhouette is
            made automatically.
          </p>

          <label
            class="file-button primary-button full-width"
            for="revealedImageInput">
            Upload picture
          </label>

          <input
            id="revealedImageInput"
            type="file"
            accept="image/png,image/webp,image/jpeg"
            hidden>

          <div
            id="pictureStatus"
            class="inline-status"
            role="status"
            aria-live="polite">
            Search a Pokémon or upload a picture to get started.
          </div>

          <div class="secondary-actions">
            <button
              id="resetPositionButton"
              class="text-button"
              type="button">
              Reset picture position
            </button>

            <button
              id="regenerateSilhouetteButton"
              class="text-button"
              type="button">
              Redo BlackedOut picture
            </button>
          </div>

          <details class="inline-disclosure">
            <summary>Use your own BlackedOut picture instead</summary>

            <label
              class="file-button secondary-button full-width"
              for="blankImageInput">
              Upload BlackedOut picture
            </label>

            <input
              id="blankImageInput"
              type="file"
              accept="image/png,image/webp,image/jpeg"
              hidden>
          </details>

          <div class="workflow-navigation">
            <button
              class="secondary-button workflow-back-button"
              type="button"
              data-previous-panel="pokemonPanel">
              Back
            </button>

            <button
              class="primary-button workflow-next-button"
              type="button"
              data-next-panel="soundPanel">
              Choose sound
            </button>
          </div>
        </section>

        <section
          id="soundPanel"
          class="workflow-panel"
          aria-labelledby="soundPanelTitle"
          hidden>

          <div class="workflow-panel-header">
            <div>
              <p class="eyebrow">Give it a voice</p>
              <h2 id="soundPanelTitle">Sound</h2>
            </div>

            <span class="panel-number">03</span>
          </div>

          <div
            id="soundStatus"
            class="inline-status"
            role="status"
            aria-live="polite">
            Default sound ready — used automatically when you play the reveal.
          </div>

          <div class="sound-source-actions">
            <button
              id="chooseAudioButton"
              class="secondary-button"
              type="button">
              Upload Custom Audio
            </button>

            <button
              id="recordAudioButton"
              class="secondary-button"
              type="button">
              Use Microphone
            </button>
          </div>

          <input
            id="audioInput"
            type="file"
            accept="audio/*"
            hidden>

          <div
            id="recordingControls"
            class="recording-controls"
            hidden>
            <div class="recording-heading">
              <span class="recording-dot"></span>
              <strong>Recording a sound</strong>

              <span
                id="recordingTimer"
                class="recording-timer">
                00:00
              </span>
            </div>

            <p>
              Record naturally, then choose the part you want to use.
            </p>

            <button
              id="stopRecordingButton"
              class="danger-button full-width"
              type="button">
              Stop recording
            </button>
          </div>

          <section
            id="crySelector"
            class="cry-selector"
            hidden>

            <div class="subsection-heading">
              <span class="subsection-label">
                Pokémon sounds
              </span>

              <strong id="cryPokemonLabel">
                Choose a Pokémon first
              </strong>
            </div>

            <label for="cryVersion">Sound version</label>

            <select
              id="cryVersion"
              class="text-input">
              <option value="latest">Latest</option>
              <option value="legacy">Classic</option>
            </select>

            <div id="cryStatus" class="inline-status">
              Choose a Pokémon to see its sounds.
            </div>

            <div class="cry-actions">
              <button
                id="previewCryButton"
                class="secondary-button"
                type="button"
                disabled>
                Play Pokémon sound
              </button>

              <button
                id="useCryButton"
                class="primary-button"
                type="button"
                disabled>
                Use this Pokémon sound
              </button>
            </div>
          </section>

          <button
            id="editAudioButton"
            class="secondary-button full-width"
            type="button"
            aria-expanded="false"
            aria-controls="audioEditor">
            Trim Audio
          </button>

          <section
            id="audioEditor"
            class="audio-editor"
            hidden>

            <div class="audio-editor-heading">
              <strong>Choose the part to use</strong>

              <span id="audioDurationLabel">
                0.00s selected
              </span>
            </div>

            <label for="audioTrimStart">
              Start:
              <span id="audioTrimStartLabel">0.00</span>s
            </label>

            <input
              id="audioTrimStart"
              type="range"
              min="0"
              max="0"
              step="0.01"
              value="0">

            <label for="audioTrimEnd">
              End:
              <span id="audioTrimEndLabel">0.00</span>s
            </label>

            <input
              id="audioTrimEnd"
              type="range"
              min="0"
              max="0"
              step="0.01"
              value="0">

            <div
              id="audioTrimStatus"
              class="inline-status">
              Choose a sound section no longer than 2.5 seconds.
            </div>

            <div class="audio-editor-actions">
              <button
                id="playAudioSelectionButton"
                class="secondary-button full-width"
                type="button">
                Play selected part
              </button>
            </div>
          </section>

          <div class="workflow-navigation">
            <button
              class="secondary-button workflow-back-button"
              type="button"
              data-previous-panel="picturePanel">
              Back
            </button>

            <button
              class="primary-button workflow-next-button"
              type="button"
              data-next-panel="timingPanel">
              Set reveal timing
            </button>
          </div>
        </section>

        <section
          id="timingPanel"
          class="workflow-panel"
          aria-labelledby="timingPanelTitle"
          hidden>

          <div class="workflow-panel-header">
            <div>
              <p class="eyebrow">Last step!</p>
              <h2 id="timingPanelTitle">Download</h2>
            </div>

            <span class="panel-number">04</span>
          </div>

          <p class="pokedex-callout">
            Data compiled. Analysis complete.
            <strong>Time to download your creation!</strong>
          </p>

          <p class="section-help">
            Want to fine-tune exactly when the picture, reveal,
            and sound happen? Open Fine-tune video above.
          </p>

          <div class="download-actions">
            <button
              id="downloadButton"
              class="save-button large-download full-width"
              type="button"
              disabled>
              <span aria-hidden="true">⇩</span>
              Download reveal video
            </button>
          </div>

          <div class="workflow-navigation">
            <button
              class="secondary-button workflow-back-button"
              type="button"
              data-previous-panel="soundPanel">
              Back
            </button>
          </div>
        </section>
      </aside>
    </div>

    <footer class="legal-footer">
      <p>
        This is an unofficial, fan-made project. It is not
        affiliated with, endorsed by, sponsored by, or in any
        way officially connected with Nintendo, Game Freak,
        Creatures Inc., or The Pokémon Company, or any of their
        subsidiaries or affiliates. Pokémon and all related
        names, characters, sounds, and imagery are trademarks
        of their respective owners and are used here for
        parody/fan purposes only, without any claim of
        ownership.
      </p>
    </footer>
  </main>

  <div
    id="upvotePopup"
    class="modal-overlay"
    hidden>

    <div
      class="pokedex-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upvotePopupTitle">

      <div class="pokedex-modal-lights">
        <span class="pokedex-light pokedex-light-blue"></span>
        <span class="pokedex-light pokedex-light-red"></span>
        <span class="pokedex-light pokedex-light-yellow"></span>
        <span class="pokedex-light pokedex-light-green"></span>
      </div>

      <h2 id="upvotePopupTitle">Video downloaded!</h2>

      <p>
        Enjoying BlackedOut Reveal Studio? This project started
        as a Reddit post - if you liked using it, an upvote
        would really help it reach more Trainers.
      </p>

      <a
        id="upvoteLink"
        class="save-button full-width"
        href="#"
        target="_blank"
        rel="noopener noreferrer">
        Yes! I'll Upvote!
      </a>

      <button
        id="dismissUpvotePopup"
        class="text-button full-width"
        type="button">
        Maybe later
      </button>

      <label class="checkbox-row" for="hideUpvotePopup">
        <input id="hideUpvotePopup" type="checkbox">
        <span>Don't show this again</span>
      </label>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
