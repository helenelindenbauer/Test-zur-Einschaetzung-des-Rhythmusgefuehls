// ============================================================
// AUDIO-PLAYER-BAUSTEIN
// ============================================================
//
// Wiederverwendbarer Baustein für alle Hörbeispiele der Website.
// Zwei Modi:
//   - repeatable = false (Standard): Play-Button ist nach dem
//     ersten Abspielen für immer deaktiviert. Kein Pausieren.
//     (für Tests 1, 2, 3)
//   - repeatable = true: Play-Button bleibt nutzbar, jedes erneute
//     Abspielen wird gezählt. (für Test 4 – Nachtappen)
//
// Wichtig: Wiedergabe läuft über die Web Audio API (nicht <audio>),
// damit Start-Zeitpunkt und spätere Tap-Zeitstempel auf derselben,
// sample-genauen Zeitachse (audioCtx.currentTime) liegen. Das brauchen
// wir in Test 1 für die relative-Phase-Berechnung (SI_ARV/SI_LRV/SI_ENT).

// Ein einziger, geteilter AudioContext für die ganze Seite (Browser
// erlauben oft nur eine begrenzte Anzahl aktiver Contexts).
function getAudioContext() {
  if (!window._sharedAudioCtx) {
    // Safari brauchte früher das "webkit"-Präfix – Fallback zur Sicherheit
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    window._sharedAudioCtx = new AudioContextClass();
  }
  return window._sharedAudioCtx;
}

// Lädt eine Audiodatei per URL und dekodiert sie zu einem AudioBuffer.
// (Das ist der Weg, den wir später mit den echten MP3-Dateien nutzen.)
async function loadAudioBuffer(url) {
  const audioCtx = getAudioContext();
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return audioCtx.decodeAudioData(arrayBuffer);
}

// Erzeugt einen kurzen Sinuston "offline" als AudioBuffer - dient als
// Platzhalter, solange echte Audiodateien noch fehlen (z.B. Test 4, bis
// die echten Claves-MP3s hochgeladen sind).
async function generateTestTone(durationSec = 2.5, freq = 440) {
  const audioCtx = getAudioContext();
  const sampleRate = audioCtx.sampleRate;
  const offlineCtx = new OfflineAudioContext(1, sampleRate * durationSec, sampleRate);

  const osc = offlineCtx.createOscillator();
  osc.frequency.value = freq;

  const gain = offlineCtx.createGain();
  gain.gain.setValueAtTime(0.3, 0);
  gain.gain.setValueAtTime(0.3, Math.max(0, durationSec - 0.1));
  gain.gain.linearRampToValueAtTime(0, durationSec);

  osc.connect(gain);
  gain.connect(offlineCtx.destination);

  osc.start(0);
  osc.stop(durationSec);

  return offlineCtx.startRendering();
}

// ============================================================
// ALLE LAUFENDEN AUDIOQUELLEN STOPPEN (z.B. beim Seitenwechsel)
// ============================================================
//
// Ein gestarteter AudioBufferSourceNode spielt unabhängig vom Seitenwechsel
// weiter, bis er von selbst endet oder wir ihn explizit stoppen. Deshalb
// merken wir uns hier alle gerade laufenden Quellen und können sie bei
// Bedarf (Klick auf "Weiter") gesammelt abbrechen.

function getActiveSourcesRegistry() {
  if (!window._activeAudioSources) window._activeAudioSources = new Set();
  return window._activeAudioSources;
}

// Merkt eine Audioquelle vor und entfernt sie automatisch wieder,
// sobald sie von selbst zu Ende gespielt hat.
function registerAudioSource(source) {
  const registry = getActiveSourcesRegistry();
  registry.add(source);
  source.addEventListener("ended", () => registry.delete(source));
}

// Stoppt alle gerade laufenden Audioquellen sofort (z.B. bei Seitenwechsel).
function stopAllAudio() {
  const registry = getActiveSourcesRegistry();
  registry.forEach(source => {
    try {
      source.stop();
    } catch (e) {
      // Quelle war schon beendet/gestoppt - kann ignoriert werden
    }
  });
  registry.clear();
}

// Erzeugt den Play-Button + Status-Anzeige in "container" und gibt ein
// Objekt zurück, mit dem man später (z.B. für die Datenerfassung) den
// Status abfragen kann: wurde angehört? bis zum Ende angehört? wie oft?
function createAudioPlayer({ container, buffer, repeatable = false, onPlay = null, onEnded = null }) {
  const audioCtx = getAudioContext();

  let playCount = 0;
  let started = false;
  let isPlaying = false;                // verhindert überlappendes Abspielen
  let finishedAtLeastOnce = false;      // wird bei jedem neuen Durchgang zurückgesetzt
  let finishedAtLeastOnceEver = false;  // bleibt EINMAL true für immer true (für Datenschema)
  let lastStartTime = null; // wichtig für Test 1: Nullpunkt für Tap-Zeitstempel

  const button = document.createElement("button");
  button.type = "button";
  button.className = "audio-play-btn";
  button.textContent = "▶ Abspielen";

  const status = document.createElement("span");
  status.className = "audio-status";

  container.appendChild(button);
  container.appendChild(status);

  function updateStatus() {
    if (repeatable) {
      status.textContent = playCount > 0 ? `Anzahl Anhörungen: ${playCount}` : "";
    } else {
      status.textContent = started ? "Wird abgespielt … (kein erneutes Abspielen möglich)" : "";
    }
  }

  async function play() {
    // Verhindert, dass während einer laufenden Wiedergabe erneut gestartet wird
    // (egal ob repeatable oder nicht) - sonst würde das Stück doppelt/überlappend laufen
    if (isPlaying) return;

    // Bei nicht-wiederholbaren Stücken: nach dem ersten Start bleibt der Button aus
    if (!repeatable && started) return;

    // Browser setzen den AudioContext oft erst nach einer Nutzerinteraktion fort.
    // Wichtig: wirklich auf das Fortsetzen WARTEN, bevor wir currentTime auslesen -
    // sonst könnte der gelesene Zeitpunkt noch aus der "angehaltenen" Phase stammen.
    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }

    isPlaying = true;
    button.disabled = true;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);

    lastStartTime = audioCtx.currentTime + 0.05; // kleiner Sicherheitspuffer
    source.start(lastStartTime);
    registerAudioSource(source);

    if (onPlay) onPlay(lastStartTime);

    started = true;
    playCount++;
    finishedAtLeastOnce = false;

    source.onended = () => {
      isPlaying = false;
      finishedAtLeastOnce = true;
      finishedAtLeastOnceEver = true; // bleibt ab jetzt für immer true
      if (repeatable && !button.dataset.lockedByExternalCaller) {
        button.disabled = false;
      }
      updateStatus();
      if (onEnded) onEnded();
    };

    if (!repeatable) {
      button.textContent = "Wurde abgespielt";
    }

    updateStatus();
  }

  button.addEventListener("click", play);

  return {
    // Erlaubt externem Code (z.B. Test 4 nach Klick auf das rote Feld), den
    // Button dauerhaft zu sperren, unabhängig vom normalen Play/Ende-Zyklus
    lockButton: () => {
      button.disabled = true;
      button.dataset.lockedByExternalCaller = "true";
    },
    // für die spätere Datenerfassung (siehe Datenschema: "Angehört" / "Bis Ende angehört")
    hasStarted: () => started,
    hasFinishedAtLeastOnce: () => finishedAtLeastOnce,           // nur aktueller Durchgang
    hasFinishedAtLeastOnceEver: () => finishedAtLeastOnceEver,   // bleibt dauerhaft true (das ist das Datenschema-Feld)
    getPlayCount: () => playCount,
    // für Test 1: Nullpunkt, auf den sich Tap-Zeitstempel beziehen
    getLastStartTime: () => lastStartTime,
  };
}
