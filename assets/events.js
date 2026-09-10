/*
 * ----------------------------------------------------------------
 * events.js — primer modulo JavaScript del tema Kinelia
 * ----------------------------------------------------------------
 *
 * Bus de eventos DOM (SHELL-03, D-05). Es un wrapper FINO sobre CustomEvent y
 * document: no mantiene registro propio de subscribers, ni cola, ni promesas.
 * Un consumidor que usa Kinelia.events.on(...) y uno que usa
 * document.addEventListener(...) reciben el MISMO evento, porque es el mismo
 * evento. El wrapper solo agrega: nombres tipados contra un contrato (evita
 * typos), handles de desuscripcion, y un punto unico para depurar.
 *
 * Contrato de nombres y de la forma del `detail`: ETAPA-2-SEAMS.md (SHELL-04).
 * Regla de payload: el `detail` lleva identificadores y montos en centavos; nunca
 * email, nombre completo, direccion postal ni telefono.
 *
 * NO se expone un segundo global de analitica ni un shim de seguimiento paralelo
 * (D-02): el bus DOM es la unica API de eventos interna del tema.
 *
 * Nadie emite eventos en la Fase 3 (D-07). El modulo y el contrato se entregan;
 * los emisores llegan en las Fases 5 y 6. Se prueba con Kinelia.events.emit(...)
 * desde la consola.
 *
 * IIFE clasico, no ESM: Skeleton no tiene import map ni bundler y adoptarlo esta
 * fuera de alcance. Cargado con <script defer> desde layout/theme.liquid.
 *
 * Convencion de nombres inspirada en el patron de Shopify Horizon
 * (namespace:verbo-en-pasado); no se copio codigo — ver OVERRIDES.md.
 */
(function () {
  "use strict";

  // Los cinco nombres publicados. Se congelan al commitear este plan: las Fases 5
  // y 6 se suscriben, Etapa 2 los reenvia, ETAPA-2-SEAMS.md los transcribe.
  var NAMES = [
    "variant:changed",
    "product:added",
    "cart:updated",
    "cart:loading",
    "cart:error",
  ];

  function emit(name, detail) {
    if (NAMES.indexOf(name) === -1) {
      console.warn("[Kinelia.events] nombre fuera del contrato:", name);
    }
    document.dispatchEvent(
      new CustomEvent(name, { detail: detail || {}, bubbles: true })
    );
  }

  function on(name, callback) {
    document.addEventListener(name, callback);
    return { name: name, callback: callback };
  }

  function off(handle) {
    if (handle && handle.name) {
      document.removeEventListener(handle.name, handle.callback);
    }
  }

  // ---- accesibilidad: anunciar en la live region del shell (D-08, Pitfall 7) ----
  // Busca la region de forma perezosa y tolera su ausencia. Limpia el texto,
  // fuerza una lectura de layout y recien despues escribe el mensaje: una live
  // region solo habla ante un cambio de contenido, asi que anunciar dos veces
  // seguidas el mismo mensaje es mudo sin esta secuencia — y "agregado al carrito"
  // dos veces seguidas es exactamente el caso que va a pegar la Fase 6.
  var live = null;
  function announce(message) {
    if (!live) live = document.getElementById("a11y-live-region");
    if (!live) return;
    live.textContent = "";
    void live.offsetWidth;
    live.textContent = message;
  }

  window.Kinelia = window.Kinelia || {};
  window.Kinelia.events = { emit: emit, on: on, off: off, NAMES: NAMES };
  window.Kinelia.a11y = { announce: announce };
})();
