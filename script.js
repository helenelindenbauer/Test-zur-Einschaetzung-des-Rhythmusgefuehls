// ============================================================
// HILFSFUNKTIONEN: wiederkehrende Textbausteine
// ============================================================
// Tests 2, 3 und 4 haben pro Test dieselbe Kurzerklärung auf jeder
// Item-Seite (nur die Audiodatei im Hintergrund unterscheidet sich
// später) - deshalb hier als Funktion, statt den Text 5x/6x zu kopieren.

// ============================================================
// DEBUG-MODUS
// ============================================================
// Die kleinen grauen Debug-Ausgaben (Taps, SI-Werte etc.) unter den Playern
// sind NUR für uns beim Testen gedacht - echte Versuchspersonen sollen das
// nicht sehen. Vor dem echten Launch einfach auf "false" stellen, dann
// werden alle .debug-output-Elemente automatisch ausgeblendet (siehe CSS).
const DEBUG_MODE = false;

document.documentElement.classList.toggle("debug-mode", DEBUG_MODE);

// ============================================================
// RANDOMISIERUNG: Fisher-Yates-Shuffle
// ============================================================
// Für jeden Test wird die Zuordnung zwischen fester Bildschirm-Position
// ("Slot", z.B. "Höraufgabe 2") und dem tatsächlich abgespielten Stück
// ("Content") gemischt - getrennt pro Test, damit nie ein Stück aus einem
// anderen Test hineinrutschen kann.
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Verteilt eine (bereits gemischte) Liste von Inhalten auf eine feste Liste
// von Slot-IDs, in der Reihenfolge der Slots. Ergebnis hat dieselbe Form wie
// zuvor ({ id: <Slot-ID>, ...Inhalt }), der Rest vom Code ändert sich nicht.
function assignShuffledContentToSlots(slotIds, content) {
  const shuffled = shuffleArray(content);
  return slotIds.map((slotId, i) => ({ id: slotId, ...shuffled[i] }));
}

function audioPlaceholder(repeatable) {
  // Platzhalter fürs Audio – die echte Web-Audio-API-Anbindung
  // (Play-Button, "nur 1x abspielbar", Sinuston etc.) bauen wir
  // in einem eigenen Schritt. Hier nur als Textmarker sichtbar.
  return repeatable
    ? `<p class="audio-placeholder">▶ [Audio-Platzhalter – hier kommt später der Play-Button, beliebig oft anhörbar]</p>`
    : `<p class="audio-placeholder">▶ [Audio-Platzhalter – hier kommt später der Play-Button, nur 1x abspielbar]</p>`;
}

function test2ItemBody(stimulusId) {
  return `
    <p>Hören Sie genau zu und ermitteln Sie, ob das Tapping im Takt ist und zu dem Rhythmus des Klaviers passt oder nicht.</p>
    <p><strong>Stimmt</strong> das Tapping mit dem Rhythmus des Klaviers <strong>überein</strong>, so wählen Sie die Antwortmöglichkeit <strong>JA</strong>.</p>
    <p><strong>Stimmt</strong> das Tapping mit dem Rhythmus des Klaviers <strong>NICHT überein</strong>, so wählen Sie die Antwortmöglichkeit <strong>NEIN</strong>.</p>
    <p><strong>ACHTUNG</strong>: Wenn das <strong>Musikstück begonnen</strong> wurde, ist kein erneutes Abspielen und auch keine Pause möglich. <strong>Ihre Antwort soll nach 1x anhören erfolgen!</strong></p>
    <div id="audio-container-${stimulusId}" class="audio-container"></div>
    <div id="debug-${stimulusId}" class="debug-output"></div>
    <p class="field-hint">("Weiter" wird erst aktiv, sobald Sie geantwortet haben UND das Stück komplett abgespielt wurde)</p>
    <p>Das Tapping stimmt mit dem Rhythmus des Klaviers überein und passt zum Takt und Beat. <span class="required-note">(Pflichtfrage)</span></p>
    <label class="radio-option"><input type="radio" name="__RADIO_NAME__" value="0"> JA</label>
    <label class="radio-option"><input type="radio" name="__RADIO_NAME__" value="1"> NEIN</label>
  `;
}

function test3ItemBody(stimulusId) {
  return `
    <p>Ermitteln Sie, ob die Wiederholung identisch mit dem zuerst gespielten Rhythmus ist oder nicht. Vor dem ersten Rhythmus und vor der Wiederholung ist ein Sinuston zu hören. Dieser gibt den Beginn des Rhythmus und der Wiederholung an.</p>
    <p><strong>Stimmen</strong> der Rhythmus und die Wiederholung <strong>überein</strong>, so wählen Sie die Antwortmöglichkeit <strong>JA</strong>.</p>
    <p><strong>Stimmen</strong> der Rhythmus und die Wiederholung <strong>NICHT überein</strong>, so wählen Sie die Antwortmöglichkeit <strong>NEIN</strong>.</p>
    <p><strong>ACHTUNG</strong>: Wenn das <strong>Musikstück begonnen</strong> wurde, ist kein erneutes Abspielen und auch keine Pause möglich. <strong>Ihre Antwort soll nach 1x anhören erfolgen!</strong></p>
    <div id="audio-container-${stimulusId}" class="audio-container"></div>
    <div id="debug-${stimulusId}" class="debug-output"></div>
    <p class="field-hint">("Weiter" wird erst aktiv, sobald Sie geantwortet haben UND das Stück komplett abgespielt wurde)</p>
    <p>Der Rhythmus und die Wiederholung stimmen überein: <span class="required-note">(Pflichtfrage)</span></p>
    <label class="radio-option"><input type="radio" name="__RADIO_NAME__" value="0"> JA</label>
    <label class="radio-option"><input type="radio" name="__RADIO_NAME__" value="1"> NEIN</label>
  `;
}

function test1ItemBody(stimulusId) {
  return `
    <p>Nachdem Sie auf "Abspielen" gedrückt haben, tappen Sie bitte im Rhythmus und (4/4-)Takt des Stücks mit Ihrer Leertaste mit.</p>
    <p>Wenn das Stück <strong>stoppt, tappen Sie bitte noch weiter</strong>, bis Sie den Sinuston hören.</p>
    <p><strong>ACHTUNG</strong>: Wenn das <strong>Musikstück begonnen</strong> wurde, ist kein erneutes Abspielen und auch keine Pause möglich. <strong>Ihr Tapping wird ab diesem Moment gewertet!</strong></p>
    <p><em>(Mit "tappen" ist das Drücken und Loslassen der Leertaste gemeint. Dies soll immer wieder wiederholt werden, so wie man es beim Mitklatschen zu einem Stück tun würde)</em></p>
    <div id="audio-container-${stimulusId}" class="audio-container"></div>
    <div id="debug-${stimulusId}" class="debug-output"></div>
    <p class="future-note">("Weiter" wird erst aktiv, sobald das Stück inklusive der 30 Sekunden Weitertappen komplett durchlaufen wurde)</p>
  `;
}

function test4ItemBody(stimulusId) {
  return `
    <p>Sie dürfen sich den Rhythmus nun so oft anhören, wie Sie wollen. Jedes erneute Anhören wird zum Testergebnis gezählt. Sie müssen den Rhythmus zumindest ein mal abgespielt haben, um mit dem Nachtappen beginnen zu können.</p>
    <div id="audio-container-${stimulusId}" class="audio-container"></div>
    <p>Wenn Sie sich bereit fühlen, den Rhythmus nachzutappen, so klicken Sie mit Ihrer linken Maustaste auf das rote Feld (Ein erneutes Abspielen des Rhythmus ist nun nicht mehr möglich). Anschließend können Sie den Rhythmus nachtappen.</p>
    <p>Wenn Sie den Rhythmus nachgetappt haben, so klicken Sie erneut mit der linken Maustaste auf das nun grüne Feld, um das Nachtappen zu beenden. Wann Sie mit dem Tappen beginnen, spielt dabei keine Rolle. Ob der Rhythmus korrekt nachgetappt wurde, wird anhand Ihres ersten Tappings berechnet.</p>
    <div id="tap-start-${stimulusId}" class="tap-start-field">Klicken, um mit dem Nachtappen zu beginnen</div>
    <div id="debug-${stimulusId}" class="debug-output"></div>
    <p class="future-note">(Später: "Weiter" erst möglich, nachdem der Rhythmus nachgetappt wurde – TODO)</p>
  `;
}

// ============================================================
// SCHRITT-LISTE
// ============================================================

const steps = [

  // ---------- 1. EINLEITUNG ----------
  {
    id: "intro",
    group: "Einleitung",
    title: "Einleitung",
    html: `
      <p>Liebe Teilnehmende!</p>
      <p>Im Rahmen meiner Bachelorarbeit im Fach Musikwissenschaft an der Universität Wien habe ich einen Test entwickelt, der das Rhythmusgefühl von Personen einschätzen soll. Ihre Teilnahme an dem Test ermöglicht nun eine Überprüfung der einzelnen Aufgaben, damit die Validität des Tests evaluiert werden kann. Dabei soll ermittelt werden, ob der Test tatsächlich das misst, was er messen soll.</p>
      <p>Im Rahmen dieses Tests werden Sie Hörbeispiele hören, bei denen Sie einerseits Unterschiede in Rhythmen erkennen sollen und andererseits selbst zu Rhythmen tappen oder diese reproduzieren sollen. Die Dauer des Tests beträgt in etwa 30 Minuten.</p>
      <p>Ihre Daten werden anonym gespeichert und Ihre Antworten können Ihrer Person zu keinem Zeitpunkt zugeordnet werden.</p>
      <p>Der Test muss neben der Validität auch auf seine Reliabilität überprüft werden. Dabei wird ermittelt, wie zuverlässig er das Rhythmusgefühl einer Person messen kann. Mein Vorgehen dabei ist eine Test-Retest-Reliabilitätsprüfung, bei der der Test von denselben Versuchspersonen noch einmal durchgeführt wird. Die Unterschiede oder Gemeinsamkeiten der Daten vom ersten und vom zweiten Durchführungsdatum werden verglichen, wobei kleine Unterschiede auf eine hohe Reliabilität schließen lassen und damit auf eine hohe Zuverlässigkeit des Tests. Um Lerneffekte und ein Erinnern an die Hörbeispiele und gegebene Antworten möglichst auszuschließen, soll dazwischen ein Abstand von mehreren Monaten liegen.</p>
      <p>Es wäre toll, wenn Sie sich bereit erklären, mich beim Ermitteln der Test-Retest-Reliabilität zu unterstützen. Ich werde dazu im November eine E-Mail aussenden, um Sie um ein erneutes Ausfüllen des Tests zu bitten. Geben Sie dafür bitte eine E-Mail-Adresse an. Die E-Mail-Adresse wird nur für den Zweck einer erneuten Kontaktaufnahme im November genutzt und separat gespeichert, sodass sie nicht mit Ihren Ergebnissen des Tests in Verbindung steht. Ihre Daten bleiben anonym.</p>

      <label class="field-label" for="email-input">E-Mail-Adresse (optional)</label>
      <input type="email" id="email-input" placeholder="ihre.adresse@beispiel.at">

      <p>&nbsp;</p>

      <p>Für das spätere anonyme Zusammenfügen und Auswerten beider Testergebnisse bitte ich Sie, ein anonymes Codewort zu erstellen. Außerdem ist mithilfe des Codeworts ein frühzeitiges Löschen Ihrer Daten möglich.</p>
      <p>Bitte notieren Sie <strong>Ihr Codewort</strong>, welches sich folgendermaßen zusammensetzt:</p>
      <ul>
        <li>Den <strong>ersten beiden Buchstaben</strong> des Vornamens Ihrer <strong>Mutter</strong></li>
        <li>Den <strong>ersten beiden Buchstaben</strong> des Vornamens Ihres <strong>Vaters</strong></li>
        <li>Ihrer <strong>Hausnummer</strong></li>
      </ul>
      <p class="example-block"><em>Beispiel (fiktiv)</em><br>
      Vorname der Mutter: Sara<br>
      Vorname des Vaters: Herbert<br>
      Hausnummer: 6<br>
      Fiktives Codewort: SAHE06</p>

      <label class="field-label" for="codeword-input">Codewort <span class="required-note">(Pflichtfeld)</span></label>
      <input type="text" id="codeword-input" placeholder="z.B. SAHE06" maxlength="6">
      <p class="field-hint">Format: 2 Buchstaben + 2 Buchstaben + 2 Ziffern</p>

      <p>Ihre Teilnahme erfolgt freiwillig und kann jederzeit ohne die Angabe von Gründen abgebrochen werden. Dadurch entstehen Ihnen keine Nachteile. Ihre Daten werden in diesem Fall nicht ausgewertet. Ihre Daten werden anonym verarbeitet und gespeichert. Sie werden nur zu wissenschaftlichen Zwecken verwendet, nicht an Dritte weitergegeben und können nicht mit Ihrer Person in Verbindung gebracht werden. Außerdem hat nur geschultes wissenschaftliches Personal, welches der Schweigepflicht unterliegt, Zugriff auf die Daten. In Anlehnung an die Richtlinien der Deutschen Gesellschaft für Psychologie (DGPs) werden Ihre Daten mindestens 10 Jahre lang gespeichert. Wenn Sie eine vorzeitige Löschung Ihrer Daten beantragen möchten, können Sie dies mithilfe Ihres persönlichen Codeworts tun. Bitte bestätigen Sie, dass Sie mindestens 16 Jahre alt sind und an dieser Studie freiwillig teilnehmen möchten. Ich gehe sorgsam und verantwortungsvoll mit Ihren Daten um.</p>

      <label class="checkbox-option">
        <input type="checkbox" id="consent-checkbox">
        Ich bin mindestens 16 Jahre alt, möchte an diesem Test teilnehmen und stimme zu, dass meine personenbezogenen Daten gemäß den hier aufgeführten Angaben verarbeitet werden.
        <span class="required-note">(Pflichtfeld)</span>
      </label>

      <p>&nbsp;</p>

      <p>Mit Ihrem Beitrag unterstützen Sie die Erforschung von Musik- und Rhythmuswahrnehmung. Dafür möchte ich Ihnen herzlich danken!</p>

      <p class="contact-block">
        Kontakt:<br>
        <a href="mailto:helene.lindenbauer@univie.ac.at">helene.lindenbauer@univie.ac.at</a><br>
        Helene Lindenbauer<br>
        Universität Wien<br>
        Institut für Musikwissenschaft
      </p>
    `,
    validate(section) {
      const consent = section.querySelector("#consent-checkbox").checked;
      const codeword = section.querySelector("#codeword-input").value.trim();
      const codewordPattern = /^[A-Za-zÄÖÜäöüß]{2}[A-Za-zÄÖÜäöüß]{2}\d{2}$/;
      return consent && codewordPattern.test(codeword);
    }
  },

  // ---------- 2. PERSÖNLICHE ANGABEN ----------
  {
    id: "personal",
    group: "Angaben",
    title: "Persönliche Angaben",
    html: `
      <label class="field-label" for="age-input">Alter <span class="required-note">(Pflichtfeld)</span></label>
      <input type="number" id="age-input" min="0" max="120">

      <label class="field-label" for="gender-input">Geschlecht <span class="required-note">(Pflichtfeld)</span></label>
      <input type="text" id="gender-input">

      <p>&nbsp;</p>

      <p class="field-label">Ich spiele Schlagwerk und/oder Percussioninstrumente <span class="required-note">(Pflichtfeld)</span></p>
      <label class="radio-option"><input type="radio" name="drummer" id="drummer-yes" value="0"> Ja</label>
      <label class="radio-option"><input type="radio" name="drummer" id="drummer-no" value="1"> Nein</label>

      <div id="drummer-subfields" style="display:none;">
        <p><em>Wenn ja</em></p>
        <label class="field-label" for="years-playing-input">Ich spiele seit ______ Jahren <span class="required-note">(Pflichtfeld, wenn "Ja")</span></label>
        <input type="number" id="years-playing-input" min="0" max="100">

        <label class="field-label" for="years-lessons-input">Ich habe ______ Jahre Unterricht genommen <span class="required-note">(Pflichtfeld, wenn "Ja")</span></label>
        <input type="number" id="years-lessons-input" min="0" max="100">
      </div>
    `,
    validate(section) {
      const age = section.querySelector("#age-input").value.trim();
      const gender = section.querySelector("#gender-input").value.trim();
      const yesChecked = section.querySelector("#drummer-yes").checked;
      const noChecked = section.querySelector("#drummer-no").checked;

      if (!age || !gender || (!yesChecked && !noChecked)) return false;

      if (yesChecked) {
        const years = section.querySelector("#years-playing-input").value.trim();
        const lessons = section.querySelector("#years-lessons-input").value.trim();
        if (!years || !lessons) return false;
      }
      return true;
    }
  },

  // ---------- 3. DEVICE-CHECK ----------
  {
    id: "device-check",
    group: "Hinweis",
    title: "Bevor es losgeht",
    html: `
      <p>Bitte stellen Sie sicher, dass Sie an einem PC, Laptop oder einem anderweitigen Gerät mit Tastatur sitzen. Um den Test durchführen zu können, benötigen Sie die Leertaste (rot markiert):</p>
      <img src="images/leertaste.png" alt="Tastatur mit rot markierter Leertaste" class="keyboard-image">
      <p>Außerdem benötigen Sie eine Audioausgabe, um die Hörbeispiele hören und abspielen zu können.</p>
    `
  },

  // ---------- TEST 1 ----------
  {
    id: "test1-intro",
    group: "Test 1",
    title: "Test 1: Tempo Tapper – Einleitung",
    html: `
      <p>Für den ersten Test werden Ihnen nun nacheinander 3 kurze Klavierstücke vorgespielt. Nachdem Sie auf "Abspielen" gedrückt haben, tappen Sie bitte im Rhythmus und Tempo des Stücks mit Ihrer Leertaste mit. Mit "tappen" ist das Drücken und Loslassen der Leertaste gemeint. Dies soll immer wieder wiederholt werden, so wie man es beim Mitklatschen zu einem Stück tun würde.</p>
      <p>Damit Sie eine Vorstellung bekommen, wie das ausgeführt werden soll, hören Sie sich bitte folgendes Hörbeispiel an:</p>
      <div id="audio-container-demo-happybirthday" class="audio-container"></div>
      <p>Wie Sie gehört haben, sollen im 4/4-Takt die Viertelnoten mitgetappt werden, genau wie es das Metronom in diesem Hörbeispiel getan hat.</p>
      <p>Wenn das Stück stoppt, tappen Sie bitte noch weiter, bis Sie diesen Sinuston hören:</p>
      <div id="audio-container-demo-sinuston" class="audio-container"></div>
      <p>Dabei soll ermittelt werden, ob Sie den Takt des Stückes weiterhin halten können.</p>
      <p>Das Hörbeispiel ist 40 Sekunden lang. Die ersten 10 Sekunden werden nicht mitberechnet. Sie können aber gerne von Beginn an mittappen, damit Sie ein Gefühl für den Rhythmus bekommen.</p>
      <p><strong>ACHTUNG</strong>: Wenn das <strong>Musikstück begonnen</strong> wurde, ist kein erneutes Abspielen und auch keine Pause möglich. <strong>Ihr Tapping wird ab diesem Moment gewertet! Das Tapping kann nur 1x zu dem Klavierstück gemacht werden.</strong></p>
    `
  },
  { id: "test1-item-1", group: "Test 1", title: "Test 1 – Happy Birthday",     html: test1ItemBody("test1-item-1") },
  { id: "test1-item-2", group: "Test 1", title: "Test 1 – Jelly Roll Blues",   html: test1ItemBody("test1-item-2") },
  { id: "test1-item-3", group: "Test 1", title: "Test 1 – Hungarian Dance",   html: test1ItemBody("test1-item-3") },

  // ---------- TEST 2 ----------
  {
    id: "test2-intro",
    group: "Test 2",
    title: "Test 2: Metronom im Takt – Einleitung",
    html: `
      <p>Sie werden nun 5 Musikstücke hören, welche ein Tapping unterlegt haben. Die Musikstücke sind alle 20 Sekunden lang. Hören Sie genau zu und ermitteln Sie, ob das Tapping im Takt ist und zu dem Rhythmus des Klaviers passt oder nicht.</p>
      <p><strong>Stimmt</strong> das Tapping mit dem Rhythmus des Klaviers <strong>überein</strong>, so wählen Sie die Antwortmöglichkeit <strong>JA</strong>.</p>
      <p><strong>Stimmt</strong> das Tapping mit dem Rhythmus des Klaviers <strong>NICHT überein</strong>, so wählen Sie die Antwortmöglichkeit <strong>NEIN</strong>.</p>
      <p><strong>ACHTUNG</strong>: Wenn das <strong>Musikstück begonnen</strong> wurde, ist kein erneutes Abspielen und auch keine Pause möglich. <strong>Ihre Antwort soll nach 1x anhören erfolgen!</strong></p>
    `
  },
  { id: "test2-item-1", group: "Test 2", title: "Test 2 – Beispiel 1", html: test2ItemBody("test2-item-1"),
    validate(section) {
      const answered = !!section.querySelector('input[name="test2-item-1-answer"]:checked');
      const listened = !!(window.testResults && window.testResults["test2-item-1"] && window.testResults["test2-item-1"].bisEndeAngehoert);
      return answered && listened;
    } },
  { id: "test2-item-2", group: "Test 2", title: "Test 2 – Beispiel 2", html: test2ItemBody("test2-item-2"),
    validate(section) {
      const answered = !!section.querySelector('input[name="test2-item-2-answer"]:checked');
      const listened = !!(window.testResults && window.testResults["test2-item-2"] && window.testResults["test2-item-2"].bisEndeAngehoert);
      return answered && listened;
    } },
  { id: "test2-item-3", group: "Test 2", title: "Test 2 – Beispiel 3", html: test2ItemBody("test2-item-3"),
    validate(section) {
      const answered = !!section.querySelector('input[name="test2-item-3-answer"]:checked');
      const listened = !!(window.testResults && window.testResults["test2-item-3"] && window.testResults["test2-item-3"].bisEndeAngehoert);
      return answered && listened;
    } },
  { id: "test2-item-4", group: "Test 2", title: "Test 2 – Beispiel 4", html: test2ItemBody("test2-item-4"),
    validate(section) {
      const answered = !!section.querySelector('input[name="test2-item-4-answer"]:checked');
      const listened = !!(window.testResults && window.testResults["test2-item-4"] && window.testResults["test2-item-4"].bisEndeAngehoert);
      return answered && listened;
    } },
  { id: "test2-item-5", group: "Test 2", title: "Test 2 – Beispiel 5", html: test2ItemBody("test2-item-5"),
    validate(section) {
      const answered = !!section.querySelector('input[name="test2-item-5-answer"]:checked');
      const listened = !!(window.testResults && window.testResults["test2-item-5"] && window.testResults["test2-item-5"].bisEndeAngehoert);
      return answered && listened;
    } },

  // ---------- TEST 3 ----------
  {
    id: "test3-intro",
    group: "Test 3",
    title: "Test 3: Rhythmus gleich/verschieden – Einleitung",
    html: `
      <p>Sie werden nun 6 Rhythmusabfolgen und deren Wiederholungen hören. Dabei sollen Sie ermitteln, ob die Wiederholungen identisch mit dem jeweils zuerst gespielten Rhythmus sind oder nicht.</p>
      <p>Vor dem ersten Rhythmus und vor der Wiederholung ist folgender Sinuston zu hören:</p>
      <div id="audio-container-demo-sinuston-test3" class="audio-container"></div>
      <p>Dieser gibt den Beginn des Rhythmus und der Wiederholung an.</p>
      <p><strong>Stimmen</strong> der Rhythmus und die Wiederholung <strong>überein</strong>, so wählen Sie die Antwortmöglichkeit <strong>JA</strong>.</p>
      <p><strong>Stimmen</strong> der Rhythmus und die Wiederholung <strong>NICHT überein</strong>, so wählen Sie die Antwortmöglichkeit <strong>NEIN</strong>.</p>
      <p><strong>ACHTUNG</strong>: Wenn das <strong>Musikstück begonnen</strong> wurde, ist kein erneutes Abspielen und auch keine Pause möglich. <strong>Ihre Antwort soll nach 1x anhören erfolgen!</strong></p>
    `
  },
  { id: "test3-item-1", group: "Test 3", title: "Test 3 – Beispiel 1", html: test3ItemBody("test3-item-1"),
    validate(section) {
      const answered = !!section.querySelector('input[name="test3-item-1-answer"]:checked');
      const listened = !!(window.testResults && window.testResults["test3-item-1"] && window.testResults["test3-item-1"].bisEndeAngehoert);
      return answered && listened;
    } },
  { id: "test3-item-2", group: "Test 3", title: "Test 3 – Beispiel 2", html: test3ItemBody("test3-item-2"),
    validate(section) {
      const answered = !!section.querySelector('input[name="test3-item-2-answer"]:checked');
      const listened = !!(window.testResults && window.testResults["test3-item-2"] && window.testResults["test3-item-2"].bisEndeAngehoert);
      return answered && listened;
    } },
  { id: "test3-item-3", group: "Test 3", title: "Test 3 – Beispiel 3", html: test3ItemBody("test3-item-3"),
    validate(section) {
      const answered = !!section.querySelector('input[name="test3-item-3-answer"]:checked');
      const listened = !!(window.testResults && window.testResults["test3-item-3"] && window.testResults["test3-item-3"].bisEndeAngehoert);
      return answered && listened;
    } },
  { id: "test3-item-4", group: "Test 3", title: "Test 3 – Beispiel 4", html: test3ItemBody("test3-item-4"),
    validate(section) {
      const answered = !!section.querySelector('input[name="test3-item-4-answer"]:checked');
      const listened = !!(window.testResults && window.testResults["test3-item-4"] && window.testResults["test3-item-4"].bisEndeAngehoert);
      return answered && listened;
    } },
  { id: "test3-item-5", group: "Test 3", title: "Test 3 – Beispiel 5", html: test3ItemBody("test3-item-5"),
    validate(section) {
      const answered = !!section.querySelector('input[name="test3-item-5-answer"]:checked');
      const listened = !!(window.testResults && window.testResults["test3-item-5"] && window.testResults["test3-item-5"].bisEndeAngehoert);
      return answered && listened;
    } },
  { id: "test3-item-6", group: "Test 3", title: "Test 3 – Beispiel 6", html: test3ItemBody("test3-item-6"),
    validate(section) {
      const answered = !!section.querySelector('input[name="test3-item-6-answer"]:checked');
      const listened = !!(window.testResults && window.testResults["test3-item-6"] && window.testResults["test3-item-6"].bisEndeAngehoert);
      return answered && listened;
    } },

  // ---------- TEST 4 ----------
  {
    id: "test4-intro",
    group: "Test 4",
    title: "Test 4: Nachtappen – Einleitung",
    html: `
      <p>Im Folgenden werden Ihnen 4 kurze Rhythmen vorgespielt, die Sie nachtappen sollen. Mit "tappen" ist das Drücken und Loslassen der Leertaste gemeint. Dies soll immer wieder wiederholt werden, so wie man es beim Nachklatschen eines Rhythmus tun würde.</p>
      <p>Vor dem Beginn des Rhythmus ist folgender Sinuston zu hören:</p>
      <div id="audio-container-demo-sinuston-test4" class="audio-container"></div>
      <p>Sie dürfen sich den Rhythmus so oft anhören, wie Sie wollen. Jedes erneute Anhören wird zum Testergebnis gezählt. Sie müssen den Rhythmus zumindest ein Mal abgespielt haben, um mit dem Nachtappen beginnen zu können.</p>
      <p>Wenn Sie sich bereit fühlen, den Rhythmus nachzutappen, so klicken Sie mit Ihrer linken Maustaste auf das rote Feld (Ein erneutes Abspielen des Rhythmus ist nun nicht mehr möglich). Anschließend können Sie den Rhythmus nachtappen.</p>
      <p>Wenn Sie den Rhythmus nachgetappt haben, so klicken Sie erneut mit der linken Maustaste auf das nun grüne Feld, um das Nachtappen zu beenden. Wann Sie mit dem Tappen beginnen, spielt dabei keine Rolle. Ob der Rhythmus korrekt nachgetappt wurde, wird anhand Ihres ersten Tappings berechnet.</p>
    `
  },
  { id: "test4-item-1", group: "Test 4", title: "Test 4 – Rhythmus 1", html: test4ItemBody("test4-item-1") },
  { id: "test4-item-2", group: "Test 4", title: "Test 4 – Rhythmus 2", html: test4ItemBody("test4-item-2") },
  { id: "test4-item-3", group: "Test 4", title: "Test 4 – Rhythmus 3", html: test4ItemBody("test4-item-3") },
  { id: "test4-item-4", group: "Test 4", title: "Test 4 – Rhythmus 4", html: test4ItemBody("test4-item-4") },

  // ---------- OUTRO ----------
  {
    id: "outro",
    group: "Vielen Dank!",
    title: "Vielen Dank!",
    html: `
      <p>Vielen Dank für Ihre Teilnahme an der Evaluation der Validität dieses Tests.</p>
      <p>Um weiters auch die Reliabilität zu erfassen, bitte ich Sie, den Test im November noch einmal auszufüllen. Sollten Sie dafür Ihre E-Mail-Adresse angegeben haben, so werden Sie diesbezüglich eine E-Mail erhalten.</p>
      <p>Bei eventuellen Rückfragen oder Anmerkungen können Sie sich gerne persönlich bei mir melden:</p>
      <p class="contact-block">
        Kontakt:<br>
        <a href="mailto:helene.lindenbauer@univie.ac.at">helene.lindenbauer@univie.ac.at</a><br>
        Helene Lindenbauer<br>
        Universität Wien<br>
        Institut für Musikwissenschaft
      </p>
      <p>Sie können das Browserfenster nun schließen.</p>
    `
  },
];

// Radio-Namen in test2ItemBody()/test3ItemBody() nachträglich pro Item eindeutig machen
// (der Platzhalter "__RADIO_NAME__" oben wird hier durch die echte, eindeutige ID ersetzt)
steps.forEach(step => {
  if (step.id.startsWith("test2-item-") || step.id.startsWith("test3-item-")) {
    step.html = step.html.replaceAll("__RADIO_NAME__", `${step.id}-answer`);
  }
});

// Alle einzelnen Höraufgaben bekommen statt Stücknamen/"Beispiel N" eine
// Nummerierung "Höraufgabe 1, 2, 3, ...", die bei jedem Test neu bei 1 beginnt.
const taskGroups = [
  ["test1-item-1", "test1-item-2", "test1-item-3"],
  ["test2-item-1", "test2-item-2", "test2-item-3", "test2-item-4", "test2-item-5"],
  ["test3-item-1", "test3-item-2", "test3-item-3", "test3-item-4", "test3-item-5", "test3-item-6"],
  ["test4-item-1", "test4-item-2", "test4-item-3", "test4-item-4"],
];

taskGroups.forEach(groupIds => {
  groupIds.forEach((id, index) => {
    const step = steps.find(s => s.id === id);
    if (step) {
      step.title = `Höraufgabe ${index + 1}`;
      step.taskIndex = index;          // 0-basiert, Position innerhalb DIESES Tests
      step.taskTotal = groupIds.length; // Gesamtanzahl Höraufgaben in diesem Test
    }
  });
});

// Farblich markierter Fortschrittsindikator: zeigt die Höraufgaben-Nummern
// NUR innerhalb des aktuellen Tests, aktuelle Nummer hervorgehoben,
// bereits erledigte in einer zweiten Farbe.
function progressIndicatorHtml(currentIndex, total) {
  let html = '<div class="task-progress">';
  for (let i = 0; i < total; i++) {
    let cls = "task-number";
    if (i === currentIndex) cls += " current";
    else if (i < currentIndex) cls += " done";
    html += `<span class="${cls}">${i + 1}</span>`;
  }
  html += "</div>";
  return html;
}

// ============================================================
// SCREENS ERZEUGEN
// ============================================================

const app = document.getElementById("app");
const nextBtn = document.getElementById("nextBtn");

steps.forEach((step, index) => {
  const section = document.createElement("section");
  section.className = "screen";
  if (step.id === "intro" || step.id === "outro") {
    section.classList.add("bookend");
  }
  section.dataset.step = index;

  section.innerHTML = `
    <p class="group-label">${step.group}</p>
    ${step.taskIndex !== undefined ? progressIndicatorHtml(step.taskIndex, step.taskTotal) : ""}
    <h1>${step.title}</h1>
    ${step.html}
  `;

  app.insertBefore(section, nextBtn);
});

const screens = Array.from(document.querySelectorAll(".screen"));

// Bedingte Anzeige der Schlagzeuger*in-Subfelder: nur einblenden, wenn "Ja" gewählt wurde
const personalSection = screens.find(s => s.dataset.step == steps.findIndex(s2 => s2.id === "personal"));
if (personalSection) {
  personalSection.addEventListener("change", (e) => {
    if (e.target.name === "drummer") {
      const subfields = personalSection.querySelector("#drummer-subfields");
      const showSubfields = personalSection.querySelector("#drummer-yes").checked;
      subfields.style.display = showSubfields ? "block" : "none";
      if (!showSubfields) {
        // Werte zurücksetzen, wenn wieder auf "Nein" gewechselt wird
        personalSection.querySelector("#years-playing-input").value = "";
        personalSection.querySelector("#years-lessons-input").value = "";
      }
    }
  });
}

// ============================================================
// LEERTASTE AUF TAPPING-SEITEN VON BUTTON-VERHALTEN ENTKOPPELN
// ============================================================
//
// Problem: Die Leertaste "aktiviert" im Browser standardmäßig das
// gerade fokussierte Element (z.B. den "Weiter"-Button oder einen
// Radio-Button) - das würde beim Mittappen ständig ungewollt zur
// nächsten Seite springen oder Antworten verändern.
//
// Lösung: NUR auf den Tapping-Seiten (Test 1 & Test 4) wird das
// Standardverhalten der Leertaste unterdrückt, und der Fokus wird
// beim Betreten dieser Seiten von jedem Element entfernt. Auf allen
// anderen Seiten (Formulare, Checkboxen, Radio-Buttons) bleibt die
// Leertaste unangetastet - wichtig für Tastatur-Bedienbarkeit.

const tappingStepIds = new Set([
  "test1-item-1", "test1-item-2", "test1-item-3",
  "test4-item-1", "test4-item-2", "test4-item-3", "test4-item-4",
]);

// Merkt die Timeout-ID der Test-1-Auswertung, damit sie bei vorzeitigem
// Seitenwechsel (z.B. Browser-Reload, künftiger Abbruch) storniert werden kann
let test1PendingResultTimeout = null;

// Hält während eines laufenden Test-1-Durchgangs die Tap-Zeitstempel +
// Phasengrenzen. Wird gesetzt, sobald das Stück zu spielen beginnt
// (siehe setupTest1Audio weiter unten).
let currentTapSession = null;

// Test 4: hält die Tap-Zeitstempel des laufenden Nachtapp-Versuchs.
// Wird gesetzt, sobald das rote Feld angeklickt wird.
let test4TapSession = null;

// Pflicht-Gate für Test 1: "Weiter" bleibt gesperrt, bis das jeweilige
// Stück inkl. der 30s Continuation-Phase komplett durchgelaufen ist.
// step.completed wird in setupTest1Audio() nach Ablauf von Phase 3 gesetzt.
["test1-item-1", "test1-item-2", "test1-item-3"].forEach(id => {
  const step = steps.find(s => s.id === id);
  step.completed = false;
  step.validate = () => step.completed;
});

document.addEventListener("keydown", (e) => {
  if (e.code !== "Space") return;

  const step = steps[currentStep];
  if (!step || !tappingStepIds.has(step.id)) return;

  e.preventDefault(); // verhindert Button-Klick / Checkbox-Toggle durch die Leertaste

  // Browser feuern bei gehaltener Taste automatisch wiederholte keydown-Events
  // (Tastatur-Wiederholung). e.repeat ist bei diesen Wiederholungen "true" -
  // wir wollen aber nur das echte, erste Drücken als einen Tap werten.
  if (e.repeat) return;

  if (
    step.id.startsWith("test1-item-") &&
    currentTapSession &&
    currentTapSession.stimulusId === step.id
  ) {
    const audioCtx = getAudioContext();
    const elapsed = audioCtx.currentTime - currentTapSession.startTime;

    // Nur Taps innerhalb 0..Phase3Ende zählen (danach ist der Durchgang vorbei)
    if (elapsed >= 0 && elapsed <= currentTapSession.phase3End) {
      let phase = 1;
      if (elapsed >= currentTapSession.phase2End) phase = 3;
      else if (elapsed >= currentTapSession.phase1End) phase = 2;
      currentTapSession.taps.push({ time: elapsed, phase });
    }
  }

  if (
    step.id.startsWith("test4-item-") &&
    test4TapSession &&
    test4TapSession.stimulusId === step.id
  ) {
    const audioCtx = getAudioContext();
    const elapsed = audioCtx.currentTime - test4TapSession.startTime;
    test4TapSession.taps.push(elapsed);
    updateTest4Results(step.id);
  }
});

// ============================================================
// ZUSTANDSMASCHINE
// ============================================================

let currentStep = 0;

function updateNextButtonState() {
  const step = steps[currentStep];
  const section = screens[currentStep];
  const isValid = step.validate ? step.validate(section) : true;
  nextBtn.disabled = !isValid;
}

function showStep(stepIndex) {
  screens.forEach(screen => {
    const screenStep = Number(screen.dataset.step);
    screen.classList.toggle("active", screenStep === stepIndex);
  });

  // Auf Tapping-Seiten sicherheitshalber jeden Fokus entfernen, damit die
  // Leertaste garantiert kein fokussiertes Element (z.B. den Weiter-Button) aktiviert
  if (tappingStepIds.has(steps[stepIndex].id) && document.activeElement) {
    document.activeElement.blur();
  }

  nextBtn.style.display = (stepIndex === screens.length - 1) ? "none" : "block";
  updateNextButtonState();
}

// Jede Eingabe/Änderung auf der Seite löst eine Neuprüfung aus (Event Delegation)
app.addEventListener("input", updateNextButtonState);
app.addEventListener("change", updateNextButtonState);

nextBtn.addEventListener("click", () => {
  if (nextBtn.disabled) return;
  if (currentStep < screens.length - 1) {
    stopAllAudio(); // kein Hörbeispiel darf im Hintergrund weiterlaufen
    if (test1PendingResultTimeout) {
      clearTimeout(test1PendingResultTimeout);
      test1PendingResultTimeout = null;
    }
    currentStep++;
    showStep(currentStep);
    history.pushState({ step: currentStep }, "");

    // Ganz am Ende angekommen (Outro) -> jetzt und nur jetzt Daten abschicken
    if (steps[currentStep].id === "outro") {
      submitAllResults();
    }
  }
});

// ============================================================
// BROWSER-"ZURÜCK"-BUTTON BLOCKIEREN
// ============================================================

history.pushState({ step: currentStep }, "");

window.addEventListener("popstate", () => {
  history.pushState({ step: currentStep }, "");
});

// ============================================================
// START
// ============================================================

showStep(currentStep);

// ============================================================
// TEST 1: ECHTES AUDIO EINBINDEN
// ============================================================

const test1SlotIds = ["test1-item-1", "test1-item-2", "test1-item-3"];
const test1Content = [
  { contentId: "happy-birthday",   file: "audio/happy-birthday.mp3",   bpm: 110 },
  { contentId: "jelly-roll-blues", file: "audio/jelly-roll-blues.mp3", bpm: 130 },
  { contentId: "hungarian-dance",  file: "audio/hungarian-dance.mp3",  bpm: 120 },
];
const test1Stimuli = assignShuffledContentToSlots(test1SlotIds, test1Content);

async function setupTest1Audio() {
  // --- Einleitungsseite: Demo-Stück + Sinuston-Vorschau (beliebig oft anhörbar) ---
  const demoBuffer = await loadAudioBuffer("audio/happy-birthday-demo.mp3");
  createAudioPlayer({
    container: document.getElementById("audio-container-demo-happybirthday"),
    buffer: demoBuffer,
    repeatable: true, // Demo darf beliebig oft angehört werden
  });

  const sinustonBuffer = await loadAudioBuffer("audio/sinuston.mp3");
  createAudioPlayer({
    container: document.getElementById("audio-container-demo-sinuston"),
    buffer: sinustonBuffer,
    repeatable: true,
  });

  // --- Die 3 echten Höraufgaben ---
  for (const stim of test1Stimuli) {
    const buffer = await loadAudioBuffer(stim.file);
    const container = document.getElementById(`audio-container-${stim.id}`);
    const debugEl = document.getElementById(`debug-${stim.id}`);

    createAudioPlayer({
      container,
      buffer,
      repeatable: false, // nur 1x abspielbar, wie vorgeschrieben
      onPlay: (lastStartTime) => {
        window.testResults = window.testResults || {};
        window.testResults[stim.id] = window.testResults[stim.id] || {};
        window.testResults[stim.id].angehoert = true;

        const actualDuration = buffer.duration; // tatsächliche Länge statt fixer 40s
        const phase1End = 10;
        const phase2End = actualDuration;
        const phase3End = actualDuration + 30;

        currentTapSession = {
          stimulusId: stim.id,
          startTime: lastStartTime,
          phase1End,
          phase2End,
          phase3End,
          taps: [],
        };

        // Sinuston sample-genau einplanen (nicht per setTimeout!), damit er exakt
        // dann erklingt, wenn wir aufhören, Taps als Phase 3 zu werten
        const audioCtx = getAudioContext();
        const sinSource = audioCtx.createBufferSource();
        sinSource.buffer = sinustonBuffer;
        sinSource.connect(audioCtx.destination);
        sinSource.start(lastStartTime + phase3End);
        registerAudioSource(sinSource);

        // Nach Ende von Phase 3 (+1s Puffer) Ergebnis berechnen - aktuell nur
        // als Debug-Ausgabe sichtbar, später Grundlage für die Google-Sheets-Anbindung
        test1PendingResultTimeout = setTimeout(() => {
          const beatTimes = generateBeatTimes(stim.bpm, actualDuration);
          const targetInterval = 60 / stim.bpm;

          const phase2Taps = currentTapSession.taps.filter(t => t.phase === 2).map(t => t.time);
          const phase3Taps = currentTapSession.taps.filter(t => t.phase === 3).map(t => t.time);

          const phase2Result = scorePhase2(phase2Taps, beatTimes, phase1End, phase2End);
          const phase3Result = scorePhase3(phase3Taps, targetInterval);

          // Vollständige ITI-Liste (chronologisch, über ALLE Taps hinweg) -
          // zusätzlich zu den aggregierten Kennzahlen, damit man später in
          // Google Sheets jeden einzelnen Tap/ITI von Hand nachrechnen kann
          const allTapTimes = currentTapSession.taps.map(t => t.time).sort((a, b) => a - b);
          const allTapITIs = [];
          for (let i = 1; i < allTapTimes.length; i++) {
            allTapITIs.push(Number((allTapTimes[i] - allTapTimes[i - 1]).toFixed(4)));
          }

          window.testResults = window.testResults || {};
          window.testResults[stim.id] = {
            angehoert: true,
            bisEndeAngehoert: true, // Punkt wird erst erreicht, wenn Phase 3 komplett durchgelaufen ist
            rawTaps: currentTapSession.taps,   // jeder einzelne Tap mit Zeitstempel + Phase
            allTapITIs,                        // jedes einzelne ITI, chronologisch
            beatTimes,
            phase2: phase2Result,
            phase3: phase3Result,
          };

          // Pflicht-Gate freischalten: Stück wurde komplett durchlaufen
          const stepObj = steps.find(s => s.id === stim.id);
          if (stepObj) {
            stepObj.completed = true;
            // Falls die Testperson noch auf dieser Seite ist, Button sofort freischalten
            if (steps[currentStep] === stepObj) {
              updateNextButtonState();
            }
          }

          if (debugEl) {
            debugEl.textContent =
              `Taps gesamt: ${currentTapSession.taps.length}\n` +
              `Phase 2 (Sync-Tapping): ${JSON.stringify(phase2Result)}\n` +
              `Phase 3 (Continuation): ${JSON.stringify(phase3Result)}`;
          }
        }, (phase3End + 1) * 1000);
      },
    });
  }
}

setupTest1Audio();

// ============================================================
// TEST 2 & 3: ECHTES AUDIO EINBINDEN
// ============================================================
// Einfacher als Test 1: kein Tapping, keine Phasenlogik - nur
// Play-Button (1x abspielbar) + Erfassung von "Angehört" / "Bis Ende
// angehört" (für spätere Ausschluss-Entscheidungen, siehe Datenschema).

const test2SlotIds = ["test2-item-1", "test2-item-2", "test2-item-3", "test2-item-4", "test2-item-5"];
const test2Content = [
  { contentId: "test2-item-1", file: "audio/test2-item-1.mp3" },
  { contentId: "test2-item-2", file: "audio/test2-item-2.mp3" },
  { contentId: "test2-item-3", file: "audio/test2-item-3.mp3" },
  { contentId: "test2-item-4", file: "audio/test2-item-4.mp3" },
  { contentId: "test2-item-5", file: "audio/test2-item-5.mp3" },
];

const test3SlotIds = ["test3-item-1", "test3-item-2", "test3-item-3", "test3-item-4", "test3-item-5", "test3-item-6"];
const test3Content = [
  { contentId: "test3-item-1", file: "audio/test3-item-1.mp3" },
  { contentId: "test3-item-2", file: "audio/test3-item-2.mp3" },
  { contentId: "test3-item-3", file: "audio/test3-item-3.mp3" },
  { contentId: "test3-item-4", file: "audio/test3-item-4.mp3" },
  { contentId: "test3-item-5", file: "audio/test3-item-5.mp3" },
  { contentId: "test3-item-6", file: "audio/test3-item-6.mp3" },
];

// WICHTIG: Test 2 und Test 3 werden UNABHÄNGIG voneinander randomisiert und
// erst danach zusammengeführt - so kann nie ein Test-3-Stück in einem
// Test-2-Slot landen oder umgekehrt.
const simpleAudioStimuli = [
  ...assignShuffledContentToSlots(test2SlotIds, test2Content),
  ...assignShuffledContentToSlots(test3SlotIds, test3Content),
];

function updateSimpleAudioDebug(debugEl, stimulusId) {
  if (!debugEl) return;
  const r = (window.testResults && window.testResults[stimulusId]) || {};
  debugEl.textContent =
    `Angehört: ${r.angehoert ? "ja" : "nein"} | ` +
    `Bis Ende angehört: ${r.bisEndeAngehoert ? "ja" : "nein"}`;
}

async function setupSimpleAudioItems() {
  window.testResults = window.testResults || {};

  for (const stim of simpleAudioStimuli) {
    const buffer = await loadAudioBuffer(stim.file);
    const container = document.getElementById(`audio-container-${stim.id}`);
    const debugEl = document.getElementById(`debug-${stim.id}`);
    if (!container) continue; // Sicherheitsnetz, falls sich mal eine ID ändert

    window.testResults[stim.id] = window.testResults[stim.id] || {};

    createAudioPlayer({
      container,
      buffer,
      repeatable: false, // nur 1x abspielbar, wie vorgeschrieben
      onPlay: () => {
        window.testResults[stim.id].angehoert = true;
        updateSimpleAudioDebug(debugEl, stim.id);
      },
      onEnded: () => {
        window.testResults[stim.id].bisEndeAngehoert = true;
        updateSimpleAudioDebug(debugEl, stim.id);
        // Falls die Testperson noch auf dieser Seite ist, Weiter-Button neu bewerten
        // (z.B. wenn JA/NEIN schon vor Ende des Stücks angeklickt wurde)
        if (steps[currentStep] && steps[currentStep].id === stim.id) {
          updateNextButtonState();
        }
      },
    });
  }
}

setupSimpleAudioItems();

// Sinuston-Vorschau auf der Test-3-Einleitungsseite (beliebig oft anhörbar,
// nur zur Demonstration, kein gewerteter Trial)
(async () => {
  const sinustonBuffer = await loadAudioBuffer("audio/sinuston.mp3");
  const container3 = document.getElementById("audio-container-demo-sinuston-test3");
  if (container3) {
    createAudioPlayer({ container: container3, buffer: sinustonBuffer, repeatable: true });
  }
  const container4 = document.getElementById("audio-container-demo-sinuston-test4");
  if (container4) {
    createAudioPlayer({ container: container4, buffer: sinustonBuffer, repeatable: true });
  }
})();

// ============================================================
// TEST 4: NACHTAPPEN
// ============================================================
//
// Referenz-Rhythmen als Inter-Onset-Intervalle (IOIs), extrahiert aus den
// MuseScore-MIDI-Exporten (siehe Datenschema/Analyse). Werte in Sekunden,
// auf 3 Nachkommastellen gerundet.

const test4SlotIds = ["test4-item-1", "test4-item-2", "test4-item-3", "test4-item-4"];
const test4Content = [
  { contentId: "test4-item-1", file: "audio/test4-item-1.mp3", iois: [0.6, 0.4, 0.2, 0.6, 0.4, 0.2, 0.6, 0.4, 0.2, 0.6, 0.4] },
  { contentId: "test4-item-2", file: "audio/test4-item-2.mp3", iois: [0.45, 0.45, 0.3, 0.45, 0.45, 0.3, 0.45, 0.45, 0.3, 0.9] },
  { contentId: "test4-item-3", file: "audio/test4-item-3.mp3", iois: [0.15, 0.45, 0.15, 0.45, 0.15, 0.45, 0.15, 0.45, 0.15, 0.45, 0.15, 0.2, 0.2, 0.2] },
  { contentId: "test4-item-4", file: "audio/test4-item-4.mp3", iois: [0.3, 0.2, 0.2, 0.2, 0.6, 0.4, 0.2, 0.6, 0.2, 0.2, 0.2, 0.9] },
];
const test4Stimuli = assignShuffledContentToSlots(test4SlotIds, test4Content);

function round3(x) {
  return Math.round(x * 1000) / 1000;
}

// Berechnet dieselben Kennzahlen wie in Test 1 Phase 3 (meanITI, sdITI, cv,
// slope, tempoAccuracy) - hier verglichen gegen das MITTLERE Ziel-IOI des
// Referenzrhythmus, weil es (anders als bei Test 1) kein konstantes Tempo gibt.
function updateTest4Results(stimulusId) {
  const stim = test4Stimuli.find(s => s.id === stimulusId);
  const session = test4TapSession;
  if (!stim || !session) return;

  const taps = session.taps.map(round3);
  const tapITIs = [];
  for (let i = 1; i < taps.length; i++) {
    tapITIs.push(round3(taps[i] - taps[i - 1]));
  }

  const meanTargetIOI = stim.iois.reduce((a, b) => a + b, 0) / stim.iois.length;

  // scorePhase3() kommt aus test1-scoring.js und ist generisch (Taps + Ziel-Intervall)
  const phase3Style = scorePhase3(taps, meanTargetIOI);
  const stats = phase3Style
    ? {
        meanITI: round3(phase3Style.meanITI),
        sdITI: round3(phase3Style.sdITI),
        cv: round3(phase3Style.cv),
        slope: round3(phase3Style.slope),
        tempoAccuracy: round3(phase3Style.tempoAccuracy),
        n: phase3Style.n,
      }
    : null;

  window.testResults = window.testResults || {};
  window.testResults[stimulusId] = {
    ...(window.testResults[stimulusId] || {}),
    zielIOIs: stim.iois,
    rawTaps: taps,
    tapITIs,
    ...stats,
  };

  const debugEl = document.getElementById(`debug-${stimulusId}`);
  if (debugEl) {
    debugEl.textContent =
      `Anzahl Anhörungen: ${window.testResults[stimulusId].anzahlAnhoerungen ?? 0}\n` +
      `Taps: ${taps.length} | Ziel-Onsets: ${stim.iois.length + 1}\n` +
      `Tap-Zeitstempel: ${JSON.stringify(taps)}\n` +
      `Tap-ITIs: ${JSON.stringify(tapITIs)}\n` +
      `Ziel-IOIs: ${JSON.stringify(stim.iois)}\n` +
      (stats ? `Kennzahlen: ${JSON.stringify(stats)}` : "");
  }
}

async function setupTest4() {
  window.testResults = window.testResults || {};

  for (const stim of test4Stimuli) {
    window.testResults[stim.id] = window.testResults[stim.id] || {};
    window.testResults[stim.id].anzahlAnhoerungen = 0;

    const buffer = await loadAudioBuffer(stim.file);
    const audioContainer = document.getElementById(`audio-container-${stim.id}`);
    const tapField = document.getElementById(`tap-start-${stim.id}`);
    if (tapField) tapField.classList.add("locked"); // gesperrt, bis mindestens 1x abgespielt wurde

    let player = null;
    if (audioContainer) {
      player = createAudioPlayer({
        container: audioContainer,
        buffer,
        repeatable: true,
        onPlay: () => {
          window.testResults[stim.id].anzahlAnhoerungen++;
          const debugEl = document.getElementById(`debug-${stim.id}`);
          if (debugEl) updateTest4Results(stim.id); // aktualisiert auch die Anhör-Zahl in der Anzeige
        },
        onEnded: () => {
          // Erst entsperren, wenn das Stück WIRKLICH komplett durchgelaufen ist -
          // nicht schon beim bloßen Start des Abspielens
          if (tapField) tapField.classList.remove("locked");
        },
      });
    }

    // Rotes Klickfeld: vor dem ersten Anhören gesperrt (siehe oben), danach
    // 1. Klick startet die Tap-Erfassung (wird grün) und stoppt automatisch
    // ein noch laufendes Abspielen, 2. Klick beendet sie (wird ausgegraut
    // und ist danach nicht mehr klickbar)
    if (tapField) {
      let tapPhase = "idle"; // idle -> recording -> done

      tapField.addEventListener("click", () => {
        // Vor dem ersten Anhören ist das Feld nicht nutzbar
        if (tapField.classList.contains("locked")) return;

        if (tapPhase === "idle") {
          // Ein noch laufendes Abspielen automatisch stoppen, bevor das
          // Nachtappen beginnt
          stopAllAudio();

          const audioCtx = getAudioContext();
          test4TapSession = {
            stimulusId: stim.id,
            startTime: audioCtx.currentTime,
            taps: [],
          };
          tapField.innerHTML = '<span class="record-dot"></span>Bereit – jetzt mit der Leertaste nachtappen! Zum Beenden erneut klicken.';
          tapField.classList.add("active");
          // Ab jetzt kein erneutes Anhören mehr möglich - verhindert, dass man
          // sich den Rhythmus während des Nachtappens nochmal "aufdreht"
          if (player) player.lockButton();
          updateTest4Results(stim.id);
          tapPhase = "recording";
        } else if (tapPhase === "recording") {
          // Nachtappen beenden: keine weiteren Taps mehr erfassen (Session
          // beenden), Feld dauerhaft sperren
          test4TapSession = null;
          tapField.textContent = "Nachtappen beendet";
          tapField.classList.remove("active");
          tapField.classList.add("done");
          tapPhase = "done";
        }
        // im Zustand "done" passiert bei weiteren Klicks nichts mehr
      });
    }
  }
}

setupTest4();

// ============================================================
// GOOGLE-SHEETS-EXPORT
// ============================================================
//
// WICHTIG: Diese beiden URLs musst du selbst befüllen, nachdem du die
// zwei Google Apps Scripts (im Ordner google-apps-script/) eingerichtet
// und als Web-App bereitgestellt hast (Anleitung steht in den .gs-Dateien).
// Solange hier Platzhalter stehen, wird NICHTS gesendet (siehe unten).

const TESTDATEN_SHEET_URL = "https://script.google.com/macros/s/AKfycbwZXNEhkqTutpwk1Z_iUjsiT5Bajls1ffZsaHMDYwPwaEnRxgcUv8ICuVN58F0OkeyC/exec";
const EMAIL_SHEET_URL = "https://script.google.com/macros/s/AKfycbxLRe6b_0GoMwhgyKAcy-FNp-7tx8gl40TExmI_tqnG9Qcec3nHqXi2eNekHAgfJ0Vmww/exec";

// Liest ein Eingabefeld sicher aus (leerer String, falls Feld nicht existiert)
function readFieldValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

// Wandelt ein (ggf. verschachteltes) Objekt in flache Key-Value-Paare um,
// wie sie für eine Tabellenzeile gebraucht werden:
// - Arrays aus einfachen Zahlen -> kommagetrennter String in EINER Zelle
//   (kann man in Google Sheets später leicht per "Daten > Text in Spalten
//   aufteilen" auf mehrere Spalten verteilen)
// - Arrays aus Objekten (z.B. rawTaps: [{time,phase}, ...]) -> werden in
//   parallele kommagetrennte Listen aufgeteilt (rawTaps_time, rawTaps_phase)
// - Verschachtelte Objekte (z.B. phase2: {SI_ARV, SI_LRV, ...}) -> werden zu
//   eigenen Spalten (phase2_SI_ARV, phase2_SI_LRV, ...)
function flattenForExport(obj, prefix, out) {
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}_${key}` : key;

    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
        const subKeys = Object.keys(value[0]);
        subKeys.forEach(sk => {
          out[`${fullKey}_${sk}`] = value.map(v => v[sk]).join(",");
        });
      } else {
        out[fullKey] = value.join(",");
      }
    } else if (value !== null && typeof value === "object") {
      flattenForExport(value, fullKey, out);
    } else {
      out[fullKey] = value;
    }
  });
}

// Baut aus window.testResults + den Formularfeldern EIN flaches Objekt für
// die Testdaten-Tabelle - bewusst OHNE E-Mail-Adresse (siehe Datenschema).
function collectTestdatenPayload() {
  const payload = {
    zeitstempel: new Date().toISOString(),
    codewort: readFieldValue("codeword-input"),
    alter: readFieldValue("age-input"),
    geschlecht: readFieldValue("gender-input"),
    schlagzeuger: document.getElementById("drummer-yes")?.checked ? 0
                : document.getElementById("drummer-no")?.checked ? 1
                : "",
    jahreSpielen: readFieldValue("years-playing-input"),
    jahreUnterricht: readFieldValue("years-lessons-input"),
  };

  // WICHTIG für die Spaltenreihenfolge in Google Sheets: Alle Felder EINES
  // Items werden hier direkt hintereinander erzeugt (gehoertesItem -> angehoert
  // -> bisEndeAngehoert -> ggf. Antwort -> restliche Detailwerte), damit sie
  // in der Tabelle auch als zusammenhängender Block nebeneinanderstehen,
  // statt verstreut zu werden.
  const test2And3Ids = new Set(simpleAudioStimuli.map(s => s.id));
  const allStimuliConfigs = [...test1Stimuli, ...simpleAudioStimuli, ...test4Stimuli];

  allStimuliConfigs.forEach(stim => {
    const id = stim.id;
    const r = (window.testResults && window.testResults[id]) || {};

    payload[`${id}_gehoertesItem`] = stim.contentId || id;
    payload[`${id}_angehoert`] = r.angehoert !== undefined ? r.angehoert : "";
    payload[`${id}_bisEndeAngehoert`] = r.bisEndeAngehoert !== undefined ? r.bisEndeAngehoert : "";

    // JA/NEIN-Antwort (nur Test 2 & 3) direkt danach, nicht erst ganz am Ende.
    // Als lesbares "JA"/"NEIN" gespeichert statt der internen 0/1-Kodierung.
    if (test2And3Ids.has(id)) {
      const checked = document.querySelector(`input[name="${id}-answer"]:checked`);
      payload[`${id}_antwort`] = checked ? (checked.value === "0" ? "JA" : "NEIN") : "";
    }

    // Restliche, ausführlichere Detailwerte (Taps, ITIs, SI-Werte, ...) -
    // angehoert/bisEndeAngehoert sind oben schon gesetzt, daher hier entfernen,
    // damit sie nicht doppelt vorkommen
    const rest = { ...r };
    delete rest.angehoert;
    delete rest.bisEndeAngehoert;
    flattenForExport(rest, id, payload);
  });

  console.log("Testdaten-Payload, die gesendet wird:", payload); // zur Kontrolle in der Konsole

  return payload;
}

function collectEmailListePayload() {
  return {
    email: readFieldValue("email-input"),
  };
}

// Sendet Daten an ein Apps-Script-Web-App. Bewusst mode:"no-cors" +
// Content-Type text/plain, um den CORS-Preflight zu umgehen, den Google
// Apps Script Web-Apps nicht sauber beantworten - dadurch kann die Antwort
// nicht ausgelesen werden (aber das Schreiben ins Sheet funktioniert trotzdem).
function sendToGoogleSheet(url, payload) {
  if (!url || url.startsWith("HIER_")) {
    console.warn("Google-Sheets-URL noch nicht eingetragen, Versand übersprungen:", payload);
    return;
  }
  fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  }).catch(err => console.error("Fehler beim Senden an Google Sheets:", err));
}

function submitAllResults() {
  sendToGoogleSheet(TESTDATEN_SHEET_URL, collectTestdatenPayload());
  sendToGoogleSheet(EMAIL_SHEET_URL, collectEmailListePayload());
}
