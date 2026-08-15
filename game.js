// ==========================================
// LEVEL UP - ESTADÍSTICAS + RANKING TOP 5
// Google Apps Script para la Hoja de Cálculo
// ==========================================

const SHEET_NAME = "Partidas";

// Usa Guatemala para calcular correctamente "hoy".
const GAME_TIME_ZONE = "America/Guatemala";

function getOrCreateSheet_() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet =
    ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet =
      ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {

    sheet.appendRow([
      "Fecha",
      "ID partida",
      "Nombre",
      "Distrito",
      "Puntuación",
      "Récord antes",
      "Récord después",
      "Nuevo récord",
      "Nivel alcanzado",
      "Tiempo (segundos)",
      "Vidas restantes",
      "Obstáculos superados",
      "Golpes recibidos",
      "Coleccionables totales",
      "Estrellas",
      "Gemas",
      "Coronas",
      "Power-ups totales",
      "Corazones",
      "Escudos",
      "Espadas",
      "Pergaminos",
      "Combo máximo",
      "Velocidad máxima"
    ]);

  }

  return sheet;
}


// ==========================================
// GUARDAR UNA PARTIDA
// ==========================================

function doPost(e) {

  try {

    const data =
      JSON.parse(
        e.postData.contents
      );

    const sheet =
      getOrCreateSheet_();

    sheet.appendRow([
      data.playedAt || "",
      data.id || "",
      data.playerName || "",
      data.district || "",
      Number(data.score || 0),
      Number(data.recordBeforeGame || 0),
      Number(data.recordAfterGame || 0),
      data.isNewRecord ? "SÍ" : "NO",
      Number(data.levelReached || 0),
      Number(data.durationSeconds || 0),
      Number(data.livesRemaining || 0),
      Number(data.obstaclesPassed || 0),
      Number(data.hits || 0),
      Number(data.collectiblesTotal || 0),
      Number(data.stars || 0),
      Number(data.gems || 0),
      Number(data.crowns || 0),
      Number(data.powerUpsTotal || 0),
      Number(data.hearts || 0),
      Number(data.shields || 0),
      Number(data.swords || 0),
      Number(data.scrolls || 0),
      Number(data.maxCombo || 1),
      Number(data.maxSpeed || 0)
    ]);

    return jsonOutput_({
      ok: true
    });

  }

  catch (error) {

    return jsonOutput_({
      ok: false,
      error: String(error)
    });

  }

}


// ==========================================
// LEER EL TOP 5 DEL DÍA
// ==========================================

function doGet(e) {

  try {

    const action =
      e &&
      e.parameter &&
      e.parameter.action
        ? e.parameter.action
        : "ranking";

    if (action !== "ranking") {

      return respond_(
        {
          ok: false,
          error: "Acción no válida"
        },
        e
      );

    }

    const ranking =
      getDailyRanking_();

    return respond_(
      {
        ok: true,
        ranking: ranking
      },
      e
    );

  }

  catch (error) {

    return respond_(
      {
        ok: false,
        ranking: [],
        error: String(error)
      },
      e
    );

  }

}


// ==========================================
// CALCULAR RANKING
// Un jugador aparece solamente una vez:
// se conserva su mejor puntuación del día.
// ==========================================

function getDailyRanking_() {

  const sheet =
    getOrCreateSheet_();

  if (sheet.getLastRow() <= 1) {
    return [];
  }

  const values =
    sheet
      .getRange(
        2,
        1,
        sheet.getLastRow() - 1,
        Math.min(
          24,
          sheet.getLastColumn()
        )
      )
      .getValues();

  const today =
    Utilities.formatDate(
      new Date(),
      GAME_TIME_ZONE,
      "yyyy-MM-dd"
    );

  const bestPlayers = {};

  values.forEach(function(row) {

    const rawDate = row[0];

    if (!rawDate) {
      return;
    }

    let playedDate;

    try {

      playedDate =
        Utilities.formatDate(
          new Date(rawDate),
          GAME_TIME_ZONE,
          "yyyy-MM-dd"
        );

    }

    catch (error) {
      return;
    }

    if (playedDate !== today) {
      return;
    }

    const name =
      String(row[2] || "Anónimo").trim();

    const district =
      String(row[3] || "-").trim();

    const score =
      Number(row[4] || 0);

    const level =
      Number(row[8] || 0);

    // El mismo nombre en distinto distrito
    // se considera un jugador distinto.
    const key =
      name.toLowerCase() +
      "|" +
      district.toLowerCase();

    if (
      !bestPlayers[key] ||
      score > bestPlayers[key].score
    ) {

      bestPlayers[key] = {
        name: name,
        district: district,
        score: score,
        level: level
      };

    }

  });

  return Object.keys(bestPlayers)
    .map(function(key) {
      return bestPlayers[key];
    })
    .sort(function(a, b) {

      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return b.level - a.level;

    })
    .slice(0, 5);

}


// ==========================================
// RESPUESTAS
// ==========================================

function respond_(payload, e) {

  const callback =
    e &&
    e.parameter &&
    e.parameter.callback
      ? String(e.parameter.callback)
      : "";

  // JSONP para que GitHub Pages pueda leer
  // el ranking sin problemas de CORS.
  if (
    callback &&
    /^[A-Za-z_$][0-9A-Za-z_$\\.]*$/.test(callback)
  ) {

    return ContentService
      .createTextOutput(
        callback +
        "(" +
        JSON.stringify(payload) +
        ");"
      )
      .setMimeType(
        ContentService.MimeType.JAVASCRIPT
      );

  }

  return jsonOutput_(payload);
}


function jsonOutput_(payload) {

  return ContentService
    .createTextOutput(
      JSON.stringify(payload)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );

}
